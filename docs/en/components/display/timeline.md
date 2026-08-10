---
title: MPTimeline
order: 9
---

# MPTimeline

<p class="mp-lede">A sequence of steps, in the order they happen in. One prop says how far reality has got, and every bullet, line and heading follows from it.</p>

<Demo src="timeline/hero" :minHeight="300" />

```tsx
import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

<MPTimeline active={2}>
  <MPTimelineItem title="Ordered" meta="9 Aug" bullet="1" />
  <MPTimelineItem title="Packed" meta="9 Aug" bullet="2" />
  <MPTimelineItem title="In transit" meta="Now" bullet="3" />
</MPTimeline>;
```

## Props

<PropsTable name="MPTimeline" />

### MPTimelineItem

<PropsTable name="MPTimelineItem" />

## `active` is an index, not a value

A timeline has no selection — nothing here is chosen, and the only question is how far down the list reality has reached. Everything before `active` is complete, `active` itself is current, everything after is still to come.

Omit it and every item is `upcoming` unless it says otherwise; pass the item count to mark the whole sequence done.

The children are numbered by the timeline as it walks them rather than by a prop on each item. An item that had to be told where it was in the list would be an item every caller could put in the wrong place, and inserting a step in the middle would mean renumbering the ones after it. Conditional steps are dropped before counting, so `active={2}` counts the steps that are actually on the page.

## Three states, three axes

Never three opacities:

- **`complete`** — a filled bullet, in the accent under its own ink.
- **`current`** — the same fill with a halo of the container tone around it.
- **`upcoming`** — a hairline ring on the page's own surface.

A reader who cannot tell the colours apart still has a filled shape, a haloed shape and an empty one. The current step also carries `aria-current="step"`.

`status` on an item overrides what `active` computed, which is what a step that failed and stopped the sequence needs.

## The connector belongs to the step it leaves

A line is coloured by whether the step it leaves has been reached, not by where it arrives — so `connector` is a prop on the item, and the last item never draws one. Its line would run off the end of the sequence into nothing.

It is drawn as one border edge on an absolutely positioned box rather than as a filled `<div>`, so `dashed` and `dotted` are the browser's own dashes and land on the device pixel grid the way every other edge in the library does.

## Examples

### orientation

`vertical` is the default and the one that takes an arbitrary number of steps with an arbitrary amount to say about each. `horizontal` is the stepper across the top of a checkout, and it is only honest while every label is short.

<Demo src="timeline/horizontal">

<<< @/.vitepress/demos/timeline/horizontal.tsx

</Demo>

### color

Set on the timeline for the whole sequence, or on one item to override it — which is what a step that failed inside an otherwise fine run needs.

```tsx
<MPTimeline color="primary" active={2}>
  <MPTimelineItem title="Built" />
  <MPTimelineItem title="Deployed" color="error" status="current" />
</MPTimeline>
```

## It is an `<ol>`

For the reason it exists at all: the order **is** the content. A screen reader announcing "list of 5 items" over an unordered list would be describing something else.

There is no Base UI primitive under this and there should not be — a timeline has no selection, no roving focus and no keyboard contract. Reaching for a composite primitive to draw one would hand every consumer's record of events the semantics of a widget.

## See also

- [MPList](./list) — when the order is not the point.
- [MPBreadcrumb](./breadcrumb) — a trail you can walk back up, rather than a record of what happened.
