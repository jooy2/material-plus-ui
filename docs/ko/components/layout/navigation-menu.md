---
title: MPNavigationMenu
order: 18
---

# MPNavigationMenu

<p class="mp-lede">사이트의 내비게이션입니다. 목적지가 늘어선 행이고, 그중 몇몇은 더 많은 목적지가 든 패널을 엽니다.</p>

<Demo src="navigation-menu/hero" :minHeight="240" />

::: fw react

```tsx
import { MPNavigationMenu, MPNavigationMenuItem, MPNavigationMenuLink } from 'material-plus-ui';

<MPNavigationMenu aria-label="주요 메뉴">
  <MPNavigationMenuItem value="product" label="제품">
    <MPNavigationMenuLink href="/overview" title="개요" description="무엇을 하는지" />
  </MPNavigationMenuItem>
  <MPNavigationMenuItem label="가격" href="/pricing" />
</MPNavigationMenu>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPNavigationMenu(
  semanticLabel: '주요 메뉴',
  items: <MPNavigationMenuItem>[
    MPNavigationMenuItem(
      value: 'product',
      label: '제품',
      links: <MPNavigationMenuLink>[
        MPNavigationMenuLink(
          title: '개요',
          description: '무엇을 하는지',
          onPressed: () => router.go('/overview'),
        ),
      ],
    ),
    MPNavigationMenuItem(label: '가격', onPressed: () => router.go('/pricing')),
  ],
);
```

:::

## Props

<PropsTable name="MPNavigationMenu" />

## 이것이 MPMenu가 아닌 이유

행이 **무엇인지**가 다르기 때문입니다.

::: fw react

[MPMenu](../inputs/menu)는 행동을 담으므로 행이 `menuitem`이고, 전체가 방향키를 가져갔다가 Escape에서 돌려주는 위젯입니다. 이것은 링크를 담으므로 진짜 `<a>`로 가득한 `<nav>`입니다. 그래서 모든 목적지가 스크린 리더의 링크 목록에, 브라우저의 상태 표시줄에, 가운데 클릭 메뉴에, 크롤러의 색인에 들어갑니다.

:::

::: fw flutter

[MPMenu](../inputs/menu)는 행동을 담으므로 행이 menu item이고, 전체가 방향키를 가져갔다가 Escape에서 돌려주는 위젯입니다. 이것은 목적지를 담으므로 행이 링크로 읽히는 내비게이션 영역이고, 각 행은 `onPressed`에서 앱의 라우터를 부릅니다.

:::

규칙은 짧습니다.

> 행이 무언가를 **하면** 메뉴, 행이 어딘가로 **가면** 이것.

링크가 든 패널을 여는 "제품 ▾"도 여전히 이 컴포넌트입니다. 트리거는 펼치고, 펼쳐진 것은 전부 목적지입니다.

## 하나의 패널, 크기가 바뀌는

::: fw react

한 번에 하나의 패널이 열려 있고, 닫았다 다시 여는 대신 아이템 사이에서 **크기가 바뀝니다**. Base UI가 하는 일이고, 팝업이 불투명도뿐 아니라 너비와 높이도 애니메이션하는 이유입니다. 행을 가로지르는 것은 포인터를 따라오는 하나의 면으로 읽혀야지, 세 장의 시트가 깜빡이는 것으로 읽혀서는 안 됩니다.

:::

::: fw flutter

한 번에 하나의 패널만 열립니다. 아이템마다 자기 패널을 매달기 때문에, 행을 가로지르면 시트 하나가 크기를 바꾸는 대신 한 패널이 사라지고 다음 패널이 나타납니다. 열린 패널에서 다음 아이템으로 건너가면 바로 열리고, 첫 패널은 `delay`만큼 기다렸다가 열립니다. 다른 곳으로 가는 길에 행을 스쳐 지나가는 포인터가 화면 위에 패널을 떨어뜨리지 않게 하려는 것입니다.

:::

면 자체는 MD3의 메뉴 표면입니다. `corner-extra-small` 아래 레벨 2의 `surface-container`. [MPMenu](../inputs/menu)와 [MPSelect](../inputs/select)가 내리는 것과 같은 세 가지 결정입니다. 한 페이지에서 서로 맞지 않는 떠 있는 시트 셋은 눈이 따로따로 익혀야 하는 표면 셋입니다.

## 아이템은 링크이거나 트리거입니다

`href`가 있고 자식이 없는 `MPNavigationMenuItem`은 링크입니다. Flutter에서는 `onPressed`가 있고 `links`가 없는 아이템입니다. 자식이 있으면 트리거와 패널입니다. 세 번째 모양은 없고, 그 차이는 겉모습이 아닙니다. 앞의 것은 목적지로, 뒤의 것은 펼쳐지는 것으로 읽힙니다.

::: fw react

```tsx
// 목적지.
<MPNavigationMenuItem label="가격" href="/pricing" />

// 트리거, 그리고 그것이 드러내는 것.
<MPNavigationMenuItem value="product" label="제품" columns={2}>
  <MPNavigationMenuLink href="/overview" title="개요" description="무엇을 하는지" />
</MPNavigationMenuItem>
```

:::

::: fw flutter

```dart
// 목적지.
MPNavigationMenuItem(label: '가격', onPressed: () => router.go('/pricing'))

// 트리거, 그리고 그것이 드러내는 것.
MPNavigationMenuItem(
  value: 'product',
  label: '제품',
  columns: 2,
  links: <MPNavigationMenuLink>[
    MPNavigationMenuLink(title: '개요', description: '무엇을 하는지', onPressed: openOverview),
  ],
)
```

:::

`columns`가 목록을 메가 메뉴로 바꿉니다. 평범한 그리드라서, 링크 넷에 `columns: 2`면 두 줄에 둘씩이고, 줄마다 가장 높은 링크에 높이를 맞춥니다.

## MPNavigationMenuLink

<PropsTable name="MPNavigationMenuLink" />

패널 안의 한 행입니다. 어디로 가는지, 뭐라고 불리는지, 그리고 거기에 무엇이 있는지 말하는 한 줄.

쓸 값어치가 있는 부분은 `description`입니다. 제목만 늘어선 패널은 독자가 짐작해야 하는 패널이지만, 한 줄씩만 있으면 아무것도 열지 않고도 고를 수 있는 것이 됩니다.

## orientation

<Demo src="navigation-menu/vertical" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/navigation-menu/vertical.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/navigation_menu/vertical.dart

:::

</Demo>

`vertical`은 패널이 아래가 아니라 **옆으로** 열리는 레일이고, 방향키도 그에 맞춰 따라갑니다. 나머지는 그대로입니다. 행은 같은 링크와 같은 트리거이고, 그래서 내비게이션으로 가득한 헤더와 그것으로 가득한 [MPSidebar](./sidebar)가 같은 컴포넌트입니다.

## 어디에 놓는지

::: fw react

[MPHeader](./header)의 가운데 슬롯입니다. 그 슬롯이 정확히 그것을 위한 자리입니다.

```tsx
<MPHeader brand="Acme" actions={<MPButton size="sm">로그인</MPButton>}>
  <MPNavigationMenu aria-label="주요 메뉴">…</MPNavigationMenu>
</MPHeader>
```

헤더의 가운데 슬롯은 자기 타입 스케일을 갖지 않으므로 메뉴는 자기 것을 그대로 유지합니다. [MPHeader](./header#세-개의-슬롯)를 보세요.

:::

::: fw flutter

[MPHeader](./header)의 가운데 슬롯입니다. 그 슬롯이 정확히 그것을 위한 자리입니다.

```dart
MPHeader(
  brand: const <Widget>[Text('Acme')],
  actions: <Widget>[
    MPButton(size: MPSize.sm, onPressed: signIn, child: const Text('로그인')),
  ],
  child: MPNavigationMenu(semanticLabel: '주요 메뉴', items: items),
)
```

헤더의 가운데 슬롯은 자기 타입 스케일을 갖지 않으므로 메뉴는 자기 것을 그대로 유지합니다. 행도 자기 표면을 그리지 않아서 바의 표면을 그대로 씁니다. [MPHeader](./header#세-개의-슬롯)를 보세요.

:::

::: fw react

## 크롤러를 위해

기본값에서 닫힌 패널은 페이지에 아예 없습니다. 서버가 보내는 HTML에도, 크롤러가 렌더링하는 문서에도 없습니다. 그래서 패널 안에만 있는 링크는 검색 엔진이 한 번도 보지 못하는 링크입니다. `keepMounted`를 주면 모든 패널의 링크가 서버 마크업에 숨겨진 채로 들어가고, 그 뒤로도 문서에 남습니다.

```tsx
<MPNavigationMenu aria-label="Main" keepMounted>
  …
</MPNavigationMenu>
```

비용은 모든 페이지에 들어가는 패널 마크업이고, 보통 링크 수십 개입니다. 중요한 목적지를 늘 페이지에 있는 다른 곳에서도 링크하는 사이트라면 필요하지 않습니다.

:::

## 아이템의 props

<PropsTable name="MPNavigationMenuItem" />

## 접근성

::: fw react

- 루트는 `<nav>`입니다. 페이지에 둘 이상 있다면 `aria-label`을 주세요. "navigation"이 둘이면 어느 쪽이 어느 쪽인지 알 수 없습니다.
- 트리거는 `aria-expanded`를 달고 자기 패널을 소유합니다. 링크에는 둘 다 없습니다. 아무것도 펼치지 않기 때문입니다.
- 패널의 모든 행은 `href`를 가진 진짜 `<a>`입니다. 메뉴 대신 이것을 쓰는 이유가 바로 이것입니다.
- 비활성 아이템은 명세의 38%로 행에 남고 아무것도 열지 않습니다.
- 트리거의 셰브런은 `aria-hidden`입니다. `aria-expanded`가 이미 알리는 상태를 그림으로 그린 것이기 때문입니다.

:::

::: fw flutter

- 루트는 navigation role을 가진 노드이고 이름은 `semanticLabel`입니다. 화면에 내비게이션 영역이 둘 이상이면 이름을 주세요. Flutter는 디버그 빌드에서 이름 없는 영역 둘을 받아들이지 않습니다.
- 트리거는 패널이 펼쳐졌는지를 말하는 버튼입니다. 목적지는 링크이고 펼침에 대해서는 말하지 않습니다. 패널의 행도 모두 링크입니다.
- 아이템마다 따로 포커스 지점이 됩니다. 행 방향의 방향키는 아이템 사이를 옮겨 다니며 비활성 아이템을 건너뛰고, <kbd>Home</kbd>과 <kbd>End</kbd>는 양 끝으로 갑니다.
- 가로 행에서는 아래 방향키가, 세로 레일에서는 가로지르는 방향키가 트리거의 패널을 열고 그 안으로 들어갑니다. 패널 안에서는 위아래 방향키로 링크를 옮겨 다닙니다. 패널이 열린 트리거에서 <kbd>Tab</kbd>을 누르면 패널로 들어가고, 마지막 링크에서 누르면 패널을 닫고 다음 아이템으로 갑니다. <kbd>Esc</kbd>는 패널을 닫고 트리거로 돌아갑니다.
- 비활성 아이템은 명세의 38%로 행에 남고 아무것도 열지 않습니다.
- 셰브런은 트리거 노드 안에 그리고 읽지 않습니다. 노드가 이미 알리는 상태를 그림으로 그린 것이기 때문입니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 조합하는 아이템과 링크 | `items`, `links` 목록 | 메뉴가 아이템마다 포커스 노드를, 패널마다 링크의 노드를 나눠 주므로 무엇을 담는지 알아야 합니다. |
| `href`, `target`, `rel`, `render` | `onPressed` | 링크 엘리먼트도 라우터도 이 패키지에는 없습니다. 앱의 라우터는 `onPressed`에서 부릅니다. |
| `value` | — | 어느 패널이 열렸는지는 포인터와 키보드의 상태이고, `String?`으로는 "제어하지 않음"과 "제어하면서 닫힘"을 구분할 수 없습니다. `initialValue`와 `onChanged`는 있습니다. |
| `defaultValue`, `onValueChange` | `initialValue`, `onChanged` | Flutter의 이름입니다. |
| 밀리초 단위의 `delay`, `closeDelay` | `Duration` | 시간 길이에 Flutter가 쓰는 타입입니다. |
| 아이템 사이에서 크기를 바꾸는 패널 하나 | 아이템마다 페이드되는 패널 | 패널이 저마다 자기 아이템에 매달리므로 크기를 바꿀 공유 뷰포트가 없습니다. |
| `keepMounted` | — | Flutter 앱을 훑는 크롤러가 없고, 닫힌 패널의 링크는 화면에 없으니 찾을 수도 없습니다. |
| `aria-label` | `semanticLabel` | Flutter의 이름입니다. |
| `className`, `style` | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPMenu](../inputs/menu) — 무언가를 **하는** 행을 위한 같은 모양.
- [MPHeader](./header) — 보통 이것이 놓이는 바.
- [MPSidebar](./sidebar) — `vertical`인 것이 놓이는 자리.
- [MPBreadcrumb](../display/breadcrumb) — 갈 수 있는 곳이 아니라 지금 있는 곳.
