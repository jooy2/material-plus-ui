---
title: MPNavigationMenu
order: 18
---

# MPNavigationMenu

<p class="mp-lede">A site's navigation: a row of destinations, some of which open a panel of more of them.</p>

<Demo src="navigation-menu/hero" :minHeight="240" />

::: fw react

```tsx
import { MPNavigationMenu, MPNavigationMenuItem, MPNavigationMenuLink } from 'material-plus-ui';

<MPNavigationMenu aria-label="Main">
  <MPNavigationMenuItem value="product" label="Product">
    <MPNavigationMenuLink href="/overview" title="Overview" description="What it does" />
  </MPNavigationMenuItem>
  <MPNavigationMenuItem label="Pricing" href="/pricing" />
</MPNavigationMenu>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPNavigationMenu(
  semanticLabel: 'Main',
  items: <MPNavigationMenuItem>[
    MPNavigationMenuItem(
      value: 'product',
      label: 'Product',
      links: <MPNavigationMenuLink>[
        MPNavigationMenuLink(
          title: 'Overview',
          description: 'What it does',
          onPressed: () => router.go('/overview'),
        ),
      ],
    ),
    MPNavigationMenuItem(label: 'Pricing', onPressed: () => router.go('/pricing')),
  ],
);
```

:::

## Props

<PropsTable name="MPNavigationMenu" />

## Why this is not an MPMenu

Because of what the rows **are**.

::: fw react

An [MPMenu](../inputs/menu) holds actions, so its rows are `menuitem`s and the whole thing is a widget that takes the arrow keys and hands them back on Escape. This holds links, so it is a `<nav>` full of real `<a>` elements — which is what puts each destination in a screen reader's link list, on the browser's status bar, on the middle-click menu and in a crawler's index.

:::

::: fw flutter

An [MPMenu](../inputs/menu) holds actions, so its rows are menu items and the whole thing is a widget that takes the arrow keys and hands them back on Escape. This holds destinations, so it is a navigation region whose rows are announced as links, and each one calls the app's router from `onPressed`.

:::

The rule is short:

> Reach for a menu when the row **does** something, and for this when the row **goes** somewhere.

A "Product ▾" that opens a panel of links is still this component: the trigger expands, and everything it reveals is a destination.

## One panel, resized

::: fw react

One panel is open at a time, and it **resizes** between items rather than closing and reopening. That is Base UI's doing, and it is why the popup animates its width and height as well as its opacity: crossing the row should read as one surface following the pointer, not as three sheets flashing in and out.

:::

::: fw flutter

One panel is open at a time. Each item hangs its own panel, so crossing the row fades one out as the next fades in, rather than resizing one sheet into the next. Crossing from an open panel to the next item is immediate; opening the first waits for `delay`, so a pointer passing the row on its way somewhere else does not drop a panel over the screen.

:::

The surface itself is MD3's menu surface — `surface-container` at elevation 2 under `corner-extra-small` — which is the same three decisions [MPMenu](../inputs/menu) and [MPSelect](../inputs/select) make. Three floating sheets on one page that did not match would be three surfaces the eye has to learn separately.

## Items are links or triggers

An `MPNavigationMenuItem` with an `href` and no children is a link — in Flutter, one with an `onPressed` and no `links`. With children it is a trigger and a panel. There is no third shape, and the difference is not cosmetic — the first is announced as a destination, the second as something that expands.

::: fw react

```tsx
// A destination.
<MPNavigationMenuItem label="Pricing" href="/pricing" />

// A trigger, and what it reveals.
<MPNavigationMenuItem value="product" label="Product" columns={2}>
  <MPNavigationMenuLink href="/overview" title="Overview" description="What it does" />
</MPNavigationMenuItem>
```

:::

::: fw flutter

```dart
// A destination.
MPNavigationMenuItem(label: 'Pricing', onPressed: () => router.go('/pricing'))

// A trigger, and what it reveals.
MPNavigationMenuItem(
  value: 'product',
  label: 'Product',
  columns: 2,
  links: <MPNavigationMenuLink>[
    MPNavigationMenuLink(title: 'Overview', description: 'What it does', onPressed: openOverview),
  ],
)
```

:::

`columns` is what turns a list into a mega-menu. It is a plain grid, so an item with four links and `columns: 2` is two rows of two, each row as tall as its tallest link.

## MPNavigationMenuLink

<PropsTable name="MPNavigationMenuLink" />

One row inside a panel: where it goes, what it is called, and a line saying what is there.

The `description` is the part worth using. A panel of bare titles is a panel a reader has to guess at; one line each turns it into something they can choose from without opening anything.

## orientation

<Demo src="navigation-menu/vertical" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/navigation-menu/vertical.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/navigation_menu/vertical.dart

:::

</Demo>

`vertical` is a rail whose panels open **beside** it rather than under it, and the arrow keys follow. Nothing else changes: the rows are the same links and the same triggers, which is what makes a header full of navigation and an [MPSidebar](./sidebar) full of it the same component.

## Where it goes

::: fw react

In an [MPHeader](./header)'s middle slot, which is exactly what that slot is for:

```tsx
<MPHeader brand="Acme" actions={<MPButton size="sm">Sign in</MPButton>}>
  <MPNavigationMenu aria-label="Main">…</MPNavigationMenu>
</MPHeader>
```

The header's middle slot carries no type scale of its own, so the menu keeps its own — see [MPHeader](./header#the-three-slots).

:::

::: fw flutter

In an [MPHeader](./header)'s middle slot, which is exactly what that slot is for:

```dart
MPHeader(
  brand: const <Widget>[Text('Acme')],
  actions: <Widget>[
    MPButton(size: MPSize.sm, onPressed: signIn, child: const Text('Sign in')),
  ],
  child: MPNavigationMenu(semanticLabel: 'Main', items: items),
)
```

The header's middle slot carries no type scale of its own, so the menu keeps its own, and the row draws no surface of its own, so it takes the bar's. See [MPHeader](./header#the-three-slots).

:::

::: fw react

## For a crawler

A closed panel is not in the page at all by default: not in the HTML a server sends, and not in the document a crawler renders. Links that exist only in a panel are therefore links a search engine is never shown. `keepMounted` keeps every panel's links in the server's markup, hidden, and in the document from then on:

```tsx
<MPNavigationMenu aria-label="Main" keepMounted>
  …
</MPNavigationMenu>
```

The cost is the panels' markup on every page, which is usually a few dozen links. A site whose important destinations are also linked from somewhere always in the page does not need it.

:::

## Item props

<PropsTable name="MPNavigationMenuItem" />

## Accessibility

::: fw react

- The root is a `<nav>`. Give it an `aria-label` when the page has more than one — "navigation" twice tells a reader which is which not at all.
- A trigger carries `aria-expanded` and owns its panel. A link carries neither, because it does not expand anything.
- Every row in a panel is a real `<a>` with an `href`. That is the whole reason to use this rather than a menu.
- A disabled item stays in the row and opens nothing, at the spec's 38%.
- The trigger's chevron is `aria-hidden`: it is a picture of the state `aria-expanded` already announces.

:::

::: fw flutter

- The root is a node with the navigation role, named by `semanticLabel`. Give it one when the screen has more than one navigation region; Flutter refuses two unnamed ones in debug builds.
- A trigger is a button that says whether its panel is expanded. A destination is a link, and says nothing of expanding. Every row in a panel is a link.
- Each item is a focus stop of its own. The arrows along the row move between them and skip a disabled one, and <kbd>Home</kbd> and <kbd>End</kbd> go to either end.
- The down arrow on a row's trigger, or the arrow pointing across on a rail, opens its panel and moves into it, where the up and down arrows walk the links. <kbd>Tab</kbd> from a trigger whose panel is open goes into the panel, and out of its last link to the next item, closing the panel behind it. <kbd>Esc</kbd> closes the panel and goes back to its trigger.
- A disabled item stays in the row and opens nothing, at the spec's 38%.
- The chevron is drawn inside the trigger's node and not read: it is a picture of the state the node already announces.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| Composed items and links | `items` and `links` lists | The menu hands each item its focus node and each panel its links' nodes, so it has to be told what it holds. |
| `href`, `target`, `rel`, `render` | `onPressed` | There is no link element and no router in this package. `onPressed` is where the app's router is called. |
| `value` | — | Which panel is open belongs to the pointer and the keyboard, and `String?` cannot tell "not controlled" from "controlled and closed". `initialValue` and `onChanged` remain. |
| `defaultValue`, `onValueChange` | `initialValue`, `onChanged` | Flutter's names. |
| `delay`, `closeDelay` in milliseconds | `Duration`s | Flutter's type for a length of time. |
| One panel resized between items | A panel per item, faded | Each panel hangs off its own item; there is no shared viewport to resize. |
| `keepMounted` | — | Nothing crawls a Flutter app, and a closed panel's links are not on the screen to find. |
| `aria-label` | `semanticLabel` | Flutter's name. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPMenu](../inputs/menu) — the same shape for rows that **do** something.
- [MPHeader](./header) — the bar this usually sits in.
- [MPSidebar](./sidebar) — where a `vertical` one goes.
- [MPBreadcrumb](../display/breadcrumb) — where the reader is, rather than where they could go.
