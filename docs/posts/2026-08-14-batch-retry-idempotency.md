---
post_id: 1246
title: 파일을 올린 뒤 실패한 배치를 다시 실행해도 될까
description: 업로드와 DB 저장 뒤 원본 하나만 삭제된 상황을 통해 재시도, 업무 키, 정리 단계의 차이를 설명한다.
date: '2026-08-14'
revised: '2026-10-08'
url: https://so-dak.com/airflow-%eb%b0%b1%ed%95%84backfill-%eb%a9%b1%eb%93%b1%ec%84%b1-%ed%9a%8c%ea%b3%a0-%ec%97%90%eb%9f%ac-%eb%82%98%eb%a9%b4-clear-%eb%88%84%eb%a5%b4%ea%b3%a0-%ec%9e%ac%ec%8b%a4%ed%96%89%ed%95%98/
---

파일 업로드와 DB 저장을 끝내고 마지막 원본 삭제에서 실패했다고 하자. 재실행 버튼은 하나인데 되돌려야 할 작업은 하나가 아니다.

PythonStudy의 시간 단위 FTP DAG와 배치 호출부를 보면, 같은 “실패”라도 이미 남아 있는 결과가 다르다. Airflow 서버에서 장애를 재현한 기록이 아니라 현재 코드의 중단 지점을 검토한 글이다.

## 원본 둘 중 하나만 지워졌다면

설명용으로 원본 A·B를 결합해 결과 C를 만들었다고 하자. C 업로드와 DB 커밋 뒤 A만 삭제되고, B 삭제에서 실패했다.

다음 실행이 A가 없다는 이유로 처음부터 실패하면 이미 완성된 C를 두고 계속 멈춘다. 반대로 다시 업로드하면 C가 중복될 수 있다. 성실하게 두 번 일했더니 결과도 두 개가 되는 건 반갑지 않다. **결과를 만드는 단계와 원본을 정리하는 단계를 구분해야 한다.**

| 멈춘 위치 | 남아 있을 수 있는 결과 | 다시 시작할 때의 질문 |
| --- | --- | --- |
| 업로드 전 | 원본과 임시 파일 | 입력과 임시 산출물을 다시 쓸 수 있는가 |
| 업로드 후, DB 저장 전 | 외부 결과 파일 | 같은 결과를 다시 올리거나 재사용할 기준은 무엇인가 |
| DB 커밋 후, 원본 삭제 전 | 결과 파일과 DB 기록, 원본 | 적재 대신 정리만 이어갈 수 있는가 |
| 첫 원본만 삭제한 뒤 | 확정 결과와 나머지 원본 | 빠진 원본을 새 처리 실패로 오해하지 않는가 |

실제 호출도 업로드, DB 트랜잭션, 원본 두 개 삭제로 나뉜다. DB 롤백은 FTP에 올라간 파일까지 취소해 주지 않는다. 개선한다면 `결과 저장됨`을 기록하고 그 이후 실패는 정리만 재시도하도록 나누는 쪽을 검토하겠다. 표는 그 설계에서 답해야 할 질문이다.

## retries가 있는데 왜 다시 실행되지 않을까

확인한 DAG에는 다음 설정이 있다.

```python
default_args={
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}
```

그런데 하위 배치는 파일별 예외를 잡고 오류 수를 늘린 뒤 다음 파일로 진행할 수 있다. 최상위 호출이 정상 반환하면, 로그에 오류가 있어도 그 사실만으로 태스크 재시도가 일어나지는 않는다.

예를 들어 파일 열 개 중 하나가 실패했는데 함수가 오류 건수만 출력하고 끝났다면 어떨까. Airflow는 로그의 업무 의미까지 읽어 실패를 판단하지 않는다. 복구 대상 오류가 남았을 때 호출부가 어떤 결과를 반환할지 정해야 한다.

전체 태스크를 실패시키면 Airflow 재시도를 활용하기 쉽지만 성공한 아홉 개도 다시 만난다. 실패 파일만 모으면 반복 작업은 줄고, 대신 그 목록을 저장하고 다시 꺼내는 처리가 필요해진다. 어느 쪽이든 **이미 성공한 입력을 알아보는 기준**부터 필요하다.

## 날짜가 같아도 같은 입력은 아니다

시간 단위 DAG는 같은 날짜를 여러 번 처리할 수 있다. 그날 늦게 도착한 새 파일도 있고, 같은 파일의 재시도도 있다. 날짜만 완료 키로 쓰면 둘을 구분하지 못한다.

실행 ID는 DAG 실행을, 시도 번호는 같은 태스크의 재시도를 구분한다. 업무 키는 어떤 입력을 처리하는지 식별하는 데 쓴다. 파일 교체나 정정 입력을 허용한다면 이름 외에 버전·내용을 어떤 기준으로 구별할지도 정해야 한다.

검토 대상에는 PostgreSQL 9.4 환경이 있어 `ON CONFLICT`를 그대로 사용한 예제를 해결책으로 제시하지 않았다. 고유 제약과 재시도 정책도 실제 DB 버전에 맞춰야 한다.

## 같은 DB 안의 교체라면 묶을 수 있다

외부 업로드와 달리, 하루 집계를 같은 DB에서 지우고 다시 넣는 일은 다음처럼 한 트랜잭션으로 묶는 방안을 검토할 수 있다. 설명용 테이블이며 매개변수 바인딩과 오류 시 롤백은 드라이버에서 처리한다.

```sql
BEGIN;
DELETE FROM daily_summary WHERE stat_date = :target_date;
INSERT INTO daily_summary (stat_date, account_key, amount)
SELECT :target_date, account_key, SUM(amount)
FROM raw_events
WHERE event_time >= :range_start AND event_time < :range_end
GROUP BY account_key;
COMMIT;
```

다만 같은 날짜를 두 작업이 동시에 교체하는 문제는 별도다. [실제 RAW 재적재 경로](https://so-dak.com/pythonstudy-%eb%8c%80%ec%9a%a9%eb%9f%89-raw-%eb%a1%9c%ea%b7%b8-1973%eb%a7%8c-%ea%b1%b4-%ed%8c%8c%ec%9d%b4%ed%94%84%eb%9d%bc%ec%9d%b8-%ec%b5%9c%ec%a0%81%ed%99%94-%eb%93%80%ec%96%bc-%ec%8a%a4/)도 대상 정리 후 청크별 적재가 이어져, 하루 전체가 이 예제처럼 원자적으로 교체된다고 설명할 수 없다.

이 배치를 고친다면 재시도 횟수부터 올리지는 않겠다. **결과 C가 확정됐다는 기록을 찾고 남은 B 삭제만 이어갈 수 있는지**부터 확인하겠다. 성공한 작업을 알아보지 못하면 재시도는 같은 일을 더 성실하게 반복할 뿐이다.

## 참고 자료

- [Airflow: Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [Airflow: DAG Runs와 데이터 구간](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html)
- [PostgreSQL 9.5 INSERT](https://www.postgresql.org/docs/9.5/sql-insert.html)
- [PostgreSQL 9.4 트랜잭션 격리](https://www.postgresql.org/docs/9.4/transaction-iso.html)

검토한 소스: PythonStudy의 시간 단위 DAG, 배치 호출부, 결합 파일 업로드·저장·삭제 경로, RAW 재적재 코드와 관련 테스트. Airflow 서버 실행 결과와 장애 재현 결과는 포함하지 않았다.
