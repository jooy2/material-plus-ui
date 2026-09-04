---
title: MPScrollArea
order: 22
---

# MPScrollArea

<p class="mp-lede">A box with a scrollbar of its own. The browser's is drawn by the operating system — a different width on every machine and a different colour from the sheet it is cut into; this one is an element, so it is the same everywhere and made of the library's own tokens.</p>

<Demo src="scroll-area/hero" :minHeight="300" />

```tsx
import { MPScrollArea } from 'material-plus-ui';

<MPScrollArea maxHeight={320}>
  <MPList>…</MPList>
</MPScrollArea>;
```

## Props

<PropsTable name="MPScrollArea" />

## Something has to bound the box

A scroll area whose height is its content's height never overflows and never shows a bar. `maxHeight` is the usual way to say what bounds it; a `className` carrying a `max-h-*`, or a flex parent that constrains it, are the others.

The bound lands on the **viewport** rather than on the outer element, which matters if you are reaching in with a selector: a `max-height` on the root would leave its own height `auto`, and a viewport asking for `height: 100%` of an `auto` parent gets its content's height instead — a box that is exactly as tall as what is in it and never scrolls.

## It is still a real scroll container

The native bar is hidden rather than the scrolling being reimplemented, which is the difference between this and a component that listens for `wheel` events. The wheel, the trackpad, a touch drag, Page Up, Home and End, a keyboard focus moving into something below the fold, the browser's own scroll anchoring and its overscroll behaviour all work exactly as they did.

## The bar overlays the content

It takes no room in the layout, which is what makes this swappable for the browser's own on a page that has already been designed: adding one reflows nothing.

The trade is that content can pass underneath it, so a box whose content reaches the edge wants a little inline padding of its own.

## There is no bar until there is something to scroll

The overflow is measured after the first render, and a viewport that does not overflow has no scrollbar in the DOM at all. That is why `persistent` is about **opacity** rather than about mounting: it holds a bar that exists, and does not conjure one for a box that fits.

Left off, the bar behaves the way an overlay scrollbar does — drawn while scrolling or hovered, faded out otherwise. Turn it on for a panel whose scrollability is not obvious from its content, where a bar that appears only on hover is a bar a reader has to discover.

## `axis`

`vertical` is the default and the common case. `both` is for content with a width of its own — a wide table, a diagram — where neither axis should be the one that wraps, and it is the only case that draws the little square where two bars meet.

## `size` is the bar's thickness

The only thing `size` sets here. A scrollbar is not a control and has no height on the ladder; what it has is a width, and the five rungs run 6 to 14 pixels. `md` is 10, close to what macOS draws and much narrower than Windows' classic 17 — the point is not to match either, but to be the same on both.
