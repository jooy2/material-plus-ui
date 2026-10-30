---
title: MPSelect
order: 2
---

# MPSelect

<p class="mp-lede">One value chosen from a list. The trigger is `MPTextField`'s shell wearing a chevron — the same notched outline, the same label in the notch, the same supporting text — so a dropdown in a form is the same object as the fields around it.</p>

<Demo src="select/hero" :minHeight="72" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPSelectValue? city;

MPSelect(
  label: const Text('City'),
  items: const <MPSelectOption>[
    MPSelectOption(value: 'kr-11', label: Text('Seoul')),
    MPSelectOption(value: 'jp-13', label: Text('Tokyo')),
  ],
  value: city,
  onChanged: (MPSelectValue? next) => setState(() => city = next),
);
```

:::

## Props

<PropsTable name="MPSelect" />

::: fw flutter

The select is controlled when `value` is given, `null` included, which is nothing chosen. Leave `value` out and the select keeps its own choice, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## Why the options are data

::: fw react

There is no `<MPSelect.Option>` to compose, and that is not a shortcut.

The list has to be available to the **trigger**, before the popup has ever been mounted — otherwise a closed select can only show its raw value, and a field whose job is to say "Seoul" would sit there saying `kr-11`. Composed children cannot do that: they do not exist until the popup opens.

:::

::: fw flutter

There is no option widget to compose, and that is not a shortcut.

The list has to be available to the **trigger**, before the popup has ever been built — otherwise a closed select can only show its raw value, and a field whose job is to say "Seoul" would sit there saying `kr-11`. Child widgets cannot do that: the rows are not built until the popup opens.

:::

It also happens to be what a caller already has. Options come out of an API or a constant far more often than they are written by hand.

## What a value may be

::: fw react

A `string` or a `number`, deliberately — not an arbitrary object.

:::

::: fw flutter

A `String` or a `num`, deliberately — not an arbitrary object. `MPSelectValue` is a name for `Object`, because Dart has no union type, and values are compared with `==`.

:::

A select is a form control, its value is what a form submits, and every escape from that (object values, a custom equality, a stringifier for the trigger) buys flexibility by making the common case harder to write. Keep the identifier here and look the object up on the other side.

**Nothing chosen is `null`.** Not `0`, not `''`, not `-1`. A value with no matching entry in `items` has no label to show, so the trigger draws the value itself — a form holding `0` for "not picked yet" sits there reading `0`, in the field a reader is being asked to fill in.

That is the right answer for a value that is real and whose row has not arrived yet: a field that stayed blank over a value it is holding, and will submit, is worse. It is simply not the answer for a sentinel, and MUI's `Select` draws a blank in the same situation, so the difference is easy to walk into on the way across.

## Examples

### errorMessage

There is no separate `error` boolean. A message is what puts the select into its error state, so there is no way to render a control that is visibly wrong with no explanation of why.

<Demo src="select/states" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/select/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/select/states.dart

:::

</Demo>

`description` is the same slot, and `errorMessage` replaces it rather than stacking under it — Material gives supporting text one line, and pushing the description down to make room leaves the reader reading a sentence that has just stopped applying.

### disabled options

An option can be listed without being available:

::: fw react

```tsx
items={[
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team', disabled: true }
]}
```

:::

::: fw flutter

```dart
items: const <MPSelectOption>[
  MPSelectOption(value: 'free', label: Text('Free')),
  MPSelectOption(value: 'team', label: Text('Team'), disabled: true),
],
```

:::

Listed rather than removed, on purpose: "this exists but not for you" and "this does not exist" are different things, and only one of them explains why a plan a colleague mentioned is not there.

### floatingLabel

While nothing is chosen and the popup is shut, the label rests on the trigger's own line where the placeholder would be, and rises into the notch on focus or on the first choice. The `placeholder` is withheld until it has — two greyed strings in one box is not a hint. See [MPTextField](./text-field#floatinglabel) for the rule in full.

::: fw react

The open popup counts as focus. Base UI moves the focus into the list, so a label that only watched the trigger would fall back down over a select the reader is halfway through answering.

`floatingLabel={false}` pins the label in the notch, and a `startIcon` holds it up regardless — the glyph is already standing where a resting label would be.

:::

::: fw flutter

The open popup counts as focus, so the label stays up for as long as the list is open, whatever has the focus.

`floatingLabel: false` pins the label in the notch, and a `startIcon` holds it up regardless — the glyph is already standing where a resting label would be.

:::

### size

Five rungs, the same ones a text field is drawn at. A select beside a field at the same `size` lines up to the pixel, which is the whole reason the shell is shared.

<Demo src="select/sizes" :minHeight="440">

::: fw react

<<< @/.vitepress/demos/select/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/select/sizes.dart

:::

</Demo>

::: fw flutter

A select that is not `fullWidth` holds the width of the longest thing it could say — every option, the placeholder and a resting label — so choosing a shorter option does not shrink the field out from under the pointer that chose it.

:::

## The popup

`surface-container` at elevation 2 — the one surface in this library that genuinely floats, and the only one that carries a shadow by default.

A chosen row is marked with a **tick** as well as a fill, because a highlight is also what the keyboard's cursor looks like: a list where "selected" and "where the arrow keys are" are the same colour is a list you cannot read. The tick's column is reserved on every row, so the labels do not shift sideways as the selection moves down the list.

It fades, on the same 200ms and the same curve as every other popup in the library — the menu, the popover, the combobox's list, the dialog. Opacity and nothing else: a list that slid or scaled would move the row the pointer was already reaching for.

The cursor is a **state layer** rather than a background — the same wash [MPMenu](./menu) puts under a highlighted row. A background could only replace the chosen row's fill, which would leave the cursor invisible on the one row the list most often opens on; a layer composites onto it, and fades rather than appearing.

## Accessibility

::: fw react

- The trigger is named by the label in the notch, wired by `id`.
- Base UI owns the popup's positioning and flipping, the focus trap, typeahead, and the hidden input that makes the whole thing submit with a form.
- `readOnly` shows the value without allowing a change and stays in the tab order; `disabled` does neither.

:::

::: fw flutter

- The field is one button node for a screen reader, named by the label in the notch, carrying the chosen option's label as its value and saying whether the list is expanded. The label, the value and the supporting line are read as one stop.
- The focus stays on the trigger while the list is open. The arrow keys open the list and walk it, passing over disabled rows; Home and End jump to its ends; Enter or Space takes the highlighted row; Escape, Tab or a press outside closes it without choosing.
- Typing a letter jumps to the option whose label starts with it: the highlight on an open list, the value itself on a closed one, as a native select does.
- Under directional navigation, a remote's D-pad, a closed select leaves the arrows to the focus system and opens with Select or Enter.
- `readOnly` shows the value without allowing a change and stays in the focus order; `disabled` does neither.
- Inside an `MPForm`, `name` files the value with the rest, a required select with nothing chosen holds the submit back and takes the focus, and an error the form hands back under that name shows under the trigger.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. |
| `defaultValue` | `initialValue` | Flutter's name. Left out, `value` is a marker that is not a value, which is what makes the select hold its own; `value: null` is a controlled select with nothing chosen. |
| `string \| number` | `MPSelectValue` (`Object`) | Dart has no union type. Pass a `String` or a `num`. |
| `label`, `placeholder` and an option's `label` (`ReactNode`) | `Widget?` | Usually a `Text`. The words in a `Text` are what a screen reader and the typeahead read. |
| Focus moves into the list | Focus stays on the trigger | The list's keys are the trigger's, so the outline keeps its focused colour while the list is open. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | One callback, returning a `KeyEventResult`. It hears every key before the select does. |
| `onFocus`, `onBlur` | `onFocusChange` | One callback with a `bool`. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | Wrap the select in a `GestureDetector` for the pointer. |
| `id`, `className`, `style`, `classNames` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `focusNode`, `autofocus` | A name for a select with no visible label, and the focus from outside. |

The rest is matched deliberately: the shell, the popup's surface and fade, the tick and the state layer on the rows, the floating label and the size ladder.

:::

## See also

- [MPTextField](./text-field) — the shell this borrows.
- [MPRadioGroup](./radio-group) — for a handful of options that are worth showing all at once.

::: fw react

- [Base UI Select](https://base-ui.com/react/components/select) — the behaviour underneath.

:::
