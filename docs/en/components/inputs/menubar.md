---
title: MPMenubar
order: 16
---

# MPMenubar

<p class="mp-lede">The strip of words at the top of an application — File, Edit, View — each of which opens a menu.</p>

<Demo src="menubar/hero" :minHeight="200" />

```tsx
import { MPMenubar, MPMenubarMenu, MPMenuItem } from 'material-plus-ui';

<MPMenubar>
  <MPMenubarMenu label="File">
    <MPMenuItem shortcut="Mod+N" onClick={create}>
      New
    </MPMenuItem>
  </MPMenubarMenu>
</MPMenubar>;
```

## Props

<PropsTable name="MPMenubar" />

## What makes it a bar rather than a row of menus

What happens once one of them is **open**.

Moving along the strip walks through the others instead of closing the one you left, and the arrow keys move between the menus as well as inside them. Three separate [MPMenu](./menu)s side by side do neither: crossing from one to the next closes the first and opens nothing.

Base UI owns all of that, along with the `menubar` role — which is what tells a screen reader the strip is **one widget with one tab stop** rather than six unrelated buttons.

## The words are not buttons

A menu bar's rows are drawn a rung below the control ladder, and the reason is what a menu bar sits **on**.

It is almost always inside something that already has a height of its own: an [MPHeader](../layout/header), a title bar, a toolbar. Drawn at control height, `File Edit View` would be three buttons in a row and the strip would be taller than the thing it is on.

They take MD3's `label-large` — the same role an [MPMenu](./menu)'s own rows take — because the word on the bar and the rows behind it are one object. Setting the strip in a control's `title-medium` makes the bar read as a row of buttons that happen to open lists.

## Why it draws no surface

Same reason. A sheet under a strip that is already on a sheet is two sheets, and the second one has nothing to say — the refusal [MPContainer](../layout/container#why-it-draws-no-surface) makes, one level down.

Put it on something:

```tsx
<MPHeader brand="Acme" size="sm">
  <MPMenubar size="sm">…</MPMenubar>
</MPHeader>
```

## Which word is open

Colour, and nothing else: the open word takes the accent and the state layer stays lit under it.

The word does not move and the strip does not change height, which matters more here than almost anywhere: a reader crossing the bar is pointing at a target that must not shift out from under them, and every word on the strip is a target.

## MPMenubarMenu

<PropsTable name="MPMenubarMenu" />

One menu on the bar: the word, and the rows behind it.

It has no `size` and no `color` of its own — both belong to the bar, which is the only place they can be set once and hold for every menu on it. The rows inside are the same `MPMenuItem`, `MPMenuSeparator`, `MPMenuGroup`, `MPMenuCheckboxItem`, `MPMenuRadioItem` and `MPMenuSubmenu` an [MPMenu](./menu) takes, because it **is** the same menu.

```tsx
<MPMenubarMenu label="View">
  <MPMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
    Rulers
  </MPMenuCheckboxItem>
  <MPMenuSubmenu label="Zoom">
    <MPMenuItem onClick={() => zoom(2)}>200%</MPMenuItem>
  </MPMenuSubmenu>
</MPMenubarMenu>
```

## When this is the wrong component

When there are more actions than a strip can hold.

A menu bar's whole advantage is that every heading is visible before you go looking for one, and a bar of twelve words has already lost it. That is an [MPCommandPalette](./command-palette): the reader types what they want instead of remembering which heading it was filed under.

The two live together well. A palette bound to `Mod+K` and a bar of five words is a product that is fast for the reader who knows it and legible to the one who does not.

## Accessibility

- The strip is a `menubar` with one tab stop. Tab moves past the whole bar; the arrow keys move along it.
- Each word is a `menuitem` with `aria-haspopup` and `aria-expanded`, and its menu is owned by it.
- A disabled word stays on the strip at the spec's 38% and opens nothing.
- The focus ring is drawn **inside** the word — the one place in this library it is inset. A strip of words has no gaps to draw a ring in, so an outside ring would be painted under whichever word comes after it.

## See also

- [MPMenu](./menu) — one menu, on its own, and the rows both share.
- [MPCommandPalette](./command-palette) — where the actions go once the strip has run out.
- [MPHeader](../layout/header) — the bar a menu bar usually sits on.
- [MPNavigationMenu](../layout/navigation-menu) — the same strip shape for rows that **go** somewhere rather than **do** something.
