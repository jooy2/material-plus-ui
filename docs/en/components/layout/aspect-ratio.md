---
title: MPAspectRatio
order: 1
---

# MPAspectRatio

<p class="mp-lede">A box that keeps a proportion whatever width it is given. It draws nothing — what it does is reserve the space, so a card whose image arrives late does not reflow the page around it.</p>

<Demo src="aspect-ratio/hero" :minHeight="220" />

::: fw react

```tsx
import { MPAspectRatio } from 'material-plus-ui';

<MPAspectRatio ratio="16 / 9" rounded>
  <img src={cover} alt="" />
</MPAspectRatio>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAspectRatio(
  ratio: 16 / 9,
  fit: MPAspectFit.cover,
  rounded: true,
  child: Image(image: cover),
);
```

:::

## Props

<PropsTable name="MPAspectRatio" />

## What it is for

Material's layout guidance is built on a grid whose rows line up. The single most common way a real page stops lining up is **media of unknown height** arriving after the text around it has already been laid out — the browser reflows, everything below jumps, and whatever the reader was about to click has moved.

Reserving the space is the fix, and it is a fix that costs nothing at runtime: the proportion is CSS's own `aspect-ratio`, so the box is the right height before a single byte of the image has been downloaded.

A row of thumbnails is also a row of one shape, which is the other half of why this exists.

::: fw react

## Why the ratio is written the way CSS writes it

`ratio={1.5}` and `ratio="16 / 9"` both reach `aspect-ratio` untouched.

There is no `{ width: 16, height: 9 }` object and no `"16:9"` string to translate, because a caller who already knows the CSS has nothing to look up — and a caller who does not is one search away from a page that explains the real thing rather than this library's spelling of it.

:::

::: fw flutter

## The ratio is a division

`ratio: 16 / 9` is width over height, written the way Flutter's own `AspectRatio` takes it, so a caller who knows the framework has nothing to translate. The box is the right height before a byte of the picture has arrived, because the height is worked out from the width it was given.

:::

## `fit`

The one convenience on top of the proportion. The media inside is stretched to the full box and _then_ fitted, which is the pair of declarations every use of this component would otherwise start with.

<Demo src="aspect-ratio/fit" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/aspect-ratio/fit.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/aspect_ratio/fit.dart

:::

</Demo>

The values are `object-fit`'s own — `cover`, `contain`, `fill`, `none`, `scale-down` — for the same reason the ratio is: inventing `fill-the-box` would only make a reader look up which CSS it maps to.

::: fw react

It reaches an `img`, a `video`, a `canvas`, an `svg`, a `picture` or an `iframe` that is a **direct child**. Anything else is laid out normally and the prop does not touch it, so a box holding a `<div>` of your own is simply a box with a proportion.

`iframe` takes the sizing and not the fit: an embed lays its own content out, and `object-fit` has nothing to act on.

:::

::: fw flutter

In Dart they are `MPAspectFit.cover` to `MPAspectFit.scaleDown`, and they land on Flutter's `BoxFit` one for one.

**`fit` is `null` by default**, where React's is `cover`. A browser applies `object-fit` to an image or a video and leaves a box of text alone; Flutter has no such line, and a fit is a `FittedBox` round whatever the child is. A default that scaled a paragraph would be a default nobody wanted, so the fit is asked for. Left out, the child is laid out to the full box as it is, and an `Image` with its own `fit` needs nothing here.

:::

## `rounded`

Off by default, because a layout component draws nothing and a photograph with its corners cut is a decision about the photograph. It is such a common decision, though, that making the caller reach for a `className` would be perverse.

`md` lands on `corner-medium`, which is MD3's own card corner — a photograph inside a card should have the card's corner, not one of its own.

The box always clips what it holds, `rounded` or not. Without it a `cover` image spills out of the proportion it was just given, and the box would only be reserving space rather than holding anything to it.

## Examples

::: fw react

### render

Base UI's escape hatch, so the box can be the element it semantically is:

```tsx
<MPAspectRatio ratio="4 / 3" render={<figure />}>
  <img src={photo} alt="The harbour at dawn" />
</MPAspectRatio>
```

:::

### A card's cover

The pattern this is used for most:

::: fw react

```tsx
<div className="rounded-mp-md bg-mp-surface-container overflow-hidden">
  <MPAspectRatio ratio="16 / 9">
    <img src={cover} alt="" />
  </MPAspectRatio>
  <div className="p-4">…</div>
</div>
```

:::

::: fw flutter

```dart
MPBox(
  variant: MPVariant.tonal,
  padded: false,
  clipBehavior: Clip.antiAlias,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: <Widget>[
      MPAspectRatio(ratio: 16 / 9, fit: MPAspectFit.cover, child: Image(image: cover)),
      const Padding(padding: EdgeInsets.all(16), child: Text('…')),
    ],
  ),
)
```

:::

Note that the box is _not_ `rounded` here — the surface around it already is, and two radii on the same corner is one too many.

## Accessibility

::: fw react

There is nothing to announce. The box is a `<div>` with a computed height, and it is deliberately not `role="img"`: what carries the meaning is whatever is inside, and its `alt` is where that belongs.

An image that is decoration under a heading that already says the same thing takes `alt=""`, exactly as it would without this component.

:::

::: fw flutter

There is nothing to announce. The box adds no node to the semantics tree: what carries the meaning is the picture inside, and its `semanticLabel` is where that belongs. A picture that is decoration under a heading that already says the same thing takes `excludeFromSemantics: true`.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `ratio` as a number or a CSS ratio string | `double`, width over height | A division is how Flutter states a proportion everywhere else. |
| `fit` defaults to `cover` and reaches media only | `fit` defaults to `null` and reaches any child | Flutter cannot tell an image from a box of text, and a default fit would scale text. |
| `render` | — | There is no element to replace. |

:::

## See also

- [MPSkeleton](../feedback/skeleton) — the same idea for content that is on its way rather than media that is.
- [MPAvatar](../display/avatar) — a fixed-size circle, for when the shape is a person rather than a proportion.
