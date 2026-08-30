---
title: MPForm
order: 13
---

# MPForm

<p class="mp-lede">A <code>&lt;form&gt;</code> that knows which of its fields is wrong.</p>

<Demo src="form/hero" :minHeight="320" />

```tsx
import { MPForm, MPTextField, MPButton } from 'material-plus-ui';

<MPForm onSubmit={(values) => save(values)}>
  <MPTextField name="email" type="email" label="Email" required value={email} onChange={setEmail} />
  <MPButton type="submit">Save</MPButton>
</MPForm>;
```

## Props

<PropsTable name="MPForm" />

## What it adds

On its own, a page of [MPTextField](./text-field)s validates one field at a time, and a failed submit leaves the reader to go and find the red one.

What this owns is the part that has to live **above** the fields:

- A submit collects every field's validity at once, and focus lands on the first one that failed.
- `errors` puts a server's answer back on the field it belongs to.
- The children are stacked with a gap, because a form is a stack and a stack with no gap is a column of fields touching.

That is the whole of it. No surface, no padding, no measure — those belong to an [MPCard](../layout/card) or an [MPContainer](../layout/container) around it, for the reason a container gives: the thing that decides the shape of a page should not also be the thing that submits it.

## It is not a form library

There is no schema here, no resolver and no field array.

A project that wants those keeps the one it already has and hands the result to `errors`, which is the seam this is built around — and it is a **seam** rather than an integration precisely because every one of those libraries can produce `{ [name]: message }`.

## validationMode

`onSubmit` by default, and on every change afterwards. That last half is what makes it usable: a field that failed goes back to being watched, so correcting it clears the message as the reader types rather than on a second submit.

`onBlur` and `onChange` are the two louder answers. `onChange` in particular tells somebody their email address is wrong while they are still halfway through typing it, which is why it is not the default.

## errors

<Demo src="form/errors" :minHeight="260">

<<< @/.vitepress/demos/form/errors.tsx

</Demo>

Keyed by the `name` of the field each message belongs to, so it lands **on the field** rather than in a banner at the top of the page. It is cleared the moment that field changes — an error about a value nobody has any more is an error about nothing.

Every field in this library shows it. A field with its own `errorMessage` keeps that one; a field without one draws its supporting line only when it has something to say, which is exactly when a form has handed it something.

## Examples

### Inside a card

```tsx
<MPCard title="Account">
  <MPForm onSubmit={save}>…</MPForm>
</MPCard>
```

### Grouped questions

An [MPFieldset](./fieldset) inside a form is a set of controls that answer one question together, with a name on it:

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="Billing address">
    <MPTextField name="street" label="Street" … />
    <MPTextField name="city" label="City" … />
  </MPFieldset>
  <MPButton type="submit">Save</MPButton>
</MPForm>
```

### A server round trip

```tsx
const [errors, setErrors] = useState({});

<MPForm
  errors={errors}
  onSubmit={async (values) => {
    const result = await save(values);
    setErrors(result.ok ? {} : result.errors);
  }}
>
  …
</MPForm>;
```

## Accessibility

- It is a real `<form>`, so Enter submits from inside a field and the browser's own autofill has something to fill.
- A failed submit moves focus to the first invalid field. A reader who cannot see the page is otherwise told nothing at all happened.
- Each message is wired to its field with `aria-describedby`, which Base UI's `Field` does without anybody generating an id.
- `onSubmit` prevents the native event, so nothing navigates while the values are being handled.

## See also

- [MPFieldset](./fieldset) — a group of controls with one name on it, for use inside a form.
- [MPTextField](./text-field) — the field this is usually a page of.
- [MPCard](../layout/card) — the sheet a form usually sits on.
