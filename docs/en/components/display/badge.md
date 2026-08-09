---
title: MPBadge
order: 5
---

# MPBadge

<p class="mp-lede">A small mark in the corner of something else: unread mail on an inbox icon, a status dot on an avatar, a count on a tab. With no children it lays out inline instead, which is what a standalone status pill is.</p>

<Demo src="badge/hero" :minHeight="120" />

```tsx
import { MPBadge } from 'material-plus-ui';

<MPBadge content={3} label="3 unread messages">
  <MPButton>Inbox</MPButton>
</MPBadge>;
```

## Props

<PropsTable name="MPBadge" />

Every native `<span>` attribute passes through, and a `ref` reaches the marker.

## `color` defaults to `error`

This is the one component in the library that does, and it is not a stylistic choice. MD3 gives the badge exactly one colour pair — `error` under `on-error` — because a badge exists to be noticed, and the error palette is the one palette in the system guaranteed to be loud whatever the source colour is. A count in the brand colour on a brand-coloured app bar is a count nobody sees.

## The dot and the count are Material's two badges

MD3 has a small badge (a 6dp dot) and a large one (16dp with a label), and that is the whole set. Omitting `content` gives you the first; passing it gives you the second.

`dot` is the third case and it is a middle ground rather than a new shape: the marker draws as a dot and the content stays for screen readers only. A quiet corner is not a silent one.

<Demo src="badge/counts">

<<< @/.vitepress/demos/badge/counts.tsx

</Demo>

## Zero is not news

`content={0}` hides the badge, because a badge that never goes away stops meaning anything. `showZero` puts it back for the counter that genuinely has to read zero.

`invisible` is the other way to hide one, and it is different: the marker keeps its box, so showing it again does not relayout what it sits on. Both use `visibility` rather than opacity — a half-faded badge is a badge you have to squint at to find out whether it is there.

A hidden badge holds no text at all. Text left behind in a clipped box is text a search on the page still finds.

## `label` is the sentence

`content={3}` beside a bell reads out as "3", which means nothing. `label` is what a screen reader hears instead, and the visible count is hidden from it so the two are not read one after the other.

```tsx
<MPBadge content={3} label="3 unread notifications">
  <BellIcon />
</MPBadge>
```

## The only pill that is not a button

`corner-full`, at every size. MD3 shapes a badge as a full circle or a stadium because it is a mark _laid on_ a surface rather than a surface of its own, and a mark has no edge to cut. It is also the only component in the library that overlaps its neighbour, for the same reason.

`overlap` is how far it tucks in. A circle's corner is about 15% of its diameter inside the bounding box the badge is positioned against, so a badge that looks right on an avatar hangs off an icon button without it.

## No primitive underneath

A badge has no interaction, no state and no keyboard contract. It is a mark. Wiring it to a widget primitive would hand every decorative dot a role it cannot honour.

## See also

- [MPAvatar](./avatar) — the usual thing in the corner of.
- [MPChip](./chip) — when the mark is a token you can press.
