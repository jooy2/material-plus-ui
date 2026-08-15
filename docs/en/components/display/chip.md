---
title: MPChip
order: 6
---

# MPChip

<p class="mp-lede">A compact token: a tag, a filter, a status, an entity plucked out of a list. It can be pressed, it can be selected, and it can carry its own delete affordance — all three without ever nesting a button inside a button.</p>

<Demo src="chip/hero" :minHeight="140" />

```tsx
import { MPChip } from 'material-plus-ui';

<MPChip selected onClick={toggle}>Open</MPChip>
<MPChip variant="tonal" onDelete={remove}>design</MPChip>
<MPChip variant="text" count={12} color="error">Errors</MPChip>;
```

## Props

<PropsTable name="MPChip" />

Every native `<span>` attribute passes through, and a `ref` reaches the shell.

## A chip is not a small button

Two things say so, and both are the specification's.

**The height.** MD3 draws a chip at 32dp, full stop — which is `CONTROL_HEIGHT`'s `xs`. Reusing the control ladder would leave `md` at 56px, and a 56px chip is a button with square corners. So `md` is 32 here, and the ladder is centred on it exactly the way every other one is centred on its own spec value.

**The corner.** A chip is `corner-small` while every button in the system is `corner-full`. That difference is the whole reason a row of chips under a search field does not read as a row of buttons, and it is why this component reaches for `rounded-mp-full` at no rung at all.

## Examples

### variant and selected

`outlined` is the default because it is MD3's: an assist, filter and input chip are all outlined at rest, and the outlined chip is the one that stays legible in a row of twenty.

<Demo src="chip/variants">

<<< @/.vitepress/demos/chip/variants.tsx

</Demo>

Selected fills with the family's **container** tone and takes its `on-` ink — MD3's selected filter chip exactly. Not a second colour and not a bolder weight: a filter that is on is still the same filter.

`outlined` reads `on-surface-variant` rather than the accent at rest, which is also MD3's choice: the label of a filter that is off is not making a claim, and twenty accent-coloured labels in a row is a filter bar that looks like it is all switched on.

### onClick and onDelete

The shell is **always** a `<span>`. What changes is what is inside it: a plain run of content, or — when `onClick` is given — a real `<button>` wrapping that content, plus a second button for `onDelete`.

```tsx
<MPChip onClick={toggle} onDelete={remove}>
  design
</MPChip>
```

Both are reachable by keyboard, and neither is nested inside the other. That shape is not tidiness — an inert `<span>` carrying a click handler is the single most common way a component library loses its keyboard users, and a `<button>` inside a `<button>` is the most common way one invents a chip that Chrome silently rewrites on parse.

A pressable chip reports `aria-pressed` from `selected`, and its label button owns the padding so its hit area is the whole chip rather than just the words.

`selected` has **no default**, and that is what decides whether the chip is announced as a toggle at all. Passing it either way round — `selected` or `selected={false}` — makes the chip a toggle; leaving it off makes the chip an action, and an action is not announced as "not pressed".

### count

A number set into the end of the chip, on its own small plate, so "Errors 12" reads as one token with a count rather than as two words. On a `filled` chip the plate is a hole punched in the fill; everywhere else it is the container tone showing through.

## disabled

The specification's treatment: content at 38%, a container at 12%, both of `on-surface`. The accent goes entirely — a disabled chip that is a paler version of an available one differs from it only in saturation, which is the one axis a reader cannot judge in isolation.

A disabled chip stops being pressable and its delete button is disabled with it.

## See also

- [MPSegmentedButton](../inputs/segmented-button) — when the row is one choice rather than several independent filters.
- [MPBadge](./badge) — a mark rather than a token.
