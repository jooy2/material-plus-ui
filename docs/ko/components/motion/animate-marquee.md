---
title: MPAnimateMarquee
order: 12
---

# MPAnimateMarquee

<p class="mp-lede">끝없이 흘러가는 내용. 똑같은 사본 두 벌을 이어 붙이고, 상자에 맞는 속도가 아니라 읽는 사람의 속도로 움직입니다.</p>

<Demo src="animate-marquee/hero" :minHeight="180" />

```tsx
import { MPAnimateMarquee } from 'material-plus-ui';

<MPAnimateMarquee speed={50} gap="1rem">
  {tools.map((tool) => (
    <MPChip key={tool}>{tool}</MPChip>
  ))}
</MPAnimateMarquee>;
```

## Props

<PropsTable name="MPAnimateMarquee" />

## 이음매가 없는 이유

내용을 **두 번** 깔고, 각 사본이 정확히 자기 길이에 간격을 더한 만큼 움직입니다. 그래서 첫 사본이 떠나는 바로 그 순간 두 번째 사본이 첫 사본이 시작했던 자리에 서 있습니다. 튀지도, 이음매가 보이지도, 띠가 비는 프레임이 생기지도 않습니다.

이 중 어느 것도 측정에 기대지 않습니다. 백분율 `translate`는 요소 자신의 박스에 대해 계산되므로, `-100%`는 그것이 얼마든 사본 하나의 너비입니다.

내용이 짧아서 뒤에 구멍을 남긴다면 `copies`를 올리세요. 컨테이너보다 좁은 것의 사본 둘은 두 번째가 도착하기 전에 바닥납니다.

## `duration`이 아니라 `speed`

duration이었다면 로고 넷짜리 띠와 마흔짜리 띠가 같은 상자를 같은 시간에 건너고, 긴 쪽은 얼룩이 됩니다. `speed`는 초당 픽셀이라서 둘 다 읽는 사람의 속도로 움직입니다.

여기서 측정되는 것은 그것 하나뿐이고, 띠나 컨테이너의 크기가 바뀔 때마다 다시 측정됩니다. 명시한 `duration`이 있으면 그쪽이 이깁니다.

## `pauseOnHover`는 장식이 아닙니다

포인터 앞을 지나가는 내용은 안정적으로 클릭할 수 없습니다. 멈추지 않는 마퀴 안의 링크는 아무도 따라갈 수 없는 링크이고, 읽으려는 이름은 끝내 잡히지 않는 이름입니다.

기본으로 켜져 있고, 링크나 버튼이나 읽을 만한 단어가 들어 있는 것에는 켜 둔 채로 두어야 합니다.

## 예제

<Demo src="animate-marquee/vertical" :minHeight="240">

<<< @/.vitepress/demos/animate-marquee/vertical.tsx

</Demo>

### orientation과 reverse

`vertical`은 띠를 가로가 아니라 세로로 흘립니다 — 컨테이너에 높이를 주세요. 그러지 않으면 흘릴 공간이 없습니다. `reverse`는 어느 축이든 반대로 돌립니다.

반대 방향으로 도는 두 줄은 로고 벽의 흔한 패턴이고, 두 줄이 한 줄로 읽히는 것도 막아 줍니다.

### gap

항목 사이, 그리고 한 사본의 마지막 항목과 다음 사본의 첫 항목 사이의 간격입니다. prop에서 파싱하지 않고 계산된 스타일에서 다시 읽습니다. `'2rem'`은 폰트 크기가 정해진 다음에야 숫자이기 때문입니다.

## 접근성

- 첫 사본만 읽힙니다. 나머지는 `aria-hidden`을 답니다. 그러지 않으면 스크린 리더가 띠 전체를 깔린 횟수만큼 읽습니다.
- `prefers-reduced-motion`에서는 느려지는 것이 아니라 **멈춥니다**. 흐르기를 멈춘 로고 줄도 여전히 로고 줄이고, 첫 사본은 화면 안에 온전히 들어 있습니다 — 움직이는 쪽이 어느 순간에도 보장하지 못하는 것입니다.
- 움직이는 글자는 멈춘 글자보다 읽기 어렵고, 고정된 지점을 가로로 지나가는 글자는 그중에서도 가장 어렵습니다. 마퀴는 한눈에 훑는 묶음을 위한 것이지, 읽어야 하는 내용을 위한 것이 아닙니다.
- 안에 있는 상호작용 요소에는 `pauseOnHover`가 켜져 있어야 하고, 그래도 멈춰 있는 같은 것보다 닿기 어렵습니다. 내용이 중요하다면 진짜 리스트를 쓰세요.

## 함께 보기

- [MPCarousel](../layout/carousel) — 읽는 사람이 직접 넘기는, 진짜 컨트롤이 있는 내용에.
- [MPAnimateHeadline](./animate-headline) — 한 번에 하나면 충분한 문구 묶음에.
- [MPList](../display/list) — 그냥 읽히기만 하면 되는 내용에.
