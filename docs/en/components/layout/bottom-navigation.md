---
title: MPBottomNavigation
order: 13
---

# MPBottomNavigation

<p class="mp-lede">A row of destinations held against the bottom edge of the window. Material calls this the <strong>navigation bar</strong>, and what is drawn is the specification's: an 80dp <code>surface-container</code> bar, with the destination the reader is on marked by a 64×32dp <code>secondary-container</code> pill behind its glyph.</p>

<Demo src="bottom-navigation/hero" :minHeight="140" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPBottomNavigation(
  label: 'Main',
  value: page,
  onChanged: (Object next) => setState(() => page = next),
  children: const <Widget>[
    MPBottomNavigationItem(value: 'home', label: 'Home', icon: MPIcon(icon: HomeGlyph())),
    MPBottomNavigationItem(value: 'search', label: 'Search', icon: MPIcon(icon: SearchGlyph())),
  ],
)
```

:::

Three to five destinations. Below three the bar is a row with a gap in it; above five the targets stop being hittable with a thumb, which is the one input this component is drawn for.

## Props

<PropsTable name="MPBottomNavigation" />

### MPBottomNavigationItem

<PropsTable name="MPBottomNavigationItem" />

## Why it is navigation and not a tab list

A deliberate choice about what is being promised.

A tab list owes a keyboard reader one tab stop for the whole set and arrow keys within it, and owes a screen reader a panel per tab. A navigation bar switches what the **page** is, not which panel of one is showing — and claiming the role without the behaviour is worse for a keyboard reader than never claiming it, because they will reach for arrow keys that do nothing.

::: fw react

What is claimed instead is `aria-current="page"`, which is the honest statement: this is the destination you are on. Every item is an ordinary button or link, in the tab order, doing what buttons and links do.

:::

::: fw flutter

What is claimed instead is a navigation landmark, `SemanticsRole.navigation`, with the destination you are on marked **selected** and no other destination claiming a selected state at all. Every item is an ordinary button, its own focus stop, doing what buttons do.

:::

For dividing one screen into panels, that genuinely is [MPTabs](./tabs).

## labels

<Demo src="bottom-navigation/labels" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/bottom-navigation/labels.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/bottom_navigation/labels.dart

:::

</Demo>

| `labels`   | Drawn                    |
| ---------- | ------------------------ |
| `all`      | Every destination's name |
| `selected` | Only the current one's   |
| `none`     | No names at all          |

`all` is the default and it is the only one that works for a reader who has not used the application before. A row of four glyphs is a puzzle the first time and a habit the fifth.

**Undrawn is never unsaid.** In the other two the names stay in the document for a screen reader, because a glyph on its own has no accessible name at all.

::: fw flutter

That is why a Flutter destination's name is `label`, a `String`, rather than a child widget. It is drawn when `labels` draws it and it is the destination's semantics label at every setting; a widget could not be both, and a name left undrawn would take its only accessible text with it.

:::

::: fw react

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

:::

## activeIcon

MD3 fills the selected icon and outlines the rest, which is a signal that survives being seen out of the corner of an eye:

::: fw react

```tsx
<MPBottomNavigationItem
  value="saved"
  icon={<MPIcon icon={BookmarkOutline} />}
  activeIcon={<MPIcon icon={BookmarkFilled} />}
>
  Saved
</MPBottomNavigationItem>
```

:::

::: fw flutter

```dart
const MPBottomNavigationItem(
  value: 'saved',
  label: 'Saved',
  icon: MPIcon(icon: BookmarkOutline()),
  activeIcon: MPIcon(icon: BookmarkFilled()),
)
```

:::

It falls back to `icon`, so a set with only one glyph each still works.

## The indicator widens

The pill grows horizontally out of a circle the size of the glyph slot, over 200ms — MD3's own motion, and the thing that makes moving between destinations read as the mark travelling rather than as one pill blinking off and another blinking on.

It is drawn on a layer inside the slot rather than as a fill on the slot itself. The slot is what holds the destination in place; if it were the thing that grew, a row of five would shuffle sideways every time the reader moved between them.

`width` rather than a scale, because the pill is `corner-full`: a circle stretched horizontally is an ellipse, where a circle that widens — at a radius clamped to half its height — is a pill at every frame in between.

## position and safeArea

::: fw react

`fixed` by default — against the `static` everything else in this library defaults to — because that is what a bottom navigation bar is. `static` puts it back in the flow, which is what a preview or a documentation page wants.

`safeArea` adds `env(safe-area-inset-bottom)` under the row so the destinations clear a phone's home indicator. The container still reaches the bottom of the screen: only the row moves up, so the surface runs under the indicator rather than stopping in a stripe above it.

:::

::: fw flutter

There is no `position`. Where a widget sits is the layout's decision, so the bar is simply the last child of the screen's `Column`, or of whatever holds the screen together.

`safeArea` adds the window's bottom inset, `MediaQuery.paddingOf(context).bottom`, under the row so the destinations clear a phone's home indicator. The surface still reaches the bottom of the screen: only the row moves up, so the surface runs under the indicator rather than stopping in a stripe above it. Leave it on and do not wrap the bar in a `SafeArea` as well, which would lift the surface off the edge with it.

:::

## Why it takes no color

The active indicator is `secondary-container` because MD3 says it is, and for the reason [MPSegmentedButton](../inputs/segmented-button) gives: a mark saying **where you are** is not an accent statement. `primary` is what a screen reserves for the action it is about, and a navigation bar does nothing.

`divider` is off for a related reason — MD3 separates the bar from the page by _tone_, `surface-container` against the page's `surface`, rather than by a rule. Turn it on when the page behind it is the same tone.

## When this is the wrong component

**On anything wider than a phone**, Material's answer is a navigation rail down the side, not this bar. A row of destinations pinned across a 1400px window is four targets and a great deal of nothing between them.

**For dividing one screen into panels**, use [MPTabs](./tabs).

**For a set of destinations that does not fit in five**, use an [MPDrawer](./drawer).

## Accessibility

::: fw react

- The bar is a `<nav>` landmark. Pass `label` — a landmark with no name is one a screen reader lists as "navigation", which is not helpful on a page with two of them.
- `aria-current="page"` marks the destination the reader is on, and nothing else claims a selected state.
- Names stay in the document at every `labels` setting.
- A disabled destination stays in the bar and stays announced. It is a place that exists and is unavailable, which is not the same as a place that is gone.

:::

::: fw flutter

- The bar is a navigation landmark, `SemanticsRole.navigation`. Pass `label`: a landmark with no name is one a screen reader lists as "navigation", and Flutter reports two unnamed navigation landmarks on one screen as an error in debug builds.
- The destination the reader is on is marked selected, and nothing else claims a selected state.
- Each destination is one button node carrying its name, its state and its tap. The glyph and the drawn name inside it are excluded, so nothing is read twice.
- Names stay on the semantics tree at every `labels` setting.
- Every destination is its own focus stop, reached with <kbd>Tab</kbd> and pressed with <kbd>Enter</kbd> or <kbd>Space</kbd>. The focus ring is `secondary`, drawn inside the destination, and only for the keyboard.
- A disabled destination stays in the bar and stays announced, but leaves the focus order. It is a place that exists and is unavailable, which is not the same as a place that is gone.
- The indicator widens and fades in 200ms, and arrives at once when the platform asks for reduced motion.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children` on an item, the name | `label`, a `String` | It is drawn, and it is the semantics label even while it is not drawn. A widget could not be both. |
| `defaultValue` | `initialValue` | Flutter's name for the value a widget starts with. |
| `onValueChange` | `onChanged` | A plain change of value. |
| `string \| number` values | `MPBottomNavigationValue`, any `Object` | Dart has no union type; anything that compares with `==` works. |
| `onClick` on an item | `onPressed` | Called after the bar has been told, where a router is called. |
| `href`, `target`, `rel`, `render` | — | There is no link element and nothing crawls a Flutter app. Navigate in `onChanged` or `onPressed`. |
| `position` | — | A CSS idea. The bar sits where the layout puts it. |
| `aria-current="page"` | selected | Flutter's semantics have no "current"; selected on the one destination is the nearest statement. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPTabs](./tabs) — dividing one screen rather than moving between screens.
- [MPDrawer](./drawer) — the same destinations when there are more than five.
- [MPSegmentedButton](../inputs/segmented-button) — the other component that marks a choice with `secondary-container`.
