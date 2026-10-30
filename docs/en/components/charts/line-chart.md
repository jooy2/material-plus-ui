---
title: MPLineChart
order: 32
---

# MPLineChart

<p class="mp-lede">A quantity over an ordered axis — how it has moved, and where it is going. Two axes, a grid, a legend and a hover layer, all of it drawn by hand and none of it a dependency.</p>

<Demo src="line-chart/hero" :minHeight="1420" />

::: fw react

```tsx
import { MPLineChart } from 'material-plus-ui';

<MPLineChart
  categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
  series={[{ name: 'Signups', data: [120, 138, 131, 164, 190] }]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPLineChart(
  categories: const <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  series: const <MPChartSeries>[
    MPChartSeries(name: 'Signups', data: <num>[120, 138, 131, 164, 190]),
  ],
);
```

:::

## Props

<PropsTable name="MPLineChart" />

## The axis does not start at zero

A bar's **length** means its value, so a bar chart cut off above zero is a lie about proportion. A line's **position** means its value, and nothing about the mark claims proportionality — cropping the scale moves every point by the same amount and the picture survives.

Forcing zero onto a series that runs between 3,200 and 3,400 draws a flat line, and a flat line reports a real change as nothing happening. So this chart leaves zero out and `MPBarChart` will not.

Pass a `yAxis` with `min: 0` where zero genuinely is the baseline — and reach for [MPAreaChart](area-chart) where the quantity under the line is the point, since a fill has to measure from zero.

::: fw flutter

In Dart that is `yAxis: const MPChartAxis(min: 0)`.

:::

## A gap is a gap

A `null` is a point nothing was measured at, and the line breaks there. It is not joined across, because a straight run through values nobody has is the one kind of invented data a reader never questions: it looks exactly like the rest of the line.

`smooth` is a monotone fit, so a rising run never turns back on its way up and the lowest number in the data is the lowest point on screen. An ordinary spline through the same points overshoots both, and a chart that draws a dip has reported one.

`gaps` is there for the two cases where breaking is the wrong reading. `gaps="connect"` joins the two sides and draws the joining run **dashed** — the line carries on, and the picture still says which part of it was measured. `gaps="zero"` draws the missing reading at zero and widens the value axis to hold it, which is right where a gap means "none of it happened" and wrong where it means "nobody was counting".

::: fw flutter

In Dart the three are `MPChartGaps.gap`, `MPChartGaps.connect` and `MPChartGaps.zero`. React's `'break'` is spelled `gap` because `break` is a reserved word in Dart.

:::

Only the drawing changes. The hover panel and the table behind the chart report a gap as a gap in all three, because they are the copy of the data a reader gets when they need the number itself.

## A target is a reference, not a series

A reference on `yAxis` — `{ value: 300, label: 'SLO', color: 'error' }` — draws a dashed line across the plot at 300 and writes its name at the end of it. Give a reference a `to` as well and it is a **band** instead — the range a reading should stay inside, the window something was down for — with both edges drawn and the room between them filled.

::: fw flutter

In Dart a reference is an `MPChartReference` in the axis' `references` list:

```dart
yAxis: const MPChartAxis(
  references: <MPChartReference>[
    MPChartReference(value: 300, label: 'SLO', color: MPColor.error),
    MPChartReference(value: 280, to: 320, label: 'Target'),
  ],
),
```

:::

It is deliberately not data. A reference is a fact the reader brought with them, so it wears the chrome's ink rather than a palette slot, it is dashed so it cannot be mistaken for a gridline, and the chart never invents one. `color` takes a role for the case worth having: a threshold somebody is watching is exactly what `error` is for.

**The scale opens to hold it.** A target above everything measured would otherwise be cropped out of the picture, which is the one thing a target must never be. Pin `min` or `max` to stop that.

A band is drawn **under** the marks and a line **over** them. A fill over a bar is a bar the reader has to look through; a target hidden behind the series that crossed it is a target nobody can read.

References belong to the axis whose scale their `value` is on, and they are drawn perpendicular to it — so the same reference is a horizontal line upright and a vertical one on a chart turned on its side. An axis of names has no place between two categories for a line to be at, so only an axis with a scale reads them: the value axis always, and the category axis where it runs on numbers, as [MPScatterChart](scatter-chart)'s does. A `value` may be a `Date` on an axis of dates.

::: fw react

A named reference is read out with the chart, beside the table, because the table has no column for it.

:::

::: fw flutter

A named reference is read out with the chart, after the table in the plot's semantic value, because the table has no column for it.

:::

## The hover layer is on by default

A chart drawn in a browser is a thing a reader interrogates. The question a line chart gets asked is "what happened in March", and answering it by making somebody measure against a gridline is answering it badly — so the crosshair and the panel are there without being asked for.

The **whole column** is the hit target, not the line. A two-pixel stroke is not something a pointer can be asked to land on, and the nearest category is what a reader hovering the empty space above a point means.

::: fw react

Set `tooltip={false}` only if the numbers are readable another way. The table below is always one of those ways.

:::

::: fw flutter

Set `tooltip: const MPChartTooltip(mode: MPChartTooltipMode.none)` only if the numbers are readable another way. The words behind the picture are always one of those ways.

On a touch screen a tap **leaves** the panel up, and a second tap on the same column takes it down: the press and the release are a tenth of a second apart, and a panel cleared on the release is a panel nobody gets to read. Dragging a finger along the plot scrubs from column to column.

:::

`sort: 'value'` on `tooltip` puts the largest row first, which is what a chart of eight series wants: the row a reader is looking for is usually the big one, and hunting for it down a list in a fixed order is the work the panel exists to save. The default is the order the series were passed, so a reader who has learned the legend can find a row without reading it. Ties keep their series order either way.

::: fw flutter

In Dart that is `MPChartTooltip(sort: MPChartTooltipSort.value)`, and `total: true` or `total: false` on the same object. `builder` draws the panel yourself, the way React's `render` does.

:::

A **stack** also gets a row for what the column adds up to, ruled off from the parts and carrying no swatch, because the height of that column is the whole point of the shape and a panel that listed the parts without it would leave the reader adding them up. An unstacked chart does not: its series are not parts of anything, and adding them would be the panel inventing a quantity. Neither does a percent stack, whose answer is 100% at every category. A `total` of `false` or `true` on `tooltip` overrides both.

## Dragging a range out of a long axis

`zoom` is for the chart with ninety points on it, where the shape of one week is inside a picture of a quarter. A reader drags across the plot, the chart redraws to what they picked, and the scale re-fits — so the window is a **chart of that range** rather than a magnified picture of the whole one.

Everything follows the window: the value scale, the hover panel, the spoken readout and the table behind the picture. The table matters most. It is what a reader who cannot see the plot is given **instead** of it, so one still listing ninety points would be describing a chart that is not on the page.

A drag narrower than two categories is ignored, because a window of one category has no distance left in it for a line to have travelled — a click on the plot is exactly that, and is left alone. `Escape` clears the reading first and the window second, which is the order the reader made them in.

::: fw react

The way back is a **Show all** control over the corner of the plot, and it is a sibling of the picture rather than a child: `role="img"` is a leaf role, so a button inside it is one no keyboard can reach and no screen reader can find. It is named in every language the library ships.

:::

::: fw flutter

The way back is a **Show all** control over the corner of the plot. It sits beside the plot's semantics node rather than inside it, so it is a button of its own that a keyboard can reach and a screen reader can find. It is named in every language the library ships.

:::

::: fw react

Pass an object to control the window yourself — `range` and `onRangeChange` for a controlled one, `defaultRange` to open on a window, `min` to require more than two categories. A range is clamped to the data rather than trusted: one that outlives the series it was picked from would otherwise be an empty chart with no way back to the full one.

:::

::: fw flutter

Pass an `MPChartZoom` to turn it on — `const MPChartZoom()` — and fill it in to control the window yourself: `range` and `onRangeChange` for a controlled one, `initialRange` to open on a window, `min` to require more than two categories. A range is a record of the first and last category index, `(2, 9)`, and setting `range` back to `null` shows every category again. A range is clamped to the data rather than trusted: one that outlives the series it was picked from would otherwise be an empty chart with no way back to the full one.

:::

Only a chart whose categories are a row of slots takes it. [MPScatterChart](scatter-chart) has two value axes and no row to cut, so it crops with `xAxis` and `yAxis` instead, and a pie has no axis at all.

The drag is a pointer gesture and there is no keyboard equivalent. That is a gap this component does not pretend to close: what a keyboard reader has instead is the arrow keys walking every column and the table behind the picture, neither of which a window would improve. A caller who needs the window under a keyboard's control owns `range` and can put it behind a control of their own.

## Everything a pointer does, a keyboard does

::: fw react

The plot is one tab stop. Left and right walk the columns, `Home` and `End` jump to the ends, `Escape` clears the reading. Each column is announced by a clipped live region that is a **sibling** of the picture rather than a child — `role="img"` is a leaf role, so everything inside it is cut out of the accessibility tree and a live region in there would announce to nobody.

:::

::: fw flutter

The plot is one focus stop. Left and right walk the columns, Home and End jump to the ends, Escape clears the reading. Each column is announced by a live region that sits **beside** the plot's semantics node rather than inside it, so it is announced as it changes while the focus stays on the chart. Escape with nothing being read is left to whatever the chart sits in, so a sheet or a dialog around it can still close.

:::

## The numbers are always behind the picture

::: fw react

Every chart renders the data as a table, clipped rather than drawn, and points `aria-describedby` at it. A reader who cannot see the plot gets the data itself rather than a summary of it, and a reader who can is not made to scroll past a table they did not ask for.

:::

::: fw flutter

Flutter has no element to describe a node with, so the table travels as the plot's semantic **value**: each category, then each series' name and its value there — "Jan: Organic 4,200, Referral 3,100. Feb: …". A gap is read as "No data", which is what the table's cell says on the web. A reader who cannot see the plot gets the data itself rather than a summary of it, and a reader who can sees nothing extra.

:::

::: fw react

`label` is what the chart is a chart **of**. It is the accessible name and the table's caption, so it is worth writing even though nothing breaks without it.

:::

::: fw flutter

`label` is what the chart is a chart **of**. It is the name a screen reader announces in place of the drawing, so it is worth writing even though nothing breaks without it.

:::

## Colour follows the entity

A series takes its palette slot from where it sits in the `series` array, never from how many of its neighbours are currently visible. Hiding one line leaves the rest exactly the colours they were — a reader who learned that blue is Organic learned something a re-render is not allowed to take back.

The palette is eight fixed hues with only their lightness following the scheme, measured for colour-vision separation in both. Past eight, fold the tail into one series or draw a second chart; a ninth hue is indistinguishable from one of the first eight whichever one is picked. See [the design language](../../design/design-language) for the measurements.

## The legend is a control

::: fw react

From two series up it is drawn automatically, and each entry is a real button: clicking one hides its series, hovering one dims the rest. It carries `aria-pressed`, because a filter that a keyboard cannot reach is a filter half the readers do not have.

:::

::: fw flutter

Each entry is a button that says whether its series is shown, the `toggled` state on its semantics node, because a filter that a keyboard cannot reach is a filter half the readers do not have.

:::

A chart with one series draws no legend — a legend with one swatch in it restates the title.

A series that is switched off is drawn at Material's disabled opacity, swatch and name together, because that is what it is and the treatment is one a reader already knows. A series merely standing back while another is hovered is quieter than usual and no more, so the two cannot be mistaken for each other at a glance. Neither depends on hue, which is what keeps them legible in greyscale and in forced colours, and `aria-pressed` carries the same fact to a reader who is not looking at all.

## Markers, and when they stop helping

`markers="auto"` draws a dot on every join while the dots still have room to be separate marks, and drops them once the line is denser than that. A dot every three pixels is not a row of dots, it is a thicker line.

::: fw flutter

In Dart `markers` is a `bool?`, and `null` is React's `'auto'`.

:::

The active column keeps its dot whatever the setting says. It is where the crosshair and the panel are pointing, and a crosshair with nothing on it leaves the reader to work out which line it crossed.

## Value labels are opt-in and selective

`valueLabels="last"` writes the final number of each series; `"extremes"` writes the highest and the lowest. `"all"` exists for the five-point chart where it genuinely is the answer, and it is not the default because a number beside every point is the most reliable way to make a chart unreadable.

::: fw flutter

In Dart these are `MPChartValueLabels.last`, `MPChartValueLabels.extremes` and `MPChartValueLabels.all`.

:::

Written values wear ordinary ink, and the swatch beside a name in the legend is the only thing on the chart carrying a series' colour. `labelColor="series"` moves the colour onto the words as well, which pairs a long legend with a crowded plot faster than a swatch alone can. It is not the default, and the reason is measurable: the eight palette slots are fitted to 3:1 against the surface, which is the bar a **mark** has to clear, and small text is held to 4.5:1.

::: fw flutter

In Dart that is `labelColor: MPChartLabelColor.series`.

:::

## It brings no surface of its own

The chart draws a figure, not a card. Wrap it in an [MPBox](../layout/box) or an [MPCard](../layout/card) when it needs one, which keeps a dashboard's panels the caller's decision rather than eight components each with an opinion about padding.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `data: [120, null, { y: 3 }]` | `List<MPChartDatum>`: each a `num`, `null` or an `MPChartPoint` | Dart has no union type. `MPChartDatum`, `MPChartCategory` and `MPChartColor` are aliases of `Object`, so a series is still written `<num?>[120, 138, null]`. A value that is not a number is read as a gap. |
| `color: 'primary'` or a CSS colour | an `MPColor` or a `Color` | The same choice, in Dart's two types. |
| `format` as `Intl.NumberFormatOptions` | `format` as `String Function(double value)` | The framework has no `Intl`. Without a `format`, numbers are grouped the English way and compacted past ten thousand in every locale. |
| dates written through `locale` | `dateNames` | There is no `Intl` to ask for month names. The library's own table for the locale is used, as the date pickers use it, and `dateNames` replaces it with an `MPDateNames` of your own. |
| `legend={true}`, `legend={false}` | `MPChartLegend(visible: true)`, `MPChartLegend(visible: false)` | One parameter, one type. |
| `tooltip={false}` | `MPChartTooltip(mode: MPChartTooltipMode.none)` | The same reason. |
| `mode: 'index'` | `MPChartTooltipMode.column` | Every Dart enum already has an `index`. |
| `render` | `builder` | Flutter's word for a function that returns a widget. |
| `gaps="break"` | `MPChartGaps.gap` | `break` is a reserved word. |
| `stacked={true}`, `stacked="percent"` | `MPChartStack.stacked`, `MPChartStack.percent` | One type for the three answers. |
| `zoom={true}`, `defaultRange` | `const MPChartZoom()`, `initialRange` | The same reason, and Flutter's word for a starting value. |
| `height` as a CSS length | `height` in pixels | There is no CSS length to parse. |
| a clipped `<table>` named by `aria-describedby` | the table as the plot's semantic value | Flutter has no element to describe a node with. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |
| — | `focusNode`, `autofocus` | Every focus stop in Flutter takes them. |

Labels are measured with an estimate of their width, as on the web, so how many fit and when they turn match the React build rather than the font in use.

:::
