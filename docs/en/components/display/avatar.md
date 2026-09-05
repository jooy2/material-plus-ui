---
title: MPAvatar
order: 4
---

# MPAvatar

<p class="mp-lede">A picture of a person or a thing, at a known size, that is never an empty box. If the picture is missing or slow, the initials stand in; if there are no initials, a silhouette does.</p>

<Demo src="avatar/hero" :minHeight="140" />

```tsx
import { MPAvatar } from 'material-plus-ui';

<MPAvatar src="/anya.jpg" name="Anya Sol" />
<MPAvatar name="홍길동" color="tertiary" />
<MPAvatar shape="square" variant="outlined" initials="MP" />;
```

## Props

<PropsTable name="MPAvatar" />

Every native `<span>` attribute passes through, and a `ref` reaches the root.

## Three things can be drawn, and exactly one is at a time

The picture, if `src` is given and loads; otherwise whatever stands in for it — `children`, or `initials`, or the initials derived from `name`; and failing all of those, a silhouette.

Which one is showing is Base UI's `Avatar` to decide, because "has the image loaded" is a question with four answers and a race in the middle of it. `onLoadingStatusChange` reports them, and `delay` holds the fallback back for roughly the time a cached image takes so the initials stop flashing up in front of a picture that was about to arrive anyway.

## `name` does three jobs

It names the picture, the initials are derived from it, and it is the sentence a screen reader hears **instead of** those initials.

That last one is the point. `JD` read out loud is two letters, not a person — so when there is a name, the name becomes the fallback's accessible name and the initials are left as the picture they are standing in for.

The rule is the first character of the first word plus the first of the last:

| `name`         | Initials |
| -------------- | -------- |
| `Jane Doe`     | `JD`     |
| `Ada Lovelace` | `AL`     |
| `홍길동`       | `홍`     |
| `🚀 Team`      | `🚀T`    |

One word gives one character on purpose: Korean, Japanese and Chinese names are a single token, and two of their characters at 32px is a smudge where one is a name. Astral characters are not cut in half between their two code units, and a name whose accents arrived decomposed — which is what a macOS filename and a good many APIs hand you — yields `Ä` rather than a bare `A`.

When the rule gets it wrong, `initials` writes them out.

## Examples

### size

The control heights, so an avatar and the button beside it in a toolbar are the same height.

<Demo src="avatar/sizes" :minHeight="160">

<<< @/.vitepress/demos/avatar/sizes.tsx

</Demo>

The initials are sized off the box rather than off the row — roughly 40% of the diameter, which is where two characters fill the width without touching the edge. The steps are still Material roles rather than interpolated sizes.

### shape

`circle` is the default, and it is what Material draws. `square` cuts the corners off instead at `corner-medium`, which is what a logo or a repository icon wants: those are drawn to the edges of a rectangle and a round crop eats them.

### variant

`tonal` is the default because it is what MD3 draws a monogram on: the container tone of the accent family, with the matching `on-` ink. A page of `filled` avatars is a page of saturated circles nobody can read a name off.

## It carries no status dot

An avatar with a green mark on it is an [MPBadge](./badge) with an avatar in it, and inventing a second spelling for that would give the library two of them.

```tsx
<MPBadge dot color="tertiary" overlap="circle" placement="bottom-end" label="Online">
  <MPAvatar name="Jane Doe" />
</MPBadge>
```

## See also

- [MPBadge](./badge) — the mark in the corner.
- [MPList](./list) — where an avatar usually ends up, in `startIcon`.
