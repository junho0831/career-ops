---
title: TURN 후보가 보인다고 중계 중인 건 아니다
description: 같은 PC에서 coturn과 두 WebRTC 연결을 띄워 직접 연결과 강제 중계를 비교했다. 선택된 candidate pair, relayProtocol, 수신 RTP 패킷으로 확인한 결과를 정리한다.
date: '2026-10-14'
revised: '2026-10-14'
post_id: 1739
url: https://so-dak.com/turn-relay-verification/
---

연결 통계에 `relay`가 보였다. 이제 TURN으로 통신하고 있다고 말해도 될까?

직접 비교해 보니 그렇지 않았다. **중계 후보가 만들어진 것과 그 후보를 실제로 선택한 것은 다른 사건**이었다. 후보 명단에 이름을 올렸다고 출전한 건 아니었다.

## 조건은 세 개, 볼 것은 선택된 경로

한 Linux PC에서 Chromium 140.0.7339.16과 coturn 4.6.1을 띄웠다. 브라우저 안에 두 `RTCPeerConnection`을 만들고, 각각 생성한 오디오 트랙을 상대에게 보냈다. 실제 마이크 대신 발진기로 만든 440Hz·660Hz 신호를 썼다.

조건마다 연결을 새로 만들었다. 기본 정책인 `all`에서는 직접 연결과 중계 후보를 허용하고, `relay`에서는 중계 후보만 사용하도록 제한했다. TURN 접속은 UDP와 TCP로 나눴다. 연결된 뒤 수신 통계를 읽고, 1초 후 다시 읽었다.

| 정책 / TURN 접속 | 선택된 로컬·원격 후보 | 로컬 `relayProtocol` | 수신 오디오 패킷 A / B |
| --- | --- | --- | --- |
| `all` / UDP | `host` · `host` | 없음 | 79→130 / 79→130 |
| `relay` / UDP | `relay` · `relay` | `udp` | 76→126 / 76→126 |
| `relay` / TCP | `relay` · `relay` | `tcp` | 76→126 / 76→127 |

첫 조건에서도 A의 후보 목록에는 `relay`가 있었다. 하지만 **선택된 쌍은 `host`와 `host`**였다. TURN 서버를 설정하고 중계 후보까지 얻었어도, 이 연결은 직접 경로를 골랐다.

중계를 강제한 두 조건에서는 양쪽 모두 중계 후보를 선택했고 수신 RTP 오디오 패킷도 늘었다. 단순히 `connected`만 읽었을 때보다 “그 경로로 패킷이 왔다”는 근거가 하나 더 생겼다. 패킷 수 차이로 UDP와 TCP의 성능을 비교하는 실험은 아니다.

## TCP로 붙었는데 왜 UDP라고 나오지?

세 조건 모두 선택된 후보의 `protocol` 값은 `udp`였다. TCP 조건까지 그랬다. 여기서 `protocol`만 출력했다면 TURN 접속 방식을 잘못 읽었을 것이다.

`protocol`은 후보 자체의 전송 프로토콜이고, 로컬 중계 후보의 `relayProtocol`은 **브라우저에서 TURN 서버까지 사용한 전송 방식**이다. 이번 TCP 조건에서는 각각 `udp`, `tcp`로 갈렸다.

다음은 연결 후 통계에서 그 둘을 나눠 읽는 예시다. 브라우저가 제공하는 각 transport의 `selectedCandidatePairId`를 따라간다. 선택된 쌍이나 통계가 아직 없으면 건너뛴다.

```javascript
const stats = await pc.getStats();
for (const transport of stats.values()) {
  if (transport.type !== "transport") continue;
  const pair = stats.get(transport.selectedCandidatePairId);
  if (!pair) continue;
  const local = stats.get(pair.localCandidateId);
  const remote = stats.get(pair.remoteCandidateId);
  console.log({
    local: local?.candidateType,
    remote: remote?.candidateType,
    protocol: local?.protocol,
    relayProtocol: local?.relayProtocol,
  });
}
```

VoiceLink의 `CallQualityMonitor.extractIcePath()`는 선택 ID나 `selected`·`nominated` 표시로 pair를 찾아 후보 타입을 읽는다. 다만 현재 `transport`에는 후보의 `protocol`만 담는다. 이 값 하나로 TURN/UDP와 TURN/TCP까지 구분한다고 설명하면 현재 코드보다 앞서 나가는 셈이다.

## 이번 실험이 답한 범위

확인한 것은 **한 PC 안에서의 직접 경로 선택, UDP·TCP를 통한 강제 중계, 양쪽 수신 RTP 패킷 증가**다. 오디오 에너지 증가는 확인되지 않았고 스피커로 소리를 듣는 시험도 하지 않았다. 따라서 “실제 통화 음질까지 검증했다”는 결과는 아니다.

또한 이 실험은 두 브라우저 연결끼리 SDP를 교환했다. [VoiceLink의 실제 음성 경로](https://so-dak.com/voicelink-signaling-media-path/)에 있는 LiveKit SFU는 포함하지 않았다. [프로젝트의 외부 coturn 설정](https://so-dak.com/livekit-external-turn/)을 운영 환경에서 검증하려면 서로 다른 기기와 제한된 네트워크에서도 선택된 경로와 수신을 확인해야 한다. TLS 접속 역시 이번 범위 밖이다.

## 참고 자료

- [W3C WebRTC Statistics: candidate와 relayProtocol](https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats)
- [W3C WebRTC: ICE 전송 정책](https://www.w3.org/TR/webrtc/#rtcicetransportpolicy-enum)

측정일은 2026-10-13이다. VoiceLink 코드 설명은 `37109d5`의 `call_quality_monitor.dart`와 관련 테스트를 기준으로 했다. 표는 위 격리 실험의 관찰값이며 운영 서버나 실기기 통화의 측정값이 아니다.
