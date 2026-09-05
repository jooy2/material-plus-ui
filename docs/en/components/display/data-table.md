---
title: MPDataTable
order: 29
---

# MPDataTable

<p class="mp-lede">A grid of data with the four things a reader does to one: put it in order, cut it down, step through it and take some of it away. Plus a file to keep.</p>

<Demo src="data-table/hero" :minHeight="520" />

```tsx
import { MPDataTable } from 'material-plus-ui';

<MPDataTable
  headers={[
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score', align: 'end' }
  ]}
  items={rows}
  getRowKey={(row) => row.id}
  sortable
  searchable
  paged
/>;
```

## Props

<PropsTable name="MPDataTable" />

### MPDataTableColumn

<PropsTable name="MPDataTableColumn" />

## Why it is not `MPTable` with more props

Because [MPTable](table) is the presentational half and should stay that way. It draws what it is given, in the order it is given, and a page that only shows a grid has no business shipping a comparator, a CSV writer and a page clamp to do it — `MPTable` is 3.0 kB and this is not.

What the two do share is the geometry. `internal/table.ts` holds the cells' room, the type they are set in and the slot a row's background is read from, so a data table never sits a pixel off the plain table beside it in the same form.

The split is the one `neba` makes, and it is the same reason [MPTreeSelect](../inputs/tree-select) is not `MPSelect` with a `tree` prop.

## What it does to the rows, and in what order

**Search, then `filter`, then sort, then the page.** That is the only order in which each step means what it says: sorting before searching would put rows nobody is going to see in order, and paging before either would cut a page out of a list the reader has not asked for yet.

`render`'s `index` counts along the sorted, searched order and across every page, so `(row, index) => index + 1` is a running row number rather than a position on the screen.

## `value`, `render`, `compare`, `exportValue`

Four ways to say what a column holds, and the split between them is the whole shape of `MPDataTableColumn`.

|               |                                                                          |
| ------------- | ------------------------------------------------------------------------ |
| _nothing_     | The cell is `row[key]`, and that is what is sorted, searched and written |
| `render`      | What a reader sees                                                       |
| `value`       | What the sort and the search see                                         |
| `compare`     | How two rows rank, for a value that has no natural order                 |
| `exportValue` | What a file gets                                                         |

Most columns need none of them. A column that draws an [MPChip](chip) needs `render` — and it needs `value` or `compare` as well the moment it is sortable, because a React element has no order, and `exportValue` the moment it is downloadable, because a chip has no text a spreadsheet can hold.

A `compare` is always written **ascending**. The table reverses it, so a column that sorted itself would sort itself twice.

## Sorting

Three states per column — ascending, descending, unsorted — because the order the rows arrived in is a state a reader cannot get back to by pressing anything if the cycle only has two. That is the opposite of the choice [MPTreeView](tree-view)'s single select makes, read the other way: there, "nothing chosen" is reachable by pressing something else; here it is not.

With `sortMode="multiple"`, a Shift-press **adds** a column to the sort instead of replacing it, and each sorted heading carries its place in the order. A column added that way stays where it already is in the list, so flipping the second key does not quietly make it the first.

Two things the default comparison does that a `localeCompare` does not:

- **A run of digits inside a string is read as a number**, so `item2` comes before `item10`.
- **An empty cell sorts last whichever way the column runs.** A blank is not the smallest value, it is the absence of one, and a descending sort whose first screen is forty blanks has answered a question nobody asked. `NaN` counts as empty for the same reason: it compares false against everything, so left to the subtraction the order would depend on which rows happened to be next to each other.

That second rule is why the direction is handed to the comparison rather than applied to what it returns. A sort that reversed the result would reverse the empties with it.

## The search

`searchable` puts a field above the table. Every column is searched unless it says `searchable: false`, and what is matched is `value` — or `row[key]` — folded with `toLocaleLowerCase`, which is the fold [MPCombobox](../inputs/combobox) and [MPCommandPalette](../inputs/command-palette) already use.

A row's values are folded **once** and joined into one string. The alternative is a fold on every cell of every row on every keystroke, which is what a `matches(row, query)` signature quietly asks for. They are joined on a character no keyboard produces, so a query cannot span the seam between two cells and find a row on text that is not next to each other — searching `adaseoul` finds nothing, even in a row holding "Ada" and "Seoul".

A `Date` is deliberately not formatted for the search. What a reader sees in that cell came out of your own `render`, and guessing a format the search would agree with is how a table ends up not finding a date that is on the screen. Give the column a `value`.

## The pages

Every row is rendered otherwise, and there is no windowing — the same ceiling `MPTable` states, and `paged` is the answer to it. A few hundred rows is nothing, a few thousand is a visible pause when the table first draws, and past that a table wants either this or a narrower list.

The page moves back to the first whenever the search changes or the page size does. Left where it was, a search that cut twenty pages to three would leave the reader looking at an empty screen and reading it as "nothing matched".

## Choosing rows

`selectionMode` decides how many, and `checkboxes` decides how. Single select **toggles** — unlike [MPTreeView](tree-view)'s, because an action bar above a table keys off "nothing chosen" and that has to be reachable. Multiple select takes a Shift-press to extend from the last row pressed, along the order **currently on screen** rather than the order `items` arrived in.

The tick in the heading takes the rows on the page, not the whole set: it sits in the header of what is visible, and a control that quietly took four hundred rows the reader cannot see is a control that did something else.

`onSelectedChange` hands back the keys **and the rows**, including rows the search has hidden and rows on other pages — those are still chosen, so they still have to come back. They arrive in `items` order rather than the order the presses happened in, because a reader who ticks the last row and then the first has chosen two rows, not an order.

### Who holds the keyboard

A row that answers a press has to answer a keyboard, and a table of two hundred rows that each did would be two hundred tab stops. So there is exactly one route into a row, and `checkboxes` picks it:

|                               |                                                          |
| ----------------------------- | -------------------------------------------------------- |
| `checkboxes`                  | The tick is the control; the row is not in the tab order |
| `selectionMode` without ticks | The row is                                               |
| `onRowClick` alone            | The row is — there is nothing else to press              |

## Resizing

`resizable` gives every heading a handle, and the handle is a **control** rather than a target: it takes focus, and the arrow keys widen and narrow the column by 8px, or 32px with Shift. Home gives the column its original width back, and so does a double-click. Column width is a real preference — reading a long value — and there is no other way to get it.

**It also changes how the columns are laid out, and it has to.** Without it the browser balances the columns against their contents, which is what makes a plain table read well; but a balanced column springs back from a drag, because a width in that layout is a hint rather than a measurement. Turning it on fixes the layout, so `width` becomes exact and a column that has not said how wide it is takes 160.

## The download

`exportable` adds a button that writes the rows out as a CSV file. **Every row the reader is currently looking at, not the page they are on**: the search and the sort are applied and the paging is not, because a file of page three is not a file anybody asked for.

The escaping is RFC 4180 and it is four rules — a field is quoted if it holds the separator, a quote or a line break, and a quote inside a quoted field is written twice. Getting it wrong is silent: a comma inside a cell shifts every column after it by one, and nobody notices until a spreadsheet somewhere is off by a column.

The file leads with a byte-order mark, and not as a nicety: Excel reads a UTF-8 CSV without one as the local code page, so every non-ASCII name in it arrives as mojibake. Every other reader ignores the mark.

`onExport` takes the text instead of downloading it — to post it somewhere, to open it in a viewer of your own, or to put a sheet around it.

## What it deliberately does not do

Virtual scrolling, cell editing, grouped rows with aggregates, column reordering, frozen columns, and a mode where the server does the sorting. Each of those is a component's worth of decisions rather than a prop, and a table that half-did six of them would be worse than one that does five things completely. `paged` is the answer to the row count; the rest is a table this library has not built yet.
