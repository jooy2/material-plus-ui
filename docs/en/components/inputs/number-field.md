---
title: MPNumberField
order: 3
---

# MPNumberField

<p class="mp-lede">A field that only holds a number, wearing `MPTextField`'s shell to the pixel. Arrow keys and steppers move by `step`, the value clamps to `min` and `max`, and `format` writes it as currency or a percentage while the value stays a plain number.</p>

<Demo src="number-field/hero" :minHeight="72" />

```tsx
import { MPNumberField } from 'material-plus-ui';

const [quantity, setQuantity] = useState(1);

<MPNumberField label="Quantity" value={quantity} onValueChange={setQuantity} min={1} max={20} />;
```

## Props

<PropsTable name="MPNumberField" />

## Why not `<input type="number">`

The native one is worth being explicit about, because it looks like it would do.

It silently accepts text in some browsers. Its spinner cannot be styled, and in Safari there is no spinner at all. It scrubs on scroll by default, so a page scrolling under the pointer changes the value. And it reports `''` for anything it fails to parse, which means a field that is _slightly_ wrong and a field that is empty are indistinguishable to the code reading it.

This is `type="text"` with `inputmode="numeric"` and a role description, which is what Base UI's number field does — so a phone still shows the numeric keypad and a screen reader still says it is a number field, while the parsing is done against the locale rather than against whatever the browser feels like.

## Examples

### format

`format` goes straight to `Intl.NumberFormat`, so the box can say `$1,240.00` while `onValueChange` still hands over `1240`.

<Demo src="number-field/format" :minHeight="220">

<<< @/.vitepress/demos/number-field/format.tsx

</Demo>

That separation is the whole reason this is a prop rather than something a caller does to `value` on the way in: formatting on the way in means parsing on the way out, and the parsing is the part that is hard.

### steppers

Three arrangements, and no fourth.

<Demo src="number-field/steppers" :minHeight="280">

<<< @/.vitepress/demos/number-field/steppers.tsx

</Demo>

There is deliberately no stacked pair of half-height chevrons — the shape a native number input grows. At `xs` each arrow would be under three pixels tall, and a target that small is a target nobody hits.

A stepper that has run into `min` or `max` is disabled rather than merely inert, so a reader can see there is nowhere left to go before they press it. `readOnly` drops both buttons entirely: leaving them there disabled is two ways of saying the same thing, and the disabled one looks broken.

### step, largeStep and smallStep

`step` is one arrow key. Shift takes `largeStep` (10 by default) and Alt takes `smallStep` (0.1), which is Base UI's own convention and matches what a spreadsheet does.

```tsx
<MPNumberField label="Opacity" step={0.05} smallStep={0.01} min={0} max={1} />
```

### onValueCommitted

`onValueChange` fires on every change — every keystroke, every step, every notch of the wheel. `onValueCommitted` fires once the value settles: on blur after typing, on pointer release after a press, and together with `onValueChange` for the keyboard.

Use the first to keep a form in sync and the second for anything expensive.

## Accessibility

- The label sits in the outline's notch and is wired to the input by `id`, exactly as on a text field.
- Both steppers are real buttons with names — `incrementLabel` and `decrementLabel`, which are English by default and are meant to be replaced in a localised application.
- `allowWheelScrub` is **off** by default. A page that scrolls under the pointer and a field that changes under it are the same gesture, and only one of them was meant.

## See also

- [MPTextField](./text-field) — the shell this borrows.
- [MPSlider](./slider) — for a number the reader estimates rather than knows.
- [Base UI Number Field](https://base-ui.com/react/components/number-field) — the behaviour underneath.
