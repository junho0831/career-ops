---
post_id: 1397
title: DELETE가 행을 지워도 파일 크기는 남는 이유
description: 두 세션의 삭제 예시로 행의 가시성, VACUUM의 공간 재사용, 파일 크기 감소를 나누어 설명한다.
date: '2026-09-03'
revised: '2026-10-08'
url: https://so-dak.com/postgresql-mvcc-vacuum-delete-disk-bloat/
---

`DELETE` 뒤 조회에서는 행이 사라졌는데 파일 크기는 그대로일 수 있다. 분명 지웠는데 디스크는 모른 척한다. 삭제가 실패한 걸까?

**행이 안 보이는 것, 그 자리를 다시 쓰는 것, 운영체제에 공간을 돌려주는 것은 다른 단계다.** PostgreSQL 16 공식 문서를 기준으로 설명한다. 아래 SQL은 격리한 실험 환경을 위한 예제이며 실제 측정 결과는 없다.

## B가 지운 행을 A는 아직 볼 수 있다

실험용 `mvcc_example`에 `id=1` 행이 미리 커밋돼 있다고 하자. A가 먼저 `REPEATABLE READ` 스냅샷을 만든 뒤, 별도 연결 B에서 같은 행을 지운다.

```sql
-- 세션 A: 먼저 실행하고 트랜잭션을 열어 둔다.
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM mvcc_example WHERE id = 1;

-- 세션 B: 별도 연결에서 실행한다.
BEGIN;
DELETE FROM mvcc_example WHERE id = 1;
COMMIT;

-- 다시 세션 A: 같은 스냅샷에서 읽은 뒤 정리한다.
SELECT * FROM mvcc_example WHERE id = 1;
COMMIT;
```

B가 커밋한 뒤 새 조회에서는 행이 보이지 않지만, A는 자신의 스냅샷에 맞는 옛 버전을 읽을 수 있다. A가 끝나기 전까지는 그 버전을 곧바로 없앨 수 없다.

격리 수준을 적은 이유도 여기에 있다. 기본 `READ COMMITTED`에서는 문장마다 스냅샷을 잡으므로 같은 실험이라고 볼 수 없다. 끝난 뒤에는 A의 트랜잭션도 반드시 정리한다.

## 빈자리가 생겨도 파일 길이는 같을 수 있다

A도 끝나 옛 버전이 더는 필요 없어진 뒤에는 일반 `VACUUM`이 그 공간을 재사용할 수 있게 한다. 책장에서 책 몇 권을 뺐다고 책장 폭이 줄지는 않는 것과 비슷하다. 파일 중간에 빈자리가 생겨도 파일 끝은 그대로일 수 있다.

| 관찰 | 알려 주는 것 | 곧바로 결론 내릴 수 없는 것 |
| --- | --- | --- |
| SELECT 결과 감소 | 그 스냅샷에서 보이는 행 감소 | 파일 축소 완료 |
| 재사용 가능한 빈 공간 | 같은 관계의 다음 쓰기에 사용 가능 | 운영체제로 공간 반환 |
| 관계 파일 크기 감소 | 물리 파일 크기 변화 | 모든 디스크 증가 원인 해결 |

일반 `VACUUM`도 파일 끝의 완전히 빈 페이지를 반환할 수 있는 경우가 있다. 그러나 파일 안쪽의 빈 공간을 모아 항상 축소하는 작업은 아니다.

`VACUUM FULL`은 살아 있는 행을 새 파일에 다시 써 공간을 줄인다. 대신 테이블 접근을 막는 강한 잠금과 새 파일용 디스크가 필요하다. 내일 비슷한 양을 다시 넣을 테이블이라면, 오늘 파일을 줄이느라 멈췄다가 내일 다시 늘리는 셈이다. **당장 공간을 반환해야 하는지, 다음 쓰기에 재사용하면 되는지**에 따라 선택이 달라진다.

## 먼저 어떤 크기를 봤는지 나눈다

다음 예시에서 `public.example`은 크기를 확인할 실험용 테이블로 바꾼다.

```sql
SELECT pg_size_pretty(pg_relation_size('public.example')) AS table_only,
       pg_size_pretty(pg_indexes_size('public.example')) AS indexes,
       pg_size_pretty(pg_total_relation_size('public.example')) AS total;
```

테이블 본체와 인덱스, 전체 관계 크기를 구분할 수 있다. 서버 전체 디스크 사용량에는 WAL·임시 파일·로그도 포함되므로 이 값과 혼동하지 않는다. 크기 하나만으로 정확한 bloat 비율까지 계산할 수도 없다.

삭제가 계속 쌓이는 테이블이라면 정리 이력과 추정 행 수도 함께 본다.

```sql
SELECT relname,
       n_live_tup,
       n_dead_tup,
       last_vacuum,
       last_autovacuum,
       vacuum_count,
       autovacuum_count
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

`n_dead_tup`은 추정치다. 마지막 autovacuum 시각 하나만 보고 정상 또는 실패를 단정하지 않고, 값의 추이와 오래 열린 트랜잭션을 함께 확인한다. 정리가 돌았어도 필요한 옛 버전을 제거하지 못했을 수 있다.

## 파일 크기만 재면 놓치는 것

실험에서는 A가 열려 있을 때와 끝난 뒤를 나눠 본다. 같은 파일 크기라도 앞쪽은 아직 필요한 옛 행일 수 있고, 뒤쪽은 다음 쓰기에 쓸 빈 공간일 수 있다. `VACUUM`은 트랜잭션 블록 밖에서 실행하고, 비교가 끝나면 열린 세션과 실험용 테이블을 정리한다.

디스크 숫자가 그대로라고 청소가 실패한 것은 아니다. 이 사례에서 바꿔야 할 질문은 “왜 안 줄었지?”에서 **“줄여야 하나, 다시 쓸 수 있으면 되나?”**로 넘어간다.

## 참고 자료

- [PostgreSQL MVCC Introduction](https://www.postgresql.org/docs/16/mvcc-intro.html)
- [PostgreSQL Routine Vacuuming](https://www.postgresql.org/docs/16/routine-vacuuming.html)
- [PostgreSQL VACUUM](https://www.postgresql.org/docs/16/sql-vacuum.html)
- [PostgreSQL Statistics Collector](https://www.postgresql.org/docs/16/monitoring-stats.html)
