---
title: MPAspectRatio
order: 1
---

# MPAspectRatio

<p class="mp-lede">A box that keeps a proportion whatever width it is given. It draws nothing — what it does is reserve the space, so a card whose image arrives late does not reflow the page around it.</p>

<Demo src="aspect-ratio/hero" :minHeight="180" />

```tsx
import { MPAspectRatio } from 'material-plus-ui';

<MPAspectRatio ratio="16 / 9" rounded>
  <img src={cover} alt="" />
</MPAspectRatio>;
```

## Props

<PropsTable name="MPAspectRatio" />

## What it is for

Material's layout guidance is built on a grid whose rows line up. The single most common way a real page stops lining up is **media of unknown height** arriving after the text around it has already been laid out — the browser reflows, everything below jumps, and whatever the reader was about to click has moved.

Reserving the space is the fix, and it is a fix that costs nothing at runtime: the proportion is CSS's own `aspect-ratio`, so the box is the right height before a single byte of the image has been downloaded.

A row of thumbnails is also a row of one shape, which is the other half of why this exists.

## Why the ratio is written the way CSS writes it

`ratio={1.5}` and `ratio="16 / 9"` both reach `aspect-ratio` untouched.

There is no `{ width: 16, height: 9 }` object and no `"16:9"` string to translate, because a caller who already knows the CSS has nothing to look up — and a caller who does not is one search away from a page that explains the real thing rather than this library's spelling of it.

## `fit`

The one convenience on top of the proportion. The media inside is stretched to the full box and _then_ fitted, which is the pair of declarations every use of this component would otherwise start with.

<Demo src="aspect-ratio/fit" :minHeight="200">

<<< @/.vitepress/demos/aspect-ratio/fit.tsx

</Demo>

The values are `object-fit`'s own — `cover`, `contain`, `fill`, `none` — for the same reason the ratio is: inventing `fill-the-box` would only make a reader look up which CSS it maps to.

It reaches an `img`, a `video`, a `canvas`, an `svg`, a `picture` or an `iframe` that is a **direct child**. Anything else is laid out normally and the prop does not touch it, so a box holding a `<div>` of your own is simply a box with a proportion.

`iframe` takes the sizing and not the fit: an embed lays its own content out, and `object-fit` has nothing to act on.

## `rounded`

Off by default, because a layout component draws nothing and a photograph with its corners cut is a decision about the photograph. It is such a common decision, though, that making the caller reach for a `className` would be perverse.

`md` lands on `corner-medium`, which is MD3's own card corner — a photograph inside a card should have the card's corner, not one of its own.

`overflow-hidden` is always on, `rounded` or not. Without it a `cover` image spills out of the proportion it was just given, and the box would only be reserving space rather than holding anything to it.

## Examples

### render

Base UI's escape hatch, so the box can be the element it semantically is:

```tsx
<MPAspectRatio ratio="4 / 3" render={<figure />}>
  <img src={photo} alt="The harbour at dawn" />
</MPAspectRatio>
```

### A card's cover

The pattern this is used for most:

```tsx
<div className="rounded-mp-md bg-mp-surface-container overflow-hidden">
  <MPAspectRatio ratio="16 / 9">
    <img src={cover} alt="" />
  </MPAspectRatio>
  <div className="p-4">…</div>
</div>
```

Note that the box is _not_ `rounded` here — the surface around it already is, and two radii on the same corner is one too many.

## Accessibility

There is nothing to announce. The box is a `<div>` with a computed height, and it is deliberately not `role="img"`: what carries the meaning is whatever is inside, and its `alt` is where that belongs.

An image that is decoration under a heading that already says the same thing takes `alt=""`, exactly as it would without this component.

## See also

- [MPSkeleton](../feedback/skeleton) — the same idea for content that is on its way rather than media that is.
- [MPAvatar](../display/avatar) — a fixed-size circle, for when the shape is a person rather than a proportion.
