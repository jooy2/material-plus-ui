---
title: MPHighlight
order: 5
---

# MPHighlight

<p class="mp-lede">읽고 있던 글 안에서 찾고 있는 단어를 표시합니다. 스타일링만이 아니라 검색 자체가 컴포넌트입니다. <code>query</code>는 검색창이 들고 있는 값 그대로이고, 값이 바뀌면 표시도 알아서 다시 계산됩니다.</p>

<Demo src="highlight/hero" :minHeight="180" />

::: fw react

```tsx
import { MPHighlight } from 'material-plus-ui';

<MPHighlight query={search}>{article.summary}</MPHighlight>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHighlight(article.summary, query: search);
```

:::

## Props

<PropsTable name="MPHighlight" />

::: fw react

`<span>`이 받는 것은 그대로 전달되고, 표시 자체는 진짜 `<mark>`입니다 — 읽는 사람에게 의미 있는 텍스트를 나타내는 엘리먼트입니다.

:::

::: fw flutter

글은 첫 번째 위치 인자로 받고, `style`, `align`, `lines`는 `Text`의 것과 같습니다. 표시 하나하나는 줄의 기준선에 놓인 `WidgetSpan`입니다.

:::

## `size`가 없고, 그것이 가장 먼저 찾게 될 prop입니다

표시는 흐르는 텍스트 안에 있고, 그 텍스트와 같은 크기여야 합니다. `size` prop은 틀릴 방법만 늘려 줍니다.

[MPIcon](./icon)이 사다리 밖에 있는 것과 같은 이유이고, [prop 규약](../../design/prop-conventions)에 적혀 있습니다.

## 예시

### query

문자열은 하나의 검색어입니다. 배열(Flutter에서는 `List<String>`)이면 여럿이고, 긴 것부터 시도하므로 `['data', 'database']`는 앞 네 글자가 아니라 단어 전체를 표시합니다. `RegExp`는 쓴 그대로 쓰고, 일치하는 곳을 모두 찾습니다.

<Demo src="highlight/matching" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/highlight/matching.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/highlight/matching.dart

:::

</Demo>

`RegExp`에서는 `caseSensitive`와 `wholeWord`가 무시됩니다. 정규 표현식은 이미 그 둘을 스스로 말하고 있기 때문입니다.

### variant

네 단계이고, 기본값이 실제로 형광펜인 하나입니다. `tonal`은 container 톤 — 어두운 글자 아래의 옅은 칠 — 이지, 색 덩어리로 바뀐 단어가 아닙니다.

<Demo src="highlight/variants" :minHeight="180">

::: fw react

<<< @/.vitepress/demos/highlight/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/highlight/variants.dart

:::

</Demo>

`elevated`는 일부러 제공하지 않습니다. elevation은 면이 페이지에서 떠오르는 것인데 표시는 텍스트 줄 *안*에 있습니다 — 떠오른 단어는 자기가 속한 문장 위로 그림자를 드리우게 됩니다.

### color

`primary`가 아니라 `tertiary`이고, 라이브러리에서 그것이 옳은 기본값인 유일한 자리입니다. `primary`는 페이지가 눌러 달라고 말하는 것이고 검색 결과는 그것이 아닙니다. 표시된 단어가 버튼과 같은 색인 페이지에는 가장 큰 소리를 내려고 다투는 것이 둘 있게 됩니다.

### children

::: fw react

엘리먼트는 안으로 들어가되 그대로 남으므로, `<strong>` 안의 일치도 표시되고 `<strong>`도 살아남습니다.

```tsx
<MPHighlight query="cat">
  the <strong>cat</strong> sat
</MPHighlight>
```

문자열만 받는 쪽이 대부분의 라이브러리가 하는 일이고, `<strong>`이 들어간 첫 검색 결과에서 무너집니다.

:::

::: fw flutter

Flutter 빌드는 `String`을 검색합니다. 위젯 트리는 React의 children처럼 안으로 들어가 볼 수 없습니다. 위젯이 무엇을 그릴지는 만들어질 때 비로소 정해지기 때문입니다. 굵은 부분이 들어간 결과는 `Text.rich` 안에 `MPHighlight` 두 개를 두거나, 직접 만든 스타일 스팬으로 하나를 감쌉니다.

:::

## 접근성

::: fw react

- 표시는 `<mark>`이고, 읽는 사람에게 의미 있는 텍스트로 읽힙니다.
- 알아 둘 결과가 하나 있습니다. 한 문단에서 열한 단어를 표시하는 것은 스크린 리더에게 중요한 것이 열한 개라고 말하는 일이고, 그것은 아무 말도 하지 않는 것과 같습니다. 하이라이트는 몇 개의 일치를 위한 것입니다.
- 표시는 아주 얇은 패딩을 두고 같은 만큼을 음수 마진으로 되돌려 놓습니다. 표시된 줄의 길이는 표시 전과 정확히 같고, 검색이 돌아도 페이지의 무엇도 움직이지 않습니다.

:::

::: fw flutter

- 글 전체를 문자열 하나로 한 번 읽습니다. 표시는 위젯이라서, 그렇게 하지 않으면 표시된 낱말이 일반 구간 사이의 자리 표시로 화면 낭독기에 닿습니다.
- Flutter에는 "읽는 사람에게 의미 있음"을 나타내는 의미 정보가 없어서 표시를 그렇게 알리지 않습니다. 중요하다면 검색 필드 옆의 일치 개수처럼 화면의 다른 곳에서 말합니다.
- 표시의 면은 여백을 두는 대신 낱말 양옆으로 살짝 넘치게 칠합니다. 표시된 줄의 길이는 표시 전과 정확히 같고, 검색이 돌아도 화면의 무엇도 움직이지 않습니다.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 안으로 들어가 보는 `children` | `String` | 위젯 트리는 만들어지기 전에 검색할 수 없습니다. |
| `<mark>` | 문자열 전체를 한 번 | Flutter에는 "읽는 사람에게 의미 있음" 역할이 없어서, 문장을 쓰인 그대로 읽습니다. |
| `Exclude<MPVariant, 'elevated'>`인 `variant` | `MPHighlightVariant` | Dart는 enum에서 값을 뺄 수 없어 네 가지를 따로 enum으로 둡니다. |
| 유니언인 `query` | `Object` | Dart에는 유니언 타입이 없습니다. `String`, `List<String>`, `RegExp` 중 하나이며 디버그에서 확인합니다. |
| 두 줄에 걸쳐 끊기는 표시 | 끊기지 않는 표시 하나 | `WidgetSpan`은 통째로 배치되므로, 표시된 구절은 함께 다음 줄로 넘어갑니다. |
| `className`, `style`, `ref` | — | 넘길 클래스 목록, style 속성, 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPTextField](../inputs/text-field) — 질의가 보통 오는 곳.
- [MPTypography](./typography) — 이것이 놓이는 본문.
