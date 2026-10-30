---
title: MPTimeline
order: 9
---

# MPTimeline

<p class="mp-lede">A sequence of steps, in the order they happen in. One prop says how far reality has got, and every bullet, line and heading follows from it.</p>

<Demo src="timeline/hero" :minHeight="300" />

::: fw react

```tsx
import { MPTimeline, MPTimelineItem } from 'material-plus-ui';

<MPTimeline active={2}>
  <MPTimelineItem title="Ordered" meta="9 Aug" bullet="1" />
  <MPTimelineItem title="Packed" meta="9 Aug" bullet="2" />
  <MPTimelineItem title="In transit" meta="Now" bullet="3" />
</MPTimeline>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPTimeline(
  active: 2,
  children: <MPTimelineItem>[
    MPTimelineItem(title: Text('Ordered'), meta: Text('9 Aug'), bullet: Text('1')),
    MPTimelineItem(title: Text('Packed'), meta: Text('9 Aug'), bullet: Text('2')),
    MPTimelineItem(title: Text('In transit'), meta: Text('Now'), bullet: Text('3')),
  ],
);
```

:::

## Props

<PropsTable name="MPTimeline" />

### MPTimelineItem

<PropsTable name="MPTimelineItem" />

## `active` is an index, not a value

A timeline has no selection — nothing here is chosen, and the only question is how far down the list reality has reached. Everything before `active` is complete, `active` itself is current, everything after is still to come.

Omit it and every item is `upcoming` unless it says otherwise; pass the item count to mark the whole sequence done.

The children are numbered by the timeline as it walks them rather than by a prop on each item. An item that had to be told where it was in the list would be an item every caller could put in the wrong place, and inserting a step in the middle would mean renumbering the ones after it. <Fw react="Conditional steps are dropped before counting, so `active={2}` counts the steps that are actually on the page." flutter="`children` is a list of `MPTimelineItem`s, so `active: 2` counts the steps that are actually in it." />

## Three states, three axes

Never three opacities:

- **`complete`** — a filled bullet, in the accent under its own ink.
- **`current`** — the same fill with a halo of the container tone around it.
- **`upcoming`** — a hairline ring on the page's own surface.

A reader who cannot tell the colours apart still has a filled shape, a haloed shape and an empty one. The current step is also <Fw react="marked `aria-current=&quot;step&quot;`" flutter="announced as selected, Flutter's nearest state to `aria-current`" />.

`status` on an item overrides what `active` computed, which is what a step that failed and stopped the sequence needs.

## The connector belongs to the step it leaves

A line is coloured by whether the step it leaves has been reached, not by where it arrives — so `connector` is a prop on the item, and the last item never draws one. Its line would run off the end of the sequence into nothing.

::: fw react

It is drawn as one border edge on an absolutely positioned box rather than as a filled `<div>`, so `dashed` and `dotted` are the browser's own dashes and land on the device pixel grid the way every other edge in the library does.

:::

::: fw flutter

It is 2px wide and centred on the bullet. `dashed` is the browser's own pattern for a 2px border, three widths on and three off, and `dotted` is round dots one width apart, so the two builds draw the same line.

:::

## Examples

### orientation

`vertical` is the default and the one that takes an arbitrary number of steps with an arbitrary amount to say about each. `horizontal` is the stepper across the top of a checkout, and it is only honest while every label is short.

<Demo src="timeline/horizontal">

::: fw react

<<< @/.vitepress/demos/timeline/horizontal.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/timeline/horizontal.dart

:::

</Demo>

### color

Set on the timeline for the whole sequence, or on one item to override it — which is what a step that failed inside an otherwise fine run needs.

::: fw react

```tsx
<MPTimeline color="primary" active={2}>
  <MPTimelineItem title="Built" />
  <MPTimelineItem title="Deployed" color="error" status="current" />
</MPTimeline>
```

:::

::: fw flutter

```dart
const MPTimeline(
  color: MPColor.primary,
  active: 2,
  children: <MPTimelineItem>[
    MPTimelineItem(title: Text('Built')),
    MPTimelineItem(title: Text('Deployed'), color: MPColor.error, status: MPTimelineStatus.current),
  ],
);
```

:::

## <Fw react="It is an `<ol>`" flutter="It is a list, not a widget" />

::: fw react

For the reason it exists at all: the order **is** the content. A screen reader announcing "list of 5 items" over an unordered list would be describing something else.

:::

There is no <Fw react="Base UI primitive" flutter="composite widget" /> under this and there should not be — a timeline has no selection, no roving focus and no keyboard contract. Reaching for a composite primitive to draw one would hand every consumer's record of events the semantics of a widget.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| any children | `children: List<MPTimelineItem>` | The timeline numbers the steps and draws the line from each to the next itself. |
| `bullet="1"` | `bullet: Text('1')` | A slot takes a widget. |
| `aria-current="step"` | announced as selected | Flutter has no "current step" state; selected is the nearest a screen reader says. |
| an `<ol>`, `render` | — | Flutter has no ordered-list semantics and no element to swap in. |
| `children` of an item | `child` | The body is one widget. |

:::

## See also

- [MPList](./list) — when the order is not the point.
- [MPBreadcrumb](./breadcrumb) — a trail you can walk back up, rather than a record of what happened.
