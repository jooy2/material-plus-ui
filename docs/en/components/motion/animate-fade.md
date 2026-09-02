---
title: MPAnimateFade
order: 1
---

# MPAnimateFade

<p class="mp-lede">Content arriving or leaving on opacity alone. Nothing moves, so nothing reflows and no text is resampled — the one entrance that is safe on a block of prose at any size.</p>

<Demo src="animate-fade/hero" :minHeight="360" />

```tsx
import { MPAnimateFade } from 'material-plus-ui';

<MPAnimateFade>
  <MPCard title="Ready when you are" />
</MPAnimateFade>;
```

## Props

<PropsTable name="MPAnimateFade" />

## Why this one first

Every other effect in this group either scales its content or travels it, and both resample glyphs. A fade changes one number and changes nothing about where anything sits, so it is the only entrance that can be put around running text without the text being redrawn at a fractional size on the way in.

It is also the effect the specification names in two of its four transition patterns. **Fade through** — one thing out, then the next in — is what this becomes when two of them are sequenced with a `delay`. **Fade** on its own is something entering or leaving a screen, which is the default here.

## Duration and easing come from tokens

Say nothing about `duration` and the animation runs at `var(--mp-sys-motion-duration-medium2)` rather than at `300ms`. Both draw the same thing today; only one of them moves when a page retunes its motion.

The same is true of the curve. `easing` takes MD3's seven names and no arbitrary `cubic-bezier()`, for the reason `color` takes a family rather than a colour: to change what `emphasized` _is_, set `--mp-sys-motion-easing-emphasized` and every animation on the page moves together.

## An exit is quicker than an entrance

`mode="out"` runs the same keyframe backwards, and it defaults to `short4` where the entrance defaults to `medium2`. That asymmetry is Material's: something arriving is being introduced and is given time to be read as an arrival, while something leaving has already said what it had to say.

Reversing also fixes the curve for free. CSS mirrors the timing function along with the keyframes, so an entrance eased on `emphasized-decelerate` comes back accelerating — which is the exit curve the specification asks for.

A faded-out element is **held** faded out. `animation-fill-mode` is `both`, so it does not snap back into view the moment the animation finishes.

## One effect across a set

`stagger` turns the effect into a per-child one. Instead of the box fading, each child fades, held back by its position — so what arrives is the **set**, in the order it should be read.

```tsx
<MPAnimateFade stagger={60}>
  {rows.map((row) => (
    <Row key={row.id} {...row} />
  ))}
</MPAnimateFade>
```

There is deliberately no `MPAnimateStagger` component. A list settling in is not a different effect from a fade; it is the same fade told when to start, and a wrapper would be a second spelling of something these six already do — a caller would have to choose between "fade" and "fade one at a time" at the import.

**The box itself animates nothing while a `stagger` is set.** Eight children fading in under a box that is also fading in is the same content faded twice: what a reader sees is one opacity multiplied by the other, which is neither of the two curves anybody asked for.

The step is per **child**, so what you pass is the dial. Eight children are eight steps; one child holding eight things is one step. That is also how to opt part of a set out of the sequence — group it.

`durationStep` gives each child a longer or shorter run than the one before it, which reads as the set spreading out or drawing together as it lands. Negative is allowed and is clamped at zero, so a long list cannot ask for a negative duration and get the default instead.

`reverse` runs the set from the last child to the first. Only the **order** is reversed — each child still plays forwards, which is what separates it from `mode="out"`.

`paused` still holds the whole set, and a `trigger` still starts all of it at once: the play state is the one thing the box keeps, and it reaches the children by inheritance.

The three are on the six effects that are a single `@keyframes` on the element itself. [MPAnimateMarquee](./animate-marquee) duplicates its children, [MPAnimateHeadline](./animate-headline) swaps between them and [MPAnimateTyping](./animate-typing) counts their characters, so none of the three can hand an arbitrary child an animation; [MPAnimateLighting](./animate-lighting) puts its movement on a pseudo-element a child has no equivalent of. [MPAnimateAppear](./animate-appear) is this with `stagger` already on at 80ms, and runs on the same code.

## One effect across a set

`stagger` turns the effect into a per-child one. Instead of the box fading, each child fades, held back by its position — so what arrives is the **set**, in the order it should be read.

```tsx
<MPAnimateFade stagger={60}>
  {rows.map((row) => (
    <Row key={row.id} {...row} />
  ))}
</MPAnimateFade>
```

There is deliberately no `MPAnimateStagger` component. A list settling in is not a different effect from a fade; it is the same fade told when to start, and a wrapper would be a second spelling of something these six already do — a caller would have to choose between "fade" and "fade one at a time" at the import.

**The box itself animates nothing while a `stagger` is set.** Eight children fading in under a box that is also fading in is the same content faded twice: what a reader sees is one opacity multiplied by the other, which is neither of the two curves anybody asked for.

The step is per **child**, so what you pass is the dial. Eight children are eight steps; one child holding eight things is one step. That is also how to opt part of a set out of the sequence — group it.

`durationStep` gives each child a longer or shorter run than the one before it, which reads as the set spreading out or drawing together as it lands. Negative is allowed and is clamped at zero, so a long list cannot ask for a negative duration and get the stylesheet's default instead.

`reverse` runs the set from the last child to the first. Only the **order** is reversed — each child still plays forwards, which is what separates it from `mode="out"`.

`paused` still holds the whole set and a `trigger` still starts all of it at once: the play state is the one thing the box keeps, and it reaches the children by inheritance.

The three are on the six effects that are a single `@keyframes` on the element itself. [MPAnimateMarquee](./animate-marquee) duplicates its children, [MPAnimateHeadline](./animate-headline) swaps between them and [MPAnimateTyping](./animate-typing) counts their characters, so none of the three can hand an arbitrary child an animation; [MPAnimateLighting](./animate-lighting) puts its movement on a pseudo-element a child has no equivalent of. [MPAnimateAppear](./animate-appear) is this with `stagger` already on at 80ms, and runs on the same code.

## Scrolling is a clock

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

## Examples

<Demo src="animate-fade/triggers" :minHeight="360">

<<< @/.vitepress/demos/animate-fade/triggers.tsx

</Demo>

### trigger

- `mount` — as soon as it is on the page. The default.
- `visible` — when it is scrolled into view. Once, unless `once` is off.
- `hover` — while the pointer is on it, starting again on each entry. Keyboard focus counts too.
- `manual` — never on its own; `play` is what runs it, and each `false` → `true` starts it over.

A restart rewinds the animation without unmounting anything, so nothing inside loses its state.

### from

The opacity it starts from. At `0` it arrives out of nothing; raise it for content that should never be completely gone — a panel that dims rather than disappears.

### repeat and alternate

`repeat="infinite"` with `alternate` is what turns a one-way entrance into a breath: every other pass runs backwards, so it returns instead of jumping back to the start.

## Accessibility

- Under `prefers-reduced-motion` the animation is dropped entirely and the content is simply there. That is the opposite of what the [progress indicators](../feedback/progress-linear) do, and the difference is what each is saying: a spinner that stops is lying about whether anything is happening, while an entrance that does not play has still delivered everything it was carrying.
- The animation is dropped with `animation: none` rather than a zero duration, because the shorthand also clears `fill-mode` — and it is the fill that was holding an untriggered element at `opacity: 0`. Left in place, respecting the preference would blank the page.
- Nothing here changes the accessibility tree. The content is in the document from the first frame whether or not it has been drawn yet, so a screen reader is never waiting on an animation.
- `trigger="hover"` also starts on focus, so an effect on something keyboard-reachable is not reserved for readers holding a mouse.

## See also

- [MPAnimateGrow](./animate-grow) — for something unfolding out of the thing next to it.
- [MPAnimateSlide](./animate-slide) — for something travelling in from an edge.
- [MPAnimateAppear](./animate-appear) — for a list of things settling in one after another.
