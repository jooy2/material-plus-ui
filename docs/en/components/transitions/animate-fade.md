---
title: MPAnimateFade
order: 1
---

# MPAnimateFade

<p class="mp-lede">Content arriving or leaving on opacity alone. Nothing moves, so nothing reflows and no text is resampled — the one entrance that is safe on a block of prose at any size.</p>

<Demo src="animate-fade/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateFade } from 'material-plus-ui';

<MPAnimateFade>
  <MPCard title="Ready when you are" />
</MPAnimateFade>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateFade(
  child: MPCard(title: Text('Ready when you are')),
);
```

:::

## Props

<PropsTable name="MPAnimateFade" />

## Why this one first

Every other effect in this group either scales its content or travels it, and both resample glyphs. A fade changes one number and changes nothing about where anything sits, so it is the only entrance that can be put around running text without the text being redrawn at a fractional size on the way in.

It is also the effect the specification names in two of its four transition patterns. **Fade through** — one thing out, then the next in — is what this becomes when two of them are sequenced with a `delay`. **Fade** on its own is something entering or leaving a screen, which is the default here.

## Duration and easing come from tokens

::: fw react

Say nothing about `duration` and the animation runs at `var(--mp-sys-motion-duration-medium2)` rather than at `300ms`. Both draw the same thing today; only one of them moves when a page retunes its motion.

The same is true of the curve. `easing` takes MD3's seven names and no arbitrary `cubic-bezier()`, for the reason `color` takes a family rather than a colour: to change what `emphasized` _is_, set `--mp-sys-motion-easing-emphasized` and every animation on the page moves together.

:::

::: fw flutter

Say nothing about `duration` and the run takes `MPMotion.medium2`, the effect's own MD3 token, rather than a number written into the widget.

The same is true of the curve. `easing` takes MD3's seven names as `MPEasing` values and no arbitrary `Curve`, for the reason `color` takes a family rather than a colour: each name stands for one curve in `MPMotion`, so every animation in the library is drawn from the same set.

:::

## An exit is quicker than an entrance

::: fw react

`mode="out"` runs the same keyframe backwards, and it defaults to `short4` where the entrance defaults to `medium2`. That asymmetry is Material's: something arriving is being introduced and is given time to be read as an arrival, while something leaving has already said what it had to say.

Reversing also fixes the curve for free. CSS mirrors the timing function along with the keyframes, so an entrance eased on `emphasized-decelerate` comes back accelerating — which is the exit curve the specification asks for.

A faded-out element is **held** faded out. `animation-fill-mode` is `both`, so it does not snap back into view the moment the animation finishes.

:::

::: fw flutter

`MPAnimateMode.exit` runs the same animation backwards, and it defaults to `short4` where the entrance defaults to `medium2`. That asymmetry is Material's: something arriving is being introduced and is given time to be read as an arrival, while something leaving has already said what it had to say.

The curve is turned round with the run, so an entrance eased on `emphasizedDecelerate` leaves accelerating — which is the exit curve the specification asks for.

A faded-out widget is **held** faded out. It does not snap back into view the moment the run finishes.

:::

## One effect across a set

`stagger` turns the effect into a per-child one. Instead of the box fading, each child fades, held back by its position — so what arrives is the **set**, in the order it should be read.

::: fw react

```tsx
<MPAnimateFade stagger={60}>
  {rows.map((row) => (
    <Row key={row.id} {...row} />
  ))}
</MPAnimateFade>
```

:::

::: fw flutter

```dart
MPAnimateFade(
  stagger: const Duration(milliseconds: 60),
  children: [for (final Item row in rows) ItemRow(key: ValueKey(row.id), item: row)],
);
```

The set is passed as `children` rather than `child`, and `layoutBuilder` places it — a column of them when nobody says, or the list, the row or the grid they belong in. In React the caller's own markup goes on laying the children out; a widget has to place what it is given, so this is where you say how.

:::

There is deliberately no `MPAnimateStagger` component. A list settling in is not a different effect from a fade; it is the same fade told when to start, and a wrapper would be a second spelling of something these six already do — a caller would have to choose between "fade" and "fade one at a time" at the import.

**The box itself animates nothing while a `stagger` is set.** Eight children fading in under a box that is also fading in is the same content faded twice: what a reader sees is one opacity multiplied by the other, which is neither of the two curves anybody asked for.

The step is per **child**, so what you pass is the dial. Eight children are eight steps; one child holding eight things is one step. That is also how to opt part of a set out of the sequence — group it.

`durationStep` gives each child a longer or shorter run than the one before it, which reads as the set spreading out or drawing together as it lands. Negative is allowed and is clamped at zero, so a long list cannot ask for a negative duration.

::: fw react

`reverse` runs the set from the last child to the first. Only the **order** is reversed — each child still plays forwards, which is what separates it from `mode="out"`.

`paused` still holds the whole set and a `trigger` still starts all of it at once: the play state is the one thing the box keeps, and it reaches the children by inheritance.

:::

::: fw flutter

`reverse` runs the set from the last child to the first. Only the **order** is reversed — each child still plays forwards, which is what separates it from `MPAnimateMode.exit`.

`paused` still holds the whole set and a `trigger` still starts all of it at once: the trigger belongs to the set, so one decision is made for every child rather than one per child.

:::

The three are on the six effects that are a single `@keyframes` on the element itself. [MPAnimateMarquee](./animate-marquee) duplicates its children, [MPAnimateHeadline](./animate-headline) swaps between them and [MPAnimateTyping](./animate-typing) counts their characters, so none of the three can hand an arbitrary child an animation; [MPAnimateLighting](./animate-lighting) puts its movement on a pseudo-element a child has no equivalent of. [MPAnimateAppear](./animate-appear) is this with `stagger` already on at 80ms, and runs on the same code.

## Scrolling is a clock

::: fw react

`timeline="view"` hands the animation to the reader instead of to a stopwatch. Its progress _is_ the element's progress through the scrollport: scroll back and it runs backwards, stop halfway and it stays halfway.

```tsx
<MPAnimateFade timeline="view">
  <MPCard title="Arrives as you reach it" />
</MPAnimateFade>
```

It is the same keyframe. There is no scroll-driven component and no second set of frames, because a fade tied to a scroll position is not a different effect from a fade — which is also why every one of these six gets it for two declarations of CSS.

**Three props stop meaning anything on `view`.** `duration`, `delay` and `repeat` are the stopwatch's units and there is no stopwatch. So does `trigger`: the scroll position _is_ the trigger, and the animation is held `running` for it — a paused scroll-driven animation shows nothing at all, which is what `trigger="manual"` with nothing pressing go would otherwise leave on the page. An explicit `paused` is still honoured; it is the one of the four that is a caller saying stop.

`range` is what replaces them. It takes any CSS `animation-range`, and the default — `entry 0% cover 45%` — runs from the moment the element's leading edge appears to a little under halfway across, so it has finished arriving by the time it is somewhere a reader would be looking. A range that ran to the far edge would leave everything on the page permanently mid-animation, which is how most scroll-driven pages go wrong: nothing on screen is ever finished.

With a `stagger` the timeline goes on each **child**, which is the right answer rather than a side effect — each one then has its own travel through the scrollport, and the position does the sequencing the delay used to.

A browser without `view()` falls back to the clock and plays the effect once, exactly as it always did. The declarations are behind an `@supports` for that reason, and specifically because `animation-timeline` and `animation-range` are two properties: taking the first without the second would give an animation a timeline and nothing to run it over. Degraded is fine; blank is not.

:::

::: fw flutter

Not offered. `timeline` and `range` hand the keyframe to CSS's `view()` timeline, which has no counterpart here. A scroll-linked effect in Flutter is an `AnimationController` driven from a `ScrollPosition`, which is an application's own wiring rather than something a widget can take as a parameter. `MPAnimateTrigger.visible` is the nearest thing: it starts the run when the widget is scrolled into view, and plays it on the clock from there.

:::

## Examples

<Demo src="animate-fade/triggers" :minHeight="360">

::: fw react

<<< @/.vitepress/demos/animate-fade/triggers.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_fade/triggers.dart

:::

</Demo>

### trigger

- `mount` — as soon as it is on the page. The default.
- `visible` — when it is scrolled into view. Once, unless `once` is off.
- `hover` — while the pointer is on it, starting again on each entry. Keyboard focus counts too.
- `manual` — never on its own; `play` is what runs it, and each `false` → `true` starts it over.

A restart rewinds the animation without unmounting anything, so nothing inside loses its state.

::: fw flutter

`visible` watches every `Scrollable` above the widget and counts it as visible once enough of it is inside all of their viewports and on the screen. With no scrollable above it there is nothing to watch, so it runs at once rather than waiting for ever — the answer the React build gives in a browser without `IntersectionObserver`.

:::

### from

The opacity it starts from. At `0` it arrives out of nothing; raise it for content that should never be completely gone — a panel that dims rather than disappears.

### repeat and alternate

::: fw react

`repeat="infinite"` with `alternate` is what turns a one-way entrance into a breath: every other pass runs backwards, so it returns instead of jumping back to the start.

:::

::: fw flutter

`repeat: null` with `alternate: true` is what turns a one-way entrance into a breath: every other pass runs backwards, so it returns instead of jumping back to the start. `null` is how `MPAnimateRepeat` says _never stop_.

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` the animation is dropped entirely and the content is simply there. That is the opposite of what the [progress indicators](../feedback/progress-linear) do, and the difference is what each is saying: a spinner that stops is lying about whether anything is happening, while an entrance that does not play has still delivered everything it was carrying.
- The animation is dropped with `animation: none` rather than a zero duration, because the shorthand also clears `fill-mode` — and it is the fill that was holding an untriggered element at `opacity: 0`. Left in place, respecting the preference would blank the page.
- Nothing here changes the accessibility tree. The content is in the document from the first frame whether or not it has been drawn yet, so a screen reader is never waiting on an animation.
- `trigger="hover"` also starts on focus, so an effect on something keyboard-reachable is not reserved for readers holding a mouse.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped entirely and the content is simply there, at full opacity, from the first frame — an exit included, and whatever the trigger is waiting for. That is the opposite of what the [progress indicators](../feedback/progress-linear) do, and the difference is what each is saying: a spinner that stops is lying about whether anything is happening, while an entrance that does not play has still delivered everything it was carrying.
- Nothing ticks while the setting is on, and a run the trigger lets go after it is turned off starts from its first frame.
- The widget adds nothing to the semantics. Its content is in the tree from the first frame, at opacity `0` as well, so a screen reader is never waiting on an animation.
- `MPAnimateTrigger.hover` also starts when the focus lands on something inside it, so an effect on something keyboard-reachable is not reserved for readers holding a mouse. The widget takes no focus of its own, so it adds no stop to the tab order.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `delay`, `stagger`, `durationStep` in milliseconds | `Duration` | The framework already has the type. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. There is no stylesheet token for a theme to retune. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word, and `-1` would be a sentinel to look up. |
| `mode="in" \| "out"` | `MPAnimateMode.enter` / `.exit` | `in` is a reserved word in Dart. |
| `children` laid out by the caller's markup | `child`, or `children` and `layoutBuilder` | A widget has to place what it is given, so a staggered set says how it is laid out. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `timeline`, `range` | — | CSS's `view()` timeline has no counterpart; see [Scrolling is a clock](#scrolling-is-a-clock). |
| `render`, `className`, `style` | — | There is no element to swap and no class list or style attribute to pass through. |
| An endless effect runs while off screen | It rests while none of it is in view | Flutter goes on drawing an animation nobody can see, so an endless run is held off screen and goes on from the same frame when it is back. |

:::

## See also

- [MPAnimateGrow](./animate-grow) — for something unfolding out of the thing next to it.
- [MPAnimateSlide](./animate-slide) — for something travelling in from an edge.
- [MPAnimateAppear](./animate-appear) — for a list of things settling in one after another.
