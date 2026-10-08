---
post_id: 713
title: 차단은 한쪽이 했는데 매칭은 양쪽을 막아야 했다
description: 차단한 A와 먼저 매칭을 요청한 B의 예시로 양방향 검사, 참가자 권한, 중복 저장의 규칙을 설명한다.
date: '2026-06-14'
revised: '2026-10-08'
url: https://so-dak.com/%eb%9e%9c%eb%8d%a4-%eb%a7%a4%ec%b9%ad-%ec%84%9c%eb%b9%84%ec%8a%a4-%ec%95%85%ec%84%b1-%ec%9c%a0%ec%a0%80-%ec%b0%a8%eb%8b%a8-redis-%ea%b8%b0%eb%b0%98-%eb%b9%a0%eb%a5%b8-%eb%a7%a4%ec%b9%ad-%ed%95%84/
---

차단 목록은 보통 “내가 차단한 사람”으로 저장한다. 그런데 매칭에서 그 목록만 보면 이상한 일이 생긴다. A가 B를 차단했어도, B가 먼저 상대를 찾으면 A가 후보로 나올 수 있다.

차단이 선착순 혜택이 되면 곤란하다. VoiceLink의 Java 17·Spring Boot 3.2.5 코드를 보면 **누가 요청했든 한쪽이 거부한 만남은 제외한다.** 이 규칙 때문에 저장 방향과 조회 방향이 달라진다.

## 저장은 한 방향, 매칭은 양방향

A → B라는 관계를 저장하면 누가 차단했고 누가 해제할 수 있는지 남는다. 매칭할 때는 요청자 순서에 기대지 않고 양쪽 관계를 확인해야 한다. `canMatch`의 null·자기 자신 검사를 뺀 부분이다.

```java
return !userBlockRepository.existsByBlockerIdAndBlockedId(
            userA.getId(), userB.getId())
        && !userBlockRepository.existsByBlockerIdAndBlockedId(
            userB.getId(), userA.getId());
```

두 조건이 모두 참이어야 통과한다. B의 목록이 비어 있어도 A가 B를 차단했다면 연결하지 않는다. 양방향 차단을 조회하는 서비스 테스트도 이 규칙을 다룬다.

여기서 후보를 그냥 버리면 또 다른 문제가 생긴다. B는 A를 못 만날 뿐, 다른 사람과 통화할 기회까지 잃은 것은 아니다. 제외된 후보와 요청자는 다시 기다리는 경로로 이어진다. [후보를 꺼내는](https://so-dak.com/voicelink-distributed-matching-concurrency-redis-lua/) 데 성공했다는 것과 만남을 허용한다는 것은 별개의 판단이다.

## 차단 대상은 서버가 통화 기록에서 찾는다

그렇다면 API에 상대 ID만 보내면 될까? 이 기능은 통화 기록에서 상대를 차단하거나 신고하는 기능이다. 요청자가 아무 사용자를 지정하게 두기보다, 실제로 참여한 통화에서 상대를 찾아야 규칙이 맞는다.

`requireParticipantTarget`은 기록 번호로 세션을 찾은 뒤 두 사람을 확인한다.

```java
CallSession session = history.getCallSession();
User viewer = session.participantOf(requesterId)
        .orElseThrow(() -> new IllegalArgumentException(
                "통화에 참여한 사용자만 요청할 수 있습니다."));
User peer = session.peerOf(requesterId)
        .orElseThrow(() -> new IllegalArgumentException(
                "통화에 참여한 사용자만 요청할 수 있습니다."));
```

A와 B의 기록 번호를 C가 알아냈다는 설명용 상황을 넣어보면 차이가 분명하다. C는 참가자 검사에서 거절된다. **기록 번호를 아는 것과 그 통화의 당사자인 것은 다르다.**

차단과 신고의 중복 기준도 같은 방식으로 정해진다.

| 요청 | 기준이 되는 대상 | 같은 요청이 다시 오면 |
| --- | --- | --- |
| 차단 | 요청자 → 통화 상대 | 이미 있으면 종료 |
| 차단 해제 | 요청자 → 통화 상대 | 해당 방향의 관계 삭제 |
| 신고 | 신고자와 통화 기록 | 이미 신고한 통화로 거절 |
| 매칭 가능 여부 | 두 사용자 사이 양방향 차단 | 한쪽이라도 있으면 제외 |

같은 사람을 두 번 차단한다고 관계 두 개가 필요하지는 않다. 반면 서로 다른 통화에서 발생한 신고를 상대가 같다는 이유로 합치면 사건 하나가 사라진다. 그래서 차단은 두 사용자, 신고는 신고자와 통화 기록을 기준으로 삼는다. 접수된 신고는 운영자 검토용이며 자동 제재로 이어지지는 않는다.

## 조회 순간과 저장 순간 사이

“이미 차단했으면 종료”라는 검사만으로 동시 요청까지 정리되지는 않는다. 둘 다 관계가 없다고 읽고 저장할 수 있어 DB 고유 제약이 필요하다. 서비스의 중복 예외 처리도 JPA의 flush·커밋 시점까지 실제 DB에서 확인할 대상이다.

매칭과 차단이 동시에 진행되면 더 까다롭다. **차단 없음 조회 → 차단 저장 → 통화 확정** 순서라면 양방향 조회는 맞게 했어도 차단 뒤에 만남이 확정될 수 있다.

“한쪽이 차단하면 제외”와 “차단 저장 이후에는 진행 중인 매칭도 확정하지 않기”는 서로 다른 요구다. 다음 검증은 조회 횟수보다 이 겹치는 순서를 통제하는 데서 시작해야 한다.

## 참고 자료

- [PostgreSQL 고유 제약](https://www.postgresql.org/docs/16/ddl-constraints.html)
- [Spring 선언적 트랜잭션](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

검토 범위: VoiceLink `1704b46`의 사용자 안전 서비스·테스트·엔티티·설정과 신고/차단 문서. 동시 저장·매칭 경쟁의 실제 DB 시험 결과는 포함하지 않았다.
