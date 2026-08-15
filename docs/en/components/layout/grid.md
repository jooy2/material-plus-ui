---
title: MPGrid
order: 9
---

# MPGrid

<p class="mp-lede">Material's layout grid: a row divided into columns, and items that take some of them. The column count changes with the <strong>window size class</strong> the specification defines — four columns on a phone, twelve from 600dp up — rather than with a set of breakpoints of this library's own invention.</p>

<Demo src="grid/hero" :minHeight="260" />

```tsx
import { MPGrid, MPGridItem } from 'material-plus-ui';

<MPGrid>
  <MPGridItem span={6}>Half</MPGridItem>
  <MPGridItem span={3}>A quarter</MPGridItem>
  <MPGridItem span={3}>And a quarter</MPGridItem>
</MPGrid>;
```

## Props

<PropsTable name="MPGrid" />

### MPGridItem

<PropsTable name="MPGridItem" />

## Window size classes, not breakpoints

`span`, `offset`, `columns` and the three spacing props all take either a value or a map keyed by window size class:

| Class         | From   | MD3 columns |
| ------------- | ------ | ----------- |
| `compact`     | 0      | 4           |
| `medium`      | 600dp  | 12          |
| `expanded`    | 840dp  | 12          |
| `large`       | 1200dp | 12          |
| `extra-large` | 1600dp | 12          |

Each entry applies from its own class **upward**, so a layout is usually two entries rather than five — anything not named keeps whatever the class below it said.

```tsx
<MPGridItem span={{ compact: 12, medium: 6, expanded: 4 }} />
```

Full width on a phone, half from 600dp, a third from 840dp.

**These are deliberately not Tailwind's breakpoints.** Tailwind changes at 640/768/1024/1280, which are different numbers describing the same idea, and a grid that reflowed at one set while the `md:` utility beside it reflowed at another would be a layout that is subtly wrong at exactly one width and impossible to reason about at every other. Given two ladders, this library takes the one the specification defines.

If you want your own utilities to change with the grid, name the same widths:

```css
@theme {
  --breakpoint-medium: 600px;
  --breakpoint-expanded: 840px;
  --breakpoint-large: 1200px;
  --breakpoint-xlarge: 1600px;
}
```

## Material's own grid

Four columns and a 16dp gutter in a compact window, twelve columns and 24dp from medium up. That is one line, and it is the layout the specification draws:

<Demo src="grid/responsive" :minHeight="320">

<<< @/.vitepress/demos/grid/responsive.tsx

</Demo>

It is **not** the default. Twelve columns and a 16dp gutter are, because a default that changed the divisor at 600dp would silently change what `span={6}` means on a phone — and a grid whose arithmetic depends on a width you never wrote down is one you cannot read off the page.

## offset

Columns left empty _before_ the item — space pushed in ahead of it, not an absolute position in the row.

First in a twelve-column row, `offset={4}` with `span={4}` is the middle third. After an item that already took four columns, the same offset skips four more and lands on the last third. It is responsive in the same way `span` is.

## Why the widths are real CSS

A column is `(100% + gutter) * span / columns - gutter`, it has to be recomputed at four widths, and it is the width of an element whose column count is declared on its **parent**.

Tailwind cannot spell any of that: it finds classes by scanning source text, and `columns` is a number you pick at runtime — a class name assembled in JavaScript is a class name Tailwind never sees. So the arithmetic is written once in the stylesheet and the per-instance numbers arrive as inline custom properties, exactly the way a `color` reaches a background in this library.

The count and the two gutters are declared on the grid and **inherited** by the items rather than passed through a React context. That is not a shortcut: a media query can change an inherited custom property without React hearing about it, so the column count an item lays itself out against is always the one that is actually on screen. A context would have to re-render the subtree at every window class to say the same thing.

A span wider than the row is clamped to the row rather than overflowing, which is what `span={99}` meant.

## What a grid deliberately is not

**A surface.** No `variant`, no `color`, no padding. A grid is the arrangement of the surfaces inside it, and the moment it draws a sheet of its own it stops being usable as the outermost thing on a page. Wrap it in an [MPBox](./box) or an [MPCard](./card) when the sheet is wanted.

**The page margin.** That is [MPContainer](./container), which is a separate component because the questions are separate: how far the content sits from the edge of the window, and how the content divides itself up. A container holds a grid as happily as it holds a single paragraph, and a grid needs no container around it.

**A pane splitter.** For two regions with a handle between them, use [MPPanes](./panes).

## Nesting

An `MPGrid` inside an `MPGridItem`, not a grid that is also an item. The inner grid redeclares the column count for its own subtree while the item around it keeps the width the outer grid gave it.

```tsx
<MPGrid>
  <MPGridItem span={6}>
    <MPGrid columns={2}>
      <MPGridItem span={1}>A quarter of the page</MPGridItem>
      <MPGridItem span={1}>And another</MPGridItem>
    </MPGrid>
  </MPGridItem>
</MPGrid>
```

## Accessibility

- A grid is layout, so it carries no role and announces nothing. What is inside it does.
- The order in the DOM is the order it is read in. `offset` moves an item along the row without moving it in the document, which is the point — a reordering that only exists visually is one a screen reader never hears.
- `render` is there for the cases where the arrangement _is_ semantic: `render={<ul />}` on the grid with `render={<li />}` on its items makes a list of cards a list.

## See also

- [MPContainer](./container) — the page margin, and the measure.
- [MPBox](./box) — the sheet that goes inside a cell.
- [MPPanes](./panes) — two regions with a handle between them.
