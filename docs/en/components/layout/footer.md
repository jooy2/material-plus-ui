---
title: MPFooter
order: 16
---

# MPFooter

<p class="mp-lede">The sheet at the end of a page. A real <code>&lt;footer&gt;</code>, which at the top level of a document is the contentinfo landmark.</p>

<Demo src="footer/hero" :minHeight="320" />

```tsx
import { MPFooter, MPTypography } from 'material-plus-ui';

<MPFooter maxWidth="md">
  <MPTypography level="caption">© 2026 Acme. All rights reserved.</MPTypography>
</MPFooter>;
```

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

<<< @/.vitepress/demos/footer/position.tsx

</Demo>

`static` by default, which is the opposite of [MPHeader](./header)'s `sticky` and is what a footer is: the thing at the end of the document, reached by scrolling to it. A footer that followed the reader down the page would be taking up a strip of every screen to say who owns the copyright.

`sticky` and `fixed` are for the bar that genuinely has to stay in reach — a form's save row, a cookie notice, a bulk-action bar under a table. Inside an [MPPageLayout](./page-layout) a `fixed` one has its height reserved, so the last paragraph is never underneath it.

## Inside a layout, and outside one

Inside an [MPPageLayout](./page-layout) it registers itself, which is what makes the reservation above possible. Outside one it is simply a sheet, and everything else still holds.

By default the layout puts it across the **whole** width, under the sidebars. `footerSpan="content"` puts it between them instead — see [MPPageLayout](./page-layout#headerspan-and-footerspan).

## Examples

### Lining up with the article above it

```tsx
<MPContainer maxWidth="md">The article.</MPContainer>
<MPFooter maxWidth="md">© 2026 Acme</MPFooter>
```

The sheet still spans the window; only the content inside is held to the measure. Both read the same ladder, so the two line up on one edge at every width.

### Columns of links

There is no column prop, and there does not need to be — a footer's columns are a grid:

```tsx
<MPFooter maxWidth="lg">
  <MPGrid spacing={6}>
    <MPGridItem span={{ compact: 6, medium: 3 }}>…</MPGridItem>
    <MPGridItem span={{ compact: 6, medium: 3 }}>…</MPGridItem>
  </MPGrid>
</MPFooter>
```

### A full-bleed footer

`padded={false}` gives up the gutter and the air, for a footer whose content pads itself — a map, a picture, a marquee:

```tsx
<MPFooter padded={false} variant="text">
  <MPAnimateMarquee>…</MPAnimateMarquee>
</MPFooter>
```

## Accessibility

- The sheet is a `<footer>`. At the top level of a document that is the `contentinfo` landmark; nested inside an `<article>` it is not, which is correct — an article's byline is not the site's information.
- Give it a `label` when a page has two.
- A footer full of links wants a `<nav>` around each group, not around the footer: `contentinfo` and `navigation` are different regions and a screen reader offers both.

## See also

- [MPPageLayout](./page-layout) — the skeleton this is the end of.
- [MPHeader](./header) — the same decisions at the other end of the page, with slots.
- [MPContainer](./container) — the same measure ladder, for the content above it.
- [MPBottomNavigation](./bottom-navigation) — a bar of destinations held against the bottom of the window, which is a different thing from the end of a document.
