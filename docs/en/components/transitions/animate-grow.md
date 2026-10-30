---
title: MPAnimateGrow
order: 2
---

# MPAnimateGrow

<p class="mp-lede">Content unfolding from a point. A panel out of a toolbar, a card out of the row it sits in, a sheet out of the button that summoned it.</p>

<Demo src="animate-grow/hero" :minHeight="380" />

::: fw react

```tsx
import { MPAnimateGrow } from 'material-plus-ui';

<MPAnimateGrow origin="top">
  <MPCard title="Out of the toolbar" />
</MPAnimateGrow>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateGrow(
  origin: Alignment.topCenter,
  child: MPCard(title: Text('Out of the toolbar')),
);
```

:::

## Props

<PropsTable name="MPAnimateGrow" />

## What separates this from a zoom

`origin`, and how far it travels.

A grow starts at `0.8` of its final size and can be anchored to any point, so it reads as something **opening out of the thing next to it**. The travel is short, which means the content inside is legible for most of the animation rather than being a smear that resolves at the end.

[MPAnimateZoom](./animate-zoom) starts at less than half and always about the middle. It comes at the reader rather than out of anything, which is a different sentence about a different kind of content.

This is as close as a component library gets to MD3's **container transform**: the specification's version morphs one element's bounds into another's, which needs both elements and a shared identity between them. What is portable is the half a wrapper can do on its own — the destination unfolding from where it came from.

## Why `transform-origin` and not a transform

::: fw react

`origin` sets `transform-origin`, which governs the standalone `scale` property as well as the `transform` shorthand. The animation itself only ever writes `scale`, so a caller's own `transform` on the same element survives the effect instead of being overwritten by it.

It is also why a `transformOrigin` in your own `style` still wins: the prop is written before the caller's style object, not after it.

:::

::: fw flutter

In Flutter `origin` is the alignment of a paint-time scale around the content. The scale is a transform of its own, so a caller's own `Transform` inside or around the widget is left as it was, and nothing beside the widget is laid out again while it runs.

:::

## Examples

<Demo src="animate-grow/origin" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/animate-grow/origin.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_grow/origin.dart

:::

</Demo>

### origin

::: fw react

Any CSS `transform-origin`. `'top'` unfolds downwards, `'bottom left'` out of a corner, `'center'` — the default — out of the middle.

Anchor it to the place the content came from. A menu under a button grows from `'top'`; a card expanding in a grid grows from whichever corner it was sitting in.

:::

::: fw flutter

An `AlignmentGeometry`. `Alignment.topCenter` unfolds downwards, `Alignment.bottomLeft` out of a corner, `Alignment.center` — the default — out of the middle. An `AlignmentDirectional` follows the reading direction, so `AlignmentDirectional.topStart` is the leading corner in English and in Arabic alike.

Anchor it to the place the content came from. A menu under a button grows from `Alignment.topCenter`; a card expanding in a grid grows from whichever corner it was sitting in.

:::

### from

The scale it starts at, as a multiple of its final size. Above `1` it arrives oversized and settles down onto the page rather than up out of it, which is the gesture for something being **put down** rather than opened.

### fade

On by default. Turn it off for something already on the page that is only changing size — a repeated fade on content a reader is already looking at reads as flickering rather than as an entrance.

## One effect across a set

`stagger` turns the effect into a per-child one: instead of the box unfolding, each child does, held back by its position. `durationStep` gives each a longer or shorter run than the last, and `reverse` runs the set from the end.

::: fw react

```tsx
<MPAnimateGrow stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateGrow>
```

:::

::: fw flutter

```dart
MPAnimateGrow(
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
<MPAnimateGrow timeline="view">…</MPAnimateGrow>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered. CSS's `view()` timeline has no counterpart in Flutter, where a scroll-linked effect is an application's own wiring of a `ScrollPosition` to an `AnimationController`. `MPAnimateTrigger.visible` is the nearest thing: it starts the run when the widget is scrolled into view. See [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` nothing scales and the content is simply there at its final size.
- Scaling resamples whatever is inside, text included. That is fine over the short travel a grow makes and at a `duration` a reader does not have time to study, but it is the reason [MPAnimateFade](./animate-fade) — not this — is the effect to wrap a page of prose in.
- The content is in the document from the first frame, at its final layout size, so nothing below it moves as the animation runs and a screen reader is never waiting on it.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped and the content is simply there at its final size from the first frame — an exit included, and whatever the trigger is waiting for.
- Scaling resamples whatever is inside, text included. That is fine over the short travel a grow makes and at a `duration` a reader does not have time to study, but it is the reason [MPAnimateFade](./animate-fade) — not this — is the effect to wrap a page of prose in.
- The scale is applied at paint time and the content is laid out at its final size from the first frame, so nothing beside it moves as the animation runs. It is in the semantics from the first frame too, so a screen reader is never waiting on it.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `origin` as a CSS `transform-origin` string | `AlignmentGeometry`, `Alignment.center` by default | Flutter's own way of naming a point in a box; an `AlignmentDirectional` follows the reading direction. |
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

- [MPAnimateZoom](./animate-zoom) — the same arithmetic at more than twice the distance, and always about the centre.
- [MPAnimateFade](./animate-fade) — for content that must not be resampled.
- [MPAnimateSlide](./animate-slide) — for something arriving from an edge rather than unfolding in place.
