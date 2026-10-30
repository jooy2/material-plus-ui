---
title: MPHeader
order: 15
---

# MPHeader

<p class="mp-lede">페이지 맨 위를 가로지르는 바입니다. MD3의 top app bar 위에 사이트 자신의 세 구역 — 마크, 가운데, 액션 — 을 올린 것입니다.</p>

<Demo src="header/hero" :minHeight="220" />

::: fw react

```tsx
import { MPHeader, MPButton } from 'material-plus-ui';

<MPHeader brand="Acme" actions={<MPButton size="sm">로그인</MPButton>}>
  <nav>…</nav>
</MPHeader>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHeader(
  brand: const <Widget>[Text('Acme')],
  actions: <Widget>[MPButton(size: MPSize.sm, onPressed: signIn, child: const Text('Sign in'))],
  child: navigation,
);
```

:::

## Props

<PropsTable name="MPHeader" />

::: fw react

## div 몇 개가 아니라 컴포넌트인 이유

문서 최상위의 `<header>`가 곧 `banner` 랜드마크이기 때문입니다.

그 태그는 스크린 리더의 랜드마크 목록도, 리더 모드도, 검색 엔진의 페이지 이해도 전부 그 위에 지어지는 것이고, 스타일 입힌 `<div>`가 될 수 없는 유일한 것입니다. 나머지 — 세 구역, 사다리, 표면 — 는 그 태그를 쓰기 편하게 만드는 부분입니다.

:::

::: fw flutter

## 행 하나가 아니라 위젯인 이유

세 구역이 서로를 기준으로 배치되기 때문입니다. 가운데가 바 자체의 중심선에 놓이려면 양 끝을 위젯이 직접 재야 합니다. 사다리, 표면, 아래쪽 실선 하나가 그것을 쓰기 편하게 만듭니다.

Flutter의 시맨틱에는 `banner` 역할이 없으므로 바는 스스로 역할을 주장하지 않습니다. `semanticLabel`을 주면 이름 있는 랜드마크 영역이 됩니다.

:::

## 세 개의 슬롯

::: fw react

`brand`, `children`, `actions`를 그 순서로 배치합니다. compound 서브컴포넌트가 아니라 prop인 것은 [MPCard](./card#구획이-prop인-이유)의 근거 그대로입니다. 바의 배치는 고정되어 있고, 호출자가 정하고 싶은 것은 각 구역에 무엇이 들어가는지입니다.

:::

::: fw flutter

Dart에서 슬롯은 `brand`, `child`, `actions`입니다. `brand`와 `actions`는 리스트이고 슬롯 고유의 간격으로 한 줄에 놓이므로, 로고와 이름이나 버튼 두 개를 위해 따로 행을 만들 필요가 없습니다. 가운데가 없어도 액션은 바의 끝에 놓입니다.

:::

여기에는 두 번째 이유가 있습니다. 가운데를 바 자신의 중심선에 놓으려면 양 끝이 컴포넌트의 것이어야 합니다. 래퍼 세 개를 손으로 쌓는 호출자에게는 양 끝을 같게 만들 방법이 없고, 그러면 제목이 브랜드가 끝나는 자리마다 다르게 놓입니다.

비어 있는 슬롯은 아무것도 그리지 않습니다. 래퍼도 간격도 없습니다.

타입 역할을 갖는 것은 **brand**뿐입니다. `md`에서 `title-large`, MD3의 top app bar 제목 역할입니다. 가운데는 제목만큼이나 링크 행이나 검색 필드일 가능성이 높고, 거기에 스케일을 강요하면 모든 링크가 그것을 되돌려야 합니다.

## align

<Demo src="header/align" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/header/align.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/header/align.dart

:::

</Demo>

`center`는 MD3 자신의 **center-aligned top app bar**이고, 남은 공간이 아니라 _바_ 를 기준으로 가운데입니다.

이 차이가 이것이 prop인 이유의 전부입니다. 남은 공간을 기준으로 하면 가운데가 브랜드 끝나는 자리에 놓이므로, 이름이 한 글자 길어지면 제목이 움직입니다. 그건 한 사이트의 두 페이지를 오갈 때 독자가 정확히 알아채는 것입니다. 그래서 양 끝에 같은 몫을 줍니다. 같은 끝은 안에 무엇이 있든 가운데를 중심선에 놓습니다. 아무것도 없는 끝도 자기 몫을 그대로 가져갑니다.

## variant

<Demo src="header/variant" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/header/variant.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/header/variant.dart

:::

</Demo>

**컨테이너**의 사다리입니다. 바는 남의 내용을 담고, 바를 물들이면 그 내용이 물듭니다 — 근거는 [MPBox](./box#절대-물들지-않고-color도-받지-않는-이유)의 것입니다.

| Variant    | 무엇을 칠하는지                              |
| ---------- | -------------------------------------------- |
| `tonal`    | `surface-container` — MD3의 **스크롤된** 바  |
| `outlined` | `surface`, 아래 가장자리에 실선 하나         |
| `filled`   | `surface-container-highest`                  |
| `elevated` | 레벨 2 그림자 아래의 `surface-container-low` |
| `text`     | 아무것도 — 히어로 이미지 위의 바를 위해      |

### `divider`가 없는 이유

[MPBottomNavigation](./bottom-navigation)에는 있고 여기에는 없습니다. 차이는 이쪽이 `variant`를 받는다는 점입니다.

MD3는 바와 내용을 선이 아니라 **톤**으로 나눕니다. `surface` 위의 `surface-container`입니다. 실선이 필요한 경우는 바가 페이지 자신의 표면을 칠할 때 하나뿐이고, 그 바가 곧 `variant="outlined"`입니다. 여기서 그 선이 `outlined`의 _뜻_ 입니다. 컨테이너의 외곽선은 사방을 두르지만, 바에는 반대편에 무언가가 있는 가장자리가 정확히 하나뿐입니다. [MPDrawer](./drawer)가 자기 자유 가장자리에 대해 하는 것과 같은 특수화입니다.

::: fw react

## position

기본은 `sticky`입니다. 페이지가 거기까지 스크롤되면 창 위쪽에 붙고, 흐름 안에는 그대로 남으므로 아래의 어떤 것도 비켜설 필요가 없습니다.

`fixed`는 흐름에서 완전히 빼냅니다. [MPPageLayout](./page-layout) 안에서는 그 답이 이미 준비되어 있습니다. 레이아웃이 바를 재서 그 높이를 비워 두므로, 첫 문단이 바 밑에 깔리지 않습니다.

`static`은 함께 스크롤되어 사라집니다. 헤더가 계속 손이 가는 내비게이션이 아닌 마케팅 페이지에 맞습니다.

:::

::: fw flutter

## 바가 놓이는 자리

Flutter 화면에는 바가 붙을 문서 스크롤이 없으므로 `position`도 없습니다. 바는 놓인 자리에 머뭅니다. 스크롤되는 부분 위에 두면 내용이 아래로 지나가는 동안에도 손이 닿는 곳에 있고, [MPPageLayout](./page-layout)의 `header` 슬롯이 바로 그 자리입니다. 히어로 위의 바라면 `Stack`으로 사진 위에 겹쳐 놓으세요.

:::

::: fw react

## 레이아웃 안에서, 그리고 밖에서

[MPPageLayout](./page-layout) 안에서 바는 스스로를 등록합니다. 그래서 제자리를 지키는 열이 창의 어디부터 시작할지 알고, `fixed` 바는 높이를 미리 비워 받습니다.

밖에서는 그냥 바이고, 위의 모든 것이 그대로 성립합니다. 의도한 것입니다. 사이드바가 없는 랜딩 페이지가 헤더 하나 때문에 레이아웃을 들여올 필요는 없습니다.

:::

::: fw flutter

## MPPageLayout과 함께, 그리고 따로

[MPPageLayout](./page-layout) 안에서 바는 `header` 슬롯이 담는 것일 뿐입니다. 레이아웃의 `Column`이 바가 남긴 만큼을 아래 띠에 주므로, 잴 것도 등록할 것도 없습니다. 밖에서는 그냥 바이고, 사이드바 없는 랜딩 페이지도 레이아웃 없이 헤더를 가질 수 있습니다.

:::

## 예시

### 햄버거는 brand 슬롯에

마크 앞에 둡니다. 30년 동안 독자들이 찾도록 배운 자리입니다.

::: fw react

```tsx
<MPHeader
  brand={
    <>
      <MPSidebarTrigger />
      Acme
    </>
  }
/>
```

:::

::: fw flutter

```dart
const MPHeader(brand: <Widget>[MPSidebarTrigger(), Text('Acme')])
```

:::

[MPSidebarTrigger](./sidebar#mpsidebartrigger)는 사이드바가 접힌 동안에만 스스로를 그리므로, 여기에 조건문은 필요 없습니다.

### 아래 기사와 선 맞추기

::: fw react

```tsx
<MPHeader maxWidth="md" brand="Acme">…</MPHeader>
<MPContainer maxWidth="md">기사 본문.</MPContainer>
```

:::

::: fw flutter

```dart
Column(
  children: <Widget>[
    MPHeader(
      maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md),
      brand: const <Widget>[Text('Acme')],
      child: navigation,
    ),
    const MPContainer(
      maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
      child: Text('기사 본문.'),
    ),
  ],
)
```

:::

시트는 여전히 창 전체를 덮고, 묶이는 것은 슬롯이 놓인 행뿐입니다. 둘이 같은 사다리를 읽으므로 어느 폭에서도 한 선에 맞습니다.

### 히어로 위의 투명한 바

::: fw react

```tsx
<MPHeader variant="text" position="absolute" brand="Acme" />
```

:::

::: fw flutter

```dart
Stack(
  children: <Widget>[
    hero,
    const MPHeader(variant: MPVariant.text, brand: <Widget>[Text('Acme')]),
  ],
)
```

:::

::: fw react

`absolute`는 창이 아니라 자신이 속한 영역에 고정합니다 — [MPPosition](../../design/prop-conventions)을 보세요.

:::

## 접근성

::: fw react

- 바는 `<header>`입니다. 문서 최상위에서는 `banner` 랜드마크이고, `<article>`이나 `<section>` 안에 중첩되면 아닙니다. 그게 맞습니다. 카드 자신의 헤더는 사이트의 헤더가 아닙니다.
- 한 페이지에 둘이 있다면 `label`을 주세요. "banner"가 둘이면 어느 쪽이 어느 쪽인지 전혀 알 수 없습니다.
- 가운데 슬롯은 그 자체로 `<nav>`가 아닙니다. 안에 들어가는 것이 내비게이션이면 `<nav>`를 넣으세요. 그래야 스크린 리더가 영역으로 내놓을 수 있습니다.
- 바 자신은 탭 정지가 없습니다. 포커스를 받는 것은 전부 슬롯에 넣은 것들입니다.

:::

::: fw flutter

- Flutter에는 `banner` 역할이 없습니다. `semanticLabel`을 주면 이름 있는 랜드마크 영역이 되고, 주지 않으면 시맨틱 트리에 아무것도 더하지 않습니다.
- 한 화면에 바가 둘이면 이름을 주세요. 그래야 어느 쪽이 어느 쪽인지 알 수 있습니다.
- 바 자신은 포커스 정지점이 없습니다. 포커스를 받는 것은 전부 슬롯에 넣은 것들입니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `banner` 랜드마크인 `<header>` | `semanticLabel`을 주면 이름 있는 영역 | Flutter의 시맨틱에는 `banner` 역할이 없습니다. |
| 무엇이든 받는 `brand`, `actions` | 슬롯 간격으로 한 줄에 놓이는 `List<Widget>` | 여러 개를 묶은 프래그먼트는 Dart에서 리스트입니다. |
| `position` | — | 붙을 문서 스크롤이 없습니다. 바는 놓인 자리에 머물고, `MPPageLayout`이 스크롤 영역 위에 둡니다. |
| `MPPageLayout`에 스스로 등록 | 등록할 것이 없음 | 레이아웃의 `Column`이 이미 계산합니다. |
| `label` | `semanticLabel` | 화면 낭독기 이름을 가리키는 이 라이브러리의 Flutter 이름입니다. |
| `render` | — | 바꿔 끼울 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPPageLayout](./page-layout) — 이 바가 위쪽을 맡는 뼈대.
- [MPFooter](./footer) — 페이지 반대쪽 끝의 같은 결정들.
- [MPBottomNavigation](./bottom-navigation) — MD3의 navigation bar. 구역의 바가 아니라 목적지의 바입니다.
- [MPSidebar](./sidebar) — 내용 옆의 열, 그리고 `brand`에 들어갈 트리거.
