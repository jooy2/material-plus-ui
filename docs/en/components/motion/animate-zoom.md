---
title: MPAnimateZoom
order: 3
---

# MPAnimateZoom

<p class="mp-lede">Content arriving from the middle of where it will end up. The effect for the one thing on a screen that is meant to interrupt — a confirmation, a result, a number that has just landed.</p>

<Demo src="animate-zoom/hero" :minHeight="360" />

```tsx
import { MPAnimateZoom } from 'material-plus-ui';

<MPAnimateZoom>
  <MPCard title="Payment received" />
</MPAnimateZoom>;
```

## Props

<PropsTable name="MPAnimateZoom" />

## Use it once

A zoom is an interruption, and an interruption that happens three times on one screen is a layout. If several things should arrive, they should arrive as a **set** — that is [MPAnimateAppear](./animate-appear), where the effect belongs to the group and walks a reader down it in the order it should be read.

## There is no `origin`

On purpose. A zoom anchored to a corner is a [grow](./animate-grow), and the library does not offer two spellings of one idea.

The centre is written out on the element rather than left to the stylesheet's default, so a `transform-origin` inherited from a caller's own rule cannot quietly turn one effect into the other.

## The same keyframe as a grow

Both are a change of scale, so both run `mp-anim-scale`. A second identical `@keyframes` would only be a second place to fix a bug.

What separates them is the distance and the anchor: a zoom starts at `0.4` about the middle, a grow at `0.8` about wherever you point it. Two gestures, one piece of arithmetic.

## Examples

<Demo src="animate-zoom/distance" :minHeight="300">

<<< @/.vitepress/demos/animate-zoom/distance.tsx

</Demo>

### from

Below `1` the content comes forward out of the middle. Above `1` it arrives oversized and settles back, which reads as something being pushed **towards** the reader.

Very low values — under about `0.2` — cross so much distance that the content is unreadable for most of the animation. That is a splash, not an entrance.

### fade

On by default, and worth keeping for an arrival: the opacity is what makes the first frames read as _not there yet_ rather than as _tiny_.

## Accessibility

- Under `prefers-reduced-motion` nothing scales and the content is simply there at its final size.
- A zoom resamples everything inside it across a long travel, so it is the wrong wrapper for a paragraph. Put it around the headline, the figure or the card — the thing a reader looks at rather than reads — and use [MPAnimateFade](./animate-fade) for the prose.
- The content occupies its final layout size from the first frame, so nothing around it moves while the animation runs.
- If the thing arriving also demands attention — a confirmation, an error — say so in the content. The motion is not the message, and a reader with a reduced-motion preference will never see it.

## See also

- [MPAnimateGrow](./animate-grow) — the same arithmetic, anchored, at less than half the distance.
- [MPAnimateAppear](./animate-appear) — for several things arriving as a set.
- [MPDialog](../feedback/dialog) — when the interruption should also take the page.
