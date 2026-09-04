---
title: MPContainer
order: 11
---

# MPContainer

<p class="mp-lede">The page margin, and optionally a measure. Material holds content off the edge of the window by 16dp in a compact window and 24dp from medium up — this is that margin, said once at the top of a page rather than on each of the things inside it.</p>

<Demo src="container/hero" :minHeight="180" />

```tsx
import { MPContainer } from 'material-plus-ui';

<MPContainer maxWidth="lg" render={<main />}>
  …
</MPContainer>;
```

## Props

<PropsTable name="MPContainer" />

## maxWidth is off by default

Because the two decisions arrive at different times. Nearly every page wants the margin, and a good number of them — a dashboard, a table, an editor — deliberately want the full width. A container that capped the width on its own would be a component whose most common use is undoing something it did.

When you do want a measure, the ladder is pinned to MD3's window size class boundaries:

| `maxWidth` | Width  | What it is                         |
| ---------- | ------ | ---------------------------------- |
| `xs`       | 480dp  | Narrower than a compact window     |
| `sm`       | 600dp  | Where a medium window starts       |
| `md`       | 840dp  | Where an expanded window starts    |
| `lg`       | 1200dp | Where a large window starts        |
| `xl`       | 1600dp | Where an extra-large window starts |

So `maxWidth="md"` is "never wider than an expanded window", which is a sentence about the specification rather than a number somebody liked. It is deliberately **not** Tailwind's `max-w-*` scale, where `max-w-lg` is 32rem — two ladders called `lg` on one page is how a layout drifts by a few pixels for no reason anybody can find later.

The rungs are read off the window size classes rather than written down beside them, so a project that [moves a boundary](../../design/breakpoints) moves the measure with it.

## A length of your own

A measure is often a decision about the **text** rather than about the window. The classic answer for a column of prose is around 60 characters, which no ladder of window widths can spell — so `maxWidth` takes any CSS length as well:

```tsx
<MPContainer maxWidth="60ch">{article}</MPContainer>
```

`'42rem'`, `'800px'`, `'min(90vw, 70ch)'` — whatever `max-width` accepts reaches it untouched. Nothing is validated: a length CSS cannot parse leaves the container unbounded, which is the same answer `none` gives.

## A different measure at different widths

`maxWidth` is responsive, in the same shape [`MPGrid`](./grid)'s props are — a map keyed by window size class, each entry applying from its own class **upward**:

```tsx
<MPContainer maxWidth={{ compact: 'none', expanded: 'lg' }}>
```

Edge to edge on a phone, and held to 1200dp from 840 up. Anything not named keeps whatever the class below it said, so two entries usually describe the whole page.

This is resolved by CSS, not by JavaScript: the browser has the right measure in the first frame it paints, including the one a server rendered, and changing window class costs no re-render.

## size is the margin, maxWidth is the measure

Two ladders, and they are independent on purpose: how far the content sits from the edge of the window is a different question from how wide the content is allowed to get.

`size="md"` is 16dp, MD3's compact margin. The specification widens it to 24dp from a medium window up, which here is `size="lg"`.

```tsx
<MPContainer size="lg" maxWidth="lg">
  …
</MPContainer>
```

As on [MPBox](./box), `size` here sets no height and no type scale. A container is as tall as what it holds.

## The three layout components

<Demo src="container/page" :minHeight="320">

<<< @/.vitepress/demos/container/page.tsx

</Demo>

They do three separate jobs, and none of them does another's:

- **MPContainer** holds the page off the edge of the window, and caps the measure.
- **[MPGrid](./grid)** divides what is inside into columns.
- **[MPBox](./box)** is the surface.

A container holds a grid as happily as it holds a single paragraph, and a grid needs no container around it.

## Why it draws no surface

No `variant`, no `color`, no shadow. The outermost element on a page is the one thing that must not decide what the page looks like: a container that painted `surface-container` would put a second background behind an application that already has one, and every sheet inside it would then be a sheet on a sheet.

When the page genuinely is a card on a background, that is an [MPBox](./box) or an [MPCard](./card) **inside** the container.

## Nesting

A container inside a container is two margins, which is almost never what was meant. If an inner section needs a narrower measure, give it the measure and take the margin away:

```tsx
<MPContainer>
  <MPContainer maxWidth="sm" padded={false}>
    …
  </MPContainer>
</MPContainer>
```

## Accessibility

A container is a `<div>` with a margin — no role, no state, no keyboard contract, and nothing added on purpose. Most pages have exactly one, and it is usually the document's main region, which is what `render` is for:

```tsx
<MPContainer render={<main />}>…</MPContainer>
```

## See also

- [MPGrid](./grid) — how the content inside divides itself up.
- [MPBox](./box) — the sheet, for when something does want a surface.
- [MPPanes](./panes) — two regions of a page with a handle between them.
