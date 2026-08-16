---
title: MPAnimateRotate
order: 5
---

# MPAnimateRotate

<p class="mp-lede">Content turning about a point. Two angles rather than one, which is what lets one component be both a swing into place and a spin that never lands.</p>

<Demo src="animate-rotate/hero" :minHeight="240" />

```tsx
import { MPAnimateRotate } from 'material-plus-ui';

// An arrival
<MPAnimateRotate>
  <MPIcon icon={ICONS['chevron-down']} />
</MPAnimateRotate>

// A spin
<MPAnimateRotate from={0} to={360} repeat="infinite" easing="linear" fade={false}>
  <MPIcon icon={ICONS.spinner} />
</MPAnimateRotate>
```

## Props

<PropsTable name="MPAnimateRotate" />

## Two angles, two effects

`from` alone is an **arrival**: something swings into place and stops. That is the default — half a turn back, landing at zero.

`from` and `to` together with `repeat="infinite"` and `easing="linear"` is a **spin**: it starts where it ends, so it never lands and never jumps. Turn `fade` off for it, or the repeated opacity ramp reads as flickering.

One component covers both because a second one would be the same keyframe under a different name.

## What this is not for

**Text.** A rotated word is resampled along its whole length, and at any angle that is not a multiple of 90° every stem in it lands between pixels. Rotation is the one movement this library allows on a **glyph** without argument — a chevron is turned rather than redrawn across the whole component set, because a turned arrow is still the same arrow — and that permission does not extend to a sentence.

**A loading indicator.** A spinning mark says something is moving; an indeterminate indicator has to say what is being waited on and reserve the space the result will take. That is [MPProgressCircular](../feedback/progress-circular), which is also the one thing here that keeps moving under `prefers-reduced-motion` — because a spinner that has stopped is lying about whether anything is happening, while a decorative turn that does not play has lost nothing.

## `duration` is longer here

`long2` — 500ms — where a fade takes `medium2` and a slide `medium4`. Half a turn is a longer journey than one axis of opacity, and it reads as rushed at the same number. That is the whole reason the duration table has a row per effect rather than one figure.

## Examples

### origin

Any CSS `transform-origin`. The default is the middle; anchor it elsewhere for something hinged — a panel opening about its own top edge, a needle pivoting at its base.

Like [MPAnimateGrow](./animate-grow), this reaches the standalone `rotate` property through `transform-origin`, so the effect never touches the `transform` shorthand and a caller's own transform survives it.

### fade

On for an arrival, off for a spin. There is no third answer worth a prop of its own.

## Accessibility

- Under `prefers-reduced-motion` nothing turns and the content sits at its `to` angle — which for the default is upright, and for a spin is wherever the caller said the turn ends.
- An infinite rotation is motion that never stops in the corner of a page somebody is reading. It is the one kind of motion this library otherwise refuses, so it should be small, decorative, and never the only thing carrying a message.
- Rotation does not change the layout box, so nothing around a turning element moves.

## See also

- [MPProgressCircular](../feedback/progress-circular) — when the turning is about waiting rather than about decoration.
- [MPAnimateGrow](./animate-grow) — the other effect that takes an `origin`.
- [MPAnimateBlink](./animate-blink) — the other infinite effect, and the same warnings apply to it.
