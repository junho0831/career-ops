---
title: TURN을 껐는데 coturn은 왜 남아 있을까
description: LiveKit의 turn.enabled와 rtc.turn_servers를 나란히 읽으며, 내장 TURN 비활성화와 외부 coturn 사용이 함께 성립하는 이유를 설명한다.
date: '2026-10-14'
revised: '2026-10-14'
post_id: 1738
url: https://so-dak.com/livekit-external-turn/
---

VoiceLink의 `livekit.yaml`에는 `turn.enabled: false`가 있다. 그런데 같은 파일 위쪽에는 외부 TURN 서버가 등록돼 있고, 저장소에는 coturn 설정도 남아 있다.

꺼 둔 기능의 설정을 안 지운 걸까? **두 설정이 가리키는 TURN이 다르다.**

## 끈 것은 LiveKit 안의 TURN

다음은 실제 설정에서 외부 서버 항목 하나와 내장 TURN 설정만 남긴 발췌다. 주소는 예시로 바꾸고 인증 정보는 생략했다. 그대로 실행할 완성 설정은 아니다.

```yaml
rtc:
  turn_servers:
    - host: turn.example.invalid
      port: 3478
      protocol: udp
      # 인증 정보 생략

turn:
  enabled: false
```

아래의 `turn.enabled`는 **LiveKit에 내장된 TURN 서버를 실행할지** 정한다. 위의 `rtc.turn_servers`는 **클라이언트가 사용할 외부 TURN 서버 목록**이다. LiveKit의 [공식 설정 예제](https://github.com/livekit/livekit/blob/master/config-sample.yaml)도 두 항목을 따로 둔다.

VoiceLink는 외부 목록에 UDP·TCP·TLS 접속을 등록했다. Compose는 이 `livekit.yaml`을 LiveKit 컨테이너에 마운트하고 `--config`로 읽게 한다. 파일만 따로 남아 있는 상태는 아니다.

반면 coturn은 Compose 서비스로 정의돼 있지 않다. 프로젝트 문서는 호스트에 별도 설치하는 방식으로 설명한다. **내장 서버를 끄고, 바깥의 coturn을 사용하도록 연결한 구성**이다.

## coturn은 통화 상대가 아니다

TURN은 직접 연결이 어려운 네트워크에서 미디어를 중계할 경로를 제공한다. 여기서 직접 연결의 상대는 다른 사용자가 아니라 LiveKit SFU, 즉 통화 미디어를 전달하는 서버다. 사용자끼리 직접 연결하는 P2P 그림으로 읽으면 경로가 달라진다.

```mermaid
flowchart TD
    C["사용자 앱"] <-->|"직접 미디어 경로"| L["LiveKit SFU"]
    C <-->|"중계 경로"| T["외부 coturn"]
    T <-->|"중계 미디어"| L
```

두 경로를 구분한 설명용 그림이다. 매 통화가 두 경로를 동시에 쓰거나 반드시 coturn을 지난다는 뜻은 아니다. [LiveKit 배포 문서](https://docs.livekit.io/transport/self-hosting/deployment/)도 제한된 네트워크의 연결성을 보완하는 방법으로 TURN을 설명한다.

설정이 있다고 이번 통화가 그 길을 탔다고 말할 수도 없다. 프로젝트 문서에는 coturn 프로세스와 리스너를 확인한 기록이 있지만, 제한된 네트워크에서 실제 `relay` 경로를 선택했는지는 재검증하지 않았다고 명시돼 있다. 설정과 실제 선택의 차이는 [별도로 진행한 TURN 경로 실험](https://so-dak.com/turn-relay-verification/)에서 확인했다.

지금 확인한 답은 “TURN을 안 쓴다”가 아니다. **LiveKit이 직접 TURN 서버를 띄우지는 않고, 별도 coturn을 클라이언트의 연결 선택지로 둔다**는 것이다. `false` 한 줄을 읽을 때도 무엇을 끈 것인지부터 봐야 한다.

## 확인한 근거

2026-10-13 VoiceLink `37109d5`의 `livekit.yaml`, `docker-compose.yml`, `infra/coturn/turnserver.conf`, `docs/coturn-setup.md`와 `docs/server-architecture.md`를 대조했다. Compose의 LiveKit 이미지 태그는 `latest`라 이 저장소 설정만으로 실행 중인 서버 버전을 특정하지 않았다. 이번 글은 설정 분석이며 프로젝트 운영 환경의 호스트 상태, TURN 강제 중계와 실제 음성 통화는 재검증하지 않았다.
