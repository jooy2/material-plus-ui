---
title: MPMenubar
order: 16
---

# MPMenubar

<p class="mp-lede">애플리케이션 맨 위에 놓이는 단어 띠입니다. File, Edit, View처럼 단어마다 메뉴를 하나씩 엽니다.</p>

<Demo src="menubar/hero" :minHeight="200" />

::: fw react

```tsx
import { MPMenubar, MPMenubarMenu, MPMenuItem } from 'material-plus-ui';

<MPMenubar>
  <MPMenubarMenu label="파일">
    <MPMenuItem shortcut="Mod+N" onClick={create}>
      새로 만들기
    </MPMenuItem>
  </MPMenubarMenu>
</MPMenubar>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPMenubar(
  menus: <MPMenubarMenu>[
    MPMenubarMenu(
      label: '파일',
      items: <MPMenuEntry>[
        MPMenuItem(label: '새로 만들기', shortcut: 'Mod+N', onPressed: create),
      ],
    ),
  ],
);
```

:::

## Props

<PropsTable name="MPMenubar" />

## 메뉴의 행이 아니라 바인 이유

하나가 **열린 뒤에** 무슨 일이 일어나는지가 다릅니다.

띠를 따라 움직이면 떠나온 메뉴가 닫히는 대신 다른 메뉴들을 걸어 지나가고, 방향키는 메뉴 안뿐 아니라 메뉴 사이도 움직입니다. 나란히 놓인 별개의 [MPMenu](./menu) 셋은 둘 다 하지 못합니다. 하나에서 다음으로 건너가면 앞의 것이 닫히고 아무것도 열리지 않습니다.

::: fw react

이 동작은 모두 Base UI가 맡고, `menubar` role도 Base UI가 붙입니다. 이 role 덕분에 스크린 리더는 이 띠를 서로 무관한 버튼 여섯 개가 아니라 **탭 정지가 하나인 위젯 하나**로 읽습니다.

:::

::: fw flutter

여기서는 바가 직접 맡습니다. 한 번에 메뉴 하나만 열리고, 포인터가 올라간 단어가 열린 메뉴 대신 자기 메뉴를 엽니다. 열린 메뉴에 하위 메뉴가 없는 행에서 띠 방향의 방향키를 누르면 다음 메뉴가 첫 행을 밝힌 채로 열립니다. 바는 menu bar role을 가진 노드이고, 덕분에 스크린 리더는 이 띠를 서로 무관한 버튼 여섯 개가 아니라 **탭 정지가 하나인 위젯 하나**로 읽습니다.

:::

## 말은 버튼이 아닙니다

메뉴 바의 행은 컨트롤 사다리보다 한 단 아래로 그려지고, 이유는 메뉴 바가 **무엇 위에** 놓이는지에 있습니다.

거의 언제나 이미 자기 높이를 가진 무언가 안에 놓입니다. [MPHeader](../layout/header), 타이틀 바, 툴바. 컨트롤 높이로 그리면 `File Edit View`는 나란히 놓인 버튼 셋이 되고, 띠는 자기가 올라앉은 것보다 높아집니다.

말은 MD3의 `label-large`를 가져갑니다. [MPMenu](./menu) 자신의 행이 가져가는 것과 같은 역할입니다. 바 위의 말과 그 뒤의 행은 하나의 객체이기 때문입니다. 띠를 컨트롤의 `title-medium`으로 설정하면 바가 목록을 여는 버튼들의 행으로 읽힙니다.

## 표면을 그리지 않는 이유

같은 이유입니다. 이미 시트 위에 있는 띠 아래의 시트는 시트 둘이고, 두 번째 것에는 할 말이 없습니다. [MPContainer](../layout/container#표면을-그리지-않는-이유)가 하는 거절을 한 단계 아래에서 하는 것입니다.

무언가 위에 놓으세요.

::: fw react

```tsx
<MPHeader brand="Acme" size="sm">
  <MPMenubar size="sm">…</MPMenubar>
</MPHeader>
```

:::

::: fw flutter

```dart
MPHeader(
  brand: const <Widget>[Text('Acme')],
  size: MPSize.sm,
  child: MPMenubar(size: MPSize.sm, menus: menus),
)
```

:::

## 어느 말이 열려 있는지

색, 그리고 색뿐입니다. 열린 말이 강조색을 가져가고 상태 레이어가 그 아래에 켜진 채로 남습니다.

말은 움직이지 않고 띠의 높이도 바뀌지 않습니다. 여기서는 그것이 거의 어디서보다 중요합니다. 바를 가로지르는 독자는 밑에서 빠져나가면 안 되는 과녁을 가리키고 있고, 띠 위의 모든 말이 과녁이니까요.

## MPMenubarMenu

<PropsTable name="MPMenubarMenu" />

바 위의 메뉴 하나입니다. 말, 그리고 그 뒤의 행들.

자기 `size`도 `color`도 없습니다. 둘 다 바의 것이고, 바가 한 번 정해서 모든 메뉴에 통하게 할 수 있는 유일한 자리입니다. 안의 행은 [MPMenu](./menu)가 받는 것과 같은 `MPMenuItem`, `MPMenuSeparator`, `MPMenuGroup`, `MPMenuCheckboxItem`, `MPMenuRadioItem`, `MPMenuSubmenu`입니다. 같은 메뉴이기 때문입니다.

::: fw react

```tsx
<MPMenubarMenu label="보기">
  <MPMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
    눈금자
  </MPMenuCheckboxItem>
  <MPMenuSubmenu label="확대">
    <MPMenuItem onClick={() => zoom(2)}>200%</MPMenuItem>
  </MPMenuSubmenu>
</MPMenubarMenu>
```

:::

::: fw flutter

```dart
MPMenubarMenu(
  label: '보기',
  items: <MPMenuEntry>[
    MPMenuCheckboxItem(
      label: '눈금자',
      checked: rulers,
      onChanged: (bool next) => setState(() => rulers = next),
    ),
    MPMenuSubmenu(
      label: '확대',
      items: <MPMenuEntry>[MPMenuItem(label: '200%', onPressed: () => zoom(2))],
    ),
  ],
)
```

:::

## 이것이 맞지 않을 때

띠가 담을 수 있는 것보다 행동이 많을 때입니다.

메뉴 바의 장점 전부는 찾으러 가기 전부터 모든 제목이 보인다는 것이고, 말이 열두 개인 바는 이미 그것을 잃었습니다. 그건 [MPCommandPalette](./command-palette)입니다. 독자는 그것이 어느 제목 아래 정리되었는지 기억하는 대신 원하는 것을 입력합니다.

둘은 함께 잘 지냅니다. `Mod+K`에 묶인 팔레트와 말 다섯 개짜리 바는, 아는 독자에게는 빠르고 모르는 독자에게는 읽히는 제품입니다.

## 접근성

::: fw react

- 띠는 탭 정지 하나를 가진 `menubar`입니다. Tab은 바 전체를 건너뛰고, 방향키가 그 안을 움직입니다.
- 각 단어는 `aria-haspopup`과 `aria-expanded`를 단 `menuitem`이고, 자기 메뉴를 소유합니다.

:::

::: fw flutter

- 띠는 menu bar role을 가진 노드이고 탭 정지는 하나입니다. Tab은 바 전체를 건너뛰고, 띠 방향의 방향키는 단어 사이를 옮겨 다니며 `loopFocus`를 끄지 않는 한 양 끝에서 돌아갑니다. <kbd>Home</kbd>과 <kbd>End</kbd>는 양 끝으로 갑니다. 방향 내비게이션에서는 방향키가 양 끝에서 멈추고, 끝을 넘는 방향키는 다음 컨트롤로 넘어갑니다.
- 가로 띠에서는 아래 방향키가, 세로 띠에서는 가로지르는 방향키가 단어의 메뉴를 첫 행을 밝힌 채로 엽니다. 메뉴가 열려 있을 때 하위 메뉴가 없는 행에서 띠 방향의 방향키를 누르면 다음 메뉴가 열립니다.
- 각 단어는 menu item role을 가진 노드이고 메뉴가 펼쳐졌는지를 말합니다. 메뉴가 닫히면 포커스는 그 단어로 돌아갑니다.

:::

- 비활성 단어는 명세의 38%로 띠에 남고 아무것도 열지 않습니다.
- 포커스 링은 단어 **안쪽**에 그립니다. 이 라이브러리에서 링을 안쪽에 그리는 유일한 곳입니다. 단어 띠에는 링을 그릴 틈이 없어서, 바깥쪽에 그리면 다음 단어 밑에 깔립니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 바의 children인 `MPMenubarMenu` | `menus: List<MPMenubarMenu>` | 바가 메뉴마다 포커스 노드와 방향키 순서상의 자리를 나눠 주므로, 무엇을 담는지 알아야 합니다. |
| `MPMenubarMenu` 안에 조합하는 행 | `items: List<MPMenuEntry>` | `MPMenu`가 받는 것과 같은 설명입니다. [MPMenu](./menu#왜-행을-설명으로-넘기는가)를 보세요. |
| `modal` | — | 열린 메뉴는 `MPMenu`처럼 자기 단어에 매달리고, 바깥을 누르면 닫힙니다. |
| `aria-label` | `semanticLabel` | Flutter의 이름입니다. |
| 바나 단어의 `className`, `style` | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPMenu](./menu) — 혼자 서 있는 메뉴 하나, 그리고 둘이 공유하는 행들.
- [MPCommandPalette](./command-palette) — 띠가 다 차고 난 뒤 행동들이 가는 곳.
- [MPHeader](../layout/header) — 메뉴 바가 보통 올라앉는 바.
- [MPNavigationMenu](../layout/navigation-menu) — 무언가를 **하는** 행이 아니라 어딘가로 **가는** 행을 위한 같은 띠 모양.
