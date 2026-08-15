---
title: MPPagination
order: 15
---

# MPPagination

<p class="mp-lede">A row of pages, one of which is the one being read. Material has no pagination component, so what is Material here is everything around the decision: pills at the library's control heights, the current page filled with the accent under its own ink, and the state layer the specification uses in place of a hover colour.</p>

<Demo src="pagination/hero" :minHeight="140" />

```tsx
import { MPPagination } from 'material-plus-ui';

const [page, setPage] = useState(1);

<MPPagination count={20} page={page} onPageChange={setPage} />;
```

Fewer than two pages and the whole control renders nothing. One page is not a set of pages, and a row holding a lone disabled "1" is a control advertising that it has nothing to do.

## Props

<PropsTable name="MPPagination" />

## The window

<Demo src="pagination/window" :minHeight="380">

<<< @/.vitepress/demos/pagination/window.tsx

</Demo>

Three rules, and the third is the one most paginations get wrong:

1. `boundaryCount` pages stay pinned at each end whatever page you are on.
2. `siblingCount` pages stay either side of the current one.
3. **A gap of exactly one page is filled with that page rather than with an ellipsis.** `1 … 3 … 9` hides a single number behind a symbol wider than the number it replaced.

The row is also pinned to a constant number of slots. The window slides toward whichever end it is near instead of being clipped by it, so page 1 shows `1 2 3 4 5 … 20` and page 10 shows `1 … 9 10 11 … 20`. Which slots are pages and which are ellipses changes; how many there are does not — otherwise stepping from page 1 to page 2 would relayout the row and every cell would move out from under the pointer that just pressed one.

## getPageHref

Without it the row is buttons, and a crawler cannot press one. A paged list of articles, products or search results then exists for a reader and stops at page one for everything else.

```tsx
<MPPagination
  count={20}
  page={page}
  onPageChange={setPage}
  getPageHref={(n) => `/blog/page/${n}`}
/>
```

With it the numbers are real `<a href>`, the two steppers carry `rel="prev"` and `rel="next"`, and the browser's own behaviour comes back: open in a new tab, copy the address, see where a press is going before making it.

`onPageChange` still fires and the navigation is still cancelled first, so a client-side router keeps the page it already has. A press carrying ⌘, Ctrl, Shift or Alt is never cancelled — that is the reader asking the browser for a new tab, and it is not ours to take away.

Two cells stay buttons even so: **the page being read**, because the page you are already on is not somewhere to go, and **a stepper at the end of the row**, because `disabled` is not something an `<a>` can be. A link that only looks unavailable is one a keyboard still lands on and a crawler still follows.

## Localisation

Nothing in this row is drawn except the numbers, so every word it says is one a screen reader hears and nobody sees. Those come from the library's own table:

```tsx
<MPPagination count={20} locale="ko" />
```

`MPLocaleProvider` sets it for a whole application at once, and `labels` overrides one string at a time without losing the rest of the translation. See [Localisation](../../design/localization).

The row also carries a polite live region saying "Page 7 of 20" after every move. `aria-current` says which page is chosen; this says how many there are, which the list's length no longer does once an ellipsis is in it.

## Sizing

The cells are on the same control-height ladder as everything else, so a `sm` pagination lines up with a `sm` button beside it. `sm` is usually what a table footer wants — nine 56dp circles in a row is a wide row, and `md` is the size a form control is.

A cell is square until the number needs more room and grows by its inline padding after that, so a four-digit page is legible rather than clipped.

## When this is the wrong component

**For an unbounded or unknown number of results**, a "Load more" [MPButton](../inputs/button) or an infinite list is honest and this is not: a row of pages promises that the count is known.

**For moving through a set one at a time** — a photo, a record, a step — use two [MPIconButtons](../inputs/icon-button). A pagination is a map of a set; a stepper is a walk through one.

## Accessibility

- A `<nav>` landmark named from the locale's word for "Pagination", holding a `<ul>` — a list whose length says how far the pages go.
- `aria-current="page"` marks the page being read, and it is the only cell that claims anything.
- Every cell has a spoken name — "Page 4", "Next page" — because what is drawn is a digit or a chevron.
- The ellipsis is a `<span>`, not a disabled button: it is not a control that happens to be unavailable, it is punctuation. It is `aria-hidden`, because "horizontal ellipsis" read out between two numbers is noise.

## See also

- [MPBreadcrumb](./breadcrumb) — the other navigation row, and where the "you are here" rule comes from.
- [MPTable](./table) — what a pagination usually sits under.
- [Localisation](../../design/localization) — where the words come from.
