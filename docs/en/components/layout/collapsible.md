---
title: MPCollapsible
order: 7
---

# MPCollapsible

<p class="mp-lede">One section that folds, standing on its own. A "Show more" on a form, an optional block of settings, the detail under a row — with the panel's height animated from a real measurement rather than appearing all at once.</p>

<Demo src="collapsible/hero" :minHeight="220" />

```tsx
import { MPCollapsible } from 'material-plus-ui';

<MPCollapsible title="Delivery options" subtitle="Standard, chosen">
  Standard delivery arrives in three to five working days.
</MPCollapsible>;
```

## Props

<PropsTable name="MPCollapsible" />

## Why this is not an accordion

An [MPAccordion](./accordion) is a _set_ of folds and owns which one of them is open. This is the same fold with nothing else beside it, so what it needs is an `open` of its own rather than a place in somebody's list.

The choice is about the page, not about the markup:

- Two sections that are **unrelated** — "Advanced options" on a form, "Show the raw response" under a result — are two collapsibles. Closing one because the other opened would be the component inventing a relationship the page does not have.
- Sections that are **alternatives to each other**, where the page would grow under the reader if they all opened, are an accordion.

A stack of collapsibles is a perfectly good thing to build. An accordion is what you reach for when the stack needs a rule about itself.

## What moves, and why that is allowed

The panel's height is animated, which looks like an exception to this library's rule against moving a surface and is not.

Nothing is transformed, no text is resampled, and the content does not shift relative to the panel it is in — the panel is a window opening onto content that stays still. What the rule is written against is a sheet that drags its own sentence across the screen while the reader is already looking at it, and that is a different thing.

The height comes from Base UI, which measures the content and publishes it as `--collapsible-panel-height`; the duration and the curve are the specification's `short4` and `standard`, the same pair a text field's outline settles on. Under `prefers-reduced-motion` the transition is dropped and the panel cuts.

## The surface stays neutral

<Demo src="collapsible/variants" :minHeight="420">

<<< @/.vitepress/demos/collapsible/variants.tsx

</Demo>

Note what `filled` is here: `surface-container-highest`, MD3's own filled-card surface, and **not** the accent. On a button or an [alert](../feedback/alert) `filled` is the accent under its own ink, because those components _are_ the thing being coloured. A collapsible is a box holding somebody else's content, and dyeing the box dyes their content's background — every link, field and button inside it would then need an on-accent treatment of its own.

That is also why there is no `color` prop. Nothing would read it: the sheet is neutral by construction, and the focus ring is `secondary` on every control in the library. A prop that reaches nothing is a prop that has to be supported forever.

## Examples

### The header slots

<Demo src="collapsible/slots" :minHeight="260">

<<< @/.vitepress/demos/collapsible/slots.tsx

</Demo>

`action` sits **outside** the trigger, and that is structural rather than cosmetic. A header that both folds and holds a switch has two things to press, and a `<button>` inside a `<button>` is markup the browser rewrites on parse. So the action is a sibling of the trigger, and pressing it does not fold the section it sits on.

### trigger

Replaces the header entirely with a control of your own. The element you pass _becomes_ the trigger — Base UI hands it the click handler, `aria-expanded` and the `aria-controls` pointing at the panel:

```tsx
<MPCollapsible variant="text" trigger={<MPButton variant="text">Show more</MPButton>}>
  Nothing here had to be told what it controls.
</MPCollapsible>
```

With your own trigger the panel pays for the space above its content as well as below, because a control that is not the house header has not paid for it.

### padded

Off for content that should reach the edges — a table, a picture, a list that draws its own rows:

```tsx
<MPCollapsible title="Rows" padded={false}>
  <MPTable headers={headers} items={items} variant="text" />
</MPCollapsible>
```

### hiddenUntilFound and keepMounted

Two different reasons to leave a closed panel in the DOM, and they are not interchangeable:

| Prop | For |
| --- | --- |
| `hiddenUntilFound` | The browser's own page search. Ctrl-F finds the text and opens the fold to show it |
| `keepMounted` | Content that is expensive to build, or that holds form state which should survive being folded away |

`hiddenUntilFound` overrides `keepMounted`, because `hidden="until-found"` already keeps the element.

```tsx
<MPCollapsible title="Terms" hiddenUntilFound>
  Findable by Ctrl-F even while it is closed.
</MPCollapsible>
```

## Accessibility

- The trigger is a real `<button>` with `aria-expanded` and an `aria-controls` pointing at the panel, both wired by Base UI. Space and Enter both work because it is a button and not a `<div>` with a handler on it.
- `action` is outside the trigger, so a keyboard reader reaches the fold and the control on it as two separate stops rather than finding one nested inside the other.
- Hover, focus and press are Material's state layer — a translucent wash of the content colour — so the header reads the same on all five surfaces.
- The focus ring is drawn **inset**. The sheet clips its children so the panel can be a window, and `overflow: hidden` would shave an offset ring off a trigger that fills the top of the sheet.

## See also

- [MPAccordion](./accordion) — a set of these, with a rule about how many can be open.
- [MPCard](./card) — a sheet whose sections are all visible at once.
- [MPSpoiler](../display/spoiler) — content hidden because it should not be read by accident, which is a different problem.
