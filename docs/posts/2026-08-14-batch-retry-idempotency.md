---
post_id: 1246
title: 파일을 올린 뒤 실패한 배치를 다시 실행해도 될까
description: PythonStudy의 실제 배치에 삭제 실패를 주입해 DB 커밋, 정상 반환, 같은 작업 재실행 시 중복 행을 확인한다.
date: '2026-08-14'
revised: '2026-10-10'
url: https://so-dak.com/airflow-%eb%b0%b1%ed%95%84backfill-%eb%a9%b1%eb%93%b1%ec%84%b1-%ed%9a%8c%ea%b3%a0-%ec%97%90%eb%9f%ac-%eb%82%98%eb%a9%b4-clear-%eb%88%84%eb%a5%b4%ea%b3%a0-%ec%9e%ac%ec%8b%a4%ed%96%89%ed%95%98/
---

로그에는 `errors=1`이 찍혔다. 그런데 배치 함수는 예외 없이 돌아왔다. Airflow에 `retries=1`이 있어도 이 실패를 자동으로 다시 실행해줄 수 있을까?

2026년 10월 10일 PythonStudy `9a324fe`의 실제 처리 메서드에 삭제 실패를 주입해 확인했다. FTP는 대역으로 바꾸고 임시 SQLite 3.45.1에 저장했다. 앞서 다룬 `79be1f8`과 이 배치의 처리·저장 코드는 동일하다. Airflow 서버나 외부 FTP의 장애 기록은 아니다.

## DB에는 남았지만 성공 개수는 0이었다

결합 작업은 텍스트 원본과 이미지 원본을 묶어 PNG를 만든다. `BatchRunner._flush_combined_upload_queue`의 처리 순서는 다음 발췌에 드러난다. 출력 로그와 반복문은 줄였다.

```python
self.server_scanner.upload_file(item.output_path, item.remote_output_path)
with self.rubi_processor.db.transaction() as connection:
    self.rubi_processor.store_df(item.rubi_df, connection=connection)
    self.rupi_processor.upsert_image_match(
        source_file=item.image_remote_path,
        prefix=item.prefix,
        image_ts=item.image_ts,
        matched_text_file=item.text_remote_path,
        matched_text_ts=item.matched_text_ts,
        matched_diff_seconds=item.matched_diff_seconds,
        output_remote_file=item.remote_output_path,
        connection=connection,
    )
self._delete_matched_sources(item.text_remote_path, item.image_remote_path)
stats.processed += 1
```

실제 `_delete_matched_sources`는 텍스트를 먼저 지우고 이미지를 지운다. `processed`가 올라가는 시점은 둘을 다 지운 뒤다. 그래서 마지막 이미지 삭제에서 실패하면 업로드와 DB 커밋은 끝났어도 성공 개수는 0이 된다.

이를 확인하려고 합성 텍스트 `value=10` 한 줄과 이미지 매칭 정보 하나를 넣었다. 업로드 대역은 성공하도록, 이미지 삭제 대역은 `OSError`를 던지도록 설정했다. DB 초기화·DataFrame 저장·이미지 정보 upsert·트랜잭션은 프로젝트 코드를 그대로 썼다.

| 실제 관찰 | 결과 |
| --- | --- |
| 업로드 메서드 호출 | 완료 |
| 텍스트 DB 행 | 1개 커밋 |
| 이미지 매칭 DB 행 | 1개 커밋 |
| 텍스트 원본 삭제 대역 | 호출 완료 |
| 이미지 원본 삭제 대역 | 예외 발생 |
| 마지막 요약 | `processed=0, skipped=0, errors=1` |
| `BatchRunner.run()` | 예외 없이 `None` 반환 |

**오류 한 개라는 로그와 아무 결과도 남기지 못했다는 뜻은 다르다.** DB 롤백은 이미 올라간 FTP 파일을 취소하지 않고, DB 커밋 뒤 발생한 삭제 실패도 앞선 커밋을 되돌리지 않는다.

## 재시도 설정까지 오류가 올라가지 않았다

시간 단위 DAG는 `run_combined`를 PythonOperator로 호출한다. 설정은 재시도 한 번, 대기 5분, 동시 DAG 실행 한 개다.

```python
default_args={
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}
```

하지만 파일별 처리에는 예외를 오류 수로 바꾸는 코드가 있다. 이번 삭제 실패도 여기서 잡혔다.

```python
except Exception as exc:
    stats.errors += 1
    print(f"[ERROR] {item.text_remote_path} / {exc}")
```

`run()`은 마지막에 요약을 출력하고 끝난다. Airflow의 래퍼 `run_batch()` 역시 `runner.run()`만 호출한다. 오류 개수를 확인해 다시 예외를 던지는 처리는 없다.

이 경우 Python 함수가 정상 반환했다는 사실만으로는 업무가 전부 완료됐는지 알 수 없다. [Airflow의 태스크 상태 설명](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html)에서 다루는 실패·재시도는 업무 로그의 숫자를 자동 해석하는 기능이 아니다. 이번에 실행한 것은 Airflow 서버가 아니라 배치 메서드다. 그 범위에서 **삭제 오류는 요약에 남고, 호출부에는 예외로 전달되지 않았다.**

그럼 마지막에 오류가 있으면 모두 실패시키면 될까. 성공한 작업까지 다시 만나므로 다음 질문이 남는다. 같은 입력을 알아보고 이미 끝난 단계는 넘어갈 수 있는가?

## 이미지 정보는 한 줄, 텍스트 정보는 두 줄이 됐다

같은 합성 작업을 `_flush_combined_upload_queue`에 한 번 더 넣어 실행했다. 이는 메서드에 동일 입력을 재전달한 실험이며, 이미 지워진 원본을 FTP에서 다시 찾는 전체 DAG 재실행은 아니다.

```text
첫 실행: rubi_ingest=1, rupi_ingest=1
같은 작업 재전달: rubi_ingest=2, rupi_ingest=1
```

결과가 갈린 이유는 스키마와 저장 코드에 있었다. `init_db.py`의 이미지 테이블 `rupi_ingest.source_file`에는 고유 제약이 있고, `RupiProcessor.upsert_image_match`가 그 키로 갱신한다. 텍스트 테이블 `rubi_ingest`에는 `source_file`·`line_number`의 고유 제약이 없으며 `RubiProcessor.store_df`는 일반 INSERT를 호출한다.

**이미지 쪽 upsert 하나로 결합 작업 전체가 멱등적이 되지는 않았다.** 같은 입력을 다시 넣었는데 텍스트 한 줄만 두 행이 됐다. 재시도를 붙이기 전에 각 저장소가 무엇을 같은 작업으로 보는지 맞춰야 하는 이유다.

여기서 FTP 결합 배치의 DB는 SQLite다. 같은 저장소의 [RAW 로그 적재](https://so-dak.com/pythonstudy-%eb%8c%80%ec%9a%a9%eb%9f%89-raw-%eb%a1%9c%ea%b7%b8-1973%eb%a7%8c-%ea%b1%b4-%ed%8c%8c%ec%9d%b4%ed%94%84%eb%9d%bc%ec%9d%b8-%ec%b5%9c%ec%a0%81%ed%99%94-%eb%93%80%ec%96%bc-%ec%8a%a4/)가 사용하는 PostgreSQL 계열 DB와 다른 경로다. 이 글의 오류와 해결책을 DB 버전 하나로 묶으면 안 된다.

## 다시 만들기 전에 남은 원본부터 본다

개선한다면 두 가지를 나눠 검토하겠다. 첫째는 같은 입력의 재저장을 막을 업무 키, 둘째는 결과가 확정된 뒤 원본 삭제만 다시 시도할 기록이다. 둘 다 아직 이 실험에서 고친 구현은 아니다.

파일 이름과 행 번호를 키로 삼을 때도 같은 이름의 정정 파일을 허용하는지부터 정해야 한다. 입력 버전이 바뀌면 기존 결과를 갱신할지 새 결과로 보관할지에 따라 제약이 달라진다. 날짜나 DAG 실행 ID만으로는 그 구별을 대신하기 어렵다.

| 멈춘 위치 | 다시 실행할 때 먼저 찾을 것 |
| --- | --- |
| 업로드 전 | 입력과 임시 PNG |
| 업로드 후, DB 커밋 전 | 올라간 결과와 대응되는 DB 기록 |
| DB 커밋 후, 원본 삭제 전 | 확정된 결과, 삭제할 원본 목록 |
| 텍스트만 지워진 뒤 | 남은 이미지 원본과 정리 실패 기록 |

README도 DB 커밋 후 FTP 삭제 실패의 재시도 큐가 아직 없다고 적고 있다. 이번에 먼저 채워야 할 것은 재시도 횟수가 아니다. **텍스트가 사라지고 이미지가 남은 작업을 찾아, 결과를 다시 만들지 않고 정리를 끝낼 수 있는 기록**이다.

## 참고 자료

- [Airflow 태스크 상태와 재시도](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html)
- [Airflow Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [SQLite UPSERT](https://www.sqlite.org/lang_upsert.html)

근거: PythonStudy `9a324fe`의 DAG·호출부·`BatchRunner`·DB 계층·스키마와 README, `79be1f8`과의 관련 파일 대조. 2026-10-10 Python 3.12.3·SQLite 3.45.1에서 합성 입력으로 실행했으며 업로드·삭제는 대역이었다. 임시 DB는 확인 후 제거했다.
