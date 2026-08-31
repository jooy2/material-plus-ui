---
title: MPList
order: 7
---

# MPList

<p class="mp-lede">행을 쌓은 것입니다. 리스트가 면이고 행이 그 위에 놓인 것 — <code>size</code>와 <code>color</code>를 묶음에 한 번만 설정하는 이유이고, 이동하는 행이 진짜 링크인 이유입니다.</p>

<Demo src="list/hero" :minHeight="260" />

```tsx
import { MPList, MPListItem } from 'material-plus-ui';

<MPList>
  <MPListItem description="디자인" onClick={open}>
    홍길동
  </MPListItem>
  <MPListItem href="/people/ada">Ada Lovelace</MPListItem>
</MPList>;
```

## Props

<PropsTable name="MPList" />

### MPListItem

<PropsTable name="MPListItem" />

## 크기 사다리가 컨트롤 사다리에 정확히 맞습니다

각 단계의 세로 패딩은 그 단계 본문 역할의 행간을 같은 이름의 컨트롤 높이에서 뺀 값입니다. `body-large`의 줄 상자는 24px이고, 24에 `py-4`를 더하면 56 — MD3 자신의 한 줄 리스트 항목이자 컨트롤 사다리의 `md`입니다.

| `size` | 행의 타입 역할 | 한 줄 행 |
| ------ | -------------- | -------- |
| `xs`   | `body-medium`  | 32px     |
| `sm`   | `body-medium`  | 40px     |
| `md`   | `body-large`   | 56px     |
| `lg`   | `body-large`   | 64px     |
| `xl`   | `body-large`   | 72px     |

그래서 한 줄짜리 행과 그 옆의 버튼은 서로를 몰라도 높이가 같습니다.

## `dividers`는 들리는 것보다 많은 것을 바꿉니다

선을 켜면 선이 면의 양쪽 끝까지 닿아야 합니다. 그래서 리스트는 안쪽 여백을 내려놓고, 행은 둥근 모서리를 내려놓습니다. 한 행이 떠 있는 타일이면서 동시에 그어진 선일 수는 없습니다.

<Demo src="list/dividers">

<<< @/.vitepress/demos/list/dividers.tsx

</Demo>

이 선은 각 행의 클래스가 아니라 `> li + li`로 쓰여 있습니다. 그래야 행을 어떻게 구성했든 — `.map()`으로, 프래그먼트로, 호출자가 만든 컴포넌트로 — 그대로 유지됩니다.

## 세 가지 모양, 그리고 무엇을 넘기느냐로 고릅니다

껍데기는 항상 `<li>`입니다. 그 안은 이렇습니다.

```tsx
<MPListItem>가만히 있는 행</MPListItem>            // <div>
<MPListItem onClick={open}>누를 수 있는 행</MPListItem> // <button>
<MPListItem href="/one">이동하는 행</MPListItem>     // <a>
```

[MPChip](./chip)이 쓰는 것과 같은 구조이고 이유도 같습니다. 클릭 핸들러를 단 `<span>`은 키보드에 보이지 않고, `<button>` 안의 `<button>`은 크롬이 조용히 풀어버리는 마크업입니다.

`action`이 누를 수 있는 영역 **바깥**에 있는 것도 정확히 그 때문입니다 — 이동도 하고 토글도 가진 행에는 누를 것이 둘입니다.

`render`는 그 안쪽 엘리먼트를 대신하고, 라우터의 `Link`가 들어갈 자리가 여기입니다.

```tsx
<MPListItem href="/inbox" render={<Link />}>
  받은편지함
</MPListItem>
```

**라이브러리에서 유일하게 바깥 엘리먼트가 아닌 `render`입니다.** 행의 껍데기가 `<li>`인 것은 `<ul>` 안에 있기 때문이고, 그것을 다른 것으로 바꾸면 목록이 목록이기를 그만둡니다. 실제로 바꾸고 싶은 것은 그 안의 `<a>`이고, 클라이언트 라우팅과 prefetch가 일어나려면 라우터가 가져야 하는 것도 그쪽입니다. `href`, `target`, 행의 클래스는 모두 그대로 전달되므로 URL은 `MPListItem`에 한 번만 씁니다.

`target`은 자기 `rel`을 데려옵니다 — `_blank`이면 `noopener noreferrer`입니다. 직접 준 `rel`은 그것을 덧붙이는 게 아니라 **대체**하므로, `nofollow`까지 필요한 행은 셋을 다 적습니다.

## `selected`는 두 가지를 말합니다

링크에서는 `aria-current="page"`, 버튼에서는 `"true"`입니다. 앞의 것은 "지금 보고 있는 페이지", 뒤의 것은 "이 중에서 고른 것"입니다. `aria-pressed`는 세 번째 것 — 토글 — 이고, 선택된 행은 토글이 아닙니다.

보이는 모습은 MD3의 선택된 리스트 항목입니다. 계열의 container 색과 그 잉크. 다른 색도 아니고 더 굵은 글씨도 아닙니다.

## 면은 절대 물들지 않습니다

`color`가 무엇이든 `variant`는 중립 면 역할을 읽습니다. 리스트는 남의 내용을 담고, 그 내용은 자기 색을 가지고 도착하기 때문입니다. `color`는 선택된 행과 state layer까지만 닿고 거기서 멈춥니다.

카드 안에서는 `text`가 답입니다. 카드가 이미 면이고, 그 안에 또 하나의 테두리 사각형은 사각형 하나가 더 많은 것입니다.

## 아래에 프리미티브가 없습니다

리스트는 복합 위젯이 아닙니다 — roving focus도, 선택 모델도, 자기 키보드 계약도 없습니다. 그것을 얻으려고 메뉴나 리스트박스 프리미티브를 꺼내 들면, 모든 사용자의 평범한 링크 목록에 메뉴의 의미를 쥐여주게 됩니다. 컴포넌트 라이브러리가 스크린 리더를 망가뜨리는 가장 흔한 방법 중 하나입니다.

대신 `role="list"`는 소리 내어 말합니다. 호스트 페이지의 reset이 모든 `<ul>`에서 불릿을 떼어낼 수 있고, 사파리는 그때 리스트 의미까지 함께 떼어냅니다.

## 함께 보기

- [MPDivider](./divider) — 같은 선이 홀로 서 있을 때.
- [MPTable](./table) — 행에 열이 있을 때.
- [MPEmpty](../feedback/empty) — 행이 하나도 없을 때 보여줄 것.
