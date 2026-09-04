---
title: MPMeter
order: 14
---

# MPMeter

<p class="mp-lede">How much of something there is, on a scale known in advance — disk used, seats taken, quota spent, a password's strength. It looks like a progress bar and means something else.</p>

<Demo src="meter/hero" :minHeight="200" />

```tsx
import { MPMeter } from 'material-plus-ui';

<MPMeter value={41} max={60} label="Seats taken" showValue />;
```

## Props

<PropsTable name="MPMeter" />

## It is not a progress bar

A progress bar is about **time**. Something is happening, this is how far it has got, it may have no value at all yet, and it is expected to move on its own.

A meter is about **quantity**. The number is already known, it does not move unless the thing it measures does, and it is meaningful to say the reading is bad — which is what `thresholds` is for and what a progress bar has no use for. A disk that is 94% full is not 94% finished.

The two carry different ARIA roles for that reason, so a screen reader announces a meter as a measurement rather than as something in progress. Picking the wrong one is not a styling mistake; it is a claim about what the number means.

That is also why `value` is required here and optional on [MPProgressLinear](./progress-linear). There is no indeterminate meter: a quantity nobody knows is not a quantity to draw.

## `thresholds` names roles, not colours

```tsx
<MPMeter
  value={94}
  label="Quota spent"
  thresholds={[
    { from: 60, color: 'tertiary' },
    { from: 85, color: 'error' }
  ]}
/>
```

`from` is a value on the meter's own scale, not a percentage — so a meter that runs 0–5 GB takes bands at `3` and `4.5`.

The families are MD3's four, and none of them is called `warning`. An amber band is `tertiary` under whatever source colour the page is themed from, which is the honest answer rather than a limitation: a threshold that named a colour would be a colour that ignores the theme, on the one component whose whole point is to be read at a glance.

The last threshold the value has reached wins, so they are listed smallest first — and the list is read in the order it was given rather than sorted, so a call site that listed them the wrong way round shows it.

## `format` matters more here

Without it the value reads as a share of the range, which is the only honest formatting for a range nobody described. But a meter usually has real units — 41 of 60 seats, 2.1 GB of 5, £340 of a £500 budget — and that is what the reader came for:

```tsx
<MPMeter value={2.1} max={5} showValue format={{ style: 'unit', unit: 'gigabyte' }} />
```

It takes `Intl.NumberFormat` options, so bytes, currencies and plain counts all work, in whatever locale the platform is set to.

## The reading travels

A value that changed moves the fill there rather than jumping, and a value that crossed a threshold changes family over the same short duration. Both stop under `prefers-reduced-motion`, where the new reading simply appears.
