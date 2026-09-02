---
title: MPAnimateFloat
order: 9
---

# MPAnimateFloat

<p class="mp-lede">An endless, slow drift. The only thing in the set that says <em>not fixed to the page</em> — a shadow is a claim about depth, and this is depth behaving.</p>

<Demo src="animate-float/hero" :minHeight="360" />

```tsx
import { MPAnimateFloat } from 'material-plus-ui';

<MPAnimateFloat>
  <img src="/hero.png" alt="" />
</MPAnimateFloat>;
```

## Props

<PropsTable name="MPAnimateFloat" />

## Never on a control

A button that drifts cannot be pointed at. The pointer arrives where the button was, the button has moved four pixels, and the reader is left tracking a target that is running away from them — which is exactly the failure the library's rule against transforming controls exists to prevent.

This is for decoration: an illustration, a hero graphic, a badge on a marketing page, a card in an empty state. Nothing that can be pressed, typed into, dragged or dropped on.

## One at a time

Six things drifting on their own cycles is a page that will not sit still to be read, and there is no way to look at any one of them. The effect works because it is the exception on the page; a second one halves it and a sixth cancels it.

## It is not one of the shared effects

The six entrances go from a written state to the element's own, and every one of them has an **arrival**. A drift has no destination — it goes nowhere and comes back — so it keeps its keyframe in its own file rather than joining `MPAnimation`.

That is not tidiness. The shared union is backed by three lookup tables, and an object literal is not tree-shaken key by key: every component that reads one pays for the rows it will never use. A value belongs in a shared table when the components that will never use it have some reason to carry it, and a drift gives them none.

## Examples

### distance and sway

`distance` is how far it rises at the top of the path and `sway` is how far it wanders to either side. Both are small by design: this says *not fixed down*, and anything a reader can measure says *moving* instead.

`sway` is less than `distance` so the path reads as a drift rather than as a circle — four points around the origin, because one axis is a bob and a bob is a loading indicator.

### tilt

How far it leans at the extremes, in degrees. `0` by default: a tilt is the difference between something floating and something *tumbling*, and anything with text on it wants none of it. Two or three degrees is plenty for an illustration.

### duration

Six seconds by default, and deliberately not a Material token. The motion ladder runs to a second because it is for things that **arrive**, and a period is not a duration. Slower reads as lighter; faster reads as agitated well before it reads as quick.

### stagger

A `stagger` moves the drift onto the children, so a row of three shapes is three drifts a beat apart rather than one block moving as a unit. That is the one arrangement where more than one of these is right.

## Accessibility

- Under `prefers-reduced-motion` the drift is dropped and the content sits still. There is nothing lost: the effect is decoration, and decoration that a reader has asked not to see is decoration they do not need.
- Nothing here changes the accessibility tree, and nothing inside is ever moved out of reach — but see **Never on a control**: motion under a pointer is a physical barrier that no attribute fixes.

## See also

- [MPAnimateBlink](./animate-blink) — for something that has to be noticed rather than something that has to feel light.
- [MPAnimateLighting](./animate-lighting) — the other purely decorative effect, and the other one to use once per page.
