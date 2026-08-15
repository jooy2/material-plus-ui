---
title: MPBreadcrumb
order: 2
---

# MPBreadcrumb

<p class="mp-lede">The trail of pages above the one being read. The last step is where the reader already is, so it is not a link at all — and a trail seven levels deep folds its middle away behind a <code>…</code>.</p>

<Demo src="breadcrumb/hero" :minHeight="140" />

```tsx
import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

<MPBreadcrumb maxItems={4}>
  <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/components">Components</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>;
```

## Props

<PropsTable name="MPBreadcrumb" />

### MPBreadcrumbItem

<PropsTable name="MPBreadcrumbItem" />

## The last step is the page you are on

It carries `aria-current="page"` and stops being pressable, and the component works that out rather than asking every caller to remember it.

`current` on an earlier step moves the mark — and takes it off the last one, because exactly one element in a trail may carry it. Doing that by hand would mean writing `current={false}` on a step that never asked for it.

`aria-current="page"` rather than `"true"`: a trail is navigation, and the step the reader is on is a _page_, not the chosen one of a set of options.

## The fold

A trail seven levels deep is a trail nobody reads. `maxItems` collapses the middle to a `…` that puts it back when pressed.

```tsx
<MPBreadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
```

It only folds when it would actually remove something. With `1` before and `1` after on a three-step trail the `…` would stand in for exactly one step — which is longer than the step it replaced — so nothing happens.

`expandable={false}` leaves the fold as a plain mark for a trail that should not grow under the reader.

## Examples

### separator

<Demo src="breadcrumb/separators">

<<< @/.vitepress/demos/breadcrumb/separators.tsx

</Demo>

Four named marks rather than a free-for-all, because a separator is read hundreds of times a day and the difference between them is meaning, not decoration: a `chevron` and an `arrow` say "and then", a `slash` says "path", a `dot` says "these are peers of one thing". Anything else can still be passed as a node.

The two that point turn back under RTL, because a trail runs the way the language does.

The separators are drawn by the trail rather than by the steps. A step does not know whether anything follows it, and a mark that belonged to a step would have to be taken off the last one by hand.

### Three shapes per step

The caller picks by what they pass:

```tsx
<MPBreadcrumbItem href="/docs">A link</MPBreadcrumbItem>
<MPBreadcrumbItem onClick={back}>A button</MPBreadcrumbItem>
<MPBreadcrumbItem>The page you are on</MPBreadcrumbItem>
```

## A step is not a chip

The hover tint is `corner-extra-small` at the bottom of the ladder, deliberately. `corner-full` on a line of text 20px tall is a pill, and a trail of pills is a row of filter chips.

## structuredData

A trail is one of the few things on a page a search engine will redraw a result around: with `BreadcrumbList` markup it shows `Docs › Components › Breadcrumb` under the title instead of the bare URL.

```tsx
<MPBreadcrumb structuredData>
  <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/docs">Docs</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>
```

The `<ol>` becomes the `BreadcrumbList`, each `<li>` a `ListItem` carrying a `<meta>` position, the label becomes the `name`, and the `href` is read straight off the `<a>` — so the address a crawler follows and the address a reader follows cannot disagree. The step you are on carries no `item`, because the page you are already on is not somewhere to go.

It is **off by default**, and not out of timidity: a page may only claim one trail, so a component that emitted this unasked would collide with the JSON-LD a site already has in its `<head>`, and two trails is worse than none.

Turning it on turns `maxItems` off. `BreadcrumbList` positions have to run 1, 2, 3 with nothing missing, and the steps behind a `…` are not in the document to be numbered — a trail worth publishing is a trail worth showing.

## Accessibility

- The trail is a `<nav>` with `aria-label="Breadcrumb"`, which is how a screen reader tells it from the other three navs on the page. `label` translates it.
- The separators are `aria-hidden` — they are punctuation, not steps.
- The `…` is a real button with a name of its own (`expandLabel`).
- The `<ol>` says `role="list"` out loud, because a host reset may take the markers off and Safari takes the list semantics off with them.

## See also

- [MPTextLink](./text-link) — one link, rather than a trail of them.
- [MPTimeline](../display/timeline) — a record of what happened, rather than a path you can walk back up.
