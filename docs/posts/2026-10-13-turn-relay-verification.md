---
title: TURN 후보가 보인다고 중계 중인 건 아니다
description: 같은 PC에서 coturn과 두 WebRTC 연결을 띄워 직접 연결과 강제 중계를 비교했다. 선택된 candidate pair, relayProtocol, 수신 RTP 패킷으로 확인한 결과를 정리한다.
date: '2026-10-14'
evidence_review: 'VoiceLink 46282d5 (2026-11-01)'
revised: '2026-11-05'
post_id: 1739
url: https://so-dak.com/turn-relay-verification/
---

연결 통계에 `relay`가 보였다. 이제 TURN으로 통신하고 있다고 말해도 될까?

직접 비교해 보니 그렇지 않았다. **중계 후보가 만들어진 것과 그 후보를 실제로 선택한 것은 다른 사건**이었다. 후보 명단에 이름을 올렸다고 출전한 건 아니었다.

## 조건은 세 개, 볼 것은 선택된 경로

한 Linux PC에서 Chromium 140.0.7339.16과 coturn 4.6.1을 띄웠다. 브라우저 안에 두 `RTCPeerConnection`을 만들고, 각각 생성한 오디오 트랙을 상대에게 보냈다. 실제 마이크 대신 발진기로 만든 440Hz·660Hz 신호를 썼다.

조건마다 연결을 새로 만들었다. 기본 정책인 `all`에서는 직접 연결과 중계 후보를 허용하고, `relay`에서는 중계 후보만 사용하도록 제한했다. TURN 접속은 UDP와 TCP로 나눴다. 연결된 뒤 수신 통계를 읽고, 1초 후 다시 읽었다.

| 조건 | 선택 후보 | 중계 전송 |
| --- | --- | --- |
| all·UDP | host / host | 직접 경로 |
| relay·UDP | relay / relay | udp |
| relay·TCP | relay / relay | tcp |

같은 조건에서 읽은 수신 오디오 패킷 수다. 화살표 앞뒤는 1초 간격의 두 관찰값이다.

```text
all·UDP    A 79→130  B 79→130
relay·UDP  A 76→126  B 76→126
relay·TCP  A 76→126  B 76→127
```

첫 조건에서도 A는 TURN 서버에서 중계 후보를 얻었다. 따라서 “TURN 서버에 접속하지 않았다”는 뜻은 아니다. **선택된 쌍은 `host`와 `host`**였고, 실제 오디오 패킷이 다니는 경로로 직접 연결을 골랐다는 뜻이다.

중계를 강제한 두 조건에서는 양쪽 모두 중계 후보를 선택했고 수신 RTP 오디오 패킷도 늘었다. 단순히 `connected`만 읽었을 때보다 “그 경로로 패킷이 왔다”는 근거가 하나 더 생겼다. 패킷 수 차이로 UDP와 TCP의 성능을 비교하는 실험은 아니다.

## TCP로 붙었는데 왜 UDP라고 나오지?

세 조건 모두 선택된 후보의 `protocol` 값은 `udp`였다. TCP 조건까지 그랬다. 여기서 `protocol`만 출력했다면 TURN 접속 방식을 잘못 읽었을 것이다.

`protocol`은 후보 자체의 전송 프로토콜이고, 로컬 중계 후보의 `relayProtocol`은 **브라우저에서 TURN 서버까지 사용한 전송 방식**이다. 이번 TCP 조건에서는 각각 `udp`, `tcp`로 갈렸다.

아래 코드는 **현재 선택된 쌍 → 그 쌍의 로컬·원격 후보** 순서로 읽는다. 후보 명단 전체에서 `relay`를 찾는 것과 다른 부분이다. 아직 선택 정보가 없으면 건너뛴다.

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

확인한 것은 **선택된 경로와 그 상태에서 늘어난 수신 RTP 패킷**이다. 오디오 에너지는 증가하지 않았고 스피커로 듣는 시험도 하지 않았으므로 음질 검증으로 넓힐 수는 없다.

한 PC의 두 브라우저 연결끼리 SDP를 교환했으므로 [LiveKit SFU](https://so-dak.com/voicelink-signaling-media-path/)와 TLS 접속은 포함하지 않았다. 다음 시험은 [프로젝트의 외부 coturn](https://so-dak.com/livekit-external-turn/)을 거치는 서로 다른 기기에서 해야 한다. 선택된 쌍과 패킷 증가에 더해 실제 오디오 재생까지 확인하면, 이번에 남긴 무음 여부의 빈칸도 채울 수 있다.

[로컬 재현 코드 ZIP](https://so-dak.com/wp-content/uploads/2026/11/turn-relay-example-20261104.zip)에는 coturn 실행, 브라우저 연결 두 개, 세 조건의 통계 검사가 들어 있다. Linux·Python 3.12·coturn 4.6.1을 기준으로, 압축을 푼 `turn-relay` 폴더에서 실행한다.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/playwright install chromium
.venv/bin/python relay_experiment.py
```

coturn의 `turnserver`가 실행 경로에 있어야 하며 필요한 로컬 포트는 ZIP의 `README.txt`에 적었다. 인증값은 실행할 때 새로 만들고 임시 설정은 종료할 때 지운다. 이 로컬 전용 설정을 배포용 TURN 설정으로 쓰면 안 된다.

2026년 11월 4일 배포 ZIP에서도 세 조건의 경로와 양쪽 수신 패킷 증가를 확인했다. 본문 패킷 숫자는 10월 13일 기록을 유지했다. 패킷 수를 똑같이 맞추는 검사가 아니라 **선택 경로와 증가 여부**를 확인하는 검사다.

## 참고 자료

- [W3C WebRTC Statistics: candidate와 relayProtocol](https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats)
- [W3C WebRTC: ICE 전송 정책](https://www.w3.org/TR/webrtc/#rtcicetransportpolicy-enum)

측정일은 2026-10-13이다. 10월 15일 원래 실험 기록과 VoiceLink `37109d5`의 `call_quality_monitor.dart`·관련 테스트를 다시 대조했으며, 표의 수치는 새로 측정한 값으로 바꾸지 않았다.
