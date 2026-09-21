---
title: MPBarChart
order: 34
---

# MPBarChart

<p class="mp-lede">A measured length per category — how much, next to how much else. Grouped or stacked, upright or on its side, and always from zero.</p>

<Demo src="bar-chart/hero" :minHeight="1180" />

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

`horizontal` gives every category a row of its own, which is what a set of names like "Onboarding flow" wants: a name in a row reads left to right at full size, and the bars beside it are still lengths being compared.

Upright, the axis turns the names instead of cutting them to a slot the width of one bar — 45° while that fits, upright past it. That is the better of the two answers a vertical chart has, and still the worse of the two on this page, because a turned name is read more slowly than a level one. Reach for `horizontal` when every name is long, and leave `xAxis.tickLabels` to the chart where one of them is.

`xAxis` is still the category axis and `yAxis` is still the value axis when it is turned. The orientation changes the drawing, not what your data means — so a tick format written for values does not suddenly land on the axis holding the names.

## A long label is turned, not thrown away

Whichever axis runs along the bottom reads `tickLabels`, and its default is `auto`: labels stay level while the widest of them fits its slot, and are turned once it does not. 45° first, because it is the shallower turn and the easier read; upright only where even a turned label's line box would not fit between two ticks.

Turning is what the axis reaches for instead of the two things it used to do. Cutting a name to "Onbo…" loses the thing the name was there to say, and showing every second one loses half of them outright — a turned label collides across its **line box** rather than across its own width, and a line box does not grow with the name.

Short labels are left alone however crowded the axis is. An axis of "Jan", "Feb", "Mar" is crowded by how many of them there are and not by how long any one is, and every nth is still the right answer to that.

So are **ticks**, as opposed to names. A value axis is a ruler: its labels are samples of a continuum, and a reader shown every second one interpolates the rest without noticing. `auto` therefore turns nothing on the axis along the bottom of a chart that has been turned on its side, where that axis is the values — ask for `rotate` or `vertical` by name if you want it anyway.

The band a turned axis takes is capped at half the chart, and 120px whichever is smaller. Past the cap the names are cut again — a chart whose labels genuinely need more room wants a taller `height`, or a `thickness` of its own on the axis. `tickLabels="truncate"` goes back to cutting; `"rotate"` and `"vertical"` turn every label whether or not it needed it.

## Bars have a maximum thickness

Two categories in a wide chart would otherwise be two slabs half the plot across. Past about forty pixels a bar stops reading as a measured length and starts reading as a block of colour, and the axis it is measured against gets no easier to use.

## Everything else is the frame

The hover layer, the crosshair, the keyboard walk, the clipped live region and the table behind the picture are the same on every chart here — and the arrow keys follow the category axis, so they run up and down when the chart is turned. [MPLineChart](line-chart) documents them.
