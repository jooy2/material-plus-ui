---
title: MPList
order: 7
---

# MPList

<p class="mp-lede">A stack of rows. The list is a sheet and the rows are what is on it — which is why <code>size</code> and <code>color</code> are set once, on the stack, and why a row that navigates is a real link.</p>

<Demo src="list/hero" :minHeight="260" />

```tsx
import { MPList, MPListItem } from 'material-plus-ui';

<MPList>
  <MPListItem description="Design" onClick={open}>
    Jane Doe
  </MPListItem>
  <MPListItem href="/people/ada">Ada Lovelace</MPListItem>
</MPList>;
```

## Props

<PropsTable name="MPList" />

### MPListItem

<PropsTable name="MPListItem" />

## The size ladder lands on the control ladder

Each rung's vertical padding is the leading of that rung's body role subtracted from the control height of the same name. `body-large` is a 24px line box, and 24 plus `py-4` is 56 — MD3's own one-line list item, and `md` on the control ladder to the pixel.

| `size` | Row type role | One-line row |
| ------ | ------------- | ------------ |
| `xs`   | `body-medium` | 32px         |
| `sm`   | `body-medium` | 40px         |
| `md`   | `body-large`  | 56px         |
| `lg`   | `body-large`  | 64px         |
| `xl`   | `body-large`  | 72px         |

So a one-line row and the button beside it are the same height without either knowing about the other.

## `density` keeps that promise

A list is what density was invented for. It is one row repeated, and how many of them a reader can see at once is most of what makes it usable — so `density` takes room out of every row without touching what the row is set in.

| `density` | `md` row | Same as        |
| --------- | -------- | -------------- |
| `0`       | 56px     | a `md` control |
| `-1`      | 52px     | `lg` at `-2`   |
| `-2`      | 48px     | —              |
| `-3`      | 44px     | —              |

Every step lands on a height the control ladder already has a name for, which is what keeps the row and the button beside it lined up at any density. The text stays where it was: a denser list is the same words in less room, not smaller words.

`xs` runs out after two steps and stays at 24px, because that is where a row stops being something a finger can hit. See [`density`](../../design/prop-conventions#density).

```tsx
<MPList density={-1}>
  <MPListItem>Inbox</MPListItem>
</MPList>
```

## `dividers` changes more than it sounds like

With the rules on, they have to reach both edges of the sheet — so the list gives up its inner padding and the rows give up their rounded corners. A row cannot be a floating tile and a ruled line at the same time.

<Demo src="list/dividers">

<<< @/.vitepress/demos/list/dividers.tsx

</Demo>

The rule is written as `> li + li` rather than as a class on each row, so it holds however the rows were composed — through a `.map()`, through fragments, through a component of the caller's own.

## Three shapes, and the caller picks by what they pass

The shell is always an `<li>`. Inside it:

```tsx
<MPListItem>Inert</MPListItem>                    // a <div>
<MPListItem onClick={open}>Pressable</MPListItem> // a <button>
<MPListItem href="/one">Navigates</MPListItem>    // an <a>
```

This is the same shape [MPChip](./chip) uses, for the same two reasons: a `<span>` carrying a click handler is invisible to a keyboard, and a `<button>` inside a `<button>` is markup Chrome silently un-nests.

`action` sits **outside** the pressable area for exactly that reason — a row that both navigates and holds a toggle has two things to press.

`render` replaces that inner element, which is where a router's `Link` goes:

```tsx
<MPListItem href="/inbox" render={<Link />}>
  Inbox
</MPListItem>
```

**This is the one `render` in the library that is not the outermost element.** A row's shell is an `<li>` because it is inside a `<ul>`, and swapping that for anything else makes the list stop being a list; what a caller actually wants to replace is the `<a>` inside it, which is the thing a client-side router has to own for a navigation and a prefetch to happen at all. `href`, `target` and the row's classes all go through, so the URL is written once, on the `MPListItem`.

`target` brings its own `rel` — `noopener noreferrer` for `_blank` — and a `rel` of your own **replaces** that rather than extending it, so a row that also needs `nofollow` spells all three out.

## `selected` says two different things

`aria-current="page"` on a link and `"true"` on a button. The first is "this is the page you are on", the second is "this is the chosen one of these". `aria-pressed` would be a third thing — a toggle — and a selected row is not a toggle.

Visually it is MD3's selected list item: the family's container tone under its own ink. Not a second colour and not a bolder weight.

## The sheet is never dyed

`variant` reads the neutral surface roles whatever `color` is, because a list holds other people's content and that content arrives with its own colours. `color` reaches the selected row and the state layer, and stops there.

`text` is the one to reach for inside a card: the card is already a sheet, and a second bordered rectangle inside it is a second rectangle.

## No primitive underneath

A list is not a composite widget — it has no roving focus, no selection model, no keyboard contract of its own. Reaching for a menu or a listbox primitive to get one would hand every consumer's plain list of links the semantics of a menu, which is one of the most common ways a component library breaks a screen reader.

What it does say out loud is `role="list"`: a host page's reset may take the bullets off every `<ul>`, and Safari takes the list semantics off with them.

## See also

- [MPDivider](./divider) — the same rule, standing on its own.
- [MPTable](./table) — when the rows have columns.
- [MPEmpty](../feedback/empty) — what to show when there are no rows at all.
