---
title: MPBreadcrumb
order: 2
---

# MPBreadcrumb

<p class="mp-lede">지금 읽는 페이지 위쪽의 경로입니다. 마지막 단계는 독자가 이미 있는 곳이므로 링크가 아니고, 일곱 단계짜리 경로는 가운데를 <code>…</code> 뒤로 접습니다.</p>

<Demo src="breadcrumb/hero" :minHeight="140" />

::: fw react

```tsx
import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

<MPBreadcrumb maxItems={4}>
  <MPBreadcrumbItem href="/">홈</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/components">컴포넌트</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPBreadcrumb(
  maxItems: 4,
  children: <Widget>[
    MPBreadcrumbItem(onPressed: goHome, child: const Text('홈')),
    MPBreadcrumbItem(onPressed: goComponents, child: const Text('컴포넌트')),
    const MPBreadcrumbItem(child: Text('Breadcrumb')),
  ],
)
```

:::

## Props

<PropsTable name="MPBreadcrumb" />

### MPBreadcrumbItem

<PropsTable name="MPBreadcrumbItem" />

## 마지막 단계가 지금 보고 있는 페이지입니다

::: fw react

`aria-current="page"`를 갖고 눌리지 않게 되며, 그것을 호출자마다 기억하게 하는 대신 컴포넌트가 계산합니다.

앞선 단계에 `current`를 주면 표시가 그쪽으로 옮겨 가고 마지막 단계에서는 사라집니다. 한 경로에서 그것을 가질 수 있는 엘리먼트는 정확히 하나이기 때문입니다. 손으로 하려면 요청한 적도 없는 단계에 `current={false}`를 적어야 합니다.

`"true"`가 아니라 `aria-current="page"`인 이유: 경로는 내비게이션이고, 독자가 있는 단계는 선택지 중 고른 것이 아니라 _페이지_ 입니다.

:::

::: fw flutter

진한 잉크에 한 단계 굵은 글자로 그려지고, 눌리지 않으며, 선택된 것으로 읽힙니다. 프레임워크에서 `aria-current="page"`에 가장 가까운 표현입니다. 호출자마다 기억하게 하는 대신 경로가 계산해서 단계에 알려 줍니다.

앞선 단계에 `current`를 주면 표시가 그쪽으로 옮겨 가고 마지막 단계에서는 사라집니다. 독자가 있는 페이지는 경로에서 하나뿐이기 때문입니다. 손으로 하려면 요청한 적도 없는 단계에 `current: false`를 적어야 합니다.

:::

## 접기

일곱 단계짜리 경로는 아무도 읽지 않는 경로입니다. `maxItems`가 가운데를 `…`로 접고, 누르면 되돌립니다.

::: fw react

```tsx
<MPBreadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
```

:::

::: fw flutter

```dart
MPBreadcrumb(maxItems: 3, itemsBeforeCollapse: 1, itemsAfterCollapse: 1, children: steps)
```

:::

실제로 무언가를 없앨 때만 접습니다. 세 단계짜리 경로에 앞 `1`, 뒤 `1`이면 `…`가 정확히 한 단계를 대신하게 되는데 — 대신한 단계보다 길어집니다 — 그래서 아무 일도 일어나지 않습니다.

`expandable`을 끄면 독자 아래에서 자라면 안 되는 경로를 위해 접힌 표시를 그냥 표시로 남겨 둡니다.

## 예시

### separator

<Demo src="breadcrumb/separators">

::: fw react

<<< @/.vitepress/demos/breadcrumb/separators.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/breadcrumb/separators.dart

:::

</Demo>

아무것이나 받는 대신 이름 붙은 네 가지인 이유는, 구분 표시가 하루에도 수백 번 읽히고 그 차이가 장식이 아니라 의미이기 때문입니다. `chevron`과 `arrow`는 "그다음", `slash`는 "경로", `dot`은 "이것들은 한 가지의 동료들"이라고 말합니다. 그 밖의 것은 여전히 노드로, Flutter에서는 위젯으로 넘길 수 있습니다.

방향을 가리키는 둘은 RTL에서 되돌아섭니다. 경로는 언어가 흐르는 방향으로 흐르기 때문입니다.

구분 표시는 단계가 아니라 경로가 그립니다. 단계는 자기 뒤에 무엇이 오는지 모르고, 단계에 속한 표시라면 마지막 하나에서 손으로 떼어내야 합니다.

::: fw react

### 단계마다 세 가지 모양

호출자가 무엇을 넘기느냐로 고릅니다.

```tsx
<MPBreadcrumbItem href="/docs">링크</MPBreadcrumbItem>
<MPBreadcrumbItem onClick={back}>버튼</MPBreadcrumbItem>
<MPBreadcrumbItem>지금 보고 있는 페이지</MPBreadcrumbItem>
```

:::

::: fw flutter

### 단계마다 두 가지 모양

`onPressed`가 있는 단계는 어딘가로 가고, semantics 트리에서 링크입니다. 없는 단계는 그냥 글자이고, 지금 보고 있는 페이지가 그렇습니다.

```dart
MPBreadcrumbItem(onPressed: () => router.go('/docs'), child: const Text('문서'))
const MPBreadcrumbItem(child: Text('지금 보고 있는 페이지'))
```

:::

## 단계는 칩이 아닙니다

hover 배경은 일부러 사다리 아래쪽의 `corner-extra-small`입니다. 높이 20px짜리 글줄에 `corner-full`은 알약이고, 알약이 늘어선 경로는 필터 칩의 줄입니다.

::: fw react

## structuredData

트레일은 검색 엔진이 결과를 다시 그려 주는 몇 안 되는 것 중 하나입니다. `BreadcrumbList` 마크업이 있으면 제목 아래에 맨 URL 대신 `Docs › Components › Breadcrumb`이 표시됩니다.

```tsx
<MPBreadcrumb structuredData>
  <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/docs">Docs</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>
```

`<ol>`이 `BreadcrumbList`가 되고, 각 `<li>`가 위치를 담은 `<meta>`를 지닌 `ListItem`이 되며, 라벨이 `name`이 되고, `href`는 `<a>`에서 그대로 읽힙니다. 크롤러가 따라가는 주소와 독자가 따라가는 주소가 어긋날 수 없습니다. 지금 보고 있는 단계에는 `item`이 없습니다. 이미 있는 페이지는 갈 곳이 아니기 때문입니다.

**기본값은 꺼짐**이고, 소심해서가 아닙니다. 한 페이지는 트레일을 하나만 주장할 수 있으므로, 묻지 않고 이걸 내보내는 컴포넌트는 사이트가 이미 `<head>`에 둔 JSON-LD와 충돌합니다. 트레일이 둘인 것은 없느니만 못합니다.

이것을 켜면 `maxItems`가 꺼집니다. `BreadcrumbList`의 position은 빠짐없이 1, 2, 3으로 이어져야 하는데 `…` 뒤의 단계들은 문서에 없어 번호를 매길 수 없습니다. 게시할 가치가 있는 트레일이라면 보여 줄 가치도 있습니다.

:::

## 접근성

::: fw react

- 경로는 `aria-label="Breadcrumb"`을 가진 `<nav>`입니다. 페이지의 다른 세 nav와 구분되는 방법이고, `label`이 그것을 번역합니다.
- 구분 표시는 `aria-hidden`입니다. 단계가 아니라 구두점입니다.
- `…`는 자기 이름(`expandLabel`)을 가진 진짜 버튼입니다.
- `<ol>`은 `role="list"`를 소리 내어 말합니다. 호스트 reset이 마커를 떼어낼 수 있고, 사파리는 그때 리스트 의미까지 함께 떼어냅니다.

:::

::: fw flutter

- 경로는 "Breadcrumb"이라는 이름의 노드 하나이고, 단계마다 그 안에 자기 노드를 가집니다. 이름은 `semanticLabel`로 바꾸고, 기본 이름은 `locale`이 번역합니다.
- 구분 표시는 semantics 트리에서 빠집니다. 단계가 아니라 구두점입니다.
- 어딘가로 가는 단계는 링크이고, 포커스 자리를 가지며 <kbd>Enter</kbd>로 따라갑니다. 비활성 단계는 사용할 수 없는 링크로 읽히고 포커스를 받지 않습니다.
- `…`는 자기 이름(`expandLabel`)을 가진 버튼이고, 누르면 그 자리에 접혀 있던 단계를 그립니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 단계의 `href`와 `render` | `onPressed` | URL도 링크 엘리먼트도 없습니다. 앱의 라우터는 `onPressed`에서 부릅니다. |
| `onClick`이 있는 단계는 `<button>` | `onPressed`가 있는 단계는 모두 링크 | 어느 쪽이든 단계는 어딘가로 갑니다. 둘을 가를 `href`가 없으니 링크로 읽힙니다. |
| 접힌 단계를 마크업에 숨겨 둠 | 접힌 단계는 그리지 않음 | Flutter 화면에서 링크를 긁어 가는 것이 없으니 남겨 둘 이유가 없습니다. |
| `structuredData` | — | schema.org 마이크로데이터는 HTML을 읽는 검색 엔진을 위한 것입니다. |
| `label` | `semanticLabel` | React의 `aria-label`처럼 화면 낭독기만 듣는 이름입니다. |
| `separator`, 이름이나 노드 | `separator`, `MPBreadcrumbSeparator`나 위젯을 받는 `Object` | Dart에는 유니언 타입이 없습니다. `MPIcon.icon`도 같은 모양입니다. |
| `className`, `style` | — | 넘길 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPTextLink](./text-link) — 경로가 아니라 링크 하나일 때.
- [MPTimeline](../display/timeline) — 되짚어 올라갈 길이 아니라 벌어진 일의 기록.
