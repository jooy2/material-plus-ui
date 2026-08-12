---
title: MPBox
order: 4
---

# MPBox

<p class="mp-lede">A sheet with content on it. The plainest surface in the library: it groups things, and that is all it does.</p>

<Demo src="box/hero" :minHeight="180" />

```tsx
import { MPBox } from 'material-plus-ui';

<MPBox variant="elevated">Grouped, and separated from the page.</MPBox>;
```

## Props

<PropsTable name="MPBox" />

## Why it is never dyed, and takes no `color`

Because what a box holds is somebody else's content, and that content arrives with its own colours: body text, links, buttons, fields. On an accent fill every one of them would need an on-accent treatment of its own, which is the opposite of what a container is for.

<Demo src="box/variants" :minHeight="420">

<<< @/.vitepress/demos/box/variants.tsx

</Demo>

So the ladder runs up the **neutral** surface roles, and three of the five are MD3's own card variants to the letter:

| `variant`  | Surface                                     | MD3               |
| ---------- | ------------------------------------------- | ----------------- |
| `filled`   | `surface-container-highest`                 | the filled card   |
| `tonal`    | `surface-container`                         | —                 |
| `elevated` | `surface-container-low` + level 1           | the elevated card |
| `outlined` | `surface` + a hairline in `outline-variant` | the outlined card |
| `text`     | nothing                                     | —                 |

Note the first row in particular. Everywhere else in this library `filled` is the accent under its own ink; on a container it is a neutral surface, because the specification's own filled card is one. A component that _is_ the thing being coloured says so by taking `color` — that is [MPAlert](../feedback/alert) for a message, [MPChip](../display/chip) for a token, [MPButton](../inputs/button) for an action.

## `size` is the padding, and nothing else

This is the one component in the library where a rung sets no height and no type scale.

<Demo src="box/sizes" :minHeight="320">

<<< @/.vitepress/demos/box/sizes.tsx

</Demo>

A box is as tall as what it holds, and its children bring their own typography. A container that reset the type scale would make the same paragraph render at two sizes depending on what it happened to be wrapped in.

The **corner** is not on the ladder either, and that is where this library and most others part company. In Material a radius is a statement about what kind of object something is rather than a size to taste: a text field is a well at `corner-extra-small`, a button is a pill at `corner-full`, a dialog is an object at `corner-extra-large`. A box is a sheet, so it is `corner-medium` at every rung — and moving the whole scale is [`data-mp-shape`](../../guide/getting-started#shape), which is a decision about the page rather than about one box.

## Why there is no `elevation`

There is no `elevation` prop anywhere in this library, and a box is where the absence is most tempting to fix.

It stays absent because MD3 does not treat height as a free axis. An elevated surface is `surface-container-low` under a level-1 shadow — the tone and the shadow are one decision, made together, because a raised surface catches more light. A prop that raised a `filled` box would produce a surface the specification has no name for and no `on-` role to go with.

`variant="elevated"` is that decision, made once.

## Examples

### padded

Off for content that should reach the edges:

```tsx
<MPBox padded={false}>
  <img src="/cover.jpg" alt="" style={{ display: 'block', width: '100%' }} />
</MPBox>
```

The corner still clips the picture, because the sheet is what has the corner.

### render

Base UI's own escape hatch, so a box can be the element the document actually needs without giving up its surface:

```tsx
<MPBox render={<section />} aria-labelledby="totals">…</MPBox>

<MPBox render={<li />} variant="text">…</MPBox>
```

### Nesting

A box inside a box wants `text`, or one step quieter than its parent — two bordered rectangles inside each other is two rectangles:

```tsx
<MPBox>
  <MPBox variant="text" padded={false}>
    …
  </MPBox>
</MPBox>
```

## Accessibility

A box is a `<div>` with a surface. It has no role, no state and no keyboard contract, and it deliberately adds none — a region a screen reader should announce needs a name and an element that takes one, which is what `render` is for:

```tsx
<MPBox render={<section />} aria-label="Order summary">
  …
</MPBox>
```

## See also

- [MPCard](./card) — this box with a heading, a footer and dividers laid out on it.
- [MPCollapsible](./collapsible) — this box, folded.
- [MPAlert](../feedback/alert) — for a sheet that _is_ the message, and does take the accent.
