---
title: MPAnimateLighting
order: 11
---

# MPAnimateLighting

<p class="mp-lede">A light travelling around the outside of something. The way to say "this one, now" without moving anything — the row that is processing, the field being checked, the plan being recommended.</p>

<Demo src="animate-lighting/hero" :minHeight="300" />

::: fw react

```tsx
import { MPAnimateLighting } from 'material-plus-ui';

<MPAnimateLighting size="md">
  <MPCard title="Recommended" />
</MPAnimateLighting>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateLighting(
  size: MPSize.md,
  child: MPCard(variant: MPVariant.elevated, title: Text('Recommended')),
);
```

:::

## Props

<PropsTable name="MPAnimateLighting" />

## The light is behind the content

::: fw react

Not on it. A pseudo-element sits at `z-index: -1` inside an isolated stacking context, so what a reader sees is a glow escaping from **under** the edges rather than a border drawn around them.

:::

::: fw flutter

Not on it. The glow is the first child of a `Stack` and the content the last, so the content is painted over it and what a reader sees is a glow escaping from **under** the edges rather than a border drawn around them.

:::

That is what lets it go around a [card](../layout/card), a [button](../inputs/button) or a whole form section without touching how any of them are drawn. Nothing inside is overlaid, nothing is tinted, and the content stays exactly as legible as it was — which is the entire reason to reach for it instead of a colour change or a pulse.

## The content has to paint its own surface

"Behind" only reads as behind if there is something opaque in front of it. Around an `outlined` card or a `text` button — both of which paint no background at all — the arc travels **through** the content rather than under it.

::: fw react

That is the correct rendering of a glow behind a transparent box; it is just not the effect anybody wanted. Give the content a surface: `variant="filled"` or `variant="elevated"`.

:::

::: fw flutter

That is the correct rendering of a glow behind a transparent box; it is just not the effect anybody wanted. Give the content a surface: `variant: MPVariant.filled` or `variant: MPVariant.elevated`.

:::

## `size` has to match what is inside

::: fw react

The glow follows the wrapper's **own** corners, via `border-radius: inherit`. So an `xl` card inside an `md` Lighting will show light poking out of four corners the card has already rounded away.

:::

::: fw flutter

The glow's corner is the rung `size` names on the theme's corner ladder, `MPShapes` — `extraSmall` for `xs` up to `extraLarge` for `xl`. So an `xl` card inside an `md` light will show light poking out of four corners the card has already rounded away.

:::

Set the rung to the radius of the content, not to its importance.

## Why the arc is a conic gradient

::: fw react

What actually animates is the gradient's `from` angle, which is only animatable because the angle is a registered custom property with a type — `@property --mp-glow-angle { syntax: '<angle>' }`.

The obvious alternative, rotating the pseudo-element itself, swings its corners out past the element on every quarter turn: a rectangle spun about its centre is wider than the rectangle. The gradient stays put and only its light moves.

:::

::: fw flutter

The glow is a box behind the content, reaching `spread` past it on every side, filled with a `SweepGradient` and softened with an `ImageFiltered` blur. What animates is the gradient's own rotation, not the box's.

The obvious alternative, rotating the box itself, swings its corners out past the content on every quarter turn: a rectangle spun about its centre is wider than the rectangle. The box stays put and only its light moves.

:::

## There is no `easing`

A revolution has no beginning to decelerate into. An eased one reads as the light hesitating at an arbitrary point on a circle that has no arbitrary points, so the curve is `linear` and there is no prop to get it wrong with.

## Examples

<Demo src="animate-lighting/shape" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/animate-lighting/shape.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_lighting/shape.dart

:::

</Demo>

### arc

How much of the outline is lit at once, in degrees. Small — under about 30 — is a travelling spark. Large is a sweep, and past about 180 it stops reading as travel and becomes a breathing halo.

### blur

::: fw react

How soft the light is. At `0` it is a hard-edged wedge, which reads as a graphic rather than as light. The default of `4px` is the smallest value that still reads as glow.

:::

::: fw flutter

How soft the light is, in logical pixels. At `0` it is a hard-edged wedge, which reads as a graphic rather than as light. The default of `4` is the smallest value that still reads as glow.

:::

### color

::: fw react

One of the four MD3 accent families, and not an arbitrary colour — for the reason nothing in this library takes one: to change what `primary` **is**, set the token.

:::

::: fw flutter

One of the four MD3 accent families as an `MPColor`, and not an arbitrary colour — for the reason nothing in this library takes one: to change what `primary` **is**, set the theme's source colour. Left out, it is `MPColor.primary` unless an `MPConfigProvider` says otherwise, and the same holds for `size`.

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` the arc stops travelling and becomes an **even glow**. That is the same trade [MPSkeleton](../feedback/skeleton) makes: the decoration survives, the motion does not, and a light that marked the live row still marks it while holding still.
- The mark is decoration and reaches nothing in the accessibility tree. Whatever it is pointing at — "recommended", "processing", "checking" — has to be sayable in the content as well.
- Nothing inside the wrapper changes, so contrast, focus rings and hit areas are exactly what they were without it.
- It runs forever by default. On a page with several live regions that is several things moving at once; mark one.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the arc stops travelling and becomes an **even glow**, and nothing ticks. That is the same trade [MPSkeleton](../feedback/skeleton) makes: the decoration survives, the motion does not, and a light that marked the live row still marks it while holding still.
- The mark is decoration and adds nothing to the semantics. Whatever it is pointing at — "recommended", "processing", "checking" — has to be sayable in the content as well.
- Nothing inside the widget changes, and the glow takes no pointer, so contrast, focus rings and hit areas are exactly what they were without it.
- It runs for ever by default, and rests while none of it is in view. On a screen with several live regions that is several things moving at once; mark one.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| A pseudo-element at `z-index: -1` | A box behind the content in a `Stack` | There are no pseudo-elements; painting order does the same job. |
| A conic gradient over a registered `@property` angle | A rotating `SweepGradient`, blurred with `ImageFiltered` | The framework's own gradient and blur. |
| The corner from `border-radius: inherit` | The rung `size` names in `MPShapes` | There is no inherited radius to read. |
| `spread`, `blur` in CSS pixels | `double`, in logical pixels | The same numbers in the framework's unit. |
| `duration`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| Held off screen through `IntersectionObserver` | Rests while none of it is in view, as every endless `MPAnimate*` does | Here it is the rule for all of them rather than the light alone. |
| `render`, `className`, `style` | — | There is no element to swap and no class list or style attribute to pass through. |

:::

## See also

- [MPAnimateBlink](./animate-blink) — the other way of saying "look here", with the same warnings and one more.
- [MPOverlay](../feedback/overlay) — for covering a region because something is happening **to** it.
- [MPProgressLinear](../feedback/progress-linear) — when there is a real amount of progress to report.
