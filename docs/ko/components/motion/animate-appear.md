---
title: MPAnimateAppear
order: 7
---

# MPAnimateAppear

<p class="mp-lede">여러 개가 차례로 자리를 잡는 목록. 효과가 어느 한 항목이 아니라 묶음 전체의 것이고, 그래서 읽는 사람의 눈을 읽어야 할 순서대로 끌고 내려갑니다.</p>

<Demo src="animate-appear/hero" :minHeight="400" />

```tsx
import { MPAnimateAppear } from 'material-plus-ui';

<MPAnimateAppear render={<ul />}>
  {people.map((person) => (
    <li key={person.id}>{person.name}</li>
  ))}
</MPAnimateAppear>;
```

## Props

<PropsTable name="MPAnimateAppear" />

## 애니메이션은 자식에게 직접 붙습니다

자식을 감싼 래퍼가 아니라요. `<li>` 행은 `<li>` 행 그대로이고, 그리드의 셀은 그리드 자신의 직계 자식으로 남으며, 목록에 애니메이션을 걸었다고 해서 레이아웃이 달라지지 않습니다.

들리는 것보다 중요합니다. 자식을 하나씩 감싸는 컴포넌트는 자식이 무엇인지에 신경 쓰는 모든 레이아웃 — flex와 grid, `<ul>`/`<li>`, 테이블, 자기 자식을 훑는 Base UI 프리미티브 — 을 망가뜨리고, 잘 있던 목록에 누군가 애니메이션을 붙이는 그 순간에 조용히 망가뜨립니다.

문자열 하나만은 붙일 요소가 없어서 `<span>`으로 감쌉니다.

## 지연은 자식 단위입니다

그래서 무엇을 넘기는지가 중요합니다. 자식 여덟이면 여덟 단계이고, **여덟 개를 담은 자식 하나면 한 단계**입니다. 목록의 일부를 빼는 방법도 그것입니다 — 묶으세요.

`delay`는 자식마다가 아니라 첫 단계 앞에 한 번만 더해집니다. 항목마다 적용되는 `delay`는 첫 번째 지연과 싸우는 두 번째 지연일 뿐입니다.

## 이동 거리가 왜 짧은가

기본값은 `0.75rem` — 화면 밖에서의 등장이 아니라 자리잡음입니다. 긴 이동이 여덟 개짜리 목록에서 반복되면 블록 전체가 움직이는 것이 되고, 세 번째 행을 찾으려는 사람은 움직이는 과녁을 쫓게 됩니다.

화면 밖에서 진짜로 들어오는 등장이 필요하고 대상이 하나라면 [MPAnimateSlide](./animate-slide)를 쓰세요.

## 예제

<Demo src="animate-appear/grid" :minHeight="300">

<<< @/.vitepress/demos/animate-appear/grid.tsx

</Demo>

### render

이것이 실제 레이아웃 위에서 동작하게 만드는 탈출구입니다. 루트는 넘긴 것이 되고, 지연이 걸린 자식들은 그 요소의 직계 자식으로 남습니다.

```tsx
<MPAnimateAppear render={<ul />}>…</MPAnimateAppear>
<MPAnimateAppear render={<div style={{ display: 'grid' }} />}>…</MPAnimateAppear>
```

### reverse

목록을 마지막 자식부터 첫 자식까지 돌립니다 — 컨테이너 바닥에 붙은 것, 읽는 사람에게 가장 가까운 항목이 먼저 도착해야 하는 경우를 위해서입니다.

### trigger

이 컴포넌트를 쓸 때 보통 함께 집는 값입니다. 지연은 볼 사람이 있을 때만 의미가 있고, 페이지가 아직 화면 아래에 있는 동안 마운트에서 돌아 버린 목록은 빈 객석 앞에서 공연을 끝낸 것입니다.

## 스크롤이 곧 시계입니다

`timeline="view"`는 애니메이션을 스톱워치가 아니라 읽는 사람의 스크롤에 넘깁니다. 진행도가 곧 요소가 스크롤포트를 지나는 진행도이고, `range`가 그 여정 중 어느 구간에 펼칠지를 말합니다.

```tsx
<MPAnimateAppear timeline="view">…</MPAnimateAppear>
```

`view`에서는 `duration`, `delay`, `repeat`, `trigger`가 의미를 잃고, 이 기능이 없는 브라우저는 시계로 되돌아가 한 번 재생합니다. 근거는 [MPAnimateFade](./animate-fade#스크롤이-곧-시계입니다)에 자세히 적혀 있습니다.

## 접근성

- `prefers-reduced-motion`에서는 아무것도 움직이지 않고 모든 자식이 그냥 거기 있습니다.
- 모든 자식은 첫 프레임부터 레이아웃 안 최종 위치에 있습니다. 지연이 도는 동안 아무것도 다시 흐르지 않고, 스크린 리더는 한 항목씩이 아니라 목록 전체를 곧바로 읽습니다.
- 전체 길이를 염두에 두세요. 스무 개짜리 목록의 마지막 자식은 첫 자식보다 `19 × stagger` 늦게 시작하고, 기본값이면 1.5초가 넘습니다. 긴 목록에서는 `stagger`를 낮추거나, 행이 아니라 페이지를 움직이세요.

## 함께 보기

- [MPAnimateSlide](./animate-slide) — 같은 이동을 훨씬 길게, 요소 하나에.
- [MPAnimateFade](./animate-fade) — 묶음이 한꺼번에 도착해야 할 때.
- [MPList](../display/list) — 이것을 가장 자주 감싸게 되는 컴포넌트.
