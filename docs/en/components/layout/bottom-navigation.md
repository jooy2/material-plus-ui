---
title: MPBottomNavigation
order: 13
---

# MPBottomNavigation

<p class="mp-lede">A row of destinations held against the bottom edge of the window. Material calls this the <strong>navigation bar</strong>, and what is drawn is the specification's: an 80dp <code>surface-container</code> bar, with the destination the reader is on marked by a 64×32dp <code>secondary-container</code> pill behind its glyph.</p>

<Demo src="bottom-navigation/hero" :minHeight="140" />

```tsx
import { ICONS, MPBottomNavigation, MPBottomNavigationItem, MPIcon } from 'material-plus-ui';

<MPBottomNavigation label="Main" value={page} onValueChange={setPage}>
  <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
    Home
  </MPBottomNavigationItem>
  <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
    Search
  </MPBottomNavigationItem>
</MPBottomNavigation>;
```

Three to five destinations. Below three the bar is a row with a gap in it; above five the targets stop being hittable with a thumb, which is the one input this component is drawn for.

## Props

<PropsTable name="MPBottomNavigation" />

### MPBottomNavigationItem

<PropsTable name="MPBottomNavigationItem" />

## Why it is a `<nav>` and not a tab list

A deliberate choice about what is being promised.

A tab list owes a keyboard reader one tab stop for the whole set and arrow keys within it, and owes a screen reader a panel per tab. A navigation bar switches what the **page** is, not which panel of one is showing — and claiming the role without the behaviour is worse for a keyboard reader than never claiming it, because they will reach for arrow keys that do nothing.

What is claimed instead is `aria-current="page"`, which is the honest statement: this is the destination you are on. Every item is an ordinary button or link, in the tab order, doing what buttons and links do.

For dividing one screen into panels, that genuinely is [MPTabs](./tabs).

## labels

<Demo src="bottom-navigation/labels" :minHeight="280">

<<< @/.vitepress/demos/bottom-navigation/labels.tsx

</Demo>

| `labels`   | Drawn                    |
| ---------- | ------------------------ |
| `all`      | Every destination's name |
| `selected` | Only the current one's   |
| `none`     | No names at all          |

`all` is the default and it is the only one that works for a reader who has not used the application before. A row of four glyphs is a puzzle the first time and a habit the fifth.

**Undrawn is never unsaid.** In the other two the names stay in the document for a screen reader, because a glyph on its own has no accessible name at all.

## href

Worth reaching for on every real application:

```tsx
<MPBottomNavigationItem value="saved" href="/saved" icon={…}>
  Saved
</MPBottomNavigationItem>
```

A long press then offers "open in a new tab", the address shows in the status bar, and a crawler can follow it — none of which a `<button>` that calls `router.push` can do. `onValueChange` still fires, so a client-side router keeps working.

A destination that is `disabled` loses its `href` rather than being marked unavailable, because `disabled` is not something an `<a>` can be: a link that only looks unavailable is one a keyboard still lands on and a crawler still follows.

`render` puts a router's `Link` in that anchor's place, so a tap is a client-side navigation rather than a full page load:

```tsx
<MPBottomNavigationItem value="saved" href="/saved" render={<Link />} icon={…}>
  Saved
</MPBottomNavigationItem>
```

`href`, `target` and everything the bar decides still go through, and the bar's `onValueChange` fires either way. Without an `href` it replaces the `<button>` instead, which is the same element in the same place.

`target` brings its own `rel` — `noopener noreferrer` for `_blank` — and a `rel` of your own replaces that rather than extending it.

## activeIcon

MD3 fills the selected icon and outlines the rest, which is a signal that survives being seen out of the corner of an eye:

```tsx
<MPBottomNavigationItem
  value="saved"
  icon={<MPIcon icon={BookmarkOutline} />}
  activeIcon={<MPIcon icon={BookmarkFilled} />}
>
  Saved
</MPBottomNavigationItem>
```

It falls back to `icon`, so a set with only one glyph each still works.

## The indicator widens

The pill grows horizontally out of a circle the size of the glyph slot, over 200ms — MD3's own motion, and the thing that makes moving between destinations read as the mark travelling rather than as one pill blinking off and another blinking on.

It is drawn on a layer inside the slot rather than as a fill on the slot itself. The slot is what holds the destination in place; if it were the thing that grew, a row of five would shuffle sideways every time the reader moved between them.

`width` rather than a scale, because the pill is `corner-full`: a circle stretched horizontally is an ellipse, where a circle that widens — at a radius clamped to half its height — is a pill at every frame in between.

## position and safeArea

`fixed` by default — against the `static` everything else in this library defaults to — because that is what a bottom navigation bar is. `static` puts it back in the flow, which is what a preview or a documentation page wants.

`safeArea` adds `env(safe-area-inset-bottom)` under the row so the destinations clear a phone's home indicator. The container still reaches the bottom of the screen: only the row moves up, so the surface runs under the indicator rather than stopping in a stripe above it.

## Why it takes no color

The active indicator is `secondary-container` because MD3 says it is, and for the reason [MPSegmentedButton](../inputs/segmented-button) gives: a mark saying **where you are** is not an accent statement. `primary` is what a screen reserves for the action it is about, and a navigation bar does nothing.

`divider` is off for a related reason — MD3 separates the bar from the page by _tone_, `surface-container` against the page's `surface`, rather than by a rule. Turn it on when the page behind it is the same tone.

## When this is the wrong component

**On anything wider than a phone**, Material's answer is a navigation rail down the side, not this bar. A row of destinations pinned across a 1400px window is four targets and a great deal of nothing between them.

**For dividing one screen into panels**, use [MPTabs](./tabs).

**For a set of destinations that does not fit in five**, use an [MPDrawer](./drawer).

## Accessibility

- The bar is a `<nav>` landmark. Pass `label` — a landmark with no name is one a screen reader lists as "navigation", which is not helpful on a page with two of them.
- `aria-current="page"` marks the destination the reader is on, and nothing else claims a selected state.
- Names stay in the document at every `labels` setting.
- A disabled destination stays in the bar and stays announced. It is a place that exists and is unavailable, which is not the same as a place that is gone.

## See also

- [MPTabs](./tabs) — dividing one screen rather than moving between screens.
- [MPDrawer](./drawer) — the same destinations when there are more than five.
- [MPSegmentedButton](../inputs/segmented-button) — the other component that marks a choice with `secondary-container`.
