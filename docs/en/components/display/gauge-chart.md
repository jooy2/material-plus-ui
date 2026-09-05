---
title: MPGaugeChart
order: 37
---

# MPGaugeChart

<p class="mp-lede">One reading on a dial, with the trouble drawn on the face. The chart form worth arguing about — and the argument is on this page.</p>

<Demo src="gauge-chart/hero" :minHeight="560" />

```tsx
import { MPGaugeChart } from 'material-plus-ui';

<MPGaugeChart value={72} label="CPU" thresholds={[{ from: 80, color: 'error' }]} />;
```

## Props

<PropsTable name="MPGaugeChart" />

## Consider not using one

A gauge spends a whole panel on a single number, and the arc adds nothing a reader could not get from the figure itself: an angle is judged less accurately than a length, and a dial's two ends are the places the eye is worst at. [MPStatistic](statistic) with an [MPMeter](../feedback/meter) under it says the same thing in a third of the room and reads better.

What a gauge is genuinely good for is a **thresholded reading somebody watches** — a dial with the amber band painted on the face, so "how close is this to trouble" is answered by where the reading stops rather than by arithmetic. That is what `bands` is for, and it is the one case worth reaching for this shape.

If your gauge has no thresholds, it is a statistic with a decoration around it.

## It is a meter, in the markup

`role="meter"` carrying the value, the minimum and the maximum — the same semantics [MPMeter](../feedback/meter) has, because they are the same quantity in two shapes. A reader who cannot see the dial gets the number and the range without the drawing having to be described.

That is also why there is no table behind it and no hover layer. A chart of one number has nothing a reader could uncover that the figure in the middle is not already saying.

## Thresholds name roles, and both shapes read the same resolver

`{ from: 80, color: 'error' }` and never a hex, so a dial and a bar on one page cannot disagree about where the amber starts. The last threshold the reading has passed wins, so list them smallest first.

There is no `warning` role in Material Design, so an amber band is `tertiary` under whatever source colour the page is themed from. That is the honest answer rather than a limitation — a threshold names a role so the theme can move it.

`bands` paints those thresholds onto the track as well as into the reading. Without it the track is a neutral groove and only the reading carries the colour, which is right for a dial nobody is watching for a limit.

## The sweep, and where the dial sits

`sweep` is how far round the dial goes, in degrees, centred on twelve o'clock. `180` is a half dial standing on its base; `240` is the classic gauge, open at the bottom. Past about 300 the two ends meet and a reader can no longer tell the start from the finish, so that is where it stops.

How much of the arc hangs below the centre is measured from the angle rather than assumed, which is what keeps a 240° dial from floating in its box and a 300° one from being clipped.

## Both ends are marked

A tick at the start and the finish, so a dial that is empty or full still shows where its scale runs from and to. Without them a full dial and a dial with no scale look the same.
