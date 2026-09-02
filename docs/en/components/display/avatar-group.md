---
title: MPAvatarGroup
order: 16
---

# MPAvatarGroup

<p class="mp-lede">A stack of avatars, overlapping, with the ones that did not fit as a count.</p>

<Demo src="avatar-group/hero" :minHeight="200" />

```tsx
import { MPAvatarGroup, MPAvatar } from 'material-plus-ui';

<MPAvatarGroup max={4} total={12}>
  <MPAvatar name="Ada Lovelace" />
  <MPAvatar name="Alan Turing" />
</MPAvatarGroup>;
```

## Props

<PropsTable name="MPAvatarGroup" />

## What the group sets once

`size`, `shape`, `variant` and `color` are set **here** rather than on every avatar. A stack whose fourth face is a rung out is not a stack, and repeating four props across six children is four chances per child to get one wrong.

<Demo src="avatar-group/sizes" :minHeight="320">

<<< @/.vitepress/demos/avatar-group/sizes.tsx

</Demo>

An avatar's own prop still wins, which is what lets one of them be marked out from the rest — the person who is speaking, the account that is yours, the one that failed.

It is the same arrangement [MPButtonGroup](../inputs/button-group) makes, out of the same reasoning: the group reads as a **fallback**, so "not set on the group" keeps meaning "use the avatar's own default" rather than turning into one.

## The ring is not decoration

Two circles of similar tone laid over each other have no edge between them at all, and the stack reads as one smeared shape.

The ring is drawn in the page's own `surface`, so what separates the faces is the **background showing through** rather than a white line painted on top of them. On a dark scheme it goes dark with the page, without anybody having to say so.

`isolate` on the group is the other half of it: it makes the first avatar's ring paint against the page rather than against whatever the group happens to be stacked over.

## max and total

`max` is how many are drawn. Everything past it becomes a count — as an avatar rather than as a bare number, because it is the last thing in the stack and has to be the same circle at the same size, or the run ends in something that is not part of it.

`total` is the one worth reaching for. Without it the count is worked out from the children, which is only right when **all** of them were passed:

```tsx
// Forty people, four <img> tags.
<MPAvatarGroup max={4} total={people.length}>
  {people.slice(0, 4).map((person) => (
    <MPAvatar key={person.id} name={person.name} src={person.avatar} />
  ))}
</MPAvatarGroup>
```

## The first avatar is on top

Each avatar is drawn under the one before it. A stack read from the start is therefore read front to back, so the person the group is _about_ comes first rather than last.

That is the **opposite** of the document order — later siblings paint over earlier ones — so every avatar carries a `z-index` counting down from the front. Left to the document it would be back to front, and it would hold only until something in the stack acquired a `z-index` of its own.

The count is the last card in the pile rather than a label on top of it. It is part of the run, and a stack whose final item floated clear of the stacking it belongs to would be a stack with an exception in it.

The depth reaches an avatar through the same context `size` and `shape` do, which is what keeps it off the children a caller passed. A child that is not an `MPAvatar` — a router's link around one, a tooltip's trigger — is not given a depth and keeps the order the document gives it.

Under RTL the whole thing flips on its own: the overlap is a logical margin, not a negative `margin-left`.

## Accessibility

- Each avatar names itself from its own `name`, so the stack is a list of people rather than a row of letters. See [MPAvatar](./avatar#accessibility).
- The `+3` is a count and nothing else — it has no name of its own, because "plus three" is what it says and what it means.
- The group has no role. A stack of faces beside a project's title is decoration for the sentence next to it; wrap it in something that names it when it is not.

```tsx
<div role="group" aria-label="On this project">
  <MPAvatarGroup max={4} total={12}>
    …
  </MPAvatarGroup>
</div>
```

## See also

- [MPAvatar](./avatar) — one face, and everything about what is drawn in it.
- [MPBadge](./badge) — the status dot on an avatar, which is a badge with an avatar in it.
- [MPButtonGroup](../inputs/button-group) — the same "set once for the run" arrangement.
