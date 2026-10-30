---
title: MPTable
order: 8
---

# MPTable

<p class="mp-lede">A grid of data, described by its columns rather than written out row by row. The header and the cells cannot drift apart, because there is only one place that says how many columns there are.</p>

<Demo src="table/hero" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

final List<MPTableColumn<Build>> columns = <MPTableColumn<Build>>[
  MPTableColumn<Build>(key: 'id', label: const Text('#'), width: 72, render: (row, _) => Text(row.id)),
  MPTableColumn<Build>(key: 'branch', label: const Text('Branch'), render: (row, _) => Text(row.branch)),
  MPTableColumn<Build>(
    key: 'duration',
    label: const Text('Duration'),
    align: MPAlign.end,
    render: (row, _) => Text('${row.duration}s'),
  ),
];

MPTable<Build>(
  headers: columns,
  items: builds,
  getRowKey: (row, _) => row.id,
  striped: true,
  hoverable: true,
);
```

:::

## Props

<PropsTable name="MPTable" />

### MPTableColumn

<PropsTable name="MPTableColumn" />

## Why it takes data rather than markup

A `<td>` written out per row can silently disagree with the `<th>` above it about how many there are or what order they come in. A column list cannot. That is the whole trade, and it is why `render` exists on the column rather than the table: the cell is still yours to draw, but the _shape_ of the grid is stated once.

::: fw flutter

Without `render`, a cell is `row[key]`, which only means something when the rows are maps. For rows that are objects of your own, give every column a `render`. A value that is text, a number or a boolean is drawn as text and a widget as itself; anything else draws an empty cell.

:::

::: fw react

## The cell padding is written inline, and it has to be

This is the one component in the library that writes styles inline instead of as classes.

A button owns its `<button>`; nobody else styles it. A `<td>` is different — VitePress's `.vp-doc td`, Tailwind Typography's `.prose td` and every CSS framework in existence style table cells **by tag name**, at two-class specificity that a one-class Tailwind utility cannot outrank. Padding, alignment and borders all silently lose to the host without this.

What is _not_ inline is the row's own background, because it has a hover state and an inline style has no `:hover`. It reads a custom property instead — invisible to a host stylesheet, so a one-class variant sets it without a fight.

:::

## The rows are 52dp, which is Material's

That is the Material data table's row, a Material 2 component that MD3 has not redrawn. `body-medium` is a 20px line box, and 20 plus 16 either side is 52 exactly. Column headings are `title-small` — 14px at weight 500, the same size one weight up — so a heading reads as a heading without changing the column's measure.

`striped` and `hoverable` are two neutral surfaces one step apart rather than a tint. A table that alternates between white and pale blue has coloured half its data.

`density` walks that row down: 52, 48, 44, 40, four pixels a step, and the figures stay the size they were. That last part is the point — the reason to make a table denser is to see more rows at once, and shrinking the numbers to get there makes them harder to read at exactly the moment there are more of them.

::: fw react

```tsx
<MPTable headers={columns} items={rows} density={-2} />
```

:::

::: fw flutter

```dart
MPTable<Build>(headers: columns, items: rows, density: -2);
```

:::

The cell padding is arithmetic rather than a lookup: each step takes two pixels off each face, which is four out of the row. The two axes bottom out in different places — 6px sideways, where two columns start touching, and 4px vertically, which is what keeps the shortest row on the 24px floor.

## <Fw react="`onRowClick`" flutter="`onRowPressed`" /> makes rows reachable by keyboard

A row that answers a press has to answer a keyboard too, so each one joins the tab order and takes Enter and Space. <Fw react="The row keeps `role=&quot;row&quot;` rather than claiming `role=&quot;button&quot;`" flutter="The row stays a row rather than claiming to be a button" /> — a row that said it was a button would lose the position-in-the-table a screen reader reads out, which is the one thing a cell has that a button does not.

A key pressed _inside_ a cell is left to whatever is in that cell, so a Space typed into a field in a table does not activate the row around it.

It is worth knowing what this costs: a table of two hundred rows becomes two hundred tab stops. When the row's job is to **navigate**, put a link in the first cell instead — one tab stop per row, already announced as a link:

::: fw flutter

```dart
MPTable<Item>(
  headers: <MPTableColumn<Item>>[
    MPTableColumn<Item>(
      key: 'name',
      label: const Text('Name'),
      render: (row, _) => MPTextLink(onPressed: () => open(row), child: Text(row.name)),
    ),
    MPTableColumn<Item>(key: 'qty', label: const Text('Qty'), align: MPAlign.end, render: (row, _) => Text('${row.qty}')),
  ],
  items: rows,
);
```

:::

::: fw react

```tsx
<MPTable
  headers={[
    {
      key: 'name',
      label: 'Name',
      render: (row) => <MPTextLink href={row.href}>{row.name}</MPTextLink>
    },
    { key: 'qty', label: 'Qty', align: 'end' }
  ]}
  items={rows}
/>
```

:::

## Widths

::: fw react

Widths belong on a `<col>`. A width set on a `<th>` is a width the browser is free to renegotiate against every other row; only the column element states it once.

"Default" is meant, though — the table still balances the columns to fill its width, so `width` is a starting proportion rather than a guarantee.

:::

::: fw flutter

A `width` is exact. A column without one is measured from its widest cell and then handed a share of whatever the sheet has left over, which is how a browser's automatic table layout balances the columns. A table whose columns are wider than the sheet scrolls sideways.

:::

## Examples

### empty

`empty` takes anything, which is what makes [MPEmpty](../feedback/empty) fit straight into it.

<Demo src="table/empty">

::: fw react

<<< @/.vitepress/demos/table/empty.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/table/empty.dart

:::

</Demo>

### caption

Shown above the table and read out as its accessible name, which is what a `<caption>` is for. <Fw flutter="In Flutter a caption of plain text names the table; any other caption is read where it stands, and the name comes from `semanticLabel`." /> A table with several on a page and no captions is a page a screen-reader user has to count their way through.

::: fw react

## It is not `React.forwardRef`

It is generic in `Row`, and a `forwardRef` component's type erases that: the wrapper is typed as one component rather than as a function with a type parameter, so `headers` and `items` would stop checking against each other and `column.render` would hand back `unknown`.

Losing that check would cost more than a ref on the scroll container is worth — and a caller who needs one can put it on a `<div>` of their own around this.

:::

::: fw flutter

## Scrolling and the pinned header

In a box shorter than its rows the table scrolls, and with `stickyHeader` the column names stay at the top while the rows pass under them. The pinned band is a copy of the real header, given the widths the one grid laid out, so it cannot disagree with the columns beneath it. While the grid has somewhere to scroll it is a focus stop of its own, and the arrow keys, Page Up, Page Down, Home and End move it.

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `onRowClick` | `onRowPressed` | Flutter's name. |
| `row[key]` on any object | `row[key]` on a map | Dart cannot read a field by name; rows of your own type need a `render` on every column. |
| `width` as a CSS length | `width` in pixels, exact | There is no CSS length to parse, and no browser layout renegotiating it. |
| `color` (deprecated) | — | It never had a visible effect, so the Flutter build does not carry it. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |
| — | `semanticLabel` | The table's name when the caption is not plain text. |

:::

## See also

- [MPList](./list) — when the rows have no columns.
- [MPEmpty](../feedback/empty) — what goes in `empty`.
- [MPSkeleton](../feedback/skeleton) — what goes there while the rows are still on their way.
