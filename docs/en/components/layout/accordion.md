---
title: MPAccordion
order: 3
---

# MPAccordion

<p class="mp-lede">A stack of sections, one of which is open. Opening the next closes the last, which is the whole reason it is not simply a stack of collapsibles.</p>

<Demo src="accordion/hero" :minHeight="280" />

::: fw react

```tsx
import { MPAccordion, MPAccordionItem } from 'material-plus-ui';

<MPAccordion defaultValue={['delivery']}>
  <MPAccordionItem value="delivery" title="Delivery" subtitle="Three to five working days">
    Standard delivery is included in the price.
  </MPAccordionItem>
  <MPAccordionItem value="returns" title="Returns">
    Thirty days, postage paid.
  </MPAccordionItem>
</MPAccordion>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAccordion(
  initialValue: <Object>['delivery'],
  children: <Widget>[
    MPAccordionItem(
      value: 'delivery',
      title: Text('Delivery'),
      subtitle: Text('Three to five working days'),
      child: Text('Standard delivery is included in the price.'),
    ),
    MPAccordionItem(value: 'returns', title: Text('Returns'), child: Text('Thirty days, postage paid.')),
  ],
);
```

:::

## Props

<PropsTable name="MPAccordion" />

### MPAccordionItem

<PropsTable name="MPAccordionItem" />

## Why this is not a stack of collapsibles

Because of `multiple`.

An [MPCollapsible](./collapsible) has an `open` of its own and answers to nobody. An accordion owns the **set**: closing the last section as the next one opens is what keeps the page from growing under the reader, and that rule cannot live inside a component that only knows about itself.

So the question is whether the sections are related:

- **Unrelated** — "Advanced options" on a form, "Show the raw response" under a result. Two collapsibles. An accordion here would close one because the other opened, which is a relationship the page does not have.
- **Alternatives to each other** — a set of FAQs, a settings page's categories, the panels of a sidebar. An accordion.

Set `multiple` when they are related enough to belong in one stack but the reader may reasonably want two open at once.

<Demo src="accordion/multiple" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/accordion/multiple.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/accordion/multiple.dart

:::

</Demo>

<Fw react="`onValueChange`" flutter="`onChanged`" /> reports the **whole open set** rather than the section that moved. That is what makes "close everything but this one" a single assignment rather than a diff.

## Where the shared values live

`size`, `variant` and `dividers` are the **stack's**, not the section's.

A section is a section _of_ something, so passing the rung per item would be a chance per item to get one wrong — with a silent failure: an accordion whose fourth section is a size bigger than the three above it. `MPAccordionItem` reads them from <Fw react="a context" flutter="an inherited widget" />, which is also why a section still gets them when a caller builds the items from their data or wraps one in a widget of their own.

What stays on the item is what is genuinely its own: its `value`, its slots, and its `disabled`.

## Ruled or tiled

<Demo src="accordion/dividers" :minHeight="360">

::: fw react

<<< @/.vitepress/demos/accordion/dividers.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/accordion/dividers.dart

:::

</Demo>

`dividers` is on by default, which is the other way round from [MPList](../display/list). A list of tiles is a list; an accordion of tiles is a stack of cards that happen to fold, and the rule is what says the sections are parts of one thing.

The two settings are not just a line appearing:

|  | With `dividers` | Without |
| --- | --- | --- |
| The sheet | Clips, and gives up its padding so the rules reach both edges | Keeps a hair of padding |
| A section | Squared off — it is a row | `corner-small`, one step down from the sheet — it is a tile |

## The surface stays neutral

Even on `filled`, which here is `surface-container-highest` — MD3's own filled card — rather than the accent. An accordion is a box holding somebody else's content, and dyeing the box dyes their content's background.

That is also why there is no `color`: nothing would read it. The sheet is neutral by construction and the focus ring is `secondary` on every control in the library.

## What moves

::: fw react

Each panel's height is animated from Base UI's own measurement, published as `--accordion-panel-height`. Nothing is transformed and no text is resampled — the panel is a window opening onto content that stays still. The duration and the curve are the specification's `short4` and `standard`, and the transition is dropped under `prefers-reduced-motion`.

:::

::: fw flutter

Each panel is laid out at its full height and shown a growing share of it. Nothing is transformed and no text is resampled — the panel is a window opening onto content that stays still. The duration and the curve are the specification's `short4` and `standard`, and under `MediaQuery.disableAnimations` the panel cuts.

:::

**The clip belongs to the animation, not to the panel.** The clip is what makes a body mid-open a window rather than a squashed copy of itself, and it is taken off the moment the height has arrived. A settled panel that went on clipping would cut the top off the first thing in it that draws outside its own box — a text field's floating label sits _on_ the field's top edge, which is the panel's top edge, so a form in an accordion arrived with its first label sliced in half and nothing in the console said so. A select's popup, a tooltip and a focus ring are the same bug with different pixels.

Closing puts the clip back before the height moves rather than after, so a panel on its way down never draws outside a shrinking box. A section that starts open, and any section with animations turned off, is unclipped from the first paint: there is no transition to wait for, and waiting for one would clip it for good.

## Examples

### action

A control pinned to the end of a header, **outside** the trigger:

::: fw react

```tsx
<MPAccordionItem value="address" title="Address" action={<MPButton variant="text">Edit</MPButton>}>
  12 Sejong-daero, Jung-gu, Seoul
</MPAccordionItem>
```

:::

::: fw flutter

```dart
MPAccordionItem(
  value: 'address',
  title: const Text('Address'),
  action: MPButton(variant: MPVariant.text, onPressed: edit, child: const Text('Edit')),
  child: const Text('12 Sejong-daero, Jung-gu, Seoul'),
);
```

:::

That is structural rather than cosmetic. A header that both folds and holds a button has two things to press, and one inside the other would fold the section every time the button was pressed. Pressing the action does not fold the section it sits on.

### disabled

On the stack it takes every section out at once; on a section it takes only that one, and the rest keep working:

::: fw react

```tsx
<MPAccordion disabled>…</MPAccordion>

<MPAccordionItem value="b" title="Not yet" disabled>…</MPAccordionItem>
```

:::

::: fw flutter

```dart
MPAccordion(disabled: true, children: sections);

MPAccordionItem(value: 'b', title: const Text('Not yet'), disabled: true, child: body);
```

:::

### <Fw react="hiddenUntilFound" flutter="keepMounted" />

::: fw react

Leaves closed panels in the DOM as `hidden="until-found"`, so the browser's own page search can find the text and open the fold to show it. It overrides `keepMounted`, which already keeps the element for a different reason — content that is expensive to build, or that holds form state.

```tsx
<MPAccordion hiddenUntilFound>…</MPAccordion>
```

:::

::: fw flutter

Keeps closed panels built, for content that is expensive to build or that holds form state. A closed panel is out of the focus order and the semantics tree either way. There is no `hiddenUntilFound`, because Flutter has no browser page search for it to answer.

```dart
MPAccordion(keepMounted: true, children: sections);
```

:::

## Accessibility

::: fw react

- Each header is a real `<button>` inside a heading row, with `aria-expanded` and an `aria-controls` pointing at its panel — all wired by Base UI.

:::

::: fw flutter

- Each header is one semantics node: a button that says whether it is expanded, announced as a heading.

:::

- That heading is <Fw react="an `<h3>`" flutter="level 3" /> unless `headingLevel` says otherwise. Set it to one below the heading the accordion sits under, so the page's outline does not skip a level: a screen reader moves through a page by its headings, and a search engine reads its structure from them.
- Focus moves between headers with Tab rather than with the arrow keys. That follows [the APG's own revision](https://github.com/w3c/aria-practices/pull/3434), which removed roving focus from the accordion pattern, and both builds implement the current guidance.
- `action` is outside the trigger, so a keyboard reader reaches the fold and the control on it as two separate stops.
- Hover, focus and press are Material's state layer, so a header reads the same on all five surfaces.
- The focus ring is drawn **inset** on a ruled accordion, because the sheet clips its children so the panels can be windows.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultValue` | `initialValue` | Flutter's word for a starting value the widget then keeps. |
| `onValueChange` | `onChanged` | Flutter's name for a plain change of value. |
| `(string \| number)[]` | `List<Object>` | Any value with a working `==` identifies a section. |
| a generated `value` | the section itself | A section with no `value` is identified by its own state, which is enough for an accordion nobody drives from code. |
| `hiddenUntilFound` | — | It answers the browser's own page search, which Flutter does not have. |
| `children` | `children` / `child` | The accordion takes a list of sections; a section takes one body. |

:::

## See also

- [MPCollapsible](./collapsible) — one fold, answering to nobody.
- [MPList](../display/list) — a stack of rows that do not fold.
- [MPCard](./card) — a sheet whose sections are all visible at once.
