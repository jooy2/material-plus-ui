---
title: MPFlex
order: 10
---

# MPFlex

<p class="mp-lede">A row, or a column, and the width at which it changes from one to the other. It draws nothing — no surface, no padding, no corner — only the five properties a flex container has, each of which can be said per window size class.</p>

<Demo src="flex/hero" :minHeight="300" />

```tsx
import { MPFlex } from 'material-plus-ui';

<MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16}>
  <Card />
  <Card />
</MPFlex>;
```

## Props

<PropsTable name="MPFlex" />

## Why this and not a `className`

For a row that is always a row, a `className` is the better answer and this component is overhead. What it is for is the row that is a column on a phone.

Written as Tailwind's own variants that is `flex-col md:flex-row` — which is the library's boundary said again in Tailwind's numbers, 768px rather than 600, and a layout that reflows at one width while the [MPGrid](./grid) beside it reflows at another.

There are two right answers, and this is the second:

```tsx
<div className="mp-medium:flex-row flex flex-col">  // the variants this package ships
<MPFlex direction={{ compact: 'column', medium: 'row' }} />  // the same thing in props
```

Both fix the number and both resolve in CSS. Use the first where a page is already writing Tailwind; use this where it would rather say the layout in props. See [Breakpoints](../../design/breakpoints.md).

## Its relationship to the other three

| Component          | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `MPFlex`           | A row or a column, with nothing drawn                     |
| [MPGrid](./grid)   | Divides a row into columns — what a _page_ is laid out on |
| [MPStack](./stack) | Lays things **over** each other in a pile                 |
| [MPBox](./box)     | A sheet: padding, a surface, a corner                     |

Reach for `MPGrid` when things have to line up with things in another row; that is what a column count is for and a flex row cannot promise it. `MPStack` shares an unfortunate name across the ecosystem and is a different idea entirely — a stack of avatars, a deck of cards.

## Every axis is responsive

`direction`, `wrap`, `justify`, `align` and `gap` all take either a bare value or a map keyed by window size class, and each entry applies from its own class **upward**:

```tsx
<MPFlex direction={{ compact: 'column', expanded: 'row' }} gap={{ compact: 8, expanded: 24 }} />
```

Anything not named keeps whatever the class below it said, so a layout is usually two entries rather than five.

It resolves in **CSS**, not in JavaScript. The values reach the stylesheet as custom properties, one per class the caller actually named, so a window crossing 600dp changes the layout with nothing re-rendering and a server-rendered first paint is already right. That is the half a hook and a branch cannot do.

## `justify` and `align`

CSS's own words, because this is CSS's own question — the same set [MPGrid](./grid) takes, so a row and a grid do not need two vocabularies.

`start` and `end` are the exceptions, and they are the library's: they reach CSS as `flex-start` and `flex-end`. A caller who has written `align="start"` on a divider's label should not have to write a different word here.

`align` defaults to `stretch`, which is CSS's own and is what makes two cards in a row the same height without either being told a height. `center` is what a row of a label and a control wants.

## `gap`

A number is pixels and a string is any CSS length — the one rule this library states about a length, everywhere.

## Nesting

A flex inside a flex is the normal way to build a bar: a row, holding a group at each end, each of which is a row of its own.

The inner one is not affected by the outer one's responsive values, which sounds obvious and is the part that goes wrong in a naive implementation. The slots are inherited custom properties, so an inner flex told `direction="row"` — one slot, at `compact` — would otherwise resolve its parent's `large` entry above 1200dp and come out a column on a laptop. Every `MPFlex` clears the whole set on itself, which is what stops that.
