---
title: MPAnimateBlink
order: 6
---

# MPAnimateBlink

<p class="mp-lede">Content pulsing between full opacity and a floor. A recording light, a live badge, a count that has just changed — and the one effect here that should be argued with before it is used.</p>

<Demo src="animate-blink/hero" :minHeight="220" />

```tsx
import { MPAnimateBlink } from 'material-plus-ui';

<MPAnimateBlink min={0.55}>
  <MPChip variant="tonal" color="error">
    3 checks failing
  </MPChip>
</MPAnimateBlink>;
```

## Props

<PropsTable name="MPAnimateBlink" />

## Read this before using it

Something that never stops moving in the corner of a page somebody is reading is the one kind of motion this library otherwise refuses. Two consequences follow, and both are the caller's to handle:

- **A reader with a reduced-motion preference sees none of it.** Whatever the blink was saying has to be in the content as well. If it is urgent, say so in words.
- **`min` is a dimming, not a disappearance.** At `0` the element is genuinely gone for half of every cycle, which makes it unreadable and, in a row of other things, unclickable-feeling. For anything with words on it, raise the floor.

For a placeholder that pulses because content has not arrived yet, this is the wrong component: [MPSkeleton](../feedback/skeleton) reserves the space the real thing will take, which is the part that was doing the work.

## Why the cycle is symmetric

Full, faint, full. However many times it runs, it ends where it started.

A keyframe that went from full to faint and stopped would leave the element permanently half drawn whenever the count ran out — which reads as a rendering fault rather than as an effect that has finished. It is also why `repeat` defaults to `infinite` here and to `1` everywhere else: a single blink is a flicker, and nobody asks for a flicker.

## Its numbers are a period, not a journey

`duration` here is one **cycle** — `extra-long4`, a second — rather than the time something takes to arrive. And the curve is `standard` rather than the emphasized decelerate the five arrivals take: a pulse has no destination to decelerate into, and easing into a frame it immediately leaves reads as a stutter.

## One effect across a set

`stagger` turns the effect into a per-child one: instead of the box pulsing, each child does, held back by its position. `durationStep` gives each a longer or shorter run than the last, and `reverse` runs the set from the end.

```tsx
<MPAnimateBlink stagger={60}>
  {items.map((item) => (
    <Item key={item.id} {...item} />
  ))}
</MPAnimateBlink>
```

The box itself animates nothing while a `stagger` is set — the same content played twice over is neither of the two curves anybody asked for. The three props are argued in full at [MPAnimateFade](./animate-fade#one-effect-across-a-set), and [MPAnimateAppear](./animate-appear) is this with `stagger` already on.

## Scrolling is a clock

`timeline="view"` hands the animation to the reader's scrolling instead of to a stopwatch: its progress is the element's progress through the scrollport, and `range` says which part of that travel it is spread over.

```tsx
<MPAnimateBlink timeline="view">…</MPAnimateBlink>
```

`duration`, `delay`, `repeat` and `trigger` stop meaning anything on `view`, and a browser without it falls back to the clock and plays once. Argued in full at [MPAnimateFade](./animate-fade#scrolling-is-a-clock).

## Accessibility

- Under `prefers-reduced-motion` the pulse stops entirely and the content sits at full opacity.
- Flashing content can trigger seizures. Keep the period well above the danger range — nothing near three cycles a second — and keep the contrast swing small by raising `min`. The default period of one second is deliberately slow.
- Nothing about the blink reaches the accessibility tree, so a screen reader is told exactly what the content says and nothing about how it is drawn. If the pulse means "live" or "failing", the content has to say that too.
- `paused` holds the pulse without unwinding it, which is the prop for a page that has a "reduce animation" switch of its own.

## See also

- [MPSkeleton](../feedback/skeleton) — for content that has not arrived yet.
- [MPProgressLinear](../feedback/progress-linear) — for something that is actually in progress.
- [MPBadge](../display/badge) — for a count that has to be noticed without anything moving.
