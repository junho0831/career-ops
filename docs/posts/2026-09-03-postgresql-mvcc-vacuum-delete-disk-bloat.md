---
post_id: 1397
title: DELETE가 행을 지워도 파일 크기는 남는 이유
description: PostgreSQL 14.20에서 10만 행 중 9만 행을 삭제하고 옛 스냅샷, VACUUM, 실제 파일 크기의 차이를 확인한다.
date: '2026-09-03'
revised: '2026-10-10'
url: https://so-dak.com/postgresql-mvcc-vacuum-delete-disk-bloat/
---

행 열 개 중 아홉 개를 지웠는데 테이블 파일 크기는 그대로였다. 일반 `VACUUM`까지 실행해도 30,343,168바이트였다. 삭제가 실패한 걸까?

2026년 10월 10일, Linux Docker의 PostgreSQL 14.20에 새 실험 DB를 만들고 행 10만 개로 확인했다. **조회에서 사라지는 것, 그 자리를 다시 쓸 수 있는 것, 파일 길이가 줄어드는 것은 서로 달랐다.** 서비스 DB나 운영 장애를 재현한 결과는 아니다.

## 같은 삭제를 보고도 행 수가 달랐다

실험에는 인덱스가 있는 정수 ID와 256자 문자열을 썼다. 정리 시점을 직접 조절하려고 이 실험 테이블만 autovacuum을 껐다. 다음 준비 SQL을 별도 실험 DB에서 실행했다.

```sql
CREATE TABLE mvcc_example (
    id integer PRIMARY KEY,
    payload text
) WITH (autovacuum_enabled = false);

INSERT INTO mvcc_example
SELECT i, repeat(md5(i::text), 8)
FROM generate_series(1, 100000) AS i;
```

연결 A에서 `REPEATABLE READ` 스냅샷을 먼저 만들었다. `BEGIN`만 해놓지 않고 조회까지 실행한 뒤 연결을 열어 뒀다. 이어 별도 연결 B에서 앞쪽 9만 행을 삭제하고 커밋했다.

```sql
-- 연결 A: 먼저 실행한 뒤 열어 둔다.
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM mvcc_example; -- 100000

-- 연결 B: 별도 연결에서 실행한다.
BEGIN;
DELETE FROM mvcc_example WHERE id <= 90000;
COMMIT;
SELECT count(*) FROM mvcc_example; -- 10000

-- 다시 연결 A: B가 커밋한 뒤 실행한다.
SELECT count(*) FROM mvcc_example; -- 100000
```

같은 테이블인데 A는 여전히 10만 행을 봤다. A가 읽는 옛 버전을 바로 없애면 이 조회를 유지할 수 없다. PostgreSQL의 MVCC가 삭제 표시와 물리 정리를 나누는 이유다.

기본 `READ COMMITTED`에서는 문장마다 스냅샷을 잡으므로 이 결과를 그대로 기대하면 안 된다. 여기서는 A의 같은 스냅샷을 유지하려고 격리 수준을 지정했다.

## 파일 크기는 같아도 안쪽 상태는 바뀌었다

이번에는 A를 열어 둔 상태와 끝낸 상태를 나누어 `VACUUM`을 실행했다. `VACUUM`은 트랜잭션 블록 밖의 별도 연결에서 실행했다.

파일 크기는 `pg_relation_size`로 테이블 본체만 쟀다. 죽은 행과 빈 공간은 실험 DB에 설치한 `pgstattuple`로 확인했다. `pg_stat_user_tables.n_dead_tup`의 추정값을 실제 행 수처럼 쓰지 않기 위해서다.

```sql
CREATE EXTENSION pgstattuple;

SELECT pg_relation_size('mvcc_example');
SELECT dead_tuple_count, free_percent
FROM pgstattuple('mvcc_example');
```

아래는 이번 독립 실행에서 얻은 값이다. 앞쪽 9만 행을 지우고 뒤쪽 1만 행을 남겼다. 파일 끝만 잘라내면 되는 조건을 피하고, **파일 중간이 비었을 때** 무엇이 달라지는지 보려는 입력이다.

| 확인 시점 | 테이블 본체 크기 | 확인한 상태 |
| --- | ---: | --- |
| 10만 행 저장 뒤 | 30,343,168바이트 | 10만 행 조회 |
| 9만 행 삭제 뒤 | 30,343,168바이트 | 새 조회 1만 행, A는 10만 행 |
| A를 열어 두고 일반 VACUUM | 30,343,168바이트 | 죽은 행 90,000개 유지 |
| A 커밋 후 일반 VACUUM | 30,343,168바이트 | 죽은 행 0개, 빈 공간 89.99% |
| VACUUM FULL 후 | 3,039,232바이트 | 1만 행을 새 파일에 정리 |

A를 열어 둔 동안에는 `VACUUM`을 실행해도 죽은 행 9만 개가 남았다. A를 커밋한 다음에는 0개가 됐고 빈 공간은 89.99%였다. **같은 파일 크기 안에서, 보존해야 할 행이 재사용할 공간으로 바뀐 것이다.** 책장에서 책을 꺼내면 빈칸은 생겨도 책장 폭은 그대로인 것과 비슷하다.

일반 `VACUUM`도 파일 끝의 페이지가 완전히 비면 공간을 운영체제에 반환할 수 있다. 하지만 파일 중간의 빈칸을 앞쪽으로 모아 항상 축소하는 작업은 아니다. 이 차이는 [PostgreSQL의 공간 회수 설명](https://www.postgresql.org/docs/14/routine-vacuuming.html#VACUUM-FOR-SPACE-RECOVERY)과도 맞는다.

## FULL을 실행하기 전에 물어볼 것

`VACUUM FULL`에서는 파일이 약 3MB로 줄었다. 그렇다고 테이블이 커 보일 때마다 실행할 이유가 생기는 것은 아니다. 살아 있는 행을 새 파일에 쓰므로 `ACCESS EXCLUSIVE` 잠금과 새 복사본을 위한 추가 디스크가 필요하다.

다음 날 비슷한 양을 다시 넣는 테이블이라면, 오늘 잠금을 잡아 줄인 파일이 내일 다시 늘 수 있다. **당장 운영체제에 돌려줘야 하는 공간인지, 다음 적재에 다시 써도 되는 공간인지**부터 나눠야 한다.

관찰하는 크기도 구분한다. 다음 SQL은 테이블 본체, 인덱스, 전체 관계 크기를 각각 보여준다.

```sql
SELECT pg_size_pretty(pg_relation_size('mvcc_example')) AS heap,
       pg_size_pretty(pg_indexes_size('mvcc_example')) AS indexes,
       pg_size_pretty(pg_total_relation_size('mvcc_example')) AS total;
```

위 표는 이 중 `heap`만 비교한 값이다. 서버 전체 디스크에는 WAL·임시 파일·로그가 더해지므로 표의 감소량을 디스크 전체 감소량으로 옮겨 적으면 틀린다. `pgstattuple`도 테이블을 읽는 진단 작업이며, 큰 운영 테이블에 부담 없이 실행할 수 있다고 보지는 않는다.

실험 뒤에는 트랜잭션을 끝내고 컨테이너도 제거했다. 준비 SQL의 autovacuum 비활성화는 정리 시점을 나누기 위한 실험 조건으로만 사용했다.

파일 숫자가 그대로였던 두 상태 중 하나는 아직 A에게 필요한 옛 행이었고, 다른 하나는 다음 쓰기에 쓸 빈 공간이었다. 이제 파일 크기만 보고 “청소가 안 됐다”고 말하기는 어렵다.

## 참고 자료

- [PostgreSQL 14 MVCC Introduction](https://www.postgresql.org/docs/14/mvcc-intro.html)
- [PostgreSQL 14 Routine Vacuuming](https://www.postgresql.org/docs/14/routine-vacuuming.html)
- [PostgreSQL 14 VACUUM](https://www.postgresql.org/docs/14/sql-vacuum.html)
- [PostgreSQL 14 pgstattuple](https://www.postgresql.org/docs/14/pgstattuple.html)

근거: 2026-10-10 Linux Docker·PostgreSQL 14.20(Debian)의 독립 DB에서 실행한 SQL과 관찰값. 10만 행과 별도 연결의 스냅샷을 사용해 테이블 본체 크기·pgstattuple 결과를 비교했다. 이 값으로 다른 환경의 bloat 비율을 추정하지 않는다.
