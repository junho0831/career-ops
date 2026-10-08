---
post_id: 712
title: Flutter 웹에서 화면 요청과 API 요청을 나누는 법
description: 화면 새로고침과 API 요청을 나누고, Nginx 분기와 Flutter 빌드 시점의 주소 설정을 예시로 설명한다.
date: '2026-06-14'
revised: '2026-10-08'
url: https://so-dak.com/flutter-web%ea%b3%bc-spring-boot-%ec%97%b0%eb%8f%99%ec%9d%84-%ec%9c%84%ed%95%9c-nginx-%eb%a6%ac%eb%b2%84%ec%8a%a4-%ed%94%84%eb%a1%9d%ec%8b%9c-%eb%b0%8f-spa-%eb%9d%bc%ec%9a%b0%ed%8c%85-%ec%b5%9c/
---

설명용으로 `/settings` 화면을 생각해보자. 앱 안에서는 잘 열리는데 새로고침하면 404가 난다. 주소는 같은데 요청을 받는 쪽이 달라졌다.

앱 안의 이동은 Flutter 라우터가 처리한다. 새로고침은 서버에 그 주소의 문서를 달라는 요청이다. 서버에 `settings` 파일이 없다면 **앱이 경로를 해석할 기회부터 만들어줘야 한다.** VoiceLink의 Flutter 3.38.3 Dockerfile과 Nginx 설정에서 확인한 분기다.

## 화면 주소와 API 주소를 먼저 나눈다

| 요청의 역할 | 담당 | 기대하는 결과 |
| --- | --- | --- |
| 화면 직접 진입·새로고침 | 정적 서버 → 앱 라우터 | 시작 문서 뒤 해당 화면 |
| API 호출 | 백엔드 컨트롤러 | JSON 또는 API 오류 |
| 정적 파일 | 정적 서버 | 해당 파일과 맞는 MIME |
| [로그인 콜백](https://so-dak.com/spring-boot-redis-jwt-access-token%ea%b3%bc-opaque-refresh-token-%ec%95%88%ec%a0%84%ed%95%98%ea%b2%8c-%ea%b4%80%eb%a6%ac%ed%95%98%ea%b8%b0/) | 앱 콜백 → 코드 교환 API | 화면 진입과 교환 완료 |
| SSE | 이벤트 서버와 중간 프록시 | 끊기지 않는 응답 스트림 |

화면 요청에는 실제 파일이 없을 때 `index.html`을 보낸다. 시작 문서를 받은 Flutter 앱이 실행되고, 그제야 `/settings`를 해석할 수 있다.

그런데 모든 요청에 이 방법을 쓰면 어떨까. 없는 `/api/items`에도 HTML이 돌아올 수 있다. JSON을 주문했는데 앱 화면이 배달되는 셈이다. **HTTP 200이어도 JSON 대신 앱 문서를 받았다면 API 호출은 성공한 게 아니다.**

Dockerfile에서 요청 분기 부분만 발췌하면 다음과 같다. 백엔드 변수의 값과 전달 헤더는 생략했다.

```nginx
location /api/ {
    proxy_pass http://$backend_upstream;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

이렇게 나누면 화면의 직접 진입은 살리면서 API 오류는 백엔드가 응답하게 할 수 있다. 다만 `/` 분기는 없는 JavaScript 파일에도 HTML을 돌려줄 수 있다. 이 경우까지 구분하려면 상태 코드와 함께 `Content-Type`·응답 본문을 확인한다.

## 환경 변수를 바꿨는데 주소는 그대로라면

VoiceLink는 빌드 인자를 Flutter의 `dart-define`으로 넘긴다.

```dockerfile
ARG API_BASE_URL=/api
RUN flutter build web --release   --dart-define=API_BASE_URL=${API_BASE_URL}   --pwa-strategy=none
```

예를 들어 `/api`로 빌드한 이미지를 실행하면서 다른 환경 변수 값을 넣었다고 하자. 이미 만들어진 JavaScript는 다시 컴파일되지 않는다. **주소를 읽는 시점은 Nginx 실행 시점이 아니라 Flutter 빌드 시점**이기 때문이다.

지금 구조에서는 주소를 바꿀 때 다시 빌드해야 한다. 같은 이미지를 여러 환경에 쓰려면 실행 중 공개 설정을 읽는 방식이 대안이지만, 설정을 불러오는 절차가 추가된다. 어느 쪽이든 브라우저가 읽는 값에 서버 비밀키를 넣으면 안 된다.

## 확인할 요청을 구체적으로 적어둔다

배포 뒤에는 같은 화면을 앱 안에서 열기, 주소 직접 열기, 새로고침하기로 나눠 본다. 여기에 없는 API를 요청해 HTML 성공 응답으로 가려지는지도 확인한다.

로그인 콜백은 문서가 열리는 것과 일회용 코드를 API에서 교환하는 것이 모두 필요하다. SSE는 연결 성공 뒤에도 이벤트가 바로 도착하는지 봐야 한다. 프록시 버퍼링 때문에 한꺼번에 도착할 수 있어서다.

마지막으로 새 탭과 배포 전부터 열려 있던 탭을 비교한다. 이전 탭은 옛 자산을 요청할 수 있다. 현재 빌드의 `--pwa-strategy=none`도 과거 브라우저에 등록된 서비스 워커를 자동으로 없애지는 않는다.

새로고침 뒤 화면이 열리는 것과 API가 올바른 응답을 주는 것은 따로 확인한다. 둘 다 200이라고 적는 것보다, 화면 요청에는 앱 문서가 오고 API에는 JSON이나 API 오류가 오는지 확인하는 편이 분명하다.

## 참고 자료

- [Flutter 웹 배포](https://docs.flutter.dev/deployment/web)
- [Flutter 웹 URL 전략](https://docs.flutter.dev/ui/navigation/url-strategies)
- [Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

근거: 2026-10-08 확인한 VoiceLink `1704b46`의 웹 Dockerfile, Flutter 환경 설정, 프록시 운영 문서와 요청 코드. 경로 사례는 동작을 설명하기 위한 예시다.
