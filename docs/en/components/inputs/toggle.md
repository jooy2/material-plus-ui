---
title: MPToggle
order: 11
---

# MPToggle

<p class="mp-lede">A button that stays down. Off is neutral, on is the accent — and what it changes is the state of the thing beside it.</p>

<Demo src="toggle/hero" :minHeight="200" />

```tsx
import { MPToggle, MPToggleGroup } from 'material-plus-ui';

<MPToggleGroup multiple value={marks} onValueChange={setMarks}>
  <MPToggle value="bold" aria-label="Bold" startIcon={<MPIcon icon={Bold} />} />
  <MPToggle value="italic" aria-label="Italic" startIcon={<MPIcon icon={Italic} />} />
</MPToggleGroup>;
```

## Props

<PropsTable name="MPToggle" />

## Which of the three this is

The library has three controls that hold a boolean, and they are not interchangeable.

| Component                | What the press is                                                  |
| ------------------------ | ------------------------------------------------------------------ |
| [MPSwitch](./switch)     | Changes a **setting**. The change is the point.                    |
| [MPCheckbox](./checkbox) | Gives an **answer**. It goes in a form and its value is submitted. |
| **MPToggle**             | Changes the **state of the thing beside it**, right now.           |

Bold on the selected words. The grid on the canvas. The filter on the list. In every case the thing the reader is looking at changes at the moment of the press, which is why a toggle never goes in a form: there is nothing to submit, because it already happened.

## Why off is neutral and on is the accent

Because a toggle has to be readable at a glance in a row of eight of them, and the axis a reader can actually judge in isolation is **hue**, not saturation. A set where off is a paler accent and on is a stronger one is a set nobody can read without holding two of them side by side.

It is also what leaves `color` meaning something. On a button the family says _what kind of action this is_; here it says what "on" looks like, and an unpressed toggle already wearing it would have spent the signal before there was anything to signal.

## variant

<Demo src="toggle/variant" :minHeight="320">

<<< @/.vitepress/demos/toggle/variant.tsx

</Demo>

`variant` describes the toggle while it is **off** — the ink is `on-surface-variant` in all five, and only the container changes.

On is the accent asserting itself: `filled` takes the accent and its own ink, the middle three light the container tone and leave the label in `on-accent-container`, and `text` — which has no container to light — puts the accent into the ink. That last one is MD3's standard toggle icon button exactly.

What does **not** change is the depth. A toggle that is on is not a toggle that has been raised, so `elevated` keeps its level-1 shadow in both states and the only thing that moves is colour.

## Icon only

With no children the toggle goes square around its glyph, exactly as [MPButton](./button) does — which for a `corner-full` control is a circle, and is MD3's own toggle icon button.

```tsx
<MPToggle aria-label="Bold" startIcon={<MPIcon icon={Bold} />} />
```

There is no separate `MPToggleIconButton`, for [MPIconButton](./icon-button)'s reason inverted: what an icon button adds is the **name**, and a toggle already has to be given one.

## MPToggleGroup

<Demo src="toggle/group" :minHeight="280">

<<< @/.vitepress/demos/toggle/group.tsx

</Demo>

<PropsTable name="MPToggleGroup" />

Two things happen here and only one of them is visual.

The corners that face a neighbour are cut back to `corner-small` — MD3's connected button group, the same shape an [MPButtonGroup](./button-group) draws, out of the same table.

The other half is that the **set owns the value**: the toggles report into one array, `multiple` decides whether more than one of them can be on, and `variant`, `size`, `color` and `disabled` are set once here rather than on every toggle. A run where the fourth toggle is a rung out is not a run.

Base UI owns the roving tab index — one tab stop for the whole set, with the arrow keys moving inside it — which is what makes a toolbar of eight toggles two key presses deep instead of eight.

A toggle reads an [MPButtonGroup](./button-group)'s context too, since it is the same context. What a button group does not do is hold a value.

### When a toggle group is the wrong component

When what is being chosen is a **value** rather than a state.

A run of toggles with `multiple` off is a one-of-a-set, and the two components that say so properly are [MPSegmentedButton](./segmented-button) — MD3's own control for picking between two and five views, with a tick on the chosen one — and [MPRadioGroup](./radio-group), which is what a form's value comes from.

A toggle group is for a **toolbar**: bold, italic, underline; grid, snap, rulers. Each one is a state of something else, and they happen to sit together.

## Accessibility

- A toggle is a `<button>` carrying `aria-pressed`, not `aria-selected` or `aria-checked`. That is the attribute for a control that stays down, and Base UI owns it.
- An icon-only toggle needs an `aria-label`. A button whose whole label is a drawing has no accessible name at all.
- In a group the arrow keys move between toggles and Tab leaves the set. A toolbar where every toggle is its own tab stop is a toolbar a keyboard reader walks through one press at a time.
- A disabled toggle takes the spec's treatment — content at 38%, container at 12% — and loses its state layer, because a wash on top of it would say something is available.

## See also

- [MPSwitch](./switch) — the control for a setting.
- [MPCheckbox](./checkbox) — the control for an answer in a form.
- [MPSegmentedButton](./segmented-button) — one of two to five views, with MD3's own tick.
- [MPButtonGroup](./button-group) — the same connected shape, for buttons that do not hold a state.
