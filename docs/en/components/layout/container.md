---
title: MPContainer
order: 11
---

# MPContainer

<p class="mp-lede">The page margin, and optionally a measure. Material holds content off the edge of the window by 16dp in a compact window and 24dp from medium up — this is that margin, said once at the top of a page rather than on each of the things inside it.</p>

<Demo src="container/hero" :minHeight="180" />

::: fw react

```tsx
import { MPContainer } from 'material-plus-ui';

<MPContainer maxWidth="lg" render={<main />}>
  …
</MPContainer>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPContainer(maxWidth: const MPResponsive<MPMeasure>(MPMeasure.lg), child: page);
```

:::

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

::: fw flutter

In Dart the rungs are `MPMeasure.xs` to `MPMeasure.xl`, and `maxWidth` takes them in an `MPResponsive`: `MPResponsive<MPMeasure>(MPMeasure.md)`.

:::

So `maxWidth="md"` is "never wider than an expanded window", which is a sentence about the specification rather than a number somebody liked. It is deliberately **not** Tailwind's `max-w-*` scale, where `max-w-lg` is 32rem — two ladders called `lg` on one page is how a layout drifts by a few pixels for no reason anybody can find later.

The rungs are read off the window size classes rather than written down beside them, so a project that [moves a boundary](../../design/breakpoints) moves the measure with it.

## A length of your own

::: fw react

A measure is often a decision about the **text** rather than about the window. The classic answer for a column of prose is around 60 characters, which no ladder of window widths can spell — so `maxWidth` takes any CSS length as well:

```tsx
<MPContainer maxWidth="60ch">{article}</MPContainer>
```

`'42rem'`, `'800px'`, `'min(90vw, 70ch)'` — whatever `max-width` accepts reaches it untouched. Nothing is validated: a length CSS cannot parse leaves the container unbounded, which is the same answer `none` gives.

:::

::: fw flutter

A measure is often a decision about the **text** rather than about the window, and no ladder of window widths can spell it. So `maxWidth` takes a length in logical pixels as well:

```dart
MPContainer(maxWidth: const MPResponsive<MPMeasure>(MPMeasure.pixels(640)), child: article)
```

There are no character units in Flutter, so a measure of about 60 characters is worked out from the type you set, not written as `60ch`.

:::

## A different measure at different widths

`maxWidth` is responsive, in the same shape [`MPGrid`](./grid)'s props are — a map keyed by window size class, each entry applying from its own class **upward**:

::: fw react

```tsx
<MPContainer maxWidth={{ compact: 'none', expanded: 'lg' }}>
```

:::

::: fw flutter

```dart
MPContainer(
  maxWidth: const MPResponsive<MPMeasure>.from(expanded: MPMeasure.lg),
  child: page,
)
```

`MPResponsive(value, medium: …, expanded: …)` is a value with overrides; `MPResponsive.from(expanded: …)` names only the classes it changes, and the classes below keep the parameter's default, which here is no limit.

:::

Edge to edge on a phone, and held to 1200dp from 840 up. Anything not named keeps whatever the class below it said, so two entries usually describe the whole page.

::: fw react

This is resolved by CSS, not by JavaScript: the browser has the right measure in the first frame it paints, including the one a server rendered, and changing window class costs no re-render.

:::

::: fw flutter

The window size class is read off the window through `MediaQuery`, which is right on the first frame, so the container is built at the right measure from the start and rebuilt only when the window crosses a boundary.

:::

## size is the margin, maxWidth is the measure

Two ladders, and they are independent on purpose: how far the content sits from the edge of the window is a different question from how wide the content is allowed to get.

::: fw react

`size="md"` is 16dp, MD3's compact margin. The specification widens it to 24dp from a medium window up, which here is `size="lg"`.

```tsx
<MPContainer size="lg" maxWidth="lg">
  …
</MPContainer>
```

:::

::: fw flutter

`MPSize.md` is 16, MD3's compact margin, and the ladder runs 10, 12, 16, 20, 24. The specification widens the margin to 24 from a medium window up, which is `MPSize.xl`.

```dart
MPContainer(size: MPSize.xl, maxWidth: const MPResponsive<MPMeasure>(MPMeasure.lg), child: page)
```

:::

As on [MPBox](./box), `size` here sets no height and no type scale. A container is as tall as what it holds.

## The three layout components

<Demo src="container/page" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/container/page.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/container/page.dart

:::

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

::: fw react

```tsx
<MPContainer>
  <MPContainer maxWidth="sm" padded={false}>
    …
  </MPContainer>
</MPContainer>
```

:::

::: fw flutter

```dart
MPContainer(
  child: MPContainer(
    maxWidth: const MPResponsive<MPMeasure>(MPMeasure.sm),
    padded: false,
    child: section,
  ),
)
```

:::

## Accessibility

::: fw react

A container is a `<div>` with a margin — no role, no state, no keyboard contract, and nothing added on purpose. Most pages have exactly one, and it is usually the document's main region, which is what `render` is for:

```tsx
<MPContainer render={<main />}>…</MPContainer>
```

:::

::: fw flutter

A container adds nothing to the semantics tree. The screen's main region is `MPPageLayout`'s to claim, and a container is usually what it holds.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `maxWidth` as a rung, a CSS length or a map | `MPResponsive<MPMeasure>?` | A TypeScript union of a value and a map is two constructors in Dart, and a length is logical pixels: there are no `ch`, `rem` or `vw` here. |
| resolved by media queries in the stylesheet | resolved from `MediaQuery` when built | There is no stylesheet. The window is known on the first frame, so the answer is the same. |
| `render` | — | There is no element to replace. |

:::

## See also

- [MPGrid](./grid) — how the content inside divides itself up.
- [MPBox](./box) — the sheet, for when something does want a surface.
- [MPPanes](./panes) — two regions of a page with a handle between them.
