---
title: MPProgressLinear
order: 6
---

# MPProgressLinear

<p class="mp-lede">채워지는 바이고, 세 진행 표시기 중 일꾼입니다. 얼마나 남았는지를 한눈에 보여주는 것은 이것뿐입니다. 길이는 읽는 사람이 세지 않고 비교할 수 있는 유일한 양이기 때문입니다.</p>

<Demo src="progress-linear/hero" :minHeight="120" />

::: fw react

```tsx
import { MPProgressLinear } from 'material-plus-ui';

<MPProgressLinear label="업로드 중" value={progress} showValue />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPProgressLinear(label: const Text('업로드 중'), value: progress, showValue: true);
```

:::

## Props

<PropsTable name="MPProgressLinear" />

## `value`의 기본값이 `null`이고, 그것이 핵심입니다

`null`은 indeterminate입니다. 무언가 일어나고 있는데 얼마나 남았는지는 아무도 모르는 경우입니다. 값을 듣지 못한 표시기는 빈 바를 그릴 것이 아니라 모른다고 말해야 합니다. 빈 바는 진행이 전혀 없었다는 주장입니다.

[MPProgressCircular](./progress-circular)와 [MPProgressBox](./progress-box)도 마찬가지입니다. 셋은 한 컴포넌트의 세 가지 모양이고, `null`은 셋 모두에서 같은 뜻이어야 합니다.

## 예시

### value, min, max

비율은 clamp됩니다. 방어적 프로그래밍을 위한 방어가 아닙니다. `value`는 대개 어딘가의 나눗셈에서 오고, 요청 하나가 두 번 끝났다고 140% 너비로 그려지는 바는 가득 찬 채로 있는 바보다 나쁜 버그입니다.

::: fw react

```tsx
<MPProgressLinear value={3} min={0} max={4} showValue />
```

:::

::: fw flutter

```dart
const MPProgressLinear(value: 3, max: 4, showValue: true);
```

:::

### showValue와 format

::: fw react

`format`이 없으면 값은 `min`…`max`의 백분율입니다. 아무도 설명하지 않은 범위에 대해 성립하는 유일한 표기이고 — Base UI 자신의 기본값인 `${value}%`는 4단계 중 3단계를 "3%"라고 읽습니다.

`format`은 `Intl.NumberFormat` 옵션을 받으므로 바이트나 통화도 됩니다.

```tsx
<MPProgressLinear
  value={bytes}
  max={total}
  showValue
  format={{ style: 'unit', unit: 'megabyte' }}
/>
```

:::

::: fw flutter

`formatValue`가 없으면 값은 `min`…`max`의 백분율입니다. 아무도 설명하지 않은 범위에 대해 성립하는 유일한 표기입니다. 4단계 중 3단계를 "3%"라고 하는 것은 아무 말도 하지 않는 것보다 나쁩니다.

`formatValue`는 범위 안으로 clamp된 값을 받아 글을 돌려주는 함수이므로 바이트나 통화도 됩니다.

```dart
MPProgressLinear(
  value: bytes,
  max: total,
  showValue: true,
  formatValue: (double value) => '${value.round()} MB',
);
```

:::

### size

홈의 두께이고, 여기서 `size`가 건드리는 것은 그것뿐입니다 — 바 안에는 크기를 잴 라벨이 없습니다. `md`가 MD3의 4dp입니다.

<Demo src="progress-linear/sizes" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/progress-linear/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_linear/sizes.dart

:::

</Demo>

### color

진행 표시는 계열의 강조 색이고, 홈은 12%의 `on-surface`입니다. 하나의 칠이 두 스킴 모두에서 네 강조 색 아래로 읽혀야 하는데, 고정된 중립색은 그것을 주고 계열별 container 톤은 주지 못합니다.

## 접근성

::: fw react

- `role="progressbar"`, 값과 범위 속성, `aria-valuetext`, indeterminate일 때 값을 아예 떼는 것은 Base UI가 가집니다.
- `label`이 바의 이름이 됩니다. 없다면 재고 있는 대상에서 이름을 가져오세요.
- indeterminate 스윕은 `prefers-reduced-motion`에서 멈추고, 가득 찬 프레임이 아니라 부분 프레임에서 쉽니다. 멈춘 표시기가 끝난 표시기로 읽혀서는 안 됩니다.

:::

::: fw flutter

- 표시기는 병합된 시맨틱 노드 하나입니다. 그래서 라벨과 도형이 이름 없는 표시기 옆에 이름이 떠 있는 것이 아니라 함께 읽힙니다.
- 값이 있으면 프로그레스 바 역할과 값, 범위를 답니다. 그 값은 `showValue`가 그리는 문자열과 같고, `formatValue`가 따로 말하지 않으면 범위의 백분율입니다. 그려진 문자열은 다시 읽히지 않습니다.
- 값이 없으면 값이 아예 없는 로딩 스피너입니다. 그래야 플랫폼이 0이 아니라 불확정 진행이라고 알립니다.
- `hideLabel`은 라벨을 노드에는 남기고 화면에서는 너비도 높이도 차지하지 않게 뺍니다.
- `label`이 바의 이름이 됩니다. 없다면 재고 있는 대상에서 이름을 가져오세요.
- `MediaQuery.disableAnimations`가 켜져 있으면 스윕이 멈추고, 처음부터 이어진 부분 바에서 쉽니다. 가득 찬 바에서 쉬지는 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(double)` | 프레임워크에는 `Intl.NumberFormat`이 없고, 그것을 위해 `package:intl`을 끌어오는 것은 사용하는 쪽 대신 의존성을 결정하는 일입니다. 범위 안으로 clamp된 값을 받습니다. |
| `locale` | — | `Intl`에 숫자를 쓸 언어를 알려 주는 것이 전부였습니다. `formatValue`는 원하는 언어로 씁니다. |
| `label: ReactNode`, `value: number \| null` | `label: Widget?`, `value: double?` | 같은 것을 부르는 Dart의 이름입니다. |
| `aria-valuetext`가 붙은 `role="progressbar"` | 프로그레스 바 역할과 값, 범위를 가진 노드 | 세 숫자는 같습니다. `formatValue`가 숫자나 백분율이 아닌 글, 예를 들어 `2.1 GB`를 쓰면 역할 없이 노드의 값으로만 말합니다. 프레임워크는 프로그레스 바에 그 둘만 받습니다. |
| 화면 밖으로 스크롤되면 반복을 멈춥니다 | 위젯이 만들어져 있는 동안 반복합니다 | 지연 생성 목록은 스크롤되어 나간 것을 폐기하고, 꺼진 `TickerMode`(다른 라우트 뒤에 있는 화면)가 반복을 멈춥니다. |
| `className`, `style` | — | 넘겨줄 곳이 없습니다. |

바는 React 빌드의 `w-full`처럼 주어진 너비를 채웁니다. 그래서 `Row` 안에서는 `Expanded`로 감쌉니다.

:::

## 함께 보기

- [MPProgressCircular](./progress-circular) — 바를 놓을 자리가 없을 때의 같은 값.
- [MPProgressBox](./progress-box) — 진짜로 단계가 있는 일에.
