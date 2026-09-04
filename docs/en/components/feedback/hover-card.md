---
title: MPHoverCard
order: 15
---

# MPHoverCard

<p class="mp-lede">A card that opens when the pointer rests on something, holding a preview of what is on the other side of it. Uninvited like a tooltip, reachable like a popover.</p>

<Demo src="hover-card/hero" :minHeight="260" />

```tsx
import { MPHoverCard, MPTextLink } from 'material-plus-ui';

<MPHoverCard
  trigger={<MPTextLink href="/people/priya">Priya Raman</MPTextLink>}
  title="Priya Raman"
  description="Platform team"
>
  Joined 2023. Owns the deployment pipeline.
</MPHoverCard>;
```

## Props

<PropsTable name="MPHoverCard" />

## Where it sits between the other two popups

The distance is short in both directions, and picking the wrong one of the three is the mistake this component exists to make avoidable.

|  | Opened by | Can the pointer reach it | What goes in it |
| --- | --- | --- | --- |
| [MPTooltip](./tooltip) | Hovering, uninvited | No | A label. One line. |
| **MPHoverCard** | Hovering, uninvited | Yes | A preview. A heading, a line, a picture, a link. |
| [MPPopover](./popover) | A press, asked for | Yes | A panel. A form, a menu, anything. |

## Because it is uninvited, it is never the only way to anything

A keyboard with no hover, a touchscreen with no pointer, and a screen reader all arrive by the trigger's own route instead. So whatever is in the card has to exist on the page the trigger leads to as well.

Treat it as a shortcut for the reader who has a pointer, never as the place a fact lives.

That is also why there is no keyboard equivalent bolted on. A card that opened on focus would interrupt every keyboard reader tabbing through a paragraph of links, which is a worse answer than not opening at all.

## The trigger has to be one element that takes a ref

Base UI clones it to attach its ref and its handlers, so a plain function component in the way swallows both — and the card then never opens, with nothing to say why:

```tsx
// Wrong: `Person` swallows the ref and the handlers.
const Person = () => <MPTextLink href="/people/priya">Priya Raman</MPTextLink>;
<MPHoverCard trigger={<Person />} />;

// Right.
<MPHoverCard trigger={<MPTextLink href="/people/priya">Priya Raman</MPTextLink>} />;
```

Every Material Plus component accepts a ref and spreads its props, so any of them works directly.

## It names itself

`title` becomes the card's accessible name and `description` its accessible description, wired by hand — Base UI's preview card has no `Title` or `Description` part the way its popover does, so a card without them is a sheet a screen reader reads cold.

## The gap between the trigger and the card is crossable

That is what `closeDelay` is for: the card holds after the pointer has left the trigger, long enough for the pointer to travel the eight pixels between them. Shorten it and the card closes under a hand on its way in.

`delay` is the other half — how long the pointer has to rest before anything opens. The default is long enough that dragging across a paragraph of links does not open four cards on the way past.

## What it does not take

No `variant`, no `color`, no `elevation`, for [MPPopover](./popover)'s reasons: the five weights answer how much a surface asserts itself and a card that arrives uninvited has already been answered for; MD3's surface for a small anchored sheet is `surface-container`, neutral, and a card that could be dyed would dye the preview in it; and a card floating over the page is the whole idea, so a prop that could sit it flat would undo it.
