---
title: MPNavigationMenu
order: 18
---

# MPNavigationMenu

<p class="mp-lede">사이트의 내비게이션입니다. 목적지가 늘어선 행이고, 그중 몇몇은 더 많은 목적지가 든 패널을 엽니다.</p>

<Demo src="navigation-menu/hero" :minHeight="240" />

```tsx
import { MPNavigationMenu, MPNavigationMenuItem, MPNavigationMenuLink } from 'material-plus-ui';

<MPNavigationMenu aria-label="주요 메뉴">
  <MPNavigationMenuItem value="product" label="제품">
    <MPNavigationMenuLink href="/overview" title="개요" description="무엇을 하는지" />
  </MPNavigationMenuItem>
  <MPNavigationMenuItem label="가격" href="/pricing" />
</MPNavigationMenu>;
```

## Props

<PropsTable name="MPNavigationMenu" />

## 이것이 MPMenu가 아닌 이유

행이 **무엇인지**가 다르기 때문입니다.

[MPMenu](../inputs/menu)는 행동을 담으므로 행이 `menuitem`이고, 전체가 방향키를 가져갔다가 Escape에서 돌려주는 위젯입니다. 이것은 링크를 담으므로 진짜 `<a>`로 가득한 `<nav>`입니다. 그래서 모든 목적지가 스크린 리더의 링크 목록에, 브라우저의 상태 표시줄에, 가운데 클릭 메뉴에, 크롤러의 색인에 들어갑니다.

규칙은 짧습니다.

> 행이 무언가를 **하면** 메뉴, 행이 어딘가로 **가면** 이것.

링크가 든 패널을 여는 "제품 ▾"도 여전히 이 컴포넌트입니다. 트리거는 펼치고, 펼쳐진 것은 전부 목적지입니다.

## 하나의 패널, 크기가 바뀌는

한 번에 하나의 패널이 열려 있고, 닫았다 다시 여는 대신 아이템 사이에서 **크기가 바뀝니다**. Base UI가 하는 일이고, 팝업이 불투명도뿐 아니라 너비와 높이도 애니메이션하는 이유입니다. 행을 가로지르는 것은 포인터를 따라오는 하나의 면으로 읽혀야지, 세 장의 시트가 깜빡이는 것으로 읽혀서는 안 됩니다.

면 자체는 MD3의 메뉴 표면입니다. `corner-extra-small` 아래 레벨 2의 `surface-container`. [MPMenu](../inputs/menu)와 [MPSelect](../inputs/select)가 내리는 것과 같은 세 가지 결정입니다. 한 페이지에서 서로 맞지 않는 떠 있는 시트 셋은 눈이 따로따로 익혀야 하는 표면 셋입니다.

## 아이템은 링크이거나 트리거입니다

`href`가 있고 자식이 없는 `MPNavigationMenuItem`은 링크입니다. 자식이 있으면 트리거와 패널입니다. 세 번째 모양은 없고, 그 차이는 겉모습이 아닙니다. 앞의 것은 목적지로, 뒤의 것은 펼쳐지는 것으로 알려집니다.

```tsx
// 목적지.
<MPNavigationMenuItem label="가격" href="/pricing" />

// 트리거, 그리고 그것이 드러내는 것.
<MPNavigationMenuItem value="product" label="제품" columns={2}>
  <MPNavigationMenuLink href="/overview" title="개요" description="무엇을 하는지" />
</MPNavigationMenuItem>
```

`columns`가 목록을 메가 메뉴로 바꿉니다. 평범한 그리드라서, 링크 넷에 `columns={2}`면 두 줄에 둘씩입니다.

## MPNavigationMenuLink

<PropsTable name="MPNavigationMenuLink" />

패널 안의 한 행입니다. 어디로 가는지, 뭐라고 불리는지, 그리고 거기에 무엇이 있는지 말하는 한 줄.

쓸 값어치가 있는 부분은 `description`입니다. 제목만 늘어선 패널은 독자가 짐작해야 하는 패널이지만, 한 줄씩만 있으면 아무것도 열지 않고도 고를 수 있는 것이 됩니다.

## orientation

<Demo src="navigation-menu/vertical" :minHeight="220">

<<< @/.vitepress/demos/navigation-menu/vertical.tsx

</Demo>

`vertical`은 패널이 아래가 아니라 **옆으로** 열리는 레일이고, 방향키도 그에 맞춰 따라갑니다. 나머지는 그대로입니다. 행은 같은 링크와 같은 트리거이고, 그래서 내비게이션으로 가득한 헤더와 그것으로 가득한 [MPSidebar](./sidebar)가 같은 컴포넌트입니다.

## 어디에 놓는지

[MPHeader](./header)의 가운데 슬롯입니다. 그 슬롯이 정확히 그것을 위한 자리입니다.

```tsx
<MPHeader brand="Acme" actions={<MPButton size="sm">로그인</MPButton>}>
  <MPNavigationMenu aria-label="주요 메뉴">…</MPNavigationMenu>
</MPHeader>
```

헤더의 가운데 슬롯은 자기 타입 스케일을 갖지 않으므로 메뉴는 자기 것을 그대로 유지합니다 — [MPHeader](./header#세-개의-슬롯)를 보세요.

## 아이템의 props

<PropsTable name="MPNavigationMenuItem" />

## 접근성

- 루트는 `<nav>`입니다. 페이지에 둘 이상 있다면 `aria-label`을 주세요. "navigation"이 둘이면 어느 쪽이 어느 쪽인지 전혀 알 수 없습니다.
- 트리거는 `aria-expanded`를 달고 자기 패널을 소유합니다. 링크는 둘 다 없습니다. 아무것도 펼치지 않으니까요.
- 패널의 모든 행은 `href`를 가진 진짜 `<a>`입니다. 메뉴 대신 이것을 쓰는 이유의 전부입니다.
- 비활성 아이템은 명세의 38%로 행에 남고 아무것도 열지 않습니다.
- 트리거의 셰브런은 `aria-hidden`입니다. `aria-expanded`가 이미 알리고 있는 상태의 그림이기 때문입니다.

## 함께 보기

- [MPMenu](../inputs/menu) — 무언가를 **하는** 행을 위한 같은 모양.
- [MPHeader](./header) — 보통 이것이 놓이는 바.
- [MPSidebar](./sidebar) — `vertical`인 것이 놓이는 자리.
- [MPBreadcrumb](../display/breadcrumb) — 갈 수 있는 곳이 아니라 지금 있는 곳.
