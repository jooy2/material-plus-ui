---
title: MPRadioGroup
order: 5
---

# MPRadioGroup

<p class="mp-lede">A set of options where exactly one is chosen. Material's 20dp ring with a 10dp fill inside it, and — the part that matters — one tab stop for the whole set, with the arrow keys moving within it.</p>

<Demo src="radio-group/hero" :minHeight="180" />

::: fw react

```tsx
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

const [delivery, setDelivery] = useState('standard');

<MPRadioGroup label="Delivery" value={delivery} onValueChange={setDelivery}>
  <MPRadio value="standard" label="Standard" />
  <MPRadio value="express" label="Express" />
</MPRadioGroup>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

String delivery = 'standard';

MPRadioGroup(
  label: const Text('Delivery'),
  value: delivery,
  onChanged: (String next) => setState(() => delivery = next),
  children: const <Widget>[
    MPRadio(value: 'standard', label: Text('Standard')),
    MPRadio(value: 'express', label: Text('Express')),
  ],
);
```

:::

## Props

<PropsTable name="MPRadioGroup" />

### MPRadio

<PropsTable name="MPRadio" />

## Why the options are children

Unlike [MPSelect](./select), whose options are an `items` array.

The difference is that a radio option is a **block**. It carries a label and a description, it is laid out down the page, and what a caller wants to vary is its content rather than just its text. A select's options are rows in a popup that has not been opened yet — which is exactly why those have to be data.

An option has no `size` and no `color` of its own, either. Both belong to the group, which is the only place they can be set once and mean the same thing for every option in the set.

::: fw flutter

In Flutter the options are `children` too, a `List<Widget>`. Each entry is one option: an `MPRadio`, or an `MPRadio` inside padding or alignment, which the group sees through to find its value. An option wrapped in a widget of your own is drawn and pressed like any other, but the arrow keys do not stop on it.

:::

## One tab stop, not five

This is the whole reason a radio group is a component rather than a column of separate controls. The set takes **one** tab stop and the arrow keys move inside it, including which option receives focus when the group is entered, which is the chosen one rather than the first. Base UI owns that in React; the Flutter group moves one focus node between its options.

Tab into the group above and press the arrow keys.

## The dot arrives

The dot grows out of the centre of the ring over the same 200ms the ring's own border takes to reach the accent, so both halves of "chosen" land together. It leaves the same way.

Unlike a checkbox's tick it starts at nothing rather than at 60%, and the difference is what each of them is. A tick is a stroke and has to stay legible while it arrives; a disc at any size is still a disc. See [MPCheckbox](./checkbox#the-mark-arrives).

It is half the ring at `xs`, `md` and `xl`, and 1dp over half at `sm` and `lg`. The border is 2dp and the dot is centred in what is left inside it, so an exact half leaves a gap of 2.5px or 3.5px on those two rungs — and on a 1× screen the browser rounds that outwards, which puts the dot down and to the right of the circle it is meant to be concentric with. A whole pixel of grid is worth more than a whole dp of ratio.

## Examples

### orientation

Vertical by default. A column is scannable at any length; a row silently stops being readable the moment one label is longer than expected — so `horizontal` is worth having, and worth asking for rather than getting by accident.

<Demo src="radio-group/orientation" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/radio-group/orientation.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/radio_group/orientation.dart

:::

</Demo>

### errorMessage

A message under the options, which also turns the group over. `description` is the same slot and is replaced by it.

Both sit **outside** the `role="radiogroup"` element, along with the label: anything inside a radio group that is not a radio is content a screen reader has to walk past to reach the next option.

### disabled

On the group it disables every option at once; on an option it disables that one and leaves the rest alone — listed but not available, which is a different statement from absent.

## Accessibility

::: fw react

- The label is a sibling element pointed at by `aria-labelledby` rather than a `<legend>` inside the group. Base UI documents both; only this one survives `orientation="horizontal"`, where a legend would become a flex item in the row of options and sit beside the first one instead of above it.
- Each option is named by its own label, wired by `id`.
- `readOnly` shows the choice without allowing a change, and the set stays in the tab order.

:::

::: fw flutter

- The group is a node with the radio group role, named by `label` when it is a `Text`, or by `semanticLabel`. Each option is a radio of its own, in a mutually exclusive set, named by its label.
- One focus stop for the set. The arrow keys move the choice and wrap at the ends; the left and right arrows follow the writing direction. Under directional navigation the arrows stop at the ends instead, because there they are also the way out of the set.
- `readOnly` keeps the stop and lets the arrows move it without changing the choice, so each option can still be reached and heard.
- The label, the description and the error sit outside the run of options, so a screen reader does not walk past them between two options.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultValue` | `initialValue` | `initialX` is the name Flutter gives a starting value. |
| `onValueChange` | `onChanged` | Flutter’s name for a control’s value changing. |
| `value={null}`, controlled | — | `null` is the uncontrolled case in Dart, so a controlled group with nothing chosen holds its own choice until the first one. |
| Any children | Each entry one option | The group reads each option’s value off the entry to move the choice with the arrows. |
| `aria-labelledby` label | The group node’s own label | A `Text` label is read as the group’s name. |
| `name`, `id` | — | There is no form submission or element id to be part of. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPSelect](./select) — for more options than are worth showing at once.
- [MPSegmentedButton](./segmented-button) — the same question, when it is switching a view rather than filling in a form.
- [Base UI Radio](https://base-ui.com/react/components/radio) — the behaviour underneath.
