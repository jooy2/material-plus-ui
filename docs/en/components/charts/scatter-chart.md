---
title: MPScatterChart
order: 36
---

# MPScatterChart

<p class="mp-lede">Two measures against each other, one mark per observation. The only chart here with a value axis in both directions.</p>

<Demo src="scatter-chart/hero" :minHeight="700" />

```tsx
import { MPScatterChart } from 'material-plus-ui';

<MPScatterChart
  series={[
    {
      name: 'Runs',
      data: [
        { x: 12, y: 4.2 },
        { x: 19, y: 5.1 }
      ]
    }
  ]}
/>;
```

## Props

<PropsTable name="MPScatterChart" />

## A point carries its own x

Every other chart here files its marks under shared categories. A scatter does not: each observation has its own place on both axes, so a point's `x` is data rather than a column heading, and two marks at the same index in two series are unrelated.

An `x` has to be a number or a `Date`. A string is not a position on a number line, and a chart placed entirely by names has no x axis to draw — it shows the empty state rather than stacking every mark on a single tick.

## Neither axis starts at zero

A position encodes a value and claims nothing about proportion, so cropping both scales moves every mark by the same amount and the relationship survives intact. Forcing zero onto two measures that live between 40 and 60 puts the whole picture in one corner, which is the one reliable way to make a scatter say nothing.

## Three series is the cap on colour alone

The palette's eight slots are separable pair by pair only to the third, and on a scatter **any two marks can sit side by side** — unlike a line or a bar, where only neighbours ever meet. That is a property of the colour space rather than of this palette, and no ordering of eight does better.

So the marks take shapes as well: a circle, a square, a triangle, a diamond and a cross, each scaled to the same **area** so no series looks heavier than another. The legend shows the shape rather than a dot, because a legend of identical circles carries only the colour.

Past five series, facet the chart. `shapes={false}` exists for the single-series case where the extra channel is noise.

## The grid runs both ways here and nowhere else

A grid in both directions is graph paper, and on a chart of columns the vertical rules would be doing the job the crosshair already does under the pointer. Here there is no column to be in, and reading a mark's x off the picture is half of what the reader came for — so graph paper is exactly the point.

For the same reason there is **no crosshair**: it would be a line through one dot.

## Bubbles are sized by area

`bubble` lets a point's `z` ride along as the size of its mark, and the area carries it rather than the radius. Area grows as the square of the radius, so a bubble drawn with its radius proportional to the value shows four times the ink for twice the number — and every reader judges the blob, not the line across it.

The smallest bubble is a floor rather than nothing, because a mark of no radius is a point that has been removed from the chart.

## No trend line

A scatter's marks are observations rather than a sequence, so nothing joins them. A fitted line is a claim this component has no way to justify — which model, over what range, with what confidence — and drawing one anyway would put that claim in the reader's head with no way to check it.

## Marks are drawn part-transparent

They overlap by nature. Left solid, a dense cluster reads as one blob the colour of whichever series happened to be drawn last; part-transparent, density itself becomes visible. Each also carries a thin ring of the page's colour, so two marks that meet still read as two.
