---
title: MPAccordion
order: 3
---

# MPAccordion

<p class="mp-lede">A stack of sections, one of which is open. Opening the next closes the last, which is the whole reason it is not simply a stack of collapsibles.</p>

<Demo src="accordion/hero" :minHeight="280" />

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

<<< @/.vitepress/demos/accordion/multiple.tsx

</Demo>

`onValueChange` reports the **whole open set** rather than the section that moved. That is what makes "close everything but this one" a single assignment rather than a diff.

## Where the shared values live

`size`, `variant` and `dividers` are the **stack's**, not the section's.

A section is a section _of_ something, so passing the rung per item would be a chance per item to get one wrong — with a silent failure: an accordion whose fourth section is a size bigger than the three above it. `MPAccordionItem` reads them from a context, which is also why a section still gets them when a caller `.map()`s their data or wraps one in a component of their own.

What stays on the item is what is genuinely its own: its `value`, its slots, and its `disabled`.

## Ruled or tiled

<Demo src="accordion/dividers" :minHeight="360">

<<< @/.vitepress/demos/accordion/dividers.tsx

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

Each panel's height is animated from Base UI's own measurement, published as `--accordion-panel-height`. Nothing is transformed and no text is resampled — the panel is a window opening onto content that stays still. The duration and the curve are the specification's `short4` and `standard`, and the transition is dropped under `prefers-reduced-motion`.

## Examples

### action

A control pinned to the end of a header, **outside** the trigger:

```tsx
<MPAccordionItem value="address" title="Address" action={<MPButton variant="text">Edit</MPButton>}>
  12 Sejong-daero, Jung-gu, Seoul
</MPAccordionItem>
```

That is structural rather than cosmetic. A header that both folds and holds a button has two things to press, and a `<button>` inside a `<button>` is markup the browser rewrites on parse. Pressing the action does not fold the section it sits on.

### disabled

On the stack it takes every section out at once; on a section it takes only that one, and the rest keep working:

```tsx
<MPAccordion disabled>…</MPAccordion>

<MPAccordionItem value="b" title="Not yet" disabled>…</MPAccordionItem>
```

### hiddenUntilFound

Leaves closed panels in the DOM as `hidden="until-found"`, so the browser's own page search can find the text and open the fold to show it. It overrides `keepMounted`, which already keeps the element for a different reason — content that is expensive to build, or that holds form state.

```tsx
<MPAccordion hiddenUntilFound>…</MPAccordion>
```

## Accessibility

- Each header is a real `<button>` inside a heading row, with `aria-expanded` and an `aria-controls` pointing at its panel — all wired by Base UI.
- Focus moves between headers with Tab rather than with the arrow keys. That follows [the APG's own revision](https://github.com/w3c/aria-practices/pull/3434), which removed roving focus from the accordion pattern; Base UI implements the current guidance and this component does not add a second one on top.
- `action` is outside the trigger, so a keyboard reader reaches the fold and the control on it as two separate stops.
- Hover, focus and press are Material's state layer, so a header reads the same on all five surfaces.
- The focus ring is drawn **inset** on a ruled accordion, because the sheet clips its children so the panels can be windows.

## See also

- [MPCollapsible](./collapsible) — one fold, answering to nobody.
- [MPList](../display/list) — a stack of rows that do not fold.
- [MPCard](./card) — a sheet whose sections are all visible at once.
