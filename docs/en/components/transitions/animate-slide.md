---
title: MPAnimateSlide
order: 4
---

# MPAnimateSlide

<p class="mp-lede">Content travelling in from one edge. The element moves, the layout does not — nothing on the page reflows while it runs.</p>

<Demo src="animate-slide/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateSlide } from 'material-plus-ui';

<MPAnimateSlide from="left">
  <MPCard title="From behind the edge" />
</MPAnimateSlide>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateSlide(
  from: MPSide.left,
  child: MPCard(title: Text('From behind the edge')),
);
```

:::

## Props

<PropsTable name="MPAnimateSlide" />

## Direction is a relationship

This is MD3's **shared axis** transition at the scale one wrapper can offer it. Things that are related move along the same line, and a reader reads the direction as the relationship: a step forward arrives from the end edge, a step back from the start one, and a panel belonging to the bar above it comes down from the top.

Which means `from` is a statement about where the content came from, not a taste decision. Four slides on one screen, each from a different edge, say nothing at all.

## Why the default travel is `100%`

::: fw react

Because `100%` is the element's **own** width or height, so it starts exactly out of frame — never half drawn somewhere it does not belong, and never dependent on measuring anything.

Put it in a container with `overflow: hidden` and the effect is a panel appearing from behind that container's edge. Without one, the content simply starts one element-width away and travels in.

:::

::: fw flutter

Because a `distance` left out — `null` — is the widget's **own** width or height, so it starts exactly out of frame: never half drawn somewhere it does not belong, and never dependent on a number someone measured.

Put it inside a `ClipRect` and the effect is a panel appearing from behind that box's edge. Without one, the content simply starts one widget-width away and travels in.

:::

A short `distance` is a different gesture: a settling, for content that is already roughly where it belongs.

## The edges are physical

`from` takes `MPSide`, which is `top` / `right` / `bottom` / `left` and stays that way under RTL — the same choice [MPTooltip](../feedback/tooltip) and the popups make. There is no reading order to mirror here, only a screen edge: something sliding down from the top of the window comes from the top in every language.

For a travel that _should_ mirror — a step forward in a flow — pass the side that matches the document's direction from the code that knows which way the flow runs.

## Examples

<Demo src="animate-slide/axis" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/animate-slide/axis.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_slide/axis.dart

:::

</Demo>

### distance

::: fw react

A CSS length, or a number in pixels. `'100%'` is out of frame; something short — `'1.5rem'` — is a settling in place, which is what a shared-axis step between two views usually wants.

:::

::: fw flutter

Logical pixels, or `null` — the default — for the widget's own size. `null` is out of frame; something short — `24` — is a settling in place, which is what a shared-axis step between two views usually wants.

:::

### mode

::: fw react

`out` leaves by the same edge it would have come from, so a panel that arrived from the left goes back to the left. It is also quicker, because Material asks an exit to be.

:::

::: fw flutter

`MPAnimateMode.exit` leaves by the same edge it would have come from, so a panel that arrived from the left goes back to the left. It is also quicker, because Material asks an exit to be.

:::

## One effect across a set

`stagger` turns the effect into a per-child one: instead of the box travelling, each child does, held back by its position. `durationStep` gives each a longer or shorter run than the last, and `reverse` runs the set from the end.

::: fw react

```tsx
<MPAnimateSlide stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateSlide>
```

:::

::: fw flutter

```dart
MPAnimateSlide(
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
<MPAnimateSlide timeline="view">…</MPAnimateSlide>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered. CSS's `view()` timeline has no counterpart in Flutter, where a scroll-linked effect is an application's own wiring of a `ScrollPosition` to an `AnimationController`. `MPAnimateTrigger.visible` is the nearest thing: it starts the run when the widget is scrolled into view. See [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` nothing travels and the content is simply there in its final position.
- The animation is a `translate`, so the element's box in the layout never moves. Nothing below it shifts while the slide runs, and a reader partway down the page is not moved.
- Text is not scaled by a slide, but it _is_ moved, and moving text is harder to read than still text. A long travel over a paragraph is worth avoiding for the same reason a zoom is; [MPAnimateFade](./animate-fade) is the safe wrapper for prose.
- The content is in the document at its final size from the first frame, so a screen reader is never waiting on the animation.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped and the content is simply there in its final position from the first frame — an exit included, and whatever the trigger is waiting for.
- The animation is a translation at paint time, so the widget's box in the layout never moves. Nothing beside it shifts while the slide runs, and a reader partway down the screen is not moved.
- Text is not scaled by a slide, but it _is_ moved, and moving text is harder to read than still text. A long travel over a paragraph is worth avoiding for the same reason a zoom is; [MPAnimateFade](./animate-fade) is the safe wrapper for prose.
- The content is in the semantics at its final size from the first frame, so a screen reader is never waiting on the animation.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `distance` as a CSS length or a number in pixels, `'100%'` by default | `double?` in logical pixels, where `null`, the default, is the widget's own size | Flutter has no CSS lengths; the own-size case is the one a percentage was there for. |
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

- [MPAnimateAppear](./animate-appear) — the same travel, much shorter, applied to each child of a list in turn.
- [MPDrawer](../layout/drawer) — when the thing sliding in is a real panel with a scrim, a focus trap and an escape key.
- [MPAnimateFade](./animate-fade) — for content that should not move at all.
