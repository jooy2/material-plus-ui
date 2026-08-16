---
title: MPAnimateGrow
order: 2
---

# MPAnimateGrow

<p class="mp-lede">Content unfolding from a point. A panel out of a toolbar, a card out of the row it sits in, a sheet out of the button that summoned it.</p>

<Demo src="animate-grow/hero" :minHeight="380" />

```tsx
import { MPAnimateGrow } from 'material-plus-ui';

<MPAnimateGrow origin="top">
  <MPCard title="Out of the toolbar" />
</MPAnimateGrow>;
```

## Props

<PropsTable name="MPAnimateGrow" />

## What separates this from a zoom

`origin`, and how far it travels.

A grow starts at `0.8` of its final size and can be anchored to any point, so it reads as something **opening out of the thing next to it**. The travel is short, which means the content inside is legible for most of the animation rather than being a smear that resolves at the end.

[MPAnimateZoom](./animate-zoom) starts at less than half and always about the middle. It comes at the reader rather than out of anything, which is a different sentence about a different kind of content.

This is as close as a component library gets to MD3's **container transform**: the specification's version morphs one element's bounds into another's, which needs both elements and a shared identity between them. What is portable is the half a wrapper can do on its own — the destination unfolding from where it came from.

## Why `transform-origin` and not a transform

`origin` sets `transform-origin`, which governs the standalone `scale` property as well as the `transform` shorthand. The animation itself only ever writes `scale`, so a caller's own `transform` on the same element survives the effect instead of being overwritten by it.

It is also why a `transformOrigin` in your own `style` still wins: the prop is written before the caller's style object, not after it.

## Examples

<Demo src="animate-grow/origin" :minHeight="320">

<<< @/.vitepress/demos/animate-grow/origin.tsx

</Demo>

### origin

Any CSS `transform-origin`. `'top'` unfolds downwards, `'bottom left'` out of a corner, `'center'` — the default — out of the middle.

Anchor it to the place the content came from. A menu under a button grows from `'top'`; a card expanding in a grid grows from whichever corner it was sitting in.

### from

The scale it starts at, as a multiple of its final size. Above `1` it arrives oversized and settles down onto the page rather than up out of it, which is the gesture for something being **put down** rather than opened.

### fade

On by default. Turn it off for something already on the page that is only changing size — a repeated fade on content a reader is already looking at reads as flickering rather than as an entrance.

## Accessibility

- Under `prefers-reduced-motion` nothing scales and the content is simply there at its final size.
- Scaling resamples whatever is inside, text included. That is fine over the short travel a grow makes and at a `duration` a reader does not have time to study, but it is the reason [MPAnimateFade](./animate-fade) — not this — is the effect to wrap a page of prose in.
- The content is in the document from the first frame, at its final layout size, so nothing below it moves as the animation runs and a screen reader is never waiting on it.

## See also

- [MPAnimateZoom](./animate-zoom) — the same arithmetic at more than twice the distance, and always about the centre.
- [MPAnimateFade](./animate-fade) — for content that must not be resampled.
- [MPAnimateSlide](./animate-slide) — for something arriving from an edge rather than unfolding in place.
