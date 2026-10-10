---
post_id: 712
title: Flutter 웹에서 화면 요청과 API 요청을 나누는 법
description: VoiceLink의 Nginx 분기와 Flutter 라우터를 읽고, index.html을 받았어도 통화 화면이 복원되지 않는 조건과 빌드 시점 주소 설정을 설명한다.
date: '2026-06-14'
revised: '2026-10-10'
url: https://so-dak.com/flutter-web%ea%b3%bc-spring-boot-%ec%97%b0%eb%8f%99%ec%9d%84-%ec%9c%84%ed%95%9c-nginx-%eb%a6%ac%eb%b2%84%ec%8a%a4-%ed%94%84%eb%a1%9d%ec%8b%9c-%eb%b0%8f-spa-%eb%9d%bc%ec%9a%b0%ed%8c%85-%ec%b5%9c/
---

VoiceLink의 웹 Dockerfile은 없는 화면 경로에 `index.html`을 돌려준다. 그런데 `/call`을 직접 열었을 때 통화 화면 대신 `/main`으로 보내는 라우터 테스트도 있다. 앱 문서는 받았는데 원하는 화면은 안 열린다. 두 동작은 충돌하는 걸까?

**시작 문서를 받는 일과 화면에 필요한 상태를 복원하는 일은 별개다.** Flutter 3.38.3을 쓰는 VoiceLink `b159c1d`의 `Dockerfile.frontend`와 라우터를 함께 읽으면 이 차이가 드러난다.

## 화면 주소와 API 주소를 먼저 나눈다

| 요청의 역할 | 담당 | 기대하는 결과 |
| --- | --- | --- |
| 화면 직접 진입·새로고침 | 정적 서버 → 앱 라우터 | 시작 문서 뒤 해당 화면 |
| API 호출 | 백엔드 컨트롤러 | JSON 또는 API 오류 |
| 정적 파일 | 정적 서버 | 해당 파일과 맞는 MIME |
| [로그인 콜백](https://so-dak.com/spring-boot-redis-jwt-access-token%ea%b3%bc-opaque-refresh-token-%ec%95%88%ec%a0%84%ed%95%98%ea%b2%8c-%ea%b4%80%eb%a6%ac%ed%95%98%ea%b8%b0/) | 앱 콜백 → 코드 교환 API | 화면 진입과 교환 완료 |
| SSE | 이벤트 서버와 중간 프록시 | 끊기지 않는 응답 스트림 |

웹 초기화 코드는 `PathUrlStrategy`를 설정한다. 화면 주소가 해시 뒤에만 남는 방식과 달리 `/settings` 같은 경로가 서버 요청에도 들어간다. 정적 서버에 해당 파일이 없으면 `index.html`을 보내 Flutter 라우터가 경로를 해석할 기회를 만든다.

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

`proxy_pass`에는 경로를 붙이지 않아 `/api/`를 포함한 요청을 백엔드로 넘긴다. 이 부분은 끝에 슬래시 하나가 달라져도 의미가 달라질 수 있다. 다음은 실제 주소 대신 고정 upstream 이름을 쓴 **설명용 비교**다. 변수를 포함한 위 설정을 그대로 바꾼 예제는 아니다.

| `/api/items` 요청 | 백엔드로 전달되는 경로 |
| --- | --- |
| `location /api/` + `proxy_pass http://api_service;` | `/api/items` |
| `location /api/` + `proxy_pass http://api_service/;` | `/items` |

백엔드 컨트롤러도 `/api`로 시작한다면 첫 형태에 맞춰야 한다. 화면과 API를 분리한 다음에도, 프록시가 백엔드에 어떤 경로를 보내는지 확인할 이유다. 없는 JavaScript 파일은 `/`의 fallback 때문에 HTML로 응답할 수 있으므로 상태 코드와 `Content-Type`도 함께 본다.

## 문서는 열려도 통화 인자는 남지 않는다

통화 화면은 세션 ID, LiveKit 주소와 토큰이 담긴 `CallScreenArguments`를 라우터의 `extra`로 받는다. 주소에 `/call`만 남았다고 이 값까지 생기는 것은 아니다. `app_router.dart`의 실제 분기다.

```dart
if (isAuthenticated &&
    isGoingToCall &&
    CallScreenArguments.tryFromExtra(state.extra) == null) {
  return AppRoutes.main;
}
```

인증된 사용자가 통화 인자 없이 진입하면 `/main`으로 이동한다. `/call 새로고침으로 인자가 없으면 main으로 리다이렉트한다` 테스트는 인증 상태를 가짜로 주입한 뒤 이 이동을 확인한다. 2026-10-10 라우터 테스트 열 개를 실행했고 이 검증도 통과했다. 실제 브라우저 새로고침과 서버 배포를 시험한 결과는 아니다.

이 경우 Nginx의 fallback을 더 넓혀도 해결되지 않는다. 앱은 이미 실행됐고, 필요한 인자가 없어서 라우터가 다른 화면을 선택한 것이다. 새로고침 복원을 지원하려면 서버에서 활성 세션을 다시 조회하고 새 연결 정보를 받는 동작까지 이어져야 한다. 토큰을 화면 URL에 붙여 상태를 보존하는 방식은 피한다.

## 환경 변수를 바꿨는데 주소는 그대로라면

VoiceLink는 빌드 인자를 Flutter의 `dart-define`으로 넘긴다.

```dockerfile
ARG API_BASE_URL=/api
RUN flutter build web --release \
  --dart-define=API_BASE_URL=${API_BASE_URL} \
  --pwa-strategy=none
```

예를 들어 `/api`로 빌드한 이미지를 실행하면서 다른 환경 변수 값을 넣었다고 하자. 이미 만들어진 JavaScript는 다시 컴파일되지 않는다. **주소를 읽는 시점은 Nginx 실행 시점이 아니라 Flutter 빌드 시점**이기 때문이다.

`Env.apiBaseUrl`도 `String.fromEnvironment('API_BASE_URL', ...)`로 이 값을 읽는다. 주소를 바꿀 때는 다시 빌드해야 한다. 같은 이미지를 여러 환경에 쓰려면 실행 중 공개 설정을 읽는 방식이 대안이지만, 설정을 불러오는 절차가 추가된다. 브라우저가 읽는 값에 서버 비밀키를 넣어서는 안 된다.

## 확인할 요청을 구체적으로 적어둔다

어느 단계에서 멈췄는지에 따라 확인할 곳이 달라진다. 다음은 앞의 코드에서 도출한 점검 순서이며, 운영 응답을 수집한 결과표는 아니다.

| 관찰한 응답 | 먼저 볼 곳 |
| --- | --- |
| 화면 주소가 서버의 404로 끝남 | 정적 서버의 fallback |
| 앱은 열리지만 `/call`에서 `/main`으로 이동 | 인증 상태와 `CallScreenArguments` |
| API 응답이 200인데 내용은 HTML | `/api/` 분기와 백엔드에 전달한 경로 |
| 재배포 뒤에도 예전 API로 요청 | 빌드 인자와 브라우저의 이전 자산 |

로그인 콜백은 문서가 열리는 것과 일회용 코드를 API에서 교환하는 것이 모두 필요하다. SSE는 연결 성공 뒤에도 이벤트가 바로 도착하는지 봐야 한다. `docs/nginx-configuration-guide.md`는 매칭·통화 이벤트 경로에 별도 location과 `proxy_buffering off`를 둔다. 컨테이너의 일반 `/api/` 분기만으로 모든 프록시 홉의 스트리밍 설정까지 확인한 것은 아니다.

마지막으로 새 탭과 배포 전부터 열려 있던 탭을 비교한다. 이전 탭은 옛 자산을 요청할 수 있다. 현재 빌드의 `--pwa-strategy=none`도 과거 브라우저에 등록된 서비스 워커를 자동으로 없애지는 않는다.

`/call`에서 `/main`으로 이동했다면 Nginx부터 고칠 일은 아니다. 시작 문서는 이미 도착했다. 이제 확인할 것은 그 화면에 넘긴 상태다.

## 참고 자료

- [Flutter 웹 배포](https://docs.flutter.dev/deployment/web)
- [Flutter 웹 URL 전략](https://docs.flutter.dev/ui/navigation/url-strategies)
- [Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

확인한 파일: `Dockerfile.frontend`, `frontend/lib/src/core/config/env.dart`, `web_runtime_setup_web.dart`, `app_router.dart`, `app_routes.dart`, `app_router_test.dart`, `docs/nginx-configuration-guide.md`. 2026-10-10 실행한 VoiceLink `1704b46`의 해당 파일은 `b159c1d`와 동일하다. Flutter 3.38.3의 라우터 테스트 결과이며, 운영 서버의 Nginx 원문이나 배포 후 HTTP 응답까지 확인한 글은 아니다.
