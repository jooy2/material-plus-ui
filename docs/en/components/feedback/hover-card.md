---
title: MPHoverCard
order: 15
---

# MPHoverCard

<p class="mp-lede">A card that opens when the pointer rests on something, holding a preview of what is on the other side of it. Uninvited like a tooltip, reachable like a popover.</p>

<Demo src="hover-card/hero" :minHeight="260" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHoverCard(
  trigger: MPTextLink(onPressed: openProfile, child: const Text('Priya Raman')),
  title: const Text('Priya Raman'),
  description: const Text('Platform team'),
  child: const Text('Joined 2023. Owns the deployment pipeline.'),
);
```

The card is lifted out of the tree, so it needs an `Overlay` above it. `WidgetsApp` with a navigator and `MaterialApp` both provide one.

:::

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

A touchscreen with no pointer arrives by the trigger's own route instead, and a screen reader is not taken into the card when it opens. So whatever is in the card has to exist on the page the trigger leads to as well.

Treat it as a shortcut, never as the place a fact lives.

It does open on keyboard focus, after the same `delay` a pointer waits<Fw react=", which is Base UI's behaviour" />. That delay is also why tabbing through a paragraph of links does not open a card for each of them: only the link that focus rests on shows one. A focus that arrives with a press does not open it.

::: fw react

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

:::

::: fw flutter

## Any widget is a trigger

The card listens round the trigger rather than reaching into it, so the trigger can be any widget: a text link, an avatar, a `Text` inside a `WidgetSpan` in the middle of a paragraph. It is drawn where it was written, and the card adds no box to the layout.

## It says what it is

The card is one node on the semantics tree holding its heading, its line and its body, and `title` is announced as a heading, so a screen reader that lands in the card reads what it is before the paragraph inside it.

The keyboard can move into the card, and the card stays open while the focus is inside it, so a link in the preview can be reached without a pointer. <kbd>Escape</kbd> closes it.

:::

## The gap between the trigger and the card is crossable

That is what `closeDelay` is for: the card holds after the pointer has left the trigger, long enough for the pointer to travel the eight pixels between them. Shorten it and the card closes under a hand on its way in.

`delay` is the other half — how long the pointer has to rest before anything opens. The default is long enough that dragging across a paragraph of links does not open four cards on the way past.

## What it does not take

No `variant`, no `color`, no `elevation`, for [MPPopover](./popover)'s reasons: the five weights answer how much a surface asserts itself and a card that arrives uninvited has already been answered for; MD3's surface for a small anchored sheet is `surface-container`, neutral, and a card that could be dyed would dye the preview in it; and a card floating over the page is the whole idea, so a prop that could sit it flat would undo it.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `trigger` as one element that takes a ref | any widget | The card listens round the trigger, so there is nothing to clone and nothing to swallow. |
| `children` | `child` | Flutter's name for the one widget a wrapper holds. |
| `delay`, `closeDelay` in milliseconds | `Duration?` | Dart's type for a length of time. `null` is Base UI's 600 and 300 milliseconds. |
| `defaultOpen` | `initialOpen` | The name Flutter gives a starting value. |
| `width` as a number or a CSS length | `double?` | Logical pixels are the one length Flutter has. |
| `aria-labelledby` and `aria-describedby` on the card | a heading inside one node | There is no id to point at. The heading is what a screen reader finds first in the card. |
| collision handling on both axes | a flip, never a slide | Sliding needs the position recomputed against the window every frame. |
| `className`, `style`, native attributes | — | There is no class list and no style attribute to pass through. |

:::
