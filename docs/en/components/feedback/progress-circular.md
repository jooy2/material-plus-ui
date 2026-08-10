---
title: MPProgressCircular
order: 7
---

# MPProgressCircular

<p class="mp-lede">A ring that fills, and the one to reach for where there is no room for a bar — inside a button, at the end of a table row, next to a field.</p>

<Demo src="progress-circular/hero" :minHeight="100" />

```tsx
import { MPProgressCircular } from 'material-plus-ui';

<MPProgressCircular label="Syncing" />;
```

## Props

<PropsTable name="MPProgressCircular" />

## The value sits beside the ring, not inside it

A number in the middle of a dial is the picture everyone has of this component, and it only works at two of the five sizes: at `xs` the ring is twenty-four pixels across and there is nowhere for "40%" to go. Beside it, every size reads.

## Examples

### size

`md` is MD3's own 48dp, and every rung sits inside the control height of the same name — a 48px ring in a 56px field — so a spinner dropped into a button, a field or a table row never makes the row taller than it was.

<Demo src="progress-circular/sizes" :minHeight="120">

<<< @/.vitepress/demos/progress-circular/sizes.tsx

</Demo>

### value

`null` — the default — turns the ring instead of filling it. A value holds it still and lets the gap close.

```tsx
<MPProgressCircular /> // indeterminate
<MPProgressCircular value={70} /> // seven tenths of the way round
```

### showValue and format

The same two props [MPProgressLinear](./progress-linear) takes, and they mean the same thing: a percentage of the range, unless the caller has said what the number means.

## Accessibility

- The role and the value are on the root; the ring itself is `aria-hidden`, because it is the picture of them.
- The arc is measured in percent — the circle declares `pathLength="100"` — which is what lets one animation serve all five diameters.
- Both animations stop under `prefers-reduced-motion`, resting on a partial arc rather than a closed ring.

## See also

- [MPProgressLinear](./progress-linear) — where there is width to spare.
- [MPOverlay](./overlay) — the sheet this most often sits on.
