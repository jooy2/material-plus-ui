---
title: MPAnimateHeadline
order: 16
---

# MPAnimateHeadline

<p class="mp-lede">One line replacing the one above it, on a timer. A set of phrases where any one of them would have done — three ways of saying what a product is, a rotating list of the places it works.</p>

<Demo src="animate-headline/hero" :minHeight="200" />

::: fw react

```tsx
import { MPAnimateHeadline } from 'material-plus-ui';

<MPAnimateHeadline interval={2200}>
  <MPTypography level="h4">a component library</MPTypography>
  <MPTypography level="h4">Material Design 3</MPTypography>
</MPAnimateHeadline>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateHeadline(
  interval: Duration(milliseconds: 2200),
  children: [
    MPTypography('a component library', level: MPTypographyLevel.h4),
    MPTypography('Material Design 3', level: MPTypographyLevel.h4),
  ],
);
```

:::

## Props

<PropsTable name="MPAnimateHeadline" />

## The box never resizes

::: fw react

Every line sits in the **same grid cell**, so the reel is as tall and as wide as the longest of them from the first frame. That is the whole difficulty with this effect: a headline that resized as it turned would move everything below it four times a sentence, and a reader partway down the page would be shunted every two seconds.

It is also why the lines that are not showing keep their space with `visibility` rather than `display`. Taking them out of the layout would take their contribution to the box's size with them.

:::

::: fw flutter

Every line is stacked **in the same place**, so the reel is as tall and as wide as the largest of them from the first frame. That is the whole difficulty with this effect: a headline that resized as it turned would move everything below it four times a sentence, and a reader partway down the screen would be shunted every two seconds.

It is also why the lines that are not showing keep their space and nothing else: they are not painted, not hit and not read out, but they are still laid out. Taking them out of the tree would take their contribution to the box's size with them.

:::

## Inside a sentence

::: fw react

The root is a `<div>`, which is right beside a heading and wrong inside a paragraph: an HTML parser reading `<p>` and then `<div>` closes the paragraph, so the page a server sent is not the page React rendered, and hydration fails over the difference. Pass `render={<span />}` for a reel that sits inside a line of text, with lines that are inline elements too. `MPAnimateTyping`, `MPAnimateScramble` and `MPAnimateSplit` take the same prop.

:::

::: fw flutter

The reel is a box, so it sits beside the words around it rather than inside their paragraph: put it in a `Wrap` with the text that leads into it, as the hero demo does, or in a `Row` with `CrossAxisAlignment.baseline` to line the two up on their baseline.

:::

## It is not a ticker

A line comes up, it **stops**, and it is held long enough to read.

`interval` is counted from the moment a line arrives rather than from the start of the cycle, so it is reading time: raising `duration` to make the swap slower does not quietly eat it.

## Both halves of the emphasized curve

::: fw react

This is the one place in the library where MD3's `emphasized-decelerate` and `emphasized-accelerate` are both written out. Everywhere else an exit is a reversed entrance, which mirrors the curve for free — but here the two are genuinely two animations, on two elements, at the same moment: the line arriving decelerates into place while the line leaving accelerates away.

:::

::: fw flutter

This is the one place in the library where MD3's `emphasizedDecelerate` and `emphasizedAccelerate` are both written out. Everywhere else an exit is a reversed entrance, which turns the curve round with it — but here the two are genuinely two animations, on two lines, at the same moment: the line arriving decelerates into place while the line leaving accelerates away. An `easing` given puts both lines on that one curve.

:::

## Examples

<Demo src="animate-headline/controlled" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/animate-headline/controlled.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_headline/controlled.dart

:::

</Demo>

### index

Hand it an `index` and the reel **stops turning on its own**. A controlled headline is somebody else's timer, and a second one running underneath it would fight for the same state.

That is what ties the reel to a step in a form, a tab, or anything else that already knows which line should be showing. `onIndexChange` reports the line that has just come up, for the uncontrolled case.

### loop

On by default. Off, the reel stops on the last line and stays there — which is what a sequence wants, as against a set.

### rise

::: fw react

How far a line travels as it comes up or leaves. `'100%'` is one line's own height, which is what makes the two lines look like a single strip moving. Shorter reads as a fade with a nudge.

:::

::: fw flutter

How far a line travels as it comes up or leaves, in logical pixels. Left out (`null`), it is one line's own height, which is what makes the two lines look like a single strip moving. Shorter reads as a fade with a nudge.

:::

## Accessibility

::: fw react

- A screen reader is given the line that happens to be showing rather than the set, so **this is not for content a reader has to see**. There is no guarantee anyone is looking during the two seconds a given line is up.
- Under `prefers-reduced-motion` the reel still turns — it is a set of phrases, and stopping on the first would be a different message — but the lines swap rather than travel.
- Anything that matters should be outside the reel, or the reel should be controlled by something the reader drives themselves.
- `paused` holds the reel where it is, and `trigger="hover"` is worth considering for a headline in a place a reader lingers.

:::

::: fw flutter

- A screen reader is given the line that happens to be showing rather than the set, so **this is not for content a reader has to see**. There is no guarantee anyone is looking during the two seconds a given line is up.
- When the platform has animations turned off (`MediaQuery.disableAnimations`) the reel still turns — it is a set of phrases, and stopping on the first would be a different message — but the lines swap in one frame rather than travel, and nothing ticks in between.
- Anything that matters should be outside the reel, or the reel should be controlled by something the reader drives themselves.
- `paused` holds the reel where it is, and `MPAnimateTrigger.hover` is worth considering for a headline in a place a reader lingers. It starts on the pointer or on focus inside it.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| The lines as `children` | `children`, a `List<Widget>` | Each line is its own widget, and the reel needs to count them. |
| Lines in one grid cell, hidden with `visibility` | Lines stacked in one place; the ones not up keep their space and are hidden from paint, hit testing and semantics | The same answer in the framework's own terms. |
| `rise` as a CSS length, `'100%'` by default | `double?` in logical pixels, `null` for one line's own height | There is no percentage of a box to write; `null` is the box's own height. |
| `duration`, `delay`, `interval` in milliseconds | `Duration` | The framework already has the type. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. Here it only decides whether a hover trigger stops the reel when the pointer leaves. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it starts at once. |
| `render={<span />}` inside a sentence | — | A widget is a box; lay it beside the leading words in a `Row` or a `Wrap`. |
| A reel turning on its own timer runs while off screen | It rests while none of it is in view, and holds what was left of the line's wait | Flutter goes on running a timer nobody can see. |

:::

## See also

- [MPAnimateTyping](./animate-typing) — for one line being written out rather than several being swapped.
- [MPCarousel](../layout/carousel) — for a set a reader steps through with real controls.
- [MPAnimateMarquee](./animate-marquee) — for a set that goes past continuously rather than one at a time.
