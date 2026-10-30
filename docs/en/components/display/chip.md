---
title: MPChip
order: 6
---

# MPChip

<p class="mp-lede">A compact token: a tag, a filter, a status, an entity plucked out of a list. It can be pressed, it can be selected, and it can carry its own delete affordance — all three without ever nesting a button inside a button.</p>

<Demo src="chip/hero" :minHeight="140" />

::: fw react

```tsx
import { MPChip } from 'material-plus-ui';

<MPChip selected onClick={toggle}>Open</MPChip>
<MPChip variant="tonal" onDelete={remove}>design</MPChip>
<MPChip variant="text" count={12} color="error">Errors</MPChip>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPChip(selected: true, onPressed: toggle, child: const Text('Open'));
MPChip(variant: MPVariant.tonal, onDelete: remove, child: const Text('design'));
const MPChip(variant: MPVariant.text, count: 12, color: MPColor.error, child: Text('Errors'));
```

:::

## Props

<PropsTable name="MPChip" />

::: fw react

Every native `<span>` attribute passes through, and a `ref` reaches the shell.

:::

## A chip is not a small button

Two things say so, and both are the specification's.

**The height.** MD3 draws a chip at 32dp, full stop — which is the control ladder's `xs`. Reusing the control ladder would leave `md` at 56px, and a 56px chip is a button with square corners. So `md` is 32 here, and the ladder is centred on it exactly the way every other one is centred on its own spec value.

**The corner.** A chip is `corner-small` while every button in the system is `corner-full`. That difference is the whole reason a row of chips under a search field does not read as a row of buttons, and it is why this component reaches for `full` at no rung at all.

## Examples

### variant and selected

`outlined` is the default because it is MD3's: an assist, filter and input chip are all outlined at rest, and the outlined chip is the one that stays legible in a row of twenty.

<Demo src="chip/variants">

::: fw react

<<< @/.vitepress/demos/chip/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/chip/variants.dart

:::

</Demo>

Selected fills with the family's **container** tone and takes its `on-` ink — MD3's selected filter chip exactly. Not a second colour and not a bolder weight: a filter that is on is still the same filter.

It also leads with a tick, which on `filled` and `tonal` is the only change: both already rest on the tones a selected chip takes. A `startIcon` of your own is kept in its place, so an avatar or a status stays where it was.

`outlined` reads `on-surface-variant` rather than the accent at rest, which is also MD3's choice: the label of a filter that is off is not making a claim, and twenty accent-coloured labels in a row is a filter bar that looks like it is all switched on.

### onClick and onDelete

::: fw react

A chip that does nothing is a `<span>`. A chip with an `onClick` is a real `<button>` — the shell itself, so there is one element and one tab stop.

The exception is `onDelete`, which is a second control and cannot be nested inside the first. A chip with both goes back to a `<span>` shell holding two sibling buttons:

```tsx
<MPChip onClick={toggle} onDelete={remove}>
  design
</MPChip>
```

Both are reachable by keyboard, and neither is inside the other. That shape is not tidiness — an inert `<span>` carrying a click handler is the single most common way a component library loses its keyboard users, and a `<button>` inside a `<button>` is the most common way one invents a chip that Chrome silently rewrites on parse.

A pressable chip reports `aria-pressed` from `selected`, and whichever element is the button owns the padding, so its hit area is the whole chip rather than just the words.

### Why the shell is the button

Because of what wraps a chip. Base UI's `render` — which is how a chip becomes an [MPMenu](../inputs/menu)'s trigger, a popover's, a tooltip's — merges its handlers and its ARIA onto the element the component returns. With a `<span>` there, `aria-haspopup`, `aria-expanded`, `id` and `tabindex` landed on something that was not focusable, the label button underneath was a second tab stop carrying none of it, and Base UI logged that it expected a native `<button>`. One element is the fix, and it is also simply less markup for the common case.

```tsx
<MPMenu trigger={<MPChip>Filter</MPChip>}>
  <MPMenuItem>Newest</MPMenuItem>
</MPMenu>
```

`selected` has **no default**, and that is what decides whether the chip is announced as a toggle at all. Passing it either way round — `selected` or `selected={false}` — makes the chip a toggle; leaving it off makes the chip an action, and an action is not announced as "not pressed".

:::

::: fw flutter

`onPressed` is React's `onClick`. A chip with no `onPressed` is a label: it takes no focus and claims no tap, so a press on it reaches whatever is around it. With one it is a button, one focus stop, activated by pointer, <kbd>Enter</kbd> or <kbd>Space</kbd>, and ringed in `secondary` on keyboard focus.

`onDelete` adds a second, separate stop for the ×, and neither is inside the other: a press on the × calls `onDelete` only, and a press anywhere else on the chip calls `onPressed` only. The × is pressed from a 24px square even on the smallest chip.

```dart
MPChip(onPressed: toggle, onDelete: remove, child: const Text('design'))
```

A chip that opens a menu or a popover is wrapped by that component's trigger, which hands the chip its `onPressed`, as a button is.

`selected` is a `bool?` with **no default**, and that is what decides whether the chip is announced as selected at all. Passing it either way round makes the chip a toggle; leaving it `null` makes the chip an action, and an action is not announced as "not selected".

:::

### count

A number set into the end of the chip, on its own small plate, so "Errors 12" reads as one token with a count rather than as two words. On a `filled` chip the plate is a hole punched in the fill; everywhere else it is the container tone showing through.

## disabled

The specification's treatment: content at 38%, a container at 12%, both of `on-surface`. The accent goes entirely — a disabled chip that is a paler version of an available one differs from it only in saturation, which is the one axis a reader cannot judge in isolation.

A disabled chip stops being pressable and its delete button is disabled with it.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `onClick` | `onPressed` | Flutter's name. |
| `aria-pressed` from `selected` | the `selected` flag | Flutter's own chips announce a chosen chip as selected, and a screen reader reads it the same way. |
| `count` as a `ReactNode` | `Object?` | Dart has no union type, so a number, a `String` and a widget share one parameter, checked in debug. |
| `render` onto the shell | — | There is no element to merge a trigger's handlers onto; the trigger passes the chip its `onPressed`. |
| `transition` | — | The entrance belongs to an animation widget wrapped round the chip. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPSegmentedButton](../inputs/segmented-button) — when the row is one choice rather than several independent filters.
- [MPBadge](./badge) — a mark rather than a token.
