---
title: MPAnimateMarquee
order: 12
---

# MPAnimateMarquee

<p class="mp-lede">Content scrolling steadily past, forever. Two copies laid end to end, moving at the pace of a reader rather than at whatever pace fits the box.</p>

<Demo src="animate-marquee/hero" :minHeight="180" />

::: fw react

```tsx
import { MPAnimateMarquee } from 'material-plus-ui';

<MPAnimateMarquee speed={50} gap="1rem">
  {tools.map((tool) => (
    <MPChip key={tool}>{tool}</MPChip>
  ))}
</MPAnimateMarquee>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateMarquee(
  speed: 50,
  gap: 16,
  children: [for (final String tool in tools) MPChip(child: Text(tool))],
);
```

:::

## Props

<PropsTable name="MPAnimateMarquee" />

## Why there is no seam

The content is laid down **twice**, and each copy travels exactly its own length plus the gap. So the moment the first copy has left, the second is standing precisely where the first began: no jump, no seam, and no frame where the strip is empty.

::: fw react

None of that depends on measuring anything. A percentage `translate` resolves against the element's own box, so `-100%` is one copy's own width whatever that turns out to be.

:::

::: fw flutter

What a pass travels is measured: the first copy's length is read once it has been laid out, and the gap is added to it. Until that first measurement lands the strip moves at a sane default rather than finishing at once.

:::

Raise `copies` when the content is short enough to leave a hole behind itself — two copies of something narrower than its container will run out before the second arrives.

::: fw flutter

The strip runs towards the reader's start: in English it enters on the right and leaves on the left, and in a right-to-left language the other way round, or the words would arrive backwards.

:::

## `speed`, not `duration`

A duration would mean a strip of four logos and a strip of forty crossing the same box in the same time, with the long one becoming a blur. `speed` is pixels per second, so both move at the pace of a reader.

::: fw react

That is the one thing here that is measured, and it is re-measured whenever the strip or its container changes size. An explicit `duration` still wins if you want one.

:::

::: fw flutter

The strip is measured again whenever the widget is rebuilt with new content or settings. An explicit `duration` still wins if you want one, and a `speed` of `0` or less holds the strip where it is.

:::

## `pauseOnHover` is not decoration

Content moving past a pointer cannot be clicked reliably. A link inside a marquee that never stops is a link nobody can follow, and a name a reader is trying to read is a name they never quite catch.

It is on by default and should stay on for anything with a link, a button or a word worth reading in it.

## Examples

<Demo src="animate-marquee/vertical" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/animate-marquee/vertical.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_marquee/vertical.dart

:::

</Demo>

### orientation and reverse

::: fw react

`vertical` runs the strip down the box instead of across it — give the container a height, or there is nothing to scroll within. `reverse` runs either axis the other way.

:::

::: fw flutter

`MPOrientation.vertical` runs the strip down the box instead of across it — give it a height from its parent, a `SizedBox` for example, or there is nothing to scroll within. `reverse` runs either axis the other way.

:::

Two strips running in opposite directions is the usual pattern for a wall of logos, and it also stops the pair reading as one long line.

### gap

::: fw react

The space between items, and between the last item of one copy and the first of the next. It is read back off the computed style rather than parsed from the prop, because `'2rem'` is only a number once a font size has been resolved.

:::

::: fw flutter

The space between items, and between the last item of one copy and the first of the next, in logical pixels. `32` by default, the `2rem` the React build writes.

:::

## Accessibility

::: fw react

- Only the first copy is read out. Every other one carries `aria-hidden`, or a screen reader would announce the whole strip as many times as it was laid down.
- Under `prefers-reduced-motion` the strip **stops** rather than slowing. A row of logos that has stopped scrolling is still a row of logos, and the first copy is fully in frame — which is more than the moving version guarantees at any given moment.
- Moving text is harder to read than still text, and text moving horizontally past a fixed point is the hardest case there is. A marquee is for a set a reader is meant to take in at a glance, not for content they have to read.
- Anything interactive inside one needs `pauseOnHover` on, and is still harder to reach than the same thing standing still. Prefer a real list where the content matters.

:::

::: fw flutter

- Only the first copy is read out or reached by the keyboard. Every other one is left out of the semantics and the focus order alike, or a screen reader would announce the whole strip as many times as it was laid down and a keyboard would stop on things the screen reader says are not there.
- When the platform has animations turned off (`MediaQuery.disableAnimations`) the strip **stops** rather than slowing, and nothing ticks. A row of logos that has stopped scrolling is still a row of logos, and the first copy stands where it starts, fully in frame — which is more than the moving version guarantees at any given moment.
- Moving text is harder to read than still text, and text moving horizontally past a fixed point is the hardest case there is. A marquee is for a set a reader is meant to take in at a glance, not for content they have to read.
- Anything interactive inside one needs `pauseOnHover` on, and is still harder to reach than the same thing standing still. Prefer a real list where the content matters.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| The items as `children` | `children`, a `List<Widget>` | Each copy lays the same list out again. |
| A percentage `translate`, `ResizeObserver` for the speed | The first copy measured after layout | There is no percentage of a box to translate by, so the travel is measured. |
| `gap` as a CSS length | `double`, in logical pixels | There is no `rem` to resolve. |
| The strip runs leftwards in every direction | It runs towards the reader's start | In a right-to-left language the words would otherwise arrive backwards. |
| `aria-hidden` and `inert` on the copies | `ExcludeSemantics` and `ExcludeFocus` | The same answer in the framework's own terms. |
| `duration`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| `easing="linear"` | `MPEasing.linear` | Each name maps onto one of the curves in `MPMotion`. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| The strip runs while off screen | It rests while none of the box is in view | Flutter goes on drawing an animation nobody can see. |
| `className`, `style` | — | There is no class list or style attribute to pass through; size the strip with its parent. |

:::

## See also

- [MPCarousel](../layout/carousel) — for content a reader steps through themselves, with real controls.
- [MPAnimateHeadline](./animate-headline) — for a set of phrases where one at a time is enough.
- [MPList](../display/list) — for content that should simply be readable.
