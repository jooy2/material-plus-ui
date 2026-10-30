---
title: MPBreadcrumb
order: 2
---

# MPBreadcrumb

<p class="mp-lede">The trail of pages above the one being read. The last step is where the reader already is, so it is not a link at all — and a trail seven levels deep folds its middle away behind a <code>…</code>.</p>

<Demo src="breadcrumb/hero" :minHeight="140" />

::: fw react

```tsx
import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

<MPBreadcrumb maxItems={4}>
  <MPBreadcrumbItem href="/">Home</MPBreadcrumbItem>
  <MPBreadcrumbItem href="/components">Components</MPBreadcrumbItem>
  <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
</MPBreadcrumb>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPBreadcrumb(
  maxItems: 4,
  children: <Widget>[
    MPBreadcrumbItem(onPressed: goHome, child: const Text('Home')),
    MPBreadcrumbItem(onPressed: goComponents, child: const Text('Components')),
    const MPBreadcrumbItem(child: Text('Breadcrumb')),
  ],
)
```

:::

## Props

<PropsTable name="MPBreadcrumb" />

### MPBreadcrumbItem

<PropsTable name="MPBreadcrumbItem" />

## The last step is the page you are on

::: fw react

It carries `aria-current="page"` and stops being pressable, and the component works that out rather than asking every caller to remember it.

`current` on an earlier step moves the mark — and takes it off the last one, because exactly one element in a trail may carry it. Doing that by hand would mean writing `current={false}` on a step that never asked for it.

`aria-current="page"` rather than `"true"`: a trail is navigation, and the step the reader is on is a _page_, not the chosen one of a set of options.

:::

::: fw flutter

It is drawn in the full ink, one weight up, stops being pressable and is announced as selected, the nearest the framework has to `aria-current="page"`. The trail works that out and tells the step, rather than asking every caller to remember it.

`current` on an earlier step moves the mark, and takes it off the last one, because only one step in a trail can be the page the reader is on. Doing that by hand would mean writing `current: false` on a step that never asked for it.

:::

## The fold

A trail seven levels deep is a trail nobody reads. `maxItems` collapses the middle to a `…` that puts it back when pressed.

::: fw react

```tsx
<MPBreadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
```

:::

::: fw flutter

```dart
MPBreadcrumb(maxItems: 3, itemsBeforeCollapse: 1, itemsAfterCollapse: 1, children: steps)
```

:::

It only folds when it would actually remove something. With `1` before and `1` after on a three-step trail the `…` would stand in for exactly one step — which is longer than the step it replaced — so nothing happens.

Turning `expandable` off leaves the fold as a plain mark for a trail that should not grow under the reader.

## Examples

### separator

<Demo src="breadcrumb/separators">

::: fw react

<<< @/.vitepress/demos/breadcrumb/separators.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/breadcrumb/separators.dart

:::

</Demo>

Four named marks rather than a free-for-all, because a separator is read hundreds of times a day and the difference between them is meaning, not decoration: a `chevron` and an `arrow` say "and then", a `slash` says "path", a `dot` says "these are peers of one thing". Anything else can still be passed as a node, or as a widget in Flutter.

The two that point turn back under RTL, because a trail runs the way the language does.

The separators are drawn by the trail rather than by the steps. A step does not know whether anything follows it, and a mark that belonged to a step would have to be taken off the last one by hand.

::: fw react

### Three shapes per step

The caller picks by what they pass:

```tsx
<MPBreadcrumbItem href="/docs">A link</MPBreadcrumbItem>
<MPBreadcrumbItem onClick={back}>A button</MPBreadcrumbItem>
<MPBreadcrumbItem>The page you are on</MPBreadcrumbItem>
```

:::

::: fw flutter

### Two shapes per step

A step with `onPressed` goes somewhere, and is a link on the semantics tree. A step without one is plain text, which is what the page you are on is:

```dart
MPBreadcrumbItem(onPressed: () => router.go('/docs'), child: const Text('Docs'))
const MPBreadcrumbItem(child: Text('The page you are on'))
```

:::

## A step is not a chip

The hover tint is `corner-extra-small` at the bottom of the ladder, deliberately. `corner-full` on a line of text 20px tall is a pill, and a trail of pills is a row of filter chips.

::: fw react

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

:::

## Accessibility

::: fw react

- The trail is a `<nav>` with `aria-label="Breadcrumb"`, which is how a screen reader tells it from the other three navs on the page. `label` translates it.
- The separators are `aria-hidden` — they are punctuation, not steps.
- The `…` is a real button with a name of its own (`expandLabel`).
- The `<ol>` says `role="list"` out loud, because a host reset may take the markers off and Safari takes the list semantics off with them.

:::

::: fw flutter

- The trail is one node named "Breadcrumb", with each step a node of its own inside it. `semanticLabel` renames it and `locale` translates the default.
- The separators are left off the semantics tree. They are punctuation, not steps.
- A step that goes somewhere is a link with a focus stop and <kbd>Enter</kbd> to follow it. A disabled one is still a link, announced as unavailable, and takes no focus.
- The `…` is a button with a name of its own (`expandLabel`), and pressing it builds the steps it stood in for.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `href` and `render` on a step | `onPressed` | There is no URL and no link element. `onPressed` is where the app's router is called. |
| a step with `onClick` is a `<button>` | every step with `onPressed` is a link | A step goes somewhere either way, and without an `href` to tell the two apart, a link is what it is. |
| folded steps kept in the markup, hidden | folded steps not built | Nothing crawls a Flutter screen for its links, so there is nothing to keep them for. |
| `structuredData` | — | schema.org microdata is for a search engine reading HTML. |
| `label` | `semanticLabel` | The name is for a screen reader only, as React's `aria-label` is. |
| `separator`, a name or a node | `separator`, an `MPBreadcrumbSeparator` or a widget, typed `Object` | Dart has no union type. `MPIcon.icon` takes the same shape. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPTextLink](./text-link) — one link, rather than a trail of them.
- [MPTimeline](../display/timeline) — a record of what happened, rather than a path you can walk back up.
