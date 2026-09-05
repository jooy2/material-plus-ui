---
title: MPChatBubble
order: 12
---

# MPChatBubble

<p class="mp-lede">One message in a conversation: the bubble, and everything a thread hangs around it — an avatar, a sender, a time, a delivery mark, a picture, an unfurled link.</p>

<Demo src="chat-bubble/hero" :minHeight="240" />

```tsx
import { MPChatBubble } from 'material-plus-ui';

<MPChatBubble side="end" variant="filled" time="18:02" status="read">
  Yes — I booked the corner table.
</MPChatBubble>;
```

## Props

<PropsTable name="MPChatBubble" />

## This is the library's own shape

MD3 does not describe a chat bubble. This is the library's own component in the sense [MPProgressBox](../feedback/progress-box) is — but every part of it is drawn out of the specification's own roles, so a thread of these sits in a Material page without announcing that it is extra.

Two decisions are worth naming.

**The tail is a cut corner, not a triangle.** The corner nearest the speaker drops to `corner-extra-small` while the other three stay at `corner-extra-large`. That says which end of the row the message came from without hanging a shape off a surface that is supposed to have been cut with a straight edge — and because both numbers are tokens, the cut follows [`data-mp-shape`](../../guide/getting-started#shape) with everything else. It is written as the _logical_ corner, so a thread in Arabic squares the other one without being told.

**The bubble takes the accent.** Unlike a [card](../layout/card), a bubble _is_ the thing being coloured, so `variant` here is the control ladder: `filled` floods it. `text` is the one rung that does not mean "no surface" — a bubble with no surface is not a bubble, so it takes the quietest neutral container instead.

## `side` and `variant` are separate axes

`side` decides which way the row runs and which corner is cut. `variant` decides the emphasis. Nothing ties them together, and that is deliberate:

- Filling the reading-end column is a **convention**, not a law.
- It is a decision about the **product**. A support inbox may want the agent's messages filled rather than the reader's, and a thread that fills neither end is a perfectly good thread.

A caller who wants the usual arrangement writes it once:

```tsx
const mine = message.authorId === me.id;

<MPChatBubble side={mine ? 'end' : 'start'} variant={mine ? 'filled' : 'tonal'}>
  {message.text}
</MPChatBubble>;
```

## The delivery mark

<Demo src="chat-bubble/status" :minHeight="320">

<<< @/.vitepress/demos/chat-bubble/status.tsx

</Demo>

Four of the five are a ladder and the fifth is not on it: `failed` is the message that did not go, which is why it is the only one drawn in another colour family.

| `status`    | Mark            | Colour               |
| ----------- | --------------- | -------------------- |
| `sending`   | a clock         | `on-surface-variant` |
| `sent`      | one tick        | `on-surface-variant` |
| `delivered` | two ticks       | `on-surface-variant` |
| `read`      | two ticks       | the accent           |
| `failed`    | the error glyph | `error`              |

Only two carry a colour, and that is the whole point of the table: a thread where every message is marked in colour is a thread where the colour has stopped meaning anything.

`delivered` and `read` share a mark because they have to be told apart at 12px, in a column, side by side — two ticks overlapping by a third of their width is what says "two" without doubling the width of the mark.

Left out entirely, nothing is drawn. A received message has no delivery state worth showing.

## The words are translated, not passed in

Every mark is silent to a sighted reader and read out to everybody else, and the word behind it comes from this library's own [message table](../../design/localization) rather than from a prop:

```tsx
<MPChatBubble status="delivered" locale="ko">
  …
</MPChatBubble>
// announced as "전달됨"
```

That is the opposite of what [MPDialog](../feedback/dialog) does with `closeLabel`, and the difference is the count. A dialog has one word and one instance; a thread is a column of forty bubbles with five possible words each, and a caller who had to hand those over per message would hand over the English ones. `statusLabel` is still there for the product that calls it something else.

## Examples

<Demo src="chat-bubble/slots" :minHeight="490">

<<< @/.vitepress/demos/chat-bubble/slots.tsx

</Demo>

### media

Drawn edge to edge across the top of the bubble, so the bubble's own corners crop it — including the cut one. The padding lives on the text section below rather than on the sheet, which is what makes that possible.

### preview

A link unfurled into a card under the text. Its surface is mixed out of `currentColor` rather than pointed at a role, because it is the one part of a bubble that has to work on both an accent fill and a neutral one: a fixed role would be invisible against one of the two.

The image is `alt=""` on purpose — everything it says is written underneath it — and `newTab` adds `rel="noopener noreferrer"` with the target.

### actions

Sits beside the bubble rather than inside it, and stays at zero opacity until the row is hovered or something in it takes focus. A menu trigger sitting permanently in the middle of a conversation is a handle in the way of the reading; a pointer that cannot hover has nothing to reveal it, so on touch it is simply always there.

### typing

Draws three dots instead of the message and leaves `children` alone, so the same bubble goes back to it when the message arrives:

```tsx
<MPChatBubble typing>{draftThatHasNotArrived}</MPChatBubble>
```

The dots light in sequence and never move — a bubble that bounced while somebody typed would bounce in a thread another reader is scrolling. It is the same `mp-wave` keyframe [MPProgressBox](../feedback/progress-box)'s segments run on, and it stops under `prefers-reduced-motion`.

## Accessibility

- The delivery mark is decorative; the word behind it is in a visually hidden span, so a screen reader hears "Delivered" where a sighted reader sees two ticks.
- The typing dots are a `status` region with the word "Typing" behind them.
- `actions` is a real control outside the bubble, so it is reachable by keyboard even though it is invisible until the row is focused — `group-focus-within` is what reveals it.
- A `preview` is a real link with a visible title, and its picture is `alt=""` because the title and summary already say what it is.
- The bubble itself has no role. A thread is a list, and what wraps these is the caller's — an `<ol>` of `<li>`s, or a `feed`, depending on whether the reader can page back through it.

## See also

- [MPAvatar](./avatar) — the picture beside the bubble.
- [MPMenu](../inputs/menu) — what usually goes in `actions`.
- [MPCard](../layout/card) — for the same slots on a sheet rather than in a thread.
