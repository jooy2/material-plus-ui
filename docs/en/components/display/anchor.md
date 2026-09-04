---
title: MPAnchor
order: 24
---

# MPAnchor

<p class="mp-lede">The headings of the page being read, with the one the reader is in marked. A real <code>&lt;nav&gt;</code> of real fragment links, with the scroll tracking added on top rather than holding it up.</p>

<Demo src="anchor/hero" :minHeight="300" />

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

## Props

<PropsTable name="MPAnchor" />

## The links work before any of this runs

The rows are `<a href="#…">` in a `<nav>`, which is what makes them jump to their headings with JavaScript turned off, put them in the link list a screen reader can pull up, and let a middle-click open one in a tab. Watching the scroll is what is added on top.

The marked row carries `aria-current="location"` rather than `"true"`. That value means "where the reader is within a set of links", which is exactly what a table of contents reports; `"true"` means the current _page_, which is what a navigation menu's own entry says.

## The headings are given, not scraped

`items` is a list the caller already has. Whatever produced the page — an MDX pipeline, a CMS, a route's frontmatter — knows its own headings and the ids it wrote on them. A component that went looking for `<h2>`s in the document would be guessing at which of them were content and which were chrome, and would find the ones in the sidebar too.

An `href` names an `id`, and a heading with no `id` cannot be tracked. That is the one thing the caller has to get right.

## Two things that make the wrong row light up

**A sticky header.** A heading that has scrolled past the top of the page is still behind the bar, so the reader is looking at the section before it. `offset` is the height of the bar:

```tsx
<MPAnchor items={items} offset={64} />
```

**A scroller that is not the document.** An `MPPageLayout` with `scroll="content"` puts the page inside an element of its own, and the window never scrolls at all. `container` is where to look instead:

```tsx
const page = React.useRef<HTMLDivElement>(null);

<MPAnchor items={items} container={page} />;
```

## What it marks, and when it marks nothing

The rule is the last heading whose top has passed the line — the only rule that reads correctly while scrolling **up** as well as down.

Two consequences follow, and both are deliberate. At the top of a page nothing is marked, because the reader has not reached the first heading yet; marking it anyway would say they are in a section they have not got to. And at the bottom the last heading is marked whatever the measurement says, because the last section usually has less under it than a viewport — its top never reaches the line, and without the special case it is the one heading that can never be marked however far the reader scrolls.

Pass `activeHref` to decide yourself. Given it, the list stops watching the scroll entirely and says what it is told; `null` marks nothing.

## Nothing slides

The rail's lit segment is a border on the row, not a marker that travels between rows. A thing moving under a reader who is already moving is the one animation a table of contents should not have — and it is also the one that cannot be got right, since the marker and the scroll are answering the same gesture at two different speeds. The colour transitions; the position does not.

## `depth` indents, and nothing else

The list stays flat however deep the headings go. A nested `<ul>` in a table of contents is announced as a list inside a list, which tells a reader who has just been told there are twelve headings nothing they needed.
