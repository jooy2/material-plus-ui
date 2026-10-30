---
title: MPFieldset
order: 14
---

# MPFieldset

<p class="mp-lede">A group of controls that answer one question together, with a name on it.</p>

<Demo src="fieldset/hero" :minHeight="320" />

::: fw react

```tsx
import { MPFieldset, MPTextField } from 'material-plus-ui';

<MPFieldset legend="Billing address" description="Where the invoice goes">
  <MPTextField name="street" label="Street" value={street} onChange={setStreet} />
  <MPTextField name="city" label="City" value={city} onChange={setCity} />
</MPFieldset>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPFieldset(
  legend: const Text('Billing address'),
  description: const Text('Where the invoice goes'),
  children: <Widget>[
    MPTextField(name: 'street', label: const Text('Street'), value: street, onChanged: setStreet),
    MPTextField(name: 'city', label: const Text('City'), value: city, onChanged: setCity),
  ],
);
```

:::

## Props

<PropsTable name="MPFieldset" />

## Why it draws no surface

Because a group of fields is a **grouping** and not a sheet, and the sheet already exists.

Put this inside an [MPCard](../layout/card) or an [MPBox](../layout/box) when one is wanted. A fieldset that painted its own would be a second sheet inside the first the moment anybody did — the same argument [MPContainer](../layout/container#why-it-draws-no-surface) makes at the other end of the page.

What it owns instead is three things: the legend, the gap the controls stand at, and `disabled`.

::: fw react

## disabled, and why this is a real `<fieldset>`

:::

::: fw flutter

## disabled

:::

<Demo src="fieldset/disabled" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/fieldset/disabled.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/fieldset/disabled.dart

:::

</Demo>

::: fw react

`disabled` on a `<fieldset>` reaches **every control inside it** — including ones a component three levels down rendered and never heard of this group.

That is not something a React context could promise. A context reaches the components that read it; a fieldset reaches the form controls, whoever rendered them and however deeply. It is the whole reason this is a component rather than a `<div>` with a heading over it.

:::

::: fw flutter

`disabled` reaches **every control inside it** — including ones a widget three levels down drew and never heard of this group. The group takes the pointer and the focus away from everything in it, so nothing inside answers a press or takes a Tab stop. Every control of this package in it also draws itself disabled and says so to a screen reader, as it does with a `disabled` of its own; a widget from elsewhere is left drawn as it is, but cannot be pressed or focused.

Turning `disabled` off and on again keeps what was typed: the fields are not built again.

:::

## The legend

::: fw react

It becomes part of the accessible name of every control inside, which changes how it should be written: the phrase has to still read correctly in front of each of them.

:::

::: fw flutter

It is read as the first thing in the group, before each control a reader reaches inside it, which changes how it should be written: the phrase has to still read correctly in front of each of them.

:::

> **Billing address** → "Billing address Street", "Billing address City". ✓
>
> **Where should we send it?** → "Where should we send it? Street". ✗

::: fw react

### Why it is not a `<legend>` element

The legend is a `<div>` pointed at by `aria-labelledby` — Base UI's decision, and the one that makes the group a normal flex container.

A real rendered `<legend>` is lifted out of its fieldset's content box by every browser, so a `gap` would put no space at all under it and the first control would sit against the name of the group. The accessible name is identical either way, which is the only part that had to survive.

:::

## Examples

### Inside a form

::: fw react

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="Billing address">…</MPFieldset>
  <MPFieldset legend="Delivery address">…</MPFieldset>
  <MPButton type="submit">Save</MPButton>
</MPForm>
```

:::

::: fw flutter

```dart
MPForm(
  key: form,
  onSubmit: save,
  children: <Widget>[
    MPFieldset(legend: const Text('Billing address'), children: <Widget>[...]),
    MPFieldset(legend: const Text('Delivery address'), children: <Widget>[...]),
    MPButton(onPressed: () => form.currentState!.submit(), child: const Text('Save')),
  ],
)
```

:::

Both stack on their own rung, and the form stacks the fieldsets on its.

### A radio group is already one

[MPRadioGroup](./radio-group) has a `label` of its own and announces itself as a group, so it does not need wrapping:

::: fw react

```tsx
// This, not an MPFieldset around it.
<MPRadioGroup label="Delivery">…</MPRadioGroup>
```

:::

Reach for a fieldset when the controls are **different questions that belong together** — a street, a city and a postcode — rather than one question with several answers.

## Accessibility

::: fw react

- The group is announced as one, with the legend as its name.
- `disabled` is the native one, so it is honoured by the browser, by form submission and by every control inside regardless of what rendered it.
- The description is inside the legend block, so it is part of the group's name rather than a separate thing to find.
- Nothing here takes a tab stop of its own.

:::

::: fw flutter

- The group is a semantics node of its own, and the legend and the description are read first in it.
- A disabled group takes the focus and the pointer from everything in it, and every field of this package in it is announced as unavailable. A disabled field is also left out of an [MPForm](./form)'s checks and values.
- Nothing here takes a Tab stop of its own.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `legend`, `description` (nodes) | `legend`, `description` (widgets) | Usually a `Text`. |
| `children` | `children` (`List<Widget>`) | Flutter's shape for a stack. |
| A native `<fieldset disabled>` | A scope the controls read, with the focus and the pointer taken away | Flutter has no element that disables what is inside it. The effect a reader gets is the same. |
| Native `<fieldset>` attributes, `className` | — | There is nothing to pass them through to. |

:::

## See also

- [MPForm](./form) — the form these usually stack inside.
- [MPRadioGroup](./radio-group) — a group that already names itself, for one question with several answers.
- [MPCard](../layout/card) — the sheet to put a fieldset on when one is wanted.
