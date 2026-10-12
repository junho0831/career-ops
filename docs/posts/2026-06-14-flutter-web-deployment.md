---
post_id: 712
title: Flutter 웹에서 화면 요청과 API 요청을 나누는 법
description: Nginx가 앱 문서를 보내는 것과 Flutter가 통화 화면을 여는 것을 나눠 보고, API 분기와 /call 인자가 필요한 이유를 설명한다.
date: '2026-06-14'
revised: '2026-10-12'
url: https://so-dak.com/flutter-web%ea%b3%bc-spring-boot-%ec%97%b0%eb%8f%99%ec%9d%84-%ec%9c%84%ed%95%9c-nginx-%eb%a6%ac%eb%b2%84%ec%8a%a4-%ed%94%84%eb%a1%9d%ec%8b%9c-%eb%b0%8f-spa-%eb%9d%bc%ec%9a%b0%ed%8c%85-%ec%b5%9c/
---

VoiceLink의 웹 Dockerfile은 없는 화면 경로에 `index.html`을 돌려준다. 그런데 `/call`에 인자 없이 들어가면 라우터는 `/main`으로 보낸다. 앱 문서는 받았는데 통화 화면은 안 열린다.

**문서를 받는 일과 화면을 여는 일은 서로 다른 단계다.** Flutter 3.38.3을 쓰는 프로젝트의 Nginx 설정과 라우터를 함께 읽어 보면, 어디에서 막혔는지 나눌 수 있다.

## 화면에는 앱 문서를, API에는 API 응답을

웹 초기화 코드는 `PathUrlStrategy`를 설정한다. `/settings` 같은 화면 주소를 직접 열면 그 경로가 정적 서버에도 전달된다. 해당 파일이 없을 때 `index.html`을 보내는 것은 Flutter 라우터가 주소를 해석할 기회를 주기 위해서다.

그런데 `/api/items`에도 같은 문서를 보내면 곤란하다. JSON을 주문했는데 앱 화면이 배달되는 셈이다. `Dockerfile.frontend`는 두 요청을 나눈다. 백엔드 변수 설정과 전달 헤더를 생략한 발췌다.

```nginx
location /api/ {
    proxy_pass http://$backend_upstream;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

`/api/`는 백엔드로 넘기고, 나머지는 파일을 찾은 뒤 없으면 앱 문서를 보낸다. 이 `proxy_pass`에는 경로를 붙이지 않아 `/api/`를 포함한 요청 경로가 백엔드로 전달된다.

따라서 **200이라는 숫자만으로 API 성공을 판단하면 안 된다.** JSON을 기대했는데 HTML이 왔다면 요청 분기부터 본다. 없는 JavaScript 파일도 위 fallback으로 HTML을 받을 수 있어 응답 내용과 `Content-Type`을 같이 확인한다.

## /call은 주소만으로 열 수 없다

통화 화면에는 세션 ID, LiveKit 주소와 토큰이 담긴 `CallScreenArguments`가 필요하다. 라우터는 이를 `extra`로 받는다. `/call`이라는 주소만으로 그 값까지 만들어지지는 않는다.

`app_router.dart`의 실제 분기다.

```dart
if (isAuthenticated &&
    isGoingToCall &&
    CallScreenArguments.tryFromExtra(state.extra) == null) {
  return AppRoutes.main;
}
```

로그인한 사용자라도 통화 인자가 없으면 `/main`으로 간다. 라우터 테스트도 인증 상태를 대역으로 주고, 인자 없이 `router.go(AppRoutes.call)`을 호출한 뒤 `/main`으로 이동하는지 검사한다.

이 상황에서 Nginx의 fallback을 더 넓힐 이유는 없다. 앱은 이미 실행됐고, 통화를 시작할 정보가 없어 다른 화면을 고른 것이다. 통화 복원을 다룰 때는 서버의 활성 세션과 연결 정보를 다시 확보하는 흐름을 봐야 한다. 토큰을 URL에 붙여 보존할 일은 아니다.

| 보이는 결과 | 먼저 확인할 곳 |
| --- | --- |
| 화면 주소가 서버의 404로 끝남 | 정적 서버의 fallback |
| API에 JSON 대신 HTML이 옴 | `/api/` 분기와 전달 경로 |
| 앱이 `/call`에서 `/main`으로 이동 | 인증 상태와 통화 인자 |

표는 코드에서 도출한 점검 순서다. 같은 “화면이 안 열린다”여도, **앱 문서가 오지 않은 경우와 앱이 다른 화면을 선택한 경우**를 나누면 손댈 곳이 달라진다.

## 참고 자료

- [Flutter 웹 URL 전략](https://docs.flutter.dev/ui/navigation/url-strategies)
- [Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

근거: 2026-10-12 VoiceLink `37109d5`의 `Dockerfile.frontend`, 웹 초기화 코드, `app_router.dart`·`app_routes.dart`, 라우터 테스트와 `docs/nginx-configuration-guide.md`를 대조했다. 같은 날 Linux·Flutter 3.38.3에서 위 인자 없는 `/call` 진입 테스트 한 개가 통과했다. 인증 대역을 쓴 라우터 검사이며, 운영 Nginx나 실제 브라우저 새로고침을 재현한 결과는 아니다.
