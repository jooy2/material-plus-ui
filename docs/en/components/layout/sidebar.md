---
title: MPSidebar
order: 17
---

# MPSidebar

<p class="mp-lede">A column beside the page's content, and a drawer once the window is too narrow to hold one. MD3's standard and modal navigation drawers, as one component.</p>

<Demo src="sidebar/hero" :minHeight="340" />

::: fw react

```tsx
import { MPPageLayout, MPSidebar, MPList, MPListItem } from 'material-plus-ui';

<MPPageLayout sidebar={<MPSidebar title="Sections">…</MPSidebar>}>…</MPPageLayout>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPageLayout(
  sidebar: MPSidebar(title: const Text('Sections'), child: navigation),
  child: page,
)
```

:::

## Props

<PropsTable name="MPSidebar" />

## Two presentations of one panel

This is exactly the distinction MD3 draws. The **standard** navigation drawer is part of the layout and the content is laid out around it; below an expanded window the same destinations arrive as a **modal** drawer over a scrim, with a focus trap, an Escape and a way back to the trigger.

They are one component here for two reasons.

A caller should not have to swap components at a breakpoint — the destinations are the same destinations, and a page that rendered `<MPSidebar>` above 840dp and `<MPDrawer>` below it would be a page maintaining two lists.

And the children exist **once** either way. Two components would mean both trees in the document, one of them hidden — which a screen reader reads twice and a form submits twice.

## collapseBelow

<Demo src="sidebar/collapse" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/sidebar/collapse.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/sidebar/collapse.dart

:::

</Demo>

The window size class below which the column becomes a drawer. It comes from the [MPPageLayout](./page-layout), where it is set once for both sidebars, and `expanded` is MD3's own answer — the specification gives a standard drawer to an expanded window and puts the same destinations behind a modal one below it.

Outside a layout the default is `none`, which is a deliberate refusal: a sidebar that collapsed with nothing on the page able to bring it back is a sidebar the reader has lost. The thing that brings it back is [MPSidebarTrigger](#mpsidebartrigger), and it needs a layout to talk to.

::: fw react

### Which one is showing is answered twice, on purpose

In CSS for the first paint, and in JavaScript from then on.

The markup a server sends is the **column**, because a collapsed sidebar is a modal drawer, a modal drawer is a portal into `document.body`, and there is no body to portal into while the markup is being rendered. So a narrow screen would draw a full-width sidebar and throw it away a moment later. The class that hides the column below the breakpoint is what stops that, and `matchMedia` is what decides — once there is a window to ask — that the drawer should exist at all.

### A crawler at a phone's width

Collapsed, the sidebar is a closed modal drawer, and a closed drawer is not on the page — so below `collapseBelow` its links leave the document a crawler renders at a phone's width, and a search engine indexing the mobile page does not see them. `keepMounted` keeps them in the document, hidden, while the drawer is closed. Give it to a sidebar that is the site's navigation.

:::

::: fw flutter

### Which one is showing is answered once

The width is known on the first frame, so the sidebar builds the shape it needs and nothing else. Inside a layout the width is the one the layout was given; a sidebar on its own with a `collapseBelow` of its own reads the window's.

The drawer comes in from the edge its side belongs to, `left` for a leading sidebar in English and `right` in Arabic, and holds the focus while it is open. Escape, the system back, the scrim and its close button all close it, and the focus goes back where it came from.

:::

## The surface

The **container** ladder, because a sidebar holds somebody else's content and dyeing it would dye theirs.

`outlined` is the default: the page's own surface, with a hairline down the edge that **faces the content**. The outer edge is against the window, where there is nothing on the other side of it to be separated from — the same single-edge rule [MPHeader](./header) and [MPDrawer](./drawer) draw.

Once it has collapsed, the weight here stops applying. What is on the screen then is an [MPDrawer](./drawer), which paints MD3's own navigation drawer surface — `surface-container-low` under a level-1 shadow — because at that point the panel has covered the page rather than sitting beside it.

## Width, and resizing

`size` is the column's default width, and `md` is 360px: MD3's own navigation drawer, and the same rung [MPDrawer](./drawer) is drawn at, so a sidebar is exactly as wide as the drawer it becomes.

<Demo src="sidebar/resizable" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/sidebar/resizable.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/sidebar/resizable.dart

:::

</Demo>

::: fw react

`resizable` puts a handle on the inner edge. It straddles the edge rather than sitting inside it — a hairline one pixel wide is a target one pixel wide, which is not a target — and it is a real `separator` with a tab stop, so the arrow keys move it too.

The drag writes the width straight onto the element rather than into state. Nothing in the tree depends on the number except one CSS declaration, and a `setState` per pointer move would re-render every row in the sidebar to change it. What the caller hears is `onResize` on every step and `onResizeEnd` once it settles — and the second is the number worth storing, because a width the reader chose is a width they expect to find again.

:::

::: fw flutter

`resizable` puts a handle on the inner edge. It straddles the edge rather than sitting inside it — a hairline one pixel wide is a target one pixel wide, which is not a target — and it takes the focus, so the arrow keys move it 16 pixels at a time. Flutter's semantics have no `separator`, so a screen reader meets it as a slider whose value is the width in pixels, and its increase and decrease actions move the edge too.

The drag writes the width into a `ValueNotifier` rather than into `setState`. Nothing in the column depends on the number except one `SizedBox`, and a rebuild per pointer move would rebuild every row in the sidebar to change it. What the caller hears is `onResize` on every step and `onResizeEnd` once it settles, and the second is the number worth storing. A new `width` given to the widget outranks whatever it was dragged to.

:::

An explicit `width` survives the change of shape; the default one does not. A column sized against the article beside it and a panel sized against a phone are two different numbers, and the drawer's own ladder already knows the second.

## Two sidebars

The layout has two slots, and each is a full sidebar with its own width, its own drawer and its own trigger:

::: fw react

```tsx
<MPPageLayout
  sidebar={<MPSidebar label="Sections">…</MPSidebar>}
  endSidebar={
    <MPSidebar label="On this page" size="sm">
      …
    </MPSidebar>
  }
>
  …
</MPPageLayout>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebar: MPSidebar(label: 'Sections', child: sections),
  endSidebar: MPSidebar(label: 'On this page', size: MPSize.sm, child: outline),
  child: page,
)
```

:::

Neither needs a `side`: the layout tells each one which end it is on, and `start` and `end` are logical, so the pair swaps under RTL without anything being asked to.

## MPSidebarTrigger

The button that brings back a sidebar the window has become too narrow to hold.

<PropsTable name="MPSidebarTrigger" />

::: fw react

It is drawn only while that is true, and the "while" is a **media query** rather than a piece of state. That matters more than it looks: a trigger whose presence depended on `matchMedia` would be missing from the markup a server sends and would pop into the header a moment after the page arrived, on every phone, every time.

:::

::: fw flutter

It is drawn only while that is true. The layout knows its width on the first frame, so there is no first paint to hold together and the button is simply not built while the column is there. It is an icon button, an `MPButton` with a glyph and no label, `text` by default.

:::

Put it in an [MPHeader](./header)'s `brand` slot, ahead of the mark:

::: fw react

```tsx
<MPHeader
  brand={
    <>
      <MPSidebarTrigger />
      Acme
    </>
  }
/>
```

:::

::: fw flutter

```dart
MPHeader(
  brand: const <Widget>[MPSidebarTrigger(), Text('Acme')],
)
```

:::

Its name changes with its state — "Open sidebar" becomes "Close sidebar" — because the button does. A control called "Open sidebar" that closes one is worse than an unnamed one.

Outside an [MPPageLayout](./page-layout) it renders **nothing at all**, rather than a button that does nothing: there is no sidebar it could be talking about.

## Examples

### A table of contents down the trailing side

::: fw react

```tsx
<MPSidebar side="end" size="sm" label="On this page" collapseBelow="none">
  <nav>…</nav>
</MPSidebar>
```

:::

::: fw flutter

```dart
MPSidebar(
  side: MPSidebarSide.end,
  size: MPSize.sm,
  label: 'On this page',
  collapseBelow: MPPageCollapse.none,
  child: outline,
)
```

:::

### Closing the drawer on a route change

The layout owns whether each drawer is open, so a router closes it there:

::: fw react

```tsx
<MPPageLayout sidebarOpen={open} onSidebarOpenChange={setOpen} sidebar={<MPSidebar>…</MPSidebar>}>
```

:::

::: fw flutter

```dart
MPPageLayout(
  sidebarOpen: open,
  onSidebarOpenChange: (bool next) => setState(() => open = next),
  sidebar: MPSidebar(child: navigation),
  child: page,
)
```

:::

### A sidebar with no layout around it

It works, and it stays a column at every width — which is right for a panel that is part of a region rather than part of the page:

::: fw react

```tsx
<div style={{ display: 'flex' }}>
  <MPSidebar label="Filters" width={220} sticky={false}>
    …
  </MPSidebar>
  <div>…</div>
</div>
```

:::

::: fw flutter

```dart
Row(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: <Widget>[
    MPSidebar(label: 'Filters', width: 220, child: filters),
    Expanded(child: results),
  ],
)
```

Inside a page layout's content, a sidebar keeps its name and leaves the complementary role, which Flutter does not allow inside the main region.

:::

## Accessibility

::: fw react

- The column is an `<aside>`, which is the `complementary` landmark. It **names itself** — a page with two unnamed ones is a page a screen reader offers as two regions called "complementary" — and `label` replaces that default.
- The drawer is a dialog and always has a heading, even when the column it was did not need one, because a dialog with no heading has no accessible name.
- The resize handle is a `separator` with a name, a tab stop and arrow keys. A drag-only handle is a control a keyboard cannot reach.
- What goes **inside** is yours to mark up: a list of destinations wants a `<nav>` around it, so a screen reader can offer that as a region of its own.

:::

::: fw flutter

- The column claims `SemanticsRole.complementary` and **names itself**, and `label` replaces that default. Inside a page layout's content it keeps the name and leaves the role, which Flutter does not allow inside the main region.
- The drawer is a layer that holds the focus and always has a heading, even when the column it was did not need one. With no `title`, the heading is the sidebar's name and names the layer too.
- The resize handle is a slider with a name, a focus stop, arrow keys, and increase and decrease actions. A drag-only handle is a control a keyboard cannot reach.
- The trigger's name follows its state and it says whether the drawer is expanded, as `aria-expanded` does.
- What goes **inside** is yours to mark up.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `width`, `minWidth`, `maxWidth` as a number or a CSS length | `double` in logical pixels | There are no CSS units to parse. |
| `sticky` | — | The layout fills the space it is given and the column is always as tall as the band. There is no page scrolling past it. |
| `keepMounted` | — | It keeps a closed drawer's links in the document for a crawler. There is no document to crawl, and a closed drawer here builds nothing. |
| collapses into `MPDrawer` | collapses into a drawer of its own, drawn the way `MPDrawer`'s modal mode is | The surface, the width ladder, the heading, the close button, the scrim and the slide are the same. Nothing else differs to a reader. |
| collapse answered by a media query, then `matchMedia` | answered once, from the layout's width or the window's | The width is known on the first frame. |
| the trigger hidden by a media query | the trigger not built while the column is there | There is no first paint to hold together. |
| the handle as a `separator` with `aria-valuenow` | a slider with the width as its value | Flutter's semantics have no `separator` role and no `valuenow`. |
| `defaultOpen` | `initialOpen` | Flutter's own word for a starting value. |
| `children` | `child` | Flutter's own word for one widget. |
| `className`, `style`, `ref` | — | There is no class list, no style attribute and no element to pass through. |

:::

## See also

- [MPPageLayout](./page-layout) — the skeleton with the two slots.
- [MPDrawer](./drawer) — the panel this becomes, and the one to reach for when there is no layout to be part of.
- [MPHeader](./header) — where the trigger goes.
- [MPBottomNavigation](./bottom-navigation) — the compact-window pattern MD3 offers instead of a drawer when the destinations are few.
- [MPShow](./show) — showing one arrangement and not the other, for the parts of a page a sidebar's own collapse does not cover.
- [Breakpoints](../../design/breakpoints) — where `collapseBelow`'s classes begin, and how to move them.
