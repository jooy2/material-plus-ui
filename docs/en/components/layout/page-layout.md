---
title: MPPageLayout
order: 14
---

# MPPageLayout

<p class="mp-lede">The skeleton a page is hung on: a header, a footer, one sidebar or two, and the content between them. What it is really for is the landmarks.</p>

<Demo src="page-layout/hero" :minHeight="320" />

```tsx
import { MPPageLayout, MPHeader, MPSidebar, MPFooter } from 'material-plus-ui';

<MPPageLayout
  header={<MPHeader brand="Acme" />}
  sidebar={<MPSidebar>…</MPSidebar>}
  footer={<MPFooter>© 2026 Acme</MPFooter>}
>
  <MPContainer maxWidth="md">…</MPContainer>
</MPPageLayout>;
```

## Props

<PropsTable name="MPPageLayout" />

## Why a layout is a component at all

Because of the landmarks.

A page assembled out of divs is a page a screen reader offers as one undifferentiated region and a crawler reads as one undifferentiated blob. The same page built out of `<header>`, `<nav>`, `<aside>`, `<main>` and `<footer>` has a table of contents: a screen reader lists the regions and jumps between them, a reader mode finds the article, a search engine can tell the navigation from the content.

This component contributes exactly one element of its own — a `<div>` with no meaning — plus the `<main>` and the link that jumps to it. Every other landmark comes from whatever was handed to a slot, which is why [MPHeader](./header), [MPFooter](./footer) and [MPSidebar](./sidebar) are real `<header>`, `<footer>` and `<aside>` elements rather than styled boxes.

## The arrangement is CSS, and that is the design

Everything that decides where a column goes is flexbox and a media query. Nothing about the shape of the page waits for JavaScript, so the layout is right in the first frame the browser paints and right on a page whose JavaScript never arrives.

Two things are measured, and only two: the header's height and the footer's. A column that holds its place has to start below a bar, and nobody but the bar knows how tall it is. Those numbers are written straight onto the root as custom properties rather than held in state — a `setState` per resize would re-render the whole page to change a `top`.

## headerSpan and footerSpan

<Demo src="page-layout/span" :minHeight="420">

<<< @/.vitepress/demos/page-layout/span.tsx

</Demo>

Which of the header and the sidebars takes the top corner. There is no third value, because there is no third arrangement.

|                  | `full`                           | `content`                            |
| ---------------- | -------------------------------- | ------------------------------------ |
| The bar reaches  | The whole width                  | Only the column between the sidebars |
| The sidebars run | From under the bar to the bottom | The full height of the window        |
| Which this is    | A website                        | An application                       |

`content` is MD3's own drawing of a standard navigation drawer: the drawer is the outermost thing on the screen and the app bar belongs to the pane it is over.

The two are separate props because the answers genuinely differ. A dashboard with a full-height navigation drawer still usually wants its copyright line under the content rather than under the drawer.

## scroll

<Demo src="page-layout/scroll" :minHeight="280">

<<< @/.vitepress/demos/page-layout/scroll.tsx

</Demo>

`page` — the default — is the document scrolling, the way a website does. The bars hold their place with `position: sticky`, a phone's address bar still hides on the way down, and the browser restores the scroll position on a back navigation. Almost every page wants this.

`content` takes the height of the window exactly and hands the scrolling to the region between the bars. Reach for it when the page is a workspace rather than a document: a mail client, an editor, a console.

Anything a `fixed` bar takes out of the flow is reserved by the layout, so the last paragraph is never underneath the footer.

## collapseBelow

The window size class below which the sidebars stop being columns and become drawers.

**MD3's own ladder, and MD3's own answer.** The specification does not offer a standard navigation drawer at every width: a drawer that is part of the layout is what an _expanded_ window gets, and a compact one gets the same destinations behind a modal drawer. So the default is `expanded`, and the values are [window size classes](../../design/prop-conventions#the-shared-types) rather than pixel widths.

Only an [MPSidebar](./sidebar) reads it — that is the component that knows how to be both things — and an [MPSidebarTrigger](./sidebar#mpsidebartrigger) is drawn exactly while the column is not.

`none` keeps the columns at every width. So does `compact`, whose floor is zero: there is no window below it.

## The skip link

On by default, and the one thing here that is not a style decision.

A keyboard reader arriving on a page whose navigation holds forty links has to walk past all forty on every page before reaching the article. This is the one link that spares them, and it costs a sighted reader nothing: it is clipped to a single pixel until it is tabbed to, and a real button from then on.

It is clipped rather than `hidden` deliberately. `display: none` would take it off the accessibility tree along with the screen, leaving nothing for the Tab key to find in the first place.

```tsx
// A different word, or a different destination.
<MPPageLayout skipLabel="Skip to the report" mainId="report">
  …
</MPPageLayout>
```

## Why it draws no gutter and no measure

That is [MPContainer](./container)'s job, and a layout that also did it would be a second spelling of one idea.

Put a container inside, where the decision belongs to the route rather than to the shell:

```tsx
<MPPageLayout header={<MPHeader brand="Acme" />}>
  <MPContainer maxWidth="md">The article, held to a medium window.</MPContainer>
</MPPageLayout>
```

The same page can then hold a full-width dashboard on one route and a 600dp article on the next, without the layout knowing which is showing.

## Why it takes no surface

No `variant`, no `color`, no shadow, for [MPContainer](./container#why-it-draws-no-surface)'s reason: the outermost element on a page is the one thing that must not decide what the page looks like.

The bars and the columns paint themselves. Between them is whatever the application's own background is.

## Examples

### A layout that is not the page

`height="auto"` takes the parent's height instead of the window's, which is what a shell inside a preview, a mockup or a pane of a larger tool wants:

```tsx
<div style={{ height: 400 }}>
  <MPPageLayout height="auto" scroll="content" header={<MPHeader brand="Preview" />}>
    …
  </MPPageLayout>
</div>
```

### Controlling the drawer from the router

The layout owns whether each sidebar's drawer is open, because a trigger anywhere on the page has to be able to talk to it. Control it here when the application already holds that state:

```tsx
<MPPageLayout
  sidebarOpen={navOpen}
  onSidebarOpenChange={setNavOpen}
  sidebar={<MPSidebar>…</MPSidebar>}
>
  …
</MPPageLayout>
```

### Naming the content region

```tsx
<MPPageLayout mainProps={{ 'aria-label': 'Search results' }}>…</MPPageLayout>
```

## Accessibility

- The `<main>` is the layout's, and there is exactly one. A second `<main>` on a page is an error every screen reader reports differently.
- The skip link is the **first** element in the layout, which is the only position that makes it useful.
- Every other landmark belongs to the component in the slot. Two `<aside>` elements on one page both need a name, or a screen reader offers two regions called "complementary" — see [MPSidebar](./sidebar#accessibility).
- The layout itself has no role and announces nothing.

## See also

- [MPHeader](./header) — the bar for the top slot.
- [MPFooter](./footer) — the sheet for the bottom one.
- [MPSidebar](./sidebar) — the column that becomes a drawer, and the trigger that brings it back.
- [MPContainer](./container) — the gutter and the measure, inside the `<main>`.
