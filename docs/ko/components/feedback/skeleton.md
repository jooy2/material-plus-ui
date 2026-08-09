---
title: MPSkeleton
order: 1
---

# MPSkeleton

<p class="mp-lede">아직 도착하지 않은 것의 모양입니다. 진짜가 차지할 공간을 미리 잡아 두는 것이 일의 전부입니다 — 이미지가 도착하면서 200px 자라는 카드는 누군가 읽고 있는 동안 그 아래 전부를 밀어낸 카드입니다.</p>

<Demo src="skeleton/hero" :minHeight="260" />

```tsx
import { MPSkeleton } from 'material-plus-ui';

<MPSkeleton shape="circle" />
<MPSkeleton lines={3} />
<MPSkeleton shape="rect" height={180} label="차트를 불러오는 중" />;
```

## Props

<PropsTable name="MPSkeleton" />

모든 native `<div>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

## 레이아웃이 세 가지로 이루어져 있으므로 모양도 셋입니다

<Demo src="skeleton/shapes">

<<< @/.vitepress/demos/skeleton/shapes.tsx

</Demo>

각각은 진짜 컴포넌트가 쓰는 사다리로 크기가 정해집니다. `md` 줄은 `md` 타입만큼 높고, `md` 원은 `md`의 [MPAvatar](../display/avatar) 바로 그것입니다.

줄의 높이는 줄 상자가 아니라 대체하는 타입의 **em 상자**입니다. 행간만큼 높은 자리표시자는 다음 것과 사이에 공기가 없는 막대이고, 그런 문단은 바코드입니다.

## `lines`는 줄무늬 상자 하나가 아니라 막대의 더미입니다

사이의 간격이 진짜 간격입니다. 글에는 행간이 있고 — 줄무늬 그러데이션은 호출자가 이 블록을 flex 행에 넣는 순간 무너집니다. 마지막 줄은 문단의 마지막 줄처럼 짧게 그려지므로 여러 개를 쌓으면 본문으로 읽힙니다.

## `label`이 말할지 말지를 정합니다

라벨이 없으면 `aria-hidden` 배경입니다. 그것이 옳은 기본값입니다. 상자 열두 개가 각자 자기를 알리는 것은 침묵보다 나쁩니다.

영역 전체를 대표하는 **하나**의 스켈레톤에 라벨을 주면 `aria-busy`를 가진 살아 있는 `role="status"`가 됩니다.

```tsx
<div>
  <MPSkeleton label="프로젝트를 불러오는 중" />
  <MPSkeleton />
  <MPSkeleton />
</div>
```

## `color`에는 기본값이 없습니다

자리표시자는 아직 무엇이 아니므로 나를 의미가 없습니다. 지정하지 않으면 `surface-container-highest`입니다 — 아무것도 들어 있지 않은 컨테이너를 위한 MD3의 역할이고, 이것이 정확히 그것입니다. `color`를 주면 계열의 container 색으로 바뀝니다. 기다림 자체가 브랜드인 드문 페이지를 위한 것입니다.

## 면은 평평합니다

라이브러리의 다른 모든 컨테이너는 `surface-container` 역할을 읽고 그림자를 드리울 수 있습니다. 스켈레톤은 _거기 없는_ 것의 모양이므로 색 하나가 전부입니다 — 높이도, 가장자리도 없습니다. 자리표시자 서른 개짜리 페이지가 그림자 서른 개를 요구하지 않게 하는 효과도 있습니다.

`animated={false}`는 그것이 수십 개 있는 페이지, 또는 기다림이 길어서 움직임이 소음이 되는 곳에서 맥동을 멈춥니다. 접근성 스위치는 **아닙니다**. 모션 감소 설정은 요청하지 않아도 애니메이션을 멈추고, 상자는 여전히 알맞은 크기입니다 — 일하고 있던 부분은 그쪽이었습니다.

## 상자에 담긴 스피너가 아닙니다

스피너는 공간을 잡아 둘 수 없습니다. 그것이 차이이고, 이것이 진행 표시의 variant가 아니라 독립된 컴포넌트인 이유입니다.

## 함께 보기

- [MPEmpty](./empty) — 나머지 절반: _오지 않는_ 것의 모양.
- [MPTable](../display/table) — 둘 다 흔히 쓰이는 곳.
