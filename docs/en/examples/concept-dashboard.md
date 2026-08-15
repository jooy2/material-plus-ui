---
title: Admin dashboard
order: 3
aside: false
---

# Admin dashboard

<p class="mp-lede">The back office of Grange, a shop that does not exist. A rail, a filter row, four figures, a table with an action on every row and a resizable split under it — all on one screen and all at the same size, which is the arrangement that shows whether a size ladder actually holds.</p>

<Demo src="concepts/dashboard" :minHeight="960" />

The source is one file: `docs/.vitepress/demos/concepts/dashboard.tsx`. The table is live — search it, filter it by channel, tick some rows and the bulk actions appear.

## What it is made of

| Block | Components used | Worth noticing |
| --- | --- | --- |
| Rail | `MPDrawer` `MPList` `MPChip` `MPCard` `MPProgressLinear` | `mode="standard"` is the same panel in the layout rather than over it, so a sidebar becoming a hamburger is one prop |
| App bar | `MPBreadcrumb` `MPBadge` `MPTooltip` `MPIconButton` `MPAvatar` | The rail's toggle is an icon button with a `label` that says what it will do, not what it is |
| Alert | `MPAlert` | `variant="tonal"` with an `action` — one thing to deal with, and the way to deal with it |
| Figures | `MPCard` `MPChip` `MPIcon` | A falling refund rate comes out green: the tile is told which direction is good news, rather than reading the sign |
| Filters | `MPTextField` `MPSelect` `MPDateRangePicker` | Three different controls, one height. That is what `size="sm"` means across the library |
| Bulk actions | `MPPill` `MPButton` `MPDialog` `MPSnackbarProvider` | They appear only with a selection; the destructive one confirms in a dialog and reports back in a snackbar |
| Table | `MPTabs` `MPTable` `MPCheckbox` `MPChip` `MPMenu` `MPContextMenu` `MPPagination` `MPEmpty` | Select-all is an `indeterminate` checkbox in the header cell; every row carries its own menu, and the whole table a context menu |
| Split | `MPPanes` `MPPane` `MPProgressBox` `MPProgressCircular` `MPTimeline` `MPSwitch` | The reader decides which half they are reading, so the divider between them is draggable |
| New order | `MPFloatingActionButton` | `position="absolute"` pins it to this sheet rather than to the window, which is what makes a FAB previewable |

## Notes

- `stickyHeader` keeps the column headings in place while the rows scroll under them.
- Every row menu's trigger carries the order number in its `label`, so each row action has an accessible name that says which row it belongs to.
- Filtering is ordinary React state. The table renders whatever it is handed and shows `MPEmpty` when that is nothing — the empty state is a component, not a branch that renders a sentence.
- The columns are built with `useMemo` inside the component rather than at module scope, because three of the six cells read state: the select-all box, each row's own box, and the menu that has to know its row.
