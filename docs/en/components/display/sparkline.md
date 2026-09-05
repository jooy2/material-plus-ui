---
title: MPSparkline
order: 31
---

# MPSparkline

<p class="mp-lede">A series as a mark, in the space of a word. No axes, no legend, and nothing to read a value against — it answers which way this has been going, and nothing else.</p>

<Demo src="sparkline/hero" :minHeight="280" />

```tsx
import { MPSparkline } from 'material-plus-ui';

<MPSparkline data={[12, 15, 14, 19, 22, 21, 27]} />;
```

## Props

<PropsTable name="MPSparkline" />

## It has no hover layer, on purpose

Every other chart in this library ships one, because a chart is a thing a reader interrogates. A sparkline is not. It is thirty pixels tall, it has no axis to read a value against, and a floating card over a mark that size covers the mark. A reader who needs the numbers needs [MPLineChart](line-chart); a reader who needs one number has it in the [MPStatistic](statistic) this is sitting under.

What it has instead is a **sentence**: the accessible name says how many points there are and the two ends they run between, so the thing a sighted reader gets from the outline is a thing every reader gets. `label` replaces it when the caller has a better one.

The **two ends** rather than the two extremes, and that is the whole reason it reads well: "120 to 400" says which way it went, and "90 to 410" does not.

## A gap is a gap

A `null` is a point nothing was measured at, and the line breaks there. It is not joined across, because a straight line through a value nobody has is the one kind of invented data a reader would never guess was invented — it looks exactly like the rest of the line.

An area breaks at the same place, for the same reason and over more of the picture. A lone point between two gaps is drawn as a dot, because it has no line to be part of.

## The line is quiet and the end is not

The stroke is drawn faded and the end dot is not. The history is context and the last value is the point, so `endDot` is on by default: without it the reader has to work out which end is now, which is the one thing the mark is for.

`shape="bar"` does the same thing by opacity — the newest bar is solid and the rest are not.

## `smooth` never invents a dip

The smoothing is a monotone fit, so a run of rising values never turns back on its way up and the lowest number in the data is the lowest point on screen. An ordinary spline through the same points overshoots both, and a chart that draws a dip has reported one.

`step` turns halfway between two points rather than at either. Turning at the new point would draw the old value as lasting until it arrives, and turning at the old one draws the opposite.

## The box stretches and the stroke does not

The shape is drawn in a fixed viewBox and scaled to whatever room it is given, so eight points and a hundred both fill the width — a mark that got narrower as its series grew would change meaning with its own length. The stroke and the end dot are `non-scaling-stroke`, which is what keeps two pixels two pixels in a box that has been stretched.

That is also why the dot is a zero-length round-capped path rather than a `<circle>`: a radius is in viewBox units, and in a stretched box it would come out an ellipse as wide as the element.

## Comparing two of them

By default each sparkline scales to its own range, so two of them side by side say nothing to each other — the flatter series will look exactly as dramatic as the steeper one. Give both the same `min` and `max` when the comparison is the point.
