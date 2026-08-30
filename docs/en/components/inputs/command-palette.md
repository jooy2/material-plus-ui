---
title: MPCommandPalette
order: 15
---

# MPCommandPalette

<p class="mp-lede">Everything an application can do, behind one field.</p>

<Demo src="command-palette/hero" :minHeight="240" />

```tsx
import { MPCommandPalette } from 'material-plus-ui';

<MPCommandPalette
  items={[
    { value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N', onSelect: create },
    { value: 'open', label: 'Open…', group: 'File', keywords: ['load'], onSelect: browse }
  ]}
/>;
```

## Props

<PropsTable name="MPCommandPalette" />

## What it is, and what it is not

The shape a keyboard-first product takes once it has more actions than a menu bar can hold: the reader **types what they want** instead of remembering where it was put.

It is not an [MPMenu](./menu). A menu is a short list in one place, and every row is visible before you go looking for it — that is the whole of what a menu is good at, and it is why a menu of sixty rows is not a menu.

It is not an [MPCombobox](./combobox) either, and this one is worth being precise about. What comes back from a combobox is a **value**, which the caller then does something with. What comes back from here is _something happening_: the row **is** the action, `onSelect` runs it, and the sheet closes because there is nothing left to decide.

## The surface is MD3's search view

`surface-container-high` at `corner-extra-large` under elevation 3.

That is MD3's own docked search view, and it happens to be the same three decisions [MPDialog](../feedback/dialog) makes — which is not a coincidence worth hiding. A sheet that has taken the page over a scrim is one object in this system, whether it is asking a question or taking a search.

It is pinned near the **top** of the window rather than centred. A palette is opened by somebody who is about to type, and a field that arrives under the reader's hands is a field they do not have to go looking for.

## The shortcut, said once

`Mod+K` by default, bound on the window. `Mod` is Command on a Mac and Control everywhere else.

It is written in exactly the vocabulary [MPShortcut](../display/shortcut) **draws**, and that is deliberate: a shortcut a component displays and a shortcut it binds have to be spelled the same way, or the label on the screen is a claim nobody checked. The same reading is what powers `pressed()` against a real keyboard event.

A command's own `shortcut` is the other half of that, and the palette does **not** bind it:

```tsx
{ value: 'new', label: 'New document', shortcut: 'Mod+N', onSelect: create }
```

That is a label for a binding the application already has. A palette that bound them would be a palette competing with the editor underneath it.

Pass `shortcut={false}` to bind nothing at all, and open the palette yourself with `open`.

## Matching

The query is matched, case-insensitively, against three things:

- the command's `label`,
- its `group`, so typing "file" brings back everything in that section,
- and its `keywords`, which are **never drawn**.

Keywords are the interesting one. They are where the name somebody else's product gives the same command goes, and the abbreviation, and the word the reader would have searched for:

```tsx
{ value: 'open', label: 'Open…', keywords: ['load', 'import', 'browse'] }
```

## Groups

A heading is drawn each time `group` changes, which means a group's commands have to be listed **together**. That is a deliberate constraint rather than a limitation: the order of `items` is the order the palette shows, so the caller decides what comes first rather than discovering it.

## Accessibility

- The dialog has no visible title, so it takes a name from `label` — or from the word for "command palette" in `locale`.
- The list is Base UI's `Autocomplete`: the pointer and the arrow keys move **one** highlight, so a reader never has to work out which of two marks Enter would run. `aria-activedescendant` keeps the focus in the field while the highlight moves.
- The dialog traps the focus while it is open and puts it back wherever the reader was on the way out.
- A disabled command stays in the list, at the spec's 38%, and cannot be run.
- The row shortcuts are drawn by [MPShortcut](../display/shortcut), which announces `⌘` as "Command" rather than by its Unicode name.

## See also

- [MPShortcut](../display/shortcut) — the keys, drawn.
- [MPCombobox](./combobox) — the same field shape, when the answer is a value.
- [MPMenu](./menu) — a short list of actions, in one place.
- [MPDialog](../feedback/dialog) — the sheet this shares its surface with.
