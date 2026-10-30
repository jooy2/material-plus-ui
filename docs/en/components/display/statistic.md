---
title: MPStatistic
order: 30
---

# MPStatistic

<p class="mp-lede">One figure, said once and read from across a desk — with what it is, and whether it is going the right way.</p>

<Demo src="statistic/hero" :minHeight="200" />

::: fw react

```tsx
import { MPStatistic } from 'material-plus-ui';

<MPStatistic
  label="Active installs"
  value={128400}
  previousValue={119200}
  period="vs last month"
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPStatistic(
  label: Text('Active installs'),
  value: 128400,
  previousValue: 119200,
  period: Text('vs last month'),
);
```

:::

## Props

<PropsTable name="MPStatistic" />

## It is the chart you draw when there is nothing to plot

A single number has no shape, no order and no second dimension. Putting one on a pair of axes to make it look like data is the most common way a dashboard wastes a panel — a bar of one bar, a line of one point, a donut of one slice. What a reader wants from one figure is the figure, what it is, and which way it is moving.

::: fw react

This is also the first of the library's chart components, and the only one with no plot in it. The others share `internal/chart.ts` — the palette, the scales and the arithmetic under them.

:::

## Four digits stay; five do not

`1,284` is a figure anybody takes in at a glance, and `1.3K` has thrown away two of them to save two characters. At `12,900` the digits have stopped being read and started being counted, so `12.9K` loses nothing — and past that it is the only honest picture, because nobody compares `1,284,003` with `1,911,220` by reading them.

::: fw react

`compact={false}` keeps every digit. Giving a `format` turns compacting off on its own: a caller who has asked for a currency has said what they want, and a component that shortened it anyway would be arguing.

:::

::: fw flutter

`compact: false` keeps every digit. Giving a `formatValue` turns compacting off on its own: a caller who has written a currency has said what they want, and a component that shortened it anyway would be arguing.

```dart
MPStatistic(
  label: const Text('Revenue'),
  value: 4234900,
  previousValue: 4610000,
  formatValue: (num value) => usd.format(value), // a NumberFormat from package:intl
);
```

The move is written by the same function, handed the size of the move with the sign put in front, so a currency formatter writes `-$375,100` for a fall.

Without one, a number is written the way `Intl` writes it in English: digits grouped in threes by a comma, and the compact `K`, `M`, `B` and `T`. That is the same in every locale, because the package takes no dependency on `package:intl`; a figure in another language's notation is what `formatValue` is for.

:::

The figure does **not** get `tabular-nums`. That gives every digit the width of a zero, which lines a column of numbers up and makes a single large one look loose — and this is the single large one. Tabular figures are for [MPTable](table)'s columns and a chart's axis ticks.

## The direction is the caller's to say

`betterWhen` exists because half the figures on any dashboard are the other way round. Churn, latency, cost, error rate, time-to-first-response and open incidents are all better when they fall, and a component that painted every fall red would be wrong about four tiles in eight — wrong _confidently_, in the one colour a reader trusts without checking.

Flat is a third state rather than a quiet rise: muted ink and a dash, because a figure that has not moved has not done anything good either.

**A move from zero is written as an absolute.** Something that was nothing and is now something has not grown by an amount, it has started, and every percentage that could be printed there — `∞`, `100%`, `0%` — is one a reader would take at face value.

## The colour never carries the meaning on its own

The arrow is the second channel, so the tile still says which way it went in grayscale, in `forced-colors`, and to a reader who cannot tell the two hues apart. The glyph says nothing to a screen reader and there is no sentence behind it, because the number beside it already carries a sign: a move is always `+7.7%` or `−7.7%`, and a flat one is a plain zero. A screen reader that also heard "up" would hear the direction twice, in two vocabularies, one of them untranslated.

And the **figure** is `on-surface` in every state. Only the move is coloured. A reported value that changes colour with its own trend is a value the reader has to decode before they can read it.

## The trend is a slot, not a chart

`trend` takes anything — an [MPSparkline](../charts/sparkline) is the usual thing to put there. It is a slot rather than a chart of its own because a statistic that owned a sparkline would be a statistic with opinions about a second component's data shape, and the two are separable.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `value: number \| ReactNode` | `value: Object`, a `num`, a `String` or a `Widget` | Dart has no union type. A number is written; a string or a widget is drawn as it is. An assertion catches anything else. |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(num)` | There is no `Intl.NumberFormat` in the framework, and pulling `package:intl` in to provide one would be a dependency decision made on the consumer's behalf. |
| `locale` | — | Without `Intl` there is no other locale's notation to reach for. The default writes English grouping and units everywhere; `formatValue` writes any other. |
| `delta`, `betterWhen` are strings | `MPStatisticDeltaFormat`, `MPStatisticBetterWhen` | The same values. |
| `label`, `prefix`, `unit`, `period`, `caption`, `trend` take a `ReactNode` | they take a `Widget?` | Dart's name for the same thing. |
| `classNames`, `className`, `style`, native attributes | — | There is no class list to reach into. |

:::
