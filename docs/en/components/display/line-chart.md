---
title: MPLineChart
order: 32
---

# MPLineChart

<p class="mp-lede">A quantity over an ordered axis — how it has moved, and where it is going. Two axes, a grid, a legend and a hover layer, all of it drawn by hand and none of it a dependency.</p>

<Demo src="line-chart/hero" :minHeight="620" />

```tsx
import { MPLineChart } from 'material-plus-ui';

<MPLineChart
  categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
  series={[{ name: 'Signups', data: [120, 138, 131, 164, 190] }]}
/>;
```

## Props

<PropsTable name="MPLineChart" />

## The axis does not start at zero

A bar's **length** means its value, so a bar chart cut off above zero is a lie about proportion. A line's **position** means its value, and nothing about the mark claims proportionality — cropping the scale moves every point by the same amount and the picture survives.

Forcing zero onto a series that runs between 3,200 and 3,400 draws a flat line, and a flat line reports a real change as nothing happening. So this chart leaves zero out and `MPBarChart` will not.

Pass a `yAxis` with `min: 0` where zero genuinely is the baseline.

## A gap is a gap

A `null` is a point nothing was measured at, and the line breaks there. It is not joined across, because a straight run through values nobody has is the one kind of invented data a reader never questions: it looks exactly like the rest of the line.

`smooth` is a monotone fit, so a rising run never turns back on its way up and the lowest number in the data is the lowest point on screen. An ordinary spline through the same points overshoots both, and a chart that draws a dip has reported one.

## The hover layer is on by default

A chart drawn in a browser is a thing a reader interrogates. The question a line chart gets asked is "what happened in March", and answering it by making somebody measure against a gridline is answering it badly — so the crosshair and the panel are there without being asked for.

The **whole column** is the hit target, not the line. A two-pixel stroke is not something a pointer can be asked to land on, and the nearest category is what a reader hovering the empty space above a point means.

Set `tooltip={false}` only if the numbers are readable another way. The table below is always one of those ways.

## Everything a pointer does, a keyboard does

The plot is one tab stop. Left and right walk the columns, `Home` and `End` jump to the ends, `Escape` clears the reading. Each column is announced by a clipped live region that is a **sibling** of the picture rather than a child — `role="img"` is a leaf role, so everything inside it is cut out of the accessibility tree and a live region in there would announce to nobody.

## The numbers are always behind the picture

Every chart renders the data as a table, clipped rather than drawn, and points `aria-describedby` at it. A reader who cannot see the plot gets the data itself rather than a summary of it, and a reader who can is not made to scroll past a table they did not ask for.

`label` is what the chart is a chart **of**. It is the accessible name and the table's caption, so it is worth writing even though nothing breaks without it.

## Colour follows the entity

A series takes its palette slot from where it sits in the `series` array, never from how many of its neighbours are currently visible. Hiding one line leaves the rest exactly the colours they were — a reader who learned that blue is Organic learned something a re-render is not allowed to take back.

The palette is eight fixed hues with only their lightness following the scheme, measured for colour-vision separation in both. Past eight, fold the tail into one series or draw a second chart; a ninth hue is indistinguishable from one of the first eight whichever one is picked. See [the design language](../../design/design-language) for the measurements.

## The legend is a control

From two series up it is drawn automatically, and each entry is a real button: clicking one hides its series, hovering one dims the rest. It carries `aria-pressed`, because a filter that a keyboard cannot reach is a filter half the readers do not have.

A chart with one series draws no legend — a legend with one swatch in it restates the title.

## Markers, and when they stop helping

`markers="auto"` draws a dot on every join while the dots still have room to be separate marks, and drops them once the line is denser than that. A dot every three pixels is not a row of dots, it is a thicker line.

The active column keeps its dot whatever the setting says. It is where the crosshair and the panel are pointing, and a crosshair with nothing on it leaves the reader to work out which line it crossed.

## Value labels are opt-in and selective

`valueLabels="last"` writes the final number of each series; `"extremes"` writes the highest and the lowest. `"all"` exists for the five-point chart where it genuinely is the answer, and it is not the default because a number beside every point is the most reliable way to make a chart unreadable.

Written values wear ordinary ink and never the series' colour. A number in the mark's colour is a number the reader decodes before they read it, and it fails outright in forced colours.

## It brings no surface of its own

The chart draws a figure, not a card. Wrap it in an [MPBox](../layout/box) or an [MPCard](../layout/card) when it needs one, which keeps a dashboard's panels the caller's decision rather than eight components each with an opinion about padding.
