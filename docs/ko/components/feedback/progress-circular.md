---
title: MPProgressCircular
order: 7
---

# MPProgressCircular

<p class="mp-lede">채워지는 링이고, 바를 놓을 자리가 없는 곳 — 버튼 안, 표 행 끝, 필드 옆 — 에서 집게 되는 것입니다.</p>

<Demo src="progress-circular/hero" :minHeight="100" />

```tsx
import { MPProgressCircular } from 'material-plus-ui';

<MPProgressCircular label="동기화 중" />;
```

## Props

<PropsTable name="MPProgressCircular" />

## 값은 링 안이 아니라 옆에 놓입니다

다이얼 한가운데의 숫자는 누구나 이 컴포넌트에 대해 갖고 있는 그림이지만, 다섯 크기 중 둘에서만 통합니다. `xs`에서 링은 스물네 픽셀이고 "40%"가 들어갈 자리가 없습니다. 옆에 두면 모든 크기에서 읽힙니다.

## 예시

### size

`md`가 MD3의 48dp이고, 모든 단계가 같은 이름의 컨트롤 높이 안에 들어갑니다 — 56px 필드 안의 48px 링 — 그래서 버튼이나 필드, 표 행에 넣어도 행이 원래보다 높아지지 않습니다.

<Demo src="progress-circular/sizes" :minHeight="120">

<<< @/.vitepress/demos/progress-circular/sizes.tsx

</Demo>

### value

기본값인 `null`은 링을 채우는 대신 돌립니다. 값이 있으면 링은 멈추고 틈이 닫힙니다.

```tsx
<MPProgressCircular /> // indeterminate
<MPProgressCircular value={70} /> // 열에 일곱만큼 돈 상태
```

### showValue와 format

[MPProgressLinear](./progress-linear)가 받는 것과 같은 두 prop이고 뜻도 같습니다. 호출자가 숫자의 의미를 말하지 않는 한 범위의 백분율입니다.

## 접근성

- role과 값은 루트에 있고, 링 자체는 `aria-hidden`입니다. 링은 그것들의 그림이기 때문입니다.
- 호는 백분율로 측정됩니다 — 원이 `pathLength="100"`을 선언합니다 — 그것이 하나의 애니메이션으로 다섯 지름을 모두 감당하게 하는 것입니다.
- 두 애니메이션 모두 `prefers-reduced-motion`에서 멈추고, 닫힌 링이 아니라 부분 호에서 쉽니다.

## 함께 보기

- [MPProgressLinear](./progress-linear) — 너비에 여유가 있을 때.
- [MPOverlay](./overlay) — 이것이 가장 자주 놓이는 시트.
