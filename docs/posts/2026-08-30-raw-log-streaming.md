---
post_id: 1429
title: RAW 청크를 겹쳐 처리하되 파싱 순서는 남겼다
description: PythonStudy의 실제 변경과 24개 테스트를 따라, 적재 워커 하나로 대기를 겹치고 로그 파싱 순서와 실패 전달을 지키는 방법을 설명한다.
date: '2026-08-30'
revised: '2026-10-10'
url: https://so-dak.com/pythonstudy-%eb%8c%80%ec%9a%a9%eb%9f%89-raw-%eb%a1%9c%ea%b7%b8-1973%eb%a7%8c-%ea%b1%b4-%ed%8c%8c%ec%9d%b4%ed%94%84%eb%9d%bc%ec%9d%b8-%ec%b5%9c%ec%a0%81%ed%99%94-%eb%93%80%ec%96%bc-%ec%8a%a4/
---

PythonStudy의 RAW 로그 처리기는 조회한 청크를 파싱하고, 결과를 DB에 넣은 뒤 다음 청크로 넘어갔다. `5181868`의 변경에는 이 순서를 바꾼 코드가 남아 있다. **파싱은 그대로 두고 적재만 워커 하나로 옮겼다.** 왜 파싱까지 나누지 않았을까?

이 파서는 한 행만 보고 답을 만들지 않는다. 앞 로그에서 읽은 설비별 lot 정보, 즉 작업 묶음 정보를 기억했다가 뒤 로그에 채워 넣는다. 청크 크기는 조회를 나누는 단위일 뿐, 서로 독립적으로 계산할 수 있다는 뜻은 아니다.

아래 구현은 PythonStudy `79be1f8` 시점이다. 2026년 10월 10일 이 커밋을 임시 폴더에 추출해 Python 3.12.3·pandas 3.0.3으로 관련 테스트 24개를 다시 실행했다. DB 대역으로 처리 순서와 실패 전달을 확인하는 테스트다.

## 청크가 갈려도 이전 로그를 기억해야 한다

같은 설비의 청크 A 마지막 로그에 lot 이름이 있고, 청크 B 첫 로그에는 없다고 하자. 설명을 위한 상황이다. B를 처리할 때는 A에서 갱신한 `lot_states`를 사용해야 한다. 둘을 동시에 파싱하면 B가 갱신 전 상태를 볼 수 있다.

실제 처리기는 시작 시점 이전의 최신 상태를 `fetch_latest_lot_states(start_time)`으로 읽는다. 이후 `_parse_chunk()`는 메인 흐름에서 순서대로 호출한다. 관련 테스트는 청크 시작에 lot 정보가 없을 때 이전 상태를 사용하는지, 다른 설비의 상태를 섞지 않는지도 검사한다.

따라서 먼저 분리한 것은 결과의 순서를 바꾸지 않아도 되는 적재 작업이다. 다만 적재도 여러 개를 동시에 실행하지는 않는다. **이전 청크를 저장하는 동안 다음 청크를 조회하고 파싱한다.** 별도의 조회 워커가 다음 청크를 미리 예약하는 구조는 이 커밋의 처리기에 없다.

| 메인 흐름 | 적재 워커 하나 |
| --- | --- |
| A 조회·파싱 후 적재 제출 | A 저장 시작 |
| B 조회·파싱, 파서 상태 갱신 | A 저장 진행 |
| A의 결과 확인 후 B 적재 제출 | A가 끝난 뒤 B 저장 |
| C 조회·파싱 | B 저장 진행 |

B의 파싱이 끝났어도 A의 저장이 끝나지 않았다면 기다린다. 다음 코드는 실제 `_run_window()`에서 로그 출력과 날짜 계산을 생략한 발췌다. 전체 함수 대신 작업의 순서만 보여준다.

```python
with ThreadPoolExecutor(max_workers=1) as insert_executor:
    for chunk_index, raw_df in enumerate(
        self.repository.fetch_raw_logs_in_chunks(
            start_time=start_time,
            end_time=end_time,
            chunk_size=chunk_size,
        ),
        start=1,
    ):
        parsed_rows = self._parse_chunk(raw_df)

        if pending_insert is not None:
            inserted_chunk_index, insert_future = pending_insert
            insert_count += insert_future.result()
            pending_insert = None

        if not parsed_rows:
            continue

        parsed_df = pd.DataFrame(parsed_rows)
        pending_insert = (
            chunk_index,
            insert_executor.submit(self.repository.insert_parsed_df, parsed_df),
        )
```

여기서 중요한 것은 **파싱 → 이전 적재 결과 확인 → 새 적재 제출** 순서다. 적재가 느리다고 미완료 Future를 계속 늘리지 않는다. 이전 적재 하나와 현재 처리 중인 청크가 함께 있을 수 있으므로, 메모리를 청크 하나의 크기라고 설명해서도 안 된다.

## 정말 겹치는지는 시간을 재는 대신 멈춰서 확인했다

테스트 이름은 `test_run_fetches_next_chunk_while_previous_chunk_is_inserting`이다. 첫 적재를 `Event`로 멈추고, 다음 조회가 시작될 때 적재 중인지 기록한다. “전체 시간이 빨랐다”보다 어느 구간이 겹쳤는지 직접 확인하는 방식이다.

```python
# 테스트 대역의 다음 청크 조회 부분
if start > 0:
    self.insert_started.wait(timeout=1)
    self.second_fetch_during_insert = self.insert_active.is_set()
    self.release_insert.set()
```

첫 적재 쪽은 시작 신호를 보낸 뒤 `release_insert`를 기다린다. 조회 쪽에서 그 대기를 풀므로, 조회가 적재 완료 뒤에만 진행되는 구현이라면 의도한 겹침을 확인할 수 없다. 마지막에는 기록값이 참인지와 두 청크가 모두 적재됐는지를 검사한다.

`79be1f8`을 추출한 폴더에서 실행한 명령과 결과다.

```bash
python3 -m unittest discover -s tests -p 'test_er_dose_processor.py'
```

```text
Ran 24 tests in 0.694s
OK
```

24개에는 위 겹침 검사, 청크 사이 상태 유지, 날짜별 적재, 건수에 따른 재적재 판단이 포함된다. **0.694초는 테스트 실행 시간이다.** 실제 로그를 DB에서 읽고 저장하는 데 걸린 시간이 아니다.

## 제출에 성공해도 저장에 실패할 수 있다

`submit()`은 저장 완료가 아니다. 워커에서 예외가 났는데 메인이 Future를 읽지 않으면 실패를 놓칠 수 있다. 이 처리기는 다음 제출 전에 `result()`를 호출하고, 반복문이 끝난 뒤 마지막 Future도 확인한다.

`test_run_propagates_background_insert_error`는 적재 대역에서 `RuntimeError("copy failed")`를 발생시킨다. 테스트는 그 예외가 메인 `run()` 밖으로 나오는지 검사하며 이번 실행에서 통과했다. 마지막 청크만 실패해도 성공 로그로 마무리하지 않도록 하는 지점이다.

일별 통계 갱신도 적재 워커 블록 뒤에 있다. 모든 적재 결과를 받은 다음 파티션 통계와 일별 요약을 갱신한다. 다만 이것이 날짜 전체의 원자적 저장을 뜻하지는 않는다. 날짜 재적재는 파티션을 비우고 채우므로 중간 실패 때 이미 저장된 청크가 남을 수 있다. 재시도 판단은 [배치 재실행과 멱등성](https://so-dak.com/airflow-%eb%b0%b1%ed%95%84backfill-%eb%a9%b1%eb%93%b1%ec%84%b1-%ed%9a%8c%ea%b3%a0-%ec%97%90%eb%9f%ac-%eb%82%98%eb%a9%b4-clear-%eb%88%84%eb%a5%b4%ea%b3%a0-%ec%9e%ac%ec%8b%a4%ed%96%89%ed%95%98/)에서 별도로 다룬다.

## 조회도 청크 크기만 보고 판단하지 않았다

`PostgresDB.select_in_chunks()`의 자체 연결 경로는 `stream_results=True`, `max_row_buffer=chunk_size`를 설정하고 같은 연결에서 `fetchmany(chunk_size)`를 반복한다. 외부 연결을 넘기는 분기는 `pd.read_sql_query(..., chunksize=chunk_size)`를 사용한다. 둘은 같은 코드 경로가 아니다.

처리기 테스트의 조회 대역은 DataFrame을 잘라 반환한다. 이 테스트가 통과했다고 실DB 드라이버의 메모리 사용량이나 서버 측 커서 동작까지 검증했다고 볼 수는 없다. 이번에 확인한 것은 처리 순서와 예외 전달이다.

프로젝트 문서에는 약 1,973만 건을 처리한 과거 시간 비교도 있다. 하지만 이번 개정에서는 당시 원시 실행 로그·DB 부하·장비 조건을 함께 재확인하지 못했다. 그래서 그 숫자를 현재 코드의 성능 보장으로 가져오지 않았다.

다음 측정에서 먼저 보고 싶은 값은 워커 수가 아니라 **조회·파싱 시간과 적재를 기다린 시간**이다. 파싱이 대부분이라면 지금처럼 적재를 겹쳐도 숨길 대기가 적다. 병렬로 만들 수 있는 작업과, 병렬로 만들 가치가 있는 작업은 다른 질문이다.

## 다른 체크아웃과 구분할 점

2026년 10월 10일 대조한 로컬 `9a324fe`에는 조회 워커가 추가돼 다음 청크를 미리 읽는다. 또 이 버전의 `_run_window()`는 적재 뒤 파티션 통계만 갱신하고, 위에서 설명한 일별 요약 갱신 두 호출은 포함하지 않는다. `9a324fe`의 처리기 테스트 20개도 별도로 통과했다. 테스트 개수가 줄었다는 숫자만 비교하기보다, 조회를 미리 읽는 검사와 요약 갱신 검사가 어느 버전에 있는지 나누어 봐야 한다.

## 참고 자료

- [Python ThreadPoolExecutor와 Future.result](https://docs.python.org/3/library/concurrent.futures.html)
- [SQLAlchemy 서버 측 커서와 스트리밍](https://docs.sqlalchemy.org/en/20/core/connections.html#using-server-side-cursors-a-k-a-stream-results)
- [pandas read_sql_query](https://pandas.pydata.org/docs/reference/api/pandas.read_sql_query.html)

프로젝트 근거: PythonStudy `79be1f8`의 `raw_processor.py`, `raw_repository.py`, `postgres_db.py`, `test_er_dose_processor.py`, 파이프라인 변경 `5181868`과 DB 스트리밍 문서. 코드 발췌는 설명에 필요한 부분만 남겼다. 설비 이름·주소·원본 로그와 업무 데이터는 포함하지 않았다.
