---
title: MPProgressBox
order: 8
---

# MPProgressBox

<p class="mp-lede">차례로 켜지는 조각들의 줄입니다. 바와 링은 둘 다 “이만큼 끝났다”고 말합니다 — 읽는 사람이 재는 양입니다. 조각 넷은 “지금은 세 번째 단계”라고 말하고, 그것은 세는 양입니다. 셀 수 있을 만큼 작은 수라면 세는 쪽이 재는 쪽보다 빠릅니다.</p>

<Demo src="progress-box/hero" :minHeight="80" />

::: fw react

```tsx
import { MPProgressBox } from 'material-plus-ui';

<MPProgressBox label="배포 중" count={4} value={step * 25} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPProgressBox(label: const Text('배포 중'), count: 4, value: step * 25);
```

:::

## Props

<PropsTable name="MPProgressBox" />

## 이것은 명세에 없습니다

MD3에는 바와 링이 있고 거기서 끝납니다. 이것은 라이브러리 자신의 세 번째 모양이고 — 그것이 Material Plus의 전제 그 자체입니다. 사양이 멈추는 자리에서 이 라이브러리는 멈추지 않습니다.

그래도 명세의 부품으로 그려집니다 — `corner-extra-small` 타일, 강조 색, 12%의 `on-surface` — 그래서 머터리얼 페이지 안에 놓여도 자신이 덤이라고 광고하지 않습니다.

## 예시

### count

기본값은 넷입니다. 물결이 물결로 읽힐 만큼 많고, 값이 있는 줄을 재지 않고 셀 수 있을 만큼 적습니다. 기다리는 일에 진짜 단계가 있다면 그 수로 두세요.

<Demo src="progress-box/count" :minHeight="180">

::: fw react

<<< @/.vitepress/demos/progress-box/count.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_box/count.dart

:::

</Demo>

맨 앞 조각은 부분적으로 채워집니다. 그래서 조각 넷이 0·25·50·75·100에 갇히지 않습니다 — 그러지 않으면 30%가 4분의 1로 반올림되어 사라집니다.

::: fw react

조각이 없는 줄은 표시기가 아니고, 소수인 count는 무언가를 나눈 호출자입니다. 둘 다 0이 아니라 하나의 조각으로 떨어집니다.

:::

::: fw flutter

조각이 없는 줄은 표시기가 아니므로, 1보다 작은 `count`는 0이 아니라 하나의 조각으로 떨어집니다. `count`는 `int`라서 소수가 들어올 수 없습니다.

:::

### value

기본값인 `null`은 줄을 대신 순환시키고, 각 조각은 자기 index만큼 늦게 켜집니다.

### size

조각 하나의 크기이고, 자기만의 사다리를 씁니다. 표시기는 컨트롤이 아니므로 컨트롤 높이 위에 있지 않습니다.

<Demo src="progress-box/sizes" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/progress-box/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_box/sizes.dart

:::

</Demo>

## 접근성

::: fw react

- `progressbar` role과 값은 Base UI가 가집니다. 조각들은 그것의 그림입니다.
- 물결은 위치가 아니라 opacity를 움직이므로 아무것도 이동하지 않고 리플로우도 없습니다. `prefers-reduced-motion`에서는 아예 멈춥니다.

:::

::: fw flutter

- 표시기는 병합된 시맨틱 노드 하나입니다. 그래서 라벨과 도형이 이름 없는 표시기 옆에 이름이 떠 있는 것이 아니라 함께 읽힙니다.
- 값이 있으면 프로그레스 바 역할과 값, 범위를 답니다. 그 값은 `showValue`가 그리는 문자열과 같고, `formatValue`가 따로 말하지 않으면 범위의 백분율입니다. 그려진 문자열은 다시 읽히지 않습니다.
- 값이 없으면 값이 아예 없는 로딩 스피너입니다. 그래야 플랫폼이 0이 아니라 불확정 진행이라고 알립니다.
- `hideLabel`은 라벨을 노드에는 남기고 화면에서는 너비도 높이도 차지하지 않게 뺍니다.
- 물결은 위치가 아니라 opacity를 움직이므로 아무것도 이동하지 않고 레이아웃도 다시 하지 않습니다. `MediaQuery.disableAnimations`가 켜져 있으면 멈추고, 모든 조각이 60%로 고르게 쉽니다.
- 조각은 읽는 방향의 시작부터 채워집니다. 오른쪽에서 왼쪽으로 읽는 화면에서는 첫 조각이 가장 오른쪽입니다.

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

줄은 React 빌드의 `inline-flex`처럼 가장 넓은 줄만큼 넓습니다. 조각보다 긴 라벨은 작은 네모 넷 아래로 줄바꿈되는 대신 줄을 넓힙니다.

:::

## 함께 보기

- [MPProgressLinear](./progress-linear) — 세는 것이 아니라 백분율일 때.
- [MPTimeline](../display/timeline) — 단계에 이름과 기록이 있을 때.
