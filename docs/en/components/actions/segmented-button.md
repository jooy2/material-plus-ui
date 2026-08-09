---
title: MPSegmentedButton
order: 3
---

# MPSegmentedButton

<p class="mp-lede">Two to five choices in one pill. A hairline container with the segments divided by more of the same, and the chosen one filled with `secondary-container` — Material's own colour for a control that changes what you are looking at rather than doing something.</p>

<Demo src="segmented-button/hero" :minHeight="64" />

```tsx
import { MPSegmentedButton } from 'material-plus-ui';

const [view, setView] = useState(['week']);

<MPSegmentedButton
  aria-label="Calendar view"
  items={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ]}
  value={view}
  onValueChange={setView}
/>;
```

## Props

<PropsTable name="MPSegmentedButton" />

## Why the value is always an array

Even in single-select, where it holds at most one entry.

A segmented button is genuinely the same control either way — MD3 documents one component with a multi-select option, not two — and a `value` whose **type** changed with a boolean prop would be a union every caller has to narrow before they can read it. One shape, learned once.

<Demo src="segmented-button/multiple" :minHeight="240">

<<< @/.vitepress/demos/segmented-button/multiple.tsx

</Demo>

## showCheck

A chosen segment shows a tick, and the slot is reserved whether or not anything is chosen.

That reservation is the point. A tick that appeared from nothing would push the label sideways at the exact moment the reader is looking at it, which is the one moment a control should not move. Turn it off for a set of icon-only segments, where the fill already says which one is on.

An `icon` on an item shares the same slot: it is what the segment shows until it is chosen, and the tick replaces it. So the width never changes either way.

## When this is the wrong component

**At more than five segments**, use [MPSelect](../inputs/select). The labels stop fitting and the set starts wrapping, and a segmented button that has wrapped to two lines has lost the one thing it was for.

**For choosing something in a form**, use [MPRadioGroup](../inputs/radio-group). That is the control a form's value comes from, and it scales down the page rather than across it. A segmented button is for switching what a screen is showing.

## Accessibility

- Underneath it is Base UI's toggle group: one tab stop for the set, arrow keys inside it, and `aria-pressed` on each segment.
- Built out of plain buttons instead, a four-way switch would announce itself as four unrelated actions — three of which happen to be off.
- With no visible label, pass `aria-label`. The set needs a name; the segments only name themselves.

## See also

- [MPRadioGroup](../inputs/radio-group) — the same question, asked in a form.
- [MPButtonGroup](./button-group) — a run of actions rather than a choice.
- [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group) — the behaviour underneath.
