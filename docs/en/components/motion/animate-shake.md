---
title: MPAnimateShake
order: 10
---

# MPAnimateShake

<p class="mp-lede">The answer to something that did not work. Four hundred milliseconds, said once, and it says <em>that was refused</em> more plainly than any colour does.</p>

<Demo src="animate-shake/hero" :minHeight="360" />

```tsx
import { MPAnimateShake } from 'material-plus-ui';

<MPAnimateShake play={wrong}>
  <MPOtpField />
</MPAnimateShake>;
```

## Props

<PropsTable name="MPAnimateShake" />

## Why this is allowed, when a control never moves

The library's rule is that controls do not transform, and it holds without exception. But the rule is about a control's **resting states** — hover, press, on, off — where movement is a stand-in for something colour says better, and where it makes a target the pointer has to chase.

A shake is not a state. It is not something the control _is_; it is something that just happened, an answer to what the reader did a moment ago, and it is over before anyone could try to point at it. A red border is the field's new condition. This is the reply.

That is the whole of the exception, and it is the only one in the library.

## What keeps it from becoming decoration

`trigger` defaults to **`manual`**, which is the one default in this set that is not `mount`. A shake that runs when a page loads is decoration, and readers learn to ignore moving decoration — which costs the effect exactly the meaning it exists for.

There is no `repeat`. A refusal is said once, and a thing that keeps saying it is not being clearer, it is nagging.

The keyframe is **home at both ends**, so a shake interrupted mid-swing — by a re-render, a route change, a second rejection — leaves the element where the page put it rather than a centimetre to one side of it.

And the second half is smaller than the first: 55% of the amplitude at 60% and 80% against 100% at 20% and 40%. A shake that ends as hard as it starts reads as a loop that was cut off rather than as an answer that finished.

## Shaking again

Set `play` back to `false` and then to `true`. The animation is rewound without unmounting anything, so the field keeps its value and the reader keeps their focus — and the second wrong answer moves exactly as much as the first did, which a re-render alone would not do.

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

## It is not one of the shared effects

Like [MPAnimateFloat](./animate-float), this is not an arrival: it goes nowhere and comes back. It keeps its keyframe in its own file rather than joining `MPAnimation`, because that union is backed by lookup tables every component reading them pays for in full — and a fade has no business carrying a row for a refusal.

## Accessibility

- **A shake is not a message.** Under `prefers-reduced-motion` it is dropped entirely, and a reader using a screen reader never had it — so whatever it was saying has to be said in words as well. Put the reason in the field's `errorMessage`, or announce it in a live region.
- Nothing here changes the accessibility tree, and nothing inside loses its state when the shake replays.

## See also

- [MPTextField](../inputs/text-field) — `errorMessage`, which is where the words go.
- [MPSnackbar](../feedback/snackbar) — for a refusal that has more to say than one field can hold.
