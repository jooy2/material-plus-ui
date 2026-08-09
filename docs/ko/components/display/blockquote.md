---
title: MPBlockquote
order: 10
---

# MPBlockquote

<p class="mp-lede">남의 말을 내 글과 구분해서 놓습니다. 여기에는 상태도 키보드 계약도 없습니다 — 있는 것은 틀리기 쉬운 마크업이고, 그것을 제대로 하는 것이 이 컴포넌트의 대부분입니다.</p>

<Demo src="blockquote/hero" :minHeight="220" />

```tsx
import { MPBlockquote } from 'material-plus-ui';

<MPBlockquote author="Ada Lovelace" source="Notes on the Analytical Engine">
  해석기관은 무언가를 스스로 만들어낸다고 주장하지 않는다.
</MPBlockquote>;
```

## Props

<PropsTable name="MPBlockquote" />

모든 native `<figure>` 속성이 그대로 전달되고, `ref`는 래퍼에 닿습니다.

## 래퍼는 출처 표시에 따라 바뀝니다

없으면 `<div>`, 있으면 `<figure>`입니다. HTML 스펙은 출처 표시가 blockquote _바깥_ 에 있어야 한다고 분명히 말합니다 — 안에 있는 이름은 말한 사람이 자기 이름을 말했다고 주장하는 것이 됩니다 — 그리고 `<figcaption>`이 없는 `<figure>`는 아무것도 아닌 것의 figure입니다.

```html
<!-- 출처 없음 -->
<div><blockquote>…</blockquote></div>

<!-- 출처 있음 -->
<figure>
  <blockquote>…</blockquote>
  <figcaption>— Ada Lovelace <cite>Notes on the Analytical Engine</cite></figcaption>
</figure>
```

`author`는 사람이고 `source`는 작품입니다. 서로 다른 엘리먼트인 이유는 `<cite>`가 작품의 제목을 위한 것이고, 스펙에 따르면 사람의 이름에는 **절대** 쓰지 않기 때문입니다.

`cite`는 세 번째이고 기계용입니다. `<blockquote>` 자신의 속성에 실리는 URL이며 아무에게도 보이지 않습니다.

## `<blockquote>` 자체에는 아무것도 그리지 않습니다

면도, 세로선도, 여백도 모두 그것을 감싼 엘리먼트의 것입니다. 정갈함의 문제가 아닙니다. `blockquote`는 호스트 스타일시트가 여전히 태그 이름으로 스타일링하는 몇 안 되는 태그 중 하나입니다 — VitePress의 `.vp-doc blockquote`는 회색 `border-left`와 `padding-left`, `color`를 설정하고, 그 특이도는 클래스 하나짜리 유틸리티가 이길 수 없습니다. 인용문 자체에 그은 선은 조용히 회색이 되고 1px 얇아집니다.

## 예시

### variant

<Demo src="blockquote/variants">

<<< @/.vitepress/demos/blockquote/variants.tsx

</Demo>

`text`가 기본값이고 흐르는 본문에 속하는 것입니다. 여백의 선 하나, 그게 전부입니다. 위에 올릴 면이라는 것이 생기기 훨씬 전부터 인용문이 그래 왔던 모습입니다.

`elevated`와 `outlined`는 면을 **중립**으로 둡니다. 인용문은 남의 말을 담고 있고, 물들인 판 위의 글은 아무도 그것을 고려하지 않고 고른 배경 위의 글이기 때문입니다. `filled`와 `tonal`은 그럼에도 물들입니다 — 브랜드 색의 pull quote가 그것입니다 — 그래서 이 둘은 호출자가 이름을 대고 요청해야 합니다.

칠해진 인용문에서도 선이 있는 쪽 모서리는 각져 있습니다. 표시하는 글에서 휘어져 나가는 2px 선은 여백의 선이 아니라 괄호입니다.

### size

`md`는 `title-large`입니다 — 굵기 400의 22px, MD3 자신의 제목이 아닌 역할 중 가장 크고, pull quote가 정확히 그것입니다. 행간은 그 역할의 것이므로 네 줄까지 가는 인용문도 제목의 빡빡한 1.27이 아니라 문단에 필요한 공기를 갖습니다.

### icon

인용 부호는 타이핑한 것이 아니라 그린 것입니다. 진짜 `“`는 페이지가 쓰는 서체로 조판되어 모양·굵기·베이스라인이 함께 바뀌고 — 2em에서 컴포넌트 안 가장 큰 단일 글리프이므로 — 그것이 바뀌는 것이 가장 눈에 띄는 일이 됩니다.

```tsx
<MPBlockquote />                       // 기본 표시
<MPBlockquote icon={false} />          // 없음
<MPBlockquote icon={<MyMark />} />     // 직접
```

## 함께 보기

- [MPTypography](./typography) — 이것이 만들어진 타입 역할들.
- [MPTextLink](../navigation/text-link) — 인용문 안의 링크.
