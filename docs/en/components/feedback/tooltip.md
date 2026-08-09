---
title: MPTooltip
order: 3
---

# MPTooltip

<p class="mp-lede">A short label that appears when the pointer rests on something. The whole component is a wrapper — it adds no element to the layout, and the child stays whatever it was.</p>

<Demo src="tooltip/hero" :minHeight="140" />

```tsx
import { MPTooltip, MPTooltipProvider } from 'material-plus-ui';

<MPTooltip content="Copy to clipboard">
  <MPButton aria-label="Copy">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>;
```

## Props

<PropsTable name="MPTooltip" />

## `color` has no default, and here it matters most

MD3's plain tooltip is `inverse-surface` under `inverse-on-surface`: the neutral palette read at the **other** end of the scheme, so the plate is dark on a light page and light on a dark one.

That is what makes a tooltip legible over content it was never designed against — which is the only content a tooltip ever appears over. It is also the only place in the library those two roles are read.

Setting `color` swaps in an accent fill. Worth doing for a tooltip that is itself a warning; wrong for the other ninety-nine, because a red tooltip on a delete button is saying something the tooltip does not know.

## No shadow

MD3 puts a plain tooltip at elevation 0, and this follows it. What separates the plate from the page is that it is the _inverse_ surface — a dark card on a light page — and a shadow under something already that far from its background reads as a second, softer edge rather than as height.

## What Base UI owns, and what this adds

Base UI owns the parts that are genuinely hard: the delay and the group timeout, opening on focus but not on a focus that came from a click, closing on Escape, and keeping the popup off the edges of the window.

The one thing it deliberately leaves open is what makes a tooltip mean anything to a screen reader — `role="tooltip"` on the plate and an `aria-describedby` pointing at it from the trigger — because a popup can be many things and only the caller knows which. Here it is always a tooltip, so this wires both, and drops the reference while it is closed rather than pointing at an element that is not in the document.

## `MPTooltipProvider`

Shares one delay across a group: once any tooltip has opened, its neighbours open instantly, and the wait comes back after a pause.

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

Worth wrapping a toolbar in. Without it, moving along a row of icon buttons means waiting out the full delay at every stop, which is what makes tooltips feel like they are fighting the pointer.

## Examples

### side and align

<Demo src="tooltip/sides">

<<< @/.vitepress/demos/tooltip/sides.tsx

</Demo>

The tooltip may flip to the opposite side when there is no room, which is Base UI's doing and is the right behaviour.

### disabled

Stops the tooltip from opening at all, without disabling the trigger — for the tooltip that only exists while a label is truncated.

```tsx
<MPTooltip content={label} disabled={!isTruncated}>
  <span className="truncate">{label}</span>
</MPTooltip>
```

## A tooltip is not a container

It cannot be reached by a pointer on a touch screen, it disappears the moment attention moves, and anything inside it that could be clicked cannot be. Content that needs either of those wants a popover, not this.

That is also why the trigger still needs its own accessible name. A tooltip **describes**; it does not name.

```tsx
// ✅ named by aria-label, described by the tooltip
<MPTooltip content="Copy to clipboard">
  <MPButton aria-label="Copy">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>
```

## See also

- [MPShortcut](../display/shortcut) — a natural neighbour inside `content`.
- [MPIcon](../display/icon) — the thing most often described by one.
