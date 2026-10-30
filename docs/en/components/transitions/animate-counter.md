---
title: MPAnimateCounter
order: 17
---

# MPAnimateCounter

<p class="mp-lede">A number counting up to its value. The one effect here that cannot be a keyframe on its own.</p>

<Demo src="animate-counter/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateCounter } from 'material-plus-ui';

<MPAnimateCounter value={128_400} options={{ notation: 'compact' }} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateCounter(
  value: 128400,
  format: (double value) => '${(value / 1000).round()}K',
);
```

:::

## Props

<PropsTable name="MPAnimateCounter" />

::: fw react

## It is still a CSS animation

Text is not an animatable property. Every frame of a count needs a fresh interpolation put through a formatter, so there has to be a frame loop — and the obvious implementation gives that loop its own clock, its own easing curve and its own idea of what _paused_ means. That is three things which have to be kept in step with the six declared effects, and will not be.

So the animation here is a **real** one, over a registered custom property, and the loop does nothing but read the value and format it:

```css
@property --mp-count {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}

@keyframes mp-anim-count {
  from {
    --mp-count: var(--_mp-anim-from, 0);
  }
  to {
    --mp-count: var(--_mp-anim-to, 0);
  }
}
```

`@property` is what makes it interpolate at all: without a registered syntax a custom property is a string, and a string animates by swapping at 50%.

What that buys is everything else for free. `duration`, `delay` and the easing **token** are the same ones every other effect reads. `trigger` and `paused` work. `prefers-reduced-motion` works. `timeline="view"` works — and it works properly, so scrolling back counts back down.

:::

::: fw flutter

## It runs on the same machinery

Text is not something a run can interpolate. Every frame of a count needs a fresh value put through a formatter, and the obvious implementation gives that its own clock, its own easing curve and its own idea of what _paused_ means — three things which have to be kept in step with the other effects, and will not be.

So the count is a run like every other effect's, the same one a fade is drawn on, and each frame writes `from + (value - from) × t` through the formatter. `duration`, `delay`, the easing curve, `trigger`, `paused` and reduced motion are then the same machinery the rest of the set uses rather than a second implementation of each.

:::

## Waiting shows `from`, not the answer

::: fw react

Every declared effect sits paused on its own first frame until something starts it, which is what `animation-fill-mode: both` is for. A counter driven by its own clock has to be _taught_ that, and the version of this that was not is the one that shows `1,284` while it waits to be scrolled into view — having already answered the question it was about to ask.

Here it comes for nothing, because the waiting state is a paused animation and a paused animation is sitting on `from`.

:::

::: fw flutter

Every effect sits on its own first frame until something starts it. A counter driven by its own clock has to be _taught_ that, and the version of this that was not is the one that shows `1,284` while it waits to be scrolled into view — having already answered the question it was about to ask.

Here it comes for nothing, because a run waiting for its trigger is held at its first frame, and the counter's first frame is `from`.

:::

## Formatting

::: fw react

`options` is anything `Intl.NumberFormat` takes, so a currency, a percentage or a compact notation is a prop rather than a template:

```tsx
<MPAnimateCounter value={1234.5} locale="de-DE" options={{ style: 'currency', currency: 'EUR' }} />
```

Formatted rather than concatenated, because the pieces of a number are not in the same order everywhere. `$1,234.50` and `1.234,50 €` are the same value, and a `prefix`/`suffix` pair can only write one of them.

`format` takes the whole formatter for the numbers `Intl` has no option for — an ordinal, a score out of ten, a duration.

The digits are set in `tabular-nums`, or a tile shifts sideways on every frame that swaps a `1` for an `8`. A statistic that shivers while it counts is worse than one that does not count at all.

:::

::: fw flutter

There is no `Intl` in the package, so `format` takes the whole job. Left out, a number is grouped in thousands with a comma and given up to three decimals — `128,400`, `0.999` — which is what `Intl.NumberFormat` writes in English when nobody passes it options.

A currency, a percentage, a compact notation or another language's separators is a `format` of your own:

```dart
MPAnimateCounter(
  value: 0.9992,
  format: (double value) => '${(value * 100).toStringAsFixed(2)}%',
);
```

It is called for every frame and for the copy a screen reader gets, so the two never disagree.

The figures are set with `FontFeature.tabularFigures()` whatever `style` says, or the number shifts sideways on every frame that swaps a `1` for an `8`. A statistic that shivers while it counts is worse than one that does not count at all.

:::

::: fw react

## In a background tab

`requestAnimationFrame` does not run in a tab nobody is looking at, so a counter left in the background sits at `from` and jumps to its value on return, having been "running" the whole time.

That is the right behaviour — the reader sees the number they came back for — but it is worth knowing before somebody reports it as a bug.

:::

::: fw flutter

## In the background

An app in the background draws no frames, so a counter left running there is not drawn at all. The run is measured against the frame clock, which goes on through the pause, so when the app comes back the count is wherever its time says — usually already on its value.

That is the right behaviour — the reader sees the number they came back for — but it is worth knowing before somebody reports it as a bug.

:::

## Accessibility

::: fw react

- A screen reader gets the **final number**, once, out of a clipped box; the counting copy is `aria-hidden`. A live count would be announced sixty times a second, and the one thing a reader wants from a statistic is the statistic.
- Under `prefers-reduced-motion` the animation is dropped and the number is simply there.
- The value is in the document from the first frame, so find-on-page matches it before the count has finished.

:::

::: fw flutter

- A screen reader gets the **final number**, once, as the label of a `Semantics` node; the counting copy is left out of the semantics. A live count would be announced on every frame, and the one thing a reader wants from a statistic is the statistic.
- When the platform has animations turned off (`MediaQuery.disableAnimations`) the count is dropped and the number is simply there, from the first frame and whatever the trigger is waiting for.
- The label is the value from the first frame, so a reader who arrives mid-count hears the answer rather than a number on its way to it.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. |
| `options` and `locale`, passed to `Intl.NumberFormat` | `format`, a `String Function(double)` | The package has no `intl` to ask. Left out, a number is written in English, grouped in thousands with up to three decimals. |
| A registered custom property, read every frame | The shared run's progress, written every frame | There is no stylesheet to animate a property in; the run is the same one every other effect uses. |
| `tabular-nums` in the stylesheet, CSS `style` for the rest | `FontFeature.tabularFigures()`, with `style: TextStyle?` merged under it | The text style is a widget's own parameter. |
| The final number in a visually hidden box | The final number as a `Semantics` label | The semantics tree takes a label directly. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `timeline`, `range` | — | CSS's `view()` timeline has no counterpart. |
| `className` | — | There is no class list to pass through. |

:::

## See also

- [MPAnimateReveal](./animate-reveal) — for the tile around the number, whose position is part of what it says.
- [MPAnimateFade](./animate-fade) — for the label beside it.
