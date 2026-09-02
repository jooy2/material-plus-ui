---
title: MPAnimateMarquee
order: 10
---

# MPAnimateMarquee

<p class="mp-lede">Content scrolling steadily past, forever. Two copies laid end to end, moving at the pace of a reader rather than at whatever pace fits the box.</p>

<Demo src="animate-marquee/hero" :minHeight="180" />

```tsx
import { MPAnimateMarquee } from 'material-plus-ui';

<MPAnimateMarquee speed={50} gap="1rem">
  {tools.map((tool) => (
    <MPChip key={tool}>{tool}</MPChip>
  ))}
</MPAnimateMarquee>;
```

## Props

<PropsTable name="MPAnimateMarquee" />

## Why there is no seam

The content is laid down **twice**, and each copy travels exactly its own length plus the gap. So the moment the first copy has left, the second is standing precisely where the first began: no jump, no seam, and no frame where the strip is empty.

None of that depends on measuring anything. A percentage `translate` resolves against the element's own box, so `-100%` is one copy's own width whatever that turns out to be.

Raise `copies` when the content is short enough to leave a hole behind itself — two copies of something narrower than its container will run out before the second arrives.

## `speed`, not `duration`

A duration would mean a strip of four logos and a strip of forty crossing the same box in the same time, with the long one becoming a blur. `speed` is pixels per second, so both move at the pace of a reader.

That is the one thing here that is measured, and it is re-measured whenever the strip or its container changes size. An explicit `duration` still wins if you want one.

## `pauseOnHover` is not decoration

Content moving past a pointer cannot be clicked reliably. A link inside a marquee that never stops is a link nobody can follow, and a name a reader is trying to read is a name they never quite catch.

It is on by default and should stay on for anything with a link, a button or a word worth reading in it.

## Examples

<Demo src="animate-marquee/vertical" :minHeight="240">

<<< @/.vitepress/demos/animate-marquee/vertical.tsx

</Demo>

### orientation and reverse

`vertical` runs the strip down the box instead of across it — give the container a height, or there is nothing to scroll within. `reverse` runs either axis the other way.

Two strips running in opposite directions is the usual pattern for a wall of logos, and it also stops the pair reading as one long line.

### gap

The space between items, and between the last item of one copy and the first of the next. It is read back off the computed style rather than parsed from the prop, because `'2rem'` is only a number once a font size has been resolved.

## Accessibility

- Only the first copy is read out. Every other one carries `aria-hidden`, or a screen reader would announce the whole strip as many times as it was laid down.
- Under `prefers-reduced-motion` the strip **stops** rather than slowing. A row of logos that has stopped scrolling is still a row of logos, and the first copy is fully in frame — which is more than the moving version guarantees at any given moment.
- Moving text is harder to read than still text, and text moving horizontally past a fixed point is the hardest case there is. A marquee is for a set a reader is meant to take in at a glance, not for content they have to read.
- Anything interactive inside one needs `pauseOnHover` on, and is still harder to reach than the same thing standing still. Prefer a real list where the content matters.

## See also

- [MPCarousel](../layout/carousel) — for content a reader steps through themselves, with real controls.
- [MPAnimateHeadline](./animate-headline) — for a set of phrases where one at a time is enough.
- [MPList](../display/list) — for content that should simply be readable.
