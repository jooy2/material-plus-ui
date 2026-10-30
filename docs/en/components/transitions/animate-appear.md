---
title: MPAnimateAppear
order: 8
---

# MPAnimateAppear

<p class="mp-lede">A list of things settling into place one after another. The effect belongs to the set rather than to any one item, which is what walks a reader's eye down it in the order it should be read.</p>

<Demo src="animate-appear/hero" :minHeight="400" />

::: fw react

```tsx
import { MPAnimateAppear } from 'material-plus-ui';

<MPAnimateAppear render={<ul />}>
  {people.map((person) => (
    <li key={person.id}>{person.name}</li>
  ))}
</MPAnimateAppear>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateAppear(
  layoutBuilder: (BuildContext context, List<Widget> children) => MPList(children: children),
  children: [
    for (final Person person in people)
      MPListItem(key: ValueKey(person.id), child: Text(person.name)),
  ],
);
```

:::

## Props

<PropsTable name="MPAnimateAppear" />

## The animation goes on the children

::: fw react

Not on wrappers around them. A row of `<li>`s stays a row of `<li>`s, a grid's cells stay the grid's own direct children, and nothing about the layout changes because the list is being animated.

That matters more than it sounds. A component that wrapped each child would break every layout that cares what its children are — flex and grid, `<ul>`/`<li>`, a table, a Base UI primitive that walks its own children — and it would break them silently, at the moment somebody added an animation to a list that had been fine.

Only a bare string has no element to write onto, so that one is wrapped in a `<span>`.

:::

::: fw flutter

Each child is drawn where `layoutBuilder` puts it. Hand it the list, the row or the grid the children belong in, and they stay that layout's own children: the effect around each one is a paint-time translation and an opacity, which take no room and change nothing about how the layout measures or places them.

There is no stylesheet to write an animation onto a widget, so each child does get a widget of its own around it. That is invisible to a `Column`, a `Wrap` or a list, and it is not to a parent that reads its child's parent data: an `Expanded` or a `Positioned` has to sit directly in its `Row` or `Stack`, so put the effect inside it rather than around it.

:::

## The stagger is per child

Which means what you pass matters. Eight children are eight steps; **one child holding eight things is one step.** That is also how to opt part of a list out — group it.

`delay` is added once, before the first step, rather than to every child. A `delay` that was also applied per item would be a second stagger fighting the first.

## Why the travel is short

`0.75rem` by default — a settling, not an entrance from off screen. A long travel repeated over a list of eight turns the whole block into something moving, and a reader trying to find the third row is following a moving target.

::: fw flutter

In Flutter the default is `12` logical pixels, what `0.75rem` comes to at a 16px root.

:::

For a genuine entrance from off screen, one element, use [MPAnimateSlide](./animate-slide).

## Examples

<Demo src="animate-appear/grid" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/animate-appear/grid.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_appear/grid.dart

:::

</Demo>

::: fw react

### render

The escape hatch that makes this work on a real layout. The root becomes whatever you pass, and the children being staggered stay its own direct children:

```tsx
<MPAnimateAppear render={<ul />}>…</MPAnimateAppear>
<MPAnimateAppear render={<div style={{ display: 'grid' }} />}>…</MPAnimateAppear>
```

:::

::: fw flutter

### layoutBuilder

What makes this work on a real layout. It is handed the children, each already wrapped in its run, and returns whatever they belong in:

```dart
MPAnimateAppear(
  layoutBuilder: (BuildContext context, List<Widget> children) => MPList(children: children),
  children: items,
);

MPAnimateAppear(
  layoutBuilder: (BuildContext context, List<Widget> children) {
    return Wrap(spacing: 12, runSpacing: 12, children: children);
  },
  children: tiles,
);
```

Left out, the children stack down the page, each at its own width.

:::

### reverse

Runs the list from the last child to the first — for something anchored to the bottom of its container, where the item nearest the reader should arrive first.

### trigger

`visible` is the one this component is usually reached for with: the stagger only says anything if a reader is watching when it runs, and a list that animated on mount while the page was still below the fold has performed to an empty room.

## Scrolling is a clock

::: fw react

`timeline="view"` hands the animation to the reader's scrolling instead of to a stopwatch: its progress is the element's progress through the scrollport, and `range` says which part of that travel it is spread over.

```tsx
<MPAnimateAppear timeline="view">…</MPAnimateAppear>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered. `timeline` and `range` hand each child's keyframe to CSS's `view()` timeline, which has no counterpart here; `MPAnimateTrigger.visible` is the nearest thing, and starts the whole set when it is scrolled into view. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` nothing drifts and every child is simply there.
- Every child is in the document, at its final position in the layout, from the first frame. Nothing reflows as the stagger runs, and a screen reader reads the whole list immediately rather than one item at a time.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) nothing drifts and every child is simply there, at full opacity, from the first frame.
- Every child is in the tree, at its final position in the layout, from the first frame, at opacity `0` as well. Nothing is laid out again as the stagger runs, and a screen reader reads the whole list immediately rather than one item at a time.

:::

- Keep the total length in mind: the last child of a list of twenty starts `19 × stagger` after the first, which at the default is over a second and a half. Lower `stagger` for a long list, or animate the page rather than the rows.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `stagger`, `duration`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| `distance` as a number of pixels or a CSS length | `double`, in logical pixels | There is no root font size to resolve a `rem` against. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `render` | `layoutBuilder` | There is no element to swap. A widget has to place what it is given, so the layout is a builder handed the children. |
| `children` as any React node, a bare string wrapped in a `<span>` | `children`, a required `List<Widget>` | Each child is a widget already, so nothing needs wrapping to be animated. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the set | There is no observer. With no scrollable above it, it runs at once. |
| `timeline`, `range` | — | CSS's `view()` timeline has no counterpart. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |

:::

## See also

- [MPAnimateSlide](./animate-slide) — the same travel, much longer, on one element.
- [MPAnimateFade](./animate-fade) — for a set that should arrive all at once.
- [MPList](../display/list) — the component this is most often wrapped around.
