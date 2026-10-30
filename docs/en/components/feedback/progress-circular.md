---
title: MPProgressCircular
order: 7
---

# MPProgressCircular

<p class="mp-lede">A ring that fills, and the one to reach for where there is no room for a bar — inside a button, at the end of a table row, next to a field.</p>

<Demo src="progress-circular/hero" :minHeight="100" />

::: fw react

```tsx
import { MPProgressCircular } from 'material-plus-ui';

<MPProgressCircular label="Syncing" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPProgressCircular(label: Text('Syncing'));
```

:::

## Props

<PropsTable name="MPProgressCircular" />

## The value sits beside the ring, not inside it

A number in the middle of a dial is the picture everyone has of this component, and it only works at two of the five sizes: at `xs` the ring is twenty-four pixels across and there is nowhere for "40%" to go. Beside it, every size reads.

## Examples

### size

`md` is MD3's own 48dp, and every rung sits inside the control height of the same name — a 48px ring in a 56px field — so a spinner dropped into a button, a field or a table row never makes the row taller than it was.

<Demo src="progress-circular/sizes" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/progress-circular/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/progress_circular/sizes.dart

:::

</Demo>

### value

`null` — the default — turns the ring instead of filling it. A value holds it still and lets the gap close.

::: fw react

```tsx
<MPProgressCircular /> // indeterminate
<MPProgressCircular value={70} /> // seven tenths of the way round
```

:::

::: fw flutter

```dart
const MPProgressCircular(); // indeterminate
const MPProgressCircular(value: 70); // seven tenths of the way round
```

:::

### showValue and format

The same two props [MPProgressLinear](./progress-linear) takes, `showValue` and `format` (`formatValue` in Flutter), and they mean the same thing: a percentage of the range, unless the caller has said what the number means.

## Accessibility

::: fw react

- The role and the value are on the root; the ring itself is `aria-hidden`, because it is the picture of them.
- The arc is measured in percent — the circle declares `pathLength="100"` — which is what lets one animation serve all five diameters.
- Both animations stop under `prefers-reduced-motion`, resting on a partial arc rather than a closed ring.

:::

::: fw flutter

- The indicator is one merged semantics node, so the label and the shape are read together rather than as a name floating beside an unnamed indicator.
- With a value it carries the progress-bar role, its value and its range, and the value is the same string `showValue` draws: a percentage of the range unless `formatValue` says otherwise. The drawn string is not read a second time.
- With no value it is a loading spinner with no value at all, which is what tells the platform to announce indeterminate progress rather than zero.
- `hideLabel` keeps the label on the node and takes it off the screen, at no width and no height.
- The ring is painted and says nothing of its own: it is the picture of the node's value.
- With `MediaQuery.disableAnimations` both motions stop, and the ring rests on a quarter arc from twelve o'clock rather than a closed one.

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

:::

## See also

- [MPProgressLinear](./progress-linear) — where there is width to spare.
- [MPOverlay](./overlay) — the sheet this most often sits on.
