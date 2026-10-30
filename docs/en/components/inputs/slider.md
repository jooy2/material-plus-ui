---
title: MPSlider
order: 7
---

# MPSlider

<p class="mp-lede">A value chosen along a range. The active part of the track is the accent family and the rest is `surface-container-highest`, which is Material's own pairing and the reason the inactive half reads as a groove rather than as a second value.</p>

<Demo src="slider/hero" :minHeight="80" />

::: fw react

```tsx
import { MPSlider } from 'material-plus-ui';

const [volume, setVolume] = useState(40);

<MPSlider label="Volume" showValue value={volume} onValueChange={setVolume} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

double volume = 40;

MPSlider(
  label: const Text('Volume'),
  showValue: true,
  value: <double>[volume],
  onChanged: (List<double> next) => setState(() => volume = next.first),
);
```

:::

## Props

<PropsTable name="MPSlider" />

::: fw flutter

### MPSliderMark

<PropsTable name="MPSliderMark" />

:::

::: fw flutter

The value is a `List<double>` in Flutter: one entry is a slider, two are a range. Dart has no union of a number and a list, and the list is the one shape that does not change type when a second handle arrives, so a single slider is written `value: <double>[40]`. Controlled with `value` and `onChanged`, or left to hold its own from `initialValue`.

:::

## Examples

### A range is an array

There is no `range` prop. An array in `value` or `defaultValue` is what makes it a range slider, with one handle per entry — because the shape of the value already says which one this is, and a boolean that had to agree with it would be one more thing to get wrong.

<Demo src="slider/range" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/slider/range.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/slider/range.dart

:::

</Demo>

Base UI stops the handles crossing each other, so the array stays sorted.

### showValue

Off by default, and worth turning on for anything with units. A slider with no readout is a control whose value can only be estimated — which is fine for a volume dial and wrong for a price filter.

::: fw react

`format` goes to `Intl.NumberFormat`, so the readout can be a currency or a percentage without the value stopping being a number.

:::

::: fw flutter

`format` is a function from one number to the words for it, so the readout can be a currency or a percentage without the value stopping being a number. Flutter has no `Intl` without a package, and this library takes none. A range is written as the two numbers joined by an en dash.

:::

### onValueChange and onValueCommitted

`onValueChange` fires throughout the drag; `onValueCommitted` fires once, when it ends. Anything expensive — a request, a re-render of a large list — belongs in the second.

::: fw react

```tsx
<MPSlider
  label="Price"
  defaultValue={[20, 80]}
  onValueChange={setPreview}
  onValueCommitted={search}
/>
```

:::

::: fw flutter

```dart
MPSlider(
  label: const Text('Price'),
  initialValue: const <double>[20, 80],
  onChanged: setPreview,
  onValueCommitted: search,
);
```

:::

### orientation

A vertical slider has no length of its own, so give it a height. The default is a starting point rather than a rule.

::: fw flutter

In Flutter a vertical slider is 160px long, the React default, and runs bottom to top. A horizontal one fills the width it is given, and 240px inside something that gives it no width, such as a `Row`.

:::

### marks

The ticks on the track, and optionally what is written under them.

`marks` on its own puts one at every `step`, which is MD3's discrete slider:

::: fw react

```tsx
<MPSlider min={0} max={100} step={25} marks aria-label="Quality" />
```

:::

::: fw flutter

```dart
const MPSlider(
  max: 100,
  step: 25,
  marks: MPSliderMarks.everyStep(),
  semanticLabel: 'Quality',
);
```

:::

An array names them instead, and is the form that can carry labels:

::: fw react

```tsx
<MPSlider
  min={1990}
  max={2030}
  marks={[
    { value: 1990, label: '1990' },
    { value: 2010, label: '2010' },
    { value: 2030, label: '2030' }
  ]}
  aria-label="Year"
/>
```

:::

::: fw flutter

```dart
const MPSlider(
  min: 1990,
  max: 2030,
  marks: MPSliderMarks(<MPSliderMark>[
    MPSliderMark(value: 1990, label: Text('1990')),
    MPSliderMark(value: 2010, label: Text('2010')),
    MPSliderMark(value: 2030, label: Text('2030')),
  ]),
  semanticLabel: 'Year',
);
```

:::

A tick over the filled part of the track is drawn in the accent's own ink and one over the groove in `on-surface-variant`, which is the specification's pairing and the reason a tick stays visible as the handle passes it.

Three things worth knowing before reaching for it. The boolean form draws nothing past **fifty** ticks — at that point they stop being ticks and become a dotted line, out of one DOM node each, saying less than no ticks would; the array form is how you say which ones matter. A mark outside `min`…`max` is dropped rather than clamped, because two of them pinned to the same end read as one. And labels are laid out from each tick's centre and are not measured, so two that would collide will overlap — fewer entries is the answer, not a smaller type scale.

The ticks are `aria-hidden`: they are a picture of `step`, and a screen reader is already told the step by the range attributes on the thumb. Announcing fifty dots would be reading the ruler out.

## The handle is a circle, not a bar

Material's 2025 revision draws the handle as a tall thin bar with a gap either side of it. This is the earlier one, deliberately.

The gap has to be punched out of the track with a colour that matches whatever the slider is sitting on, and a component library does not know what that is. A handle that assumes the page is `surface` leaves a pale notch in the track on every screen that is not — a card, a dialog, a coloured panel. The circle has no such dependency.

## The handle travels, except while you are holding it

A slider moves in two quite different ways, and only one of them wants a transition.

An arrow key, <kbd>Page Up</kbd> or a click on the track is a **jump**, and the handle goes there over 100ms rather than appearing there — the same thing a tab indicator does when a tab is chosen with the keyboard.

A drag is the handle being **held**, and a transition there would leave it trailing the pointer by its own duration: the reader would be pushing a spring. So it is switched off for as long as the control is being dragged.

100ms rather than the 200ms the rest of the library settles on, because an arrow key held down repeats faster than 200ms — a handle on the longer duration would never finish one step before the next began.

## Accessibility

::: fw react

- Each handle is a real `<input type="range">`, so the range is the native `min` and `max` — an assistive technology reads the same numbers a form does.
- Pass `aria-label` when there is no visible `label`. With one, Base UI wires the name for you.
- The pressable strip is much taller than the rail. Base UI moves the value to wherever the control is pressed, so the target has to be as tall as a finger rather than as tall as a 4px line.

:::

::: fw flutter

- Each handle is a slider node with its value, the value one step up and one step down, and the two actions a screen reader adjusts a slider with. A range is two such nodes, so either end can be moved on its own.
- The name comes from `label` when it is a `Text`, or from `semanticLabel`. A `description` that is a `Text` is read on the handle as its hint.
- The arrow keys step, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> take ten, <kbd>Home</kbd> and <kbd>End</kbd> go to the ends. Left and right follow the writing direction; up is always more.
- The pressable strip is much taller than the rail, and a press anywhere on it moves the nearest handle there. The halo lights at 10% when a keyboard reaches a handle and at 16% while one is dragged.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `number \| number[]` | `List<double>` | Dart has no union type, and a list keeps one shape for both. |
| `defaultValue` | `initialValue` | `initialX` is the name Flutter gives a starting value. |
| `onValueChange` | `onChanged` | Flutter’s name for a control’s value changing. |
| `marks: true \| []` | `MPSliderMarks.everyStep()`, `MPSliderMarks([...])` | Two constructors in place of a union. |
| `format: Intl.NumberFormatOptions` | `format: String Function(double)` | No `Intl` without a package; a function says the same thing. |
| `locale` | — | It only reached `Intl.NumberFormat`; `format` is where the language goes. |
| `aria-label` | `semanticLabel` | Flutter’s name. |
| `name`, a hidden input | — | There is no form submission to be part of. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPNumberField](./number-field) — for a number the reader knows rather than estimates.
- [Base UI Slider](https://base-ui.com/react/components/slider) — the behaviour underneath.
