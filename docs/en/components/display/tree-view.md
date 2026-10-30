---
title: MPTreeView
order: 28
---

# MPTreeView

<p class="mp-lede">A tree of rows that open and shut. One widget with one tab stop, walked with the arrow keys — a file explorer, a category picker, a documentation sidebar.</p>

<Demo src="tree-view/hero" :minHeight="360" />

::: fw react

```tsx
import { MPTreeItem, MPTreeView } from 'material-plus-ui';

<MPTreeView label="Files" defaultExpanded={['src']}>
  <MPTreeItem value="src" label="src">
    <MPTreeItem value="index" label="index.ts" />
  </MPTreeItem>
</MPTreeView>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPTreeView(
  label: 'Files',
  initialExpanded: <Object>['src'],
  children: <MPTreeItem>[
    MPTreeItem(
      value: 'src',
      label: Text('src'),
      children: <MPTreeItem>[MPTreeItem(value: 'index', label: Text('index.ts'))],
    ),
  ],
);
```

:::

## Props

<PropsTable name="MPTreeView" />

### MPTreeItem

<PropsTable name="MPTreeItem" />

## What a tree owes, and where it is paid

There is no <Fw react="Base UI primitive" flutter="framework widget" /> under this, so the three things the pattern owes are most of the component:

- <Fw react="the `tree` / `treeitem` / `group` roles" flutter="a node per row that says whether it is open and whether it is chosen" />,
- **one** tab stop for the whole widget,
- and the arrow keys that walk it.

::: fw flutter

`children` and each row's `children` are lists of `MPTreeItem`s rather than of any widget, because the tree walks them to know which rows are showing and in what order the arrow keys reach them.

:::

The keyboard is handled once, at the top. A tree's arrow keys are questions about the _tree_ — what is the next visible row, where is my parent — and the only element that can answer them is the one holding all of them.

|              |                                                       |
| ------------ | ----------------------------------------------------- |
| Up, Down     | The previous and next visible row                     |
| Home, End    | The first and the last                                |
| Right        | Opens a shut branch; steps into an open one           |
| Left         | Shuts an open branch; steps out of a leaf             |
| Enter, Space | Presses the row — chooses it, and opens it on the way |

Right and Left swap under RTL. The direction is read off <Fw react="the element" flutter="the ambient `Directionality`" /> rather than off a prop, because a caller may have set it three ancestors up and ArrowRight has to mean "further in" either way.

## Why the disclosure arrow is not a button

The row is what takes focus, which is the ARIA pattern. A button inside it would be a second tab stop in a widget that is supposed to have exactly one — and the keyboard already opens a branch with ArrowRight.

So the arrow is a plain <Fw react="span with a click handler" flutter="tap target" />: a pointer target, and nothing a keyboard has to walk past. What it does is the interesting part — **it opens the branch without choosing the row**, which is the difference between pointing at a folder and opening one, and the only reason it is a target of its own.

## A shut branch is not there

It is unmounted rather than hidden, which is what makes the row order the arrow keys walk the same as the document order, and what keeps a tree of a thousand rows from rendering the nine hundred nobody has opened.

A branch that is _shutting_ is a third state. It has to stay in the document while it collapses or there would be nothing left to collapse, and for those couple of hundred milliseconds its rows are visible but no longer part of the tree: pressing Down on a folder you have just closed goes to the row after it, not back into it.

::: fw react

The collapse itself is a grid row going from `0fr` to `1fr`. Nothing is measured, a branch that gains a row while it is open grows with it, and a nested branch opening inside this one is carried by the same track.

:::

::: fw flutter

The collapse itself is the branch shown a shrinking share of its own height, for `short4` on the `standard` curve, and a cut under `MediaQuery.disableAnimations`. A branch that gains a row while it is open grows with it, and a nested branch opening inside this one is carried along.

:::

## `lines`

|  |  |
| --- | --- |
| `none` | Indentation only. Usually right for a navigation sidebar, where the tree is two levels deep and the labels say what the structure is. |
| `simple` | One hairline rail per level, running the full height of the group. Enough to follow a column of rows back to the branch it belongs to. |
| `folder` | The rail plus an elbow into every row, with the rail under a last child stopping at that row. The file-manager drawing, and the one for a deep tree. |

## Choosing

`selected` is <Fw react="an array" flutter="a list" /> even when only one row may be chosen at a time — the same shape [MPAccordion](../layout/accordion)'s value takes, so turning `multiple` on does not also change the type of the value.

Single select never empties. Pressing the chosen row again keeps it, because "nothing chosen" is a state a caller cannot get back to by pointing at a row; multi-select does toggle, which is what it is for.

## The row height leaves the control ladder

This is the one place in the library where a row deliberately does. A control is 56dp at `md` because MD3 draws a field at 56dp; a tree row is one line in a column of dozens, and six of them at 56 is a sidebar that shows six things.

The trade is worth stating: `md` at 40 is under the 48dp touch target, so a tree meant to be used with a thumb wants `lg`. That is the same judgement `density` makes when it lets a control down to 24.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultExpanded`, `defaultSelected` | `initialExpanded`, `initialSelected` | Flutter's word for a starting value the widget then keeps. |
| any children | `children: List<MPTreeItem>` | The tree walks the rows to know which are showing and in what order. |
| `string \| number` values | `Object` values | Any value with a working `==` identifies a row. |
| a generated value | the row's place in the tree | A row with no `value` is known by where it sits. |
| `href`, `render` | — | Flutter has no link element; a row that navigates calls the router from `onPressed`. |
| `onClick` | `onPressed` | Flutter's name. |
| `tree`, `treeitem`, `group` roles | selected and expanded states | Flutter has no tree roles; each row says whether it is open and whether it is chosen. |

:::
