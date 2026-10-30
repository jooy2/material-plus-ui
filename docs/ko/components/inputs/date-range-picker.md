---
title: MPDateRangePicker
order: 3
---

# MPDateRangePicker

<p class="mp-lede">두 날 사이의 구간. 달을 넘나드는 범위가 예외가 아니라 일반적인 경우이고, 한 달짜리 피커는 그걸 탐색 문제로 만들기 때문에 두 달을 나란히 보여 줍니다.</p>

<Demo src="date-range-picker/hero" :minHeight="120" />

::: fw react

```tsx
import { MPDateRangePicker } from 'material-plus-ui';

const [stay, setStay] = useState({ start: null, end: null });

<MPDateRangePicker
  label="숙박"
  startPlaceholder="체크인"
  endPlaceholder="체크아웃"
  value={stay}
  onValueChange={setStay}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPDateRangePicker(
  label: const Text('숙박'),
  startPlaceholder: '체크인',
  endPlaceholder: '체크아웃',
  value: stay,
  onChanged: (MPDateRange next) => setState(() => stay = next),
);
```

:::

## Props

<PropsTable name="MPDateRangePicker" />

## 값이 객체인 이유

::: fw react

`[Date, Date]` 튜플도 아니고 prop 두 개도 아닌 `{ start, end }`입니다.

:::

::: fw flutter

`DateTime` 두 개를 담은 리스트도 아니고 매개변수 두 개도 아닌 `MPDateRange(start:, end:)`입니다.

:::

범위는 **하나의 값**입니다. 한 번의 제스처로 고르고, 한 번의 제스처로 비우고, 통째로 검증됩니다. 그리고 두 이름은 호출자가 끝을 시작에 써 넣는 걸 막아 주는 장치입니다 — 튜플의 두 자리는 인덱스로만 구분됩니다.

절반짜리 범위는 실재하는 상태입니다. 첫 클릭과 두 번째 클릭 사이에 피커가 들고 있는 것이 그것입니다.

::: fw react

그래서 `onValueChange`는 항상 객체로 호출되고 `null`로는 호출되지 않습니다. 비운 범위는 `{ start: null, end: null }`이므로, 호출자가 "비었음"을 두 가지 모양으로 검사할 일이 없습니다.

:::

::: fw flutter

그래서 `onChanged`는 항상 범위로 호출되고 `null`로는 호출되지 않습니다. 비운 범위는 `MPDateRange.empty`이므로, 호출자가 "비었음"을 두 가지 모양으로 검사할 일이 없습니다.

:::

다만 절반 상태가 controlled 부모에게까지 가지는 _않습니다_. 첫 클릭은 컴포넌트 안에 붙들려 있고 부모는 끝이 비어 있는 시작만 받습니다. 폼이 다루는 건 범위이고, 버려진 절반의 선택은 팝업이 닫히면 남지 않습니다.

## 미리보기가 곧 어포던스입니다

한 번 클릭하고 포인터를 움직여 보세요. 두 번째 클릭이 도착하기 전에, 기준점과 포인터가 있는 곳 사이에 띠가 그려집니다.

그게 없으면 첫 클릭에는 눈에 보이는 결과가 아예 없고, 두 클릭 사이의 1초 남짓 동안 컨트롤은 고장 난 것처럼 보입니다. 범위 피커가 그리는 것 중 단연 가장 중요한 것입니다.

거꾸로 클릭하는 건 거부할 실수가 아닙니다. 같은 범위를 반대 순서로 입력한 것이고, 정규화됩니다.

## 두 패널은 하나의 달력입니다

왼쪽에는 앞으로 가는 버튼이 없고, 오른쪽에는 뒤로 가는 버튼이 없으며, 어느 헤더의 월·연도 버튼이든 **둘 다** 움직입니다. 빠진 버튼 자리에는 그 버튼 크기만큼의 빈 자리가 남아서, 두 제목이 같은 중심선에 놓입니다.

패널은 앞뒤 달의 날짜도 그리지 않는데, 여기가 범위 피커가 단일 피커와 다른 유일한 지점입니다. 둘 다 여섯 주를 꽉 채워 그리면 8월 1일이 7월 패널의 뒤쪽 날이면서 _동시에_ 8월 패널의 첫날이 됩니다. 한 팝업 안에 이름이 같은 칸이 둘이면 포인터에게는 모호하고 스크린 리더에게는 아예 망가진 것입니다.

## 띠의 색

양 끝은 강조 색 자체이고, 그 사이의 날들은 강조 색의 **컨테이너** 톤 위에 그 톤의 잉크입니다.

MD3가 선택된 범위에 쓰는 짝과 같고, 끝과 가운데를 구별되게 유지하는 것이 바로 이것입니다. 띠를 강조 색으로 그리면 9일짜리 범위가 따로따로 고른 9개의 날처럼 보입니다. 띠는 연속 구간의 가운데에서는 각지고 구간이 끝나는 곳에서만 둥글어져서, 띠가 걸린 한 주가 일곱 개의 토큰이 아니라 하나의 형태로 읽힙니다.

## 예시

### presets

달력 옆의 단축 범위 — 분석 필터가 실제로 요구받는 그것입니다.

::: fw react

```tsx
presets={[
  { label: '지난 7일', value: () => ({ start: daysAgo(6), end: today() }) },
  { label: '이번 달', value: () => ({ start: startOfMonth(), end: today() }) }
]}
```

범위가 오늘에 따라 달라진다면 — 거의 항상 그렇습니다 — **함수**로 넘기세요.

:::

::: fw flutter

```dart
presets: <MPDateRangePreset>[
  MPDateRangePreset.computed(
    label: const Text('지난 7일'),
    resolve: () => MPDateRange(start: daysAgo(6), end: today()),
  ),
  MPDateRangePreset.computed(
    label: const Text('이번 달'),
    resolve: () => MPDateRange(start: startOfMonth(), end: today()),
  ),
],
```

범위가 오늘에 따라 달라진다면(거의 항상 그렇습니다) `MPDateRangePreset.computed`를 쓰고, 움직이지 않는 범위라면 기본 생성자에 `value`를 넘기세요.

:::

모듈 스코프에서 한 번 계산한 "지난 7일"은, 탭을 켜 둔 채 밤을 넘긴 사람에게는 틀린 범위입니다.

### monthCount

기본은 `2`입니다. 좁은 레이아웃이거나 범위가 거의 항상 한 달 안에 있다면 `1`로 줄이세요.

::: fw react

```tsx
<MPDateRangePicker monthCount={1} />
```

:::

::: fw flutter

```dart
MPDateRangePicker(monthCount: 1)
```

:::

패널이 하나면 오른쪽 버튼이 돌아옵니다. 충돌할 두 번째 패널이 없으니까요.

### 트리거의 두 칸

어느 쪽도 트리거를 똑같이 나눠 갖지 않습니다. 똑같이 반씩 나누면 트리거가 둘 중 _짧은_ 쪽의 두 배로 잡혀서, "체크아웃" 같은 단어 옆의 날짜가 잘립니다. 각자 자기 너비를 갖게 두면 컨트롤이 실제로 말해야 하는 만큼의 크기가 됩니다. 각 칸은 자기가 보여 줄 수 있는 가장 긴 날짜 너비로 따로 열려 있어서, 범위를 채워 넣는 동안 어느 쪽도 튀지 않습니다.

### name

::: fw react

같은 이름의 hidden input 두 개라, 양 끝이 함께 도착합니다.

```js
const [start, end] = formData.getAll('stay');
```

:::

::: fw flutter

양 끝을 모두 고르면, 이름 아래에 ISO 8601 구간 하나를 피커를 감싼 [MPForm](./form)에 넘깁니다. `{'stay': '2026-07-03/2026-07-09'}`처럼요. 반쪽 범위는 `''`이라서, `required` 범위 피커는 범위가 온전해질 때까지 제출을 막습니다.

:::

양 끝은 모두 로컬 `YYYY-MM-DD`입니다. 이유는 [`MPDatePicker`](./date-picker) 쪽에 있습니다.

## 접근성

- 두 달력 모두 각자의 roving tab stop을 가진 격자이고, 단일 피커의 키보드 어휘 전부가 각각에서 동작합니다.
- 푸터가 다음 클릭이 어느 끝을 채울지 말해 줍니다. 트리거도 두 칸으로 같은 말을 하지만, 팝업이 떠 있는 동안 트리거는 _팝업 뒤에_ 있습니다. 그래서 읽힐 자리에서 그 말을 할 수 있는 건 푸터뿐입니다.

::: fw react

- 띠는 색만으로 전달되지 않습니다. 양 끝은 `aria-selected`이고, 모든 칸은 온전한 날짜로 이름 붙습니다.

:::

::: fw flutter

- 띠는 색만으로 전달되지 않습니다. 양 끝은 선택된 것으로 읽히고, 모든 칸은 온전한 날짜로 이름 붙습니다.

:::

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `{ start, end }` | `MPDateRange(start:, end:)` | `==`를 갖춘 Dart 클래스이고, 비운 범위는 `MPDateRange.empty`입니다. |
| 범위나 함수를 받는 프리셋의 `value` | `MPDateRangePreset(value:)`와 `MPDateRangePreset.computed(resolve:)` | Dart에서는 한 필드가 두 가지 타입일 수 없습니다. |
| 노드로 받는 프리셋의 `label` | `Widget` | 보통 `Text`입니다. |
| `onValueChange`, `defaultValue`, `defaultOpen` | `onChanged`, `initialValue`, `initialOpen` | Flutter의 이름입니다. |
| `format` (`Intl.DateTimeFormatOptions`) | `format` (`String Function(DateTime)`) | 옵션을 넘길 `Intl`이 없습니다. |
| `name` 아래의 hidden input 두 개 | `MPForm`에 등록하는 구간 하나 | Flutter에는 native 폼이 없고, 맵은 이름 하나에 값 하나입니다. |
| `Intl`에 닿는 `locale` | 패키지의 표에 닿는 `locale`, 그리고 `names` | [MPDatePicker의 현지화](./date-picker#현지화)를 보세요. |
| 원시 DOM 이벤트, `id`, `className`, `style` | `onKeyEvent`, `onFocusChange`, `semanticLabel`, `focusNode`, `autofocus` | [MPDatePicker](./date-picker#react-빌드와-다른-점)와 같습니다. |

프리셋 목록 옆에 놓인 두 달은 세로로 든 휴대폰보다 넓습니다. 팝업은 화면 밖으로 넘치지 않고 시트 안에서 스크롤되지만, 좁은 레이아웃에는 `monthCount: 1`이 더 나은 답입니다. 나머지는 일부러 맞췄습니다. 미리보기, 함께 움직이는 두 패널, 띠의 색, 푸터의 안내가 그렇습니다.

:::

## 함께 보기

- [MPDatePicker](./date-picker) — 하루. 공유되는 달력 동작 전부가 거기 있습니다.
- [현지화](../../design/localization) — `locale`이 닿는 곳.
