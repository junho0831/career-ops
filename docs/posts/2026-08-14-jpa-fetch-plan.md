---
post_id: 1247
title: 게시글 목록의 댓글 개수를 가져오는 세 가지 방법
description: Hibernate와 H2에서 댓글 8·2·0개를 조회해 배치 로딩, fetch join, 집계의 SQL 수와 엔티티 적재 수를 비교한다.
date: '2026-08-14'
revised: '2026-10-10'
url: https://so-dak.com/jpa-n1-%eb%ac%b8%ec%a0%9c%ec%99%80-fetch-join-%ec%8b%a4%eb%ac%b4-%ea%b3%a0%ec%b0%b0-lazy-loading%ec%9d%b4%eb%a9%b4-%eb%8b%a4-%ed%95%b4%ea%b2%b0%eb%90%98%eb%82%98/
---

게시글 세 개에 댓글이 각각 여덟 개, 두 개, 0개 달려 있다. 목록에 필요한 것은 제목과 댓글 개수뿐이다. `post.getComments().size()`로 만들면 댓글 본문까지 읽을까?

2026년 10월 10일 Java 17.0.20.1·Hibernate 6.4.4.Final·H2 2.2.224에서 작은 모델을 별도로 만들어 비교했다. 배치 조회를 켜니 SQL은 네 번에서 두 번으로 줄었다. 그런데 읽어 들인 엔티티는 여전히 열세 개였다. **조회 횟수가 줄어도 필요 없는 데이터가 사라지는 것은 아니었다.**

## 같은 세 게시글로 네 번 조회했다

모델은 `DemoPost`와 `DemoComment`다. 게시글의 댓글은 `@OneToMany(mappedBy = "post")`, 댓글의 게시글은 `@ManyToOne(fetch = LAZY)`로 연결했다. 댓글 본문에는 `text`를 넣었다. 이는 서비스 데이터가 아닌 실험용 입력이다.

| 게시글 | 댓글 수 |
| --- | ---: |
| A | 8 |
| B | 2 |
| C | 0 |

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

`LEFT JOIN`과 `count(c.id)`를 사용해 댓글이 없는 C도 0으로 남겼다. 반환한 개수는 `[8, 2, 0]`으로 같았고, SQL 한 번에 엔티티 적재는 0개였다. 숫자를 세기 위해 댓글 객체를 만들지 않은 것이다.

| 실제 실행한 조회 | 반환한 부모 수 | SQL 수 | 적재한 엔티티 수 |
| --- | ---: | ---: | ---: |
| 지연 로딩 후 개수 접근 | 3 | 4 | 13 |
| 배치 크기 100으로 개수 접근 | 3 | 2 | 13 |
| 컬렉션 fetch join + 제한 2 | 2 | 1 | 13 |
| ID·제목·댓글 수 집계 | 3 | 1 | 0 |

이 수치는 해당 데이터 조회만 센 결과다. 페이지 전체 개수를 구하는 별도 쿼리나 운영 DB의 실행 시간은 포함하지 않았다. 집계도 댓글 수가 많으면 DB에서 세는 비용이 들고, 댓글 내용이 필요한 상세 화면에는 이 결과만으로 부족하다.

## 목록에 무엇을 보여줄 것인가

VoiceLink의 배치 크기 100과 `open-in-view=false` 설정도 대조했다. 배치 설정은 여러 추가 조회를 묶지만, 이 실험처럼 숫자만 필요한 화면에서 댓글 본문까지 빼주지는 않는다. **설정을 바꾸는 일과 필요한 데이터만 고르는 일은 별개였다.**

제목과 개수만 보여준다면 집계 결과부터 비교하겠다. 댓글 본문까지 보여주는 화면이라면 엔티티 조회가 필요할 수 있고, 그때는 페이지를 어디서 제한하는지 다시 봐야 한다. 집계 쿼리를 따로 관리하는 비용도 있으니 화면의 요구에 맞춰 고를 일이다.

SQL 한 번이라는 숫자 옆에 ‘게시글 3개와 댓글 10개를 읽음’을 적고 나니 판단이 달라졌다. 이번 목록에서 줄일 대상은 왕복 횟수뿐 아니라 **화면에서 쓰지도 않을 댓글 객체**였다.

## 참고 자료

- [Hibernate 6.4 배치 fetching](https://docs.hibernate.org/orm/6.4/userguide/html_single/#fetching-batch)
- [Hibernate 6.4 HQL: association fetching](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#association-fetching)
- [Spring Data JPA projections](https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html)

근거: 2026-10-10 독립 Java 실험의 실제 SQL·Hibernate 통계·반환값. VoiceLink `1704b46`와 `b159c1d`의 관련 설정과 의존성은 동일했다. 이 글의 수치는 작은 모델의 적재량 비교이며 운영 성능 측정은 아니다.
