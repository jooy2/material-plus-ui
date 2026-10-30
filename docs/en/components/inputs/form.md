---
title: MPForm
order: 13
---

# MPForm

<p class="mp-lede">A form that knows which of its fields is wrong.</p>

<Demo src="form/hero" :minHeight="320" />

::: fw react

```tsx
import { MPForm, MPTextField, MPButton } from 'material-plus-ui';

<MPForm onSubmit={(values) => save(values)}>
  <MPTextField name="email" type="email" label="Email" required value={email} onChange={setEmail} />
  <MPButton type="submit">Save</MPButton>
</MPForm>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();

MPForm(
  key: form,
  onSubmit: (Map<String, Object?> values) => save(values),
  children: <Widget>[
    MPTextField(
      name: 'email',
      type: MPTextFieldType.email,
      label: const Text('Email'),
      required: true,
      value: email,
      onChanged: (String next) => setState(() => email = next),
    ),
    MPButton(onPressed: () => form.currentState!.submit(), child: const Text('Save')),
  ],
);
```

:::

## Props

<PropsTable name="MPForm" />

## What it adds

On its own, a page of [MPTextField](./text-field)s validates one field at a time, and a failed submit leaves the reader to go and find the red one.

What this owns is the part that has to live **above** the fields:

- A submit collects every field's validity at once, and focus lands on the first one that failed.
- `errors` puts a server's answer back on the field it belongs to.
- The children are stacked with a gap, because a form is a stack and a stack with no gap is a column of fields touching.

::: fw react

Give it `onSubmit` and the values come to you, with the native submit cancelled. Give it an `action` instead — a URL, or a React server action — and a valid submit goes there, which is also the form a page has before its JavaScript has loaded.

The pickers are fields like any other here: a required one holds the submit back while nothing is chosen, and each value comes to `onSubmit` under its `name` as one string. A date, a time and a colour arrive as their hidden inputs submit them, a range as an ISO 8601 interval such as `2026-07-01/2026-07-04`, and an `MPTreeSelect` with `multiple` as its values joined by commas.

:::

::: fw flutter

Give it `onSubmit` and the values come to you as a map, each named field's value under its `name`: a `String` from a text field or a code, a `double?` from a number field. A field with no `name` is checked but not handed over, and a disabled field is neither.

There is no submit button type in Flutter, so a submit comes from three places: `MPFormState.submit()`, reached through a `GlobalKey<MPFormState>` or `MPForm.of(context)` from a button inside the form; Enter in a single-line [MPTextField](./text-field) that has no `onSubmit` of its own, as Enter in an `<input>` submits its `<form>`; and a complete [MPOtpField](./otp-field) with `autoSubmit`. `submit()` returns whether the form was valid.

A field's own checks are the ones the React build gets from the browser that have a Flutter counterpart: an empty `required` field says "Required", in the reader's language once its messages are registered, and an incomplete required code counts as empty.

:::

That is the whole of it. No surface, no padding, no measure — those belong to an [MPCard](../layout/card) or an [MPContainer](../layout/container) around it, for the reason a container gives: the thing that decides the shape of a page should not also be the thing that submits it.

## It is not a form library

There is no schema here, no resolver and no field array.

A project that wants those keeps the one it already has and hands the result to `errors`, which is the seam this is built around — and it is a **seam** rather than an integration precisely because every one of those libraries can produce `{ [name]: message }`.

## validationMode

`onSubmit` by default, and on every change afterwards. That last half is what makes it usable: a field that failed goes back to being watched, so correcting it clears the message as the reader types rather than on a second submit.

`onBlur` and `onChange` are the two louder answers. `onChange` in particular tells somebody their email address is wrong while they are still halfway through typing it, which is why it is not the default.

## errors

<Demo src="form/errors" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/form/errors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/form/errors.dart

:::

</Demo>

Keyed by the `name` of the field each message belongs to, so it lands **on the field** rather than in a banner at the top of the page. It is cleared the moment that field changes — an error about a value nobody has any more is an error about nothing.

Every field in this library shows it. A field with its own `errorMessage` keeps that one; a field without one draws its supporting line only when it has something to say, which is exactly when a form has handed it something.

::: fw flutter

An error from `errors` does not hold the next submit back. It is the outside's answer to the last submit, and the next submit is how the outside is asked again. A new map with different messages shows them again, on fields that changed since too.

:::

## Examples

### Inside a card

::: fw react

```tsx
<MPCard title="Account">
  <MPForm onSubmit={save}>…</MPForm>
</MPCard>
```

:::

::: fw flutter

```dart
MPCard(
  title: const Text('Account'),
  child: MPForm(onSubmit: save, children: <Widget>[...]),
)
```

:::

### Grouped questions

An [MPFieldset](./fieldset) inside a form is a set of controls that answer one question together, with a name on it:

::: fw react

```tsx
<MPForm onSubmit={save}>
  <MPFieldset legend="Billing address">
    <MPTextField name="street" label="Street" … />
    <MPTextField name="city" label="City" … />
  </MPFieldset>
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
    MPFieldset(
      legend: const Text('Billing address'),
      children: <Widget>[
        MPTextField(name: 'street', label: const Text('Street'), ...),
        MPTextField(name: 'city', label: const Text('City'), ...),
      ],
    ),
    MPButton(onPressed: () => form.currentState!.submit(), child: const Text('Save')),
  ],
)
```

:::

### A server round trip

::: fw react

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

:::

::: fw flutter

```dart
Map<String, String> errors = const <String, String>{};

MPForm(
  errors: errors,
  onSubmit: (Map<String, Object?> values) async {
    final SaveResult result = await save(values);
    setState(() => errors = result.ok ? const <String, String>{} : result.errors);
  },
  children: <Widget>[...],
)
```

:::

## Accessibility

::: fw react

- It is a real `<form>`, so Enter submits from inside a field and the browser's own autofill has something to fill.
- A failed submit moves focus to the first invalid field. A reader who cannot see the page is otherwise told nothing at all happened.
- Each message is wired to its field with `aria-describedby`, which Base UI's `Field` does without anybody generating an id.
- `onSubmit` prevents the native event, so nothing navigates while the values are being handled.

:::

::: fw flutter

- Enter in a single-line field submits, as it does inside a `<form>`.
- A failed submit moves the focus to the first invalid field, in the order the fields are in the tree. A reader who cannot see the screen is otherwise told nothing at all happened.
- Each message is read with its field's name, and the field says it is invalid.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| A native `<form>` submitted by a `type="submit"` button | `MPFormState.submit()` | Flutter has no form element. Reach the state through a `GlobalKey<MPFormState>` or `MPForm.of(context)`. |
| `onSubmit(values: Record<string, unknown>)` | `onSubmit(Map<String, Object?>)` | The same map, typed as Dart types it. |
| `errors: Record<string, string \| string[]>` | `errors: Map<String, String>` | One message per field. Join a list before handing it over. |
| `action` | — | There is no URL or server action to submit to. |
| The browser's constraint validation | `required` | The browser's other checks, such as an email address's shape, have no Flutter counterpart; check them yourself and pass `errorMessage`. |
| `children` | `children` (`List<Widget>`) | Flutter's shape for a stack. |
| Native `<form>` attributes, `className` | — | There is nothing to pass them through to. |

:::

## See also

- [MPFieldset](./fieldset) — a group of controls with one name on it, for use inside a form.
- [MPTextField](./text-field) — the field this is usually a page of.
- [MPCard](../layout/card) — the sheet a form usually sits on.
