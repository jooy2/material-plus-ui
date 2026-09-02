---
title: MPAnimateCounter
order: 17
---

# MPAnimateCounter

<p class="mp-lede">A number counting up to its value. The one effect here that cannot be a keyframe on its own — and it is still a CSS animation.</p>

<Demo src="animate-counter/hero" :minHeight="360" />

```tsx
import { MPAnimateCounter } from 'material-plus-ui';

<MPAnimateCounter value={128_400} options={{ notation: 'compact' }} />;
```

## Props

<PropsTable name="MPAnimateCounter" />

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

## Waiting shows `from`, not the answer

Every declared effect sits paused on its own first frame until something starts it, which is what `animation-fill-mode: both` is for. A counter driven by its own clock has to be _taught_ that, and the version of this that was not is the one that shows `1,284` while it waits to be scrolled into view — having already answered the question it was about to ask.

Here it comes for nothing, because the waiting state is a paused animation and a paused animation is sitting on `from`.

## Formatting

`options` is anything `Intl.NumberFormat` takes, so a currency, a percentage or a compact notation is a prop rather than a template:

```tsx
<MPAnimateCounter value={1234.5} locale="de-DE" options={{ style: 'currency', currency: 'EUR' }} />
```

Formatted rather than concatenated, because the pieces of a number are not in the same order everywhere. `$1,234.50` and `1.234,50 €` are the same value, and a `prefix`/`suffix` pair can only write one of them.

`format` takes the whole formatter for the numbers `Intl` has no option for — an ordinal, a score out of ten, a duration.

The digits are set in `tabular-nums`, or a tile shifts sideways on every frame that swaps a `1` for an `8`. A statistic that shivers while it counts is worse than one that does not count at all.

## In a background tab

`requestAnimationFrame` does not run in a tab nobody is looking at, so a counter left in the background sits at `from` and jumps to its value on return, having been "running" the whole time.

That is the right behaviour — the reader sees the number they came back for — but it is worth knowing before somebody reports it as a bug.

## Accessibility

- A screen reader gets the **final number**, once, out of a clipped box; the counting copy is `aria-hidden`. A live count would be announced sixty times a second, and the one thing a reader wants from a statistic is the statistic.
- Under `prefers-reduced-motion` the animation is dropped and the number is simply there.
- The value is in the document from the first frame, so find-on-page matches it before the count has finished.

## See also

- [MPAnimateReveal](./animate-reveal) — for the tile around the number, whose position is part of what it says.
- [MPAnimateFade](./animate-fade) — for the label beside it.
