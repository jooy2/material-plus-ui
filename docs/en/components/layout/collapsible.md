---
title: MPCollapsible
order: 7
---

# MPCollapsible

<p class="mp-lede">One section that folds, standing on its own. A "Show more" on a form, an optional block of settings, the detail under a row — with the panel's height animated from a real measurement rather than appearing all at once.</p>

<Demo src="collapsible/hero" :minHeight="220" />

::: fw react

```tsx
import { MPCollapsible } from 'material-plus-ui';

<MPCollapsible title="Delivery options" subtitle="Standard, chosen">
  Standard delivery arrives in three to five working days.
</MPCollapsible>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPCollapsible(
  title: Text('Delivery options'),
  subtitle: Text('Standard, chosen'),
  child: Text('Standard delivery arrives in three to five working days.'),
);
```

:::

## Props

<PropsTable name="MPCollapsible" />

::: fw flutter

Uncontrolled by default: it starts at `initialOpen`, keeps its own state and reports every change to `onOpenChange`. Pass `open` as well and it stays where you put it.

:::

## Why this is not an accordion

An [MPAccordion](./accordion) is a _set_ of folds and owns which one of them is open. This is the same fold with nothing else beside it, so what it needs is an `open` of its own rather than a place in somebody's list.

The choice is about the page, not about the markup:

- Two sections that are **unrelated** — "Advanced options" on a form, "Show the raw response" under a result — are two collapsibles. Closing one because the other opened would be the component inventing a relationship the page does not have.
- Sections that are **alternatives to each other**, where the page would grow under the reader if they all opened, are an accordion.

A stack of collapsibles is a perfectly good thing to build. An accordion is what you reach for when the stack needs a rule about itself.

## What moves, and why that is allowed

The panel's height is animated, which looks like an exception to this library's rule against moving a surface and is not.

Nothing is transformed, no text is resampled, and the content does not shift relative to the panel it is in — the panel is a window opening onto content that stays still. What the rule is written against is a sheet that drags its own sentence across the screen while the reader is already looking at it, and that is a different thing.

::: fw react

The height comes from Base UI, which measures the content and publishes it as `--collapsible-panel-height`; the duration and the curve are the specification's `short4` and `standard`, the same pair a text field's outline settles on. Under `prefers-reduced-motion` the transition is dropped and the panel cuts.

:::

::: fw flutter

The panel is laid out at its full height and shown a growing share of it, so nothing is measured twice; the duration and the curve are the specification's `short4` and `standard`, the same pair a text field's outline settles on. Under `MediaQuery.disableAnimations` the panel cuts. The clip is only on while the height moves, so a control inside an open panel keeps its whole focus ring.

:::

## The surface stays neutral

<Demo src="collapsible/variants" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/collapsible/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/collapsible/variants.dart

:::

</Demo>

Note what `filled` is here: `surface-container-highest`, MD3's own filled-card surface, and **not** the accent. On a button or an [alert](../feedback/alert) `filled` is the accent under its own ink, because those components _are_ the thing being coloured. A collapsible is a box holding somebody else's content, and dyeing the box dyes their content's background — every link, field and button inside it would then need an on-accent treatment of its own.

That is also why there is no `color` prop. Nothing would read it: the sheet is neutral by construction, and the focus ring is `secondary` on every control in the library. A prop that reaches nothing is a prop that has to be supported forever.

## Examples

### The header slots

<Demo src="collapsible/slots" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/collapsible/slots.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/collapsible/slots.dart

:::

</Demo>

`action` sits **outside** the trigger, and that is structural rather than cosmetic. A header that both folds and holds a switch has two things to press, and one inside the other would make the switch's press fold the section as well (on the web, a `<button>` inside a `<button>` is markup the browser rewrites on parse). So the action is a sibling of the trigger, and pressing it does not fold the section it sits on.

### <Fw react="trigger" flutter="triggerBuilder" />

::: fw react

Replaces the header entirely with a control of your own. The element you pass _becomes_ the trigger — Base UI hands it the click handler, `aria-expanded` and the `aria-controls` pointing at the panel:

```tsx
<MPCollapsible variant="text" trigger={<MPButton variant="text">Show more</MPButton>}>
  Nothing here had to be told what it controls.
</MPCollapsible>
```

:::

::: fw flutter

Replaces the header entirely with a control of your own. A widget has nothing to be wired into, so the builder is handed the wiring instead: whether the panel is open, and a callback that folds it. Say the state on your trigger with `Semantics(expanded: open)`:

```dart
MPCollapsible(
  variant: MPVariant.text,
  triggerBuilder: (BuildContext context, bool open, VoidCallback toggle) => Semantics(
    expanded: open,
    child: MPButton(variant: MPVariant.text, onPressed: toggle, child: const Text('Show more')),
  ),
  child: const Text('Nothing here had to be told what it controls.'),
);
```

:::

With your own trigger the panel pays for the space above its content as well as below, because a control that is not the house header has not paid for it.

### padded

Off for content that should reach the edges — a table, a picture, a list that draws its own rows:

::: fw react

```tsx
<MPCollapsible title="Rows" padded={false}>
  <MPTable headers={headers} items={items} variant="text" />
</MPCollapsible>
```

:::

::: fw flutter

```dart
MPCollapsible(
  title: const Text('Rows'),
  padded: false,
  child: MPTable<Build>(headers: headers, items: items, variant: MPVariant.text),
);
```

:::

### <Fw react="hiddenUntilFound and keepMounted" flutter="keepMounted" />

::: fw flutter

Keeps a closed panel built, for content that is expensive to build or that holds form state which should survive being folded away. A closed panel takes no focus and is silent to a screen reader either way. There is no `hiddenUntilFound`: Flutter has no browser page search for it to answer.

:::

::: fw react

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

:::

## Accessibility

::: fw react

- The trigger is a real `<button>` with `aria-expanded` and an `aria-controls` pointing at the panel, both wired by Base UI. Space and Enter both work because it is a button and not a `<div>` with a handler on it.
- `action` is outside the trigger, so a keyboard reader reaches the fold and the control on it as two separate stops rather than finding one nested inside the other.
- Hover, focus and press are Material's state layer — a translucent wash of the content colour — so the header reads the same on all five surfaces.
- The focus ring is drawn **inset**. The sheet clips its children so the panel can be a window, and `overflow: hidden` would shave an offset ring off a trigger that fills the top of the sheet.

:::

::: fw flutter

- The trigger is one semantics node: a button that says whether it is expanded. Space and Enter both fold it.
- A closed panel is out of the focus order and out of the semantics tree, even when `keepMounted` keeps it built.
- `action` is outside the trigger, so a keyboard reader reaches the fold and the control on it as two separate stops rather than finding one nested inside the other.
- Hover, focus and press are Material's state layer, so the header reads the same on all five surfaces.
- The focus ring is drawn **inset**, and only on keyboard focus. The sheet clips so the panel can be a window, and an offset ring on a trigger that fills the top of the sheet would be shaved off.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultOpen` | `initialOpen` | Flutter's word for a starting value the widget then keeps. |
| `trigger` element | `triggerBuilder` | There is no element for the library to wire up, so the builder is handed the open state and the toggle. |
| `hiddenUntilFound` | — | It answers the browser's own page search, which Flutter does not have. |
| `children` | `child` | Flutter's name. |
| `className` | — | There is no class list to pass through. |

:::

## See also

- [MPAccordion](./accordion) — a set of these, with a rule about how many can be open.
- [MPCard](./card) — a sheet whose sections are all visible at once.
- [MPSpoiler](../display/spoiler) — content hidden because it should not be read by accident, which is a different problem.
