---
title: MPNumberField
order: 3
---

# MPNumberField

<p class="mp-lede">A field that only holds a number, wearing `MPTextField`'s shell to the pixel. Arrow keys and steppers move by `step`, the value clamps to `min` and `max`, and `format` writes it as currency or a percentage while the value stays a plain number.</p>

<Demo src="number-field/hero" :minHeight="72" />

::: fw react

```tsx
import { MPNumberField } from 'material-plus-ui';

const [quantity, setQuantity] = useState(1);

<MPNumberField label="Quantity" value={quantity} onValueChange={setQuantity} min={1} max={20} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPNumberField(
  label: const Text('Quantity'),
  value: quantity,
  onChanged: (double? next) => setState(() => quantity = next),
  min: 1,
  max: 20,
);
```

:::

## Props

<PropsTable name="MPNumberField" />

::: fw flutter

The field is controlled when `value` is given, `null` included, which is an empty field. Leave `value` out and the field keeps its own number, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

::: fw react

## Why not `<input type="number">`

The native one is worth being explicit about, because it looks like it would do.

It silently accepts text in some browsers. Its spinner cannot be styled, and in Safari there is no spinner at all. It scrubs on scroll by default, so a page scrolling under the pointer changes the value. And it reports `''` for anything it fails to parse, which means a field that is _slightly_ wrong and a field that is empty are indistinguishable to the code reading it.

This is `type="text"` with `inputmode="numeric"` and a role description, which is what Base UI's number field does — so a phone still shows the numeric keypad and a screen reader still says it is a number field, while the parsing is done against the locale rather than against whatever the browser feels like.

:::

::: fw flutter

## What is under it

A text field with the numeric keyboard, and the number kept apart from the text. A lone `-` on the way to `-5` is text that does not parse yet, not a number, so the field reports `null` while it is there and settles the box when the field is left. Everything a number field adds — the steps, the clamp, the formatting — is the field's own work, so it behaves the same on every platform.

:::

## Examples

### format

::: fw react

`format` goes straight to `Intl.NumberFormat`, so the box can say `$1,240.00` while `onValueChange` still hands over `1240`.

:::

::: fw flutter

`format` is a function from the number to the text in the box, so the box can say `$1,240.00` while `onChanged` still hands over `1240`. `parse` is the other half, from typed text back to a number. Left out, it drops everything but digits, a sign and a decimal point, which is enough to read back a currency or a unit; a percentage needs its own, since `15%` is `0.15`.

:::

<Demo src="number-field/format" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/number-field/format.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/number_field/format.dart

:::

</Demo>

That separation is the whole reason this is a parameter rather than something a caller does to `value` on the way in: formatting on the way in means parsing on the way out, and the parsing is the part that is hard.

### steppers

Three arrangements, and no fourth.

<Demo src="number-field/steppers" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/number-field/steppers.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/number_field/steppers.dart

:::

</Demo>

There is deliberately no stacked pair of half-height chevrons — the shape a native number input grows. At `xs` each arrow would be under three pixels tall, and a target that small is a target nobody hits.

A stepper that has run into `min` or `max` is disabled rather than merely inert, so a reader can see there is nowhere left to go before they press it. `readOnly` drops both buttons entirely: leaving them there disabled is two ways of saying the same thing, and the disabled one looks broken. A held stepper repeats after a short pause.

### floatingLabel

While the field holds no number and is unfocused, the label rests on the field's own line and rises into the notch on focus or on the first digit. See [MPTextField](./text-field#floatinglabel) for the rule in full.

::: fw react

`steppers="split"` pins it in the notch, for the same reason a `startIcon` does: the minus sits exactly where a resting label would.

:::

::: fw flutter

`steppers: MPNumberFieldSteppers.split` pins it in the notch, for the same reason a `startIcon` does: the minus sits exactly where a resting label would.

:::

### step, largeStep and smallStep

`step` is one arrow key. Shift takes `largeStep` (10 by default) and Alt takes `smallStep` (0.1), which is Base UI's own convention and matches what a spreadsheet does. Page Up and Page Down take `largeStep` too, and Home and End go to `min` and `max` when the range has them.

::: fw react

```tsx
<MPNumberField label="Opacity" step={0.05} smallStep={0.01} min={0} max={1} />
```

:::

::: fw flutter

```dart
MPNumberField(label: const Text('Opacity'), step: 0.05, smallStep: 0.01, min: 0, max: 1)
```

:::

### onValueCommitted

::: fw react

`onValueChange` fires on every change — every keystroke, every step, every notch of the wheel. `onValueCommitted` fires once the value settles: on blur after typing, on pointer release after a press, and together with `onValueChange` for the keyboard.

:::

::: fw flutter

`onChanged` fires on every change — every keystroke, every step, every notch of the wheel. `onValueCommitted` fires once the value settles: on blur or Enter after typing, on pointer release after a press, and together with `onChanged` for the keyboard.

:::

Use the first to keep a form in sync and the second for anything expensive.

## Accessibility

::: fw react

- The label sits in the outline's notch and is wired to the input by `id`, exactly as on a text field.
- Both steppers are real buttons with names — `incrementLabel` and `decrementLabel`, which are English by default and are meant to be replaced in a localised application.
- `allowWheelScrub` is **off** by default. A page that scrolls under the pointer and a field that changes under it are the same gesture, and only one of them was meant.

:::

::: fw flutter

- The field is one text field node for a screen reader, named by its label, exactly as a text field is.
- Both steppers are buttons with names — `incrementLabel` and `decrementLabel`, which default to the words in `locale`. They are not Tab stops: the arrow keys that step the number belong to the field, so a stop on each stepper is two more presses on the way past it.
- `allowWheelScrub` is **off** by default. A page that scrolls under the pointer and a field that changes under it are the same gesture, and only one of them was meant.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onValueCommitted` keeps its name. |
| `defaultValue` | `initialValue` | Flutter's name. Left out, `value` is a marker that is not a number, which is what makes the field uncontrolled; `value: null` is a controlled empty field. |
| `format` (`Intl.NumberFormatOptions`) | `format` and `parse` (functions) | The Dart SDK has no `Intl.NumberFormat` and this package has no dependencies, so the writing and the reading are yours. |
| `locale` (`Intl.LocalesArgument`) | `locale` (`String?`) | It names the steppers' language only. How the number is written is `format`'s. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | One callback, returning a `KeyEventResult`. |
| `onFocus`, `onBlur` | `onFocusChange` | One callback with a `bool`. The settle a blur causes still happens. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | Wrap the field in a `GestureDetector` for the pointer. |
| `id`, `className`, `style` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `focusNode`, `autofocus` | A name for a field with no visible label, and the focus from outside. |

The rest is matched deliberately: the shell, the three stepper arrangements, the clamp on settle, the keys, the hold-to-repeat and the wheel that stays off until asked.

:::

## See also

- [MPTextField](./text-field) — the shell this borrows.
- [MPSlider](./slider) — for a number the reader estimates rather than knows.

::: fw react

- [Base UI Number Field](https://base-ui.com/react/components/number-field) — the behaviour underneath.

:::
