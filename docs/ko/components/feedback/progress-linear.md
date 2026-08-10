---
title: MPProgressLinear
order: 6
---

# MPProgressLinear

<p class="mp-lede">채워지는 바이고, 세 진행 표시기 중 일꾼입니다. 얼마나 남았는지를 한눈에 보여주는 것은 이것뿐입니다. 길이는 읽는 사람이 세지 않고 비교할 수 있는 유일한 양이기 때문입니다.</p>

<Demo src="progress-linear/hero" :minHeight="120" />

```tsx
import { MPProgressLinear } from 'material-plus-ui';

<MPProgressLinear label="업로드 중" value={progress} showValue />;
```

## Props

<PropsTable name="MPProgressLinear" />

## `value`의 기본값이 `null`이고, 그것이 핵심입니다

`null`은 indeterminate입니다. 무언가 일어나고 있는데 얼마나 남았는지는 아무도 모르는 경우입니다. 값을 듣지 못한 표시기는 빈 바를 그릴 것이 아니라 모른다고 말해야 합니다. 빈 바는 진행이 전혀 없었다는 주장입니다.

[MPProgressCircular](./progress-circular)와 [MPProgressBox](./progress-box)도 마찬가지입니다. 셋은 한 컴포넌트의 세 가지 모양이고, `null`은 셋 모두에서 같은 뜻이어야 합니다.

## 예시

### value, min, max

비율은 clamp됩니다. 방어적 프로그래밍을 위한 방어가 아닙니다. `value`는 대개 어딘가의 나눗셈에서 오고, 요청 하나가 두 번 끝났다고 140% 너비로 그려지는 바는 가득 찬 채로 있는 바보다 나쁜 버그입니다.

```tsx
<MPProgressLinear value={3} min={0} max={4} showValue />
```

### showValue와 format

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

### size

홈의 두께이고, 여기서 `size`가 건드리는 것은 그것뿐입니다 — 바 안에는 크기를 잴 라벨이 없습니다. `md`가 MD3의 4dp입니다.

<Demo src="progress-linear/sizes" :minHeight="200">

<<< @/.vitepress/demos/progress-linear/sizes.tsx

</Demo>

### color

진행 표시는 계열의 강조 색이고, 홈은 12%의 `on-surface`입니다. 하나의 칠이 두 스킴 모두에서 네 강조 색 아래로 읽혀야 하는데, 고정된 중립색은 그것을 주고 계열별 container 톤은 주지 못합니다.

## 접근성

- `role="progressbar"`, 값과 범위 속성, `aria-valuetext`, indeterminate일 때 값을 아예 떼는 것은 Base UI가 가집니다.
- `label`이 바의 이름이 됩니다. 없다면 재고 있는 대상에서 이름을 가져오세요.
- indeterminate 스윕은 `prefers-reduced-motion`에서 멈추고, 가득 찬 프레임이 아니라 부분 프레임에서 쉽니다. 멈춘 표시기가 끝난 표시기로 읽혀서는 안 됩니다.

## 함께 보기

- [MPProgressCircular](./progress-circular) — 바를 놓을 자리가 없을 때의 같은 값.
- [MPProgressBox](./progress-box) — 진짜로 단계가 있는 일에.
