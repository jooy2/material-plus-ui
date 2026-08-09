---
title: MPButtonGroup
order: 2
---

# MPButtonGroup

<p class="mp-lede">A run of buttons that belong together. The corners that face a neighbour are cut back, and the variant, size, colour and disabled state are set once for the set rather than repeated on every button.</p>

<Demo src="button-group/hero" :minHeight="120" />

```tsx
import { MPButton, MPButtonGroup } from 'material-plus-ui';

<MPButtonGroup variant="outlined">
  <MPButton>Previous</MPButton>
  <MPButton>Next</MPButton>
</MPButtonGroup>;
```

## Props

<PropsTable name="MPButtonGroup" />

## Two things are happening, and only one is visual

The corners that face a neighbour are cut back from `corner-full` to `corner-small`, so the row reads as one shape that has been divided rather than as three pills that happen to be adjacent. That is the look.

The other half is that `variant`, `size`, `color` and `disabled` are set once. A group where one button is a size out is the failure this exists to prevent — and it is a failure that only shows up in the design review, because every button on its own is correct.

<Demo src="button-group/inheritance" :minHeight="200">

<<< @/.vitepress/demos/button-group/inheritance.tsx

</Demo>

A button's own prop still wins. A row of secondary actions with one destructive button in it is a real thing, and that is what the third button above is.

## The seam is a gap, not a border

Two filled buttons sharing an edge merge into one blob, and a hairline drawn between them would be the only line on the page drawn _between two fills_ rather than around one. MD3's connected group uses a 2px gap instead, which works at every variant without a second rule.

## This is not a segmented control

The buttons stay real `MPButton`s, and the group does not manage selection. For one-of-a-set, reach for [MPSegmentedButton](./segmented-button).

The difference is not stylistic. A row of buttons that remembers which one was pressed announces itself to a screen reader as several unrelated actions, one of which happens to be described as pressed. A segmented button is a single control with one tab stop and arrow keys inside it, which is what "choose one of these" actually is.

## Accessibility

- The group carries `role="group"`. It does **not** carry a roving tab index — every button in it is its own tab stop, because every button in it is its own action.
- The focus ring is drawn outside a button, so each child gets a stacking context and comes forward when focused. Without it the ring would be painted under whichever neighbour comes after it in the DOM.

## See also

- [MPButton](./button) — the buttons inside it.
- [MPSegmentedButton](./segmented-button) — when the row is a choice rather than a set of actions.
