---
post_id: 919
title: async 함수가 긴 JSON 파싱을 대신해 주지는 않는다
description: 작은 JSON 파싱 실험으로 async의 실행 순서와 compute의 역할을 비교하고, 네이티브와 웹에서 달라지는 실행 위치를 설명한다.
date: '2026-06-23'
evidence_review: 'VoiceLink 46282d5 (2026-11-01)'
revised: '2026-11-06'
url: https://so-dak.com/%eb%aa%a8%eb%b0%94%ec%9d%bc-%ec%b5%9c%ec%a0%81%ed%99%94-flutter-isolate%eb%a1%9c-ui-%eb%b2%84%eb%b2%85%ec%9e%84jank-%ed%95%b4%ea%b2%b0-%eb%b0%8f-60fps-%eb%8b%ac%ec%84%b1/
---

`async`를 붙이면 긴 JSON 파싱도 다른 곳에서 실행될까? Dart의 `async` 함수는 첫 `await`까지 동기적으로 실행한다. 아래 함수에는 `await`가 없어서 `jsonDecode`를 끝내기 전에는 호출한 쪽의 다음 줄로 넘어가지 않는다. [Dart의 async 실행 규칙](https://dart.dev/language/async)

`Future`는 나중에 결과나 오류를 받는 통로다. 그 반환 타입만으로 새 isolate가 만들어지는 것은 아니다. 이 실행 순서를 작은 테스트로 확인했다.

Flutter 3.38.3·Dart 3.10.1의 독립 학습 실험이다. VoiceLink에 도입한 기능이나 프레임 개선 결과는 아니다.

아래 테스트는 파싱 호출 전후에 표시를 넣어 실행 순서를 확인한다.

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

2026-10-10 Linux에서 이 검증이 통과했다. `Future`를 반환해도 여기의 `jsonDecode`는 호출한 isolate에서 동기적으로 진행된다.

예를 들어 `await`로 응답 다운로드를 기다렸다고 하자. 기다림이 끝난 뒤 큰 JSON을 파싱하는 일까지 자동으로 다른 곳에 맡겨지지는 않는다. **네트워크를 기다리는 시간과 데이터를 계산하는 시간은 나눠 봐야 한다.**

## 계산만 따로 맡겨 본다

이번에는 `[{"id":1},{"id":2}]`에서 ID 목록을 만드는 함수를 분리했다. 문자열을 받아 목록을 돌려주므로 화면 상태를 넘길 필요가 없다.

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

`compute`에 넘긴 것도 계산 함수와 입력 문자열뿐이다. 같은 날 네이티브 Flutter 테스트에서 다음 세 입력을 확인했다.

| 입력 | 확인한 결과 |
| --- | --- |
| `[{"id":1},{"id":2}]` | `[1, 2]` 반환 |
| `{"id":1}` | 목록이 아니므로 `FormatException` |
| `[{"id":"1"}]` | ID가 정수가 아니므로 `FormatException` |

ID가 `"1"`이면 숫자로 슬쩍 바꾸지 않고 오류를 낸다. 빈 목록을 돌려주면 “항목이 없는 정상 응답”과 구분할 수 없기 때문이다. 계산 장소를 옮겨도 입력을 검사하는 일은 남는다.

## 같은 compute인데 웹에서는 다르다

[Flutter의 compute API](https://api.flutter.dev/flutter/foundation/compute.html)는 실행 환경을 구분한다.

| 환경 | 콜백이 실행되는 곳 |
| --- | --- |
| 네이티브 | 별도 isolate |
| 웹 | 현재 이벤트 루프 |

네이티브의 `compute`는 콜백과 입력을 별도 isolate에서 처리하고 결과를 돌려준다. 주 isolate가 그 계산을 직접 수행하는 시간을 줄일 수 있지만, isolate 시작과 데이터 전달 비용이 생긴다. 웹에서는 콜백이 현재 이벤트 루프에서 실행되므로 같은 호출이 계산의 병렬 실행을 뜻하지는 않는다.

작은 입력은 계산보다 isolate를 시작하고 데이터를 전달하는 비용이 더 클 수도 있다. 이번 네 테스트가 확인한 것도 실행 순서와 반환값·오류이지, 프레임 개선은 아니다. 실제로 옮길 계산은 같은 입력의 처리 시간과 UI 프레임을 비교해 골라야 한다.

[테스트 코드 ZIP](https://so-dak.com/wp-content/uploads/2026/11/flutter-isolate-example-20261104.zip)을 풀고 `flutter-isolate` 폴더에서 실행할 수 있다.

```bash
flutter test
```

2026년 11월 4일 Flutter 3.38.3·Dart 3.10.1에서 배포 ZIP의 네 테스트를 다시 실행해 모두 통과했다. 별도 앱이나 기기 없이 실행 순서와 입력 검사를 재현하는 예제다.

## 참고 자료

- [Flutter의 concurrency와 isolates](https://docs.flutter.dev/perf/isolates)
- [Flutter compute API](https://api.flutter.dev/flutter/foundation/compute.html)
- [Flutter 성능 프로파일링](https://docs.flutter.dev/perf/ui-performance)

실험 근거: 2026-10-10 Linux·Flutter 3.38.3·Dart 3.10.1에서 실행 순서 하나와 `compute` 입력 세 개, 총 네 테스트가 통과했다. 웹 실행과 UI 프레임은 측정하지 않았다. 2026-10-12 대조한 VoiceLink `37109d5`의 `frontend/lib`·`frontend/test`에는 `compute`나 `Isolate.run` 사용이 없다.
