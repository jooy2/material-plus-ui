---
title: MPToolbar
order: 24
---

# MPToolbar

<p class="mp-lede">컨트롤이 늘어선 바. 애플리케이션 헤더, 페이지의 액션 행, 에디터 아래쪽의 띠. 슬롯 셋과 행 하나입니다.</p>

<Demo src="toolbar/hero" :minHeight="220" />

::: fw react

```tsx
import { MPToolbar } from 'material-plus-ui';

<MPToolbar render={<header />} position="sticky" divider start={<Logo />} end={<Actions />}>
  <Title />
</MPToolbar>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPToolbar(
  divider: true,
  start: const BrandMark(),
  end: const HeaderActions(),
  child: const PageTitle(),
);
```

:::

## Props

<PropsTable name="MPToolbar" />

## 슬롯 셋

`start`와 `end`는 각자의 끝에 고정되고 가운데(React는 `children`, Flutter는 `child`)가 남는 만큼을 가집니다. 툴바가 언제나 가져 온 배치가 그것이라서, 호출부와 그들이 기억해야 할 스페이서 `<div>`에 맡기는 대신 여기서 처리합니다.

가운데는 아무것도 없어도 자리를 지킵니다. 그러지 않으면 로고와 버튼만 있는 바가 그 둘을 한가운데로 모아 버립니다.

::: fw flutter

`start`와 `end`는 위젯을 하나씩 받습니다. 액션이 둘이면 데모의 검색 버튼과 **Deploy**처럼 `Row`로 묶어서 넘기고, 둘 사이 간격도 그 `Row`에서 정합니다.

:::

## 높이를 받지 않습니다

툴바는 안의 컨트롤 높이에 자기 여백을 더한 만큼입니다. 그 여백은 다른 모든 면이 쓰는 `size`/`density` 짝입니다. 그래서 좁은 바는 같은 뜻의 두 번째 prop이 아니라 `density={-2}`(Flutter에서는 `density: -2`)이고, 글자 크기는 움직이지 않습니다. `density`가 나오는 모든 곳에서 지키는 규칙입니다.

## `role="toolbar"`가 없습니다. 의도한 것입니다

그 role은 키보드 동작에 대한 약속입니다. 바 전체가 탭 스톱 하나이고, 그 안의 컨트롤 사이는 화살표 키로 옮겨 다닌다는 것. 구현하지 않고 그 role만 다는 바는 아무것도 주장하지 않는 바보다 키보드 독자에게 나쁩니다. 화살표를 누르라는 말을 듣고 눌렀는데 아무 일도 일어나지 않기 때문입니다.

::: fw react

- 페이지의 헤더가 원하는 것은 `render={<header />}`입니다. 랜드마크이고, 사실입니다.
- 진짜 roving focus 툴바가 원하는 것은 [MPButtonGroup](../inputs/button-group)이고, 그것이 바로 그것입니다.

:::

::: fw flutter

- 바는 포커스 지점도, 자기 시맨틱 노드도 따로 만들지 않습니다. 화면 낭독기가 하나의 이름 있는 묶음으로 들어야 할 때는 `semanticLabel`을 주세요.
- 진짜 roving focus 툴바가 원하는 것은 [MPButtonGroup](../inputs/button-group)이고, 그것이 바로 그것입니다.

:::

## 말하기 전까지는 평평합니다

`elevation`은 기본으로 설정되지 않으므로, 고정된 바도 그림자를 그리지 않습니다. 헤더 아래의 그림자는 "이 밑에 내용이 있다"는 말이고, 그건 페이지를 스크롤한 뒤에야 사실이 됩니다. 처음부터 떠 있는 바는 아무도 아직 움직이지 않은 페이지에 대해 주장을 한 셈입니다.

스크롤을 따라가고 있다면 직접 올리세요. 아니면 평평하게 두고 `divider`를 켜세요. 실선은 내용을 향하므로 `top` 바에서는 아래, `bottom` 바에서는 위에 붙습니다.

## 고정

::: fw react

| `position` |  |
| --- | --- |
| `static` | 흐름 안에 있고 내용과 함께 스크롤돼 사라집니다 |
| `sticky` | 가장자리에 닿을 때까지 흐름 안에 있다가 거기 붙듭니다. 자기 자리를 차지하므로 아래 것에 여백을 줄 필요가 없습니다 |
| `fixed` | 흐름 밖으로 완전히 나갑니다. 페이지가 스스로 여백을 줘야 하고, 아니면 첫 화면이 바 뒤에 깔립니다 |
| `absolute` | 창이 아니라 가장 가까운 positioned 조상에 고정됩니다. 패널 가장자리의 바에 씁니다 |

고정된 바는 모서리를 버립니다. 화면 가장자리에 붙은 둥근 모서리는 뒤에 아무것도 없는 틈이라서, 흐름 안에 앉은 바만 모서리를 가진 시트입니다.

:::

::: fw flutter

Flutter 위젯은 부모가 놓는 자리에 놓이므로 `position`이 없습니다. 제자리에 머물러야 하는 바는 화면 레이아웃에 넣습니다. `Column`에서 스크롤 뷰 위에 두거나, `Stack`으로 그 위에 겹칩니다.

React 바가 위치에서 끌어내는 것은 모서리를 가질지 여부입니다. Flutter에서는 그것이 `rounded`이고 기본값은 켜짐입니다. 화면 가장자리에 붙인 바에서는 끄세요. 그 자리의 둥근 모서리는 뒤에 아무것도 없는 틈입니다. `side`는 바가 어느 쪽을 향하는지를 말하고, 구분선이 그어질 가장자리를 정합니다.

```dart
MPToolbar(rounded: false, divider: true, side: MPToolbarSide.bottom, child: editorActions)
```

:::

## 이것이 아닌 것

[MPHeader](./header)가 아닙니다. 그쪽은 [MPPageLayout](./page-layout)의 슬롯이고 사이드바와 건너뛰기 링크와 폰에서 열리는 드로어를 압니다. 이것은 카드 안을 포함해 어디에나 놓을 수 있는 바입니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `children` | `child` | 가운데를 부르는 Flutter의 이름입니다. |
| `position` | `rounded` | 설정할 CSS position이 없습니다. 바는 부모가 놓는 자리에 놓이고, React가 위치에서 끌어내는 단 하나인 모서리는 따로 플래그로 받습니다. |
| `position`과 함께 쓰는 `side` | `side` | 구분선이 어느 가장자리를 향할지만 정합니다. |
| `render` | `semanticLabel` | 대신 렌더할 `<header>` 엘리먼트도, 주장할 banner 랜드마크도 없습니다. 화면 낭독기에 줄 수 있는 것은 이름입니다. |
| `className`, `style`, `div`가 받는 속성 | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::
