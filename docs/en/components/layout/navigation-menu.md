---
title: MPNavigationMenu
order: 18
---

# MPNavigationMenu

<p class="mp-lede">A site's navigation: a row of destinations, some of which open a panel of more of them.</p>

<Demo src="navigation-menu/hero" :minHeight="240" />

```tsx
import { MPNavigationMenu, MPNavigationMenuItem, MPNavigationMenuLink } from 'material-plus-ui';

<MPNavigationMenu aria-label="Main">
  <MPNavigationMenuItem value="product" label="Product">
    <MPNavigationMenuLink href="/overview" title="Overview" description="What it does" />
  </MPNavigationMenuItem>
  <MPNavigationMenuItem label="Pricing" href="/pricing" />
</MPNavigationMenu>;
```

## Props

<PropsTable name="MPNavigationMenu" />

## Why this is not an MPMenu

Because of what the rows **are**.

An [MPMenu](../inputs/menu) holds actions, so its rows are `menuitem`s and the whole thing is a widget that takes the arrow keys and hands them back on Escape. This holds links, so it is a `<nav>` full of real `<a>` elements — which is what puts each destination in a screen reader's link list, on the browser's status bar, on the middle-click menu and in a crawler's index.

The rule is short:

> Reach for a menu when the row **does** something, and for this when the row **goes** somewhere.

A "Product ▾" that opens a panel of links is still this component: the trigger expands, and everything it reveals is a destination.

## One panel, resized

One panel is open at a time, and it **resizes** between items rather than closing and reopening. That is Base UI's doing, and it is why the popup animates its width and height as well as its opacity: crossing the row should read as one surface following the pointer, not as three sheets flashing in and out.

The surface itself is MD3's menu surface — `surface-container` at elevation 2 under `corner-extra-small` — which is the same three decisions [MPMenu](../inputs/menu) and [MPSelect](../inputs/select) make. Three floating sheets on one page that did not match would be three surfaces the eye has to learn separately.

## Items are links or triggers

An `MPNavigationMenuItem` with an `href` and no children is a link. With children it is a trigger and a panel. There is no third shape, and the difference is not cosmetic — the first is announced as a destination, the second as something that expands.

```tsx
// A destination.
<MPNavigationMenuItem label="Pricing" href="/pricing" />

// A trigger, and what it reveals.
<MPNavigationMenuItem value="product" label="Product" columns={2}>
  <MPNavigationMenuLink href="/overview" title="Overview" description="What it does" />
</MPNavigationMenuItem>
```

`columns` is what turns a list into a mega-menu. It is a plain grid, so an item with four links and `columns={2}` is two rows of two.

## MPNavigationMenuLink

<PropsTable name="MPNavigationMenuLink" />

One row inside a panel: where it goes, what it is called, and a line saying what is there.

The `description` is the part worth using. A panel of bare titles is a panel a reader has to guess at; one line each turns it into something they can choose from without opening anything.

## orientation

<Demo src="navigation-menu/vertical" :minHeight="220">

<<< @/.vitepress/demos/navigation-menu/vertical.tsx

</Demo>

`vertical` is a rail whose panels open **beside** it rather than under it, and the arrow keys follow. Nothing else changes: the rows are the same links and the same triggers, which is what makes a header full of navigation and an [MPSidebar](./sidebar) full of it the same component.

## Where it goes

In an [MPHeader](./header)'s middle slot, which is exactly what that slot is for:

```tsx
<MPHeader brand="Acme" actions={<MPButton size="sm">Sign in</MPButton>}>
  <MPNavigationMenu aria-label="Main">…</MPNavigationMenu>
</MPHeader>
```

The header's middle slot carries no type scale of its own, so the menu keeps its own — see [MPHeader](./header#the-three-slots).

## Item props

<PropsTable name="MPNavigationMenuItem" />

## Accessibility

- The root is a `<nav>`. Give it an `aria-label` when the page has more than one — "navigation" twice tells a reader which is which not at all.
- A trigger carries `aria-expanded` and owns its panel. A link carries neither, because it does not expand anything.
- Every row in a panel is a real `<a>` with an `href`. That is the whole reason to use this rather than a menu.
- A disabled item stays in the row and opens nothing, at the spec's 38%.
- The trigger's chevron is `aria-hidden`: it is a picture of the state `aria-expanded` already announces.

## See also

- [MPMenu](../inputs/menu) — the same shape for rows that **do** something.
- [MPHeader](./header) — the bar this usually sits in.
- [MPSidebar](./sidebar) — where a `vertical` one goes.
- [MPBreadcrumb](../display/breadcrumb) — where the reader is, rather than where they could go.
