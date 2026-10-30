---
title: MPCommandPalette
order: 15
---

# MPCommandPalette

<p class="mp-lede">Everything an application can do, behind one field.</p>

<Demo src="command-palette/hero" :minHeight="240" />

::: fw react

```tsx
import { MPCommandPalette } from 'material-plus-ui';

<MPCommandPalette
  items={[
    { value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N', onSelect: create },
    { value: 'open', label: 'Open…', group: 'File', keywords: ['load'], onSelect: browse }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCommandPalette(
  items: <MPCommand>[
    MPCommand(value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N', onSelect: create),
    MPCommand(value: 'open', label: 'Open…', group: 'File', keywords: <String>['load'], onSelect: browse),
  ],
);
```

:::

## Props

<PropsTable name="MPCommandPalette" />

::: fw flutter

### `MPCommand`

One thing the palette can do. React's `MPCommand` is a TypeScript interface of the same fields.

<PropsTable name="MPCommand" />

:::

## What it is, and what it is not

The shape a keyboard-first product takes once it has more actions than a menu bar can hold: the reader **types what they want** instead of remembering where it was put.

It is not an [MPMenu](./menu). A menu is a short list in one place, and every row is visible before you go looking for it — that is the whole of what a menu is good at, and it is why a menu of sixty rows is not a menu.

It is not an [MPCombobox](./combobox) either, and this one is worth being precise about. What comes back from a combobox is a **value**, which the caller then does something with. What comes back from here is _something happening_: the row **is** the action, `onSelect` runs it, and the sheet closes because there is nothing left to decide.

## The surface is MD3's search view

`surface-container-high` at `corner-extra-large` under elevation 3.

That is MD3's own docked search view, and it happens to be the same three decisions [MPDialog](../feedback/dialog) makes — which is not a coincidence worth hiding. A sheet that has taken the page over a scrim is one object in this system, whether it is asking a question or taking a search.

It is pinned near the **top** of the window rather than centred. A palette is opened by somebody who is about to type, and a field that arrives under the reader's hands is a field they do not have to go looking for.

## The shortcut, said once

`Mod+K` by default, bound on the window — in Flutter, heard on the keyboard anywhere in the app. `Mod` is Command on a Mac and Control everywhere else.

It is written in exactly the vocabulary [MPShortcut](../display/shortcut) **draws**, and that is deliberate: a shortcut a component displays and a shortcut it binds have to be spelled the same way, or the label on the screen is a claim nobody checked.

::: fw react

The same reading is what powers `pressed()` against a real keyboard event.

:::

A command's own `shortcut` is the other half of that, and the palette does **not** bind it:

::: fw react

```tsx
{ value: 'new', label: 'New document', shortcut: 'Mod+N', onSelect: create }
```

:::

::: fw flutter

```dart
MPCommand(value: 'new', label: 'New document', shortcut: 'Mod+N', onSelect: create)
```

:::

That is a label for a binding the application already has. A palette that bound them would be a palette competing with the editor underneath it.

::: fw react

Pass `shortcut={false}` to bind nothing at all, and open the palette yourself with `open`.

:::

::: fw flutter

Pass `shortcut: null` to bind nothing at all, and open the palette yourself with `open`.

:::

## Matching

The query is matched, case-insensitively, against three things:

- the command's `label`,
- its `group`, so typing "file" brings back everything in that section,
- and its `keywords`, which are **never drawn**.

Keywords are the interesting one. They are where the name somebody else's product gives the same command goes, and the abbreviation, and the word the reader would have searched for:

::: fw react

```tsx
{ value: 'open', label: 'Open…', keywords: ['load', 'import', 'browse'] }
```

:::

::: fw flutter

```dart
MPCommand(value: 'open', label: 'Open…', keywords: <String>['load', 'import', 'browse'])
```

:::

The parts are kept apart, so a query cannot match across the seam between them: `copy link` does not find a command called _Copy_ that happens to be tagged _link_.

## Groups

A heading is drawn each time `group` changes, which means a group's commands have to be listed **together**. That is a deliberate constraint rather than a limitation: the order of `items` is the order the palette shows, so the caller decides what comes first rather than discovering it.

## Accessibility

::: fw react

- The dialog has no visible title, so it takes a name from `label` — or from the word for "command palette" in `locale`.
- The list is Base UI's `Autocomplete`: the pointer and the arrow keys move **one** highlight, so a reader never has to work out which of two marks Enter would run. `aria-activedescendant` keeps the focus in the field while the highlight moves.
- The dialog traps the focus while it is open and puts it back wherever the reader was on the way out.

:::

::: fw flutter

- The sheet is a node with the dialog role. It has no visible title, so it takes a name from `semanticLabel`, or from the word for "command palette" in `locale`. The field is named by its placeholder, and keeps the name once something is typed.
- The pointer and the arrow keys move **one** highlight, so a reader never has to work out which of two marks Enter would run. Nothing is lit until an arrow or the pointer lights a row, as in React, and the arrows pass over a disabled command. The arrows and Enter are read off the keyboard before the field sees them, so the field keeps every character it is typed. The lit row says it is selected.
- The sheet holds the focus while it is open, the scrim keeps the pointer and a screen reader off the page under it, and the focus goes back wherever the reader was on the way out. <kbd>Esc</kbd>, the system back and a press on the scrim close it.
- The sheet grows in as the dialog's does, and appears without moving for a reader who asked for less motion.

:::

- A disabled command stays in the list, at the spec's 38%, and cannot be run.
- The row shortcuts are drawn by [MPShortcut](../display/shortcut), which announces `⌘` as "Command" rather than by its Unicode name.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `MPCommand`, an interface | `MPCommand`, a class | Dart's way of naming a shape. The fields are the same. |
| `shortcut={false}` | `shortcut: null` | A Dart parameter is one type. `null` binds nothing. |
| `defaultOpen` | `initialOpen` | Flutter's name. |
| `label` | `semanticLabel` | Flutter's name for a screen reader's name. |
| `width` as any CSS length | `width`, a `double` | Logical pixels are Flutter's only length. |
| `maxHeight` as any CSS length | `maxHeight`, a `double` | The same. |
| `emptyMessage`, a node | `emptyMessage`, a `String` | It is drawn in the palette's own muted style. |
| `description`, a node | `description`, a `String` | The same. |
| `classNames`, `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPShortcut](../display/shortcut) — the keys, drawn.
- [MPCombobox](./combobox) — the same field shape, when the answer is a value.
- [MPMenu](./menu) — a short list of actions, in one place.
- [MPDialog](../feedback/dialog) — the sheet this shares its surface with.
