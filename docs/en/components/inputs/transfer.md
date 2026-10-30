---
title: MPTransfer
order: 12
---

# MPTransfer

<p class="mp-lede">Two lists and the arrows between them: everything that could be chosen on one side, everything that has been on the other.</p>

<Demo src="transfer/hero" :minHeight="320" />

::: fw react

```tsx
import { MPTransfer } from 'material-plus-ui';

<MPTransfer
  items={columns}
  value={chosen}
  onValueChange={setChosen}
  sourceLabel="All columns"
  targetLabel="In the report"
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTransfer(
  items: columns,
  value: chosen,
  onChanged: (List<String> next) => setState(() => chosen = next),
  sourceLabel: const Text('All columns'),
  targetLabel: const Text('In the report'),
);
```

:::

## Props

<PropsTable name="MPTransfer" />

::: fw flutter

The transfer is controlled when `value` is given. Leave it out and the transfer keeps its own, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## When this is the right shape

When the choice is **long**.

The columns in a report, the permissions on a role, the people on a channel. At that length an [MPCombobox](./combobox) with forty chips in its field stops being readable, and a column of forty checkboxes gives no answer at all to the one question the reader actually has: _what did I pick?_ Two lists answer it by construction, because one of them is the answer.

Below about a dozen options, one of those two is the smaller component and the better one. A transfer takes two columns of the page to say something a multi-select says in one line.

## Ticking is not choosing

This is the whole of the interaction, and it is worth being explicit about.

`value` is **which side a row is on**. A tick is a mark on a row saying it should move the next time an arrow is pressed. They are separate state, and only the first one is yours:

- <Fw react="`onValueChange`" flutter="`onChanged`" /> fires on an **arrow press** and never on a tick.
- What a caller stores is `value` — the answer, not the working.
- Moving drops the ticks on what moved and keeps the rest. A row that has arrived on the other side is not still waiting to be sent there.

An arrow is dead until something on its own side is ticked, which is what stops a press that would do nothing.

## The order never changes

Both lists draw in the order of `items`, so a row sent across and back lands exactly where it started.

The alternative — appending to the far list — reorders the reader's own list every time they change their mind, and turns "did I already move that?" into a scan of the whole column.

## searchable

<Demo src="transfer/searchable" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/transfer/searchable.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/transfer/searchable.dart

:::

</Demo>

A filter above each list, each one narrowing its own side.

A press moves only what the filter is **still showing**. A row that was ticked and then hidden was never part of that press — otherwise a filter would move things the reader cannot see, which is the one thing a filter must never do.

::: fw react

The filter matches against a label that is a string. A label that is an element is left in the list rather than filtered out on a comparison that cannot be made.

:::

::: fw flutter

The filter matches against the words of a label, with case set aside. A label with no words to read, an icon or a layout of widgets, is left in the list rather than filtered out on a comparison that cannot be made.

:::

## The heading strip

Each list's own name is the label of its select-all tick.

That is one string doing two jobs on purpose. A tick in a column header with no name is a control a screen reader announces as "checkbox" and nothing else; "Select all" drawn next to "Available" is the same word twice, in a strip that has 200 pixels to work with.

The count beside it is what is ticked against what is on that side. It is set in tabular figures, so it does not jog sideways as it climbs past a narrower digit — it changes on every tick, which is exactly when a reader is looking at it.

Select-all skips the rows that cannot move. A disabled row is in the list and out of the transaction.

## What a reader who cannot see it is told

Each list is a group named after the heading above it. Without that the two panels are one undifferentiated run of checkboxes, and a reader moving by form control hears the row's label and nothing saying which side of the transfer it is on — on the component whose whole subject is which side a row is on.

A press is announced: how many rows crossed, and which list they landed in. The arrow keeps the focus and the only thing that changes is which of two columns of near-identical rows a row is in, so nothing about the press reaches a reader on its own.

::: fw react

The list is named by your own `sourceLabel` or `targetLabel` where that is a string, and by the locale's word for it otherwise — there is no honest way to read a heading out of markup.

:::

::: fw flutter

The list is named by the words of your own `sourceLabel` or `targetLabel` where it has some, and by the locale's word for it otherwise. Where the platform takes announcements, the sentence is sent as one; elsewhere it lands in a live region that stays in the tree.

:::

## Examples

### Uncontrolled

Every prop that takes a value has an uncontrolled twin, so a form that only reads the answer on submit needs no state of its own:

::: fw react

```tsx
<MPTransfer items={columns} defaultValue={['name']} />
```

:::

::: fw flutter

```dart
MPTransfer(items: columns, initialValue: const <String>['name'])
```

:::

### A shorter pair of lists

`height` is each list's height, and both are the same whichever side is longer — a pair that grew independently would move the arrows every time something crossed:

::: fw react

```tsx
<MPTransfer items={columns} height={140} size="sm" />
```

:::

::: fw flutter

```dart
MPTransfer(items: columns, height: 140, size: MPSize.sm)
```

:::

### Rows that cannot move

::: fw react

```tsx
const columns = [
  { value: 'id', label: 'Internal ID', disabled: true },
  …
];
```

:::

::: fw flutter

```dart
const List<MPTransferItem> columns = <MPTransferItem>[
  MPTransferItem(value: 'id', label: Text('Internal ID'), disabled: true),
  …
];
```

:::

The row still draws, in the list it is in. It is simply not part of any press — which is the honest way to say "this one is always included" or "this one is never available".

## Accessibility

- Every row is a real checkbox with the row's label attached, so the list is a list a screen reader can walk and tick.
- The arrows are [MPIconButton](./icon-button)s and therefore named. "Move to selected" and "Move to available" are read out; the glyph is not.
- The trailing arrow is the same glyph turned 180°, which is symmetrical about both axes — so it is still correct under RTL, where the lists have swapped sides and the arrows swap with them.
- `disabled` stops the whole control: every tick, both arrows, and the filters.

::: fw flutter

- In a compact window the two lists stack, with the arrows between them pointing down and up; from the medium window up they stand side by side, and under RTL the arrows point the way the lists have moved.

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. |
| `defaultValue` | `initialValue` | Flutter's name. Left out, `value` is `null` and the transfer keeps its own. |
| `label`, `sourceLabel`, `targetLabel` (`ReactNode`) | `Widget` | Usually a `Text`, whose words the filter and the announcement read. |
| `height` (`number \| string`) | `height` (`double`) | Logical pixels; there are no CSS lengths to pass. |
| `labels` (`Partial<…>`) | `labels` (`Map<String, String>?`) | The same keys, as a map. |
| The medium breakpoint, a CSS media query | The window class from `MPConfigProvider` | The same 600 logical pixels, read from the screen's width. |
| Native `<div>` attributes, `className` | — | There is nothing to pass them through to. |

The rest is matched deliberately: the panels and their heading strips, the counts, the filters, the arrows and what they say, the order that never changes and the rows that settle in.

:::

## See also

- [MPCombobox](./combobox) — the one-line answer for a choice that is short enough to be one.
- [MPCheckbox](./checkbox) — what each row is.
- [MPSelect](./select) — one of a list, when only one may be chosen.
