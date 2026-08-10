---
title: MPBreadcrumb
order: 2
---

# MPBreadcrumb

<p class="mp-lede">지금 읽는 페이지 위쪽의 경로입니다. 마지막 단계는 독자가 이미 있는 곳이므로 링크가 아니고, 일곱 단계짜리 경로는 가운데를 <code>…</code> 뒤로 접습니다.</p>

<Demo src="breadcrumb/hero" :minHeight="140" />

```tsx
import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

<MPBreadcrumb maxItems={4}>
  <MPBreadcrumbItem href="/">홈</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/components">컴포넌트</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>;
```

## Props

<PropsTable name="MPBreadcrumb" />

### MPBreadcrumbItem

<PropsTable name="MPBreadcrumbItem" />

## 마지막 단계가 지금 보고 있는 페이지입니다

`aria-current="page"`를 갖고 눌리지 않게 되며, 그것을 호출자마다 기억하게 하는 대신 컴포넌트가 계산합니다.

앞선 단계에 `current`를 주면 표시가 그쪽으로 옮겨 가고 마지막 단계에서는 사라집니다. 한 경로에서 그것을 가질 수 있는 엘리먼트는 정확히 하나이기 때문입니다. 손으로 하려면 요청한 적도 없는 단계에 `current={false}`를 적어야 합니다.

`"true"`가 아니라 `aria-current="page"`인 이유: 경로는 내비게이션이고, 독자가 있는 단계는 선택지 중 고른 것이 아니라 _페이지_ 입니다.

## 접기

일곱 단계짜리 경로는 아무도 읽지 않는 경로입니다. `maxItems`가 가운데를 `…`로 접고, 누르면 되돌립니다.

```tsx
<MPBreadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
```

실제로 무언가를 없앨 때만 접습니다. 세 단계짜리 경로에 앞 `1`, 뒤 `1`이면 `…`가 정확히 한 단계를 대신하게 되는데 — 대신한 단계보다 길어집니다 — 그래서 아무 일도 일어나지 않습니다.

`expandable={false}`는 독자 아래에서 자라면 안 되는 경로를 위해 접힌 표시를 그냥 표시로 남겨 둡니다.

## 예시

### separator

<Demo src="breadcrumb/separators">

<<< @/.vitepress/demos/breadcrumb/separators.tsx

</Demo>

아무것이나 받는 대신 이름 붙은 네 가지인 이유는, 구분 표시가 하루에도 수백 번 읽히고 그 차이가 장식이 아니라 의미이기 때문입니다. `chevron`과 `arrow`는 "그다음", `slash`는 "경로", `dot`은 "이것들은 한 가지의 동료들"이라고 말합니다. 그 밖의 것은 여전히 노드로 넘길 수 있습니다.

방향을 가리키는 둘은 RTL에서 되돌아섭니다. 경로는 언어가 흐르는 방향으로 흐르기 때문입니다.

구분 표시는 단계가 아니라 경로가 그립니다. 단계는 자기 뒤에 무엇이 오는지 모르고, 단계에 속한 표시라면 마지막 하나에서 손으로 떼어내야 합니다.

### 단계마다 세 가지 모양

호출자가 무엇을 넘기느냐로 고릅니다.

```tsx
<MPBreadcrumbItem href="/docs">링크</MPBreadcrumbItem>
<MPBreadcrumbItem onClick={back}>버튼</MPBreadcrumbItem>
<MPBreadcrumbItem>지금 보고 있는 페이지</MPBreadcrumbItem>
```

## 단계는 칩이 아닙니다

hover 배경은 일부러 사다리 아래쪽의 `corner-extra-small`입니다. 높이 20px짜리 글줄에 `corner-full`은 알약이고, 알약이 늘어선 경로는 필터 칩의 줄입니다.

## 접근성

- 경로는 `aria-label="Breadcrumb"`을 가진 `<nav>`입니다. 페이지의 다른 세 nav와 구분되는 방법이고, `label`이 그것을 번역합니다.
- 구분 표시는 `aria-hidden`입니다. 단계가 아니라 구두점입니다.
- `…`는 자기 이름(`expandLabel`)을 가진 진짜 버튼입니다.
- `<ol>`은 `role="list"`를 소리 내어 말합니다. 호스트 reset이 마커를 떼어낼 수 있고, 사파리는 그때 리스트 의미까지 함께 떼어냅니다.

## 함께 보기

- [MPTextLink](./text-link) — 경로가 아니라 링크 하나일 때.
- [MPTimeline](../display/timeline) — 되짚어 올라갈 길이 아니라 벌어진 일의 기록.
