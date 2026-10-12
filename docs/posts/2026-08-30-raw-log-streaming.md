---
post_id: 1429
title: RAW 청크를 겹쳐 처리하되 파싱 순서는 남겼다
description: 앞 로그의 상태를 이어받는 RAW 파서는 순서대로 두고, 적재 워커 하나로 대기만 겹친 구조와 실패 전달을 설명한다.
date: '2026-08-30'
revised: '2026-10-12'
url: https://so-dak.com/pythonstudy-%eb%8c%80%ec%9a%a9%eb%9f%89-raw-%eb%a1%9c%ea%b7%b8-1973%eb%a7%8c-%ea%b1%b4-%ed%8c%8c%ec%9d%b4%ed%94%84%eb%9d%bc%ec%9d%b8-%ec%b5%9c%ec%a0%81%ed%99%94-%eb%93%80%ec%96%bc-%ec%8a%a4/
---

RAW 로그를 청크로 나누어 읽어도, 한 청크의 저장이 끝나야 다음 청크로 넘어간다면 조회와 파싱도 함께 멈춘다. 적재를 기다리는 동안 다음 청크를 처리하고 싶은데, 파싱까지 동시에 돌려도 될까?

PythonStudy의 RAW 파서는 한 행만 보고 답을 만들지 않는다. 앞 로그에서 읽은 설비별 lot 정보, 즉 작업 묶음 정보를 기억했다가 뒤 로그의 빈 필드에 채워 넣는다. 청크 크기는 조회를 나누는 단위일 뿐, 서로 독립적으로 계산할 수 있다는 뜻은 아니다.

그래서 아래에서 따라갈 구조는 **파싱 순서는 남기고, 적재만 워커 하나로 옮긴 방식**이다. PythonStudy `79be1f8`의 코드와 DB 대역 테스트로 처리 순서와 실패 전달을 확인한 내용이다. 실제 DB의 대량 처리 속도를 측정한 글은 아니다.

## 청크가 갈려도 이전 로그를 기억해야 한다

같은 설비의 청크 A 마지막 로그에 lot 이름이 있고, 청크 B 첫 로그에는 없다고 하자. 설명을 위한 상황이다. B를 처리할 때는 A에서 갱신한 `lot_states`를 사용해야 한다. 둘을 동시에 파싱하면 B가 갱신 전 상태를 볼 수 있다.

실제 처리기는 시작 시점 이전의 최신 상태를 `fetch_latest_lot_states(start_time)`으로 읽는다. 이후 `_parse_chunk()`는 메인 흐름에서 순서대로 호출한다. 관련 테스트는 청크 시작에 lot 정보가 없을 때 이전 상태를 사용하는지, 다른 설비의 상태를 섞지 않는지도 검사한다.

따라서 먼저 분리한 것은 결과의 순서를 바꾸지 않아도 되는 적재 작업이다. 다만 적재도 여러 개를 동시에 실행하지는 않는다. **이전 청크를 저장하는 동안 다음 청크를 조회하고 파싱한다.** 이 버전에는 별도의 조회 워커가 없다.

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

## 제출에 성공해도 저장에 실패할 수 있다

`submit()`은 저장 완료가 아니다. 워커에서 예외가 났는데 메인이 Future를 읽지 않으면 실패를 놓칠 수 있다. 이 처리기는 다음 제출 전에 `result()`를 호출하고, 반복문이 끝난 뒤 마지막 Future도 확인한다.

`test_run_propagates_background_insert_error`는 적재 대역에서 `RuntimeError("copy failed")`를 발생시킨다. 예외가 메인 `run()` 밖으로 나오는지 검사하며, 10월 10일 실행에서 통과했다. 마지막 청크만 실패해도 성공 로그로 마무리하지 않도록 하는 지점이다.

일별 통계 갱신도 적재 워커 블록 뒤에 있다. 모든 적재 결과를 받은 다음 파티션 통계와 일별 요약을 갱신한다. 다만 이것이 날짜 전체의 원자적 저장을 뜻하지는 않는다. 날짜 재적재는 파티션을 비우고 채우므로 중간 실패 때 이미 저장된 청크가 남을 수 있다.

이 구조로 겹친 것은 **이전 청크의 저장 대기와 다음 청크의 조회·파싱**이다. 파싱 순서를 희생하지 않고도 겹칠 구간은 있었다. 다만 파싱이 대부분의 시간을 쓴다면 숨길 저장 대기도 적다. 실제 이득은 조회·파싱 시간과 적재를 기다린 시간을 나눠 측정해야 알 수 있다.

## 근거와 범위

본문은 PythonStudy `79be1f8`의 `raw_processor.py`, `raw_repository.py`, 관련 테스트를 기준으로 읽었다. 2026년 10월 10일 Python 3.12.3·pandas 3.0.3에서 테스트 24개가 통과했다. 조회 대역이 DataFrame을 나눠 반환하므로 이 결과는 처리 순서·상태 유지·예외 전달에 대한 근거이며, 실제 DB의 속도나 메모리 사용량에 대한 근거는 아니다.

10월 12일 다시 대조한 `9a324fe`에는 다음 청크를 미리 읽는 조회 워커가 추가돼 있다. 적재 뒤에는 파티션 통계만 갱신하고, 본문 버전의 일별 요약 갱신 두 호출은 없다. 이번 개정에서는 테스트를 다시 실행하지 않았다. 프로젝트 문서의 과거 1,973만 건 시간 비교는 실행 조건을 재확인하지 못해 성능 근거에서 제외했다.

- [Python ThreadPoolExecutor와 Future.result](https://docs.python.org/3/library/concurrent.futures.html)
