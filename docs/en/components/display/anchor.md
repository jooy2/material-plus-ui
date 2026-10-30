---
title: MPAnchor
order: 24
---

# MPAnchor

<p class="mp-lede">The headings of the page being read, with the one the reader is in marked as the page scrolls. The rows go to their headings on their own, and the tracking is added on top rather than holding them up.</p>

<Demo src="anchor/hero" :minHeight="300" />

::: fw react

```tsx
import { MPAnchor } from 'material-plus-ui';

<MPAnchor
  items={[
    { href: '#install', label: 'Install' },
    { href: '#usage', label: 'Usage' },
    { href: '#options', label: 'Options', depth: 1 }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAnchor(
  items: <MPAnchorItem>[
    MPAnchorItem(target: _install, label: const Text('Install')),
    MPAnchorItem(target: _usage, label: const Text('Usage')),
    MPAnchorItem(target: _options, label: const Text('Options'), depth: 1),
  ],
)
```

Each `target` is a `GlobalKey` on the heading widget the row points at.

:::

## Props

<PropsTable name="MPAnchor" />

::: fw flutter

### MPAnchorItem

<PropsTable name="MPAnchorItem" />

:::

::: fw react

## The links work before any of this runs

The rows are `<a href="#…">` in a `<nav>`, which is what makes them jump to their headings with JavaScript turned off, put them in the link list a screen reader can pull up, and let a middle-click open one in a tab. Watching the scroll is what is added on top.

The marked row carries `aria-current="location"` rather than `"true"`. That value means "where the reader is within a set of links", which is exactly what a table of contents reports; `"true"` means the current _page_, which is what a navigation menu's own entry says.

### Unless a router takes the click

VitePress, Docusaurus, Astro and Nuxt all claim same-page hash clicks, cancel them, and scroll the **window** to where they think the target is. Give `container` and the window is the one scrollport they cannot mean: the page jumps and the panel stays where it was.

So a press that has already been cancelled by the time it reaches the rows is one the rows answer themselves — they scroll `container` to the heading, `offset` included. A press nobody cancelled is left exactly as it was, because the browser already does all of it: the scroll, the hash and the history entry. Without `container` nothing is bound at all.

:::

::: fw flutter

## A row brings its heading to the line

Pressing a row, or pressing <kbd>Enter</kbd> on it, scrolls the view its heading sits in so the heading lands `offset` below the top, which is the same line the tracking reads. It is a jump rather than an animation, as a fragment link lands in the React build.

A screen has no URL to write a fragment into and nothing crawls it for links, so there is no link element to fall back on. Each row is a link on the semantics tree with a focus stop of its own, and the marked row is announced as selected, the nearest the framework has to `aria-current="location"`.

:::

## The headings are given, not scraped

::: fw react

`items` is a list the caller already has. Whatever produced the page — an MDX pipeline, a CMS, a route's frontmatter — knows its own headings and the ids it wrote on them. A component that went looking for `<h2>`s in the document would be guessing at which of them were content and which were chrome, and would find the ones in the sidebar too.

An `href` names an `id`, and a heading with no `id` cannot be tracked. That is the one thing the caller has to get right.

:::

::: fw flutter

`items` is a list the caller already has. Whatever built the screen knows its own headings, and a component that went looking for them in the widget tree would be guessing which were content and which were chrome.

A `target` is a `GlobalKey` on the heading widget, and a heading that key is on nowhere cannot be tracked. That is the one thing the caller has to get right.

:::

## Two things that make the wrong row light up

**A sticky header.** A heading that has scrolled past the top of the page is still behind the bar, so the reader is looking at the section before it. `offset` is the height of the bar:

::: fw react

```tsx
<MPAnchor items={items} offset={64} />
```

:::

::: fw flutter

```dart
MPAnchor(items: items, offset: 64)
```

:::

::: fw react

**A scroller that is not the document.** An `MPPageLayout` with `scroll="content"` puts the page inside an element of its own, and the window never scrolls at all. `container` is where to look instead:

```tsx
const page = React.useRef<HTMLDivElement>(null);

<MPAnchor items={items} container={page} />;
```

:::

::: fw flutter

**The wrong scroll view.** The list follows the scroll view its first heading sits in, so a panel that scrolls on its own needs nothing more. When the headings sit in more than one, or the one to follow is further out, `controller` names it:

```dart
MPAnchor(items: items, controller: _page)
```

:::

## What it marks, and when it marks nothing

The rule is the last heading whose top has passed the line — the only rule that reads correctly while scrolling **up** as well as down.

Two consequences follow, and both are deliberate. At the top of a page nothing is marked, because the reader has not reached the first heading yet; marking it anyway would say they are in a section they have not got to. And at the bottom the last heading is marked whatever the measurement says, because the last section usually has less under it than a viewport — its top never reaches the line, and without the special case it is the one heading that can never be marked however far the reader scrolls.

::: fw react

Pass `activeHref` to decide yourself. Given it, the list stops watching the scroll entirely and says what it is told; `null` marks nothing.

:::

::: fw flutter

Pass `activeTarget` to decide yourself. Given it, the list stops watching the scroll entirely and says what it is told. `null` hands the marking back to the scroll.

:::

## Nothing slides

The rail's lit segment is a border on the row, not a marker that travels between rows. A thing moving under a reader who is already moving is the one animation a table of contents should not have — and it is also the one that cannot be got right, since the marker and the scroll are answering the same gesture at two different speeds. The colour transitions; the position does not.

## `depth` indents, and nothing else

The list stays flat however deep the headings go. A nested list in a table of contents is announced as a list inside a list, which tells a reader who has just been told there are twelve headings nothing they needed.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `href` on an item | `target`, a `GlobalKey` | A screen has no fragment to point into. What the list measures is a widget's position, and a key is the handle on one. |
| `container`, a ref | `controller`, optional | Without one the list finds the scroll view its headings sit in, which the document is by default in React. |
| `activeHref={null}` marks nothing | — | `activeTarget: null` means "follow the scroll". A controlled list always marks one row. |
| `label` | `semanticLabel` | The name is for a screen reader only, as React's `aria-label` is. |
| real `<a>` links, and the router fallback | a press that jumps the scroll view | There is no URL, no middle-click and no crawler. The press does what the browser does for a fragment link. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::
