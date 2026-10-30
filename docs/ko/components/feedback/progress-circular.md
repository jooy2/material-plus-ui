---
title: MPProgressCircular
order: 7
---

# MPProgressCircular

<p class="mp-lede">채워지는 링이고, 바를 놓을 자리가 없는 곳 — 버튼 안, 표 행 끝, 필드 옆 — 에서 집게 되는 것입니다.</p>

<Demo src="progress-circular/hero" :minHeight="100" />

::: fw react

```tsx
import { MPProgressCircular } from 'material-plus-ui';

<MPProgressCircular label="동기화 중" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPProgressCircular(label: Text('동기화 중'));
```

:::

## Props

<PropsTable name="MPProgressCircular" />

## 값은 링 안이 아니라 옆에 놓입니다

다이얼 한가운데의 숫자는 누구나 이 컴포넌트에 대해 갖고 있는 그림이지만, 다섯 크기 중 둘에서만 통합니다. `xs`에서 링은 스물네 픽셀이고 "40%"가 들어갈 자리가 없습니다. 옆에 두면 모든 크기에서 읽힙니다.

## 예시

### size

`md`가 MD3의 48dp이고, 모든 단계가 같은 이름의 컨트롤 높이 안에 들어갑니다 — 56px 필드 안의 48px 링 — 그래서 버튼이나 필드, 표 행에 넣어도 행이 원래보다 높아지지 않습니다.

<Demo src="progress-circular/sizes" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/progress-circular/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_circular/sizes.dart

:::

</Demo>

### value

기본값인 `null`은 링을 채우는 대신 돌립니다. 값이 있으면 링은 멈추고 틈이 닫힙니다.

::: fw react

```tsx
<MPProgressCircular /> // indeterminate
<MPProgressCircular value={70} /> // 열에 일곱만큼 돈 상태
```

:::

::: fw flutter

```dart
const MPProgressCircular(); // indeterminate
const MPProgressCircular(value: 70); // 열에 일곱만큼 돈 상태
```

:::

### showValue와 format

[MPProgressLinear](./progress-linear)가 받는 것과 같은 두 prop, `showValue`와 `format`(Flutter에서는 `formatValue`)이고 뜻도 같습니다. 호출자가 숫자의 의미를 말하지 않는 한 범위의 백분율입니다.

## 접근성

::: fw react

- role과 값은 루트에 있고, 링 자체는 `aria-hidden`입니다. 링은 그것들의 그림이기 때문입니다.
- 호는 백분율로 측정됩니다 — 원이 `pathLength="100"`을 선언합니다 — 그것이 하나의 애니메이션으로 다섯 지름을 모두 감당하게 하는 것입니다.
- 두 애니메이션 모두 `prefers-reduced-motion`에서 멈추고, 닫힌 링이 아니라 부분 호에서 쉽니다.

:::

::: fw flutter

- 표시기는 병합된 시맨틱 노드 하나입니다. 그래서 라벨과 도형이 이름 없는 표시기 옆에 이름이 떠 있는 것이 아니라 함께 읽힙니다.
- 값이 있으면 프로그레스 바 역할과 값, 범위를 답니다. 그 값은 `showValue`가 그리는 문자열과 같고, `formatValue`가 따로 말하지 않으면 범위의 백분율입니다. 그려진 문자열은 다시 읽히지 않습니다.
- 값이 없으면 값이 아예 없는 로딩 스피너입니다. 그래야 플랫폼이 0이 아니라 불확정 진행이라고 알립니다.
- `hideLabel`은 라벨을 노드에는 남기고 화면에서는 너비도 높이도 차지하지 않게 뺍니다.
- 링은 그려질 뿐 스스로 아무것도 말하지 않습니다. 노드가 가진 값의 그림입니다.
- `MediaQuery.disableAnimations`가 켜져 있으면 두 움직임이 모두 멈추고, 링은 닫힌 원이 아니라 12시에서 시작하는 4분의 1 호에서 쉽니다.

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

:::

## 함께 보기

- [MPProgressLinear](./progress-linear) — 너비에 여유가 있을 때.
- [MPOverlay](./overlay) — 이것이 가장 자주 놓이는 시트.
