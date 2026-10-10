---
post_id: 1245
title: 취소한 통화의 마이크가 뒤늦게 허용되면
description: VoiceLink 연결 테스트에서 늦은 마이크 허용과 15초 타임아웃을 따라가며, 취소한 방과 새 방을 구분하는 코드를 읽는다.
date: '2026-08-14'
revised: '2026-10-10'
url: https://so-dak.com/webrtc-livekit-%ec%97%b0%eb%8f%99-%ed%9a%8c%ea%b3%a0-%ea%b7%b8%eb%83%a5-%ec%98%a4%ed%94%88%ec%86%8c%ec%8a%a4-%ec%84%9c%eb%b2%84-%eb%9d%84%ec%9a%b0%eb%a9%b4-%eb%90%98%eb%8a%94-%ea%b1%b0-%ec%95%84/
---

`livekit_connection_test.dart`에는 조금 긴 이름의 테스트가 있다. `late permission cannot revive cancelled call or disconnect newer room`. 취소한 통화의 마이크 권한을 늦게 허용해도, 그 통화가 살아나거나 다음 통화가 끊겨서는 안 된다는 테스트다.

화면을 닫으면 끝났을 것 같지만 권한 요청은 아직 응답을 기다릴 수 있다. **결과를 버리는 것과 뒤늦게 얻은 마이크를 닫는 것은 다른 일이다.** VoiceLink의 Flutter 연결 코드는 이 둘을 어떻게 나누는지 따라가 봤다. 기준은 `b159c1d`, Flutter 3.38.3과 `livekit_client` 2.5.4다.

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

`1704b46`의 변경 전후도 이 테스트와 맞물린다. 이전에는 `setMicrophoneEnabled(true)`를 기다린 뒤 방이 같은지만 확인했다. 변경 뒤에는 `LocalAudioTrack`을 직접 받아 보관하고, 취소됐으면 그 트랙을 `stop()`·`dispose()`한다. 현재 코드를 보고 당시 생각을 추측할 필요 없이, 자원을 잡고 정리하는 방식이 바뀐 것은 변경 내역에서 확인할 수 있다.

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

마지막으로 `ready`도 음성이 실제로 들린다는 측정값은 아니다. `_tryStartAudio()`는 재생 시작에 실패하면 `false`를 반환하지만, 연결 코드는 그 뒤에도 `ready`를 알린다. 통화 화면은 `audioStarted`를 따로 읽고 필요하면 재생을 다시 시도한다. 권한을 얻고 방에 붙은 상태와 브라우저가 오디오 재생을 허용한 상태를 하나로 묶지 않은 것이다.

여기까지는 응답 순서를 통제한 테스트다. 실제 기기에서 마이크가 해제되거나 양쪽 음성이 들렸다는 검증은 아니다. 다음 기기 시험에서도 조건을 그대로 가져가면 된다. 이전 마이크는 꺼지고, 새 통화는 남아 있는가.

## 참고 자료

- [LiveKit 연결과 재연결](https://docs.livekit.io/intro/basics/connect/)
- [LiveKit 토큰과 권한](https://docs.livekit.io/frontends/reference/tokens-grants/)
- [ICE 표준](https://www.rfc-editor.org/rfc/rfc8445.html)
- [TURN 표준](https://www.rfc-editor.org/rfc/rfc8656.html)

프로젝트 근거: `frontend/lib/src/livekit/service/livekit_service.dart`, `frontend/test/livekit/service/livekit_connection_test.dart`, `frontend/lib/src/features/match/presentation/screens/call_screen.dart`, `docs/matching-call-lifecycle.md`. 실행한 VoiceLink `1704b46`의 해당 파일은 `b159c1d`와 동일하다. 테스트는 Flutter 3.38.3에서 방과 마이크 트랙을 대역으로 교체해 실행했다.
