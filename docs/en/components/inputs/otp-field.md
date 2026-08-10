---
title: MPOtpField
order: 5
---

# MPOtpField

<p class="mp-lede">A row of one-character slots: a PIN, a texted verification code, an invite key. One hidden value behind however many inputs.</p>

<Demo src="otp-field/hero" :minHeight="140" />

```tsx
import { MPOtpField } from 'material-plus-ui';

<MPOtpField label="Verification code" onComplete={(code) => verify(code)} />;
```

## Props

<PropsTable name="MPOtpField" />

## The label is above the row, not in a notch

This is the one place the control departs from [MPTextField](./text-field)'s shell.

A notched label belongs to **one** outlined box; a code is six of them, and cutting the notch into the first would name the first digit rather than the field. Everything else is the same object: the same `corner-extra-small`, the same hairline in `outline`, the same two-pixel `primary` ring on focus.

## Examples

### length

Clamped to 2–12. A single box is an `MPTextField`, and past twelve the row stops fitting a phone.

### groupSize and separator

<Demo src="otp-field/grouping" :minHeight="260">

<<< @/.vitepress/demos/otp-field/grouping.tsx

</Demo>

### charset

`numeric` is the default because that is what a texted code is, and it is also what puts a number pad in front of a phone. Anything the charset rejects is dropped rather than shown, and `onValueInvalid` reports it.

### onComplete

Fires the moment the last slot is filled — which is the moment to verify the code, rather than waiting for a submit button nobody is going to press.

### errorMessage

There is no separate `error` boolean. The message is what puts the field into its error state, and it re-points every slot's outline, ink and caret at `error` together.

<Demo src="otp-field/states" :minHeight="300">

<<< @/.vitepress/demos/otp-field/states.tsx

</Demo>

### size

Every rung is the control height of the same name, so a code sits at the same height as the fields above and below it in a form. The **width** is not: a slot holds one character, so it is drawn narrower than it is tall — which is what makes a row of them read as places for one character each rather than as a row of tiny fields.

The type scale goes well above the control ladder for the same reason. A verification code is read out loud off a phone and typed with the other hand; it is the one piece of text in a form that should be larger than the label above it.

<Demo src="otp-field/sizes" :minHeight="460">

<<< @/.vitepress/demos/otp-field/sizes.tsx

</Demo>

## Accessibility

- Base UI owns the hidden value behind the slots, paste spread across them from wherever the caret was, backspace stepping back a box, a click landing on the first empty slot rather than the one under the pointer, and the autofill hook that lets a phone offer the code straight from the message.
- The separator is `aria-hidden`: the dash is punctuation inside one value, not a break between two things, and a reader that announces it once per group is reading out the shape of the box instead of the code in it.
- Focus is drawn on `:focus` rather than `:focus-visible`, because a slot is put in focus by clicking it as often as by typing into it — and the ring is the only thing saying which character the next keystroke lands on.

## See also

- [MPTextField](./text-field) — the shell this shares.
- [MPNumberField](./number-field) — for a quantity rather than a code.
