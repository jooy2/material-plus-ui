---
title: MPSelect
order: 2
---

# MPSelect

<p class="mp-lede">One value chosen from a list. The trigger is `MPTextField`'s shell wearing a chevron — the same notched outline, the same label in the notch, the same supporting text — so a dropdown in a form is the same object as the fields around it.</p>

<Demo src="select/hero" :minHeight="72" />

```tsx
import { MPSelect } from 'material-plus-ui';

const [city, setCity] = useState(null);

<MPSelect
  label="City"
  items={[
    { value: 'kr-11', label: 'Seoul' },
    { value: 'jp-13', label: 'Tokyo' }
  ]}
  value={city}
  onValueChange={setCity}
/>;
```

## Props

<PropsTable name="MPSelect" />

## Why the options are data

There is no `<MPSelect.Option>` to compose, and that is not a shortcut.

The list has to be available to the **trigger**, before the popup has ever been mounted — otherwise a closed select can only show its raw value, and a field whose job is to say "Seoul" would sit there saying `kr-11`. Composed children cannot do that: they do not exist until the popup opens.

It also happens to be what a caller already has. Options come out of an API or a constant far more often than they are written by hand.

## What a value may be

A `string` or a `number`, deliberately — not an arbitrary object.

A select is a form control, its value is what a form submits, and every escape from that (object values, a custom equality, a stringifier for the trigger) buys flexibility by making the common case harder to write. Keep the identifier here and look the object up on the other side.

## Examples

### errorMessage

There is no separate `error` boolean. A message is what puts the select into its error state, so there is no way to render a control that is visibly wrong with no explanation of why.

<Demo src="select/states" :minHeight="300">

<<< @/.vitepress/demos/select/states.tsx

</Demo>

`description` is the same slot, and `errorMessage` replaces it rather than stacking under it — Material gives supporting text one line, and pushing the description down to make room leaves the reader reading a sentence that has just stopped applying.

### disabled options

An option can be listed without being available:

```tsx
items={[
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team', disabled: true }
]}
```

Listed rather than removed, on purpose: "this exists but not for you" and "this does not exist" are different things, and only one of them explains why a plan a colleague mentioned is not there.

### floatingLabel

While nothing is chosen and the popup is shut, the label rests on the trigger's own line where the placeholder would be, and rises into the notch on focus or on the first choice. The `placeholder` is withheld until it has — two greyed strings in one box is not a hint. See [MPTextField](./text-field#floatinglabel) for the rule in full.

The open popup counts as focus. Base UI moves the focus into the list, so a label that only watched the trigger would fall back down over a select the reader is halfway through answering.

`floatingLabel={false}` pins the label in the notch, and a `startIcon` holds it up regardless — the glyph is already standing where a resting label would be.

### size

Five rungs, the same ones a text field is drawn at. A select beside a field at the same `size` lines up to the pixel, which is the whole reason the shell is shared.

<Demo src="select/sizes" :minHeight="440">

<<< @/.vitepress/demos/select/sizes.tsx

</Demo>

## The popup

`surface-container` at elevation 2 — the one surface in this library that genuinely floats, and the only one that carries a shadow by default.

A chosen row is marked with a **tick** as well as a fill, because a highlight is also what the keyboard's cursor looks like: a list where "selected" and "where the arrow keys are" are the same colour is a list you cannot read. The tick's column is reserved on every row, so the labels do not shift sideways as the selection moves down the list.

It fades, on the same 200ms and the same curve as every other popup in the library — the menu, the popover, the combobox's list, the dialog. Opacity and nothing else: a list that slid or scaled would move the row the pointer was already reaching for.

## Accessibility

- The trigger is named by the label in the notch, wired by `id`.
- Base UI owns the popup's positioning and flipping, the focus trap, typeahead, and the hidden input that makes the whole thing submit with a form.
- `readOnly` shows the value without allowing a change and stays in the tab order; `disabled` does neither.

## See also

- [MPTextField](./text-field) — the shell this borrows.
- [MPRadioGroup](./radio-group) — for a handful of options that are worth showing all at once.
- [Base UI Select](https://base-ui.com/react/components/select) — the behaviour underneath.
