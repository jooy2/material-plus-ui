---
title: MPAnchor
order: 24
---

# MPAnchor

<p class="mp-lede">읽고 있는 페이지의 제목 목록입니다. 페이지가 스크롤되는 동안 독자가 지금 있는 항목을 표시합니다. 행은 스스로 제목까지 가고, 스크롤 추적은 그것을 떠받치는 것이 아니라 그 위에 얹힌 것입니다.</p>

<Demo src="anchor/hero" :minHeight="300" />

::: fw react

```tsx
import { MPAnchor } from 'material-plus-ui';

<MPAnchor
  items={[
    { href: '#install', label: 'Install' },
    { href: '#usage', label: 'Usage' },
    { href: '#options', label: 'Options', depth: 1 }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnchor(
  items: <MPAnchorItem>[
    MPAnchorItem(target: _install, label: const Text('Install')),
    MPAnchorItem(target: _usage, label: const Text('Usage')),
    MPAnchorItem(target: _options, label: const Text('Options'), depth: 1),
  ],
)
```

`target`은 행이 가리키는 제목 위젯에 단 `GlobalKey`입니다.

:::

## Props

<PropsTable name="MPAnchor" />

::: fw flutter

### MPAnchorItem

<PropsTable name="MPAnchorItem" />

:::

::: fw react

## 링크는 추적이 돌기 전부터 동작합니다

행은 `<nav>` 안의 `<a href="#…">`입니다. 그래서 자바스크립트를 꺼도 제목으로 뛰고, 스크린 리더가 불러내는 링크 목록에 들어가며, 가운데 클릭으로 새 탭에 열립니다. 스크롤을 지켜보는 쪽이 그 위에 얹은 것입니다.

표시된 행은 `aria-current="true"`가 아니라 `"location"`을 답니다. 그 값은 "링크 묶음 안에서 독자가 있는 자리"를 뜻하고, 목차가 보고하는 것이 정확히 그것입니다. `"true"`는 현재 *페이지*를 뜻하고, 그건 내비게이션 메뉴의 자기 항목이 하는 말입니다.

### 라우터가 클릭을 가져가지 않는다면

VitePress, Docusaurus, Astro, Nuxt는 모두 같은 페이지 안의 해시 클릭을 가로채 취소하고, 자기가 생각하는 목표 위치로 **창**을 스크롤합니다. `container`를 주면 창은 그들이 뜻할 수 없는 단 하나의 스크롤 영역입니다. 그래서 페이지가 튀고 패널은 그대로 남습니다.

그래서 행에 도달했을 때 이미 취소된 누름은 행이 직접 답합니다. `offset`까지 반영해 `container`를 제목까지 스크롤합니다. 아무도 취소하지 않은 누름은 그대로 둡니다. 스크롤도 해시도 히스토리 항목도 브라우저가 이미 다 하기 때문입니다. `container`가 없으면 아무것도 걸지 않습니다.

:::

::: fw flutter

## 행을 누르면 제목이 선까지 옵니다

행을 누르거나 행에서 <kbd>Enter</kbd>를 누르면, 제목이 든 스크롤 뷰가 움직여 제목이 위쪽에서 `offset`만큼 내려온 자리에 놓입니다. 추적이 읽는 선과 같은 자리입니다. React 빌드에서 fragment 링크가 그러듯 애니메이션 없이 바로 옮겨 갑니다.

화면에는 fragment를 적을 URL이 없고 링크를 긁어 가는 크롤러도 없으므로, 기댈 링크 엘리먼트가 없습니다. 각 행은 semantics 트리에서 링크이고 자기 포커스 자리를 가지며, 표시된 행은 선택된 것으로 읽힙니다. 프레임워크에서 `aria-current="location"`에 가장 가까운 표현입니다.

:::

## 제목은 긁어 오는 게 아니라 건네받습니다

::: fw react

`items`는 호출부가 이미 가지고 있는 목록입니다. 페이지를 만든 것이 무엇이든 — MDX 파이프라인이든, CMS든, 라우트의 frontmatter든 — 자기 제목과 거기 써 넣은 `id`를 압니다. 문서에서 `<h2>`를 찾아다니는 컴포넌트는 그중 무엇이 본문이고 무엇이 크롬인지를 추측하게 되고, 사이드바에 있는 것까지 집어 옵니다.

`href`는 `id`를 가리키고, `id`가 없는 제목은 추적할 수 없습니다. 호출부가 맞춰 줘야 하는 것은 그 하나입니다.

:::

::: fw flutter

`items`는 호출부가 이미 가지고 있는 목록입니다. 화면을 만든 쪽은 자기 제목을 알고, 위젯 트리에서 제목을 찾아다니는 컴포넌트는 무엇이 본문이고 무엇이 크롬인지 추측할 수밖에 없습니다.

`target`은 제목 위젯에 단 `GlobalKey`이고, 그 키가 어디에도 달려 있지 않은 제목은 추적할 수 없습니다. 호출부가 맞춰 줘야 하는 것은 그 하나입니다.

:::

## 엉뚱한 행에 불이 들어오게 만드는 두 가지

**고정 헤더.** 페이지 위쪽을 지나간 제목도 아직 바 뒤에 가려져 있으므로, 독자가 보고 있는 것은 그 앞 섹션입니다. `offset`이 그 바의 높이입니다.

::: fw react

```tsx
<MPAnchor items={items} offset={64} />
```

:::

::: fw flutter

```dart
MPAnchor(items: items, offset: 64)
```

:::

::: fw react

**문서가 아닌 스크롤러.** `scroll="content"`인 `MPPageLayout`은 페이지를 자기 엘리먼트 안에 넣고, 창은 아예 스크롤되지 않습니다. `container`가 대신 볼 곳입니다.

```tsx
const page = React.useRef<HTMLDivElement>(null);

<MPAnchor items={items} container={page} />;
```

:::

::: fw flutter

**엉뚱한 스크롤 뷰.** 목록은 첫 제목이 든 스크롤 뷰를 따라가므로, 따로 스크롤되는 패널이라도 더 할 일이 없습니다. 제목이 여러 스크롤 뷰에 흩어져 있거나 따라갈 뷰가 더 바깥에 있으면 `controller`로 지정합니다.

```dart
MPAnchor(items: items, controller: _page)
```

:::

## 무엇을 표시하고, 언제 아무것도 표시하지 않는지

규칙은 "선을 지나간 제목 중 마지막 것"입니다. 내려갈 때뿐 아니라 **올라갈 때**도 옳게 읽히는 유일한 규칙입니다.

거기서 두 가지가 따라 나오고, 둘 다 의도한 것입니다. 페이지 맨 위에서는 아무것도 표시되지 않습니다. 독자가 아직 첫 제목에 닿지 않았기 때문이고, 그런데도 첫 항목에 불을 켜면 가 보지 않은 섹션에 있다고 말하는 셈입니다. 그리고 맨 아래에서는 측정이 무엇이라고 하든 마지막 제목을 표시합니다. 마지막 섹션은 대개 뷰포트보다 짧은 내용을 달고 있어서 그 위쪽이 선에 닿지 못하고, 이 예외가 없으면 아무리 스크롤해도 결코 표시될 수 없는 유일한 제목이 됩니다.

::: fw react

직접 정하려면 `activeHref`를 넘기세요. 그러면 목록은 스크롤을 아예 지켜보지 않고 시키는 대로만 말합니다. `null`은 아무것도 표시하지 않는다는 뜻입니다.

:::

::: fw flutter

직접 정하려면 `activeTarget`을 넘기세요. 그러면 목록은 스크롤을 아예 지켜보지 않고 시키는 대로만 말합니다. `null`을 넘기면 표시를 다시 스크롤에 맡깁니다.

:::

## 아무것도 미끄러지지 않습니다

레일에 켜지는 구간은 행 사이를 옮겨 다니는 표식이 아니라 행 자신의 테두리입니다. 이미 움직이고 있는 독자 밑에서 무언가가 움직이는 것은 목차가 가져서는 안 될 유일한 애니메이션이고, 동시에 제대로 만들 수 없는 종류이기도 합니다. 표식과 스크롤이 같은 동작에 서로 다른 속도로 답하기 때문입니다. 색은 전이하고, 위치는 그렇지 않습니다.

## `depth`는 들여쓸 뿐입니다

제목이 아무리 깊어져도 목록은 평평합니다. 목차 안에 목록을 겹치면 목록 안의 목록으로 읽히고, 방금 제목이 열두 개라고 들은 독자에게 필요 없는 말입니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 항목의 `href` | `target`, `GlobalKey` | 화면에는 가리킬 fragment가 없습니다. 목록이 재는 것은 위젯의 위치이고, 키가 그 위치를 잡는 손잡이입니다. |
| `container`, ref | `controller`, 생략 가능 | 없으면 목록이 제목이 든 스크롤 뷰를 스스로 찾습니다. React에서 기본값이 문서인 것과 같은 자리입니다. |
| `activeHref={null}`로 아무것도 표시하지 않기 | — | `activeTarget: null`은 "스크롤을 따라가라"는 뜻입니다. 제어하는 목록은 언제나 한 행을 표시합니다. |
| `label` | `semanticLabel` | React의 `aria-label`처럼 화면 낭독기만 듣는 이름입니다. |
| 진짜 `<a>` 링크와 라우터 대비 처리 | 스크롤 뷰를 바로 옮기는 누름 | URL도, 가운데 클릭도, 크롤러도 없습니다. 브라우저가 fragment 링크에 하는 일을 누름이 대신합니다. |
| `className`, `style` | — | 넘길 클래스 목록도 style 속성도 없습니다. |

:::
