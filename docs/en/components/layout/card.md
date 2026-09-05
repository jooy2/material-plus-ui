---
title: MPCard
order: 5
---

# MPCard

<p class="mp-lede">An MPBox with the parts a card is made of laid out on it: a picture, a heading, a subheading, a body and a footer. MD3's own card anatomy, in slots.</p>

<Demo src="card/hero" :minHeight="320" />

```tsx
import { MPCard, MPButton } from 'material-plus-ui';

<MPCard
  variant="elevated"
  title="Weekly digest"
  subtitle="Sent every Monday at 09:00"
  footer={<MPButton>Send now</MPButton>}
>
  Forty-two people opened the last one.
</MPCard>;
```

## Props

<PropsTable name="MPCard" />

Every [MPBox](./box) prop passes straight through, so a card is styled on exactly the same axes as the box it is.

## Why the sections are props

There is no `<MPCard.Header>` or `<MPCard.Title>`, and that is the same decision [MPDialog](../feedback/dialog) makes.

The arrangement of a card is **fixed** — media, headline, subhead, body, actions, in that order, because that is MD3's own anatomy. What a caller wants to decide is what goes in each slot, not what order the slots come in, and compound sub-components would offer an ordering that has one correct answer.

What they would also offer is a card that is silently missing its heading because somebody forgot to nest one. A slot that is left empty draws nothing at all: no wrapper, no padding, no gap.

## The surface is MD3's card

`corner-medium`, and three of the five variants are the specification's own card variants to the letter — `filled` is `surface-container-highest`, `elevated` is `surface-container-low` under a level-1 shadow, `outlined` is a hairline in `outline-variant`.

None of them is dyed, and there is no `color`. The argument is [MPBox](./box#why-it-is-never-dyed-and-takes-no-color)'s, unchanged: what a card holds is somebody else's content, and it arrived with its own colours.

## media

<Demo src="card/media" :minHeight="400">

<<< @/.vitepress/demos/card/media.tsx

</Demo>

Drawn **edge to edge** across the top, so the card's own corners crop it. It is a slot of its own rather than part of `children` because it is the one part of a card that must not be padded — and the vertical track the other sections sit in starts _below_ it, so a picture is never framed by the sheet's own padding.

The card only clips when there is media. `overflow: hidden` on every card would shave the focus ring off a control sitting against the sheet's edge, for no gain on a card with nothing to crop.

## dividers

<Demo src="card/dividers" :minHeight="360">

<<< @/.vitepress/demos/card/dividers.tsx

</Demo>

Off by default. Turning it on is a trade, not just a line appearing:

|                  | Off                      | On                             |
| ---------------- | ------------------------ | ------------------------------ |
| Vertical padding | The **sheet** carries it | Each **section** carries it    |
| Between sections | A gap                    | A hairline reaching both edges |

The rule is the same `outline-variant` as the card's own edge, so it reads as the sheet being scored rather than as a second, unrelated line. There is never a rule above the first section — or under the media, which is already the break.

## Why a card is not pressable

There is no `href` and no `onClick`.

MD3 does describe a card as a container that may be interactive, and a whole-card target would be the wrong shape for _this_ card: one with a heading, a body and two buttons in its footer that is also one big link is a link containing links, which the HTML parser takes apart on the way in. Every keyboard reader then meets a control the screen reader cannot describe.

What to do instead:

```tsx
// The heading is the link.
<MPCard title={<MPTextLink href="/digests/42">Weekly digest</MPTextLink>}>…</MPCard>

// Or the footer holds the action.
<MPCard title="Weekly digest" footer={<MPButton onClick={open}>Open</MPButton>}>…</MPCard>
```

A grid of tiles where the **whole tile** is one target is a different component, and it is a plain [MPBox](./box) with an `<a>` inside it — nothing in it competes for the click.

## Examples

### title as a heading element

A card that should appear in the document outline needs a real heading. Pass one, and it keeps the card's typography rather than the browser's:

```tsx
<MPCard title={<h3>Totals</h3>}>…</MPCard>
```

A plain string is deliberately _not_ made into a heading. A page of cards would then be a page of `<h3>`s in whatever order they happen to render, which is an outline nobody wrote.

### headerAction

Stays on the title's line while the title wraps beside it:

```tsx
<MPCard title="Weekly digest" headerAction={<MPIconButton icon={…} label="More" size="xs" />}>
  …
</MPCard>
```

### A card with only a body

Every slot is optional, and a card with none of them filled is an [MPBox](./box) — which is exactly what it is:

```tsx
<MPCard>Just the sheet.</MPCard>
```

## Accessibility

- A card has no role of its own. It is a `<div>` with a surface, and it stays that way for the same reason a box does: a region a screen reader should announce needs a name and an element that takes one, which is what `render` is for.
- `title` is not silently a heading. Pass a heading element when the card belongs in the outline.
- Nothing is pressable, so nothing here can nest one control inside another.

```tsx
<MPCard render={<article />} aria-labelledby="digest-title" title={<h3 id="digest-title">…</h3>}>
  …
</MPCard>
```

## See also

- [MPBox](./box) — the sheet underneath, with no sections on it.
- [MPCollapsible](./collapsible) — a sheet whose body folds away.
- [MPDialog](../feedback/dialog) — the same slots, on a sheet that has taken the page.
