---
title: MPTooltip
order: 3
---

# MPTooltip

<p class="mp-lede">A short label that appears when the pointer rests on something. The whole component is a wrapper — it adds no element to the layout, and the child stays whatever it was.</p>

<Demo src="tooltip/hero" :minHeight="140" />

::: fw react

```tsx
import { MPTooltip, MPTooltipProvider } from 'material-plus-ui';

<MPTooltip content="Copy to clipboard">
  <MPButton aria-label="Copy">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTooltip(
  content: const Text('Copy to clipboard'),
  child: MPButton(
    semanticLabel: 'Copy',
    startIcon: copyIcon,
    onPressed: copy,
  ),
);
```

The plate is lifted out of the tree, so the tooltip needs an `Overlay` above it. `WidgetsApp` with a navigator and `MaterialApp` both provide one.

:::

## Props

<PropsTable name="MPTooltip" />

## `color` has no default, and here it matters most

MD3's plain tooltip is `inverse-surface` under `inverse-on-surface`: the neutral palette read at the **other** end of the scheme, so the plate is dark on a light page and light on a dark one.

That is what makes a tooltip legible over content it was never designed against — which is the only content a tooltip ever appears over. It is also the only place in the library those two roles are read.

Setting `color` swaps in an accent fill. Worth doing for a tooltip that is itself a warning; wrong for the other ninety-nine, because a red tooltip on a delete button is saying something the tooltip does not know.

## No shadow

MD3 puts a plain tooltip at elevation 0, and this follows it. What separates the plate from the page is that it is the _inverse_ surface — a dark card on a light page — and a shadow under something already that far from its background reads as a second, softer edge rather than as height.

::: fw react

## What Base UI owns, and what this adds

Base UI owns the parts that are genuinely hard: the delay and the group timeout, opening on focus but not on a focus that came from a click, closing on Escape, and keeping the popup off the edges of the window.

The one thing it deliberately leaves open is what makes a tooltip mean anything to a screen reader — `role="tooltip"` on the plate and an `aria-describedby` pointing at it from the trigger — because a popup can be many things and only the caller knows which. Here it is always a tooltip, so this wires both, and drops the reference while it is closed rather than pointing at an element that is not in the document.

:::

::: fw flutter

## What it does

It opens when the pointer rests on the child, when the keyboard focuses it, and on a long press, which is the touch screen's way in. Each of them holds it up on its own, so a pointer brushing past does not close what the keyboard opened. A focus that arrives with a press does not open it, and a press on the child closes it. <kbd>Escape</kbd> closes it too.

The pointer can move from the child onto the plate and stay there, so a phrase too long to take in at a glance can be read. A tooltip opened by a long press stays up for a second and a half after the finger lifts, because a finger lifting is a reader who has just started to read.

The child carries what the plate says as its own tooltip, which is how a screen reader gets it, and the plate is left off the semantics tree so the phrase is read once.

:::

## `MPTooltipProvider`

Shares one delay across a group: once any tooltip has opened, its neighbours open instantly, and the wait comes back after a pause.

::: fw react

```tsx
<MPTooltipProvider>
  <MPTooltip content="Bold">
    <MPButton>B</MPButton>
  </MPTooltip>
  <MPTooltip content="Italic">
    <MPButton>I</MPButton>
  </MPTooltip>
</MPTooltipProvider>
```

:::

::: fw flutter

```dart
MPTooltipProvider(
  child: Row(
    children: <Widget>[
      MPTooltip(
        content: const Text('Bold'),
        child: MPButton(onPressed: bold, child: const Text('B')),
      ),
      MPTooltip(
        content: const Text('Italic'),
        child: MPButton(onPressed: italic, child: const Text('I')),
      ),
    ],
  ),
);
```

<PropsTable name="MPTooltipProvider" />

:::

Worth wrapping a toolbar in. Without it, moving along a row of icon buttons means waiting out the full delay at every stop, which is what makes tooltips feel like they are fighting the pointer.

## Examples

### side and align

<Demo src="tooltip/sides">

::: fw react

<<< @/.vitepress/demos/tooltip/sides.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/tooltip/sides.dart

:::

</Demo>

The tooltip may flip to the opposite side when there is no room. <Fw react="That is Base UI's doing, and it is the right behaviour." flutter="It is a flip and never a slide: a plate that crept along the edge as its trigger neared it would have a wedge pointing at nothing." />

### disabled

Stops the tooltip from opening at all, without disabling the trigger — for the tooltip that only exists while a label is truncated.

::: fw react

```tsx
<MPTooltip content={label} disabled={!isTruncated}>
  <span className="truncate">{label}</span>
</MPTooltip>
```

:::

::: fw flutter

```dart
MPTooltip(
  content: Text(label),
  disabled: !isTruncated,
  child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
);
```

While it is disabled the child carries no words for a screen reader either, so a label that fits is not read out twice.

:::

## A tooltip is not a container

It cannot be reached by a pointer on a touch screen, it disappears the moment attention moves, and anything inside it that could be clicked cannot be. Content that needs either of those wants a popover, not this.

That is also why the trigger still needs its own accessible name. A tooltip **describes**; it does not name.

::: fw react

```tsx
// ✅ named by aria-label, described by the tooltip
<MPTooltip content="Copy to clipboard">
  <MPButton aria-label="Copy">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>
```

:::

::: fw flutter

```dart
// Named by semanticLabel, described by the tooltip.
MPTooltip(
  content: const Text('Copy to clipboard'),
  child: MPButton(
    semanticLabel: 'Copy',
    startIcon: copyIcon,
    onPressed: copy,
  ),
);
```

The child and the words become one node, so a button under a tooltip is announced with its own name and actions and the words with them. The whole child is merged, so it should be the one control, or the text, the tooltip describes: a row of buttons under one tooltip is announced as one.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children` | `child` | Flutter's name for the one widget a wrapper holds. |
| `content` as any node | `content` as a widget, with `semanticLabel` | A widget cannot be read out. A `Text` supplies the words on its own; anything else says what it means. |
| `delay`, `closeDelay` in milliseconds | `Duration?` | Dart's type for a length of time. `null` follows the provider, then the defaults. |
| `defaultOpen` | `initialOpen` | The name Flutter gives a starting value. |
| `role="tooltip"` and `aria-describedby` while open | the child's own tooltip, always | Flutter puts the description on the node itself. There is no id to point at, and the plate is left off the tree so the phrase is read once. |
| collision handling on both axes | a flip, never a slide | Sliding needs the position recomputed against the window every frame, and a wedge that has slid off its trigger points at nothing. |
| no fade while moving between grouped tooltips | the usual short fade | The plate's fade belongs to the shared anchoring layer, which has no instant mode. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |
| — | a long press opens it | A touch screen has no pointer to rest. |

:::

## See also

- [MPShortcut](../display/shortcut) — a natural neighbour inside `content`.
- [MPIcon](../display/icon) — the thing most often described by one.
