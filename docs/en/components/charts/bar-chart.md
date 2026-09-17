---
title: MPBarChart
order: 34
---

# MPBarChart

<p class="mp-lede">A measured length per category — how much, next to how much else. Grouped or stacked, upright or on its side, and always from zero.</p>

<Demo src="bar-chart/hero" :minHeight="900" />

```tsx
import { MPBarChart } from 'material-plus-ui';

<MPBarChart
  categories={['Search', 'Direct', 'Social', 'Mail']}
  series={[{ name: 'Sessions', data: [4820, 3110, 1940, 860] }]}
/>;
```

## Props

<PropsTable name="MPBarChart" />

## The axis starts at zero and there is no prop to stop it

A bar's length is proportional to its value only from a zero baseline. Crop the axis and a bar twice the height of its neighbour stands for a value five percent larger — which is not a smaller lie for being a common one, and it is told in the shape a reader trusts most.

`yAxis={{ min }}` still moves the scale, because a caller who has said so has said so. It is the wrong tool for a set of values that sit close together: the right one is [MPLineChart](line-chart), whose marks encode position and claim nothing about proportion.

## Grouped or stacked, never both

Side by side compares the parts with each other. Stacked compares the totals and shows what makes them up.

A stack's inner segments sit on a wobbly floor and cannot be compared by eye — only the bottom segment and the total have a straight edge to be read against. Reach for it when the total is the point, and for grouping when it is not.

Hiding a series with the legend **widens** the survivors rather than leaving a hole in every category, because the band is divided between the series that are drawn.

## Rounded at the end, square at the baseline

The end is where the value is, so that is the end worth softening. A bar rounded where it meets the axis has lost the exact point it starts from, and a row of them turns the baseline into a scalloped edge.

Which end that is comes from the sign and the orientation together: a negative bar hangs below the axis and a horizontal one grows sideways, and in both the corners to soften are the ones furthest from zero. An inner segment of a stack has no rounded end at all — both of its faces are boundaries between shares rather than the end of anything.

## Turn it sideways for long names

`horizontal` gives every category a row of its own, which is what a set of names like "Onboarding flow" needs. The alternative is labels cut to a slot the width of one bar, or an axis of words rotated forty-five degrees, which is unreadable at a glance and takes a band of the plot to be unreadable in.

`xAxis` is still the category axis and `yAxis` is still the value axis when it is turned. The orientation changes the drawing, not what your data means — so a tick format written for values does not suddenly land on the axis holding the names.

## Bars have a maximum thickness

Two categories in a wide chart would otherwise be two slabs half the plot across. Past about forty pixels a bar stops reading as a measured length and starts reading as a block of colour, and the axis it is measured against gets no easier to use.

## Everything else is the frame

The hover layer, the crosshair, the keyboard walk, the clipped live region and the table behind the picture are the same on every chart here — and the arrow keys follow the category axis, so they run up and down when the chart is turned. [MPLineChart](line-chart) documents them.
