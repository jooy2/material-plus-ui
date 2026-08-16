---
title: MPAnimateFade
order: 1
---

# MPAnimateFade

<p class="mp-lede">불투명도만으로 나타나거나 사라지는 내용. 아무것도 움직이지 않으므로 레이아웃이 다시 흐르지 않고 글자가 다시 그려지지도 않습니다 — 어떤 크기의 본문 위에도 안전한 유일한 등장입니다.</p>

<Demo src="animate-fade/hero" :minHeight="360" />

```tsx
import { MPAnimateFade } from 'material-plus-ui';

<MPAnimateFade>
  <MPCard title="Ready when you are" />
</MPAnimateFade>;
```

## Props

<PropsTable name="MPAnimateFade" />

## 왜 이것부터인가

이 그룹의 다른 효과는 모두 내용을 확대하거나 이동시키고, 둘 다 글자를 다시 샘플링합니다. 페이드는 숫자 하나만 바꾸고 무엇이 어디에 있는지는 전혀 바꾸지 않으므로, 본문 텍스트를 감싸도 글자가 어중간한 크기로 다시 그려지지 않는 유일한 등장입니다.

머터리얼이 네 가지 전환 패턴 중 둘에서 이름을 붙인 효과이기도 합니다. **fade through** — 하나가 나간 뒤 다음이 들어오는 것 — 는 `delay`로 두 개를 이어 붙이면 되는 것이고, **fade** 하나만으로는 화면에 들어오거나 나가는 것을 말합니다. 여기서는 뒤쪽이 기본값입니다.

## 길이와 곡선은 토큰에서 옵니다

`duration`에 아무 말도 하지 않으면 애니메이션은 `300ms`가 아니라 `var(--mp-sys-motion-duration-medium2)`로 돕니다. 오늘은 둘 다 같은 것을 그리지만, 페이지가 모션 토큰을 다시 조율했을 때 따라 움직이는 것은 하나뿐입니다.

곡선도 같습니다. `easing`은 MD3의 일곱 가지 이름만 받고 임의의 `cubic-bezier()`는 받지 않습니다. `color`가 색상값이 아니라 계열을 받는 것과 같은 이유입니다 — `emphasized`가 _무엇인지_ 바꾸려면 `--mp-sys-motion-easing-emphasized`를 설정하세요. 그러면 페이지의 모든 애니메이션이 함께 움직입니다.

## 나가는 쪽이 들어오는 쪽보다 짧습니다

`mode="out"`은 같은 키프레임을 거꾸로 돌리고, 들어올 때의 `medium2` 대신 `short4`를 기본으로 씁니다. 이 비대칭은 머터리얼의 것입니다. 도착하는 것은 소개되는 중이므로 도착으로 읽힐 시간을 받고, 떠나는 것은 할 말을 이미 다 했습니다.

거꾸로 돌리면 곡선도 공짜로 맞습니다. CSS는 키프레임과 함께 타이밍 함수도 뒤집으므로, `emphasized-decelerate`로 들어온 등장은 가속하며 되돌아갑니다 — 명세가 퇴장에 요구하는 바로 그 곡선입니다.

사라진 요소는 사라진 채로 **붙들립니다**. `animation-fill-mode`가 `both`라서 애니메이션이 끝나는 순간 다시 튀어나오지 않습니다.

## 예제

<Demo src="animate-fade/triggers" :minHeight="360">

<<< @/.vitepress/demos/animate-fade/triggers.tsx

</Demo>

### trigger

- `mount` — 화면에 올라오는 즉시. 기본값입니다.
- `visible` — 스크롤로 보일 때. `once`를 끄지 않는 한 한 번만입니다.
- `hover` — 포인터가 올라와 있는 동안, 들어올 때마다 처음부터. 키보드 포커스도 포함합니다.
- `manual` — 스스로는 절대 시작하지 않습니다. `play`가 돌리고, `false` → `true`마다 처음부터 다시 시작합니다.

다시 시작해도 안에 있는 것을 마운트 해제하지 않으므로, 내부의 상태가 사라지지 않습니다.

### from

어느 불투명도에서 시작할지. `0`이면 아무것도 없는 상태에서 도착하고, 완전히 사라지면 안 되는 내용 — 사라지는 대신 어두워지는 패널 — 이라면 값을 올리세요.

### repeat과 alternate

`repeat="infinite"`에 `alternate`를 더하면 한 방향의 등장이 호흡이 됩니다. 한 번 걸러 거꾸로 도니까, 처음으로 튀지 않고 되돌아옵니다.

## 접근성

- `prefers-reduced-motion`에서는 애니메이션을 아예 떨어뜨리고 내용만 그대로 둡니다. [진행 표시기](../feedback/progress-linear)와는 반대인데, 각자가 하는 말이 다르기 때문입니다. 멈춘 스피너는 무언가 일어나고 있는지에 대해 거짓말을 하지만, 돌지 않은 등장은 이미 실어 나르던 것을 전부 전달했습니다.
- 애니메이션은 duration을 0으로 만드는 대신 `animation: none`으로 떨어뜨립니다. 단축 속성은 `fill-mode`까지 지우는데, 시작되지 않은 요소를 `opacity: 0`에 붙들고 있던 것이 바로 그 fill이기 때문입니다. 그대로 두면 설정을 존중하는 일이 페이지를 비우는 일이 됩니다.
- 접근성 트리는 아무것도 달라지지 않습니다. 내용은 그려졌든 아니든 첫 프레임부터 문서 안에 있으므로, 스크린 리더가 애니메이션을 기다리는 일은 없습니다.
- `trigger="hover"`는 포커스에서도 시작합니다. 키보드로 닿을 수 있는 것에 걸린 효과가 마우스를 쥔 사람만의 것이 되지 않도록 하기 위해서입니다.

## 함께 보기

- [MPAnimateGrow](./animate-grow) — 옆에 있는 것에서 펼쳐져 나오는 것.
- [MPAnimateSlide](./animate-slide) — 한쪽 가장자리에서 이동해 들어오는 것.
- [MPAnimateAppear](./animate-appear) — 여러 개가 차례로 자리를 잡는 목록.
