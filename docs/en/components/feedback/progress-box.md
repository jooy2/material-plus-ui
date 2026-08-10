---
title: MPProgressBox
order: 8
---

# MPProgressBox

<p class="mp-lede">A row of segments that light up. A bar and a ring both say “this much is done” — a quantity a reader measures; four segments say “this is step three”, which is a quantity they count, and counting is faster than measuring for any number small enough to count.</p>

<Demo src="progress-box/hero" :minHeight="80" />

```tsx
import { MPProgressBox } from 'material-plus-ui';

<MPProgressBox label="Deploying" count={4} value={step * 25} />;
```

## Props

<PropsTable name="MPProgressBox" />

## This one is not in the specification

MD3 has a bar and a ring and stops there. This is the library's own third shape — which is the whole premise of Material Plus: the components other Material libraries do not ship.

It is drawn out of the spec's own parts all the same — `corner-extra-small` tiles, the accent, `on-surface` at 12% — so a row of them sits in a Material page without announcing that it is extra.

## Examples

### count

Four by default: enough that the wave reads as a wave, few enough that a determinate row can be counted at a glance rather than measured. Set it to the number of steps when the thing being waited on genuinely has steps.

<Demo src="progress-box/count" :minHeight="180">

<<< @/.vitepress/demos/progress-box/count.tsx

</Demo>

The leading segment fills partially, so four segments are not limited to 0, 25, 50, 75 and 100 — a value of 30% would otherwise round away to a quarter.

A row of no segments is not an indicator, and a fractional count is a caller who divided something. Both land on one segment rather than none.

### value

`null` — the default — cycles the row instead, each segment held back by its own index.

### size

The size of one segment, on a ladder of its own. An indicator is not a control, so it is not on the control heights.

<Demo src="progress-box/sizes" :minHeight="220">

<<< @/.vitepress/demos/progress-box/sizes.tsx

</Demo>

## Accessibility

- Base UI owns the `progressbar` role and the value; the segments are the picture of it.
- The wave animates opacity rather than position, so nothing moves and nothing reflows — and it stops entirely under `prefers-reduced-motion`.

## See also

- [MPProgressLinear](./progress-linear) — for a percentage rather than a count.
- [MPTimeline](../display/timeline) — when the steps have names and a history.
