---
title: MPSidebar
order: 17
---

# MPSidebar

<p class="mp-lede">본문 옆의 열이고, 창이 그것을 담기에 좁아지면 서랍입니다. MD3의 standard navigation drawer와 modal navigation drawer를 하나의 컴포넌트로 만든 것입니다.</p>

<Demo src="sidebar/hero" :minHeight="340" />

::: fw react

```tsx
import { MPPageLayout, MPSidebar, MPList, MPListItem } from 'material-plus-ui';

<MPPageLayout sidebar={<MPSidebar title="섹션">…</MPSidebar>}>…</MPPageLayout>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPageLayout(
  sidebar: MPSidebar(title: const Text('섹션'), child: navigation),
  child: page,
)
```

:::

## Props

<PropsTable name="MPSidebar" />

## 하나의 패널, 두 가지 모습

MD3가 긋는 구분 그대로입니다. **standard** navigation drawer는 레이아웃의 일부이고 내용이 그 주위로 배치됩니다. expanded 창 아래에서는 같은 목적지들이 스크림 위의 **modal** 서랍으로 도착합니다. 포커스 트랩, Escape, 트리거로 돌아가는 길과 함께.

여기서 둘이 하나의 컴포넌트인 데에는 두 가지 이유가 있습니다.

호출자가 중단점에서 컴포넌트를 바꿔 끼워서는 안 됩니다. 목적지는 같은 목적지이고, 840dp 위에서는 `<MPSidebar>`를 아래에서는 `<MPDrawer>`를 그리는 페이지는 목록 두 벌을 관리하는 페이지입니다.

그리고 자식은 어느 쪽이든 **한 번만** 존재합니다. 컴포넌트가 둘이면 트리 둘이 문서에 들어가고 그중 하나는 숨겨집니다. 스크린 리더는 그것을 두 번 읽고, 폼은 두 번 제출합니다.

## collapseBelow

<Demo src="sidebar/collapse" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/sidebar/collapse.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/sidebar/collapse.dart

:::

</Demo>

열이 서랍이 되는 윈도우 크기 클래스입니다. [MPPageLayout](./page-layout)에서 두 사이드바 몫으로 한 번 정해져 내려오고, `expanded`는 MD3 자신의 답입니다. 명세는 standard 서랍을 expanded 창에 주고, 그 아래에는 같은 목적지를 modal 서랍 뒤에 둡니다.

레이아웃 밖에서 기본값은 `none`이고, 이는 의도적인 거절입니다. 페이지의 무엇도 되돌릴 수 없는 채로 접힌 사이드바는 독자가 잃어버린 사이드바입니다. 되돌리는 것은 [MPSidebarTrigger](#mpsidebartrigger)이고, 그것은 이야기할 레이아웃이 필요합니다.

::: fw react

### 어느 쪽이 보이는지는 일부러 두 번 답합니다

첫 페인트는 CSS가, 그다음부터는 JavaScript가 답합니다.

서버가 보내는 마크업은 **열**입니다. 접힌 사이드바는 modal 서랍이고, modal 서랍은 `document.body`로 가는 포털이며, 마크업을 렌더링하는 동안에는 포털로 들어갈 body가 없기 때문입니다. 그래서 좁은 화면은 전체 폭 사이드바를 그렸다가 잠시 뒤 버리게 됩니다. 중단점 아래에서 열을 숨기는 클래스가 그것을 막고, 물어볼 창이 생긴 뒤에 서랍이 존재해야 한다고 결정하는 것이 `matchMedia`입니다.

### 휴대폰 폭의 크롤러

접힌 사이드바는 닫힌 모달 서랍이고, 닫힌 서랍은 페이지에 없습니다. 그래서 `collapseBelow`보다 좁으면 사이드바의 링크가 크롤러가 휴대폰 폭으로 렌더링하는 문서에서 빠지고, 모바일 페이지를 색인하는 검색 엔진은 그 링크를 보지 못합니다. `keepMounted`를 주면 서랍이 닫혀 있는 동안에도 링크가 숨겨진 채로 문서에 남습니다. 사이트 내비게이션 역할을 하는 사이드바에 주세요.

:::

::: fw flutter

### 어느 쪽이 보이는지는 한 번 답합니다

폭은 첫 프레임에 이미 알려져 있으므로, 사이드바는 필요한 모습만 짓습니다. 레이아웃 안에서는 레이아웃이 받은 폭을, 자기 `collapseBelow`를 가진 단독 사이드바는 창의 폭을 읽습니다.

서랍은 자기 쪽 가장자리에서 들어옵니다. 앞쪽 사이드바라면 영어에서는 `left`, 아랍어에서는 `right`입니다. 열려 있는 동안 포커스를 안에 붙잡아 두고, Escape, 시스템 뒤로 가기, 스크림, 닫기 버튼 어느 것으로든 닫히며, 닫히면 포커스가 원래 자리로 돌아갑니다.

:::

## 표면

**컨테이너**의 사다리입니다. 사이드바는 남의 내용을 담고, 사이드바를 물들이면 그 내용이 물듭니다.

기본값은 `outlined`입니다. 페이지 자신의 표면에, **내용을 마주 보는** 가장자리의 실선 하나. 바깥 가장자리는 창에 붙어 있고 그 반대편에는 나뉠 것이 없습니다 — [MPHeader](./header)와 [MPDrawer](./drawer)가 긋는 것과 같은, 가장자리 하나의 규칙입니다.

접히고 나면 여기서 정한 무게는 적용되지 않습니다. 그때 화면에 있는 것은 [MPDrawer](./drawer)이고, 서랍은 MD3 자신의 navigation drawer 표면 — 레벨 1 그림자 아래의 `surface-container-low` — 을 칠합니다. 그 시점에 패널은 옆에 앉아 있는 것이 아니라 페이지를 덮었기 때문입니다.

## 폭, 그리고 크기 조절

`size`는 열의 기본 폭이고 `md`는 360px입니다. MD3 자신의 navigation drawer이자 [MPDrawer](./drawer)가 그려지는 것과 같은 단이므로, 사이드바는 자신이 되는 서랍과 정확히 같은 폭입니다.

<Demo src="sidebar/resizable" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/sidebar/resizable.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/sidebar/resizable.dart

:::

</Demo>

::: fw react

`resizable`은 안쪽 가장자리에 핸들을 놓습니다. 가장자리 안에 들어앉는 대신 걸쳐 있습니다 — 1픽셀짜리 실선은 1픽셀짜리 과녁이고, 그건 과녁이 아닙니다 — 그리고 탭 정지를 가진 진짜 `separator`라서 방향키로도 움직입니다.

드래그는 폭을 상태가 아니라 엘리먼트에 곧장 씁니다. 트리에서 그 숫자에 의존하는 것은 CSS 선언 하나뿐이고, 포인터가 움직일 때마다 `setState`를 하면 그 하나를 바꾸자고 사이드바의 모든 행을 다시 렌더링하게 됩니다. 호출자가 듣는 것은 매 단계의 `onResize`와 멈췄을 때의 `onResizeEnd`이고, 저장할 값어치가 있는 것은 두 번째입니다. 독자가 고른 폭은 다시 찾을 것을 기대하는 폭이니까요.

:::

::: fw flutter

`resizable`은 안쪽 가장자리에 핸들을 놓습니다. 가장자리 안에 들어앉는 대신 걸쳐 있습니다 — 1픽셀짜리 실선은 1픽셀짜리 과녁이고, 그건 과녁이 아닙니다 — 그리고 포커스를 받으므로 방향키로 16픽셀씩 움직입니다. Flutter의 시맨틱스에는 `separator`가 없어서, 스크린 리더는 이 핸들을 픽셀 단위 폭을 값으로 가진 슬라이더로 만나고, 늘리기와 줄이기 동작으로도 가장자리를 옮길 수 있습니다.

드래그는 폭을 `setState`가 아니라 `ValueNotifier`에 씁니다. 열에서 그 숫자에 의존하는 것은 `SizedBox` 하나뿐이고, 포인터가 움직일 때마다 다시 빌드하면 그 하나를 바꾸자고 사이드바의 모든 행을 다시 빌드하게 됩니다. 호출자가 듣는 것은 매 단계의 `onResize`와 멈췄을 때의 `onResizeEnd`이고, 저장할 값어치가 있는 것은 두 번째입니다. 위젯에 새 `width`를 주면 드래그한 폭보다 그 값이 우선합니다.

:::

명시한 `width`는 모양이 바뀌어도 살아남고, 기본 폭은 그러지 않습니다. 옆의 기사에 맞춰 잰 열의 폭과 휴대폰에 맞춰 잰 패널의 폭은 다른 숫자이고, 두 번째는 서랍 자신의 사다리가 이미 알고 있습니다.

## 사이드바 둘

레이아웃에는 슬롯이 둘 있고, 각각은 자기 폭과 자기 서랍과 자기 트리거를 가진 완전한 사이드바입니다.

::: fw react

```tsx
<MPPageLayout
  sidebar={<MPSidebar label="섹션">…</MPSidebar>}
  endSidebar={
    <MPSidebar label="이 페이지에서" size="sm">
      …
    </MPSidebar>
  }
>
  …
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebar: MPSidebar(label: '섹션', child: sections),
  endSidebar: MPSidebar(label: '이 페이지에서', size: MPSize.sm, child: outline),
  child: page,
)
```

:::

어느 쪽도 `side`가 필요 없습니다. 레이아웃이 각자에게 어느 끝인지 알려 주고, `start`와 `end`는 논리적이라서 RTL에서는 아무 요청 없이도 둘이 자리를 바꿉니다.

## MPSidebarTrigger

창이 담기에 좁아진 사이드바를 되돌리는 버튼입니다.

<PropsTable name="MPSidebarTrigger" />

::: fw react

그것이 사실인 동안에만 그려지고, 그 "동안"은 상태가 아니라 **미디어 쿼리**입니다. 이것은 보이는 것보다 중요합니다. 존재 여부가 `matchMedia`에 달린 트리거는 서버가 보내는 마크업에는 없다가 페이지가 도착한 잠시 뒤에 헤더로 튀어나옵니다. 모든 휴대폰에서, 매번.

:::

::: fw flutter

그것이 사실인 동안에만 그려집니다. 레이아웃은 첫 프레임에 자기 폭을 알고 있으므로 붙잡아 둘 첫 페인트가 없고, 열이 있는 동안 버튼은 그냥 빌드되지 않습니다. 라벨 없이 글리프만 가진 `MPButton`, 즉 아이콘 버튼이고 기본 변형은 `text`입니다.

:::

[MPHeader](./header)의 `brand` 슬롯, 마크 앞에 두세요.

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
MPHeader(
  brand: const <Widget>[MPSidebarTrigger(), Text('Acme')],
)
```

:::

이름은 상태에 따라 바뀝니다. "사이드바 열기"가 "사이드바 닫기"가 됩니다. 버튼이 그렇게 바뀌기 때문입니다. 닫는 일을 하는데 "사이드바 열기"라고 불리는 컨트롤은 이름 없는 컨트롤보다 나쁩니다.

[MPPageLayout](./page-layout) 밖에서는 아무 일도 하지 않는 버튼 대신 **아무것도** 그리지 않습니다. 이야기할 사이드바가 없기 때문입니다.

## 예시

### 뒤쪽에 놓는 목차

::: fw react

```tsx
<MPSidebar side="end" size="sm" label="이 페이지에서" collapseBelow="none">
  <nav>…</nav>
</MPSidebar>
```

:::

::: fw flutter

```dart
MPSidebar(
  side: MPSidebarSide.end,
  size: MPSize.sm,
  label: '이 페이지에서',
  collapseBelow: MPPageCollapse.none,
  child: outline,
)
```

:::

### 라우트가 바뀔 때 서랍 닫기

각 서랍이 열려 있는지는 레이아웃이 들고 있으므로, 라우터도 거기서 닫습니다.

::: fw react

```tsx
<MPPageLayout sidebarOpen={open} onSidebarOpenChange={setOpen} sidebar={<MPSidebar>…</MPSidebar>}>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebarOpen: open,
  onSidebarOpenChange: (bool next) => setState(() => open = next),
  sidebar: MPSidebar(child: navigation),
  child: page,
)
```

:::

### 레이아웃 없는 사이드바

동작하고, 어느 폭에서도 열로 남습니다. 페이지가 아니라 어떤 영역의 일부인 패널에는 그게 맞습니다.

::: fw react

```tsx
<div style={{ display: 'flex' }}>
  <MPSidebar label="필터" width={220} sticky={false}>
    …
  </MPSidebar>
  <div>…</div>
</div>
```

:::

::: fw flutter

```dart
Row(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: <Widget>[
    MPSidebar(label: '필터', width: 220, child: filters),
    Expanded(child: results),
  ],
)
```

페이지 레이아웃의 내용 안에 둔 사이드바는 이름은 그대로 두고 complementary 역할은 내려놓습니다. Flutter는 주 영역 안에 그 역할을 허용하지 않습니다.

:::

## 접근성

::: fw react

- 열은 `<aside>`이고 `complementary` 랜드마크입니다. **스스로 이름을 붙입니다** — 이름 없는 것이 둘인 페이지는 스크린 리더가 "complementary" 영역을 둘 내놓는 페이지입니다 — 그리고 `label`이 그 기본값을 대체합니다.
- 서랍은 다이얼로그이고 항상 제목을 갖습니다. 열이었을 때는 필요 없었더라도 그렇습니다. 제목 없는 다이얼로그에는 접근 가능한 이름이 없기 때문입니다.
- 크기 조절 핸들은 이름과 탭 정지와 방향키를 가진 `separator`입니다. 드래그로만 되는 핸들은 키보드가 닿지 못하는 컨트롤입니다.
- **안에** 들어가는 것의 마크업은 여러분의 몫입니다. 목적지 목록에는 `<nav>`를 둘러 주세요. 그래야 스크린 리더가 그것을 별도의 영역으로 내놓습니다.

:::

::: fw flutter

- 열은 `SemanticsRole.complementary`를 맡고 **스스로 이름을 붙이며**, `label`이 그 기본값을 대체합니다. 페이지 레이아웃의 내용 안에서는 이름은 두고 역할은 내려놓습니다. Flutter는 주 영역 안에 그 역할을 허용하지 않습니다.
- 서랍은 포커스를 붙잡아 두는 레이어이고 항상 제목을 갖습니다. 열이었을 때는 필요 없었더라도 그렇습니다. `title`이 없으면 사이드바의 이름이 제목이 되고 레이어의 이름도 됩니다.
- 크기 조절 핸들은 이름, 포커스 정지점, 방향키, 늘리기와 줄이기 동작을 가진 슬라이더입니다. 드래그로만 되는 핸들은 키보드가 닿지 못하는 컨트롤입니다.
- 트리거의 이름은 상태를 따라 바뀌고, `aria-expanded`처럼 서랍이 펼쳐졌는지 알립니다.
- **안에** 들어가는 것의 마크업은 여러분의 몫입니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 숫자나 CSS 길이인 `width`, `minWidth`, `maxWidth` | 논리 픽셀 단위의 `double` | 해석할 CSS 단위가 없습니다. |
| `sticky` | — | 레이아웃은 받은 공간을 채우고, 열은 늘 띠만큼 높습니다. 옆으로 스크롤되어 지나가는 페이지가 없습니다. |
| `keepMounted` | — | 닫힌 서랍의 링크를 크롤러를 위해 문서에 남기는 기능입니다. 크롤링할 문서가 없고, 여기서 닫힌 서랍은 아무것도 빌드하지 않습니다. |
| `MPDrawer`로 접힘 | `MPDrawer`의 modal 모드처럼 그린 자기 서랍으로 접힘 | 표면, 폭의 사다리, 제목, 닫기 버튼, 스크림, 미끄러져 들어오는 동작이 같습니다. 독자에게 달라지는 것은 없습니다. |
| 미디어 쿼리와 `matchMedia`가 답하는 접힘 | 레이아웃이나 창의 폭으로 한 번 답함 | 폭은 첫 프레임에 이미 알려져 있습니다. |
| 미디어 쿼리로 숨기는 트리거 | 열이 있는 동안 빌드하지 않는 트리거 | 붙잡아 둘 첫 페인트가 없습니다. |
| `aria-valuenow`를 가진 `separator` 핸들 | 폭을 값으로 가진 슬라이더 | Flutter의 시맨틱스에는 `separator` 역할도 `valuenow`도 없습니다. |
| `defaultOpen` | `initialOpen` | 시작 값을 가리키는 Flutter의 말입니다. |
| `children` | `child` | 위젯 하나를 가리키는 Flutter의 말입니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록도, 스타일 속성도, 엘리먼트도 없습니다. |

:::

## 함께 보기

- [MPPageLayout](./page-layout) — 슬롯 둘을 가진 뼈대.
- [MPDrawer](./drawer) — 이것이 되는 패널이고, 일부가 될 레이아웃이 없을 때 바로 손에 잡을 것.
- [MPHeader](./header) — 트리거가 들어갈 자리.
- [MPBottomNavigation](./bottom-navigation) — 목적지가 적을 때 MD3가 서랍 대신 내놓는 compact 창의 패턴.
- [MPShow](./show) — 사이드바 자신의 접힘이 다루지 않는 페이지의 나머지에서, 한 배치만 보이고 다른 배치는 보이지 않게 하기.
- [브레이크포인트](../../design/breakpoints) — `collapseBelow`의 클래스가 시작하는 지점과, 옮기는 방법.
