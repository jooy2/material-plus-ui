---
title: MPShow
order: 20
---

# MPShow

<p class="mp-lede">Content at some window sizes and not others. A rail on a laptop and a bottom bar on a phone, written as two components with a boundary between them rather than as one component with a branch inside it.</p>

```tsx
import { MPShow } from 'material-plus-ui';

<MPShow from="expanded">
  <MPSidebar>{nav}</MPSidebar>
</MPShow>
<MPShow until="expanded">
  <MPBottomNavigation items={nav} />
</MPShow>;
```

`from` and `until` over the same class are exclusive and exhaustive: one of them is on screen at every width, and never both.

## Props

<PropsTable name="MPShow" />

## The three props

| Written          | Shown          |
| ---------------- | -------------- |
| `from="medium"`  | 600dp and up   |
| `until="medium"` | under 600dp    |
| `only="medium"`  | 600dp to 839dp |

`only` is `from` and `until` said together, and either of them still overrides its own half — `only="medium" until="large"` is 600dp to 1199dp. Which of the two spellings to use is a question of which one reads like the intention.

The classes are [Material's window size classes](../../design/breakpoints), not Tailwind's breakpoints.

## It is `display: none`, not a condition

Both branches are rendered and one of them is hidden by CSS. That is a trade, and it is worth being explicit about which way it goes.

A media query is resolved by the browser **before it paints anything**, including the markup a server sent. So the first frame is already right. [`useMPWindowClass`](../../guide/hooks) answers the same question in JavaScript and cannot answer it until the page has hydrated: the first paint is a guess, and the correction is a second render. On a phone that guess is a desktop navigation drawn and thrown away.

What it costs is that the hidden branch is still there — built, laid out, skipped at paint, and its effects run. So:

- **Reach for `MPShow`** when what changes is _which_ of two arrangements is on screen. A nav, a toolbar, a column of filters, a label that becomes an icon.
- **Reach for the hook** when the branch that is off screen is expensive. A chart, a map, an editor, a table of a thousand rows.

`display: none` also takes the content off the accessibility tree, which is the point rather than a caveat: a screen reader on a narrow window reads the compact arrangement, not both of them.

## It is not a box

While it is shown the wrapper is `display: contents`, so it takes no part in the layout — an `MPShow` inside a flex row makes its children the flex items, exactly as if it were not written.

That declaration is at zero specificity (`:where`), so a `className` of your own that sets a display wins over it without a fight, and the hiding still wins over both:

```tsx
<MPShow from="medium" className="flex items-center gap-2">
  …
</MPShow>
```

Where a bare `<div>` is not allowed to sit, `render` gives it another element: `render={<li />}`, `render={<td />}`.

## The same thing without the component

The hiding is Tailwind's own `hidden` under the variants this library registers, so an element you already have can take one directly:

```tsx
<nav className="mp-below-expanded:hidden">…</nav>
<footer className="mp-large:hidden">…</footer>
```

Those classes are in the shipped stylesheet on both installation paths. `MPShow` adds the wrapper that takes no part in the layout, `only`, and a name that says what the element is for.

## Next

- [Breakpoints](../../design/breakpoints) — the five classes, what else changes with them, and how to move them.
- [`useMPWindowClass`](../../guide/hooks) — the same question in JavaScript, and when to prefer it.
- [`MPSidebar`](./sidebar) — which collapses at a class on its own, and needs none of this.
