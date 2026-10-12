---
post_id: 919
title: async 함수가 긴 JSON 파싱을 대신해 주지는 않는다
description: 작은 JSON 파싱 실험으로 async의 실행 순서와 compute의 역할을 비교하고, 네이티브와 웹에서 달라지는 실행 위치를 설명한다.
date: '2026-06-23'
revised: '2026-10-12'
url: https://so-dak.com/%eb%aa%a8%eb%b0%94%ec%9d%bc-%ec%b5%9c%ec%a0%81%ed%99%94-flutter-isolate%eb%a1%9c-ui-%eb%b2%84%eb%b2%85%ec%9e%84jank-%ed%95%b4%ea%b2%b0-%eb%b0%8f-60fps-%eb%8b%ac%ec%84%b1/
---

JSON 파싱 함수에 `async`를 붙이면 긴 계산도 화면 밖에서 돌아갈까? Flutter 3.38.3·Dart 3.10.1에서 작은 예제로 실행 순서를 확인했다. VoiceLink에 도입한 기능이 아닌 독립 학습 실험이다.

함수 앞뒤에 표시를 넣었다. 테스트의 핵심 부분이다.

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

2026-10-10 Linux에서 실행한 결과는 `before → decode → after`였다. 호출부가 다음 줄로 가기 전에 `jsonDecode`가 실행됐다. `Future`를 반환해도 계산은 여전히 호출한 isolate에서 동기적으로 진행된다. **`async`를 붙였다고 계산을 맡아 줄 작업자가 생긴 것은 아니었다.**

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

잘못된 입력을 빈 목록으로 바꾸지 않았다. “항목이 없다”와 “응답 형식이 틀렸다”를 호출부가 구분할 수 있게 한 것이다. 계산을 옮겨도 결과와 오류를 처리할 책임은 남는다.

## 같은 compute인데 웹에서는 다르다

[Flutter의 compute API](https://api.flutter.dev/flutter/foundation/compute.html)는 실행 환경을 구분한다.

| 환경 | 콜백이 실행되는 곳 |
| --- | --- |
| 네이티브 | 별도 isolate |
| 웹 | 현재 이벤트 루프 |

네이티브에서는 계산을 다른 isolate로 옮길 수 있다. 반면 웹은 `compute`를 써도 긴 계산이 화면과 같은 이벤트 루프를 차지한다. 코드 한 줄을 바꿨다는 이유로 두 환경 모두에서 버벅임이 줄었다고 할 수는 없다.

작은 입력은 계산보다 isolate를 시작하고 데이터를 전달하는 비용이 더 클 수도 있다. 이번 네 테스트가 확인한 것도 실행 순서와 반환값·오류이지, 프레임 개선은 아니다. 실제로 옮길 계산은 같은 입력의 처리 시간과 UI 프레임을 비교해 골라야 한다.

파싱을 오래 한다면 먼저 볼 것은 함수 앞의 `async`가 아니라 **계산이 실행되는 자리**다. `Future`를 돌려주는 함수와 다른 isolate에서 일하는 함수는 같은 뜻이 아니다.

## 참고 자료

- [Flutter의 concurrency와 isolates](https://docs.flutter.dev/perf/isolates)
- [Flutter compute API](https://api.flutter.dev/flutter/foundation/compute.html)
- [Flutter 성능 프로파일링](https://docs.flutter.dev/perf/ui-performance)

실험 근거: 2026-10-10 Linux·Flutter 3.38.3·Dart 3.10.1에서 실행 순서 하나와 `compute` 입력 세 개, 총 네 테스트가 통과했다. 웹 실행과 UI 프레임은 측정하지 않았다. 2026-10-12 대조한 VoiceLink `37109d5`의 `frontend/lib`·`frontend/test`에는 `compute`나 `Isolate.run` 사용이 없다.
