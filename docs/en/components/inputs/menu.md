---
title: MPMenu
order: 4
---

# MPMenu

<p class="mp-lede">A list of actions that appears when something is pressed. Each row is code rather than a value — a handler, an icon, sometimes a tick or a submenu — which is the opposite of <code>MPSelect</code>, and deliberately.</p>

<Demo src="menu/hero" :minHeight="80" />

::: fw react

```tsx
import { MPButton, MPMenu, MPMenuItem, MPMenuSeparator } from 'material-plus-ui';

<MPMenu trigger={<MPButton>Actions</MPButton>}>
  <MPMenuItem shortcut="⌘C">Copy</MPMenuItem>
  <MPMenuSeparator />
  <MPMenuItem color="error">Delete</MPMenuItem>
</MPMenu>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
      MPButton(onPressed: open, child: const Text('Actions')),
  items: <MPMenuEntry>[
    MPMenuItem(label: 'Copy', shortcut: '⌘C', onPressed: copy),
    const MPMenuSeparator(),
    MPMenuItem(label: 'Delete', color: MPColor.error, onPressed: remove),
  ],
);
```

:::

::: fw react

## Why the rows are composed and a select's options are data

A select's options are values out of a list a caller already has, and its trigger has to be able to name the chosen one before the popup has ever been mounted.

A menu's rows are **code** — each one a different handler, a different icon, sometimes a submenu — and nothing has to know about them until the menu opens. Data would mean an `items` type with a variant for every shape a row can take, which is a component tree spelled as a discriminated union.

:::

::: fw flutter

## Why the rows are descriptions

The rows are still code, each with its own handler, and not values out of a list. What changes is how they are written: as descriptions handed to the menu in `items`, not as widgets composed under it.

The React build composes because Base UI reads the DOM the rows are written into: it finds them, counts them, walks a highlight through them and matches typeahead against them without anyone handing it a list. A widget tree offers nothing to walk before it is built, and a menu's rows are not built until it opens, so the menu has to be told what it holds.

`MPMenuEntry` is a **sealed** class, so a row is a different _kind_ of thing — an `MPMenuItem`, an `MPMenuCheckboxItem`, an `MPMenuRadioGroup` of `MPMenuRadioItem`s, an `MPMenuGroup`, an `MPMenuSeparator` or an `MPMenuSubmenu` — rather than one class with a discriminator on it. The names, the fields and the defaults are React's.

:::

## Props

<PropsTable name="MPMenu" />

### `MPMenuItem`

<PropsTable name="MPMenuItem" />

### `MPMenuCheckboxItem`

<PropsTable name="MPMenuCheckboxItem" />

### `MPMenuRadioItem`

<PropsTable name="MPMenuRadioItem" />

::: fw react

Wrapped in `MPMenuRadioGroup`, which takes `value`, `defaultValue`, `onValueChange` and `disabled`.

:::

::: fw flutter

Held in an `MPMenuRadioGroup<T>`, whose `items` are the rows of the set:

<PropsTable name="MPMenuRadioGroup" />

:::

### `MPMenuSubmenu`

<PropsTable name="MPMenuSubmenu" />

### `MPMenuGroup` and `MPMenuSeparator`

`MPMenuGroup` takes a `label` and wraps a run of rows; the label is a heading, not a row, so it cannot be picked. `MPMenuSeparator` is the hairline between two runs, in `outline-variant`.

::: fw flutter

<PropsTable name="MPMenuGroup" />

:::

## The popup

`surface-container` at elevation 2 and `corner-extra-small` — MD3's own three choices, and deliberately the same three [MPSelect](./select)'s list takes. A select _is_ a menu that remembers what you picked, and two floating lists of rows that do not match are two lists the eye has to learn separately.

Rows are full-bleed rather than inset tiles: MD3 gives a menu item no corner of its own, so the state layer runs to both edges and the popup's own 4px corner is the only curve in the object.

The popup is at least 112px and at most 280px wide, MD3's narrowest and widest menu, and scrolls past 384px tall. A row's height steps up the ladder with `size` — 32, 40, 48, 56, 64 — and 48 at `md` is MD3's own. It is a least height, so a row with a `description` grows to two lines rather than clipping the second.

## The trigger

::: fw react

Anything, and Base UI wires it: `trigger={<MPButton>Actions</MPButton>}`, an [MPIconButton](./icon-button), an [MPChip](../display/chip) with an `onClick`. All three are real `<button>`s, which is what `nativeButton` defaults to `true` for.

Set it `false` for a trigger that is deliberately something else — an avatar, a card, a row of text:

```tsx
<MPMenu nativeButton={false} trigger={<MPAvatar src={user.photo} />}>
  <MPMenuItem>Profile</MPMenuItem>
</MPMenu>
```

Base UI then supplies the `role`, the tab stop and the Enter/Space handling a `<button>` would have brought with it, so the trigger is still a button to a screen reader and to a keyboard.

It is a prop rather than something inferred because what a trigger renders is only known once it has rendered, and by then the wiring has been decided. Base UI says so in the console when the two disagree — in either direction, so a `false` here on something that _is_ a `<button>` is as wrong as the reverse.

:::

::: fw flutter

A builder, handed the callback that opens the menu and whether it is open. Anything that can call it is a trigger: an `MPButton`, an `MPIconButton`, an `MPChip` with an `onPressed`.

```dart
MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) =>
      MPChip(onPressed: open, selected: isOpen, child: const Text('Filter')),
  items: rows,
);
```

A Material Plus control used as the trigger says it holds the focus while the menu does, and says whether the menu is open, which is what React's trigger says with `aria-expanded`. The trigger is optional: a menu given `open` and opened from elsewhere hangs off the place it was written.

:::

## Examples

### Every shape a row takes

<Demo src="menu/rows" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/menu/rows.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/menu/rows.dart

:::

</Demo>

A tick says "and", a dot says "instead of" — the same distinction [MPCheckbox](./checkbox) and [MPRadioGroup](./radio-group) make everywhere else. Both kinds keep the menu open by default, because a list you tick is a list you tick more than one of.

A ticking row given no `checked`, and a set given no `value`, keep their own state from `defaultChecked` and `defaultValue` — `initialChecked` and `initialValue` in Flutter.

::: fw react

### href

A row given an `href` renders a real `<a>`. A menu of links that are not links cannot be opened in a new tab, cannot be copied, and tells a screen reader the wrong thing about every one of them.

With `target="_blank"` the row also gets `rel="noopener noreferrer"`, which is what stops the opened page reaching back through `window.opener`. Setting `rel` yourself replaces that rather than adding to it.

A `disabled` row is **not** a link, whatever `href` says — it falls back to a plain item. `disabled` is not something an `<a>` can be, and a link that only looked unavailable is one a keyboard still lands on and a crawler still follows.

:::

### color

A row can name its own family — `error` on the one that deletes — and its ink, and the tick or dot it marks itself with, turn over with it. The rest of the menu keeps the menu's family.

::: fw react

```tsx
<MPMenuItem color="error">Delete</MPMenuItem>
```

:::

::: fw flutter

```dart
MPMenuItem(label: 'Delete', color: MPColor.error, onPressed: remove)
```

:::

### MPContextMenu

::: fw react

<PropsTable name="MPContextMenu" />

The same rows, opened by a right-click or a long press instead of by a button.

<Demo src="menu/context" :minHeight="160" :flutter="false">

<<< @/.vitepress/demos/menu/context.tsx

</Demo>

It takes the rows as `content` and the area as `children`, which is [MPTooltip](../feedback/tooltip)'s shape rather than `MPMenu`'s — because here the trigger is not one element handed over, it is a region of the page, and the region is the thing being wrapped.

:::

::: fw flutter

`MPContextMenu` is React-only. No right-click gesture means the same thing on every platform Flutter runs on, and a Flutter app already has the two that do: a long press and a secondary tap. Hand either of them the trigger builder's `open`:

```dart
MPMenu(
  trigger: (BuildContext context, VoidCallback open, bool isOpen) => GestureDetector(
    onLongPress: open,
    onSecondaryTap: open,
    child: const DropZone(),
  ),
  items: rows,
);
```

The popup hangs off the area rather than off the pointer, flipping to the side that has room.

:::

## Accessibility

::: fw react

- Base UI owns roving focus with the arrow keys, Home and End, typeahead, Escape, closing on an outside click, restoring focus to the trigger, submenus opening on hover with the safe triangle, and the `menu` / `menuitem` roles that make any of it mean something to a screen reader.
- There is no focus ring on a row. Base UI moves focus onto the highlighted row itself, so a ring would draw a rectangle inside the popup on every arrow press — the state layer is the indicator, which is what makes it the same one the mouse gets.
- `disabled` keeps a row listed and findable by typeahead. "This exists but not for you" and "this does not exist" are different things.

:::

::: fw flutter

- The focus stays round the **trigger** while the popup is up, on a node of the menu's own, because the rows are painted in an overlay and a focus scope lifted with them would take the keyboard away from the widget that knows what to do with it. The arrow keys, <kbd>Home</kbd>, <kbd>End</kbd>, typeahead, <kbd>Enter</kbd>, <kbd>Space</kbd> and <kbd>Esc</kbd> are answered there.
- A trigger reached by the keyboard opens with its first row lit, and the down and up arrows open a shut menu with the first or the last row lit. <kbd>Tab</kbd> closes the menu and moves on from the trigger.
- Once the menu closes, the focus goes back to the trigger, whether a key or a pointer opened it, unless a row's own handler sent it somewhere else. An `MPButton` draws its ring there only while Flutter's focus highlight mode is the keyboard's.
- The pointer moves the same highlight the arrow keys do, so the mouse and the keyboard light one row rather than two, and moving onto a row of an outer menu closes the submenu open beside it.
- The popup is a node with the menu role, named by `semanticLabel`. A row is a menu item; a ticking row is a checkbox menu item that says whether it is checked, and a choice a radio menu item in a mutually exclusive group. A submenu's row says whether it is expanded.
- The arrow that opens a submenu follows the writing direction, so it runs the other way under RTL, and so does the chevron.
- A disabled row stays listed, and the arrow keys and typeahead still reach it, as they do in React. Picking it does nothing, and it says it is unavailable.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| Composed rows | `items: List<MPMenuEntry>` | Base UI reads the DOM the rows are written into. There is no tree to walk before the rows are built, so the menu has to be told what it holds. |
| `children` on a row | `label`, a `String` | It is drawn, announced and matched by typeahead, and only a string can be all three. React's separate `label` for typeahead is not needed. |
| `trigger`, an element | `trigger`, a builder | It is handed the callback that opens the menu and whether it is open. |
| `onClick` | `onPressed` | Flutter's name. |
| `closeOnClick` | `closeOnPress` | Flutter's name for a press. |
| `defaultOpen`, `defaultChecked`, `defaultValue` | `initialOpen`, `initialChecked`, `initialValue` | Flutter's names. |
| `onCheckedChange`, `onValueChange` | `onChanged` | Flutter's name for a plain change of value. |
| `value={null}` on a radio group | — | `value: null` means the menu keeps the choice itself, so a controlled set with nothing chosen is not expressible. |
| `href`, `target`, `rel`, `render` on a row | — | There is no link element and nothing crawls a Flutter app. `onPressed` is where a router is called. |
| `nativeButton` | — | There is no DOM element to ask about. Any widget that calls `open` is a trigger. |
| `modal` | — | The popup hangs off its trigger and a press outside closes it; the press goes on to whatever it landed on. |
| The safe triangle | — | A submenu opens as the pointer comes onto its row and closes as it comes onto another row of the same menu, so a diagonal reach across a neighbour closes it. |
| `MPContextMenu` | `MPMenu` opened from `onLongPress` or `onSecondaryTap` | No right-click gesture means the same thing on every platform. |
| — | `semanticLabel` | The popup's name for a screen reader. Base UI names it from the trigger. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPSelect](./select) — a menu that remembers what you picked.
- [MPMenubar](./menubar) — a strip of menus at the top of an application.
- [MPButton](./button) — what usually opens one.
- [MPShortcut](../display/shortcut) — for the keystroke at the end of a row.
