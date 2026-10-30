---
title: MPPageLayout
order: 14
---

# MPPageLayout

<p class="mp-lede">The skeleton a page is hung on: a header, a footer, one sidebar or two, and the content between them. What it is really for is the landmarks.</p>

<Demo src="page-layout/hero" :minHeight="320" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPageLayout(
  header: const MPHeader(brand: <Widget>[Text('Acme')]),
  sidebar: MPSidebar(child: navigation),
  footer: const MPFooter(child: Text('© 2026 Acme')),
  child: MPContainer(maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md), child: page),
)
```

:::

## Props

<PropsTable name="MPPageLayout" />

## Why a layout is a component at all

Because of the landmarks.

::: fw react

A page assembled out of divs is a page a screen reader offers as one undifferentiated region and a crawler reads as one undifferentiated blob. The same page built out of `<header>`, `<nav>`, `<aside>`, `<main>` and `<footer>` has a table of contents: a screen reader lists the regions and jumps between them, a reader mode finds the article, a search engine can tell the navigation from the content.

This component contributes exactly one element of its own — a `<div>` with no meaning — plus the `<main>` and the link that jumps to it. Every other landmark comes from whatever was handed to a slot, which is why [MPHeader](./header), [MPFooter](./footer) and [MPSidebar](./sidebar) are real `<header>`, `<footer>` and `<aside>` elements rather than styled boxes.

:::

::: fw flutter

A screen assembled out of anonymous boxes is a screen a screen reader offers as one undifferentiated region. The same screen built out of widgets that say what they are has a table of contents, which TalkBack and VoiceOver list and jump between.

The layout claims one role of its own, `SemanticsRole.main` around `child`, and adds the skip button that jumps to it. Every other region comes from whatever was handed to a slot: [MPSidebar](./sidebar) claims `SemanticsRole.complementary`, and [MPHeader](./header) and [MPFooter](./footer) say what they are in the same way.

:::

::: fw react

## The arrangement is CSS, and that is the design

Everything that decides where a column goes is flexbox and a media query. Nothing about the shape of the page waits for JavaScript, so the layout is right in the first frame the browser paints and right on a page whose JavaScript never arrives.

Two things are measured, and only two: the header's height and the footer's. A column that holds its place has to start below a bar, and nobody but the bar knows how tall it is. Those numbers are written straight onto the root as custom properties rather than held in state — a `setState` per resize would re-render the whole page to change a `top`.

:::

::: fw flutter

## The arrangement is a Column and a Row

The layout is a `Column` of a header, a band and a footer, and the band is a `Row` of the sidebars and the content. **It fills the space it is given**, so put it under something with a bounded height: a route's body, a `SizedBox.expand`, a pane. A column already starts below the bar above it, so nothing is measured to make that happen.

The one measurement is the layout's own width, taken with a `LayoutBuilder`, which is what `collapseBelow` is compared against.

:::

## headerSpan and footerSpan

<Demo src="page-layout/span" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/page-layout/span.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/page_layout/span.dart

:::

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

::: fw react

<<< @/.vitepress/demos/page-layout/scroll.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/page_layout/scroll.dart

:::

</Demo>

::: fw react

`page` — the default — is the document scrolling, the way a website does. The bars hold their place with `position: sticky`, a phone's address bar still hides on the way down, and the browser restores the scroll position on a back navigation. Almost every page wants this.

`content` takes the height of the window exactly and hands the scrolling to the region between the bars. Reach for it when the page is a workspace rather than a document: a mail client, an editor, a console.

Anything a `fixed` bar takes out of the flow is reserved by the layout, so the last paragraph is never underneath the footer.

:::

::: fw flutter

There is no `scroll` parameter. A Flutter screen has no document to scroll, so the layout always behaves as `scroll="content"` does: it is exactly the height it was given, the bars stay where they are, and the main region gets the height they leave.

What scrolls is whatever you put in `child`. The layout does not wrap it in a scroll view, because a `ListView` or a `CustomScrollView` there would then be a scroll view inside a scroll view. Hand it the scroll view you want, as the preview does.

:::

## collapseBelow

The window size class below which the sidebars stop being columns and become drawers.

**MD3's own ladder, and MD3's own answer.** The specification does not offer a standard navigation drawer at every width: a drawer that is part of the layout is what an _expanded_ window gets, and a compact one gets the same destinations behind a modal drawer. So the default is `expanded`, and the values are [window size classes](../../design/prop-conventions#the-shared-types) rather than pixel widths.

Only an [MPSidebar](./sidebar) reads it — that is the component that knows how to be both things — and an [MPSidebarTrigger](./sidebar#mpsidebartrigger) is drawn exactly while the column is not.

`none` keeps the columns at every width. So does `compact`, whose floor is zero: there is no window below it.

::: fw flutter

The width compared is the one the layout was given, not the window's. On a screen they are the same width; an app shell inside a pane collapses when the pane is narrow, which a media query cannot do. The boundaries are the ones an `MPConfigProvider` sets, so a page that moved one moves its sidebars with it.

:::

## The skip link

On by default, and the one thing here that is not a style decision.

A keyboard reader arriving on a page whose navigation holds forty links has to walk past all forty on every page before reaching the article. This is the one link that spares them, and it costs a sighted reader nothing: it is clipped to a single pixel until it is tabbed to, and a real button from then on.

::: fw react

It is clipped rather than `hidden` deliberately. `display: none` would take it off the accessibility tree along with the screen, leaving nothing for the Tab key to find in the first place.

```tsx
// A different word, or a different destination.
<MPPageLayout skipLabel="Skip to the report" mainId="report">
  …
</MPPageLayout>
```

:::

::: fw flutter

In Flutter it is a button rather than a link: the first stop in the focus order whatever traversal policy the app uses, a single pixel until the keyboard reaches it, and a `primary` pill pinned to the leading corner from then on. Pressing it moves the focus to the main region, which can hold the focus but is not a Tab stop itself, so the next Tab lands on the first control inside the content.

```dart
MPPageLayout(skipLabel: 'Skip to the report', child: report)
```

:::

## Why it draws no gutter and no measure

That is [MPContainer](./container)'s job, and a layout that also did it would be a second spelling of one idea.

Put a container inside, where the decision belongs to the route rather than to the shell:

::: fw react

```tsx
<MPPageLayout header={<MPHeader brand="Acme" />}>
  <MPContainer maxWidth="md">The article, held to a medium window.</MPContainer>
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  header: const MPHeader(brand: <Widget>[Text('Acme')]),
  child: const MPContainer(
    maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
    child: Text('The article, held to a medium window.'),
  ),
)
```

:::

The same page can then hold a full-width dashboard on one route and a 600dp article on the next, without the layout knowing which is showing.

## Why it takes no surface

No `variant`, no `color`, no shadow, for [MPContainer](./container#why-it-draws-no-surface)'s reason: the outermost element on a page is the one thing that must not decide what the page looks like.

The bars and the columns paint themselves. Between them is whatever the application's own background is.

## Examples

### A layout that is not the page

::: fw react

`height="auto"` takes the parent's height instead of the window's, which is what a shell inside a preview, a mockup or a pane of a larger tool wants:

```tsx
<div style={{ height: 400 }}>
  <MPPageLayout height="auto" scroll="content" header={<MPHeader brand="Preview" />}>
    …
  </MPPageLayout>
</div>
```

:::

::: fw flutter

A Flutter layout always takes its parent's height, so a shell inside a preview, a mockup or a pane of a larger tool needs nothing more than a box of that size:

```dart
SizedBox(
  height: 400,
  child: MPPageLayout(header: const MPHeader(brand: <Widget>[Text('Preview')]), child: preview),
)
```

:::

### Controlling the drawer from the router

The layout owns whether each sidebar's drawer is open, because a trigger anywhere on the page has to be able to talk to it. Control it here when the application already holds that state:

::: fw react

```tsx
<MPPageLayout
  sidebarOpen={navOpen}
  onSidebarOpenChange={setNavOpen}
  sidebar={<MPSidebar>…</MPSidebar>}
>
  …
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebarOpen: navOpen,
  onSidebarOpenChange: (bool open) => setState(() => navOpen = open),
  sidebar: MPSidebar(child: navigation),
  child: page,
)
```

:::

### Naming the content region

::: fw react

```tsx
<MPPageLayout mainProps={{ 'aria-label': 'Search results' }}>…</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(mainSemanticLabel: 'Search results', child: results)
```

Two layouts side by side are two main regions, and Flutter refuses two unnamed ones in a debug build with semantics on. Give each a name.

:::

## Accessibility

::: fw react

- The `<main>` is the layout's, and there is exactly one. A second `<main>` on a page is an error every screen reader reports differently.
- The skip link is the **first** element in the layout, which is the only position that makes it useful.
- Every other landmark belongs to the component in the slot. Two `<aside>` elements on one page both need a name, or a screen reader offers two regions called "complementary" — see [MPSidebar](./sidebar#accessibility).
- The layout itself has no role and announces nothing.

:::

::: fw flutter

- The main region is the layout's, and there is one per screen. A layout inside another layout claims none and draws no skip button, because the screen has both already.
- The skip button is the **first** stop in the focus order, which is the only position that makes it useful.
- Every other region belongs to the widget in the slot. A sidebar placed in the content rather than in a slot keeps its name and leaves the complementary role, which Flutter does not allow inside the main region.
- The layout's own wrapper has no role and announces nothing.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `scroll`, `height` | — | The layout fills the space it is given and the main region gets what the bars leave. There is no document to scroll instead of a region, and what scrolls is whatever is put in `child`. |
| `collapseBelow` measured against the window | measured against the layout's own width | A `LayoutBuilder` can ask what a media query cannot, so a shell inside a pane collapses with the pane. On a full screen the two are the same width. |
| the bars' heights measured onto custom properties | — | A `Column` already starts the band below the header. |
| a skip link to `#main` | a skip button that moves the focus | There are no fragment links. The main region takes the focus by script, as the `<main>` with `tabIndex={-1}` does. |
| `mainId`, `mainProps` | `mainSemanticLabel` | There is no element to give an id to. The name is the one thing `mainProps` was used for that has a counterpart. |
| `defaultSidebarOpen`, `defaultEndSidebarOpen` | `initialSidebarOpen`, `initialEndSidebarOpen` | Flutter's own word for a starting value. |
| `children` | `child` | Flutter's own word for one widget. |
| `className`, `style`, `ref` | — | There is no class list, no style attribute and no element to pass through. |

:::

## See also

- [MPHeader](./header) — the bar for the top slot.
- [MPFooter](./footer) — the sheet for the bottom one.
- [MPSidebar](./sidebar) — the column that becomes a drawer, and the trigger that brings it back.
- [MPContainer](./container) — the gutter and the measure, inside the `<main>`.
