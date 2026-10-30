---
title: MPFooter
order: 16
---

# MPFooter

<p class="mp-lede">페이지 끝의 시트입니다. 진짜 <code>&lt;footer&gt;</code>이고, 문서 최상위에서 그 태그는 contentinfo 랜드마크입니다.</p>

<Demo src="footer/hero" :minHeight="320" />

::: fw react

```tsx
import { MPFooter, MPTypography } from 'material-plus-ui';

<MPFooter maxWidth="md">
  <MPTypography level="caption">© 2026 Acme. All rights reserved.</MPTypography>
</MPFooter>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPFooter(
  maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
  child: MPTypography('© 2026 Acme. All rights reserved.', level: MPTypographyLevel.caption),
);
```

:::

## Props

<PropsTable name="MPFooter" />

## 슬롯이 없는 이유, 그리고 MPHeader에는 있는 이유

헤더의 세 구역은 한 번 써 둘 값어치가 있는 고정된 배치이지만, 푸터의 내용은 애초에 배치가 아니기 때문입니다.

어떤 사이트에서는 링크 네 열입니다. 다음 사이트에서는 저작권 한 줄입니다. 세 번째에서는 언어 선택기와 로고 몇 개와 주소입니다. 모양을 짐작한 컴포넌트는 두 번에 한 번은 사이트와 싸우는 컴포넌트가 되고, 그 싸움의 대상은 아무도 부탁하지 않은 래퍼입니다.

그래서 이 컴포넌트는 **시트**를 정합니다. 표면, 좌우 여백, 본문 폭, 그리고 손이 닿는 곳에 남을지. 그 위에 무엇이 놓이는지는 안에 넣는 [MPGrid](./grid), [MPContainer](./container), 또는 평범한 엘리먼트의 몫입니다.

## 기본 variant가 `outlined`이고 MPHeader는 `tonal`인 이유

둘이 서로 다른 것을 마주 보기 때문입니다.

헤더 아래로는 스크롤하는 내내 내용이 지나가므로, 무엇이 지나가든 읽히려면 자기 톤이 필요합니다. 푸터 위에는 문서의 끝이 있고 아래에는 아무것도 없습니다. 그래서 실선이 문서가 끝났다고 말하는 전부입니다.

푸터가 페이지의 끝이 아니라 저장 바일 때는 `tonal`을 고르세요. 그 순간 그것은 _내용 위의 바_ 가 되고, MD3의 톤 차이가 바로 그때 필요한 것입니다.

## position

<Demo src="footer/position" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/footer/position.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/footer/position.dart

:::

</Demo>

::: fw react

기본값은 `static`입니다. [MPHeader](./header)의 `sticky`와 반대이고, 그것이 푸터의 정의입니다. 문서의 끝, 스크롤해서 닿는 것. 독자를 따라 페이지를 내려오는 푸터는 저작권자가 누구인지 말하자고 모든 화면의 한 줄을 가져가는 것입니다.

`sticky`와 `fixed`는 정말로 손이 닿는 곳에 남아야 하는 바를 위한 것입니다. 폼의 저장 행, 쿠키 안내, 표 아래의 일괄 작업 바. [MPPageLayout](./page-layout) 안에서 `fixed` 푸터는 높이를 미리 비워 받으므로, 마지막 문단이 그 밑에 깔리지 않습니다.

:::

::: fw flutter

Flutter에는 `position`이 없습니다. 시트가 붙을 문서 스크롤이 화면에 없기 때문입니다. 문서를 끝맺는 푸터는 스크롤 뷰의 마지막에 놓여 스크롤해서 닿습니다. 손이 닿는 곳에 남아야 하는 푸터(폼의 저장 행, 쿠키 안내, 표 아래의 일괄 작업 바)는 화면에서 스크롤되는 부분의 아래에 두고, [MPPageLayout](./page-layout)의 `footer` 슬롯이 바로 그 자리입니다. 위 예제가 그렇게 만든 것입니다.

:::

::: fw react

## 레이아웃 안에서, 그리고 밖에서

[MPPageLayout](./page-layout) 안에서 시트는 스스로를 등록하고, 위의 예약은 그래서 가능합니다. 밖에서는 그냥 시트이고, 나머지는 그대로 성립합니다.

기본적으로 레이아웃은 푸터를 사이드바 아래로 **전체** 폭에 놓습니다. `footerSpan="content"`는 사이드바 사이에 놓습니다 — [MPPageLayout](./page-layout#headerspan과-footerspan)을 보세요.

:::

::: fw flutter

## MPPageLayout과 함께, 그리고 따로

[MPPageLayout](./page-layout) 안에서 푸터는 `footer` 슬롯이 담는 것이고, 레이아웃의 `Column`이 푸터가 남긴 만큼을 위쪽 띠에 줍니다. 등록할 것은 없습니다. 밖에서는 그냥 시트입니다.

기본적으로 레이아웃은 푸터를 사이드바 아래로 **전체** 폭에 놓습니다. `footerSpan: MPPageSpan.content`는 사이드바 사이에 놓습니다.

:::

## 예시

### 위의 기사와 선 맞추기

::: fw react

```tsx
<MPContainer maxWidth="md">기사 본문.</MPContainer>
<MPFooter maxWidth="md">© 2026 Acme</MPFooter>
```

:::

::: fw flutter

```dart
const Column(
  children: <Widget>[
    MPContainer(maxWidth: MPResponsive<MPMeasure>(MPMeasure.md), child: Text('기사 본문.')),
    MPFooter(maxWidth: MPResponsive<MPMeasure>(MPMeasure.md), child: Text('© 2026 Acme')),
  ],
)
```

:::

시트는 여전히 창 전체를 덮고, 묶이는 것은 안의 내용뿐입니다. 둘이 같은 사다리를 읽으므로 어느 폭에서도 한 선에 맞습니다.

### 링크 열

열을 위한 prop은 없고, 필요하지도 않습니다. 푸터의 열은 그리드입니다.

::: fw react

```tsx
<MPFooter maxWidth="lg">
  <MPGrid spacing={6}>
    <MPGridItem span={{ compact: 6, medium: 3 }}>…</MPGridItem>
    <MPGridItem span={{ compact: 6, medium: 3 }}>…</MPGridItem>
  </MPGrid>
</MPFooter>
```

:::

::: fw flutter

```dart
MPFooter(
  maxWidth: const MPResponsive<MPMeasure>(MPMeasure.lg),
  child: MPGrid(
    spacing: const MPResponsive<double>(6),
    children: <Widget>[
      MPGridItem(
        span: const MPResponsive<MPGridSpan>(MPGridSpan(6), medium: MPGridSpan(3)),
        child: products,
      ),
      MPGridItem(
        span: const MPResponsive<MPGridSpan>(MPGridSpan(6), medium: MPGridSpan(3)),
        child: company,
      ),
    ],
  ),
)
```

:::

### 가장자리까지 채우는 푸터

`padded={false}`는 여백과 공기를 포기합니다. 스스로 여백을 갖는 내용 — 지도, 사진, 마퀴 — 을 담은 푸터를 위한 것입니다.

::: fw react

```tsx
<MPFooter padded={false} variant="text">
  <MPAnimateMarquee>…</MPAnimateMarquee>
</MPFooter>
```

:::

::: fw flutter

```dart
MPFooter(
  padded: false,
  variant: MPVariant.text,
  child: MPAnimateMarquee(children: logos),
)
```

:::

## 접근성

::: fw react

- 시트는 `<footer>`입니다. 문서 최상위에서는 `contentinfo` 랜드마크이고, `<article>` 안에 중첩되면 아닙니다. 그게 맞습니다. 기사의 서명란은 사이트의 정보가 아닙니다.
- 한 페이지에 둘이 있다면 `label`을 주세요.
- 링크로 가득한 푸터라면 `<nav>`는 푸터가 아니라 각 그룹을 감싸야 합니다. `contentinfo`와 `navigation`은 다른 영역이고 스크린 리더는 둘 다 내놓습니다.

:::

::: fw flutter

- 화면 최상위의 푸터는 `contentInfo` 랜드마크입니다. `MPPageLayout`의 main 영역 안, 곧 기사 자신의 푸터일 때는 랜드마크를 주장하지 않습니다. Flutter는 랜드마크 안에 랜드마크를 허용하지 않기 때문입니다. 그 자리에서 `semanticLabel`을 주면 이름 있는 영역이 됩니다.
- 한 화면에 둘이 있다면 `semanticLabel`을 주세요.

:::

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `contentinfo` 랜드마크인 `<footer>` | 화면 최상위에서 `contentInfo` 역할 | 같은 랜드마크를 시맨틱 트리로 주장합니다. 레이아웃의 main 영역 안에서는 Flutter의 규칙대로 주장하지 않습니다. |
| `position` | — | 붙을 문서 스크롤이 없습니다. 손이 닿는 푸터는 `MPPageLayout`의 `footer` 슬롯이 맡습니다. |
| `MPPageLayout`에 스스로 등록 | 등록할 것이 없음 | 레이아웃의 `Column`이 이미 계산합니다. |
| `label` | `semanticLabel` | 화면 낭독기 이름을 가리키는 이 라이브러리의 Flutter 이름입니다. |
| `render` | — | 바꿔 끼울 엘리먼트가 없습니다. |

:::

## 함께 보기

- [MPPageLayout](./page-layout) — 이 시트가 끝을 맡는 뼈대.
- [MPHeader](./header) — 페이지 반대쪽 끝의 같은 결정들, 슬롯이 있는 쪽.
- [MPContainer](./container) — 위쪽 내용을 위한 같은 본문 폭 사다리.
- [MPBottomNavigation](./bottom-navigation) — 창 아래에 붙는 목적지의 바. 문서의 끝과는 다른 것입니다.
