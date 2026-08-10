---
title: MPHighlight
order: 5
---

# MPHighlight

<p class="mp-lede">읽고 있던 글 안에서 찾고 있는 단어를 표시합니다. 스타일링만이 아니라 검색 자체가 컴포넌트입니다. <code>query</code>는 검색창이 들고 있는 값 그대로이고, 값이 바뀌면 표시도 알아서 다시 계산됩니다.</p>

<Demo src="highlight/hero" :minHeight="180" />

```tsx
import { MPHighlight } from 'material-plus-ui';

<MPHighlight query={search}>{article.summary}</MPHighlight>;
```

## Props

<PropsTable name="MPHighlight" />

`<span>`이 받는 것은 그대로 전달되고, 표시 자체는 진짜 `<mark>`입니다 — 읽는 사람에게 의미 있는 텍스트를 나타내는 엘리먼트입니다.

## `size`가 없고, 그것이 가장 먼저 찾게 될 prop입니다

표시는 흐르는 텍스트 안에 있고, 그 텍스트와 같은 크기여야 합니다. `size` prop은 틀릴 방법만 늘려 줍니다.

[MPIcon](./icon)이 사다리 밖에 있는 것과 같은 이유이고, [prop 규약](../../design/prop-conventions)에 적혀 있습니다.

## 예시

### query

문자열은 하나의 검색어입니다. 배열이면 여럿이고, 긴 것부터 시도하므로 `['data', 'database']`는 앞 네 글자가 아니라 단어 전체를 표시합니다. `RegExp`는 그대로 쓰이되 `g` 플래그만 강제됩니다.

<Demo src="highlight/matching" :minHeight="200">

<<< @/.vitepress/demos/highlight/matching.tsx

</Demo>

`RegExp`에서는 `caseSensitive`와 `wholeWord`가 무시됩니다. 정규 표현식은 이미 그 둘을 스스로 말하고 있기 때문입니다.

### variant

네 단계이고, 기본값이 실제로 형광펜인 하나입니다. `tonal`은 container 톤 — 어두운 글자 아래의 옅은 칠 — 이지, 색 덩어리로 바뀐 단어가 아닙니다.

<Demo src="highlight/variants" :minHeight="180">

<<< @/.vitepress/demos/highlight/variants.tsx

</Demo>

`elevated`는 일부러 제공하지 않습니다. elevation은 면이 페이지에서 떠오르는 것인데 표시는 텍스트 줄 *안*에 있습니다 — 떠오른 단어는 자기가 속한 문장 위로 그림자를 드리우게 됩니다.

### color

`primary`가 아니라 `tertiary`이고, 라이브러리에서 그것이 옳은 기본값인 유일한 자리입니다. `primary`는 페이지가 눌러 달라고 말하는 것이고 검색 결과는 그것이 아닙니다. 표시된 단어가 버튼과 같은 색인 페이지에는 가장 큰 소리를 내려고 다투는 것이 둘 있게 됩니다.

### children

엘리먼트는 안으로 들어가되 그대로 남으므로, `<strong>` 안의 일치도 표시되고 `<strong>`도 살아남습니다.

```tsx
<MPHighlight query="cat">
  the <strong>cat</strong> sat
</MPHighlight>
```

문자열만 받는 쪽이 대부분의 라이브러리가 하는 일이고, `<strong>`이 들어간 첫 검색 결과에서 무너집니다.

## 접근성

- 표시는 `<mark>`이고, 읽는 사람에게 의미 있는 텍스트로 읽힙니다.
- 알아 둘 결과가 하나 있습니다. 한 문단에서 열한 단어를 표시하는 것은 스크린 리더에게 중요한 것이 열한 개라고 말하는 일이고, 그것은 아무 말도 하지 않는 것과 같습니다. 하이라이트는 몇 개의 일치를 위한 것입니다.
- 표시는 아주 얇은 패딩을 두고 같은 만큼을 음수 마진으로 되돌려 놓습니다. 표시된 줄의 길이는 표시 전과 정확히 같고, 검색이 돌아도 페이지의 무엇도 움직이지 않습니다.

## 함께 보기

- [MPTextField](../inputs/text-field) — 질의가 보통 오는 곳.
- [MPTypography](./typography) — 이것이 놓이는 본문.
