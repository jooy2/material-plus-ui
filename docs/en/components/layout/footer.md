---
title: MPFooter
order: 16
---

# MPFooter

<p class="mp-lede">The sheet at the end of a page. A real <code>&lt;footer&gt;</code>, which at the top level of a document is the contentinfo landmark.</p>

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

## Why it has no slots, and MPHeader does

Because a header's three regions are a fixed arrangement worth writing once, and a footer's content is not an arrangement at all.

Four columns of links on one site. A copyright line on the next. A language picker, a row of logos and an address on the third. A component that guessed at the shape would be a component every second site had to fight, and the fight would be over a wrapper it did not ask for.

So this one decides the **sheet** — the surface, the gutter, the measure, and whether it stays in reach — and leaves what goes on it to an [MPGrid](./grid), an [MPContainer](./container) or plain elements inside.

## Why the default variant is `outlined` and MPHeader's is `tonal`

Because the two sit against different things.

A header has content passing underneath it at every moment of a scroll, and needs a tone of its own to stay legible against whatever happens to be there. A footer has the end of the document above it and nothing at all below — so the hairline is the whole of what says the document ended.

Reach for `tonal` when the footer is a saved-changes bar rather than the end of a page: at that point it _is_ a bar over content, and MD3's tone difference is what it wants.

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

`static` by default, which is the opposite of [MPHeader](./header)'s `sticky` and is what a footer is: the thing at the end of the document, reached by scrolling to it. A footer that followed the reader down the page would be taking up a strip of every screen to say who owns the copyright.

`sticky` and `fixed` are for the bar that genuinely has to stay in reach — a form's save row, a cookie notice, a bulk-action bar under a table. Inside an [MPPageLayout](./page-layout) a `fixed` one has its height reserved, so the last paragraph is never underneath it.

:::

::: fw flutter

There is no `position` in Flutter: a screen has no document scroll for a sheet to stick to. A footer that ends the document is the last thing in the scroll view, reached by scrolling to it. One that has to stay in reach (a form's save row, a cookie notice, a bulk-action bar under a table) goes below the scrolling part of the screen, which is what [MPPageLayout](./page-layout)'s `footer` slot is: the demo above is that.

:::

::: fw react

## Inside a layout, and outside one

Inside an [MPPageLayout](./page-layout) it registers itself, which is what makes the reservation above possible. Outside one it is simply a sheet, and everything else still holds.

By default the layout puts it across the **whole** width, under the sidebars. `footerSpan="content"` puts it between them instead — see [MPPageLayout](./page-layout#headerspan-and-footerspan).

:::

::: fw flutter

## With MPPageLayout, and without one

Inside an [MPPageLayout](./page-layout) the footer is what the `footer` slot holds, and the layout's `Column` gives the band above it whatever the footer left; there is nothing to register. Outside one it is simply a sheet.

By default the layout puts it across the **whole** width, under the sidebars. `footerSpan: MPPageSpan.content` puts it between them instead.

:::

## Examples

### Lining up with the article above it

::: fw react

```tsx
<MPContainer maxWidth="md">The article.</MPContainer>
<MPFooter maxWidth="md">© 2026 Acme</MPFooter>
```

:::

::: fw flutter

```dart
const Column(
  children: <Widget>[
    MPContainer(maxWidth: MPResponsive<MPMeasure>(MPMeasure.md), child: Text('The article.')),
    MPFooter(maxWidth: MPResponsive<MPMeasure>(MPMeasure.md), child: Text('© 2026 Acme')),
  ],
)
```

:::

The sheet still spans the window; only the content inside is held to the measure. Both read the same ladder, so the two line up on one edge at every width.

### Columns of links

There is no column prop, and there does not need to be — a footer's columns are a grid:

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

### A full-bleed footer

`padded={false}` gives up the gutter and the air, for a footer whose content pads itself — a map, a picture, a marquee:

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

## Accessibility

::: fw react

- The sheet is a `<footer>`. At the top level of a document that is the `contentinfo` landmark; nested inside an `<article>` it is not, which is correct — an article's byline is not the site's information.
- Give it a `label` when a page has two.
- A footer full of links wants a `<nav>` around each group, not around the footer: `contentinfo` and `navigation` are different regions and a screen reader offers both.

:::

::: fw flutter

- At the top of a screen the footer is the `contentInfo` landmark. Inside the main region of an `MPPageLayout`, where it is an article's own footer, it claims no landmark, because Flutter does not allow one landmark inside another; given a `semanticLabel` there it is a named region instead.
- Give it a `semanticLabel` when a screen has two.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| a `<footer>`, the `contentinfo` landmark | the `contentInfo` role at the top of a screen | The same landmark, claimed through the semantics tree. Inside a layout's main region it claims none, as Flutter requires. |
| `position` | — | There is no document scroll to stick to; `MPPageLayout`'s `footer` slot keeps a footer in reach. |
| registers itself with `MPPageLayout` | nothing to register | The layout's `Column` already does the arithmetic. |
| `label` | `semanticLabel` | The library's Flutter name for a screen reader's label. |
| `render` | — | There is no element to replace. |

:::

## See also

- [MPPageLayout](./page-layout) — the skeleton this is the end of.
- [MPHeader](./header) — the same decisions at the other end of the page, with slots.
- [MPContainer](./container) — the same measure ladder, for the content above it.
- [MPBottomNavigation](./bottom-navigation) — a bar of destinations held against the bottom of the window, which is a different thing from the end of a document.
