---
title: MPAnimateHeadline
order: 16
---

# MPAnimateHeadline

<p class="mp-lede">한 줄이 위의 줄을 대신하며 도는 릴. 어느 것이었어도 괜찮았을 문구 묶음을 위한 것입니다 — 제품이 무엇인지 말하는 세 가지 방법, 돌아가며 나오는 지역 이름.</p>

<Demo src="animate-headline/hero" :minHeight="200" />

```tsx
import { MPAnimateHeadline } from 'material-plus-ui';

<MPAnimateHeadline interval={2200}>
  <MPTypography level="h4">a component library</MPTypography>
  <MPTypography level="h4">Material Design 3</MPTypography>
</MPAnimateHeadline>;
```

## Props

<PropsTable name="MPAnimateHeadline" />

## 상자는 크기가 변하지 않습니다

모든 줄이 **같은 그리드 칸**에 있으므로, 릴은 첫 프레임부터 가장 긴 줄만큼 높고 넓습니다. 이 효과의 어려움 전부가 여기 있습니다. 돌면서 크기가 변하는 헤드라인은 한 문장에 네 번씩 아래의 모든 것을 밀고, 페이지 중간을 읽던 사람은 2초마다 흔들립니다.

보이지 않는 줄들이 `display`가 아니라 `visibility`로 자리를 지키는 이유이기도 합니다. 레이아웃에서 빼면 상자 크기에 대한 그들의 기여도 함께 사라집니다.

## 티커가 아닙니다

한 줄이 올라오고, **멈추고**, 읽을 만큼 머무릅니다.

`interval`은 주기의 시작이 아니라 줄이 도착한 순간부터 셉니다. 그래서 그것은 읽는 시간입니다 — 전환을 느리게 하려고 `duration`을 올려도 그 시간을 잡아먹지 않습니다.

## emphasized 곡선의 두 절반

MD3의 `emphasized-decelerate`와 `emphasized-accelerate`가 둘 다 쓰여 있는 라이브러리 유일한 자리입니다. 다른 곳에서는 퇴장이 등장을 거꾸로 돌린 것이고 그러면 곡선이 공짜로 뒤집힙니다. 하지만 여기서는 둘이 정말로 같은 순간, 두 요소 위의 두 애니메이션입니다. 도착하는 줄은 감속해 자리를 잡고, 떠나는 줄은 가속해 사라집니다.

## 예제

<Demo src="animate-headline/controlled" :minHeight="260">

<<< @/.vitepress/demos/animate-headline/controlled.tsx

</Demo>

### index

`index`를 넘기면 릴은 **스스로 돌기를 멈춥니다**. 제어되는 헤드라인은 다른 누군가의 타이머이고, 그 아래에서 두 번째 타이머가 도는 것은 같은 상태를 두고 싸우는 일입니다.

폼의 단계, 탭, 어느 줄이 보여야 하는지 이미 아는 무엇이든 릴을 묶는 방법이 그것입니다. 제어하지 않는 경우에는 `onIndexChange`가 방금 올라온 줄을 알려 줍니다.

### loop

기본으로 켜져 있습니다. 끄면 릴은 마지막 줄에서 멈춰 그대로 있습니다 — 묶음이 아니라 순서가 원하는 것입니다.

### rise

줄이 올라오거나 나갈 때 이동하는 거리. `'100%'`는 줄 하나의 높이이고, 두 줄이 하나의 띠처럼 움직이게 만드는 값입니다. 더 짧으면 살짝 밀린 페이드로 읽힙니다.

## 접근성

- 스크린 리더에게는 묶음이 아니라 그때 보이고 있는 줄이 주어집니다. 그러니 **읽는 사람이 반드시 봐야 하는 내용에는 쓰지 마세요.** 특정 줄이 떠 있는 2초 동안 누군가 보고 있으리라는 보장이 없습니다.
- `prefers-reduced-motion`에서도 릴은 계속 돕니다 — 문구 묶음이고, 첫 줄에서 멈추는 것은 다른 메시지가 되기 때문입니다 — 다만 줄이 이동하지 않고 교체됩니다.
- 중요한 것은 릴 바깥에 두거나, 읽는 사람이 직접 움직이는 무언가로 릴을 제어하세요.
- `paused`는 릴을 그 자리에 붙들고, 사람이 머무는 자리의 헤드라인에는 `trigger="hover"`도 고려할 만합니다.

## 함께 보기

- [MPAnimateTyping](./animate-typing) — 여러 줄을 바꾸는 대신 한 줄이 쓰여 나가는 것.
- [MPCarousel](../layout/carousel) — 읽는 사람이 진짜 컨트롤로 넘기는 묶음에.
- [MPAnimateMarquee](./animate-marquee) — 하나씩이 아니라 계속 흘러가는 묶음에.
