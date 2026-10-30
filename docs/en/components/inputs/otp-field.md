---
title: MPOtpField
order: 5
---

# MPOtpField

<p class="mp-lede">A row of one-character slots: a PIN, a texted verification code, an invite key. One hidden value behind however many inputs.</p>

<Demo src="otp-field/hero" :minHeight="140" />

::: fw react

```tsx
import { MPOtpField } from 'material-plus-ui';

<MPOtpField label="Verification code" onComplete={(code) => verify(code)} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPOtpField(label: const Text('Verification code'), onComplete: (String code) => verify(code));
```

:::

## Props

<PropsTable name="MPOtpField" />

::: fw flutter

The field is controlled when `value` is given and keeps the code itself otherwise, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## The label is above the row, not in a notch

This is the one place the control departs from [MPTextField](./text-field)'s shell.

A notched label belongs to **one** outlined box; a code is six of them, and cutting the notch into the first would name the first digit rather than the field. Everything else is the same object: the same `corner-extra-small`, the same hairline in `outline`, the same two-pixel `primary` ring on focus.

## Examples

### length

Clamped to 2–12. A single box is an `MPTextField`, and past twelve the row stops fitting a phone.

### groupSize and separator

<Demo src="otp-field/grouping" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/otp-field/grouping.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/grouping.dart

:::

</Demo>

### charset

`numeric` is the default because that is what a texted code is, and it is also what puts a number pad in front of a phone. Anything the charset rejects is dropped rather than shown, and `onValueInvalid` reports it.

### onComplete

Fires the moment the last slot is filled — which is the moment to verify the code, rather than waiting for a submit button nobody is going to press. `autoSubmit` goes one step further and submits the [MPForm](./form) the field is in.

### errorMessage

There is no separate `error` boolean. The message is what puts the field into its error state, and it re-points every slot's outline, ink and caret at `error` together.

<Demo src="otp-field/states" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/otp-field/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/states.dart

:::

</Demo>

### size

Every rung is the control height of the same name, so a code sits at the same height as the fields above and below it in a form. The **width** is not: a slot holds one character, so it is drawn narrower than it is tall — which is what makes a row of them read as places for one character each rather than as a row of tiny fields.

The type scale goes well above the control ladder for the same reason. A verification code is read out loud off a phone and typed with the other hand; it is the one piece of text in a form that should be larger than the label above it.

<Demo src="otp-field/sizes" :minHeight="460">

::: fw react

<<< @/.vitepress/demos/otp-field/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/otp_field/sizes.dart

:::

</Demo>

## Accessibility

::: fw react

- Base UI owns the hidden value behind the slots, paste spread across them from wherever the caret was, backspace stepping back a box, a click landing on the first empty slot rather than the one under the pointer, and the autofill hook that lets a phone offer the code straight from the message.
- The separator is `aria-hidden`: the dash is punctuation inside one value, not a break between two things, and a reader that announces it once per group is reading out the shape of the box instead of the code in it.
- Focus is drawn on `:focus` rather than `:focus-visible`, because a slot is put in focus by clicking it as often as by typing into it — and the ring is the only thing saying which character the next keystroke lands on.

:::

::: fw flutter

- One editor stands behind the slots, so paste spreads across them from wherever the caret was, backspace steps back a box, and a press anywhere in the row lands after the last character rather than on the slot under the pointer. The editor asks for `AutofillHints.oneTimeCode`, which lets a phone offer the code straight from the message.
- A long press, or a right click with a mouse, opens a menu with Paste in it when the clipboard holds text: iOS's own menu where the system offers it, and Material's elsewhere. The editor is hidden behind the boxes, so there is nothing for selection handles to hold, and this is how a phone pastes a code it copied. A screen reader opens the same menu with its long-press action.
- The field is one text field node for a screen reader, holding the code itself; with `mask` it says so and reads dots.
- The separator is kept off the semantics tree: the dash is punctuation inside one value, not a break between two things, and a reader that announces it once per group is reading out the shape of the box instead of the code in it.
- The ring is drawn whenever the field has the focus, by pointer or keyboard, because a slot is put in focus by pressing it as often as by typing into it — and the ring is the only thing saying which character the next keystroke lands on.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name. `onComplete` and `onValueInvalid` keep theirs. |
| `defaultValue` | `initialValue` | Flutter's name. |
| `autoFocus` | `autofocus` | Flutter's name. |
| `separator` (a node) | `separator` (a widget) | `const Text('–')` by default, set in the slot's type. |
| `autoSubmit` (owning `<form>`) | `autoSubmit` (owning `MPForm`) | Flutter has no native form; the field submits the [MPForm](./form) around it. |
| `className`, `style` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `focusNode` | A name for a field with no visible label, and the focus from outside. |

The rest is matched deliberately: the slot sizes and type, the label above the row, the ring that does not grow the slot, the charset and the clamp on length.

:::

## See also

- [MPTextField](./text-field) — the shell this shares.
- [MPNumberField](./number-field) — for a quantity rather than a code.
