---
title: MPAppLogo
order: 25
---

# MPAppLogo

<p class="mp-lede">A product's mark, at a known size, that is never an empty box. Artwork, an image, a pair of initials or the name itself — whichever of those exists, framed the way the mark was drawn to be framed.</p>

<Demo src="app-logo/hero" :minHeight="300" />

::: fw react

```tsx
import { MPAppLogo } from 'material-plus-ui';

<MPAppLogo name="Voltage" shape="app" href="/" showName>
  <BoltIcon />
</MPAppLogo>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAppLogo(
  name: 'Voltage',
  shape: MPAppLogoShape.app,
  href: '/',
  onPressed: goHome,
  showName: true,
  child: const BoltGlyph(),
);
```

:::

## Props

<PropsTable name="MPAppLogo" />

## Four things can be the mark, and one of them is

In this order: markup handed to `children` (`child` in Flutter), an image at `src` (`image`), the initials of `name` on a tile, or — with no tile to put them on — the name itself, set as the logotype.

That last one is the point of the component. A product that has not drawn a logo yet still has one:

::: fw react

```tsx
<MPAppLogo name="Voltage" />
```

:::

::: fw flutter

```dart
const MPAppLogo(name: 'Voltage')
```

:::

And swapping it for the real file later is one prop.

## What it adds over an `<img>`

The framing, which is the one decision an image tag cannot make for you. A mark drawn as a bare glyph and a mark drawn with its own background need opposite treatment, and which of the two a given file is cannot be worked out from the file.

So `shape` is a decision made once at the call site:

| `shape` | What it draws |
| --- | --- |
| `bare` | The artwork as given, at the height `size` asks for, in whatever width its own proportions come to. No tile. |
| `app` | A filled tile with the corners cut off and the artwork inset in it. |
| `circle` | The same tile, round. |

`bare` is the default because a logo file very often has the product's name set into it, and squeezing a wordmark into a square is worse than any tile is good. There is no `square`: a tile with the corners left on is the one shape MD3 does not draw, and at `xs` an `app` icon is already close enough to one that a fourth value would be invisible.

### The width of a `bare` mark before its file arrives

A `bare` mark takes its width from the file, and until the file has arrived it has none. The mark is drawn zero pixels wide, and the name beside it, and anything after the logo in the header, moves along when the picture lands.

::: fw react

Give the `<img>` the file's own size and the browser reserves the width from the ratio of the two:

```tsx
<MPAppLogo src="/logo.svg" name="Voltage" showName imageProps={{ width: 160, height: 40 }} />
```

:::

::: fw flutter

Pass the picture as `child`, an `Image` with the file's own size, and the mark reserves the width from the ratio of the two:

```dart
const MPAppLogo(
  name: 'Voltage',
  showName: true,
  child: Image(image: NetworkImage('/logo.png'), width: 160, height: 40),
)
```

:::

The numbers only set the proportions. The height is still the one `size` or `height` asks for, so a 160 by 40 file drawn at `md` is reserved 224 pixels wide. A tile does not need them: `app` and `circle` are square whatever the file is.

## The inset is a share of the artwork, not padding on the tile

::: fw react

Which matters as soon as the name is drawn beside the mark. A percentage padding resolves against the containing block's width — the whole lockup — so the same icon would be inset by 4px on its own and by 11px with "Voltage" next to it, and the inset would grow with the length of the name.

A percentage height on the artwork resolves against the tile, which is the box it is actually being held off the edges of, and it stays right at any `height`.

:::

::: fw flutter

The artwork is laid into a box 72% of the tile's height, whatever is beside the tile, so the inset stays the same with the name drawn next to it and at any `height`.

:::

Turn `padded` off for a mark drawn to fill its tile: a favicon, a photograph.

## The name is in the document exactly once

Which element carries it depends on what the mark turned out to be.

- A **logotype** _is_ the name.

::: fw react

- An **image** carries it as `alt`.
- A **glyph** and a pair of **initials** say nothing at all, so those are the cases a clipped copy is for.

:::

::: fw flutter

- An **image** is an image node named by it.
- A **glyph** and a pair of **initials** are named by it too, with what they draw left out of the semantics tree.

:::

And whenever the words are drawn — `showName` — the mark becomes decoration rather than a second reading of the same thing. "VE" read out is two letters, not a product.

`showName` is ignored when the name is already the whole logo, because a bare logotype with the name beside it is the name twice.

::: fw react

## `href` rather than a wrapper

A logo in a header is nearly always the way back to the front page, and a `<span>` inside an `<a>` the caller wrote is the same thing with one more element in it — one that has to be given the focus ring and the pointer by hand.

For a router's own link, `render` takes it:

```tsx
<MPAppLogo name="Voltage" render={<Link to="/" />} />
```

:::

::: fw flutter

## `onPressed` rather than a wrapper

A logo in a header is nearly always the way back to the first screen. With `onPressed` the whole lockup is a link: announced as one, followed by pointer or by <kbd>Enter</kbd>, and ringed in `secondary` on keyboard focus. `href` is the address told to assistive technology; going there is `onPressed`'s job.

```dart
MPAppLogo(name: 'Voltage', href: '/', onPressed: () => context.go('/'))
```

:::

## What it does not carry

No tagline, no version, no elevation.

A logo with a line of text under it is a logo next to an [MPTypography](./typography), and a second spelling for that would give the library two of them.

Elevation is left out for a sharper reason. The prop moves tone as well as shadow everywhere else it appears, because that is what MD3's levels are — and a logo tile's tone is the accent, so there is nothing for it to move to. An app icon is a sticker on the page rather than a thing hovering over it.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `src`, `srcSet` | `image`, an `ImageProvider` | Every Flutter picture is a provider, and picking a resolution is the provider's job. |
| `alt` | `semanticLabel` | Flutter's name for what a screen reader announces. |
| `href` makes it a link | `onPressed` goes there | Flutter has no default navigation. `href` is still told to assistive technology. |
| `target`, `rel` | — | There is no window to open and no opener to close. |
| `imageProps` | an `Image` as `child` | A width and height on the `Image` reserve its proportion, as the `<img>` attributes do. |
| `render` | — | There is no polymorphic element. Call the router from `onPressed`. |
| `height` as a CSS length | `double?` | There are no CSS lengths. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::
