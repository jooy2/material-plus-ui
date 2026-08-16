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
