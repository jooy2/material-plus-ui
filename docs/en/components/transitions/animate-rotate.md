---
title: MPAnimateRotate
order: 5
---

# MPAnimateRotate

<p class="mp-lede">Content turning about a point. Two angles rather than one, which is what lets one component be both a swing into place and a spin that never lands.</p>

<Demo src="animate-rotate/hero" :minHeight="240" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

// `chevron` and `spinner` stand for glyphs from your own icon set.

// An arrival
MPAnimateRotate(child: MPIcon(icon: chevron));

// A spin
MPAnimateRotate(
  from: 0,
  to: 360,
  repeat: null,
  easing: MPEasing.linear,
  fade: false,
  child: MPIcon(icon: spinner),
);
```

:::

## Props

<PropsTable name="MPAnimateRotate" />

## Two angles, two effects

`from` alone is an **arrival**: something swings into place and stops. That is the default — half a turn back, landing at zero.

::: fw react

`from` and `to` together with `repeat="infinite"` and `easing="linear"` is a **spin**: it starts where it ends, so it never lands and never jumps. Turn `fade` off for it, or the repeated opacity ramp reads as flickering.

:::

::: fw flutter

`from` and `to` together with `repeat: null` and `easing: MPEasing.linear` is a **spin**: it starts where it ends, so it never lands and never jumps. Turn `fade` off for it, or the repeated opacity ramp reads as flickering.

:::

One component covers both because a second one would be the same keyframe under a different name.

## What this is not for

**Text.** A rotated word is resampled along its whole length, and at any angle that is not a multiple of 90° every stem in it lands between pixels. Rotation is the one movement this library allows on a **glyph** without argument — a chevron is turned rather than redrawn across the whole component set, because a turned arrow is still the same arrow — and that permission does not extend to a sentence.

::: fw react

**A loading indicator.** A spinning mark says something is moving; an indeterminate indicator has to say what is being waited on and reserve the space the result will take. That is [MPProgressCircular](../feedback/progress-circular). Under `prefers-reduced-motion` it stops on a partial arc, which still says something is under way without moving, while a decorative turn that does not play has lost nothing.

:::

::: fw flutter

**A loading indicator.** A spinning mark says something is moving; an indeterminate indicator has to say what is being waited on and reserve the space the result will take. That is [MPProgressCircular](../feedback/progress-circular). With animations turned off it stops on a partial arc, which still says something is under way without moving, while a decorative turn that does not play has lost nothing.

:::

## `duration` is longer here

`long2` — 500ms — where a fade takes `medium2` and a slide `medium4`. Half a turn is a longer journey than one axis of opacity, and it reads as rushed at the same number. That is the whole reason the duration table has a row per effect rather than one figure.

## Examples

### origin

::: fw react

Any CSS `transform-origin`. The default is the middle; anchor it elsewhere for something hinged — a panel opening about its own top edge, a needle pivoting at its base.

Like [MPAnimateGrow](./animate-grow), this reaches the standalone `rotate` property through `transform-origin`, so the effect never touches the `transform` shorthand and a caller's own transform survives it.

:::

::: fw flutter

An `AlignmentGeometry`. The default is `Alignment.center`; anchor it elsewhere for something hinged — a panel opening about its own top edge with `Alignment.topCenter`, a needle pivoting at its base with `Alignment.bottomCenter`. An `AlignmentDirectional` follows the reading direction.

Like [MPAnimateGrow](./animate-grow), the turn is a paint-time transform of its own, so a caller's own `Transform` inside or around the widget is left as it was.

:::

### fade

On for an arrival, off for a spin. There is no third answer worth a prop of its own.

## One effect across a set

`stagger` turns the effect into a per-child one: instead of the box turning, each child does, held back by its position. `durationStep` gives each a longer or shorter run than the last, and `reverse` runs the set from the end.

::: fw react

```tsx
<MPAnimateRotate stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateRotate>
```

:::

::: fw flutter

```dart
MPAnimateRotate(
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
<MPAnimateRotate timeline="view">…</MPAnimateRotate>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered. CSS's `view()` timeline has no counterpart in Flutter, where a scroll-linked effect is an application's own wiring of a `ScrollPosition` to an `AnimationController`. `MPAnimateTrigger.visible` is the nearest thing: it starts the run when the widget is scrolled into view. See [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` nothing turns and the content sits at its `to` angle — which for the default is upright, and for a spin is wherever the caller said the turn ends.
- An infinite rotation is motion that never stops in the corner of a page somebody is reading. It is the one kind of motion this library otherwise refuses, so it should be small, decorative, and never the only thing carrying a message.
- Rotation does not change the layout box, so nothing around a turning element moves.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) nothing turns and the content sits at its `to` angle from the first frame — which for the default is upright, and for a spin is wherever the caller said the turn ends. Nothing ticks while the setting is on.
- An endless rotation is motion that never stops in the corner of a screen somebody is reading. It is the one kind of motion this library otherwise refuses, so it should be small, decorative, and never the only thing carrying a message. It rests while none of it is on screen.
- Rotation is applied at paint time and does not change the layout box, so nothing around a turning widget moves.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `origin` as a CSS `transform-origin` string | `AlignmentGeometry`, `Alignment.center` by default | Flutter's own way of naming a point in a box; an `AlignmentDirectional` follows the reading direction. |
| `from`, `to` as numbers of degrees | `double` degrees | The same unit, typed as Dart types a fraction. |
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

- [MPProgressCircular](../feedback/progress-circular) — when the turning is about waiting rather than about decoration.
- [MPAnimateGrow](./animate-grow) — the other effect that takes an `origin`.
- [MPAnimateBlink](./animate-blink) — the other infinite effect, and the same warnings apply to it.
