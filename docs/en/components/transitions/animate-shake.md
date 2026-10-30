---
title: MPAnimateShake
order: 10
---

# MPAnimateShake

<p class="mp-lede">The answer to something that did not work. Four hundred milliseconds, said once, and it says <em>that was refused</em> more plainly than any colour does.</p>

<Demo src="animate-shake/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateShake } from 'material-plus-ui';

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnimateShake(play: wrong, child: const MPOtpField());
```

:::

## Props

<PropsTable name="MPAnimateShake" />

## Why this is allowed, when a control never moves

The library's rule is that controls do not transform, and it holds without exception. But the rule is about a control's **resting states** — hover, press, on, off — where movement is a stand-in for something colour says better, and where it makes a target the pointer has to chase.

A shake is not a state. It is not something the control _is_; it is something that just happened, an answer to what the reader did a moment ago, and it is over before anyone could try to point at it. A red border is the field's new condition. This is the reply.

That is the whole of the exception, and it is the only one in the library.

## What keeps it from becoming decoration

`trigger` defaults to **`manual`** (`MPAnimateTrigger.manual` in Flutter), which is the one default in this set that is not `mount`. A shake that runs when a page loads is decoration, and readers learn to ignore moving decoration — which costs the effect exactly the meaning it exists for.

There is no `repeat`. A refusal is said once, and a thing that keeps saying it is not being clearer, it is nagging.

The keyframe is **home at both ends**, so a shake interrupted mid-swing — by a re-render, a route change, a second rejection — leaves the element where the page put it rather than a centimetre to one side of it.

And the second half is smaller than the first: 55% of the amplitude at 60% and 80% against 100% at 20% and 40%. A shake that ends as hard as it starts reads as a loop that was cut off rather than as an answer that finished.

## Shaking again

Set `play` back to `false` and then to `true`. The animation is rewound without unmounting anything, so the field keeps its value and the reader keeps their focus — and the second wrong answer moves exactly as much as the first did, which a re-render alone would not do.

::: fw react

```tsx
const [wrong, setWrong] = useState(false);

async function submit(code: string) {
  const ok = await check(code);

  if (!ok) {
    setWrong(false);
    requestAnimationFrame(() => setWrong(true));
  }
}

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

:::

::: fw flutter

```dart
bool _wrong = false;

Future<void> _submit(String code) async {
  final bool ok = await check(code);

  if (!ok) {
    setState(() => _wrong = false);
    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() => _wrong = true));
  }
}

MPAnimateShake(play: _wrong, child: const MPOtpField());
```

The `true` goes in after the frame that drew the `false`. Two `setState` calls in one frame are one build, and the widget would never see `play` go down.

:::

## It is not one of the shared effects

::: fw react

Like [MPAnimateFloat](./animate-float), this is not an arrival: it goes nowhere and comes back. It keeps its keyframe in its own file rather than joining `MPAnimation`, because that union is backed by lookup tables every component reading them pays for in full — and a fade has no business carrying a row for a refusal.

:::

::: fw flutter

Like [MPAnimateFloat](./animate-float), this is not an arrival: it goes nowhere and comes back. It is not an `MPAnimation` and takes none of that table's durations or curves: its six keyframes are its own, with the curve applied to each swing as a CSS timing function is applied between two keyframes.

:::

## Accessibility

::: fw react

- **A shake is not a message.** Under `prefers-reduced-motion` it is dropped entirely, and a reader using a screen reader never had it — so whatever it was saying has to be said in words as well. Put the reason in the field's `errorMessage`, or announce it in a live region.
- Nothing here changes the accessibility tree, and nothing inside loses its state when the shake replays.

:::

::: fw flutter

- **A shake is not a message.** When the platform has animations turned off (`MediaQuery.disableAnimations`) it is dropped entirely, and a reader using a screen reader never had it — so whatever it was saying has to be said in words as well. Put the reason in the field's `errorMessage`, or in a `Semantics` node marked `liveRegion`.
- Nothing here changes the semantics tree, and nothing inside loses its state when the shake replays: the child is not rebuilt, so a field keeps its value and the focus stays where it was.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| `distance` as a number of pixels or a CSS length | `double`, in logical pixels | There is no root font size to resolve a `rem` against. |
| `easing="standard"` | `MPEasing.standard` | Each name maps onto one of the curves in `MPMotion`. |
| A timing function between each pair of keyframes | The curve applied to each swing | A Flutter run has one curve, so the widget eases each leg itself, to the same effect. |
| `play` set back to `false`, then `true` on the next animation frame | The same `play`, set over two frames | Nothing else is added to replay it; two `setState` calls in one frame are one build. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `render`, `className`, `style` | — | There is no element to swap and no class list or style attribute to pass through. |

:::

## See also

- [MPTextField](../inputs/text-field) — `errorMessage`, which is where the words go.
- [MPSnackbar](../feedback/snackbar) — for a refusal that has more to say than one field can hold.
