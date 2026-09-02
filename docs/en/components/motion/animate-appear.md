---
title: MPAnimateAppear
order: 7
---

# MPAnimateAppear

<p class="mp-lede">A list of things settling into place one after another. The effect belongs to the set rather than to any one item, which is what walks a reader's eye down it in the order it should be read.</p>

<Demo src="animate-appear/hero" :minHeight="400" />

```tsx
import { MPAnimateAppear } from 'material-plus-ui';

<MPAnimateAppear render={<ul />}>
  {people.map((person) => (
    <li key={person.id}>{person.name}</li>
  ))}
</MPAnimateAppear>;
```

## Props

<PropsTable name="MPAnimateAppear" />

## The animation goes on the children

Not on wrappers around them. A row of `<li>`s stays a row of `<li>`s, a grid's cells stay the grid's own direct children, and nothing about the layout changes because the list is being animated.

That matters more than it sounds. A component that wrapped each child would break every layout that cares what its children are — flex and grid, `<ul>`/`<li>`, a table, a Base UI primitive that walks its own children — and it would break them silently, at the moment somebody added an animation to a list that had been fine.

Only a bare string has no element to write onto, so that one is wrapped in a `<span>`.

## The stagger is per child

Which means what you pass matters. Eight children are eight steps; **one child holding eight things is one step.** That is also how to opt part of a list out — group it.

`delay` is added once, before the first step, rather than to every child. A `delay` that was also applied per item would be a second stagger fighting the first.

## Why the travel is short

`0.75rem` by default — a settling, not an entrance from off screen. A long travel repeated over a list of eight turns the whole block into something moving, and a reader trying to find the third row is following a moving target.

For a genuine entrance from off screen, one element, use [MPAnimateSlide](./animate-slide).

## Examples

<Demo src="animate-appear/grid" :minHeight="300">

<<< @/.vitepress/demos/animate-appear/grid.tsx

</Demo>

### render

The escape hatch that makes this work on a real layout. The root becomes whatever you pass, and the children being staggered stay its own direct children:

```tsx
<MPAnimateAppear render={<ul />}>…</MPAnimateAppear>
<MPAnimateAppear render={<div style={{ display: 'grid' }} />}>…</MPAnimateAppear>
```

### reverse

Runs the list from the last child to the first — for something anchored to the bottom of its container, where the item nearest the reader should arrive first.

### trigger

`visible` is the one this component is usually reached for with: the stagger only says anything if a reader is watching when it runs, and a list that animated on mount while the page was still below the fold has performed to an empty room.

## Scrolling is a clock

`timeline="view"` hands the animation to the reader's scrolling instead of to a stopwatch: its progress is the element's progress through the scrollport, and `range` says which part of that travel it is spread over.

```tsx
<MPAnimateAppear timeline="view">…</MPAnimateAppear>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

## Accessibility

- Under `prefers-reduced-motion` nothing drifts and every child is simply there.
- Every child is in the document, at its final position in the layout, from the first frame. Nothing reflows as the stagger runs, and a screen reader reads the whole list immediately rather than one item at a time.
- Keep the total length in mind: the last child of a list of twenty starts `19 × stagger` after the first, which at the default is over a second and a half. Lower `stagger` for a long list, or animate the page rather than the rows.

## See also

- [MPAnimateSlide](./animate-slide) — the same travel, much longer, on one element.
- [MPAnimateFade](./animate-fade) — for a set that should arrive all at once.
- [MPList](../display/list) — the component this is most often wrapped around.
