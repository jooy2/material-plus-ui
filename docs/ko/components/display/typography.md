---
title: MPTypography
order: 2
---

# MPTypography

<p class="mp-lede">머터리얼의 타입 역할로 조판된 글입니다. 타입 스케일은 디자인 시스템에서 나머지 모든 것이 기준으로 삼는 유일한 것인데, 이 컴포넌트는 그 사다리 자체입니다. 덕분에 컨트롤을 감싸지 않고도 페이지의 제목을 컴포넌트와 같은 <code>headline-large</code>로 세울 수 있습니다.</p>

<Demo src="typography/hero" />

```tsx
import { MPTypography } from 'material-plus-ui';

<MPTypography level="h2">Material Plus 1.0</MPTypography>
<MPTypography>아래의 모든 단계는 MD3 자신의 타입 역할입니다.</MPTypography>;
```

## Props

<PropsTable name="MPTypography" />

모든 native 속성이 그대로 전달되고, `ref`는 엘리먼트에 닿습니다.

## 모든 level은 머터리얼의 역할입니다

여기에는 보간한 값도, 새로 지어낸 값도 없습니다. `level` 하나하나가 MD3 자신의 타입 역할을 고르고, 크기·행간·자간은 물론 **굵기까지** 스펙 그대로입니다.

| `level`    | 머터리얼 역할     | 크기 / 행간 | 엘리먼트 |
| ---------- | ----------------- | ----------- | -------- |
| `h1`       | `display-small`   | 36 / 44     | `<h1>`   |
| `h2`       | `headline-large`  | 32 / 40     | `<h2>`   |
| `h3`       | `headline-medium` | 28 / 36     | `<h3>`   |
| `h4`       | `headline-small`  | 24 / 32     | `<h4>`   |
| `h5`       | `title-large`     | 22 / 28     | `<h5>`   |
| `h6`       | `title-medium`    | 16 / 24     | `<h6>`   |
| `lead`     | `title-large`     | 22 / 28     | `<p>`    |
| `body`     | `body-large`      | 16 / 24     | `<p>`    |
| `caption`  | `body-small`      | 12 / 16     | `<span>` |
| `overline` | `label-small`     | 11 / 16     | `<span>` |

<Demo src="typography/scale">

<<< @/.vitepress/demos/typography/scale.tsx

</Demo>

두 줄이 같은 역할을 공유하는 것은 의도한 것입니다. `h5`와 `lead`가 모두 `title-large`인 이유는 MD3에 그 크기의 역할이 정확히 하나뿐이고, 리드 문단이 바로 그 용도이기 때문입니다 — 둘은 내보내는 엘리먼트가 다르고, 문서 개요에 실제로 영향을 주는 것은 그쪽입니다. `h6`와 `body`가 모두 16px인 것도 스펙이 그렇게 둔 이유와 같습니다. `title-medium`은 **곧** 굵기 500의 `body-large`이고, 그 굵기가 소제목과 그 아래 문단을 가르는 전부입니다.

`display-large`와 `display-medium`은 제공하지 않습니다. 57px과 45px은 마케팅 페이지의 히어로 타입이고, 가장 작은 일이 캡션인 컴포넌트가 옥외 광고까지 조판할 필요는 없습니다.

## 머터리얼의 제목은 굵지 않습니다

::: warning 이 부분이 가장 뜻밖일 겁니다

MD3의 모든 display, headline, `title-large` 역할은 **굵기 400**이고, `level`이 내주는 것도 그것입니다. 제목을 600으로 세우는 것은 머터리얼 페이지를 다른 시스템의 것처럼 보이게 만드는 가장 빠른 방법입니다.

:::

`weight`는 정말 필요할 때를 위한 것이고 — 표 헤더, 캡션 안의 강조 — `font-*` 클래스는 언제나 정확히 하나만 나갑니다. 그래야 덮어쓰기가 실제로 이깁니다. 특이도가 같은 두 유틸리티는 생성된 스타일시트의 순서로 승부가 갈리는데, 컴포넌트가 기댈 만한 것이 아닙니다.

## 크기 사다리 위에 있지 않습니다

`size` prop이 없고, 이것은 [MPIcon](./icon)이 내리는 것과 같은 판단입니다. `MPSize`는 _컨트롤_ 사다리입니다. `md`는 높이 56px을 뜻하고, 문단에는 스케일에서 고를 높이가 없습니다. `level`이 이 컴포넌트의 스케일이고, 그것은 라이브러리가 지어낸 다섯 단계가 아니라 머터리얼의 것입니다.

## `level`은 스케일과 엘리먼트를 함께 정합니다

그것이 일반적인 경우이고, `level`이 `headline-large`가 아니라 `h2`로 적히는 이유이기도 합니다 — 역할 이름을 쓴 호출자에게는 몇 번째 제목인지 말할 방법이 없습니다.

둘이 달라져야 할 때는 `render`가 결정합니다.

```tsx
// h3처럼 보이지만 문서 개요에는 들어가지 않습니다.
<MPTypography level="h3" render={<div />}>섹션</MPTypography>

// 의미상으로는 페이지 제목이지만 더 조용한 크기로.
<MPTypography level="h4" render={<h1 />}>설정</MPTypography>
```

## `color`에는 기본값이 없습니다

역할을 지정하지 않으면 글은 면의 잉크 색을 그대로 물려받습니다. 문단의 일반적인 경우는 주변 문단과 같아 보이는 것이기 때문입니다. `caption`과 `overline` 둘만 예외로, 내용 _자체_ 가 아니라 내용에 _대한_ 글을 위한 MD3의 역할인 `on-surface-variant`를 가져갑니다.

```tsx
<MPTypography>on-surface를 물려받습니다</MPTypography>
<MPTypography color="error">error 계열을 읽습니다</MPTypography>
```

## 함께 보기

- [색](../../design/color) — `on-surface`와 강조 색 계열이 어디서 오는지.
- [MPTextLink](./text-link) — 이 문단 안에 들어가는 링크.
- [MPBlockquote](./blockquote) — 남의 말을 내 글과 구분해서 놓기.
