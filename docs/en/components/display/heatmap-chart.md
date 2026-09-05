---
title: MPHeatmapChart
order: 38
---

# MPHeatmapChart

<p class="mp-lede">A grid of cells coloured by how much — two categorical axes and a magnitude between them. For finding where the dense part is.</p>

<Demo src="heatmap-chart/hero" :minHeight="720" />

```tsx
import { MPHeatmapChart } from 'material-plus-ui';

<MPHeatmapChart
  categories={['Mon', 'Tue', 'Wed']}
  series={[
    { name: '09:00', data: [4, 9, 2] },
    { name: '10:00', data: [7, 12, 5] }
  ]}
/>;
```

## Props

<PropsTable name="MPHeatmapChart" />

## Rows are series and columns are categories

Each series is one row and its `data` are that row's cells, in the order `categories` names the columns. A week by hour, a cohort by month, a service by region — the shape is for a pattern across two dimensions, where what a reader is looking for is **where** rather than what any one cell holds.

If the exact numbers matter more than the pattern, that is a table. [MPDataTable](data-table) sorts, filters and downloads; a heatmap does none of those.

## Its colour is a ramp, not the palette

The eight chart slots are an **identity** channel: they say which series, and nobody can tell whether slot 6 is more than slot 3. A cell's colour has to say how much, so it comes from a sequential ramp instead — one hue, five steps, running pale to deep on a light page and deep to bright on a dark one, because "more" has to be further from the page in both.

That also sidesteps the cap the palette runs into. Every cell touches its neighbours, and colour separates only three touching things — which is why [MPScatterChart](scatter-chart) reaches for shapes. A ramp is not being asked to separate anything; it is being asked to be ordered.

The step nearest the page clears 2:1 against it, so the lowest cell is a reading rather than a hole.

## Steps rather than a gradient

A smooth fill looks better and reads worse. Given a gradient a reader can say "darker" and nothing else; given five steps they can match a cell to a band in the legend and come away with a number. That is also why the legend **is** the ramp — five swatches with both ends written, rather than a key naming five numbers nobody asked for.

## Pin the scale to compare two of them

By default each heatmap scales to its own range, so two side by side say nothing to each other: the darkest cell of a quiet week looks exactly like the darkest cell of a bad one. Give both the same `min` and `max` when the comparison is the point.

## A missing cell is a hole

A `null` is drawn as an empty outline, not as the lowest step. The bottom of a ramp is a reading, and painting "no data" as "the least" is the same mistake a bridged line makes — with the difference that here it looks exactly like a real quiet hour.

## The reading survives being hovered

The cell under the pointer is **ringed** rather than recoloured. A cell that changed colour on hover would be a cell reporting a different number while it is being read, which is the one moment it must not.

Both axes are walked with the arrow keys: left and right move along the columns, up and down between the rows, and the row and column are named together in the readout.
