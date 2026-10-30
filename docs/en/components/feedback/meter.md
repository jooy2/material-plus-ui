---
title: MPMeter
order: 14
---

# MPMeter

<p class="mp-lede">How much of something there is, on a scale known in advance — disk used, seats taken, quota spent, a password's strength. It looks like a progress bar and means something else.</p>

<Demo src="meter/hero" :minHeight="200" />

::: fw react

```tsx
import { MPMeter } from 'material-plus-ui';

<MPMeter value={41} max={60} label="Seats taken" showValue />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPMeter(value: 41, max: 60, label: const Text('Seats taken'), showValue: true);
```

:::

## Props

<PropsTable name="MPMeter" />

## It is not a progress bar

A progress bar is about **time**. Something is happening, this is how far it has got, it may have no value at all yet, and it is expected to move on its own.

A meter is about **quantity**. The number is already known, it does not move unless the thing it measures does, and it is meaningful to say the reading is bad — which is what `thresholds` is for and what a progress bar has no use for. A disk that is 94% full is not 94% finished.

::: fw react

The two carry different ARIA roles for that reason, so a screen reader announces a meter as a measurement rather than as something in progress. Picking the wrong one is not a styling mistake; it is a claim about what the number means.

:::

::: fw flutter

The two say different things to a screen reader for that reason. Flutter has no meter role, so a meter is one named node carrying its value and nothing more, while a progress bar claims the progress-bar role. Claiming that role here would announce the one thing a meter is not. Picking the wrong one is not a styling mistake; it is a claim about what the number means.

:::

That is also why `value` is required here and optional on [MPProgressLinear](./progress-linear). There is no indeterminate meter: a quantity nobody knows is not a quantity to draw.

## `thresholds` names roles, not colours

::: fw react

```tsx
<MPMeter
  value={94}
  label="Quota spent"
  thresholds={[
    { from: 60, color: 'tertiary' },
    { from: 85, color: 'error' }
  ]}
/>
```

:::

::: fw flutter

```dart
const MPMeter(
  value: 94,
  label: Text('Quota spent'),
  thresholds: <MPThreshold>[
    MPThreshold(from: 60, color: MPColor.tertiary),
    MPThreshold(from: 85, color: MPColor.error),
  ],
);
```

:::

`from` is a value on the meter's own scale, not a percentage — so a meter that runs 0–5 GB takes bands at `3` and `4.5`.

The families are MD3's four, and none of them is called `warning`. An amber band is `tertiary` under whatever source colour the page is themed from, which is the honest answer rather than a limitation: a threshold that named a colour would be a colour that ignores the theme, on the one component whose whole point is to be read at a glance.

The last threshold the value has reached wins, so they are listed smallest first — and the list is read in the order it was given rather than sorted, so a call site that listed them the wrong way round shows it.

## `format` matters more here

Without it the value reads as a share of the range, which is the only honest formatting for a range nobody described. But a meter usually has real units — 41 of 60 seats, 2.1 GB of 5, £340 of a £500 budget — and that is what the reader came for:

::: fw react

```tsx
<MPMeter value={2.1} max={5} showValue format={{ style: 'unit', unit: 'gigabyte' }} />
```

It takes `Intl.NumberFormat` options, so bytes, currencies and plain counts all work, in whatever locale the platform is set to.

:::

::: fw flutter

```dart
MPMeter(
  value: 2.1,
  max: 5,
  showValue: true,
  formatValue: (double value) => '${value.toStringAsFixed(1)} GB',
);
```

`formatValue` is a function from the value to the words, handed the value as it is. Whatever formats numbers in the app already, `package:intl`'s `NumberFormat` or a function of your own, can format this one, and a screen reader hears the same string.

:::

## The reading travels

A value that changed moves the fill there rather than jumping, and a value that crossed a threshold changes family over the same short duration. Both stop under `prefers-reduced-motion`, or `MediaQuery.disableAnimations` in Flutter, where the new reading simply appears.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `role="meter"` | a named node with a value, and no role | Flutter has no meter role, and the progress-bar role would say the wrong thing. |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(double)` | There is no `Intl.NumberFormat` in the framework, and pulling `package:intl` in to provide one would be a dependency decision made on the consumer's behalf. |
| `locale` | — | It only told `Intl` which language to write the number in; `formatValue` writes it in whatever language it likes. |
| `label: ReactNode`, `value: number` | `label: Widget?`, `value: double` | Dart's names for the same things. |
| `className`, `style`, native attributes | — | There is nothing to pass them through to. |

A meter fills the width it is given, as the React build's `w-full` does, so in a `Row` it goes inside an `Expanded`.

:::
