---
title: MPMeter
order: 14
---

# MPMeter

<p class="mp-lede">미리 알려진 눈금 위에서 무언가가 얼마나 있는지 — 쓴 디스크, 찬 좌석, 소진한 할당량, 비밀번호의 강도. 프로그레스 바처럼 보이지만 다른 것을 뜻합니다.</p>

<Demo src="meter/hero" :minHeight="200" />

::: fw react

```tsx
import { MPMeter } from 'material-plus-ui';

<MPMeter value={41} max={60} label="Seats taken" showValue />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPMeter(value: 41, max: 60, label: const Text('Seats taken'), showValue: true);
```

:::

## Props

<PropsTable name="MPMeter" />

## 프로그레스 바가 아닙니다

프로그레스 바는 **시간**에 관한 것입니다. 무언가가 벌어지고 있고, 여기까지 왔으며, 아직 값이 없을 수도 있고, 스스로 움직일 것으로 기대됩니다.

미터는 **양**에 관한 것입니다. 숫자는 이미 알려져 있고, 재는 대상이 변하지 않는 한 움직이지 않으며, 이 수치가 나쁘다고 말하는 것이 뜻을 가집니다. `thresholds`가 그것을 위한 것이고, 프로그레스 바에는 쓸 데가 없는 것입니다. 94% 찬 디스크는 94% 끝난 디스크가 아닙니다.

::: fw react

그래서 둘은 다른 ARIA role을 답니다. 스크린 리더가 미터를 진행 중인 무언가가 아니라 측정값으로 읽습니다. 둘 중 잘못 고르는 것은 스타일의 실수가 아니라 그 숫자가 무엇을 뜻하는지에 대한 주장입니다.

:::

::: fw flutter

그래서 둘은 스크린 리더에 다르게 말합니다. Flutter에는 미터 역할이 없으므로, 미터는 이름과 값을 가진 노드 하나일 뿐이고 프로그레스 바는 프로그레스 바 역할을 답니다. 여기서 그 역할을 달면 미터가 아닌 바로 그것이라고 알리게 됩니다. 둘 중 잘못 고르는 것은 스타일의 실수가 아니라 그 숫자가 무엇을 뜻하는지에 대한 주장입니다.

:::

`value`가 여기서는 필수이고 [MPProgressLinear](./progress-linear)에서는 선택인 이유도 그것입니다. 불확정 미터라는 것은 없습니다. 아무도 모르는 양은 그릴 양이 아닙니다.

## `thresholds`는 색이 아니라 역할을 지목합니다

::: fw react

```tsx
<MPMeter
  value={94}
  label="Quota spent"
  thresholds={[
    { from: 60, color: 'tertiary' },
    { from: 85, color: 'error' }
  ]}
/>
```

:::

::: fw flutter

```dart
const MPMeter(
  value: 94,
  label: Text('Quota spent'),
  thresholds: <MPThreshold>[
    MPThreshold(from: 60, color: MPColor.tertiary),
    MPThreshold(from: 85, color: MPColor.error),
  ],
);
```

:::

`from`은 백분율이 아니라 그 미터 자신의 눈금 위의 값입니다. 0–5 GB를 재는 미터라면 `3`과 `4.5`에 띠를 둡니다.

계열은 MD3의 네 가지이고, 그중 `warning`이라는 것은 없습니다. 호박색 띠는 페이지가 테마로 삼은 소스 색에서 나온 `tertiary`이고, 이것은 한계가 아니라 정직한 답입니다. 색 이름을 적는 threshold는 테마를 무시하는 색이 되고, 하필 한눈에 읽히는 것이 존재 이유인 컴포넌트에서 그렇게 됩니다.

값이 지나온 threshold 중 마지막 것이 이깁니다. 그래서 작은 것부터 적고, 목록은 정렬되지 않고 적힌 순서 그대로 읽힙니다. 순서를 거꾸로 적은 호출부는 그 사실이 드러납니다.

## `format`은 여기서 더 중요합니다

없으면 값은 범위에 대한 비율로 읽힙니다. 아무도 설명하지 않은 범위에 대해 정직한 표기는 그것뿐입니다. 하지만 미터에는 대개 진짜 단위가 있습니다. 좌석 60개 중 41개, 5 GB 중 2.1 GB, 500파운드 예산 중 340파운드. 독자가 보러 온 것이 그것입니다.

::: fw react

```tsx
<MPMeter value={2.1} max={5} showValue format={{ style: 'unit', unit: 'gigabyte' }} />
```

`Intl.NumberFormat` 옵션을 받으므로 바이트도 통화도 평범한 개수도 되고, 플랫폼이 설정된 로케일로 쓰입니다.

:::

::: fw flutter

```dart
MPMeter(
  value: 2.1,
  max: 5,
  showValue: true,
  formatValue: (double value) => '${value.toStringAsFixed(1)} GB',
);
```

`formatValue`는 값을 받아 글을 돌려주는 함수이고, 값을 그대로 받습니다. 앱에서 이미 숫자를 쓰는 도구가 무엇이든, `package:intl`의 `NumberFormat`이든 직접 만든 함수든 이 값도 쓸 수 있고, 스크린 리더도 같은 문자열을 듣습니다.

:::

## 수치는 이동합니다

값이 바뀌면 채움이 뛰지 않고 그리로 흘러가고, threshold를 넘으면 같은 짧은 시간 동안 계열이 바뀝니다. `prefers-reduced-motion`, Flutter에서는 `MediaQuery.disableAnimations`가 켜져 있으면 둘 다 멈추고 새 수치가 그냥 나타납니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `role="meter"` | 이름과 값을 가진 노드, 역할 없음 | Flutter에는 미터 역할이 없고, 프로그레스 바 역할은 틀린 말을 합니다. |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(double)` | 프레임워크에는 `Intl.NumberFormat`이 없고, 그것을 위해 `package:intl`을 끌어오는 것은 사용하는 쪽 대신 의존성을 결정하는 일입니다. |
| `locale` | — | `Intl`에 숫자를 쓸 언어를 알려 주는 것이 전부였습니다. `formatValue`는 원하는 언어로 씁니다. |
| `label: ReactNode`, `value: number` | `label: Widget?`, `value: double` | 같은 것을 부르는 Dart의 이름입니다. |
| `className`, `style`, 네이티브 속성 | — | 넘겨줄 곳이 없습니다. |

미터는 React 빌드의 `w-full`처럼 주어진 너비를 채웁니다. 그래서 `Row` 안에서는 `Expanded`로 감쌉니다.

:::
