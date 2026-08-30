---
title: MPFieldset
order: 14
---

# MPFieldset

<p class="mp-lede">A group of controls that answer one question together, with a name on it.</p>

<Demo src="fieldset/hero" :minHeight="320" />

```tsx
import { MPFieldset, MPTextField } from 'material-plus-ui';

<MPFieldset legend="Billing address" description="Where the invoice goes">
  <MPTextField name="street" label="Street" value={street} onChange={setStreet} />
  <MPTextField name="city" label="City" value={city} onChange={setCity} />
</MPFieldset>;
```

## Props

<PropsTable name="MPFieldset" />

## Why it draws no surface

Because a group of fields is a **grouping** and not a sheet, and the sheet already exists.

Put this inside an [MPCard](../layout/card) or an [MPBox](../layout/box) when one is wanted. A fieldset that painted its own would be a second sheet inside the first the moment anybody did — the same argument [MPContainer](../layout/container#why-it-draws-no-surface) makes at the other end of the page.

What it owns instead is three things: the legend, the gap the controls stand at, and `disabled`.

## disabled, and why this is a real `<fieldset>`

<Demo src="fieldset/disabled" :minHeight="280">

<<< @/.vitepress/demos/fieldset/disabled.tsx

</Demo>

`disabled` on a `<fieldset>` reaches **every control inside it** — including ones a component three levels down rendered and never heard of this group.

That is not something a React context could promise. A context reaches the components that read it; a fieldset reaches the form controls, whoever rendered them and however deeply. It is the whole reason this is a component rather than a `<div>` with a heading over it.

## The legend

It becomes part of the accessible name of every control inside, which changes how it should be written: the phrase has to still read correctly in front of each of them.

> **Billing address** → "Billing address Street", "Billing address City". ✓
>
> **Where should we send it?** → "Where should we send it? Street". ✗

### Why it is not a `<legend>` element

The legend is a `<div>` pointed at by `aria-labelledby` — Base UI's decision, and the one that makes the group a normal flex container.

A real rendered `<legend>` is lifted out of its fieldset's content box by every browser, so a `gap` would put no space at all under it and the first control would sit against the name of the group. The accessible name is identical either way, which is the only part that had to survive.

## Examples

### Inside a form

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="Billing address">…</MPFieldset>
  <MPFieldset legend="Delivery address">…</MPFieldset>
  <MPButton type="submit">Save</MPButton>
</MPForm>
```

Both stack on their own rung, and the form stacks the fieldsets on its.

### A radio group is already one

[MPRadioGroup](./radio-group) has a `label` of its own and announces itself as a group, so it does not need wrapping:

```tsx
// This, not an MPFieldset around it.
<MPRadioGroup label="Delivery">…</MPRadioGroup>
```

Reach for a fieldset when the controls are **different questions that belong together** — a street, a city and a postcode — rather than one question with several answers.

## Accessibility

- The group is announced as one, with the legend as its name.
- `disabled` is the native one, so it is honoured by the browser, by form submission and by every control inside regardless of what rendered it.
- The description is inside the legend block, so it is part of the group's name rather than a separate thing to find.
- Nothing here takes a tab stop of its own.

## See also

- [MPForm](./form) — the form these usually stack inside.
- [MPRadioGroup](./radio-group) — a group that already names itself, for one question with several answers.
- [MPCard](../layout/card) — the sheet to put a fieldset on when one is wanted.
