---
title: MPHeader
order: 15
---

# MPHeader

<p class="mp-lede">The bar across the top of a page. MD3's top app bar, with a site's own three regions on it — the mark, the middle, the actions.</p>

<Demo src="header/hero" :minHeight="220" />

::: fw react

```tsx
import { MPHeader, MPButton } from 'material-plus-ui';

<MPHeader brand="Acme" actions={<MPButton size="sm">Sign in</MPButton>}>
  <nav>…</nav>
</MPHeader>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHeader(
  brand: const <Widget>[Text('Acme')],
  actions: <Widget>[MPButton(size: MPSize.sm, onPressed: signIn, child: const Text('Sign in'))],
  child: navigation,
);
```

:::

## Props

<PropsTable name="MPHeader" />

::: fw react

## Why it is a component and not a row of divs

Because a `<header>` at the top level of a document **is** the `banner` landmark.

That tag is what a screen reader's landmark list, a reader mode and a search engine's understanding of the page are all built out of, and it is the one thing a styled `<div>` cannot be. Everything else here — the three regions, the ladder, the surface — is what makes that tag comfortable to use.

:::

::: fw flutter

## Why it is a widget and not a row

Because the three regions are laid out against each other: the middle can only sit on the bar's own midline if the ends are the widget's to measure. The ladder, the surface and the single rule along the bottom are what make that comfortable to use.

Flutter's semantics have no `banner` role, so the bar claims none on its own. Give it a `semanticLabel` and it becomes a named landmark region.

:::

## The three slots

::: fw react

`brand`, `children` and `actions`, laid out in that order, and they are props rather than compound sub-components for [MPCard](./card#why-the-sections-are-props)'s reason: the arrangement of a bar is fixed, and what a caller wants to decide is what goes in each region.

:::

::: fw flutter

In Dart the slots are `brand`, `child` and `actions`. `brand` and `actions` are lists, laid out in a row with the slot's own gap, so a mark and a name, or two buttons, need no row of their own. With no middle, the actions still sit at the end of the bar.

:::

There is a second reason here. The middle can only be centred on the bar's own midline if the two ends are the component's to measure — a caller stacking three wrappers by hand has no way to make the ends equal, so their headline sits wherever the brand happens to end.

A slot left empty draws nothing at all: no wrapper, no gap.

Only the **brand** takes a type role — `title-large` at `md`, which is MD3's top app bar headline. The middle is as likely to be a row of links or a search field as a headline, and a scale imposed on it would be one every link had to undo.

## align

<Demo src="header/align" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/header/align.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/header/align.dart

:::

</Demo>

`center` is MD3's own **center-aligned top app bar**, and it is centred on the _bar_ rather than in the space left over.

The difference is the whole reason this is a prop. Centring in what is left over puts the middle wherever the brand happens to end, so a name one character longer moves the headline — which is exactly what a reader notices between two pages of one site. Both ends are given equal shares instead, and equal ends put the middle on the midline whatever is in them. An end with nothing in it still takes its share.

## variant

<Demo src="header/variant" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/header/variant.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/header/variant.dart

:::

</Demo>

The **container** ladder, because a bar holds somebody else's content and dyeing it would dye theirs — the argument is [MPBox](./box#why-it-is-never-dyed-and-takes-no-color)'s.

| Variant    | What it paints                                   |
| ---------- | ------------------------------------------------ |
| `tonal`    | `surface-container` — MD3's **scrolled** app bar |
| `outlined` | `surface` with a hairline along the bottom edge  |
| `filled`   | `surface-container-highest`                      |
| `elevated` | `surface-container-low` under a level-2 shadow   |
| `text`     | Nothing at all — for a bar over a hero image     |

### Why there is no `divider`

[MPBottomNavigation](./bottom-navigation) has one and this does not, and the difference is that this takes a `variant`.

MD3 separates a bar from the content by **tone**, not by a rule: `surface-container` against `surface`. The one case a hairline is for is the bar that paints the page's own surface — and that bar is `variant="outlined"`. The rule is what `outlined` _means_ here: a container's outline goes all the way round, and a bar has exactly one edge with anything on the other side of it. That is the same specialization [MPDrawer](./drawer) makes for its own free edge.

::: fw react

## position

`sticky` by default. It holds the bar against the top of the window once the page has scrolled to it, while leaving it in the flow — so nothing below has to be padded out of its way.

`fixed` takes it out of the flow entirely. Inside an [MPPageLayout](./page-layout) that is answered for you: the layout measures the bar and reserves its height, so the first paragraph is not underneath it.

`static` lets the bar scroll away, which is right for a marketing page whose header is not navigation you keep reaching for.

:::

::: fw flutter

## Where it sits

A Flutter screen has no document scroll for a bar to stick to, so there is no `position`: the bar stays where it is placed. Put it above the part of the screen that scrolls, which is where [MPPageLayout](./page-layout)'s `header` slot puts it, and it stays in reach while the content moves under it. For a bar over a hero, lay it over the picture in a `Stack`.

:::

::: fw react

## Inside a layout, and outside one

Inside an [MPPageLayout](./page-layout) the bar registers itself, so a column that holds its place knows how far down the window to start and a `fixed` bar has its height reserved.

Outside one it is simply a bar, and everything above still holds. That is deliberate — a landing page with a header and no sidebar should not have to adopt a layout to get one.

:::

::: fw flutter

## With MPPageLayout, and without one

Inside an [MPPageLayout](./page-layout) the bar is simply what the `header` slot holds: the layout's `Column` already gives the band below it what the bar left, so there is nothing to measure and nothing to register. Outside one it is a bar on its own, and a landing page with a header and no sidebar needs no layout to have one.

:::

## Examples

### The hamburger goes in the brand slot

Ahead of the mark, which is where thirty years of them have taught readers to look:

::: fw react

```tsx
<MPHeader
  brand={
    <>
      <MPSidebarTrigger />
      Acme
    </>
  }
/>
```

:::

::: fw flutter

```dart
const MPHeader(brand: <Widget>[MPSidebarTrigger(), Text('Acme')])
```

:::

An [MPSidebarTrigger](./sidebar#mpsidebartrigger) draws itself only while the sidebar is collapsed, so nothing here needs a condition.

### Lining the bar up with the article under it

::: fw react

```tsx
<MPHeader maxWidth="md" brand="Acme">…</MPHeader>
<MPContainer maxWidth="md">The article.</MPContainer>
```

:::

::: fw flutter

```dart
Column(
  children: <Widget>[
    MPHeader(
      maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md),
      brand: const <Widget>[Text('Acme')],
      child: navigation,
    ),
    const MPContainer(
      maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
      child: Text('The article.'),
    ),
  ],
)
```

:::

The sheet still spans the window; only the row of slots is held to the measure. Both read the same ladder, so the two line up on one edge at every width.

### A transparent bar over a hero

::: fw react

```tsx
<MPHeader variant="text" position="absolute" brand="Acme" />
```

:::

::: fw flutter

```dart
Stack(
  children: <Widget>[
    hero,
    const MPHeader(variant: MPVariant.text, brand: <Widget>[Text('Acme')]),
  ],
)
```

:::

::: fw react

`absolute` pins it to the region it is in rather than to the window — see [MPPosition](../../design/prop-conventions).

:::

## Accessibility

::: fw react

- The bar is a `<header>`. At the top level of a document that is the `banner` landmark; nested inside an `<article>` or a `<section>` it is not, which is correct — a card's own header is not the site's.
- Give it a `label` when a page has two. "Banner" twice tells a reader which is which not at all.
- The middle slot is not a `<nav>` on its own. Put one there when what is in it is navigation, so a screen reader can offer it as a region.
- The bar has no tab stop of its own; everything focusable in it is whatever you put in a slot.

:::

::: fw flutter

- Flutter has no `banner` role. With a `semanticLabel` the bar is a named landmark region; without one it adds nothing to the semantics tree.
- Give it a name when a screen has two bars, so a reader can tell which is which.
- The bar has no focus stop of its own; everything focusable in it is whatever you put in a slot.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| a `<header>`, the `banner` landmark | a named region when given `semanticLabel` | Flutter's semantics have no `banner` role. |
| `brand` and `actions` take any node | `List<Widget>`, laid out in a row with the slot gap | A fragment of several things is a list in Dart. |
| `position` | — | There is no document scroll to stick to. A bar stays where it is placed; `MPPageLayout` keeps it above the scrolling region. |
| registers itself with `MPPageLayout` | nothing to register | The layout's `Column` already does the arithmetic. |
| `label` | `semanticLabel` | The library's Flutter name for a screen reader's label. |
| `render` | — | There is no element to replace. |

:::

## See also

- [MPPageLayout](./page-layout) — the skeleton this is the top of.
- [MPFooter](./footer) — the same decisions at the other end of the page.
- [MPBottomNavigation](./bottom-navigation) — MD3's navigation bar, which is a bar of destinations rather than a bar of regions.
- [MPSidebar](./sidebar) — the column beside the content, and the trigger that belongs in `brand`.
