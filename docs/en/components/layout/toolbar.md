---
title: MPToolbar
order: 24
---

# MPToolbar

<p class="mp-lede">A bar of controls: an application header, a page's action row, the strip along the bottom of an editor. Three slots and a row.</p>

<Demo src="toolbar/hero" :minHeight="220" />

::: fw react

```tsx
import { MPToolbar } from 'material-plus-ui';

<MPToolbar render={<header />} position="sticky" divider start={<Logo />} end={<Actions />}>
  <Title />
</MPToolbar>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPToolbar(
  divider: true,
  start: const BrandMark(),
  end: const HeaderActions(),
  child: const PageTitle(),
);
```

:::

## Props

<PropsTable name="MPToolbar" />

## Three slots

`start` and `end` are pinned to their own ends and the middle (`children` in React, `child` in Flutter) takes what is left. That is the arrangement every toolbar has ever had, so it is laid out here rather than left to a caller and the spacer `<div>` they have to remember.

The middle keeps its room even when there is nothing in it, or a bar with only a logo and a button would collapse the two together in the centre.

::: fw flutter

`start` and `end` each take one widget. Two actions come in a `Row` of their own, as the demo's search button and **Deploy** do, which is also where the gap between them is decided.

:::

## It takes no height

A toolbar is as tall as the controls in it plus its padding, and that padding is the `size`/`density` pair every other surface uses. So the dense bar is `density={-2}` (`density: -2` in Flutter) rather than a second prop meaning the same thing — and the type scale does not move, which is the rule everywhere `density` appears.

## It has no `role="toolbar"`, deliberately

That role is a promise about keyboard behaviour: one tab stop for the whole bar, arrow keys between the controls inside it. A bar that claims it without implementing it is worse for a keyboard reader than one that claimed nothing at all — they are told to press the arrow keys, and nothing happens.

::: fw react

- A page's header wants `render={<header />}`, which is a landmark and is true.
- A genuine roving-focus toolbar wants [MPButtonGroup](../inputs/button-group), which is one.

:::

::: fw flutter

- The bar adds no focus stop and no node of its own. Give it a `semanticLabel` when a screen reader needs to hear it as one named group.
- A genuine roving-focus toolbar wants [MPButtonGroup](../inputs/button-group), which is one.

:::

## Flat until you say otherwise

`elevation` is unset by default, so the bar draws no shadow even when it is pinned. A shadow under a header is a way of saying "there is content beneath this", and that is only true once the page has been scrolled — a bar that arrives already raised has made a claim about a page nobody has moved yet.

Raise it yourself when you are tracking the scroll, or leave it flat and turn on `divider`. The hairline faces the content, so it sits under a `top` bar and over a `bottom` one.

## Pinning

::: fw react

| `position` |  |
| --- | --- |
| `static` | In the flow, scrolling away with the content. |
| `sticky` | In the flow until it reaches the edge, then held there. It takes up its own room, so nothing underneath has to be padded around it. |
| `fixed` | Out of the flow entirely. The page needs padding of its own, or the first screenful sits behind the bar. |
| `absolute` | Pinned to the nearest positioned ancestor rather than to the window — a bar along the edge of a panel. |

A pinned bar drops its corners. A rounded corner against the edge of the screen is a gap with nothing behind it, so only a bar sitting in the flow is a sheet with corners.

:::

::: fw flutter

A Flutter widget goes where its parent puts it, so there is no `position`. A bar that has to stay put belongs in the screen's own layout: above a scroll view in a `Column`, or in a `Stack` over it.

What the React bar works out from its position is whether it has corners. Here that is `rounded`, on by default; turn it off for a bar held against an edge of the screen, where a rounded corner is a gap with nothing behind it. `side` says which way the bar faces, which decides the edge the divider is drawn along.

```dart
MPToolbar(rounded: false, divider: true, side: MPToolbarSide.bottom, child: editorActions)
```

:::

## What it is not

Not [MPHeader](./header). That one is [MPPageLayout](./page-layout)'s own slot and knows about the sidebar, the skip link and the drawer that opens on a phone. This is a bar you can put anywhere, including inside a card.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children` | `child` | Flutter's name for the middle. |
| `position` | `rounded` | There is no CSS position to set. The bar sits where its parent puts it, and the one thing React derives from the position, the corners, is a flag of its own. |
| `side` with `position` | `side` | It only decides which edge the divider faces. |
| `render` | `semanticLabel` | There is no `<header>` element to render as and no banner landmark to claim. A name is what a screen reader can be given instead. |
| `className`, `style` and the attributes a `div` takes | — | There is no class list or style attribute to pass through. |

:::
