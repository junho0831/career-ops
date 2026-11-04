---
post_id: 1429
title: RAW 청크를 겹쳐 처리하되 파싱 순서는 남겼다
description: 앞 로그의 상태를 이어받는 RAW 파서는 순서대로 두고, 적재 워커 하나로 대기만 겹친 구조와 실패 전달을 설명한다.
date: '2026-08-30'
revised: '2026-11-05'
url: https://so-dak.com/pythonstudy-%eb%8c%80%ec%9a%a9%eb%9f%89-raw-%eb%a1%9c%ea%b7%b8-1973%eb%a7%8c-%ea%b1%b4-%ed%8c%8c%ec%9d%b4%ed%94%84%eb%9d%bc%ec%9d%b8-%ec%b5%9c%ec%a0%81%ed%99%94-%eb%93%80%ec%96%bc-%ec%8a%a4/
---

청크 B의 첫 로그에는 lot 이름이 없다. 바로 앞 청크 A의 마지막 로그에는 있다. 둘을 동시에 파싱하면 B는 어느 이름을 이어받을까?

PythonStudy의 RAW 파서는 설비별 작업 묶음인 lot 정보를 기억했다가 빈 필드를 채운다. **청크를 나눴다고 계산까지 독립적인 건 아니다.** 그래서 현재 코드의 병렬화는 파싱 순서를 유지한 채 조회와 저장의 대기를 겹친다.

본문은 `9a324fe`의 구현과 DB 대역 테스트를 따라간다. A·B·C는 흐름을 설명하기 위한 청크 이름이며, 실제 DB 처리 속도를 측정한 결과는 아니다.

## B를 미리 읽어도, 먼저 파싱하지는 않는다

시작할 때 `fetch_latest_lot_states(start_time)`으로 이전 lot 상태를 읽는다. 이후 `_parse_chunk()`가 A → B → C 순서로 `lot_states`를 갱신한다. 앞의 예라면 B의 빈 lot 이름을 채울 때 A가 남긴 상태를 사용할 수 있다.

조회와 적재에는 각각 워커 하나를 둔다. 조회 워커는 다음 청크를 미리 읽고, 적재 워커는 파싱이 끝난 청크를 저장한다. 처리 중에는 아래 세 일이 겹칠 수 있다.

| 조회 워커 | 메인 흐름 | 적재 워커 |
| --- | --- | --- |
| C 조회 | B 파싱 | A 저장 |
| 완료 또는 대기 | A 결과 확인 | A 저장 완료 |
| 다음 제출 대기 | B 제출 → C로 이동 | B 저장 |

**B를 미리 읽는 것과 B를 먼저 해석하는 것은 다르다.** 앞선 상태를 바꾸는 파싱만 순서대로 두면, 다음 데이터를 가져오는 일까지 기다릴 필요는 없다.

실제 `_run_window()`에서 로그·날짜 계산·적재 건수 집계를 걷어낸 개념 코드다. `fetch_pool`과 `insert_pool`은 각각 `max_workers=1`이며, 실제 함수는 컨텍스트 매니저로 두 풀을 종료한다.

```python
pending_fetch = fetch_pool.submit(next, raw_chunks, None)
pending_insert = None

while True:
    raw_df = pending_fetch.result()
    if raw_df is None:
        break
    pending_fetch = fetch_pool.submit(next, raw_chunks, None)
    parsed_rows = self._parse_chunk(raw_df)

    if pending_insert is not None:
        pending_insert.result()
        pending_insert = None
    if parsed_rows:
        pending_insert = insert_pool.submit(
            self.repository.insert_parsed_df,
            pd.DataFrame(parsed_rows),
        )

if pending_insert is not None:
    pending_insert.result()
```

B 파싱을 끝내도 A 저장이 끝나지 않았다면 `result()`에서 기다린다. 저장할 작업을 무한히 쌓지 않도록 다음 제출을 막는 지점이다. 반대로 메모리가 청크 하나 분량이라는 뜻도 아니다. 저장 중인 A, 파싱 중인 B, 미리 읽은 C가 함께 남을 수 있다.

## 빨라졌는지보다, 어디가 겹치는지 먼저 확인했다

조회 대역에서 “두 번째 청크 조회 시작” 신호를 보내고, 첫 파싱에서 그 신호를 기다리게 했다. `test_run_prefetches_next_chunk_while_current_chunk_is_parsing`은 첫 파싱이 끝나기 전에 다음 조회가 진행됐는지 검사한다.

별도 테스트는 첫 적재를 `Event`로 붙잡고 다음 조회와 겹치는지 확인한다. 두 테스트가 보여주는 것은 **조회·파싱·적재의 겹침**이다. DB 대신 DataFrame을 반환하므로, 초당 처리량이나 운영 메모리 사용량까지 입증하지는 않는다.

실패도 메인 흐름으로 돌아와야 한다. `test_run_propagates_background_insert_error`는 적재 대역에서 `RuntimeError("copy failed")`를 내고 `run()` 밖으로 전파되는지 검사한다. 마지막 청크의 Future도 읽기 때문에, 제출만 해 놓고 성공으로 끝내지 않는다.

적재 결과를 모두 받은 뒤에는 파티션 통계를 갱신한다. 이 버전의 파서는 일별 요약을 갱신하지 않는다. 날짜 재적재도 전체가 한 트랜잭션은 아니다. 파티션을 비운 뒤 청크별로 저장하므로, 중간에 실패하면 앞서 저장한 일부만 남을 수 있다.

이 구조에서 더 빨라질 여지는 **겹쳐 놓을 수 있는 대기 시간**에 달려 있다. 파싱이 대부분이면 워커를 늘려도 숨길 DB 대기가 적다. 성능을 비교할 때는 전체 시간과 함께 조회·파싱·이전 적재를 기다린 시간을 따로 재야 한다.

검증 범위: 2026년 10월 27일 PythonStudy `9a324fe`의 RAW 처리기·저장소·DB 연결 코드·관련 테스트·README와 스트리밍 문서를 대조했다. Linux·Python 3.12.3·pandas 3.0.3에서 `test_er_dose_processor.py`의 DB 대역 테스트 20개가 통과했다. 실제 DB 속도와 메모리 사용량은 측정하지 않았다.

- [Python 3.12 ThreadPoolExecutor와 Future.result](https://docs.python.org/3.12/library/concurrent.futures.html)
