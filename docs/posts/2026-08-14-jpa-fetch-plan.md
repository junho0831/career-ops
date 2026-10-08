---
post_id: 1247
title: 게시글 목록의 댓글 개수를 가져오는 세 가지 방법
description: 댓글 여덟 개와 두 개가 달린 게시글을 예로 들어 추가 조회, 조인 행 수, 댓글 개수 집계를 비교한다.
date: '2026-08-14'
revised: '2026-10-08'
url: https://so-dak.com/jpa-n1-%eb%ac%b8%ec%a0%9c%ec%99%80-fetch-join-%ec%8b%a4%eb%ac%b4-%ea%b3%a0%ec%b0%b0-lazy-loading%ec%9d%b4%eb%a9%b4-%eb%8b%a4-%ed%95%b4%ea%b2%b0%eb%90%98%eb%82%98/
---

게시글 목록에 필요한 것은 제목과 댓글 개수다. 그런데 댓글 개수를 만드는 코드가 `post.getComments().size()`라면 어떨까. 화면에는 숫자 하나만 보이는데 DB에서는 그 숫자보다 많은 것을 가져올 수 있다.

아래 게시글·댓글은 학습용 모델이다. VoiceLink의 공통 JPA 설정과 조회 코드를 검토했지만, 이 예제의 SQL 횟수나 성능을 실행해 측정한 것은 아니다.

## 목록을 읽은 뒤에 쿼리가 더 나갈 수 있다

```java
List<Post> posts = repository.findAll(pageable).getContent();
for (Post post : posts) {
    int commentCount = post.getComments().size(); // 이 접근에서 추가 조회 가능
}
```

댓글 컬렉션을 초기화하면 개수를 세려고 댓글 엔티티까지 읽게 된다. 개수만 물었는데 댓글 전원이 출석하는 셈이다. 설명용 SQL로 펼치면 차이가 보인다.

```sql
-- 목록 조회
SELECT id, title FROM post ORDER BY id LIMIT 10;
-- 응답 변환 중 각 게시글의 댓글 접근
SELECT id, post_id, body FROM comment WHERE post_id = :post_id;
```

한 페이지에 글이 열 개라도 SQL이 반드시 열한 번인 것은 아니다. 배치 조회로 묶일 수도 있다. 다만 **조회 횟수를 줄여도 댓글 본문을 읽는 비용은 남는다.** 이제 한 번에 가져오는 방법도 따져볼 차례다.

## 댓글을 조인하면 한 행이 게시글 하나가 아니다

게시글 A에 댓글 여덟 개, B에 두 개가 있다고 하자.

| 게시글 | 댓글 수 | 조인 결과에서 차지하는 행 |
| --- | ---: | ---: |
| A | 8 | 8 |
| B | 2 | 2 |
| 합계 | 10 | 게시글 2개에 해당하는 10행 |

이 상태에서 SQL 결과에 `LIMIT 10`을 걸면 게시글 열 개를 고르는 것과 다르다. 다음은 행 수를 설명하기 위한 SQL이며 Hibernate가 출력한 실행 로그가 아니다.

```sql
-- 결과 행의 단위를 설명하는 SQL: JPA fetch join 실행 로그가 아님
SELECT p.id, p.title, c.id AS comment_id
FROM post p
LEFT JOIN comment c ON c.post_id = p.id
ORDER BY p.id, c.id
LIMIT 10;
```

**조인 결과 열 행이 게시글 두 개일 수 있다.** ORM이 객체를 합쳐 보여줘도 DB에서 읽은 행 수가 없어지는 것은 아니다. 컬렉션 fetch join과 페이징을 섞을 때는 생성 SQL과 메모리 쪽 제한 여부를 확인해야 한다.

## 인원 파악에 전원 출석이 필요할까

이 목록의 요구를 다시 적으면 `게시글 ID, 제목, 댓글 수`다. 댓글 본문 전체는 필요하지 않다. 먼저 부모 페이지를 제한하고 개수를 집계하는 설명용 SQL이다.

```sql
WITH page AS (
    SELECT id, title FROM post ORDER BY id LIMIT 10
)
SELECT p.id, p.title, COUNT(c.id) AS comment_count
FROM page p
LEFT JOIN comment c ON c.post_id = p.id
GROUP BY p.id, p.title
ORDER BY p.id;
```

외부 조인과 `COUNT(c.id)`를 써 댓글이 없는 글도 0으로 남긴다. 엔티티를 전부 읽은 뒤 DTO로 포장하는 것과, 처음부터 집계 결과만 읽는 것은 다르다.

| 방법 | 가져오는 것 | 이 화면에서 따질 비용 |
| --- | --- | --- |
| 지연 로딩 | 접근한 게시글의 댓글 엔티티 | 추가 SQL과 전체 댓글 적재 |
| fetch join | 게시글과 댓글을 펼친 행 | 행 증가와 부모 페이징 |
| 집계 DTO | 제목과 댓글 개수 | 집계 조건과 댓글 0개 처리 |

집계 DTO는 이 화면에서 읽지 않을 댓글 본문을 빼는 선택이다. 대신 집계 쿼리를 따로 관리해야 하고, 댓글 내용이 필요한 상세 화면에는 그대로 쓸 수 없다. 조회 횟수만 보고 fetch join을 고르는 대신 화면에서 쓸 값부터 정하는 이유다.

VoiceLink에는 배치 조회 크기와 `open-in-view=false` 설정이 있다. 하지만 설정이 있다는 사실만으로 모든 목록의 추가 조회가 사라졌다고 볼 수는 없다.

비교할 때는 같은 게시글·정렬·댓글 0개 사례를 놓고 쿼리 수, 반환 행 수, 최종 응답을 함께 본다. **한 번의 무거운 조회보다 두 번의 작은 조회가 나을 수도 있으니**, SQL 횟수만으로 승자를 정하지 않는 편이 낫다.

## 참고 자료

- [Hibernate 6.4 fetching](https://docs.hibernate.org/orm/6.4/userguide/html_single/#fetching)
- [Hibernate 6.4 HQL: association fetching](https://docs.hibernate.org/orm/6.4/querylanguage/html_single/#association-fetching)
- [Spring Data JPA projections](https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html)

검토한 소스: VoiceLink의 공통 JPA 설정, 사용자 저장소와 빌드 의존성. 본문의 게시글·댓글 쿼리는 실행 결과가 없는 설명용 예제다.
