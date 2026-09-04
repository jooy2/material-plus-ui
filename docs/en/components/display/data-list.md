---
title: MPDataList
order: 26
---

# MPDataList

<p class="mp-lede">A list of things and what they are called — a details panel, the summary of a record, the metadata under a heading. A real <code>&lt;dl&gt;</code> of real <code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code> pairs.</p>

<Demo src="data-list/hero" :minHeight="280" />

```tsx
import { MPDataList, MPDataListItem } from 'material-plus-ui';

<MPDataList>
  <MPDataListItem label="Status">Active</MPDataListItem>
  <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
</MPDataList>;
```

## Props

<PropsTable name="MPDataList" />

### MPDataListItem

<PropsTable name="MPDataListItem" />

## Why not a two-column table

Because the two are read differently, and the difference is the whole reason this is a component.

A table is a grid of **rows**, all of the same shape. A screen reader walks it as a grid: it announces column headers, it offers cell-by-cell navigation, it counts rows and columns. That is right for a set of records and wrong for one record's fields, where the "column headers" would be _Field_ and _Value_ and neither says anything.

This is a set of **pairs**, and each one is announced as "label, value". That is what a details panel actually is.

Reach for [MPTable](./table) when the same shape repeats down the page, and this when one thing is being described.

## The pair is a fragment

`MPDataListItem` renders no element of its own — the `<dt>` and the `<dd>` land as direct children of the `<dl>`. That is not an implementation detail you can work around: the grid lines every label up against every other, and a `<div>` between them would take the grid with it.

It also means a pair carries no `size` or `density` of its own. Those belong to the list, because a details panel with one row set tighter than its neighbours is not a thing anybody wants.

## Beside the value, or above it

`horizontal` puts the label in a column of its own, as wide as the widest label — which is what keeps every value starting at the same place without anybody measuring anything. Give `labelWidth` a number to fix it instead.

`vertical` stacks the label over the value. For a narrow column, and for values long enough that a label beside them would leave most of the row empty.

The two differ in one more place than the layout. With `dividers` on, a horizontal pair takes the hairline across both halves, because the `<dt>` and its `<dd>` share a grid row; a vertical pair takes it on the label only, because there the two are separate rows and a line between them would divide the one place in the list with nothing to divide.

## It draws no surface

No sheet, no padding, no corner. Put it in an [MPCard](../layout/card) when one is wanted, which is what makes the same list work inside a card, inside a popover, and loose under a heading.

## `density` moves the gaps and nothing else

A row here has no height of its own — it is text, and the gap is the whole of what there is to take. So each step takes MD3's own 4dp off both gaps directly, down to the width each one stops meaning at: four pixels between rows is the last that still reads as a break rather than as a line wrap, and eight between columns is the last that reads as two columns rather than as a word space.

The type scale does not move, which is the rule everywhere `density` appears.
