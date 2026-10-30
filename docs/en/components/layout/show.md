---
title: MPShow
order: 20
---

# MPShow

<p class="mp-lede">Content at some window sizes and not others. A rail on a laptop and a bottom bar on a phone, written as two components with a boundary between them rather than as one component with a branch inside it.</p>

::: fw react

```tsx
import { MPShow } from 'material-plus-ui';

<MPShow from="expanded">
  <MPSidebar>{nav}</MPSidebar>
</MPShow>
<MPShow until="expanded">
  <MPBottomNavigation items={nav} />
</MPShow>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPShow(from: MPWindowClass.expanded, child: MPSidebar(child: navigation));
MPShow(until: MPWindowClass.expanded, child: MPBottomNavigation(children: destinations));
```

:::

`from` and `until` over the same class are exclusive and exhaustive: one of them is on screen at every width, and never both.

## Props

<PropsTable name="MPShow" />

## The three props

| Written          | Shown          |
| ---------------- | -------------- |
| `from="medium"`  | 600dp and up   |
| `until="medium"` | under 600dp    |
| `only="medium"`  | 600dp to 839dp |

::: fw flutter

In Dart the three take an `MPWindowClass`: `from: MPWindowClass.medium`. The window is read through `MediaQuery`, against MD3's boundaries or the ones an `MPConfigProvider` moved.

:::

`only` is `from` and `until` said together, and either of them still overrides its own half — `only="medium" until="large"` is 600dp to 1199dp. Which of the two spellings to use is a question of which one reads like the intention.

The classes are [Material's window size classes](../../design/breakpoints), not Tailwind's breakpoints.

::: fw react

## It is `display: none`, not a condition

Both branches are rendered and one of them is hidden by CSS. That is a trade, and it is worth being explicit about which way it goes.

A media query is resolved by the browser **before it paints anything**, including the markup a server sent. So the first frame is already right. [`useMPWindowClass`](../../guide/hooks) answers the same question in JavaScript and cannot answer it until the page has hydrated: the first paint is a guess, and the correction is a second render. On a phone that guess is a desktop navigation drawn and thrown away.

What it costs is that the hidden branch is still there — built, laid out, skipped at paint, and its effects run. So:

- **Reach for `MPShow`** when what changes is _which_ of two arrangements is on screen. A nav, a toolbar, a column of filters, a label that becomes an icon.
- **Reach for the hook** when the branch that is off screen is expensive. A chart, a map, an editor, a table of a thousand rows.

`display: none` also takes the content off the accessibility tree, which is the point rather than a caveat: a screen reader on a narrow window reads the compact arrangement, not both of them.

## It is not a box

While it is shown the wrapper is `display: contents`, so it takes no part in the layout — an `MPShow` inside a flex row makes its children the flex items, exactly as if it were not written.

That declaration is at zero specificity (`:where`), so a `className` of your own that sets a display wins over it without a fight, and the hiding still wins over both:

```tsx
<MPShow from="medium" className="flex items-center gap-2">
  …
</MPShow>
```

Where a bare `<div>` is not allowed to sit, `render` gives it another element: `render={<li />}`, `render={<td />}`.

## The same thing without the component

The hiding is Tailwind's own `hidden` under the variants this library registers, so an element you already have can take one directly:

```tsx
<nav className="mp-below-expanded:hidden">…</nav>
<footer className="mp-large:hidden">…</footer>
```

Those classes are in the shipped stylesheet on both installation paths. `MPShow` adds the wrapper that takes no part in the layout, `only`, and a name that says what the element is for.

:::

::: fw flutter

## It builds nothing while it is closed

The half that is closed is not built at all: not a zero-opacity box, not a subtree behind an `Offstage`. `MediaQuery` is already right on the first frame, so there is nothing to win by building both halves the way the React component has to.

That cuts both ways. An expensive subtree costs nothing while it is closed, and any state inside one is lost when the window crosses the boundary: a text field half filled in on a laptop is empty again after the window is narrowed past the line and widened back. Lift that state above the gate.

A closed gate is a zero-sized box and an open one is its child, so nothing is read out twice and the gate adds no focus stop. It is also a widget in its own right: inside a `Row` or a `Column` the gate is the child the row lays out, so an `Expanded` goes round the gate rather than inside it.

```dart
Row(
  children: <Widget>[
    MPShow(from: MPWindowClass.medium, child: filters),
    Expanded(child: results),
  ],
)
```

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| both halves rendered, one `display: none` | only the open half built | `MediaQuery` is right on the first frame. An expensive half is free while closed, and its state is lost when the window crosses the boundary. |
| `display: contents` wrapper | the child itself, or a zero-sized box | Flutter has no element that takes no part in the layout; a gate in a row is the row's child. |
| `className`, `render`, the `mp-*:hidden` classes | — | There is no class list and no element to replace. |

:::

## Next

- [Breakpoints](../../design/breakpoints) — the five classes, what else changes with them, and how to move them.
- [`useMPWindowClass`](../../guide/hooks) — the same question in JavaScript, and when to prefer it.
- [`MPSidebar`](./sidebar) — which collapses at a class on its own, and needs none of this.
