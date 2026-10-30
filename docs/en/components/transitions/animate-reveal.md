---
title: MPAnimateReveal
order: 6
---

# MPAnimateReveal

<p class="mp-lede">Content uncovered where it already is. The only entrance in the set where nothing moves and no colour changes — the ink is final from the first frame, and what changes is how much of it has been disclosed.</p>

<Demo src="animate-reveal/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateReveal } from 'material-plus-ui';

<MPAnimateReveal>
  <MPTypography level="h3">What we shipped this quarter</MPTypography>
</MPAnimateReveal>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateReveal(
  child: MPTypography('What we shipped this quarter', level: MPTypographyLevel.h3),
);
```

:::

## Props

<PropsTable name="MPAnimateReveal" />

## When position is part of what is being said

Every other entrance here either scales its content or travels it, and both tell the reader the thing arrived from somewhere. For most content that is fine and often right. For some of it, it is a small lie.

A page title, a rule under a heading, the plot area of a chart, the first row of a table: all of those mean something by being **exactly where they are**. A title that slid up from below was, for a moment, in the wrong place. A chart's plot area that grew from 80% was, for a moment, showing the wrong values.

A reveal has neither problem. The box is at its final position and its final size from the first frame; the clip is the only thing that moves, and a clip is not a position.

[MPAnimateFade](./animate-fade) is the other effect that leaves position alone, and the two differ in what they are willing to spend. A fade spends the **colour** — the content is in the wrong ink until it finishes. A reveal spends the **extent** — the content is at the right ink and only partly there. Which of those is acceptable depends on what the content is: prose reads badly half-drawn and fine half-faded, and a hairline is the other way round.

## `clip-path`, not a mask and not an `overflow` box

::: fw react

Three ways to uncover something, and the other two both cost more.

A **mask** needs a gradient, the gradient needs a direction, and the direction has to agree with the side — so there are two things to keep in step instead of one, and the resting state is a second gradient that means "all of it".

A wrapper with **`overflow: hidden`** puts an element into the layout that was not there before. Inside a grid or a flex row that changes what the content is a child of, which is precisely the thing this effect exists to leave alone: a reveal that moved its content out of its grid cell to avoid moving it has not done what it said.

`clip-path` has neither. `inset(0)` is already the spelling of "nothing is clipped", so the resting appearance is the element's own and the to-state needs no custom property. Nothing reflows, so a reveal around a paragraph costs the page nothing.

:::

::: fw flutter

In Flutter the wipe is a `ClipRect` whose clipper is asked for a rectangle at paint time. Nothing about it reaches the layout: the box keeps its size and its place, and a reveal around a paragraph costs the page nothing. At the end of the wipe the clip is the whole box, as `inset(0)` is, so the resting appearance is the widget's own.

:::

## Examples

### from

Which edge the wipe **opens at**, not the direction it travels — a caller is pointing at a place, which is the same choice [MPAnimateSlide](./animate-slide) makes.

`left` is the default and discloses the content rightwards, which is the reading direction of most of the world and the right answer for a line of text. `top` and `bottom` suit a rule or a divider; `right` reads as a correction, because it uncovers the end of the sentence first.

`MPSide` is physical here as it is everywhere in this library. A title disclosed from the left of its box is disclosed from the left in every writing direction; which edge to name under RTL is a decision, not a translation.

### fade

**Off** by default, and it is the one setting here worth arguing about. A reveal is not a fade — the whole point is that the ink is final from the first frame. Doing both gives a weaker version of each: a wipe that is also translucent reads as neither, and the moment where it is half-clipped and half-faded is a frame nobody designed.

Turn it on when the edge of the wipe is too hard for what it is running over — a photograph, or a block with a strong background of its own.

### mode

::: fw react

`mode="out"` runs the same keyframe backwards and covers the content again, ending held: it stays covered rather than snapping back. The exit is quicker than the entrance — `short4` against `medium4` — which is MD3's asymmetry and the same one every effect here carries.

:::

::: fw flutter

`MPAnimateMode.exit` runs the same wipe backwards and covers the content again, ending held: it stays covered rather than snapping back. The exit is quicker than the entrance — `short4` against `medium4` — which is MD3's asymmetry and the same one every effect here carries.

:::

### stagger

With a `stagger` the wipe runs on each child rather than on the box, held back by its position, which for a list of rules or a set of headings walks the reader down them. See [One effect across a set](./animate-fade#one-effect-across-a-set).

::: fw flutter

The set is passed as `children` rather than `child`, and `layoutBuilder` places it — a column when nobody says, which is what a heading, its rule and its paragraph want.

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` the animation is dropped and the content is simply there, whole. That is the right answer for an entrance, which has already delivered everything it was carrying.
- Nothing here changes the accessibility tree. The content is in the document from the first frame whether or not it has been drawn yet, so a screen reader is never waiting on the wipe.
- A clip is not a hiding. Content that has not been uncovered yet is still in the **tab order** and still read by a screen reader, exactly as it is behind an unfinished fade. That is the right default for an entrance — the content has been delivered and only its drawing is in progress — but it means a reveal is not a way to withhold something. [MPSpoiler](../display/spoiler) is, and it uses `inert` to do it.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped and the content is simply there, whole, from the first frame — an exit included. That is the right answer for an entrance, which has already delivered everything it was carrying.
- The widget adds nothing to the semantics. Its content is in the tree from the first frame whether or not it has been drawn yet, so a screen reader is never waiting on the wipe.
- A clip is not a hiding. Content that has not been uncovered yet is still reached by the keyboard and still read by a screen reader, exactly as it is behind an unfinished fade. That is the right default for an entrance, but it means a reveal is not a way to withhold something. [MPSpoiler](../display/spoiler) is.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| A `clip-path: inset()` keyframe | A `ClipRect` whose clipper is asked for a rectangle at paint time | Flutter has no `clip-path`; a paint-time clip is the same promise, the layout never hearing about it. |
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

- [MPAnimateFade](./animate-fade) — the other entrance that leaves position alone, spending the colour instead of the extent.
- [MPAnimateSlide](./animate-slide) — for something that really did arrive from an edge.
- [MPAnimateAppear](./animate-appear) — for a list of things settling in one after another.
