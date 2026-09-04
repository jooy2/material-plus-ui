---
title: MPAppLogo
order: 25
---

# MPAppLogo

<p class="mp-lede">A product's mark, at a known size, that is never an empty box. Artwork, an image, a pair of initials or the name itself — whichever of those exists, framed the way the mark was drawn to be framed.</p>

<Demo src="app-logo/hero" :minHeight="260" />

```tsx
import { MPAppLogo } from 'material-plus-ui';

<MPAppLogo name="Voltage" shape="app" href="/" showName>
  <BoltIcon />
</MPAppLogo>;
```

## Props

<PropsTable name="MPAppLogo" />

## Four things can be the mark, and one of them is

In this order: markup handed to `children`, an image at `src`, the initials of `name` on a tile, or — with no tile to put them on — the name itself, set as the logotype.

That last one is the point of the component. A product that has not drawn a logo yet still has one:

```tsx
<MPAppLogo name="Voltage" />
```

and swapping it for the real file later is one prop.

## What it adds over an `<img>`

The framing, which is the one decision an image tag cannot make for you. A mark drawn as a bare glyph and a mark drawn with its own background need opposite treatment, and which of the two a given file is cannot be worked out from the file.

So `shape` is a decision made once at the call site:

| `shape` | What it draws |
| --- | --- |
| `bare` | The artwork as given, at the height `size` asks for, in whatever width its own proportions come to. No tile. |
| `app` | A filled tile with the corners cut off and the artwork inset in it. |
| `circle` | The same tile, round. |

`bare` is the default because a logo file very often has the product's name set into it, and squeezing a wordmark into a square is worse than any tile is good. There is no `square`: a tile with the corners left on is the one shape MD3 does not draw, and at `xs` an `app` icon is already close enough to one that a fourth value would be invisible.

## The inset is a share of the artwork, not padding on the tile

Which matters as soon as the name is drawn beside the mark. A percentage padding resolves against the containing block's width — the whole lockup — so the same icon would be inset by 4px on its own and by 11px with "Voltage" next to it, and the inset would grow with the length of the name.

A percentage height on the artwork resolves against the tile, which is the box it is actually being held off the edges of, and it stays right at any `height`.

Turn `padded` off for a mark drawn to fill its tile: a favicon, a photograph.

## The name is in the document exactly once

Which element carries it depends on what the mark turned out to be.

- A **logotype** _is_ the name.
- An **image** carries it as `alt`.
- A **glyph** and a pair of **initials** say nothing at all, so those are the cases a clipped copy is for.

And whenever the words are drawn — `showName` — the mark becomes decoration rather than a second reading of the same thing. "VE" read out is two letters, not a product.

`showName` is ignored when the name is already the whole logo, because a bare logotype with the name beside it is the name twice.

## `href` rather than a wrapper

A logo in a header is nearly always the way back to the front page, and a `<span>` inside an `<a>` the caller wrote is the same thing with one more element in it — one that has to be given the focus ring and the pointer by hand.

For a router's own link, `render` takes it:

```tsx
<MPAppLogo name="Voltage" render={<Link to="/" />} />
```

## What it does not carry

No tagline, no version, no elevation.

A logo with a line of text under it is a logo next to an [MPTypography](./typography), and a second spelling for that would give the library two of them.

Elevation is left out for a sharper reason. The prop moves tone as well as shadow everywhere else it appears, because that is what MD3's levels are — and a logo tile's tone is the accent, so there is nothing for it to move to. An app icon is a sticker on the page rather than a thing hovering over it.
