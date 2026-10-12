---
post_id: 1245
title: 취소한 통화의 마이크가 뒤늦게 허용되면
description: VoiceLink 연결 테스트에서 늦은 마이크 허용과 15초 타임아웃을 따라가며, 취소한 방과 새 방을 구분하는 코드를 읽는다.
date: '2026-08-14'
revised: '2026-10-12'
url: https://so-dak.com/webrtc-livekit-%ec%97%b0%eb%8f%99-%ed%9a%8c%ea%b3%a0-%ea%b7%b8%eb%83%a5-%ec%98%a4%ed%94%88%ec%86%8c%ec%8a%a4-%ec%84%9c%eb%b2%84-%eb%9d%84%ec%9a%b0%eb%a9%b4-%eb%90%98%eb%8a%94-%ea%b1%b0-%ec%95%84/
---

통화를 취소하고 새 통화를 시작했는데, 이전 통화의 마이크 권한 응답이 이제야 돌아온다면? 화면을 닫아도 이미 시작한 권한 요청은 응답을 기다릴 수 있다.

**결과를 무시하는 것과 뒤늦게 얻은 마이크를 닫는 것은 다른 일이다.** VoiceLink의 연결 코드와 테스트에서 이 상황을 따라가 봤다. Flutter 3.38.3·`livekit_client` 2.5.4 환경이다.

## 테스트는 이전 권한을 일부러 나중에 허용한다

실제 테스트에서는 방과 마이크 트랙을 가짜 객체로 바꾼다. `Completer`로 연결 완료와 권한 응답 시점을 직접 정해 다음 순서를 만든다.

1. 첫 방의 연결을 완료하고 마이크 권한 응답은 남겨둔다.
2. `disconnect()`를 호출한 뒤 두 번째 방에 연결한다.
3. 두 번째 통화가 연결된 다음 첫 통화의 권한 응답을 완료한다.

그 뒤의 검증을 발췌하면 다음과 같다. `old`와 `next`는 실제 방이 아니라 테스트용 방이다.

```dart
expect(old.participant.enabled, isFalse);
expect(old.track.stopped, isTrue);
expect(stages, isNot(contains(CallConnectionStage.ready)));
expect(service.room, same(next));
expect(next.disconnects, 0);
```

첫 트랙은 발행되지 않고 중지된다. 서비스가 들고 있는 방은 여전히 두 번째 방이고, 그 방의 연결 해제 횟수는 0이어야 한다. **옛 마이크 정리와 새 방 보존을 함께** 확인한다. 2026-10-10 Linux에서 연결 테스트 네 개를 재실행했고, 이 순서를 강제로 만든 검증도 통과했다.

`1704b46`의 변경 전후도 이 테스트와 맞물린다. 이전에는 `setMicrophoneEnabled(true)`를 기다린 뒤 방이 같은지만 확인했다. 변경 뒤에는 `LocalAudioTrack`을 직접 받아 보관하고, 취소됐으면 그 트랙을 `stop()`·`dispose()`한다.

## 옛 실패가 공용 disconnect를 부르면

`LiveKitService`의 `disconnect()`는 시도 번호인 `_connectionGeneration`을 증가시킨다. 연결을 시작할 때 잡아둔 번호와 달라졌다면 그 작업은 옛 시도다. 마이크 획득 뒤, 트랙 발행 뒤에도 이 번호를 확인한다.

옛 권한 요청이 실패했다고 무조건 공용 `disconnect()`를 부르면 지금 서비스가 가진 두 번째 방까지 닫힐 수 있다. 청소하러 왔다가 새 손님까지 내보내는 셈이다. 실제 예외 처리의 방 정리 부분은 이렇게 갈린다.

```dart
if (isCurrent()) {
  await disconnect();
} else if (attemptRoom != null) {
  await _disposeRoom(attemptRoom);
  throw CallConnectionCancelled();
}
```

최신 시도는 서비스의 연결을 닫고, 이전 시도는 자기가 만든 `attemptRoom`만 닫는다. 이 분기 앞에서는 획득한 마이크 트랙을 정리한다. 화면 상태만 비교해서는 놓치는 자원 소유권이 여기서 드러난다.

## 15초가 지났어도 원래 작업은 남는다

기본 15초 제한은 `room.connect()`에 걸려 있다. 이후의 마이크 권한 대기는 별도다. 실제 테스트도 가상 시간을 20초 진행한 뒤 상태가 여전히 `microphonePermission`인지 확인하고, 그제야 권한을 허용한다. “연결에 15초 제한”을 “권한 포함 전체 통화 준비에 15초 제한”으로 읽으면 다르다.

반대로 서버 연결이 제한 시간을 넘기면 기다리는 쪽에는 `TimeoutException`이 생긴다. 그래도 원래 `Future`가 취소되는 것은 아니다. 서비스는 늦은 연결 완료를 처리할 콜백을 따로 붙인다.

```dart
final connection = room.connect(url, token);
unawaited(
  connection.then((_) async {
    if (!isCurrent()) await _disposeRoom(room);
  }, onError: (Object _, StackTrace _) {}),
);
await connection.timeout(timeout);
```

타임아웃 테스트는 15초 뒤 서비스의 방이 비었는지 확인한다. 이후 원래 연결을 일부러 완료시키고 방 정리가 한 번 더 호출되는지도 본다. **기다리기를 끝냈다는 사실만으로 작업 자체가 사라지지는 않는다.**

늦게 끝난 작업은 자기가 얻은 마이크와 방만 정리해야 한다. 그래야 **취소한 통화는 닫히고, 새 통화는 남는다.**

## 참고 자료

- [LiveKit 연결과 재연결](https://docs.livekit.io/intro/basics/connect/)

프로젝트 근거: `frontend/lib/src/livekit/service/livekit_service.dart`, `frontend/test/livekit/service/livekit_connection_test.dart`, `docs/matching-call-lifecycle.md`. 2026-10-10 `1704b46`에서 실행한 테스트 네 개는 방과 마이크 트랙을 대역으로 바꾼 결과다. 10월 12일의 `37109d5`에서도 해당 서비스와 테스트는 동일하다. 실제 기기의 마이크 해제나 양방향 음성 수신을 검증한 결과는 아니다.
