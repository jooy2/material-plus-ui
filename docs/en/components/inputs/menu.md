---
title: MPMenu
order: 4
---

# MPMenu

<p class="mp-lede">A list of actions that appears when something is pressed. The rows are composed rather than passed as data — the opposite of <code>MPSelect</code>, and deliberately.</p>

<Demo src="menu/hero" :minHeight="80" />

```tsx
import { MPButton, MPMenu, MPMenuItem, MPMenuSeparator } from 'material-plus-ui';

<MPMenu trigger={<MPButton>Actions</MPButton>}>
  <MPMenuItem shortcut="⌘C">Copy</MPMenuItem>
  <MPMenuSeparator />
  <MPMenuItem color="error">Delete</MPMenuItem>
</MPMenu>;
```

## Why the rows are composed and a select's options are data

A select's options are values out of a list a caller already has, and its trigger has to be able to name the chosen one before the popup has ever been mounted.

A menu's rows are **code** — each one a different handler, a different icon, sometimes a submenu — and nothing has to know about them until the menu opens. Data would mean an `items` type with a variant for every shape a row can take, which is a component tree spelled as a discriminated union.

## Props

<PropsTable name="MPMenu" />

### `MPMenuItem`

<PropsTable name="MPMenuItem" />

### `MPMenuCheckboxItem`

<PropsTable name="MPMenuCheckboxItem" />

### `MPMenuRadioItem`

<PropsTable name="MPMenuRadioItem" />

Wrapped in `MPMenuRadioGroup`, which takes `value`, `defaultValue`, `onValueChange` and `disabled`.

### `MPMenuSubmenu`

<PropsTable name="MPMenuSubmenu" />

### `MPMenuGroup` and `MPMenuSeparator`

`MPMenuGroup` takes a `label` and wraps a run of rows; the label is a heading, not a row, so it cannot be picked. `MPMenuSeparator` is the hairline between two runs, in `outline-variant`.

## The popup

`surface-container` at elevation 2 and `corner-extra-small` — MD3's own three choices, and deliberately the same three [MPSelect](./select)'s list takes. A select _is_ a menu that remembers what you picked, and two floating lists of rows that do not match are two lists the eye has to learn separately.

Rows are full-bleed rather than inset tiles: MD3 gives a menu item no corner of its own, so the state layer runs to both edges and the popup's own 4px corner is the only curve in the object.

## Examples

### Every shape a row takes

<Demo src="menu/rows" :minHeight="80">

<<< @/.vitepress/demos/menu/rows.tsx

</Demo>

A tick says "and", a dot says "instead of" — the same distinction [MPCheckbox](./checkbox) and [MPRadioGroup](./radio-group) make everywhere else. Both kinds keep the menu open by default, because a list you tick is a list you tick more than one of.

### href

A row given an `href` renders a real `<a>`. A menu of links that are not links cannot be opened in a new tab, cannot be copied, and tells a screen reader the wrong thing about every one of them.

### color

A row can name its own family — `error` on the one that deletes — and the slots are re-declared on the row so its ink turns over with it.

### MPContextMenu

<PropsTable name="MPContextMenu" />

The same rows, opened by a right-click or a long press instead of by a button.

<Demo src="menu/context" :minHeight="160">

<<< @/.vitepress/demos/menu/context.tsx

</Demo>

It takes the rows as `content` and the area as `children`, which is [MPTooltip](../feedback/tooltip)'s shape rather than `MPMenu`'s — because here the trigger is not one element handed over, it is a region of the page, and the region is the thing being wrapped.

## Accessibility

- Base UI owns roving focus with the arrow keys, Home and End, typeahead, Escape, closing on an outside click, restoring focus to the trigger, submenus opening on hover with the safe triangle, and the `menu` / `menuitem` roles that make any of it mean something to a screen reader.
- There is no focus ring on a row. Base UI moves focus onto the highlighted row itself, so a ring would draw a rectangle inside the popup on every arrow press — the state layer is the indicator, which is what makes it the same one the mouse gets.
- `disabled` keeps a row listed and findable by typeahead. "This exists but not for you" and "this does not exist" are different things.

## See also

- [MPSelect](./select) — a menu that remembers what you picked.
- [MPButton](./button) — what usually opens one.
- [MPShortcut](../display/shortcut) — for the keystroke at the end of a row.
