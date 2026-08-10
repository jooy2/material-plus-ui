---
title: MPProgressLinear
order: 6
---

# MPProgressLinear

<p class="mp-lede">A bar that fills, and the workhorse of the three progress indicators — the only one that shows <em>how much</em> is left at a glance, because length is the one quantity a reader compares without counting.</p>

<Demo src="progress-linear/hero" :minHeight="120" />

```tsx
import { MPProgressLinear } from 'material-plus-ui';

<MPProgressLinear label="Uploading" value={progress} showValue />;
```

## Props

<PropsTable name="MPProgressLinear" />

## `value` defaults to `null`, and that is the point

`null` is the indeterminate case: something is happening and nobody knows how much of it is left. An indicator that has not been told a value should say so rather than draw an empty track, which is a claim that no progress has been made.

The same is true of [MPProgressCircular](./progress-circular) and [MPProgressBox](./progress-box) — they are one component in three shapes, and `null` has to mean the same thing on all three.

## Examples

### value, min and max

The fraction is clamped. That is not defensive programming for its own sake: `value` usually arrives from a division somewhere, and a bar that renders 140% wide because one request finished twice is a worse bug than a bar that sits full.

```tsx
<MPProgressLinear value={3} min={0} max={4} showValue />
```

### showValue and format

Without `format` the value is a percentage of `min`…`max`, which is the only formatting that holds for a range nobody described — Base UI's own default of `${value}%` would read "3%" for step 3 of 4.

`format` takes `Intl.NumberFormat` options, so bytes and currencies work as well as plain numbers.

```tsx
<MPProgressLinear
  value={bytes}
  max={total}
  showValue
  format={{ style: 'unit', unit: 'megabyte' }}
/>
```

### size

The thickness of the groove, and the only thing `size` touches here — a bar has no label inside it to scale. `md` is MD3's own 4dp.

<Demo src="progress-linear/sizes" :minHeight="200">

<<< @/.vitepress/demos/progress-linear/sizes.tsx

</Demo>

### color

The active indicator is the family's accent and the groove is `on-surface` at 12%. One wash has to read under all four accents on both schemes, which is what a fixed neutral gives and a per-family container tone does not.

## Accessibility

- Base UI owns `role="progressbar"`, the value and range attributes, `aria-valuetext`, and dropping the value entirely while the bar is indeterminate.
- `label` names the bar; without one, name it from whatever it is measuring.
- The indeterminate sweep stops under `prefers-reduced-motion`, and rests on a partial frame rather than a full one — an indicator that has stopped must not read as an indicator that has finished.

## See also

- [MPProgressCircular](./progress-circular) — the same value where there is no room for a bar.
- [MPProgressBox](./progress-box) — for work that genuinely has steps.
