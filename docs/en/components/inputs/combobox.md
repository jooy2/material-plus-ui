---
title: MPCombobox
order: 3
---

# MPCombobox

<p class="mp-lede">A field you can type into and also choose from. The shell is <code>MPTextField</code>’s wearing a chevron, exactly as <code>MPSelect</code>’s trigger is — what is different is what the text does: it filters the list, and it can become the value itself.</p>

<Demo src="combobox/hero" :minHeight="90" />

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

## Props

<PropsTable name="MPCombobox" />

### `items`

<PropsTable name="MPComboboxOption" />

A `label` is a `string` rather than a `ReactNode`, which is the one place this differs from [MPSelect](./select): the label is what the filter matches against and what is written into a text input, and neither of those can be done to an element.

## A value the list does not have

`allowCustom` is on by default, and it is what separates this from a searchable select.

The typed text is offered as its **own row** at the end of the list rather than committed silently on blur — so adding a value is a choice the reader makes, at a moment they can see, and it is reachable by Enter, by a click and by the arrow keys the same way every other row is.

Turn it off for a field whose values are a closed set.

## Examples

### multiple

The chosen values become [MPChip](../display/chip)s inside the field and the input goes on filtering after each one, so a set of tags is built without the field ever closing.

<Demo src="combobox/multiple" :minHeight="120">

<<< @/.vitepress/demos/combobox/multiple.tsx

</Demo>

### errorMessage

There is no separate `error` boolean. A message is what puts the combobox into its error state, so there is no way to render a control that is visibly wrong with no explanation of why.

<Demo src="combobox/states" :minHeight="320">

<<< @/.vitepress/demos/combobox/states.tsx

</Demo>

`description` is the same slot, and `errorMessage` replaces it rather than stacking under it — Material gives supporting text one line.

### floatingLabel

While nothing is chosen or typed and the control is unfocused, the label rests on the input's own line and rises into the notch on focus, on the first character or on the first chip. Typed text counts as content on its own: the label cannot sit on top of what is being typed under it. See [MPTextField](./text-field#floatinglabel) for the rule in full.

### clearable

Off by default: a field that can be cleared in one click is a field that can be emptied by accident.

### limit

The most rows the list will show at once. `-1`, the default, is all of them.

### filter

Which rows survive the query, in place of the matching this does on its own.

**`null` turns the filtering off entirely**, and that is the value to reach for when the rows already arrived filtered:

```tsx
<MPCombobox items={results} filter={null} onInputValueChange={search} />
```

A list fetched per keystroke has been matched by a server that knows things this does not — synonyms, transliteration, the rule that strips a punctuation mark out of a tag before comparing it — and a second pass here can only remove rows that server decided were hits. A row the reader can see the reason for, disappearing as they type the next character, is what that looks like.

A function is the middle ground, for matching a description as well as a label, or for a fold the collator does not do:

```tsx
<MPCombobox items={items} filter={(option, query) => option.label?.startsWith(query) ?? false} />
```

The row that offers what was typed is exempt either way: its label _is_ the query, so a filter that hid it would be hiding the answer to the question it was asked.

### content

A row that draws more than its own label — a thumbnail, a glyph, a second line of detail:

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

### chipVariant and chipColor

How the chips inside a `multiple` field are painted. The default is `tonal` in `primary`, or `outlined` in `error` while the field is in its error state.

`outlined` throughout is worth knowing about: a field holding six filled chips reads as a row of buttons rather than as a value, which is the reason Material UI's own autocomplete draws them outlined.

```tsx
<MPCombobox multiple chipVariant="outlined" items={tags} />
```

## Accessibility

- Base UI owns the filtering and its collator, the popup's positioning and flipping, the `combobox`/`listbox` wiring, arrow-key navigation across both the list and the chips, and the hidden input that makes the whole thing submit with a form.
- The label in the notch names the input, and Base UI names the chevron after the field itself — a button called "Language" beside a field called "Language" is the button that opens that field. `openLabel` is the fallback for a combobox with no label at all.
- A chosen row is marked with a **tick** as well as a fill, because a highlight is also what the keyboard's cursor looks like: a list where "selected" and "where the arrow keys are" are the same colour is a list you cannot read.

## See also

- [MPSelect](./select) — when the values are a closed set and there is nothing to type.
- [MPTextField](./text-field) — the shell this borrows.
- [MPChip](../display/chip) — what a chosen value becomes with `multiple`.
