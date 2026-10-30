---
title: MPScrollArea
order: 22
---

# MPScrollArea

<p class="mp-lede">A box with a scrollbar of its own. The browser's is drawn by the operating system — a different width on every machine and a different colour from the sheet it is cut into; this one is an element, so it is the same everywhere and made of the library's own tokens.</p>

<Demo src="scroll-area/hero" :minHeight="300" />

::: fw react

```tsx
import { MPScrollArea } from 'material-plus-ui';

<MPScrollArea maxHeight={320}>
  <MPList>…</MPList>
</MPScrollArea>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPScrollArea(maxHeight: 320, child: MPList(children: rows));
```

:::

## Props

<PropsTable name="MPScrollArea" />

## Something has to bound the box

A scroll area whose height is its content's height never overflows and never shows a bar. `maxHeight` is the usual way to say what bounds it; a `className` carrying a `max-h-*`, or a flex parent that constrains it, are the others.

::: fw react

The bound lands on the **viewport** rather than on the outer element, which matters if you are reaching in with a selector: a `max-height` on the root would leave its own height `auto`, and a viewport asking for `height: 100%` of an `auto` parent gets its content's height instead — a box that is exactly as tall as what is in it and never scrolls.

:::

::: fw flutter

In Flutter the box is bounded by `maxHeight`, by `height`, or by a parent that hands it a bounded height, such as an `Expanded` in a `Column`.

:::

::: fw react

## It is still a real scroll container

The native bar is hidden rather than the scrolling being reimplemented, which is the difference between this and a component that listens for `wheel` events. The wheel, the trackpad, a touch drag, Page Up, Home and End, a keyboard focus moving into something below the fold, the browser's own scroll anchoring and its overscroll behaviour all work exactly as they did.

:::

::: fw flutter

## It is still a real scroll view

Underneath is an ordinary `SingleChildScrollView`, so the wheel, a trackpad, a touch drag and dragging the thumb all work as they do anywhere else in Flutter. While the content overflows, the box is a keyboard stop of its own: the arrow keys move it a line, Page Up and Page Down a screen, Home and End to its ends, as a browser moves a scrollable box. A box that fits adds nothing to the focus order.

:::

## The bar overlays the content

It takes no room in the layout, which is what makes this swappable for the browser's own on a page that has already been designed: adding one reflows nothing.

The trade is that content can pass underneath it, so a box whose content reaches the edge wants a little inline padding of its own.

::: fw react

## There is no bar until there is something to scroll

The overflow is measured after the first render, and a viewport that does not overflow has no scrollbar in the DOM at all. That is why `persistent` is about **opacity** rather than about mounting: it holds a bar that exists, and does not conjure one for a box that fits.

Left off, the bar behaves the way an overlay scrollbar does — drawn while scrolling or hovered, faded out otherwise. Turn it on for a panel whose scrollability is not obvious from its content, where a bar that appears only on hover is a bar a reader has to discover.

:::

::: fw flutter

## No thumb for a box that fits

A box whose content fits draws no thumb at all, so `persistent` holds a bar that exists and does not conjure one for a box that fits. Left off, the bar shows while the content moves or the pointer is over the box, and fades out otherwise; turn it on for a panel whose scrollability is not obvious from its content.

:::

## `axis`

`vertical` is the default and the common case. `both` is for content with a width of its own — a wide table, a diagram — where neither axis should be the one that wraps, and it is the only case that draws the little square where two bars meet.

## `size` is the bar's thickness

The only thing `size` sets here. A scrollbar is not a control and has no height on the ladder; what it has is a width, and the five rungs run 6 to 14 pixels. `md` is 10, close to what macOS draws and much narrower than Windows' classic 17 — the point is not to match either, but to be the same on both.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `maxHeight` and `height` take a CSS length | `double`, logical pixels | There are no CSS lengths here. |
| the thumb darkens to 56% under the pointer | the thumb stays at 38% | The framework's `RawScrollbar` does not change colour on hover without `material.dart`. |
| the browser's own scrolling, Base UI's bar | a `SingleChildScrollView` with a `RawScrollbar` | The same behaviour from the framework's own parts. |
| `aria-label` | `semanticLabel` | The name a box reached by the keyboard is announced by. |

:::
