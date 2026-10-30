---
title: MPBadge
order: 5
---

# MPBadge

<p class="mp-lede">A small mark in the corner of something else: unread mail on an inbox icon, a status dot on an avatar, a count on a tab. With no children it lays out inline instead, which is what a standalone status pill is.</p>

<Demo src="badge/hero" :minHeight="120" />

::: fw react

```tsx
import { MPBadge } from 'material-plus-ui';

<MPBadge content={3} label="3 unread messages">
  <MPButton>Inbox</MPButton>
</MPBadge>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPBadge(
  content: 3,
  label: '3 unread messages',
  child: MPButton(onPressed: openInbox, child: const Text('Inbox')),
);
```

:::

## Props

<PropsTable name="MPBadge" />

::: fw react

Every native `<span>` attribute passes through, and a `ref` reaches the marker.

:::

::: fw flutter

`content` is typed `Object?`, because Dart has no union type: an `int` or a `double` is a count that `max` and `showZero` apply to, a `String` is a word, and a widget is drawn as it is. Anything else fails an assertion in debug.

:::

## `color` defaults to `error`

This is the one component in the library that does, and it is not a stylistic choice. MD3 gives the badge exactly one colour pair — `error` under `on-error` — because a badge exists to be noticed, and the error palette is the one palette in the system guaranteed to be loud whatever the source colour is. A count in the brand colour on a brand-coloured app bar is a count nobody sees.

## The dot and the count are Material's two badges

MD3 has a small badge (a 6dp dot) and a large one (16dp with a label), and that is the whole set. `dot` gives you the first; `content` gives you the second. A badge with neither is hidden, as a count of zero is.

`dot` with `content` is a middle ground rather than a new shape: the marker draws as a dot and the content stays for screen readers only. A quiet corner is not a silent one.

<Demo src="badge/counts">

::: fw react

<<< @/.vitepress/demos/badge/counts.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/badge/counts.dart

:::

</Demo>

## Zero is not news

A `content` of `0` hides the badge, because a badge that never goes away stops meaning anything. `showZero` puts it back for the counter that genuinely has to read zero.

`invisible` is the other way to hide one, and it is different: the marker keeps its box, so showing it again does not relayout what it sits on.

It also **grows in and shrinks back out**, which is MD3's own arrival for a badge — a count that simply appeared would be a count nobody saw change.

::: fw react

`visibility` is still what hides it, alongside the scale rather than replaced by it, and it does two things opacity cannot. A badge parked at `opacity: 0` is still visible to find-on-page, and a marker that says nothing should not turn up in a search for "3". And `visibility` interpolates in exactly the shape this needs: on the way in it becomes visible at the first frame, and on the way out it stays visible until the last — so the marker is drawn for the whole of both animations and hidden for neither.

Which is why an `invisible` badge keeps its count in the DOM: an element with nothing inside it has no size to shrink from, and would collapse to an empty pill in one frame and then animate that. It stays out of a page search and out of the accessibility tree while it is away. A badge with nothing to say holds nothing at all — that is not a badge being hidden, it is a badge that was never there.

:::

::: fw flutter

The scale and the fade both run over `short4`, and not at all when `MediaQuery.disableAnimations` is set. A hidden badge is left out of the semantics tree, and a badge never takes a tap: a press on it belongs to whatever it is pinned to. An `invisible` badge keeps its count, so it has a size to shrink from and to grow back into.

:::

## `label` is the sentence

A `content` of `3` beside a bell reads out as "3", which means nothing. `label` is what a screen reader hears instead, and the visible count is hidden from it so the two are not read one after the other.

::: fw react

```tsx
<MPBadge content={3} label="3 unread notifications">
  <BellIcon />
</MPBadge>
```

:::

::: fw flutter

```dart
const MPBadge(content: 3, label: '3 unread notifications', child: BellGlyph())
```

:::

## The only pill that is not a button

`corner-full`, at every size. MD3 shapes a badge as a full circle or a stadium because it is a mark _laid on_ a surface rather than a surface of its own, and a mark has no edge to cut. It is also the only component in the library that overlaps its neighbour, for the same reason.

`overlap` is how far it tucks in. A circle's corner is about 15% of its diameter inside the bounding box the badge is positioned against, so a badge that looks right on an avatar hangs off an icon button without it.

## No primitive underneath

A badge has no interaction, no state and no keyboard contract. It is a mark. Wiring it to a widget primitive would hand every decorative dot a role it cannot honour.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `content` as a `ReactNode` | `Object?` | Dart has no union type, so a number, a `String` and a widget share one parameter, checked in debug. |
| `visibility` while hidden | `ExcludeSemantics` | There is no find-on-page to keep a hidden count out of; the semantics tree is what it is kept out of. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPAvatar](./avatar) — the usual thing in the corner of.
- [MPChip](./chip) — when the mark is a token you can press.
