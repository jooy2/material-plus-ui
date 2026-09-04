---
title: MPScrollZone
order: 23
---

# MPScrollZone

<p class="mp-lede">A strip of anything, laid out in one direction and scrolled in it. Cards, chips, avatars or thumbnails run across the box or down it, in as many lines as you ask for, with a pair of buttons for the pointer that has neither a wheel nor a finger.</p>

<Demo src="scroll-zone/hero" :minHeight="420" />

```tsx
import { MPChip, MPScrollZone } from 'material-plus-ui';

<MPScrollZone label="Categories">
  <MPChip>Espresso</MPChip>
  <MPChip>Filter</MPChip>
  <MPChip>Cold brew</MPChip>
</MPScrollZone>;
```

## Props

<PropsTable name="MPScrollZone" />

## It is a scroll container, and only ever that

Swiping on a phone, two-finger dragging on a trackpad, the arrow keys and the scrollbar are the browser's own, and none of them is intercepted. What is added on top is a pair of buttons for the pointer that cannot do any of it, a mouse drag for the strip that reads as something to pull rather than something to page, and — only where `wheel` asks for it — the wheel turned onto the axis the strip runs along.

Nothing is transformed. A translated track would have to argue for an exception to the rule the rest of the library keeps, and a scroll offset does not: it is also what makes the strip run the other way under RTL without being told, what keeps the scrollbar honest, and what lets the browser scroll a focused child into view on its own.

## `lines` is what separates it from `MPCarousel`

A carousel is one thing at a time and knows which one. It has a `value`, an index, arrows that mean _the slide before this one_, and a row of marks saying where the reader is.

A scroll zone has none of those, because it is a shelf that happens to be longer than the room it is in. There is no current item to report — and two rows of thumbnails is a shape a carousel cannot hold at all:

```tsx
<MPScrollZone lines={2} gap={12}>
```

That is a grid rather than a flex row, and deliberately: a wrapping row wraps at the box's edge, and what is wanted here is a fixed number of rows and as many columns as it takes.

## Where the buttons sit decides what happens at an end

`inline` puts them beside the strip, in the layout, so the scroller stops where the button starts and an item is cut off at the button's edge rather than sliding under it. `overlay` puts them over the ends, which keeps every pixel of the box for content and lets an item pass under a button — what a shelf of pictures wants, where the thing under the button is a picture that carries on.

The lane an inline button sits in is held open even while that button has nowhere to go. A lane that came and went would resize the strip under the pointer each time it reached an end, and an emptied lane is not a lighter row — it is the same row reading as stray padding at the edge every reader meets first.

So `buttons="auto"` does two different things, and the difference is what the absence would cost:

| Placement | Nothing overflows | At an end         |
| --------- | ----------------- | ----------------- |
| `inline`  | No buttons        | Drawn, `disabled` |
| `overlay` | No buttons        | Removed           |

`buttons="always"` draws both from the first paint, `disabled` rather than gone at an end. That is what a strip whose content arrives from a fetch wants, so the buttons are not appearing under the pointer half a second in.

## The wheel is the page's until you ask for it

A wheel taken from the page is the page's: a reader who meant to scroll past the shelf is held by it instead, which is the most disliked thing a horizontal strip can do. So `wheel` is off by default.

Turned on, what it takes it gives back at the ends — a strip with nothing left ahead of it is something to scroll past rather than something to be caught in. A trackpad swiping sideways is left alone, because that already scrolls the strip and answering it here would move twice as far as it was asked to. A vertical zone ignores the prop entirely; there the wheel already points the way the strip runs.

## The strip is a tab stop with a name

It has to be one, or a reader with no pointer cannot move it at all. And a tab stop that announces nothing is worse than one that says only what kind of thing it is, so it carries `role="group"` and a name either way.

`label` is what is _in_ the strip — "Categories", "Recent files". Without it the fallback says what it is, in whatever language `locale` names.

Everything the buttons can do, the keyboard can do too. In `hold` mode that includes the hold itself: Enter or Space held on the button travels for as long as it is down, which is the half a pointer-only implementation forgets.

## Dragging waits for the pointer to mean it

Nothing is taken at the press — not the pointer capture, not the document's selection. A press on this strip is far more often a click on a card inside it, so the capture waits until the pointer has moved past a few pixels, which is what keeps a plain click able to select text and focus what it landed on.

Once it has moved, the click that `pointerup` is followed by is swallowed on the way down. Without that, letting go of a drag opens whatever card the strip happened to stop under.

Touch is left alone. A finger already scrolls, and the browser's own scrolling has momentum, rubber-banding and a scrollbar that no handler reproduces.
