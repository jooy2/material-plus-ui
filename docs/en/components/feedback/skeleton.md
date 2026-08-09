---
title: MPSkeleton
order: 1
---

# MPSkeleton

<p class="mp-lede">The shape of something that has not loaded yet. It reserves the space the real thing will take, which is the whole job — a card that grows by 200px when its image arrives has moved everything below it while somebody was reading.</p>

<Demo src="skeleton/hero" :minHeight="260" />

```tsx
import { MPSkeleton } from 'material-plus-ui';

<MPSkeleton shape="circle" />
<MPSkeleton lines={3} />
<MPSkeleton shape="rect" height={180} label="Loading the chart" />;
```

## Props

<PropsTable name="MPSkeleton" />

Every native `<div>` attribute passes through, and a `ref` reaches the root.

## Three shapes, because a layout is made of three things

<Demo src="skeleton/shapes">

<<< @/.vitepress/demos/skeleton/shapes.tsx

</Demo>

Each is sized off the ladder the real component uses, so a `md` line is as tall as `md` type and a `md` circle is exactly an [MPAvatar](../display/avatar) at `md`.

A line's height is the **em box** of the type it replaces, not the line box. A placeholder as tall as the leading would be a bar with no air between it and the next one, and a paragraph of those is a barcode.

## `lines` is a stack of bars, not one striped box

The gaps between them are real gaps, because text has leading — and a striped gradient would not survive a caller putting the block in a flex row. The last line is drawn short, the way the last line of a paragraph is, so a block of them reads as prose.

## `label` is what decides whether it speaks

Unlabelled it is `aria-hidden` scenery, which is the right default: a dozen boxes each announcing themselves is worse than silence.

Give the **one** skeleton that stands for the whole region a label and it becomes a live `role="status"` with `aria-busy`.

```tsx
<div>
  <MPSkeleton label="Loading your projects" />
  <MPSkeleton />
  <MPSkeleton />
</div>
```

## `color` has no default

A placeholder is not a thing yet, so it has no meaning to carry. Left unset it is `surface-container-highest` — MD3's role for a container with nothing in it, which is precisely what this is. Setting `color` swaps in the family's container tone, for the rare page where the wait itself is branded.

## The surface is flat

Every other container in the library reads a `surface-container` role and may cast a shadow. A skeleton is the shape of something that is _not there_, so it is a tint and nothing else — no elevation, no edge. It also keeps a page of thirty placeholders from asking for thirty shadows.

`animated={false}` stops the pulse for a page holding dozens of them, or where the wait is expected to be long enough that motion becomes noise. It is **not** the accessibility switch: a reduced-motion preference stops the animation without being asked, and the box is still the right size, which is the part that was doing the work.

## Not a spinner in a box

A spinner cannot reserve space. That is the difference, and it is why this is a component of its own rather than a variant of a progress indicator.

## See also

- [MPEmpty](./empty) — the other half: the shape of something that is _not coming_.
- [MPTable](../display/table) — a common place for both.
