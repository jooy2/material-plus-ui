---
title: MPAnimateZoom
order: 3
---

# MPAnimateZoom

<p class="mp-lede">Content arriving from the middle of where it will end up. The effect for the one thing on a screen that is meant to interrupt — a confirmation, a result, a number that has just landed.</p>

<Demo src="animate-zoom/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateZoom } from 'material-plus-ui';

<MPAnimateZoom>
  <MPCard title="Payment received" />
</MPAnimateZoom>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateZoom(
  child: MPCard(title: Text('Payment received')),
);
```

:::

## Props

<PropsTable name="MPAnimateZoom" />

## Use it once

A zoom is an interruption, and an interruption that happens three times on one screen is a layout. If several things should arrive, they should arrive as a **set** — that is [MPAnimateAppear](./animate-appear), where the effect belongs to the group and walks a reader down it in the order it should be read.

## There is no `origin`

On purpose. A zoom anchored to a corner is a [grow](./animate-grow), and the library does not offer two spellings of one idea.

::: fw react

The centre is written out on the element rather than left to the stylesheet's default, so a `transform-origin` inherited from a caller's own rule cannot quietly turn one effect into the other.

:::

::: fw flutter

The centre is written out on the scale itself, `Alignment.center`, rather than left to a default, so it is the middle in every reading direction and nothing around the widget can quietly turn one effect into the other.

:::

## The same keyframe as a grow

::: fw react

Both are a change of scale, so both run `mp-anim-scale`. A second identical `@keyframes` would only be a second place to fix a bug.

:::

::: fw flutter

Both are a change of scale, so both draw a frame the same way: a paint-time scale and an opacity. Two copies of that would only be two places to fix a bug.

:::

What separates them is the distance and the anchor: a zoom starts at `0.4` about the middle, a grow at `0.8` about wherever you point it. Two gestures, one piece of arithmetic.

## Examples

<Demo src="animate-zoom/distance" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/animate-zoom/distance.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_zoom/distance.dart

:::

</Demo>

### from

Below `1` the content comes forward out of the middle. Above `1` it arrives oversized and settles back, which reads as something being pushed **towards** the reader.

Very low values — under about `0.2` — cross so much distance that the content is unreadable for most of the animation. That is a splash, not an entrance.

### fade

On by default, and worth keeping for an arrival: the opacity is what makes the first frames read as _not there yet_ rather than as _tiny_.

## One effect across a set

`stagger` turns the effect into a per-child one: instead of the box arriving, each child does, held back by its position. `durationStep` gives each a longer or shorter run than the last, and `reverse` runs the set from the end.

::: fw react

```tsx
<MPAnimateZoom stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateZoom>
```

:::

::: fw flutter

```dart
MPAnimateZoom(
  stagger: const Duration(milliseconds: 60),
  children: [for (final Item item in items) ItemTile(key: ValueKey(item.id), item: item)],
);
```

The set is passed as `children` rather than `child`, and `layoutBuilder` places it — a column when nobody says, or the row or the grid the children belong in.

:::

The box itself animates nothing while a `stagger` is set — the same content played twice over is neither of the two curves anybody asked for. The three props are argued in full at [MPAnimateFade](./animate-fade#one-effect-across-a-set), and [MPAnimateAppear](./animate-appear) is this with `stagger` already on.

## Scrolling is a clock

::: fw react

`timeline="view"` hands the animation to the reader's scrolling instead of to a stopwatch: its progress is the element's progress through the scrollport, and `range` says which part of that travel it is spread over.

```tsx
<MPAnimateZoom timeline="view">…</MPAnimateZoom>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered. CSS's `view()` timeline has no counterpart in Flutter, where a scroll-linked effect is an application's own wiring of a `ScrollPosition` to an `AnimationController`. `MPAnimateTrigger.visible` is the nearest thing: it starts the run when the widget is scrolled into view. See [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` nothing scales and the content is simply there at its final size.
- A zoom resamples everything inside it across a long travel, so it is the wrong wrapper for a paragraph. Put it around the headline, the figure or the card — the thing a reader looks at rather than reads — and use [MPAnimateFade](./animate-fade) for the prose.
- The content occupies its final layout size from the first frame, so nothing around it moves while the animation runs.
- If the thing arriving also demands attention — a confirmation, an error — say so in the content. The motion is not the message, and a reader with a reduced-motion preference will never see it.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped and the content is simply there at its final size from the first frame — an exit included, and whatever the trigger is waiting for.
- A zoom resamples everything inside it across a long travel, so it is the wrong wrapper for a paragraph. Put it around the headline, the figure or the card — the thing a reader looks at rather than reads — and use [MPAnimateFade](./animate-fade) for the prose.
- The scale is applied at paint time and the content is laid out at its final size from the first frame, so nothing around it moves while the animation runs.
- If the thing arriving also demands attention — a confirmation, an error — say so in the content. The motion is not the message, and a reader who has turned animations off will never see it.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `delay`, `stagger`, `durationStep` in milliseconds | `Duration` | The framework already has the type. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. There is no stylesheet token for a theme to retune. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `mode="in" \| "out"` | `MPAnimateMode.enter` / `.exit` | `in` is a reserved word in Dart. |
| `children` laid out by the caller's markup | `child`, or `children` and `layoutBuilder` | A widget has to place what it is given, so a staggered set says how it is laid out. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `timeline`, `range` | — | CSS's `view()` timeline has no counterpart. |
| `render`, `className`, `style` | — | There is no element to swap and no class list or style attribute to pass through. |
| An endless effect runs while off screen | It rests while none of it is in view | Flutter goes on drawing an animation nobody can see. |

:::

## See also

- [MPAnimateGrow](./animate-grow) — the same arithmetic, anchored, at less than half the distance.
- [MPAnimateAppear](./animate-appear) — for several things arriving as a set.
- [MPDialog](../feedback/dialog) — when the interruption should also take the page.
