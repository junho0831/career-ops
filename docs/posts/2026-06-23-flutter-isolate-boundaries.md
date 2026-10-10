---
post_id: 919
title: async 함수가 긴 JSON 파싱을 대신해 주지는 않는다
description: async 함수의 실행 순서와 JSON 파싱 compute 예제를 직접 시험하고, 네이티브·웹의 실행 차이와 오래된 결과 처리를 구분한다.
date: '2026-06-23'
revised: '2026-10-10'
url: https://so-dak.com/%eb%aa%a8%eb%b0%94%ec%9d%bc-%ec%b5%9c%ec%a0%81%ed%99%94-flutter-isolate%eb%a1%9c-ui-%eb%b2%84%eb%b2%85%ec%9e%84jank-%ed%95%b4%ea%b2%b0-%eb%b0%8f-60fps-%eb%8b%ac%ec%84%b1/
---

서버 응답을 받은 뒤 JSON을 오래 파싱한다면, 그 시간을 어디에서 쓰고 있는지 봐야 한다. 함수 앞에 `async`를 붙이는 것만으로 계산을 화면 밖으로 옮길 수 있을까?

VoiceLink `b159c1d`의 Flutter 클라이언트에는 `compute`나 `Isolate.run`을 도입한 코드가 없다. 따라서 프로젝트에서 프레임을 개선한 사례로 쓸 근거는 없었다. 대신 Flutter 3.38.3·Dart 3.10.1에서 아래 학습용 예제를 실행해, `async`와 계산을 나눠 맡기는 동작의 차이를 확인했다.

```dart
Future<Object?> decodeLater(String source) async {
  return jsonDecode(source);
}
```

`jsonDecode`는 여전히 호출한 isolate에서 동기적으로 계산한다. 반환형만 `Future`가 됐다. 기다리는 방법을 바꾼 것과 일을 나눠 맡긴 것은 달랐다.

실행 순서를 보기 위해 함수 앞뒤에 표시를 넣었다. 다음은 직접 실행한 테스트다. 큰 JSON이나 성능 측정 없이, 계산이 언제 시작되는지만 본다.

```dart
final order = <String>[];

Future<Object?> decodeLater(String source) async {
  order.add('decode');
  return jsonDecode(source);
}

order.add('before');
final result = decodeLater('[{"id":1}]');
order.add('after');
expect(order, ['before', 'decode', 'after']);
expect(await result, [{'id': 1}]);
```

2026-10-10 Linux에서 다시 실행해도 순서는 `before → decode → after`였다. 호출부가 `Future`를 받아 다음 줄로 가기 전에 파싱부터 시작했다. 이 함수에는 기다리며 실행권을 넘기는 `await`가 없으니, `async`라는 이름만으로 긴 계산이 화면 밖으로 이동하지 않는다.

## 옮길 계산부터 작은 함수로 만든다

예를 들어 `[{"id": 1}, {"id": 2}]`를 받아 `[1, 2]`를 만드는 함수라면 입력과 결과가 분명하다. 화면 상태나 네트워크 요청은 이 함수가 알 필요가 없다.

```dart
import 'dart:convert';
import 'package:flutter/foundation.dart';

List<int> parseItemIds(String source) {
  final decoded = jsonDecode(source);
  if (decoded is! List) {
    throw const FormatException('Expected a list');
  }
  return decoded.map((item) {
    if (item is! Map || item['id'] is! int) {
      throw const FormatException('Expected an integer id');
    }
    return item['id'] as int;
  }).toList(growable: false);
}

Future<List<int>> parseItemIdsAsync(String source) {
  return compute(parseItemIds, source, debugLabel: 'parse-item-ids');
}
```

이 함수는 문자열을 받아 ID 목록을 돌려주고, 잘못된 입력은 `FormatException`으로 알린다. 계산만 분리했으므로 호출부가 로딩·성공·오류 화면을 결정할 수 있다.

같은 함수를 네이티브 Flutter 테스트에서 `compute`로 호출해 세 입력을 확인했다.

| 입력 | 테스트에서 확인한 결과 |
| --- | --- |
| `[{"id":1},{"id":2}]` | `[1, 2]` 반환 |
| `{"id":1}` | 목록이 아니므로 `FormatException` 전달 |
| `[{"id":"1"}]` | ID가 정수가 아니므로 `FormatException` 전달 |

이 세 입력도 같은 재실행에서 통과했다. 오류를 빈 목록으로 바꾸지 않았으므로 “항목이 없다”와 “응답 형식이 잘못됐다”를 호출부가 구분할 수 있다. 확인한 것은 결과와 오류 전달이며, 파싱 시간이나 화면 프레임을 측정한 결과는 아니다.

**실행 장소를 바꾸기 전에 계산의 입력과 출력을 분리하는 것**이 먼저다. `BuildContext`나 변경 가능한 화면 상태까지 넘기면 전달할 데이터와 수명을 함께 고민해야 한다.

## 웹에서도 별도 isolate일까

| 환경 | compute의 콜백 실행 | 별도로 확인할 것 |
| --- | --- | --- |
| 네이티브 | 별도 isolate에서 계산 | 시작·전달 비용과 UI 프레임 |
| 웹 | 현재 이벤트 루프에서 계산 | 긴 계산의 점유와 입력 크기 |

Flutter 공식 API가 구분하는 실행 방식이다. 네이티브의 별도 isolate를 기대하고 웹에 그대로 적용하면, 긴 파싱이 여전히 화면과 같은 이벤트 루프를 차지한다.

같은 API를 썼다고 비용까지 같아지지는 않는다. 네이티브에서는 계산을 옮기는 이득과 전달 비용을 비교하고, 웹에서는 먼저 파싱할 데이터를 줄이거나 작업을 나눌 수 있는지 살펴봐야 한다.

## 늦게 끝난 첫 검색이 두 번째 결과를 덮으면

계산을 분리한 뒤에는 결과를 적용하는 쪽도 살펴봐야 한다. 사용자가 “서울”을 검색했다가 “부산”으로 바꿨는데 서울의 파싱이 나중에 끝나면, 오래된 결과가 새 화면을 덮을 수 있다.

계산이 어디서 실행됐든, 오래된 결과를 지금 화면에 쓰면 틀린다. 다음은 화면이 가진 `latestRequestId`와 결과·오류 상태를 이용하는 설명용 발췌다. 실제 프로젝트에 추가한 검색 기능은 아니다.

```dart
final requestId = ++latestRequestId;
try {
  final result = await parseItemIdsAsync(source);
  if (!mounted || requestId != latestRequestId) return;
  setState(() {
    itemIds = result;
    errorMessage = null;
  });
} catch (error) {
  if (!mounted || requestId != latestRequestId) return;
  setState(() => errorMessage = error.toString());
}
```

`mounted`는 화면이 남아 있는지, 요청 번호는 **아직 최신 입력의 결과인지** 확인한다. 옛 요청의 오류도 같은 기준으로 걸러야 최신 성공 화면을 덮지 않는다. 제한 시간이 끝났다는 것 역시 계산 자체의 중단을 뜻하지는 않는다.

이 구분은 isolate에만 필요한 일이 아니다. VoiceLink의 [통화 연결 코드](https://so-dak.com/webrtc-livekit-%ec%97%b0%eb%8f%99-%ed%9a%8c%ea%b3%a0-%ea%b7%b8%eb%83%a5-%ec%98%a4%ed%94%88%ec%86%8c%ec%8a%a4-%ec%84%9c%eb%b2%84-%eb%9d%84%ec%9a%b0%eb%a9%b4-%eb%90%98%eb%8a%94-%ea%b1%b0-%ec%95%84/)도 시도 번호로 늦은 결과를 거른다. 계산을 다른 곳으로 옮기는 일과 끝난 결과를 현재 작업에 적용하는 일은 각각 처리해야 한다.

작은 입력에서는 계산을 옮기는 준비 비용이 더 클 수도 있다. 따라서 `compute`를 붙이는 것 자체가 목표는 아니다. 같은 입력으로 UI 프레임과 전체 처리 시간을 비교한 뒤, 화면을 막는 계산만 옮길 이유가 생긴다.

## 참고 자료

- [Flutter의 concurrency와 isolates](https://docs.flutter.dev/perf/isolates)
- [Flutter compute API](https://api.flutter.dev/flutter/foundation/compute.html)
- [Dart Isolate.run API](https://api.dart.dev/dart-isolate/Isolate/run.html)
- [Flutter 성능 프로파일링](https://docs.flutter.dev/perf/ui-performance)

검증: 2026-10-10 Linux·Flutter 3.38.3·Dart 3.10.1에서 본문의 실행 순서와 `compute` 입력 세 개, 총 네 테스트를 재현했다. 웹 실행과 UI 프레임 측정은 하지 않았다. 프로젝트 대조 범위는 VoiceLink `1704b46`의 `frontend/lib`, `frontend/test`, `pubspec.lock`이며, 이 글에서 다룬 연결 코드와 테스트는 `b159c1d`와 동일하다. 위 파싱 코드는 프로젝트에 도입한 기능이 아니라 독립 학습 예제다.
