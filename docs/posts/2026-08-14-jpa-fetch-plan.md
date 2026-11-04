---
post_id: 1247
title: 게시글 목록의 댓글 개수를 가져오는 세 가지 방법
description: Hibernate와 H2에서 댓글 8·2·0개를 조회해 배치 로딩, fetch join, 집계의 SQL 수와 엔티티 적재 수를 비교한다.
date: '2026-08-14'
evidence_review: '보관 실험 기록 대조 (2026-11-01)'
revised: '2026-11-05'
url: https://so-dak.com/jpa-n1-%eb%ac%b8%ec%a0%9c%ec%99%80-fetch-join-%ec%8b%a4%eb%ac%b4-%ea%b3%a0%ec%b0%b0-lazy-loading%ec%9d%b4%eb%a9%b4-%eb%8b%a4-%ed%95%b4%ea%b2%b0%eb%90%98%eb%82%98/
---

게시글 세 개에 댓글이 각각 여덟 개, 두 개, 0개 달려 있다. 목록에 필요한 것은 제목과 댓글 개수뿐이다. `post.getComments().size()`로 만들면 댓글 본문까지 읽을까?

2026년 10월 10일 Java 17.0.20.1·Hibernate 6.4.4.Final·H2 2.2.224에서 작은 모델을 별도로 만들어 비교했다. 배치 조회를 켜니 SQL은 네 번에서 두 번으로 줄었다. 그런데 읽어 들인 엔티티는 여전히 열세 개였다. **조회 횟수가 줄어도 필요 없는 데이터가 사라지는 것은 아니었다.**

## 같은 세 게시글로 네 번 조회했다

같은 목록을 **배치 로딩·fetch join·집계**로 각각 만들고, 기본 지연 로딩과 비교했다.

Java 클래스는 `Post`·`Comment`, HQL에서 쓰는 엔티티 이름은 `@Entity(name = "DemoPost")`·`@Entity(name = "DemoComment")`로 지정했다. 아래 쿼리의 `DemoPost`와 반환 타입 `Post.class`가 다른 이유다. [엔티티 이름 규칙](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#root-entity-references)

게시글의 댓글은 `@OneToMany(mappedBy = "post")`, 댓글의 게시글은 `@ManyToOne(fetch = LAZY)`로 연결했다. 댓글 본문에는 `text`를 넣었다. 이는 서비스 데이터가 아닌 실험용 입력이다.

각 비교에 같은 입력을 저장하고 **새 Hibernate 세션**에서 조회했다. 2차 캐시와 쿼리 캐시는 끄고, 저장 단계 뒤 통계를 초기화했다. `hibernate.generate_statistics=true`로 조회 때의 SQL 준비 횟수와 엔티티 적재 수를 읽었다. `default_batch_fetch_size`는 기본 비교에서 0, 배치 비교에서 100이다.

먼저 게시글 세 개를 읽고 댓글 개수를 만들었다. 실험 코드에서 조회한 부분이다.

```java
var posts = session.createQuery(
        "select p from DemoPost p order by p.id", Post.class)
    .setMaxResults(3)
    .list();
var counts = posts.stream()
    .map(p -> p.comments.size())
    .toList();
```

배치 조회를 끄면 목록 한 번과 댓글 컬렉션 세 번, 총 네 번이었다. 켜면 댓글을 묶어서 읽어 두 번이 됐다. 두 경우 모두 결과는 `[8, 2, 0]`, 엔티티는 게시글 3개와 댓글 10개다. 개수만 물었는데 댓글 전원이 출석했다.

## 한 번 조회했지만 두 글만 읽지는 않았다

컬렉션 fetch join을 쓰고 결과를 두 게시글로 제한해봤다.

```java
var posts = session.createQuery(
        "select p from DemoPost p "
            + "left join fetch p.comments order by p.id",
        Post.class)
    .setMaxResults(2)
    .list();
```

반환된 게시글은 두 개였다. SQL도 한 번이었다. 하지만 통계의 엔티티 적재 수는 열세 개였고, 다음 경고가 나왔다.

```text
HHH90003004: firstResult/maxResults specified
with collection fetch; applying in memory
```

이 실험에서는 게시글 세 개와 댓글 열 개를 읽은 뒤 메모리에서 게시글 두 개로 제한했다. **응답에 두 개가 보인다고 DB에서도 두 개만 읽었다고 할 수 없었다.**

왜 SQL 행에 바로 제한을 걸기 어려울까. A의 댓글 여덟 개를 조인하면 A만 여덟 행이 된다. DB의 `LIMIT 2`는 게시글 두 개가 아니라 이 중 두 행을 자를 수 있다. 게시글 단위의 페이지와 조인 결과의 행 단위가 다르기 때문이다. [Hibernate의 fetch join 설명](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#association-fetching)도 컬렉션 fetch join과 페이지 제한을 함께 쓰는 경우를 주의하라고 설명한다.

## 숫자를 구하는 쿼리로 바꿨다

댓글 내용을 응답에 쓰지 않는다면, 엔티티를 읽고 세는 대신 DB에 개수를 요청할 수 있다. 같은 입력으로 실행한 집계다.

```java
var rows = session.createQuery("""
    select p.id, p.title, count(c.id)
    from DemoPost p
    left join p.comments c
    group by p.id, p.title
    order by p.id
    """, Object[].class)
    .setMaxResults(3)
    .list();
```

`LEFT JOIN`으로 댓글이 없는 C도 결과에 남겼다. 여기서 세는 대상은 행 전체가 아니라 `c.id`다. C의 조인 결과에는 댓글 ID가 `NULL`로 채워지므로, `NULL`을 제외하는 `count(c.id)`가 0을 돌려준다. 댓글 없는 글까지 한 개로 세면 곤란하니까.

실제 반환한 개수는 `[8, 2, 0]`으로 같았고, SQL 한 번에 엔티티 적재는 0개였다. **같은 화면을 만들면서 댓글 객체 열 개를 아예 읽지 않을 수 있었다.**

| 조회 방식 | 반환 글 | SQL | 엔티티 |
| --- | ---: | ---: | ---: |
| 지연 로딩(비교 기준) | 3 | 4 | 13 |
| 배치 100 | 3 | 2 | 13 |
| fetch join·제한 2 | 2 | 1 | 13 |
| 개수 집계 | 3 | 1 | 0 |

이 수치는 해당 데이터 조회만 센 결과다. 페이지 전체 개수를 구하는 별도 쿼리나 운영 DB의 실행 시간은 포함하지 않았다. 집계도 댓글 수가 많으면 DB에서 세는 비용이 들고, 댓글 내용이 필요한 상세 화면에는 이 결과만으로 부족하다.

이 목록에서 필요한 값은 ID·제목·댓글 수였다. 그래서 집계로 충분했다. 댓글 본문을 펼쳐야 하는 화면이라면 선택이 달라진다. **SQL이 몇 번인가를 묻기 전에, 화면이 무엇을 쓸지부터 적어 보는 편이 낫다.**

[전체 재현 코드 ZIP](https://so-dak.com/wp-content/uploads/2026/11/jpa-fetch-example-20261104.zip)에는 두 엔티티, 합성 데이터, 네 조회와 검사가 들어 있다. Java 17·Gradle 8.14.2에서 압축을 푼 뒤 실행한다.

```bash
gradle -p jpa-fetch run
```

2026년 11월 4일 배포 ZIP에서 네 조건을 다시 실행해 표의 SQL 수·엔티티 수·반환값이 같은지 확인했다. `ALL_ASSERTIONS_PASSED`가 마지막에 나오며, fetch join의 메모리 페이지 처리 경고는 이 실험에서 예상한 출력이다.

## 참고 자료

- [Hibernate 6.4 배치 fetching](https://docs.hibernate.org/orm/6.4/userguide/html_single/#fetching-batch)
- [Hibernate 6.4 HQL: association fetching](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#association-fetching)
- [Hibernate 6.4 HQL: 집계 함수와 NULL](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#aggregate-functions)
- [Spring Data JPA projections](https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html)

근거: 2026-10-10 최초 실행과 2026-11-04 배포 예제의 실제 SQL·Hibernate 통계·반환값. 작은 모델의 적재량 비교이며 운영 성능 측정은 아니다.
