---
title: MPAreaChart
order: 33
---

# MPAreaChart

<p class="mp-lede">A quantity over an ordered axis with the room under it filled in — a volume rather than a position. Stack them and the top edge becomes the total.</p>

<Demo src="area-chart/hero" :minHeight="620" />

```tsx
import { MPAreaChart } from 'material-plus-ui';

<MPAreaChart
  categories={['Jan', 'Feb', 'Mar', 'Apr']}
  series={[{ name: 'Storage', data: [12, 19, 24, 31] }]}
/>;
```

## Props

<PropsTable name="MPAreaChart" />

## The axis starts at zero, and on a line chart it does not

That is the whole difference between the two, and it is not a preference. A filled area's **size** encodes the quantity, so the fill is proportional to the value only from a zero baseline — crop the scale and a band comes out twice the height of another that is nowhere near twice its value.

A line encodes **position** and claims nothing about proportion, which is why [MPLineChart](line-chart) is free to crop and this is not. If your data wants a cropped axis, it wants a line.

## Stacked, and what a stack costs

`stacked` puts each series on the one before it, so the top edge is the total and each band is one part's share. It is the right shape for a composition — where storage went, what made up the traffic — and it has a real cost: only the bottom band and the total have a straight edge to be read against. Every band in between is measured from a wobbly floor, and a reader cannot compare two of them by eye.

If the comparison between parts is what matters, that is a grouped bar chart or small multiples, not a stack.

## The gap between bands comes from above

Two touching fills read as one shape, so a stack leaves two pixels of the page between neighbours. That gap is taken entirely from the band **above** the boundary: every band's top edge stays exactly where its cumulative total puts it, because that edge is the data and moving it to make room would be reporting a number the series does not have.

Positives stack up and negatives stack down, so a category holding both is drawn as two runs from the baseline rather than as one band that has crossed itself.

## Only visible series are in the stack

Turning a series off with the legend re-stacks the survivors rather than leaving a hole where it was. The colours do not move with them — a slot comes from a series' place in the `series` array — so what changes is the height of the stack and never which band is which.

## A gap is a gap

A `null` breaks the band. An area closed over a missing month fills in a value that was never measured: the same lie a bridged line tells, painted across a larger part of the picture.

## Faint when they overlap, solid when they stack

Unstacked bands all stand on the baseline and lie on top of each other, so the fill stays faint enough for the ones behind to show through and the top edge is drawn in full colour — that edge is the only part of a faint band a reader can follow. A stacked band has nothing behind it, so it is filled nearly solid and the edge becomes the boundary between two shares.

Three overlapping bands is about the limit. Past that, stack them or draw small multiples.

## Everything else is the frame

The hover layer, the crosshair, the keyboard walk, the clipped live region and the table behind the picture are the same on every chart here. [MPLineChart](line-chart) documents them.
