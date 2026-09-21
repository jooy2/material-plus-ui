---
title: MPAnimateLighting
order: 11
---

# MPAnimateLighting

<p class="mp-lede">A light travelling around the outside of something. The way to say "this one, now" without moving anything — the row that is processing, the field being checked, the plan being recommended.</p>

<Demo src="animate-lighting/hero" :minHeight="300" />

```tsx
import { MPAnimateLighting } from 'material-plus-ui';

<MPAnimateLighting size="md">
  <MPCard title="Recommended" />
</MPAnimateLighting>;
```

## Props

<PropsTable name="MPAnimateLighting" />

## The light is behind the content

Not on it. A pseudo-element sits at `z-index: -1` inside an isolated stacking context, so what a reader sees is a glow escaping from **under** the edges rather than a border drawn around them.

That is what lets it go around a [card](../layout/card), a [button](../inputs/button) or a whole form section without touching how any of them are drawn. Nothing inside is overlaid, nothing is tinted, and the content stays exactly as legible as it was — which is the entire reason to reach for it instead of a colour change or a pulse.

## The content has to paint its own surface

"Behind" only reads as behind if there is something opaque in front of it. Around an `outlined` card or a `text` button — both of which paint no background at all — the arc travels **through** the content rather than under it.

That is the correct rendering of a glow behind a transparent box; it is just not the effect anybody wanted. Give the content a surface: `variant="filled"` or `variant="elevated"`.

## `size` has to match what is inside

The glow follows the wrapper's **own** corners, via `border-radius: inherit`. So an `xl` card inside an `md` Lighting will show light poking out of four corners the card has already rounded away.

Set the rung to the radius of the content, not to its importance.

## Why the arc is a conic gradient

What actually animates is the gradient's `from` angle, which is only animatable because the angle is a registered custom property with a type — `@property --mp-glow-angle { syntax: '<angle>' }`.

The obvious alternative, rotating the pseudo-element itself, swings its corners out past the element on every quarter turn: a rectangle spun about its centre is wider than the rectangle. The gradient stays put and only its light moves.

## There is no `easing`

A revolution has no beginning to decelerate into. An eased one reads as the light hesitating at an arbitrary point on a circle that has no arbitrary points, so the curve is `linear` and there is no prop to get it wrong with.

## Examples

<Demo src="animate-lighting/shape" :minHeight="280">

<<< @/.vitepress/demos/animate-lighting/shape.tsx

</Demo>

### arc

How much of the outline is lit at once, in degrees. Small — under about 30 — is a travelling spark. Large is a sweep, and past about 180 it stops reading as travel and becomes a breathing halo.

### blur

How soft the light is. At `0` it is a hard-edged wedge, which reads as a graphic rather than as light. The default of `4px` is the smallest value that still reads as glow.

### color

One of the four MD3 accent families, and not an arbitrary colour — for the reason nothing in this library takes one: to change what `primary` **is**, set the token.

## Accessibility

- Under `prefers-reduced-motion` the arc stops travelling and becomes an **even glow**. That is the same trade [MPSkeleton](../feedback/skeleton) makes: the decoration survives, the motion does not, and a light that marked the live row still marks it while holding still.
- The mark is decoration and reaches nothing in the accessibility tree. Whatever it is pointing at — "recommended", "processing", "checking" — has to be sayable in the content as well.
- Nothing inside the wrapper changes, so contrast, focus rings and hit areas are exactly what they were without it.
- It runs forever by default. On a page with several live regions that is several things moving at once; mark one.

## See also

- [MPAnimateBlink](./animate-blink) — the other way of saying "look here", with the same warnings and one more.
- [MPOverlay](../feedback/overlay) — for covering a region because something is happening **to** it.
- [MPProgressLinear](../feedback/progress-linear) — when there is a real amount of progress to report.
