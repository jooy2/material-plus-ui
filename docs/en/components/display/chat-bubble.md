---
title: MPChatBubble
order: 12
---

# MPChatBubble

<p class="mp-lede">One message in a conversation: the bubble, and everything a thread hangs around it — an avatar, a sender, a time, a delivery mark, a picture, an unfurled link.</p>

<Demo src="chat-bubble/hero" :minHeight="240" />

::: fw react

```tsx
import { MPChatBubble } from 'material-plus-ui';

<MPChatBubble side="end" variant="filled" time="18:02" status="read">
  Yes — I booked the corner table.
</MPChatBubble>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPChatBubble(
  side: MPChatBubbleSide.end,
  variant: MPVariant.filled,
  time: Text('18:02'),
  status: MPChatBubbleStatus.read,
  child: Text('Yes — I booked the corner table.'),
);
```

:::

## Props

<PropsTable name="MPChatBubble" />

## This is the library's own shape

MD3 does not describe a chat bubble. This is the library's own component in the sense [MPProgressBox](../feedback/progress-box) is — but every part of it is drawn out of the specification's own roles, so a thread of these sits in a Material page without announcing that it is extra.

Two decisions are worth naming.

**The tail is a cut corner, not a triangle.** The corner nearest the speaker drops to `corner-extra-small` while the other three stay at `corner-extra-large`. That says which end of the row the message came from without hanging a shape off a surface that is supposed to have been cut with a straight edge — and because both numbers are tokens, the cut follows <Fw react="[`data-mp-shape`](../../guide/getting-started#shape)" flutter="the theme's `MPShapes`" /> with everything else. It is written as the _logical_ corner, so a thread in Arabic squares the other one without being told.

**The bubble takes the accent.** Unlike a [card](../layout/card), a bubble _is_ the thing being coloured, so `variant` here is the control ladder: `filled` floods it. `text` is the one rung that does not mean "no surface" — a bubble with no surface is not a bubble, so it takes the quietest neutral container instead.

## `side` and `variant` are separate axes

`side` decides which way the row runs and which corner is cut. `variant` decides the emphasis. Nothing ties them together, and that is deliberate:

- Filling the reading-end column is a **convention**, not a law.
- It is a decision about the **product**. A support inbox may want the agent's messages filled rather than the reader's, and a thread that fills neither end is a perfectly good thread.

A caller who wants the usual arrangement writes it once:

::: fw react

```tsx
const mine = message.authorId === me.id;

<MPChatBubble side={mine ? 'end' : 'start'} variant={mine ? 'filled' : 'tonal'}>
  {message.text}
</MPChatBubble>;
```

:::

::: fw flutter

```dart
final bool mine = message.authorId == me.id;

MPChatBubble(
  side: mine ? MPChatBubbleSide.end : MPChatBubbleSide.start,
  variant: mine ? MPVariant.filled : MPVariant.tonal,
  child: Text(message.text),
);
```

:::

## The delivery mark

<Demo src="chat-bubble/status" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/chat-bubble/status.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/chat_bubble/status.dart

:::

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

::: fw react

```tsx
<MPChatBubble status="delivered" locale="ko">
  …
</MPChatBubble>
// announced as "전달됨"
```

:::

::: fw flutter

```dart
MPChatBubble(status: MPChatBubbleStatus.delivered, locale: 'ko', child: message);
// announced as "전달됨"
```

:::

That is the opposite of what [MPDialog](../feedback/dialog) does with `closeLabel`, and the difference is the count. A dialog has one word and one instance; a thread is a column of forty bubbles with five possible words each, and a caller who had to hand those over per message would hand over the English ones. `statusLabel` is still there for the product that calls it something else.

## Examples

<Demo src="chat-bubble/slots" :minHeight="490">

::: fw react

<<< @/.vitepress/demos/chat-bubble/slots.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/chat_bubble/slots.dart

:::

</Demo>

### media

Drawn edge to edge across the top of the bubble, so the bubble's own corners crop it — including the cut one. The padding lives on the text section below rather than on the sheet, which is what makes that possible.

### preview

A link unfurled into a card under the text. Its surface is mixed out of <Fw react="`currentColor`" flutter="the bubble's ink" /> rather than pointed at a role, because it is the one part of a bubble that has to work on both an accent fill and a neutral one: a fixed role would be invisible against one of the two.

::: fw react

The image is `alt=""` on purpose — everything it says is written underneath it — and `newTab` adds `rel="noopener noreferrer"` with the target. The `url` is checked before it is rendered: only `http:`, `https:`, `mailto:`, `tel:` and relative addresses become a link, because a preview's contents come from somebody else.

:::

::: fw flutter

The card has no `url`. Flutter has no navigation of its own, so the card takes an `onPressed`, and where it goes is the app's to decide, there, with whatever checks the app makes on an address a stranger sent. Without `onPressed` the card is not pressable. The picture is left out of the semantics tree, because everything it says is written underneath it.

```dart
MPChatBubblePreview(
  onPressed: () => openIfSafe(link.url),
  site: const Text('m3.material.io'),
  title: const Text('Cards — Material Design 3'),
  image: NetworkImage(link.image),
)
```

:::

### actions

Sits beside the bubble rather than inside it, and stays at zero opacity until the row is hovered or something in it takes focus. A menu trigger sitting permanently in the middle of a conversation is a handle in the way of the reading; a pointer that cannot hover has nothing to reveal it, so on touch it is simply always there. <Fw flutter="In Flutter that is read from the platform: on Android and iOS the actions are always shown." />

### typing

Draws three dots instead of the message and leaves `children` alone, so the same bubble goes back to it when the message arrives:

::: fw react

```tsx
<MPChatBubble typing>{draftThatHasNotArrived}</MPChatBubble>
```

:::

::: fw flutter

```dart
MPChatBubble(typing: true, child: draftThatHasNotArrived);
```

:::

The dots light in sequence and never move — a bubble that bounced while somebody typed would bounce in a thread another reader is scrolling. It is the same wave [MPProgressBox](../feedback/progress-box)'s segments run on, and it stops under <Fw react="`prefers-reduced-motion`" flutter="`MediaQuery.disableAnimations`" />, with the dots resting at 60%.

## Accessibility

::: fw react

- The delivery mark is decorative; the word behind it is in a visually hidden span, so a screen reader hears "Delivered" where a sighted reader sees two ticks.
- The typing dots are a `status` region with the word "Typing" behind them.
- `actions` is a real control outside the bubble, so it is reachable by keyboard even though it is invisible until the row is focused — `group-focus-within` is what reveals it.
- A `preview` is a real link with a visible title, and its picture is `alt=""` because the title and summary already say what it is.
- The bubble itself has no role. A thread is a list, and what wraps these is the caller's — an `<ol>` of `<li>`s, or a `feed`, depending on whether the reader can page back through it.

:::

::: fw flutter

- The delivery mark is a node of its own named by the word, so a screen reader hears "Delivered" where a sighted reader sees two ticks.
- The typing dots are a live region named "Typing".
- `actions` is a real control outside the bubble, reachable by keyboard while it is still transparent; focus anywhere in the row shows it.
- A pressable `preview` is announced as a link, named by its title and summary.
- The bubble itself adds no role. A thread is a list, and what wraps these is the caller's.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `side="end"`, `status="read"` | `MPChatBubbleSide.end`, `MPChatBubbleStatus.read` | Dart's enums for the same words. |
| `preview.url`, `preview.newTab` | `preview.onPressed` | Flutter has no navigation of its own; the app decides where the card goes, and checks the address. |
| `preview.image` as a URL | `preview.image` as an `ImageProvider` | Flutter loads pictures through image providers. |
| `(hover: none)` | Android and iOS | Whether a pointer can hover is read from the platform. |
| `children` | `child` | Flutter's name. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |

:::

## See also

- [MPAvatar](./avatar) — the picture beside the bubble.
- [MPMenu](../inputs/menu) — what usually goes in `actions`.
- [MPCard](../layout/card) — for the same slots on a sheet rather than in a thread.
