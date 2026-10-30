---
title: MPAnimateFloat
order: 9
---

# MPAnimateFloat

<p class="mp-lede">An endless, slow drift. The only thing in the set that says <em>not fixed to the page</em> — a shadow is a claim about depth, and this is depth behaving.</p>

<Demo src="animate-float/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateFloat } from 'material-plus-ui';

<MPAnimateFloat>
  <img src="/hero.png" alt="" />
</MPAnimateFloat>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateFloat(
  child: Image(image: AssetImage('assets/hero.png'), excludeFromSemantics: true),
);
```

:::

## Props

<PropsTable name="MPAnimateFloat" />

## Never on a control

A button that drifts cannot be pointed at. The pointer arrives where the button was, the button has moved four pixels, and the reader is left tracking a target that is running away from them — which is exactly the failure the library's rule against transforming controls exists to prevent.

This is for decoration: an illustration, a hero graphic, a badge on a marketing page, a card in an empty state. Nothing that can be pressed, typed into, dragged or dropped on.

## One at a time

Six things drifting on their own cycles is a page that will not sit still to be read, and there is no way to look at any one of them. The effect works because it is the exception on the page; a second one halves it and a sixth cancels it.

## It is not one of the shared effects

::: fw react

The six entrances go from a written state to the element's own, and every one of them has an **arrival**. A drift has no destination — it goes nowhere and comes back — so it keeps its keyframe in its own file rather than joining `MPAnimation`.

That is not tidiness. The shared union is backed by three lookup tables, and an object literal is not tree-shaken key by key: every component that reads one pays for the rows it will never use. A value belongs in a shared table when the components that will never use it have some reason to carry it, and a drift gives them none.

:::

::: fw flutter

The six entrances go from a start state to the widget's own, and every one of them has an **arrival**. A drift has no destination — it goes nowhere and comes back — so it is not an `MPAnimation` and takes none of that table's durations or curves. Its path is its own: five keyframes, home, up and to one side, highest, up and to the other side, home, with the curve applied to each leg as a CSS timing function is applied between two keyframes.

:::

## Examples

### distance and sway

`distance` is how far it rises at the top of the path and `sway` is how far it wanders to either side. Both are small by design: this says _not fixed down_, and anything a reader can measure says _moving_ instead.

`sway` is less than `distance` so the path reads as a drift rather than as a circle — four points around the origin, because one axis is a bob and a bob is a loading indicator.

::: fw flutter

Both are logical pixels: `10` and `6`, which is what the React defaults of `0.625rem` and `0.375rem` come to at a 16px root.

:::

### tilt

How far it leans at the extremes, in degrees. `0` by default: a tilt is the difference between something floating and something _tumbling_, and anything with text on it wants none of it. Two or three degrees is plenty for an illustration.

### duration

Six seconds by default, and deliberately not a Material token. The motion ladder runs to a second because it is for things that **arrive**, and a period is not a duration. Slower reads as lighter; faster reads as agitated well before it reads as quick.

### stagger

A `stagger` moves the drift onto the children, so a row of three shapes is three drifts a beat apart rather than one block moving as a unit. That is the one arrangement where more than one of these is right.

::: fw flutter

The set is passed as `children` and laid out by `layoutBuilder`. The demo above hands it a `Row`, which is what the React demo's `display: flex` says.

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` the drift is dropped and the content sits still. There is nothing lost: the effect is decoration, and decoration that a reader has asked not to see is decoration they do not need.
- Nothing here changes the accessibility tree, and nothing inside is ever moved out of reach — but see **Never on a control**: motion under a pointer is a physical barrier that no attribute fixes.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the drift is dropped, the content sits still at home, and nothing ticks. There is nothing lost: the effect is decoration, and decoration that a reader has asked not to see is decoration they do not need.
- Nothing here changes the semantics tree, and nothing inside is ever moved out of reach — but see **Never on a control**: motion under a pointer is a physical barrier that no parameter fixes.
- The drift rests while none of it is in view, and goes on from the same frame when it is back.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `delay`, `stagger`, `durationStep` in milliseconds | `Duration` | The framework already has the type. |
| `distance`, `sway` as a number of pixels or a CSS length | `double`, in logical pixels | There is no root font size to resolve a `rem` against. |
| `easing="standard"` | `MPEasing.standard` | Each name maps onto one of the curves in `MPMotion`. |
| `repeat: number \| 'infinite'`, `'infinite'` by default | `MPAnimateRepeat`, an `int?`, `null` by default | Dart has no union of a number and a word; `null` is what never stops. |
| A timing function between each pair of keyframes | The curve applied to each leg of the path | A Flutter run has one curve, so the widget eases each leg itself, to the same effect. |
| `children` laid out by the caller's markup | `child`, or `children` and `layoutBuilder` | A widget has to place what it is given, so a staggered set says how it is laid out. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `render`, `className`, `style` | — | There is no element to swap and no class list or style attribute to pass through. |
| The drift runs while off screen | It rests while none of it is in view | Flutter goes on drawing an animation nobody can see. |

:::

## See also

- [MPAnimateBlink](./animate-blink) — for something that has to be noticed rather than something that has to feel light.
- [MPAnimateLighting](./animate-lighting) — the other purely decorative effect, and the other one to use once per page.
