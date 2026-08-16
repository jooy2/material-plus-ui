---
title: MPAnimateHeadline
order: 10
---

# MPAnimateHeadline

<p class="mp-lede">One line replacing the one above it, on a timer. A set of phrases where any one of them would have done — three ways of saying what a product is, a rotating list of the places it works.</p>

<Demo src="animate-headline/hero" :minHeight="200" />

```tsx
import { MPAnimateHeadline } from 'material-plus-ui';

<MPAnimateHeadline interval={2200}>
  <MPTypography level="h4">a component library</MPTypography>
  <MPTypography level="h4">Material Design 3</MPTypography>
</MPAnimateHeadline>;
```

## Props

<PropsTable name="MPAnimateHeadline" />

## The box never resizes

Every line sits in the **same grid cell**, so the reel is as tall and as wide as the longest of them from the first frame. That is the whole difficulty with this effect: a headline that resized as it turned would move everything below it four times a sentence, and a reader partway down the page would be shunted every two seconds.

It is also why the lines that are not showing keep their space with `visibility` rather than `display`. Taking them out of the layout would take their contribution to the box's size with them.

## It is not a ticker

A line comes up, it **stops**, and it is held long enough to read.

`interval` is counted from the moment a line arrives rather than from the start of the cycle, so it is reading time: raising `duration` to make the swap slower does not quietly eat it.

## Both halves of the emphasized curve

This is the one place in the library where MD3's `emphasized-decelerate` and `emphasized-accelerate` are both written out. Everywhere else an exit is a reversed entrance, which mirrors the curve for free — but here the two are genuinely two animations, on two elements, at the same moment: the line arriving decelerates into place while the line leaving accelerates away.

## Examples

<Demo src="animate-headline/controlled" :minHeight="260">

<<< @/.vitepress/demos/animate-headline/controlled.tsx

</Demo>

### index

Hand it an `index` and the reel **stops turning on its own**. A controlled headline is somebody else's timer, and a second one running underneath it would fight for the same state.

That is what ties the reel to a step in a form, a tab, or anything else that already knows which line should be showing. `onIndexChange` reports the line that has just come up, for the uncontrolled case.

### loop

On by default. Off, the reel stops on the last line and stays there — which is what a sequence wants, as against a set.

### rise

How far a line travels as it comes up or leaves. `'100%'` is one line's own height, which is what makes the two lines look like a single strip moving. Shorter reads as a fade with a nudge.

## Accessibility

- A screen reader is given the line that happens to be showing rather than the set, so **this is not for content a reader has to see**. There is no guarantee anyone is looking during the two seconds a given line is up.
- Under `prefers-reduced-motion` the reel still turns — it is a set of phrases, and stopping on the first would be a different message — but the lines swap rather than travel.
- Anything that matters should be outside the reel, or the reel should be controlled by something the reader drives themselves.
- `paused` holds the reel where it is, and `trigger="hover"` is worth considering for a headline in a place a reader lingers.

## See also

- [MPAnimateTyping](./animate-typing) — for one line being written out rather than several being swapped.
- [MPCarousel](../layout/carousel) — for a set a reader steps through with real controls.
- [MPAnimateMarquee](./animate-marquee) — for a set that goes past continuously rather than one at a time.
