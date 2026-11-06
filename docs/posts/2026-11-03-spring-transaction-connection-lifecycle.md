---
title: '@Transactional 하나로 두 SQL이 묶이는 이유'
description: Spring과 H2에서 이체 실패, 내부 호출, 커넥션 공유, flush 후 롤백을 직접 비교하며 JDBC부터 JPA까지 트랜잭션의 경계를 따라간다.
date: '2026-11-04'
revised: '2026-11-06'
status: publish
post_id: 1794
url: https://so-dak.com/spring-transaction-connection-lifecycle/
---

A에게서 1만 원을 뺐다. B에게 넣기 전에 예외가 났다. A의 돈은 돌아올까?

Spring의 기본 프록시 방식에서는 메서드 바깥의 프록시가 호출을 받아 트랜잭션을 준비한다. 이 예제에서는 메서드가 정상 반환하면 커밋하고, 런타임 예외가 밖으로 전달되면 롤백한다. **어노테이션이 메서드 본문을 바꾸는 방식은 아니다.**

그래서 같은 객체 안에서 메서드를 직접 부르면 이 프록시를 지나지 않는다. 호출 경로 하나가 잔액에 어떤 차이를 만드는지 비교했다.

Spring 6.1.6과 H2로 작은 실험을 만들었다. A 5만 원·B 2만 원의 합성 데이터이며, 실제 계좌나 서비스 장애를 재현한 것은 아니다.

## 같은 차감 코드, 다른 잔액

실험의 실패 메서드다. `StopTransfer`는 `RuntimeException`을 상속한다. 입금 전 실패만 확인하려고 차감 다음 줄에서 멈췄다.

```java
@Transactional
public void failTransfer() {
    jdbc.update(
        "update account set balance=balance-10000 "
        + "where id=1");
    throw new StopTransfer();
}

public void callInternally() {
    failTransfer();
}
```

매 실험 전 잔액을 초기화했다. 정상 이체에는 B의 잔액을 올리는 SQL도 넣었다. 여기에 **두 SQL을 모두 실행한 뒤 실패하는 경우**를 추가했다. 예외 직전에는 같은 트랜잭션에서 4만 원·3만 원을 읽고, 롤백 후 새 조회로 원래 잔액을 확인했다.

| 호출 경로 | A(원) | B(원) |
| --- | ---: | ---: |
| 외부 → 실패 | 50,000 | 20,000 |
| 외부 → 내부 호출 → 실패 | 40,000 | 20,000 |
| 외부 → 정상 이체 | 40,000 | 30,000 |
| 외부 → 차감·입금 후 실패 | 50,000 | 20,000 |

첫 번째는 차감이 롤백됐다. 두 번째는 바깥 메서드에 트랜잭션이 없고 내부 호출이 프록시를 통과하지 않아, JDBC의 자동 커밋으로 차감이 확정됐다. 기존 트랜잭션이 있는 내부 호출까지 전부 트랜잭션 없이 실행된다는 뜻은 아니다. **내부 메서드에 붙인 별도의 설정이 적용되지 않는 것**이다. [Spring 프록시 방식의 적용 범위](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

마지막 경우에는 차감과 입금이 함께 취소됐다. 두 SQL을 누가 같은 트랜잭션으로 묶었을까?

## SQL 두 개가 같은 커넥션을 만나는 곳

이 실험에서 자동 커밋이 켜져 있으면 차감 SQL이 완료됐을 때 그 변경은 이미 확정된다. 이후 Java 예외만 던져서는 되돌릴 수 없다. 자동 커밋을 끄고 같은 JDBC 커넥션에서 두 SQL을 실행하면, 마지막 커밋 또는 롤백까지 하나의 DB 트랜잭션으로 처리할 수 있다. [JDBC 자동 커밋 규칙](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Connection.html#setAutoCommit(boolean))

Spring은 이 커넥션을 **누가 빌리고, 두 SQL에 공유하고, 언제 반환할지** 관리한다.

| 구성 요소 | 이 실험에서 맡은 일 |
| --- | --- |
| HikariCP / DataSource | 커넥션 대여와 재사용 |
| JdbcTemplate | SQL 실행·자원 정리·예외 변환 |
| 트랜잭션 매니저 | 시작·완료와 커넥션 관리 |
| JDBC 드라이버·DB | SQL 통신과 실제 트랜잭션 처리 |

프록시를 통과한 정상 이체의 흐름을 줄이면 다음과 같다.

```text
TransactionInterceptor가 트랜잭션 매니저 호출
→ DataSource에서 커넥션 확보, 자동 커밋 해제
→ 현재 스레드에 DataSource와 ConnectionHolder 연결
→ JdbcTemplate으로 차감 SQL 실행
→ 같은 커넥션으로 입금 SQL 실행
→ 커밋 또는 롤백, 연결 정보 해제, 풀에 반환
```

명령형 JDBC 트랜잭션을 설명한 흐름이다. `TransactionSynchronizationManager`가 스레드별 리소스를 관리하고, `JdbcTemplate`이 사용하는 `DataSourceUtils`는 해당 DataSource에 연결된 커넥션을 찾아 쓴다. SQL 하나가 끝나도 트랜잭션이 소유한 커넥션은 바로 반환하지 않는다. [DataSourceUtils의 획득·반환 규칙](https://docs.spring.io/spring-framework/docs/6.1.6/javadoc-api/org/springframework/jdbc/datasource/DataSourceUtils.html)

여기서 실험 코드가 한 번 실패했다. `JdbcTemplate.execute(ConnectionCallback)`으로 받은 두 객체를 `==`로 비교했더니 달랐다. 같은 트랜잭션인데 커넥션이 두 개라고?

콜백에는 `close()`를 막는 래퍼가 전달된다. `DataSourceUtils.getTargetConnection()`으로 래퍼를 벗긴 대상을 비교하자 같았다. 서로 다른 포장지를 보고 물건까지 다르다고 판단한 셈이다.

```text
콜백의 래퍼 객체가 같은가: false
래퍼를 벗긴 커넥션이 같은가: true
차감 SQL 이후 풀의 사용 중 커넥션: 1
트랜잭션 반환 직후 사용 중 커넥션: 0
```

이 값은 요청 하나를 실행한 로컬 실험 결과다. 다중 DataSource나 JTA 트랜잭션, 리액티브 실행에는 이 설명을 그대로 확장하지 않는다.

## 풀 크기 10은 요청 10개 제한이 아니다

`maximumPoolSize=10`은 풀에서 동시에 빌려 쓸 수 있는 커넥션의 상한이다. DB를 쓰지 않는 HTTP 요청 수까지 10개로 묶지는 않는다. 풀에서 받은 `Connection.close()`도 보통 물리 연결 종료 대신 반환을 뜻한다.

그렇다면 SQL은 짧은데 왜 커넥션이 모자랄까? 차감 SQL 다음에 외부 결제 응답을 5초 기다린다고 가정해 보자. **이 JDBC 구성에서는 트랜잭션이 끝나기 전까지 빌린 커넥션도 남아 있다.** SQL 실행 시간만 보고는 그 점유 시간을 설명할 수 없다.

풀 고갈을 보면 느린 SQL, DB 잠금 대기, 외부 호출을 포함한 긴 트랜잭션, 반환 누락을 먼저 나눠 본다. `connectionTimeout`은 풀에서 빌리기를 기다리는 제한이지 SQL 실행 제한이 아니다. `maxLifetime`도 실행 중인 쿼리를 그 시각에 강제로 끊는 설정은 아니다. [HikariCP 설정 설명](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)

## JPA에서는 객체가 하나 더 관리된다

JDBC의 `Connection`은 DB와 통신한다. JPA의 `EntityManager`는 엔티티와 영속성 컨텍스트를 관리한다. 이름만 다른 커넥션이 아니다.

같은 영속성 컨텍스트에서 같은 ID를 다시 `find()`하면 이미 관리 중인 객체를 받을 수 있다. 그 객체의 잔액을 바꾼 뒤 `flush()`하면 Hibernate가 변경을 감지해 SQL로 동기화한다. 변경 감지를 지원하는 일반적인 영속 엔티티라면 수정마다 별도의 `save()` 호출이 필요한 것은 아니다.

실험에서는 Hibernate Session의 JPA API로 계좌를 두 번 조회해 객체 동일성을 확인하고, 잔액을 바꾼 뒤 flush했다. 같은 트랜잭션의 SQL 조회로 4만 원이 보이는 것도 확인했다. 그다음 명시적으로 롤백하고 새 JDBC 조회를 실행했다.

```text
같은 컨텍스트의 find(1) 두 번: 같은 객체
잔액 변경 → flush → 같은 트랜잭션에서 조회: 40,000
rollback → 새 조회: 50,000
```

**SQL이 실행됐다는 사실과 변경이 확정됐다는 사실은 달랐다.** flush는 커밋이 아니며, 영속성 컨텍스트를 비우는 `clear()`와도 다르다. 자동 flush는 커밋 전뿐 아니라 일부 쿼리 실행 전에도 일어날 수 있다. [Hibernate의 flushing 설명](https://docs.hibernate.org/orm/6.4/userguide/html_single/#flushing)

Spring에서 JPA를 쓸 때는 보통 `JpaTransactionManager`가 EntityManager와 트랜잭션을 조정한다. 컨텍스트의 수명과 JDBC 커넥션 점유 시간은 설정에 따라 달라질 수 있다.

## 두 SQL의 롤백과 동시 이체는 다른 문제

이번 실험은 “두 SQL을 함께 되돌리는가”를 확인했다. 두 요청이 같은 잔액을 동시에 쓰는 경쟁까지 해결한 것은 아니다. 실제 이체에는 잔액 부족·대상 존재·영향받은 행 수 검사와 잠금 또는 버전 기반 충돌 처리도 필요하다.

`@Transactional`이 붙었는지만 확인하는 대신, 이제는 **프록시를 통과했는지, 어떤 리소스를 공유했는지, 언제 반환했는지**를 이어서 설명할 수 있다. 새로운 스레드의 `@Async` 작업도 같은 ThreadLocal을 자동으로 이어받지 않으므로 이 경계를 다시 잡아야 한다. 비동기 작업이 쌓이는 문제는 [스레드 풀과 대기열 용량](https://so-dak.com/%eb%b0%b1%ec%97%94%eb%93%9c-%ec%95%84%ed%82%a4%ed%85%8d%ec%b2%98-spring-boot-async%ec%99%80-threadpool%ec%9d%84-%ed%99%9c%ec%9a%a9%ed%95%9c-%eb%8c%80%ea%b7%9c%eb%aa%a8-%ed%8a%b8%eb%9e%98%ed%94%bd/)에서 이어서 다뤘다.

[재현 코드 ZIP](https://so-dak.com/wp-content/uploads/2026/11/spring-transactions-example-20261104.zip)을 내려받아 압축을 푼다. Java 17과 Gradle 8.14.2가 준비됐다면 압축을 푼 위치에서 다음 명령으로 다섯 시나리오를 실행할 수 있다. 처음 실행할 때는 Maven Central에서 의존성을 내려받는다.

```bash
gradle -p spring-transactions run
```

실행 환경: 2026-11-03 최초 실행, 2026-11-04 배포 ZIP 재검증. Linux·Java 17.0.20.1·Spring 6.1.6·HikariCP 5.0.1·Hibernate 6.4.4.Final·H2 2.2.224. JDBC는 `DataSourceTransactionManager`, JPA는 Hibernate의 리소스 로컬 트랜잭션을 사용했다.

확인 범위: 단일 프로세스·단일 H2 메모리 DB·합성 계좌다. 차감 직후 롤백, 차감·입금 뒤 롤백, 내부 호출, 커넥션 공유·반환, 영속 객체 동일성·flush 후 롤백까지 다섯 시나리오가 통과했다. 실제 DB의 장애·동시 이체·풀 고갈 부하나 분산 트랜잭션은 측정하지 않았다.

## 참고 자료

- [Spring의 선언적 트랜잭션과 프록시](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring 6.1.6 DataSourceUtils](https://docs.spring.io/spring-framework/docs/6.1.6/javadoc-api/org/springframework/jdbc/datasource/DataSourceUtils.html)
- [Hibernate 6.4의 flush 동작](https://docs.hibernate.org/orm/6.4/userguide/html_single/#flushing)
