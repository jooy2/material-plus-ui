---
title: MPTypography
order: 2
---

# MPTypography

<p class="mp-lede">Text at one of Material's type roles. The type scale is the one thing in a design system everything else is measured against — this is that ladder on its own, so a page can set a heading in the same <code>headline-large</code> its components are built out of.</p>

<Demo src="typography/hero" />

```tsx
import { MPTypography } from 'material-plus-ui';

<MPTypography level="h2">Material Plus 1.0</MPTypography>
<MPTypography>Everything below is one of MD3's own type roles.</MPTypography>;
```

## Props

<PropsTable name="MPTypography" />

Every native attribute passes through, and a `ref` reaches the element.

## Every level is a Material role

Nothing here is interpolated and nothing is invented. Each `level` picks one of MD3's own type roles, at the specification's size, leading, tracking **and weight**.

| `level`    | Material role     | Size / leading | Element  |
| ---------- | ----------------- | -------------- | -------- |
| `h1`       | `display-small`   | 36 / 44        | `<h1>`   |
| `h2`       | `headline-large`  | 32 / 40        | `<h2>`   |
| `h3`       | `headline-medium` | 28 / 36        | `<h3>`   |
| `h4`       | `headline-small`  | 24 / 32        | `<h4>`   |
| `h5`       | `title-large`     | 22 / 28        | `<h5>`   |
| `h6`       | `title-medium`    | 16 / 24        | `<h6>`   |
| `lead`     | `title-large`     | 22 / 28        | `<p>`    |
| `body`     | `body-large`      | 16 / 24        | `<p>`    |
| `caption`  | `body-small`      | 12 / 16        | `<span>` |
| `overline` | `label-small`     | 11 / 16        | `<span>` |

<Demo src="typography/scale">

<<< @/.vitepress/demos/typography/scale.tsx

</Demo>

Two rows share a role on purpose. `h5` and `lead` are both `title-large` because MD3 has exactly one role at that size and a lead paragraph is what it is for — they differ in the element they emit, which is the thing that actually matters to a document outline. `h6` and `body` are both 16px for the same reason the specification puts them there: `title-medium` _is_ `body-large` at weight 500, and that weight is the whole difference between a subheading and the paragraph under it.

`display-large` and `display-medium` are not offered. At 57px and 45px they are hero type for a marketing page, and a component whose smallest job is a caption should not also be the thing that sets a billboard.

## Material headings are not bold

::: warning This is the surprising one

Every display, headline and `title-large` role in MD3 is **weight 400**, and that is what `level` hands out. A heading set in 600 is the single fastest way to make a Material page look like it belongs to some other system.

:::

`weight` is there when you genuinely need it — a table header, a run of emphasis inside a caption — and exactly one `font-*` class is ever emitted, so an override actually wins. Two utilities of equal specificity resolve by their order in the generated stylesheet, which is not something a component should depend on.

## It is not on the size ladder

There is no `size` prop, which is the same call [MPIcon](./icon) makes. `MPSize` is a _control_ ladder: `md` means 56px tall, and a paragraph has no height to pick from a scale. `level` is this component's scale, and it is the Material one rather than five steps of the library's own.

## `level` sets the scale and the element

That is the common case and it is why `level` is spelled `h2` rather than `headline-large` — a caller who wrote the role name would have no way to say which heading level they meant.

When the two have to differ, `render` breaks the tie:

```tsx
// Looks like an h3, does not enter the document outline.
<MPTypography level="h3" render={<div />}>Section</MPTypography>

// Semantically the page heading, set at a quieter size.
<MPTypography level="h4" render={<h1 />}>Settings</MPTypography>
```

## `color` has no default

Prose inherits the surface's own ink unless a role is asked for, because the common case for a paragraph is to look like the paragraphs around it.

**No default means no declaration**, not a quiet one. Nothing here writes a `color` until the prop is passed, so a `text-white` on the dark hero section above wins by being the only thing that spoke. That matters more than it sounds: every other rule this component writes goes through `[&.mp-typography]`, which is two classes and outranks a page's own utility — a colour written there would have been unbeatable.

```tsx
<MPTypography>Inherits whatever ink surrounds it</MPTypography>
<MPTypography color="error">Reads the error family</MPTypography>
```

A role outside the four accents is a `className` away, and works for the same reason:

```tsx
<MPTypography level="caption" className="text-mp-on-surface-variant">
  Two minutes ago
</MPTypography>
```

That is the muted line `caption` and `overline` used to be given whether or not it was wanted — which was the same bug in the other direction, since MD3's `on-surface-variant` is a choice about what the text _is_ and not something a size can decide.

## See also

- [Colour](../../design/color) — where `on-surface` and the accent families come from.
- [MPTextLink](./text-link) — a link inside one of these paragraphs.
- [MPBlockquote](./blockquote) — somebody else's words, set apart from yours.
