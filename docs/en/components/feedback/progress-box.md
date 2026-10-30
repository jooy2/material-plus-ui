---
title: MPProgressBox
order: 8
---

# MPProgressBox

<p class="mp-lede">A row of segments that light up. A bar and a ring both say “this much is done” — a quantity a reader measures; four segments say “this is step three”, which is a quantity they count, and counting is faster than measuring for any number small enough to count.</p>

<Demo src="progress-box/hero" :minHeight="80" />

::: fw react

```tsx
import { MPProgressBox } from 'material-plus-ui';

<MPProgressBox label="Deploying" count={4} value={step * 25} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPProgressBox(label: const Text('Deploying'), count: 4, value: step * 25);
```

:::

## Props

<PropsTable name="MPProgressBox" />

## This one is not in the specification

MD3 has a bar and a ring and stops there. This is the library's own third shape — which is the whole premise of Material Plus: where the specification stops, this library does not.

It is drawn out of the spec's own parts all the same — `corner-extra-small` tiles, the accent, `on-surface` at 12% — so a row of them sits in a Material page without announcing that it is extra.

## Examples

### count

Four by default: enough that the wave reads as a wave, few enough that a determinate row can be counted at a glance rather than measured. Set it to the number of steps when the thing being waited on genuinely has steps.

<Demo src="progress-box/count" :minHeight="180">

::: fw react

<<< @/.vitepress/demos/progress-box/count.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_box/count.dart

:::

</Demo>

The leading segment fills partially, so four segments are not limited to 0, 25, 50, 75 and 100 — a value of 30% would otherwise round away to a quarter.

::: fw react

A row of no segments is not an indicator, and a fractional count is a caller who divided something. Both land on one segment rather than none.

:::

::: fw flutter

A row of no segments is not an indicator, so a `count` under one lands on one segment rather than none. `count` is an `int`, so a fractional one cannot arrive.

:::

### value

`null` — the default — cycles the row instead, each segment held back by its own index.

### size

The size of one segment, on a ladder of its own. An indicator is not a control, so it is not on the control heights.

<Demo src="progress-box/sizes" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/progress-box/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_box/sizes.dart

:::

</Demo>

## Accessibility

::: fw react

- Base UI owns the `progressbar` role and the value; the segments are the picture of it.
- The wave animates opacity rather than position, so nothing moves and nothing reflows — and it stops entirely under `prefers-reduced-motion`.

:::

::: fw flutter

- The indicator is one merged semantics node, so the label and the shape are read together rather than as a name floating beside an unnamed indicator.
- With a value it carries the progress-bar role, its value and its range, and the value is the same string `showValue` draws: a percentage of the range unless `formatValue` says otherwise. The drawn string is not read a second time.
- With no value it is a loading spinner with no value at all, which is what tells the platform to announce indeterminate progress rather than zero.
- `hideLabel` keeps the label on the node and takes it off the screen, at no width and no height.
- The wave animates opacity rather than position, so nothing moves and nothing is laid out again. With `MediaQuery.disableAnimations` it stops, and every segment rests at a steady 60%.
- The segments fill from the start of the reading direction, so under right-to-left the first one is the rightmost.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(double)` | There is no `Intl.NumberFormat` in the framework, and pulling `package:intl` in to provide one would be a dependency decision made on the consumer's behalf. It is handed the value clamped into the range. |
| `locale` | — | It only told `Intl` which language to write the number in; `formatValue` writes it in whatever language it likes. |
| `label: ReactNode`, `value: number \| null` | `label: Widget?`, `value: double?` | Dart's names for the same things. |
| `role="progressbar"` with `aria-valuetext` | a node with the progress-bar role, its value and its range | The same three numbers. A `formatValue` that writes something other than a number or a percentage, `2.1 GB`, is said as the node's value without the role, because the framework takes only those two on a progress bar. |
| the loop is held while the indicator is scrolled out of sight | the loop runs while the widget is built | A list that builds lazily disposes what scrolls away, and a `TickerMode` that is off, a route behind another, stops it. |
| `className`, `style` | — | There is nothing to pass them through to. |

The row is as wide as its widest line, as the React build's `inline-flex` is: a label longer than the segments widens it rather than wrapping under four small squares.

:::

## See also

- [MPProgressLinear](./progress-linear) — for a percentage rather than a count.
- [MPTimeline](../display/timeline) — when the steps have names and a history.
