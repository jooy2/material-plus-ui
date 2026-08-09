---
title: MPTable
order: 8
---

# MPTable

<p class="mp-lede">A grid of data, described by its columns rather than written out row by row. The header and the cells cannot drift apart, because there is only one place that says how many columns there are.</p>

<Demo src="table/hero" />

```tsx
import { MPTable } from 'material-plus-ui';
import type { MPTableColumn } from 'material-plus-ui';

const columns: MPTableColumn<Build>[] = [
  { key: 'id', label: '#', width: 72 },
  { key: 'branch', label: 'Branch' },
  { key: 'duration', label: 'Duration', align: 'end', render: (row) => `${row.duration}s` }
];

<MPTable headers={columns} items={builds} getRowKey={(row) => row.id} striped hoverable />;
```

## Props

<PropsTable name="MPTable" />

### MPTableColumn

<PropsTable name="MPTableColumn" />

## Why it takes data rather than markup

A `<td>` written out per row can silently disagree with the `<th>` above it about how many there are or what order they come in. A column list cannot. That is the whole trade, and it is why `render` exists on the column rather than the table: the cell is still yours to draw, but the _shape_ of the grid is stated once.

## The cell padding is written inline, and it has to be

This is the one component in the library that writes styles inline instead of as classes.

A button owns its `<button>`; nobody else styles it. A `<td>` is different — VitePress's `.vp-doc td`, Tailwind Typography's `.prose td` and every CSS framework in existence style table cells **by tag name**, at two-class specificity that a one-class Tailwind utility cannot outrank. Padding, alignment and borders all silently lose to the host without this.

What is _not_ inline is the row's own background, because it has a hover state and an inline style has no `:hover`. It reads a custom property instead — invisible to a host stylesheet, so a one-class variant sets it without a fight.

## The rows are 52dp, which is MD3's

`body-medium` is a 20px line box, and 20 plus `1rem` either side is 52 exactly. Column headings are `title-small` — 14px at weight 500, the same size one weight up — so a heading reads as a heading without changing the column's measure.

`striped` and `hoverable` are two neutral surfaces one step apart rather than a tint. A table that alternates between white and pale blue has coloured half its data.

## Widths belong on a `<col>`

A width set on a `<th>` is a width the browser is free to renegotiate against every other row; only the column element states it once.

"Default" is meant, though — the table still balances the columns to fill its width, so `width` is a starting proportion rather than a guarantee.

## Examples

### empty

`empty` takes anything, which is what makes [MPEmpty](../feedback/empty) fit straight into it.

<Demo src="table/empty">

<<< @/.vitepress/demos/table/empty.tsx

</Demo>

### caption

Shown above the table and read out as its accessible name, which is what a `<caption>` is for. A table with several on a page and no captions is a page a screen-reader user has to count their way through.

## It is not `React.forwardRef`

It is generic in `Row`, and a `forwardRef` component's type erases that: the wrapper is typed as one component rather than as a function with a type parameter, so `headers` and `items` would stop checking against each other and `column.render` would hand back `unknown`.

Losing that check would cost more than a ref on the scroll container is worth — and a caller who needs one can put it on a `<div>` of their own around this.

## See also

- [MPList](./list) — when the rows have no columns.
- [MPEmpty](../feedback/empty) — what goes in `empty`.
- [MPSkeleton](../feedback/skeleton) — what goes there while the rows are still on their way.
