---
title: MPImage
order: 23
---

# MPImage

<p class="mp-lede">A picture that says what it is doing — while it is on its way, and when it never arrives.</p>

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

## What it is not

- **Not a gallery.** `preview` opens _this_ picture and nothing else. A lightbox that walked between images would need to know which images and in what order, and that is a component holding a collection rather than a picture.
- **Not a `next/image`.** No `srcset` generation, no loader, no format negotiation — those belong to whatever is serving the file, and a library guessing at them would be guessing about somebody else's CDN. `srcSet`, `sizes`, `loading` and `decoding` pass straight through to the `<img>`.

## Sharp edges

- **The `<img>` stays in the layout while it loads**, transparent rather than hidden. `display: none` on an image is a fetch some browsers skip, which would mean a picture that never starts arriving.
- **A new `src` goes back to `loading`** rather than holding the old picture under the new source's placeholder.
- **Give `alt` to the picture, not to the preview.** The button's name comes from `alt` unless `previewLabel` says otherwise, so a good `alt` is two things at once.

## Next

- [MPAspectRatio](../layout/aspect-ratio.md) — the same box, for content that is not an image.
- [MPSkeleton](../feedback/skeleton.md) — the shimmer, for the rest of a page that is still arriving.
