---
title: MPGrid
order: 9
---

# MPGrid

<p class="mp-lede">Material's layout grid: a row divided into columns, and items that take some of them. The column count changes with the <strong>window size class</strong> the specification defines — four columns on a phone, twelve from 600dp up — rather than with a set of breakpoints of this library's own invention.</p>

<Demo src="grid/hero" :minHeight="260" />

::: fw react

```tsx
import { MPGrid, MPGridItem } from 'material-plus-ui';

<MPGrid>
  <MPGridItem span={6}>Half</MPGridItem>
  <MPGridItem span={3}>A quarter</MPGridItem>
  <MPGridItem span={3}>And a quarter</MPGridItem>
</MPGrid>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPGrid(
  children: <Widget>[
    MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(6)), child: Text('Half')),
    MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(3)), child: Text('A quarter')),
    MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(3)), child: Text('And a quarter')),
  ],
);
```

:::

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

::: fw react

```tsx
<MPGridItem span={{ compact: 12, medium: 6, expanded: 4 }} />
```

:::

::: fw flutter

```dart
MPGridItem(
  span: const MPResponsive<MPGridSpan>(
    MPGridSpan(12),
    medium: MPGridSpan(6),
    expanded: MPGridSpan(4),
  ),
  child: card,
)
```

:::

Full width on a phone, half from 600dp, a third from 840dp.

::: fw react

**These are deliberately not Tailwind's breakpoints,** and your own utilities can join the same ladder rather than compete with it — `mp-medium:flex`, `mp-below-expanded:hidden`. [Breakpoints](../../design/breakpoints) is the whole story: why this ladder, what else reads it, and how to move it.

:::

::: fw flutter

In Dart a responsive value is an `MPResponsive`: `MPResponsive<int>(4, medium: 12)` is four columns with twelve from medium up, and `MPResponsive<double>.from(expanded: 8)` names only the classes it changes, leaving the ones below at the parameter's default. A span is an `MPGridSpan`: `MPGridSpan(6)`, `MPGridSpan.grow` or `MPGridSpan.auto`. The class is the window's, read through `MediaQuery`.

:::

## Material's own grid

Four columns and a 16dp gutter in a compact window, twelve columns and 24dp from medium up. That is one line, and it is the layout the specification draws:

<Demo src="grid/responsive" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/grid/responsive.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/grid/responsive.dart

:::

</Demo>

It is **not** the default. Twelve columns and a 16dp gutter are, because a default that changed the divisor at 600dp would silently change what `span={6}` means on a phone — and a grid whose arithmetic depends on a width you never wrote down is one you cannot read off the page.

## `span="grow"`

The one width that is not a number of columns: **whatever the row has left** after everybody else has taken theirs.

<Demo src="grid/grow" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/grid/grow.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/grid/grow.dart

:::

</Demo>

A thumbnail beside a body of text is the layout it exists for, and the reason a span cannot express it is that the remainder is only known once the other items in _that_ row have been laid out. `span={3}` and `span={9}` is the same picture right up until the thumbnail's column count changes and the two stop adding up.

Two growing items in a row split the remainder equally rather than in proportion to what is inside them, which is the useful half of what makes it predictable.

It is responsive like any other value:

::: fw react

```tsx
<MPGridItem span={{ compact: 12, medium: 'grow' }} />
```

:::

::: fw flutter

```dart
MPGridItem(
  span: const MPResponsive<MPGridSpan>(MPGridSpan(12), medium: MPGridSpan.grow),
  child: body,
)
```

:::

Full width on a phone, the rest of the row from 600dp.

## `span="auto"`

The other end of the same question: **exactly the width of what is inside the item**, however much that turns out to be.

<Demo src="grid/auto" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/grid/auto.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/grid/auto.dart

:::

</Demo>

It is the span for a group whose size is a runtime question. A player's control bar carries between one and five icon buttons depending on what the page can do, and a share of twelve columns has to be written down in advance — so it is either too small or too large. Four 32px buttons need 128px; `large: 2` of a 768px bar is exactly 128px, and the fraction of a pixel that sub-pixel rounding takes off is enough to wrap the last button onto a second row and double the height of the bar. One button on the same row leaves a gap instead.

`'auto'` and `'grow'` are made to pair — one item takes what it needs, the other takes the rest, and neither side names a number:

::: fw react

```tsx
<MPGrid alignItems="center">
  <MPGridItem span="grow">Transport controls</MPGridItem>
  <MPGridItem span="auto">However many buttons there are</MPGridItem>
</MPGrid>
```

:::

::: fw flutter

```dart
const MPGrid(
  alignItems: MPGridAlign.center,
  children: <Widget>[
    MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan.grow), child: Text('Transport controls')),
    MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan.auto), child: Text('However many buttons there are')),
  ],
)
```

:::

It is responsive like any other value, and a number at a wider class writes the columns back over it:

::: fw react

```tsx
<MPGridItem span={{ compact: 12, medium: 'auto' }} />
```

:::

::: fw flutter

```dart
MPGridItem(
  span: const MPResponsive<MPGridSpan>(MPGridSpan(12), medium: MPGridSpan.auto),
  child: buttons,
)
```

:::

Full width on a phone, the width of the contents from 600dp. An `'auto'` item does not shrink — nothing in this grid does — so contents wider than the row overflow rather than squeezing what is beside them.

## offset

Columns left empty _before_ the item — space pushed in ahead of it, not an absolute position in the row.

First in a twelve-column row, `offset={4}` with `span={4}` is the middle third. After an item that already took four columns, the same offset skips four more and lands on the last third. It is responsive in the same way `span` is.

::: fw react

It is a `margin-inline-start`, and the declaration is only written for an item that asked for one. That matters because these rules are unlayered and a Tailwind utility is not: a `.mp-grid-item` that always declared the margin — at `0px`, for every item in every grid — beat a caller's own `m-6` on the inline-start side and left the other three sides standing. Pass an `offset` and the margin is the library's; leave it off and it is yours. An explicit `offset={0}` counts as asking, which is the answer it has always given.

:::

::: fw react

## Why the widths are real CSS

A column is `(100% + gutter) * span / columns - gutter`, it has to be recomputed at four widths, and it is the width of an element whose column count is declared on its **parent**.

Tailwind cannot spell any of that: it finds classes by scanning source text, and `columns` is a number you pick at runtime — a class name assembled in JavaScript is a class name Tailwind never sees. So the arithmetic is written once in the stylesheet and the per-instance numbers arrive as inline custom properties, exactly the way a `color` reaches a background in this library.

The count and the two gutters are declared on the grid and **inherited** by the items rather than passed through a React context. That is not a shortcut: a media query can change an inherited custom property without React hearing about it, so the column count an item lays itself out against is always the one that is actually on screen. A context would have to re-render the subtree at every window class to say the same thing.

A span wider than the row is clamped to the row rather than overflowing, which is what `span={99}` meant.

:::

::: fw flutter

## How the grid lays itself out

A column is `(width + gutter) * span / columns - gutter`, worked out when the grid is laid out, against the width it was given. The grid is one render object rather than a column of rows, because two of the spans cannot be worked out from outside: an `auto` item has to be measured before the row it goes in is known, and a `grow` item takes whatever that row left. Laying the rows out in one place also lets every item take its own alignment, a baseline included.

The column count and the gutters are read from the window size class when the grid is built, and rebuilt when the window crosses a boundary. A span wider than the row is clamped to the row.

An `MPGridItem` has to be a child of the grid itself, the way an `Expanded` has to be a child of its `Row`. An item put anywhere else is its child and nothing more.

:::

## What a grid deliberately is not

**A surface.** No `variant`, no `color`, no padding. A grid is the arrangement of the surfaces inside it, and the moment it draws a sheet of its own it stops being usable as the outermost thing on a page. Wrap it in an [MPBox](./box) or an [MPCard](./card) when the sheet is wanted.

**The page margin.** That is [MPContainer](./container), which is a separate component because the questions are separate: how far the content sits from the edge of the window, and how the content divides itself up. A container holds a grid as happily as it holds a single paragraph, and a grid needs no container around it.

**A pane splitter.** For two regions with a handle between them, use [MPPanes](./panes).

## Nesting

An `MPGrid` inside an `MPGridItem`, not a grid that is also an item. The inner grid redeclares the column count for its own subtree while the item around it keeps the width the outer grid gave it.

::: fw react

A grid is also where a `span` stops meaning anything, and it says so: `.mp-grid` resets every slot it hands out — the spans, the offsets, the growth flags and the widths — to `initial`. Without that reset an inner item that only declared `compact` would resolve the **outer** item's `large` at every class above compact — `span={12}` coming out a sixth of the row it is actually in — because the slots are inherited custom properties. Nothing to write; it is in the stylesheet.

:::

::: fw flutter

Nothing leaks between the two: each grid reads its own `columns`, and an item is read against the grid it is a child of.

:::

::: fw react

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

:::

::: fw flutter

```dart
const MPGrid(
  children: <Widget>[
    MPGridItem(
      span: MPResponsive<MPGridSpan>(MPGridSpan(6)),
      child: MPGrid(
        columns: MPResponsive<int>(2),
        children: <Widget>[
          MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(1)), child: Text('A quarter of the page')),
          MPGridItem(span: MPResponsive<MPGridSpan>(MPGridSpan(1)), child: Text('And another')),
        ],
      ),
    ),
  ],
)
```

:::

## Accessibility

::: fw react

- A grid is layout, so it carries no role and announces nothing. What is inside it does.
- The order in the DOM is the order it is read in. `offset` moves an item along the row without moving it in the document, which is the point — a reordering that only exists visually is one a screen reader never hears.
- `render` is there for the cases where the arrangement _is_ semantic: `render={<ul />}` on the grid with `render={<li />}` on its items makes a list of cards a list.

:::

::: fw flutter

- A grid is layout, so it adds nothing to the semantics tree. What is inside it announces itself.
- The order of `children` is the order they are read in. `offset` moves an item along the row without moving it in that order.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `span={6}`, `span="grow"`, `span="auto"` | `MPGridSpan(6)`, `MPGridSpan.grow`, `MPGridSpan.auto` in an `MPResponsive` | Dart has no union of a number and two words, or of a value and a map. |
| widths from CSS custom properties and media queries | worked out in layout from `MediaQuery` | There is no stylesheet; the window is known on the first frame. |
| `wrap={false}` overflows the page | `wrap: false` scrolls sideways | An overflowing row is a row nobody can reach in Flutter. |
| `render` | — | There is no element to replace, so a list of cards is a `Semantics` concern of the cards. |

:::

## See also

- [MPContainer](./container) — the page margin, and the measure.
- [MPBox](./box) — the sheet that goes inside a cell.
- [MPPanes](./panes) — two regions with a handle between them.
