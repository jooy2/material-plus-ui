---
title: MPCombobox
order: 3
---

# MPCombobox

<p class="mp-lede">A field you can type into and also choose from. The shell is <code>MPTextField</code>’s wearing a chevron, exactly as <code>MPSelect</code>’s trigger is — what is different is what the text does: it filters the list, and it can become the value itself.</p>

<Demo src="combobox/hero" :minHeight="90" />

::: fw react

```tsx
import { MPCombobox } from 'material-plus-ui';

<MPCombobox
  label="Language"
  items={[
    { value: 'ts', label: 'TypeScript' },
    { value: 'rs', label: 'Rust' }
  ]}
  value={language}
  onValueChange={setLanguage}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCombobox(
  label: const Text('Language'),
  items: const <MPComboboxOption>[
    MPComboboxOption(value: 'ts', label: 'TypeScript'),
    MPComboboxOption(value: 'rs', label: 'Rust'),
  ],
  value: language,
  onChanged: (MPComboboxValue? next) => setState(() => language = next),
);
```

:::

## Props

<PropsTable name="MPCombobox" />

### `items`

<PropsTable name="MPComboboxOption" />

::: fw react

A `label` is a `string` rather than a `ReactNode`, which is the one place this differs from [MPSelect](./select): the label is what the filter matches against and what is written into a text input, and neither of those can be done to an element.

:::

::: fw flutter

A `label` is a `String` rather than a `Widget`, which is the one place this differs from [MPSelect](./select): the label is what the filter matches against and what is written into the text field, and neither of those can be done to a widget.

The combobox is controlled when `value` is given, `null` included, which is nothing chosen. Leave `value` out and it keeps its own, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## A value the list does not have

`allowCustom` is on by default, and it is what separates this from a searchable select.

The typed text is offered as its **own row** at the end of the list rather than committed silently on blur — so adding a value is a choice the reader makes, at a moment they can see, and it is reachable by Enter, by a click and by the arrow keys the same way every other row is.

Turn it off for a field whose values are a closed set.

The same rule decides what a `value` the list does not have looks like: it is drawn as itself, because here that is a value somebody typed rather than a lookup that failed. **So nothing chosen is `null`** — not `0` and not `''`. A sentinel is indistinguishable from a custom value, and the field will show it.

## Examples

### multiple

The chosen values become [MPChip](../display/chip)s inside the field and the input goes on filtering after each one, so a set of tags is built without the field ever closing.

::: fw flutter

`multiple` is a constructor of its own, `MPCombobox.multiple`, whose `value`, `initialValue` and `onChanged` speak in a `List<MPComboboxValue>`. A value whose type changed with a flag would be one every caller has to narrow before reading it.

:::

<Demo src="combobox/multiple" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/combobox/multiple.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/combobox/multiple.dart

:::

</Demo>

::: fw flutter

From the text, the arrow back through the start of what is typed walks into the chips, and the arrows along the row move between them. Backspace or Delete on a chip takes it off, and Backspace in an empty field takes off the last one. Taking a chosen row from the list again takes the value back out.

:::

### errorMessage

There is no separate `error` boolean. A message is what puts the combobox into its error state, so there is no way to render a control that is visibly wrong with no explanation of why.

<Demo src="combobox/states" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/combobox/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/combobox/states.dart

:::

</Demo>

`description` is the same slot, and `errorMessage` replaces it rather than stacking under it — Material gives supporting text one line.

### floatingLabel

While nothing is chosen or typed and the control is unfocused, the label rests on the input's own line and rises into the notch on focus, on the first character or on the first chip. Typed text counts as content on its own: the label cannot sit on top of what is being typed under it. See [MPTextField](./text-field#floatinglabel) for the rule in full.

### clearable

Off by default: a field that can be cleared in one click is a field that can be emptied by accident.

### limit

The most rows the list will show at once. `-1`, the default, is all of them.

Every row the list shows is a real element, with no windowing. A few hundred open at once; a few thousand make a visible pause when the popup opens, and that pause is a long task on the main thread. `limit` is the cap for a long list: it is applied after the filter, so every item is still searched and the reader narrows the list by typing, while the popup only ever draws the first rows that match.

::: fw react

```tsx
<MPCombobox items={countries} limit={50} />
```

A list too long to send to the browser at all is a search. Fetch the matches as the reader types and pass them with `filter={null}`, below.

:::

::: fw flutter

```dart
MPCombobox(items: countries, limit: 50)
```

A list too long to hold at all is a search. Fetch the matches as the reader types and pass them with `filter: MPCombobox.noFilter`, below.

:::

### filter

Which rows survive the query, in place of the matching this does on its own.

::: fw react

**`null` turns the filtering off entirely**, and that is the value to reach for when the rows already arrived filtered:

```tsx
<MPCombobox items={results} filter={null} onInputValueChange={search} />
```

:::

::: fw flutter

**`MPCombobox.noFilter` turns the filtering off entirely**, and that is the value to reach for when the rows already arrived filtered:

```dart
MPCombobox(items: results, filter: MPCombobox.noFilter, onInputValueChange: search)
```

The first of the rows that arrive after the reader stopped typing lights up as they arrive, so Enter takes it as it would take a row matched here.

:::

A list fetched per keystroke has been matched by a server that knows things this does not — synonyms, transliteration, the rule that strips a punctuation mark out of a tag before comparing it — and a second pass here can only remove rows that server decided were hits. A row the reader can see the reason for, disappearing as they type the next character, is what that looks like.

::: fw react

A function is the middle ground, for matching a description as well as a label, or for a fold the collator does not do:

```tsx
<MPCombobox items={items} filter={(option, query) => option.label?.startsWith(query) ?? false} />
```

:::

::: fw flutter

A function is the middle ground, for matching a description as well as a label, or for a fold the default does not do. Left out, an option stays while its label contains the query with case set aside; accents are not folded, so `cafe` does not find `Café` unless a filter of yours says it does.

```dart
MPCombobox(
  items: items,
  filter: (MPComboboxOption option, String query) => option.label?.startsWith(query) ?? false,
)
```

:::

The row that offers what was typed is exempt either way: its label _is_ the query, so a filter that hid it would be hiding the answer to the question it was asked.

### content

A row that draws more than its own label — a thumbnail, a glyph, a second line of detail:

::: fw react

```tsx
<MPCombobox
  items={flashes.map((flash) => ({
    value: flash.id,
    label: flash.title,
    content: (
      <span className="flex items-center gap-2">
        <img src={flash.thumbnail} alt="" width={24} height={24} />
        {flash.title}
      </span>
    )
  }))}
/>
```

It replaces the label **in the popup only**. The input still receives `label` when the row is chosen, the chip still shows `label`, and the filter still matches against it — which is why the two are separate props rather than `label` being loosened to a `ReactNode`. A text input's value is a string, and a row that could not say what its own string is would have nothing to put there.

:::

::: fw flutter

```dart
MPCombobox(
  items: <MPComboboxOption>[
    for (final Flash flash in flashes)
      MPComboboxOption(
        value: flash.id,
        label: flash.title,
        content: Row(
          spacing: 8,
          children: <Widget>[Image.network(flash.thumbnail, width: 24), Text(flash.title)],
        ),
      ),
  ],
)
```

It replaces the label **in the popup only**. The text field still receives `label` when the row is chosen, the chip still shows `label`, and the filter still matches against it — which is why the two are separate parameters rather than `label` being loosened to a `Widget`. A text field's value is a string, and a row that could not say what its own string is would have nothing to put there.

:::

### chipVariant and chipColor

How the chips inside a `multiple` field are painted. The default is `tonal` in `primary`, or `outlined` in `error` while the field is in its error state.

`outlined` throughout is worth knowing about: a field holding six filled chips reads as a row of buttons rather than as a value, which is the reason Material UI's own autocomplete draws them outlined.

::: fw react

```tsx
<MPCombobox multiple chipVariant="outlined" items={tags} />
```

:::

::: fw flutter

```dart
MPCombobox.multiple(chipVariant: MPVariant.outlined, items: tags)
```

:::

## Accessibility

::: fw react

- Base UI owns the filtering and its collator, the popup's positioning and flipping, the `combobox`/`listbox` wiring, arrow-key navigation across both the list and the chips, and the hidden input that makes the whole thing submit with a form.
- The label in the notch names the input, and Base UI names the chevron after the field itself — a button called "Language" beside a field called "Language" is the button that opens that field. `openLabel` is the fallback for a combobox with no label at all.

:::

::: fw flutter

- The field is one text field node for a screen reader, named by the label in the notch and saying whether the list is expanded. The chevron is named after the field — a button called "Language" beside a field called "Language" is the button that opens that field — and `openLabel` is the fallback for a combobox with no label at all.
- The first match lights up as the reader types, so Enter takes it. The arrow keys open the list and walk it, Escape or a press outside closes it and puts the text back, and the focus stays in the text throughout.
- Each chip is a stop of its own, reached with the arrow keys from the text rather than with Tab, and its × is named for the chip it removes.
- The chevron and the × are not Tab stops: the arrow keys and Backspace do the same from the text.
- Inside an `MPForm`, `name` files the value with the rest, an empty required combobox holds the submit back and takes the focus, and an error the form hands back under that name shows under the field.

:::

- A chosen row is marked with a **tick** as well as a fill, because a highlight is also what the keyboard's cursor looks like: a list where "selected" and "where the arrow keys are" are the same colour is a list you cannot read.

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `multiple` | `MPCombobox.multiple` | A constructor of its own, so `value` and `onChanged` are typed: one value, or a list. |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onInputValueChange` and `onOpenChange` keep their names. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter's names. Left out, a single combobox's `value` is a marker that is not a value, which is what makes it hold its own; `value: null` is a controlled combobox with nothing chosen. |
| `string \| number` | `MPComboboxValue` (`Object`) | Dart has no union type. Pass a `String` or a `num`; a value the reader typed arrives as a `String`. |
| `filter={null}` | `filter: MPCombobox.noFilter` | `null` is what leaves the default match in place in Dart. |
| The collator's match | Case set aside, accents kept | Dart has no collator and this package has no dependencies. Pass a `filter` of your own to fold accents. |
| `label`, `emptyMessage`, `customLabel` (`ReactNode`) | `Widget` | Usually a `Text`. |
| `inputRef` | `focusNode` | Flutter reaches a text field through its focus node. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | One callback, returning a `KeyEventResult`. It hears every key before the combobox does. |
| `onFocus`, `onBlur` | `onFocusChange` | One callback with a `bool`. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | Wrap the combobox in a `GestureDetector` for the pointer. |
| `id`, `className`, `style`, `classNames` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `autofocus` | A name for a combobox with no visible label, and the focus on arrival. |

The rest is matched deliberately: the shell, the row that offers what was typed, the first match lighting up, the chips and their colours, the popup's surface and the tick.

:::

## See also

- [MPSelect](./select) — when the values are a closed set and there is nothing to type.
- [MPTextField](./text-field) — the shell this borrows.
- [MPChip](../display/chip) — what a chosen value becomes with `multiple`.
