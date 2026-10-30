---
title: MPProgressLinear
order: 6
---

# MPProgressLinear

<p class="mp-lede">A bar that fills, and the workhorse of the three progress indicators — the only one that shows <em>how much</em> is left at a glance, because length is the one quantity a reader compares without counting.</p>

<Demo src="progress-linear/hero" :minHeight="120" />

::: fw react

```tsx
import { MPProgressLinear } from 'material-plus-ui';

<MPProgressLinear label="Uploading" value={progress} showValue />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPProgressLinear(label: const Text('Uploading'), value: progress, showValue: true);
```

:::

## Props

<PropsTable name="MPProgressLinear" />

## `value` defaults to `null`, and that is the point

`null` is the indeterminate case: something is happening and nobody knows how much of it is left. An indicator that has not been told a value should say so rather than draw an empty track, which is a claim that no progress has been made.

The same is true of [MPProgressCircular](./progress-circular) and [MPProgressBox](./progress-box) — they are one component in three shapes, and `null` has to mean the same thing on all three.

## Examples

### value, min and max

The fraction is clamped. That is not defensive programming for its own sake: `value` usually arrives from a division somewhere, and a bar that renders 140% wide because one request finished twice is a worse bug than a bar that sits full.

::: fw react

```tsx
<MPProgressLinear value={3} min={0} max={4} showValue />
```

:::

::: fw flutter

```dart
const MPProgressLinear(value: 3, max: 4, showValue: true);
```

:::

### showValue and format

::: fw react

Without `format` the value is a percentage of `min`…`max`, which is the only formatting that holds for a range nobody described — Base UI's own default of `${value}%` would read "3%" for step 3 of 4.

`format` takes `Intl.NumberFormat` options, so bytes and currencies work as well as plain numbers.

```tsx
<MPProgressLinear
  value={bytes}
  max={total}
  showValue
  format={{ style: 'unit', unit: 'megabyte' }}
/>
```

:::

::: fw flutter

Without `formatValue` the value is a percentage of `min`…`max`, which is the only formatting that holds for a range nobody described: "3%" for step 3 of 4 is worse than saying nothing.

`formatValue` is a function from the value, clamped into the range, to the words, so bytes and currencies work as well as plain numbers.

```dart
MPProgressLinear(
  value: bytes,
  max: total,
  showValue: true,
  formatValue: (double value) => '${value.round()} MB',
);
```

:::

### size

The thickness of the groove, and the only thing `size` touches here — a bar has no label inside it to scale. `md` is MD3's own 4dp.

<Demo src="progress-linear/sizes" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/progress-linear/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_linear/sizes.dart

:::

</Demo>

### color

The active indicator is the family's accent and the groove is `on-surface` at 12%. One wash has to read under all four accents on both schemes, which is what a fixed neutral gives and a per-family container tone does not.

## Accessibility

::: fw react

- Base UI owns `role="progressbar"`, the value and range attributes, `aria-valuetext`, and dropping the value entirely while the bar is indeterminate.
- `label` names the bar; without one, name it from whatever it is measuring.
- The indeterminate sweep stops under `prefers-reduced-motion`, and rests on a partial frame rather than a full one — an indicator that has stopped must not read as an indicator that has finished.

:::

::: fw flutter

- The indicator is one merged semantics node, so the label and the shape are read together rather than as a name floating beside an unnamed indicator.
- With a value it carries the progress-bar role, its value and its range, and the value is the same string `showValue` draws: a percentage of the range unless `formatValue` says otherwise. The drawn string is not read a second time.
- With no value it is a loading spinner with no value at all, which is what tells the platform to announce indeterminate progress rather than zero.
- `hideLabel` keeps the label on the node and takes it off the screen, at no width and no height.
- `label` names the bar; without one, name it from whatever it is measuring.
- With `MediaQuery.disableAnimations` the sweep stops and rests on a partial bar from the start, never a full one.

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

The bar fills the width it is given, as the React build's `w-full` does, so in a `Row` it goes inside an `Expanded`.

:::

## See also

- [MPProgressCircular](./progress-circular) — the same value where there is no room for a bar.
- [MPProgressBox](./progress-box) — for work that genuinely has steps.
