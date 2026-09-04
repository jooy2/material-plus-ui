---
title: MPFloatingBottomNavigation
order: 25
---

# MPFloatingBottomNavigation

<p class="mp-lede">A row of destinations floating clear of the bottom edge. The same bar as <a href="./bottom-navigation">MPBottomNavigation</a>, lifted off the page so the content keeps going underneath it.</p>

<Demo src="floating-bottom-navigation/hero" :minHeight="320" />

```tsx
import { MPBottomNavigationItem, MPFloatingBottomNavigation } from 'material-plus-ui';

<MPFloatingBottomNavigation defaultValue="home" label="Main">
  <MPBottomNavigationItem value="home" icon={<HomeIcon />}>
    Home
  </MPBottomNavigationItem>
  <MPBottomNavigationItem value="search" icon={<SearchIcon />}>
    Search
  </MPBottomNavigationItem>
</MPFloatingBottomNavigation>;
```

## Props

<PropsTable name="MPFloatingBottomNavigation" />

The destinations are [MPBottomNavigationItem](./bottom-navigation#mpbottomnavigationitem)s — the same component, unchanged. An item does not know which of the two bars it is in, apart from how wide it is allowed to be.

## Which bar to reach for

[MPBottomNavigation](./bottom-navigation) when the bar **is** the bottom of the screen. The page stops at it, and the tonal step between `surface-container` and `surface` is what separates the two.

This one when the content is meant to run underneath: a map, a photograph, a feed that should not end in a bar.

## Everything about the shape follows from `offset`

Because the page keeps going below it, the sheet:

- is a **stadium** rather than a bar with two corners,
- is only as wide as its destinations, so they are as wide as their own contents rather than a share of the screen,
- carries a **shadow** by default, because a lozenge lying flat over what it is floating above reads as a mistake rather than as a decision,
- and names only the destination the reader is on, since five drawn names would stretch it back into a bar.

`labels="all"` overrides the last of those when there is room — three short names usually is.

## There is no second highlight

The destination the reader is on wears the same active indicator it wears in the full-width bar: MD3's pill, widening out of a circle behind the glyph.

A floating bar could instead have one tile that slides between destinations, and this deliberately does not. The specification draws one selected treatment, and a lozenge with both would be saying where the reader is twice, on two different curves.

## `position`, and the one value that is not about the window

`fixed` holds it against the bottom of the window, `sticky` against the bottom of whatever is scrolling, and `static` puts it back in the flow, centred.

`absolute` is the interesting one: it holds the bar against the bottom of the nearest positioned ancestor, which is what a bar inside a screen of its own wants — a phone frame, a card, a preview. The demo above is that.

Centring is `mx-auto` on a box stretched across its container, never a translate of half the bar's own width. The rule against moving a surface holds here too, and `auto` margins stay centred under RTL without being told.

## `safeArea` moves the whole sheet

On the full-width bar it moves only the row inside, because the container has to keep reaching the bottom of the screen or a stripe of page shows under it. Here there is nothing under the bar to keep covered, so the gap simply grows: `offset` plus `env(safe-area-inset-bottom)`.

## What it does not claim

`role="tablist"`, for [MPBottomNavigation](./bottom-navigation)'s reason: a bottom navigation changes what the page **is**, not which panel of one is showing. Every item is an ordinary button or link carrying `aria-current="page"`.
