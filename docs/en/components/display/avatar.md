---
title: MPAvatar
order: 4
---

# MPAvatar

<p class="mp-lede">A picture of a person or a thing, at a known size, that is never an empty box. If the picture is missing or slow, the initials stand in; if there are no initials, a silhouette does.</p>

<Demo src="avatar/hero" :minHeight="140" />

::: fw react

```tsx
import { MPAvatar } from 'material-plus-ui';

<MPAvatar src="/anya.jpg" name="Anya Sol" />
<MPAvatar name="홍길동" color="tertiary" />
<MPAvatar shape="square" variant="outlined" initials="MP" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAvatar(image: NetworkImage('/anya.jpg'), name: 'Anya Sol');
const MPAvatar(name: '홍길동', color: MPColor.tertiary);
const MPAvatar(shape: MPAvatarShape.square, variant: MPVariant.outlined, initials: 'MP');
```

:::

## Props

<PropsTable name="MPAvatar" />

::: fw react

Every native `<span>` attribute passes through, and a `ref` reaches the root.

:::

## Three things can be drawn, and exactly one is at a time

The picture, if `src` (`image` in Flutter) is given and loads; otherwise whatever stands in for it — `children` (`child`), or `initials`, or the initials derived from `name`; and failing all of those, a silhouette.

Which one is showing is Base UI's `Avatar` to decide in React, and the `Image` widget's frame and error builders in Flutter, because "has the image loaded" is a question with four answers and a race in the middle of it. `onLoadingStatusChange` reports them, and `delay` holds the fallback back for roughly the time a cached image takes so the initials stop flashing up in front of a picture that was about to arrive anyway.

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

::: fw react

## A long list of them

By default the picture is fetched by a script once the page has hydrated, and drawn when it has arrived. That keeps a broken picture from ever showing, and it costs a page of fifty avatars something: none of the fifty is in the server's markup, the browser's preload scanner never sees them, and `loading="lazy"` is ignored — all fifty download the moment the page hydrates, alongside the page's own largest picture. `keepMounted` makes each one an `<img>` from the start, loaded by the browser on its own terms, with the initials under it until it arrives:

```tsx
<MPAvatar src={person.photo} name={person.name} keepMounted imageProps={{ loading: 'lazy' }} />
```

It needs `@base-ui/react` 1.8 or later.

:::

::: fw flutter

## A long list of them

The picture is decoded at the size of the box rather than the size of the file, which is the difference between a few hundred kilobytes and several megabytes for every avatar in a list. In a `ListView.builder` an avatar is only built once its row scrolls near, so a list of fifty does not ask for fifty pictures at once.

:::

## Examples

### size

The control heights, so an avatar and the button beside it in a toolbar are the same height.

<Demo src="avatar/sizes" :minHeight="160">

::: fw react

<<< @/.vitepress/demos/avatar/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/avatar/sizes.dart

:::

</Demo>

The initials are sized off the box rather than off the row — roughly 40% of the diameter, which is where two characters fill the width without touching the edge. The steps are still Material roles rather than interpolated sizes.

### shape

`circle` is the default, and it is what Material draws. `square` cuts the corners off instead, at `corner-medium` from `md` up and at `corner-extra-small` and `corner-small` on the two smaller rungs, which is what a logo or a repository icon wants: those are drawn to the edges of a rectangle and a round crop eats them.

### variant

`tonal` is the default because it is what MD3 draws a monogram on: the container tone of the accent family, with the matching `on-` ink. A page of `filled` avatars is a page of saturated circles nobody can read a name off.

## It carries no status dot

An avatar with a green mark on it is an [MPBadge](./badge) with an avatar in it, and inventing a second spelling for that would give the library two of them.

::: fw react

```tsx
<MPBadge dot color="tertiary" overlap="circle" placement="bottom-end" label="Online">
  <MPAvatar name="Jane Doe" />
</MPBadge>
```

:::

::: fw flutter

```dart
const MPBadge(
  dot: true,
  color: MPColor.tertiary,
  overlap: MPBadgeOverlap.circle,
  placement: MPCorner.bottomEnd,
  label: 'Online',
  child: MPAvatar(name: 'Jane Doe'),
)
```

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `src`, `srcSet` | `image`, an `ImageProvider` | Every Flutter picture is a provider. Picking a resolution is the provider's job: an `AssetImage` reads the device's pixel ratio. |
| `alt` | `semanticLabel` | Flutter's name for what a screen reader announces. |
| `delay` in milliseconds | `Duration?` | Flutter's type for a length of time. |
| `keepMounted`, `imageProps` | — | Both answer how a browser fetches an `<img>`. A Flutter picture is fetched by its provider, and only once the avatar is built. |
| a name whose accents arrived decomposed | the first code point | Dart has no Unicode normalisation built in, so `A` and a combining mark give `A`. Pass `initials` when it matters. |
| `transition` | — | The entrance belongs to an animation widget wrapped round the avatar. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPBadge](./badge) — the mark in the corner.
- [MPList](./list) — where an avatar usually ends up, in `startIcon`.
