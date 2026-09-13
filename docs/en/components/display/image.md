---
title: MPImage
order: 23
---

# MPImage

<p class="mp-lede">A picture that says what it is doing — while it is on its way, and when it never arrives — and that can be turned, mirrored and cropped within its box.</p>

<Demo src="image/hero" :minHeight="240">

<<< @/.vitepress/demos/image/hero.tsx

</Demo>

```tsx
import { MPImage } from 'material-plus-ui';

<MPImage src={photo} alt="The east face at dawn" ratio="16 / 9" preview />;
```

## Props

<PropsTable name="MPImage" />

## An `<img>` has three states and shows two of them badly

While it is on its way there is a hole the size of nothing, and the page **jumps** when it lands. When it fails there is the browser's own broken-image mark — different in every browser, belonging to none of them, and saying nothing to a reader about whose fault it was.

| State     | A bare `<img>`                | This                                              |
| --------- | ----------------------------- | ------------------------------------------------- |
| `loading` | nothing, and no room reserved | a placeholder, in a box `ratio` has already sized |
| `loaded`  | the picture                   | the picture, faded in                             |
| `error`   | the browser's own mark        | `fallback`                                        |

`ratio` is what reserves the room. Without it the box is whatever the picture turns out to be, and everything below it moves when that is settled.

## The cached case is the one that breaks

An image already in the cache is `complete` **before React attaches anything**, so its `load` event has been and gone. A component that only listened would hold its placeholder over a picture that is already fully drawn — and it would do it on every second page view, which is the view nobody tests because the first one works.

The `complete` flag is checked on mount for exactly that, and `naturalWidth` is what tells the two kinds of `complete` apart: a finished image has a width, and one that failed is also `complete` and has none.

That is the whole reason this is a component rather than three lines of `useState` at a call site.

## `alt` is required

For the reason [`MPIconButton`](../inputs/icon-button.md)'s `label` is: a picture with no text alternative is the most common accessibility defect a library can actually help with, and the help is refusing to compile.

`alt=""` is how to say _decoration_ — a claim somebody made, rather than a prop somebody forgot.

## `preview`

Makes the box a **button** and opens the picture over a scrim.

```tsx
<MPImage src={thumb} previewSrc={full} alt="The east face at dawn" preview />
```

Off by default: most pictures on a page are not worth opening, and one that silently became pressable would be a control nobody declared. `previewSrc` is what makes a thumbnail worth being a thumbnail — the small file is on the page and the large one is fetched only if somebody asks.

A picture that **failed** refuses to open. A scrim over a broken-image glyph is not worth the gesture.

## `rotate` and `flip`

`rotate` turns the picture clockwise, a quarter at a time: `0`, `90`, `180` or `270`. `flip` mirrors it: `horizontal`, `vertical` or `both`.

<Demo src="image/rotate" :minHeight="440">

<<< @/.vitepress/demos/image/rotate.tsx

</Demo>

A half turn keeps the shape of the box. A quarter turn swaps it, so the box has to know the file's proportion before the picture arrives. Pass the file's `width` and `height` and the box reserves the turned shape: `width={1200} height={800}` on its side is 2 wide by 3 tall. Without them the shape is read from the file when it loads, and the page moves at that moment. An explicit `ratio` is kept, because it is the shape of the layout, and `fit` decides how the turned picture fills it.

Only quarter turns are accepted. A picture turned by any other angle no longer covers its box, and filling the corners would mean enlarging the picture by an amount you would then want to adjust. A number passed from JavaScript is rounded to the nearest quarter, so `-90` is `270`.

`flip` mirrors along the axes the picture is shown on, so `horizontal` swaps left and right on the screen whether or not the picture is turned.

`preview` opens the picture turned and mirrored as well.

The turn is drawn with the CSS `rotate` property and the mirror with `scale`, rather than with `transform`. A `transform` of your own, such as a zoom on hover, still applies on top of both.

A picture on its side is laid out of the flow and cannot give its box a width. The box takes the width of wherever it is placed, so in a flex row, or anywhere else that sizes a box by its contents, give it a width.

## `fit`, `width` and `height`

`fit` takes the words CSS uses for `object-fit`: `cover`, `contain`, `fill`, `none` and `scale-down`. `scale-down` draws like `contain`, but never enlarges a file that is smaller than its box.

<Demo src="image/fit" :minHeight="440">

<<< @/.vitepress/demos/image/fit.tsx

</Demo>

`width` and `height` given together are the file's size in pixels, as they are on an `<img>`, and they reserve its proportion. Given alone, one of them sizes the box on that axis, and `fit` decides what the picture does with the room around it:

- `height` alone makes the box that tall and as wide as its container. With a `ratio` as well, the width comes from the ratio, and the box is no wider than its container.
- `width` alone makes the box that wide, no wider than its container, and as tall as the picture or `ratio` makes it.

A number or a string of digits is pixels, and any other string is a CSS length, so `height={240}`, `height="240"` and `height="15rem"` all work. When the box is narrower than its container, the button `preview` draws is narrowed with it, and its focus ring stays around the picture.

## `position`

Chooses which part of the picture a `cover` crop keeps, and where `contain`, `none` and `scale-down` leave their empty space. It takes the centre, a side, a corner written the way CSS writes it (`'top left'`), or two percentages across and down (`'30% 20%'`).

<Demo src="image/position" :minHeight="200">

<<< @/.vitepress/demos/image/position.tsx

</Demo>

It is read on the picture as it is shown. `object-position` works in the element's own frame, before the element is turned or mirrored, so the component converts the value: `position="top"` keeps the top of the picture on the screen whatever `rotate` and `flip` are set to.

It is physical rather than logical. The subject of a photograph does not move to the other side on a right-to-left page, so `left` stays on the left.

A value in any other form, such as one with a length in it, reaches `object-position` as written and is not converted.

## `letterbox`

Fills the room `fit` leaves around the picture. `none` leaves the box empty, `blur` draws the picture again behind itself, and any other string is a CSS `background`: a colour, a custom property or a gradient.

<Demo src="image/letterbox" :minHeight="220">

<<< @/.vitepress/demos/image/letterbox.tsx

</Demo>

`blur` fills the sides the way a video player fills them around a portrait clip: a second `<img>` of the same file covers the box, blurred, and fades in with the picture. It is given the same `src`, `srcSet`, `sizes`, `loading`, `decoding`, `crossOrigin` and `referrerPolicy` as the picture, so the browser fetches the file once. It is hidden from assistive technology and ignores the pointer, so a right-click on the blurred area does not offer to save it.

It is drawn only when `fit` can leave room, which is `contain`, `none` and `scale-down`. Under `cover` and `fill` the picture covers the whole box, and there is nothing to fill.

## A picture as the placeholder

`placeholder` also takes a picture, written `{ src, blur }`. A small copy of the file, a data URI or a `Blob` is drawn in place of the shimmer while the file arrives.

<Demo src="image/placeholder" :minHeight="400">

<<< @/.vitepress/demos/image/placeholder.tsx

</Demo>

The stand-in is fitted, placed, turned and mirrored the way the picture is. `blur: true` blurs it with a 20 pixel radius, and a number sets the radius in pixels. It stays opaque until the picture has faded in over it, and then it is hidden in one step: fading the two against each other would leave both half transparent, and the page would show through. If the file fails, the stand-in is removed and `fallback` is drawn.

A `Blob` is drawn through an object URL. The URL is created when the Blob is given and revoked when the Blob is replaced or the image unmounts. Keep the same Blob from one render to the next, in state for example, because a new Blob on every render makes a new URL every time.

Like the shimmer, the stand-in fills the box, so the box needs a reserved size: a `ratio`, or both `width` and `height`. Without one, nothing gives the box a height before the picture arrives, and the stand-in has no room to be drawn in.

## When the picture loads

`loading`, `decoding` and `fetchPriority` are the `<img>`'s own attributes, and they pass straight through to it.

- `loading="lazy"` waits to fetch a picture until it comes near the viewport. Use it for pictures below the fold.
- `decoding="async"` lets the browser decode the file without holding up the rest of the page.
- `fetchPriority` raises or lowers how urgently the file is fetched, compared with the page's other requests.

`priority` is for the picture a page is judged by, which is usually its Largest Contentful Paint. It sets `loading="eager"` and a high fetch priority, and an attribute you write out yourself still wins. Give it to one picture per page, because a high priority on every picture raises none of them above the others.

```tsx
<MPImage src={cover} alt="The east face at dawn" ratio="16 / 9" priority />
<MPImage src={thumb} alt="The hut below the ridge" ratio="4 / 3" loading="lazy" decoding="async" />
```

A lazy picture still needs a reserved box. Until it loads, the box is only as large as `ratio`, or `width` and `height`, make it, so without either the page moves when the picture arrives.

React 19 spells the attribute `fetchPriority` and React 18 spells it `fetchpriority`. `priority` writes the spelling the running React knows, so neither version warns about it.

## What it is not

- **Not a gallery.** `preview` opens _this_ picture and nothing else. A lightbox that walked between images would need to know which images and in what order, and that is a component holding a collection rather than a picture.
- **Not a `next/image`.** No `srcset` generation, no loader, no format negotiation — those belong to whatever is serving the file, and a library guessing at them would be guessing about somebody else's CDN. `srcSet`, `sizes`, `loading`, `decoding` and `fetchPriority` pass straight through to the `<img>`.

## Sharp edges

- **The `<img>` stays in the layout while it loads**, transparent rather than hidden. `display: none` on an image is a fetch some browsers skip, which would mean a picture that never starts arriving.
- **A new `src` goes back to `loading`** rather than holding the old picture under the new source's placeholder.
- **Give `alt` to the picture, not to the preview.** The button's name comes from `alt` unless `previewLabel` says otherwise, so a good `alt` is two things at once.

## Next

- [MPAspectRatio](../layout/aspect-ratio.md) — the same box, for content that is not an image.
- [MPSkeleton](../feedback/skeleton.md) — the shimmer, for the rest of a page that is still arriving.
