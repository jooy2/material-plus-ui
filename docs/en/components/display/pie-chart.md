---
title: MPPieChart
order: 35
---

# MPPieChart

<p class="mp-lede">Parts of a whole, at a glance. The narrowest chart here and the easiest one to misuse — it answers one question, and a bar chart answers the rest.</p>

<Demo src="pie-chart/hero" :minHeight="740" />

```tsx
import { MPPieChart } from 'material-plus-ui';

<MPPieChart categories={['Search', 'Direct', 'Social']} data={[52, 31, 17]} />;
```

## Props

<PropsTable name="MPPieChart" />

## When not to use it

An angle is a poor thing to compare. Two slices within a few percent of each other are indistinguishable, and nobody can rank six of them by eye — so a pie is right for exactly one question: **is one of these most of it?**

Anything finer than that, and anything past about six slices, is [MPBarChart](bar-chart), where the reader is judging length instead. Length is the one visual channel people read accurately, which is why the bar chart wins almost every comparison somebody actually has to make.

Two pies side by side are worse again. Comparing angles across two circles is the hardest reading a chart can ask for; that is a grouped bar chart.

## It takes `data`, not `series`

One series and not an array of them, because that is what a pie **is**. The slices are the entities, so each takes a palette slot of its own and the legend lists them rather than listing series.

That also means the legend is doing more work here than anywhere else: a slice has no axis to be read against, so the swatch and its name are the whole identity channel. It is drawn from two slices up and every entry is a real button.

## Colour follows the slice, never its size

A slice takes its slot from its place in `data`. Refilter or resort and every category keeps the colour it had — which is the whole reason a legend is worth reading twice.

Hiding a slice re-shares the rest, because a pie is a picture of proportions and the proportions among four things are not the proportions among five.

## What it does with a negative

Leaves it out. A negative has no share of a whole, and both ways of forcing one in are wrong: as an absolute it claims the opposite of what it means, and as a signed sweep it runs backwards over the slice beside it. The table behind the chart still has the number.

## The gap between slices is a stroke, not a smaller slice

Two touching fills read as one shape, so each slice is outlined in the page's own colour. It is drawn as a stroke rather than by narrowing the sweep, because a slice narrowed to make room is a slice reporting a smaller number than it has.

## `donut` and `semi`

`donut` leaves a hole, and `center` is what goes in it — the total, or the one figure the chart was drawn around. A ring with nothing in the middle is a pie with a bite taken out of it.

`semi` is half a ring opened along the bottom, for a dashboard tile that is wider than it is tall. Both ignore `startAngle`, which `semi` has no use for and which `pie` and `donut` measure in degrees clockwise from twelve o'clock.

## Labels are shares, and they are dropped rather than clipped

`valueLabels="all"` writes each slice's **share** on it. The share and not the value, because a share is what a pie is a picture of and the value is one hover away.

A label only appears where its slice is long enough to hold it with room either side. One that does not fit is left off rather than being clipped or spilled onto its neighbour — the hover panel and the table still have it.
