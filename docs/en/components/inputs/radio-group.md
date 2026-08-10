---
title: MPRadioGroup
order: 5
---

# MPRadioGroup

<p class="mp-lede">A set of options where exactly one is chosen. Material's 20dp ring with a 10dp fill inside it, and — the part that matters — one tab stop for the whole set, with the arrow keys moving within it.</p>

<Demo src="radio-group/hero" :minHeight="180" />

```tsx
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

const [delivery, setDelivery] = useState('standard');

<MPRadioGroup label="Delivery" value={delivery} onValueChange={setDelivery}>
  <MPRadio value="standard" label="Standard" />
  <MPRadio value="express" label="Express" />
</MPRadioGroup>;
```

## Props

<PropsTable name="MPRadioGroup" />

### MPRadio

<PropsTable name="MPRadio" />

## Why the options are children

Unlike [MPSelect](./select), whose options are an `items` array.

The difference is that a radio option is a **block**. It carries a label and a description, it is laid out down the page, and what a caller wants to vary is its content rather than just its text. A select's options are rows in a popup that has not been opened yet — which is exactly why those have to be data.

An option has no `size` and no `color` of its own, either. Both belong to the group, which is the only place they can be set once and mean the same thing for every option in the set.

## One tab stop, not five

This is the whole reason a radio group is a component rather than a `<div>` full of inputs. The ARIA pattern says the set takes **one** tab stop and the arrow keys move inside it, and Base UI owns that — including which option receives focus when the group is entered, which is the chosen one rather than the first.

Tab into the group above and press the arrow keys.

## Examples

### orientation

Vertical by default. A column is scannable at any length; a row silently stops being readable the moment one label is longer than expected — so `horizontal` is worth having, and worth asking for rather than getting by accident.

<Demo src="radio-group/orientation" :minHeight="200">

<<< @/.vitepress/demos/radio-group/orientation.tsx

</Demo>

### errorMessage

A message under the options, which also turns the group over. `description` is the same slot and is replaced by it.

Both sit **outside** the `role="radiogroup"` element, along with the label: anything inside a radio group that is not a radio is content a screen reader has to walk past to reach the next option.

### disabled

On the group it disables every option at once; on an option it disables that one and leaves the rest alone — listed but not available, which is a different statement from absent.

## Accessibility

- The label is a sibling element pointed at by `aria-labelledby` rather than a `<legend>` inside the group. Base UI documents both; only this one survives `orientation="horizontal"`, where a legend would become a flex item in the row of options and sit beside the first one instead of above it.
- Each option is named by its own label, wired by `id`.
- `readOnly` shows the choice without allowing a change, and the set stays in the tab order.

## See also

- [MPSelect](./select) — for more options than are worth showing at once.
- [MPSegmentedButton](./segmented-button) — the same question, when it is switching a view rather than filling in a form.
- [Base UI Radio](https://base-ui.com/react/components/radio) — the behaviour underneath.
