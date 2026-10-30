---
title: MPPageLayout
order: 14
---

# MPPageLayout

<p class="mp-lede">페이지를 걸어 두는 뼈대입니다. 헤더, 푸터, 사이드바 하나 또는 둘, 그리고 그 사이의 내용. 이 컴포넌트가 정말로 존재하는 이유는 랜드마크입니다.</p>

<Demo src="page-layout/hero" :minHeight="320" />

::: fw react

```tsx
import { MPPageLayout, MPHeader, MPSidebar, MPFooter } from 'material-plus-ui';

<MPPageLayout
  header={<MPHeader brand="Acme" />}
  sidebar={<MPSidebar>…</MPSidebar>}
  footer={<MPFooter>© 2026 Acme</MPFooter>}
>
  <MPContainer maxWidth="md">…</MPContainer>
</MPPageLayout>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPageLayout(
  header: const MPHeader(brand: <Widget>[Text('Acme')]),
  sidebar: MPSidebar(child: navigation),
  footer: const MPFooter(child: Text('© 2026 Acme')),
  child: MPContainer(maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md), child: page),
)
```

:::

## Props

<PropsTable name="MPPageLayout" />

## 레이아웃이 컴포넌트인 이유

랜드마크 때문입니다.

::: fw react

div로 조립한 페이지는 스크린 리더가 구분되지 않은 영역 하나로 내놓고 크롤러가 구분되지 않은 덩어리 하나로 읽는 페이지입니다. 같은 페이지를 `<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>`로 지으면 목차가 생깁니다. 스크린 리더가 영역을 나열하고 그 사이를 건너뛰며, 리더 모드가 본문을 찾아내고, 검색 엔진이 내비게이션과 내용을 구분합니다.

이 컴포넌트가 문서에 보태는 자기 엘리먼트는 딱 하나 — 아무 의미도 없는 `<div>` — 그리고 `<main>`과 거기로 건너뛰는 링크입니다. 나머지 랜드마크는 전부 슬롯에 건네진 것에서 나오고, 그래서 [MPHeader](./header), [MPFooter](./footer), [MPSidebar](./sidebar)는 스타일 입힌 박스가 아니라 진짜 `<header>`, `<footer>`, `<aside>`입니다.

:::

::: fw flutter

이름 없는 박스로 조립한 화면은 스크린 리더가 구분되지 않은 영역 하나로 내놓는 화면입니다. 자기가 무엇인지 말하는 위젯으로 같은 화면을 지으면 목차가 생기고, TalkBack과 VoiceOver가 그 영역을 나열하고 그 사이를 건너뜁니다.

레이아웃이 스스로 맡는 역할은 `child`를 감싸는 `SemanticsRole.main` 하나이고, 거기로 건너뛰는 버튼을 보탭니다. 나머지 영역은 전부 슬롯에 건네진 것에서 나옵니다. [MPSidebar](./sidebar)는 `SemanticsRole.complementary`를 맡고, [MPHeader](./header)와 [MPFooter](./footer)도 같은 방식으로 자기가 무엇인지 말합니다.

:::

::: fw react

## 배치는 CSS이고, 그것이 설계입니다

열이 어디에 놓이는지 정하는 것은 전부 flexbox와 미디어 쿼리입니다. 페이지의 모양에 관한 어떤 것도 JavaScript를 기다리지 않으므로, 레이아웃은 브라우저가 칠하는 첫 프레임에서 이미 맞고 JavaScript가 끝내 도착하지 않는 페이지에서도 맞습니다.

측정하는 것은 둘, 그리고 둘뿐입니다. 헤더의 높이와 푸터의 높이. 제자리를 지키는 열은 바 아래에서 시작해야 하는데, 그 바가 얼마나 높은지는 바 말고 아무도 모릅니다. 그 숫자들은 상태가 아니라 루트의 커스텀 속성으로 곧장 쓰입니다 — 리사이즈마다 `setState`를 하면 `top` 하나 바꾸자고 페이지 전체를 다시 렌더링하게 됩니다.

:::

::: fw flutter

## 배치는 Column과 Row입니다

레이아웃은 헤더, 띠, 푸터를 쌓은 `Column`이고, 띠는 사이드바와 내용을 늘어놓은 `Row`입니다. **받은 공간을 채우므로** 높이가 정해진 곳 아래에 두세요. 라우트의 본문, `SizedBox.expand`, 창(pane) 같은 곳입니다. 열은 원래 위쪽 바 아래에서 시작하므로, 그렇게 만들려고 잴 것이 없습니다.

재는 것은 레이아웃 자신의 폭 하나이고, `LayoutBuilder`로 잽니다. `collapseBelow`와 비교하는 값이 이것입니다.

:::

## headerSpan과 footerSpan

<Demo src="page-layout/span" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/page-layout/span.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/page_layout/span.dart

:::

</Demo>

헤더와 사이드바 중 어느 쪽이 위쪽 모서리를 가져가는지입니다. 세 번째 값은 없습니다. 세 번째 배치가 없기 때문입니다.

|              | `full`               | `content`            |
| ------------ | -------------------- | -------------------- |
| 바가 닿는 곳 | 전체 폭              | 사이드바 사이의 열만 |
| 사이드바     | 바 아래에서 바닥까지 | 창의 전체 높이       |
| 무엇의 배치  | 웹사이트             | 애플리케이션         |

`content`는 MD3가 standard navigation drawer를 그리는 방식 그대로입니다. 서랍이 화면에서 가장 바깥의 것이고, 앱 바는 그 서랍이 덮고 있는 창(pane)에 속합니다.

둘이 별개의 prop인 것은 답이 실제로 다르기 때문입니다. 창 전체 높이의 내비게이션을 둔 대시보드도 저작권 한 줄은 보통 내비게이션 아래가 아니라 본문 아래에 둡니다.

## scroll

<Demo src="page-layout/scroll" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/page-layout/scroll.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/page_layout/scroll.dart

:::

</Demo>

::: fw react

기본값 `page`는 문서가 스크롤되는 것, 즉 웹사이트의 방식입니다. 바는 `position: sticky`로 제자리를 지키고, 휴대폰의 주소 표시줄은 내려갈 때 여전히 숨으며, 뒤로 가기에서 브라우저가 스크롤 위치를 복원합니다. 거의 모든 페이지가 이것을 원합니다.

`content`는 창의 높이를 정확히 가져가고 스크롤을 바 사이의 영역에 넘깁니다. 페이지가 문서가 아니라 작업 공간일 때 — 메일 클라이언트, 에디터, 콘솔 — 이쪽을 고르세요.

`fixed` 바가 흐름에서 빼 가는 만큼은 레이아웃이 미리 비워 두므로, 마지막 문단이 푸터 밑에 깔리는 일은 없습니다.

:::

::: fw flutter

`scroll` 매개변수는 없습니다. Flutter 화면에는 스크롤할 문서가 없으므로 레이아웃은 늘 `scroll="content"`처럼 동작합니다. 받은 높이를 정확히 쓰고, 바는 제자리에 있고, 주 영역은 바가 남긴 높이를 받습니다.

스크롤은 `child`에 넣은 위젯이 합니다. 레이아웃이 그것을 스크롤 뷰로 감싸지 않는 것은, 그러면 거기 들어간 `ListView`나 `CustomScrollView`가 스크롤 뷰 안의 스크롤 뷰가 되기 때문입니다. 미리보기처럼 원하는 스크롤 뷰를 직접 넘기세요.

:::

## collapseBelow

사이드바가 열이기를 그만두고 서랍이 되는 윈도우 크기 클래스입니다.

**MD3 자신의 사다리이고, MD3 자신의 답입니다.** 명세는 standard navigation drawer를 모든 폭에 제공하지 않습니다. 레이아웃의 일부인 서랍은 _expanded_ 창이 받는 것이고, compact 창은 같은 목적지를 모달 서랍 뒤에서 받습니다. 그래서 기본값이 `expanded`이고, 값은 픽셀 폭이 아니라 [윈도우 크기 클래스](../../design/prop-conventions#공유-타입)입니다.

이 값을 읽는 것은 [MPSidebar](./sidebar) 하나뿐입니다 — 두 모습 모두가 될 줄 아는 것이 그 컴포넌트니까요 — 그리고 [MPSidebarTrigger](./sidebar#mpsidebartrigger)는 열이 없는 동안 정확히 그동안만 그려집니다.

`none`은 어느 폭에서도 열로 남깁니다. 바닥이 0인 `compact`도 마찬가지입니다. 그 아래의 창은 없으니까요.

::: fw flutter

비교하는 폭은 창이 아니라 레이아웃이 받은 폭입니다. 화면 전체라면 둘은 같은 폭이고, 창(pane) 안의 앱 셸은 그 창이 좁아질 때 접힙니다. 미디어 쿼리로는 할 수 없는 일입니다. 경계는 `MPConfigProvider`가 정한 곳이라서, 경계를 옮긴 페이지는 사이드바도 함께 옮깁니다.

:::

## 건너뛰기 링크

기본으로 켜져 있고, 여기서 유일하게 스타일 결정이 아닌 항목입니다.

내비게이션에 링크가 마흔 개 있는 페이지에 도착한 키보드 사용자는 본문에 닿기까지 매 페이지마다 그 마흔 개를 전부 지나야 합니다. 이 링크 하나가 그것을 면하게 해 주고, 눈으로 보는 독자에게는 아무 대가도 치르게 하지 않습니다. Tab으로 도달하기 전까지는 1픽셀로 잘려 있고, 그때부터는 진짜 버튼이 됩니다.

::: fw react

`hidden`이 아니라 잘라 두는 것은 의도적입니다. `display: none`은 화면과 함께 접근성 트리에서도 링크를 걷어 가므로, 애초에 Tab이 찾을 것이 남지 않습니다.

```tsx
// 다른 말, 또는 다른 목적지.
<MPPageLayout skipLabel="보고서로 건너뛰기" mainId="report">
  …
</MPPageLayout>
```

:::

::: fw flutter

Flutter에서는 링크가 아니라 버튼입니다. 앱이 어떤 탐색 정책을 쓰든 포커스 순서의 첫 정지점이고, 키보드가 닿기 전까지는 1픽셀이며, 그때부터 앞쪽 모서리에 붙은 `primary` 알약이 됩니다. 누르면 포커스가 주 영역으로 옮겨 갑니다. 주 영역은 포커스를 받을 수는 있어도 그 자체가 Tab 정지점은 아니어서, 다음 Tab은 내용 안의 첫 컨트롤에 닿습니다.

```dart
MPPageLayout(skipLabel: '보고서로 건너뛰기', child: report)
```

:::

## 여백도 본문 폭도 그리지 않는 이유

그건 [MPContainer](./container)의 일이고, 레이아웃까지 그 일을 하면 하나의 아이디어에 두 가지 철자가 생깁니다.

컨테이너를 안에 넣으세요. 그러면 그 결정이 셸이 아니라 라우트의 것이 됩니다.

::: fw react

```tsx
<MPPageLayout header={<MPHeader brand="Acme" />}>
  <MPContainer maxWidth="md">medium 창까지로 묶인 본문.</MPContainer>
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  header: const MPHeader(brand: <Widget>[Text('Acme')]),
  child: const MPContainer(
    maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
    child: Text('medium 창까지로 묶인 본문.'),
  ),
)
```

:::

그러면 같은 페이지가 한 라우트에서는 전체 폭 대시보드를, 다음 라우트에서는 600dp 기사를 담을 수 있고, 레이아웃은 지금 어느 쪽인지 알 필요가 없습니다.

## 표면을 갖지 않는 이유

`variant`도 `color`도 그림자도 없습니다. [MPContainer](./container#표면을-그리지-않는-이유)의 근거 그대로입니다. 페이지에서 가장 바깥의 엘리먼트는 페이지가 어떻게 보일지 결정해서는 안 되는 유일한 것입니다.

바와 열은 스스로를 칠합니다. 그 사이는 애플리케이션 자신의 배경입니다.

## 예시

### 페이지가 아닌 레이아웃

::: fw react

`height="auto"`는 창이 아니라 부모의 높이를 가져갑니다. 미리보기나 목업 안의 셸, 더 큰 도구의 한 창이 원하는 것입니다.

```tsx
<div style={{ height: 400 }}>
  <MPPageLayout height="auto" scroll="content" header={<MPHeader brand="Preview" />}>
    …
  </MPPageLayout>
</div>
```

:::

::: fw flutter

Flutter 레이아웃은 늘 부모의 높이를 가져가므로, 미리보기나 목업 안의 셸, 더 큰 도구의 한 창에는 그 크기의 박스 하나면 됩니다.

```dart
SizedBox(
  height: 400,
  child: MPPageLayout(header: const MPHeader(brand: <Widget>[Text('Preview')]), child: preview),
)
```

:::

### 라우터에서 서랍 제어하기

각 사이드바의 서랍이 열려 있는지는 레이아웃이 들고 있습니다. 페이지 어디에 있는 트리거든 그것과 이야기할 수 있어야 하기 때문입니다. 애플리케이션이 이미 그 상태를 들고 있다면 여기서 제어하세요.

::: fw react

```tsx
<MPPageLayout
  sidebarOpen={navOpen}
  onSidebarOpenChange={setNavOpen}
  sidebar={<MPSidebar>…</MPSidebar>}
>
  …
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebarOpen: navOpen,
  onSidebarOpenChange: (bool open) => setState(() => navOpen = open),
  sidebar: MPSidebar(child: navigation),
  child: page,
)
```

:::

### 본문 영역에 이름 붙이기

::: fw react

```tsx
<MPPageLayout mainProps={{ 'aria-label': '검색 결과' }}>…</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(mainSemanticLabel: '검색 결과', child: results)
```

레이아웃 둘을 나란히 두면 주 영역도 둘이 되고, Flutter는 시맨틱스를 켠 디버그 빌드에서 이름 없는 주 영역 둘을 거부합니다. 각각에 이름을 주세요.

:::

## 접근성

::: fw react

- `<main>`은 레이아웃의 것이고 정확히 하나입니다. 한 페이지에 `<main>`이 둘이면 스크린 리더마다 다르게 보고하는 오류가 됩니다.
- 건너뛰기 링크는 레이아웃의 **첫 번째** 엘리먼트입니다. 쓸모 있는 위치는 그곳뿐입니다.
- 나머지 랜드마크는 슬롯에 들어간 컴포넌트의 것입니다. 한 페이지의 `<aside>` 둘은 각각 이름이 필요합니다. 그렇지 않으면 스크린 리더가 "complementary"라는 영역을 둘 내놓습니다 — [MPSidebar](./sidebar#접근성)를 보세요.
- 레이아웃 자신은 역할이 없고 아무것도 알리지 않습니다.

:::

::: fw flutter

- 주 영역은 레이아웃의 것이고 화면마다 하나입니다. 다른 레이아웃 안의 레이아웃은 주 영역을 맡지 않고 건너뛰기 버튼도 그리지 않습니다. 화면에 둘 다 이미 있기 때문입니다.
- 건너뛰기 버튼은 포커스 순서의 **첫** 정지점입니다. 쓸모 있는 위치는 그곳뿐입니다.
- 나머지 영역은 슬롯에 들어간 위젯의 것입니다. 슬롯이 아니라 내용 안에 둔 사이드바는 이름은 그대로 두고 complementary 역할은 내려놓습니다. Flutter는 주 영역 안에 그 역할을 허용하지 않습니다.
- 레이아웃 자신의 바깥 상자는 역할이 없고 아무것도 알리지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `scroll`, `height` | — | 레이아웃은 받은 공간을 채우고, 주 영역은 바가 남긴 만큼을 받습니다. 영역 대신 스크롤할 문서가 없고, 스크롤은 `child`에 넣은 위젯이 합니다. |
| 창의 폭과 비교하는 `collapseBelow` | 레이아웃 자신의 폭과 비교 | `LayoutBuilder`는 미디어 쿼리가 묻지 못하는 것을 물을 수 있어서, 창(pane) 안의 셸은 그 창과 함께 접힙니다. 화면 전체라면 두 폭은 같습니다. |
| 바의 높이를 커스텀 속성에 기록 | — | `Column`이 띠를 이미 헤더 아래에서 시작합니다. |
| `#main`으로 가는 건너뛰기 링크 | 포커스를 옮기는 건너뛰기 버튼 | 프래그먼트 링크가 없습니다. 주 영역은 `tabIndex={-1}`인 `<main>`처럼 스크립트로만 포커스를 받습니다. |
| `mainId`, `mainProps` | `mainSemanticLabel` | id를 붙일 엘리먼트가 없습니다. `mainProps`의 쓰임 가운데 대응하는 것은 이름 하나입니다. |
| `defaultSidebarOpen`, `defaultEndSidebarOpen` | `initialSidebarOpen`, `initialEndSidebarOpen` | 시작 값을 가리키는 Flutter의 말입니다. |
| `children` | `child` | 위젯 하나를 가리키는 Flutter의 말입니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록도, 스타일 속성도, 엘리먼트도 없습니다. |

:::

## 함께 보기

- [MPHeader](./header) — 위쪽 슬롯에 들어갈 바.
- [MPFooter](./footer) — 아래쪽 슬롯에 들어갈 시트.
- [MPSidebar](./sidebar) — 서랍이 되기도 하는 열, 그리고 그것을 되돌리는 트리거.
- [MPContainer](./container) — `<main>` 안의 여백과 본문 폭.
