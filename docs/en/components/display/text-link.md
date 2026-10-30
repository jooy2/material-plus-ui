---
title: MPTextLink
order: 1
---

# MPTextLink

<p class="mp-lede">A link, in a sentence or on its own. Everything about it is deliberately smaller than a button — no surface, no height of its own, no colour unless asked. What it has is a line under it.</p>

<Demo src="text-link/hero" :minHeight="160" />

::: fw react

```tsx
import { MPTextLink } from 'material-plus-ui';

<MPTextLink href="/docs">the colour page</MPTextLink>
<MPTextLink href="https://m3.material.io" newTab>m3.material.io</MPTextLink>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTextLink(onPressed: openColours, child: const Text('the colour page'));
MPTextLink(
  href: 'https://m3.material.io',
  newTab: true,
  onPressed: () => launchUrl(Uri.parse('https://m3.material.io')),
  child: const Text('m3.material.io'),
);
```

:::

## Props

<PropsTable name="MPTextLink" />

::: fw react

Every native `<a>` attribute passes through, and a `ref` reaches the anchor.

## Three things a bare `<a>` does not do

It draws the underline on a schedule, it marks a link that opens a new tab both visibly and for a screen reader, and it takes `render`, so the `Link` a router brings can wear all of it.

:::

::: fw flutter

## Going somewhere is `onPressed`'s job

Flutter has no address bar and no default navigation, so the link does not open anything itself. `onPressed` does: push a route, or hand the address to `url_launcher`. `href` is the address told to assistive technology, which on the web is written into the link the engine renders for a screen reader.

The link is announced as a link rather than as a button, and is followed by pointer or by <kbd>Enter</kbd> alone, as a link is on the web. It is ringed in `secondary` on keyboard focus.

Inside running text, set it in a `WidgetSpan` on the line's baseline, as the hero preview does:

```dart
Text.rich(TextSpan(children: <InlineSpan>[
  const TextSpan(text: 'see '),
  WidgetSpan(
    alignment: PlaceholderAlignment.baseline,
    baseline: TextBaseline.alphabetic,
    child: MPTextLink(onPressed: openColours, child: const Text('the colour page')),
  ),
  const TextSpan(text: ' for the whole table.'),
]))
```

:::

## `color` and `size` have no default

A link in a paragraph is usually the paragraph's own colour with a line under it, and it is the size of the sentence it sits in. A component that arrived pre-dyed is one a page has to undo.

Set them for a link that stands on its own — in a footer, in a nav bar, as the last line of a card.

## Examples

### underline

<Demo src="text-link/underline">

::: fw react

<<< @/.vitepress/demos/text-link/underline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_link/underline.dart

:::

</Demo>

`always` is the default, and the reason is `color`: with no accent and no line there would be nothing at all distinguishing a link from the sentence around it.

That is also why this is not a boolean. "No underline" is a real choice for a link in a nav bar or a footer, where position already says what it is, and it should have to be spelled out rather than fallen into.

The line rests at 45% of whatever the text is and goes to the full colour under the pointer, so one rule works on an inherited colour and on an accent one. Hover deliberately leaves the _text_ colour alone: a link inside running prose that changes colour under the pointer drags the reader's eye off the line they were reading.

### newTab

A window changing under the reader is the one thing about a link that cannot be seen before it happens.

::: fw react

So `newTab` does three things at once:

```html
<a href="…" target="_blank" rel="noopener noreferrer">
  Example
  <span>↗</span>
  <span class="visually-hidden">Opens in a new tab</span>
</a>
```

`noopener` is what stops the new page reaching back through `window.opener`; `noreferrer` is kept beside it for the browsers that still need the pair. The note is a real text node preceded by a space, so the accessible name comes out as two words rather than as the label with a bracket stuck to the end of it — and `newTabLabel` is how it gets written in the reader's language.

All three follow the `target` **attribute** rather than this prop, so writing `target="_blank"` out directly — or handing over a router's `Link` that carries one — gets the same `rel`, the same mark and the same note. It is the same window either way.

A `rel` of your own replaces the default rather than adding to it, which is what makes `rel="noopener noreferrer nofollow"` possible.

:::

::: fw flutter

So `newTab` draws the arrow leaving its box after the label and adds "Opens in a new tab" to what a screen reader hears, as a hint after the label; `newTabLabel` is how it gets written in the reader's language. It does not open a window: that is still `onPressed`, which knows how the app leaves itself.

:::

### icon

Left out, it follows `newTab`. That is the whole reason it is not a plain boolean with a `false` default: a link that takes over the window should say so, and a caller should have to ask for the silent version.

::: fw react

```tsx
<MPTextLink href="…" newTab />                  // the arrow leaving its box
<MPTextLink href="…" />                         // nothing
<MPTextLink href="…" icon />                     // the chain
<MPTextLink href="…" icon={<MyMark />} />        // yours
<MPTextLink href="…" newTab icon={false} />      // silent to the eye, not to a reader
```

### render

```tsx
import Link from 'next/link';

<MPTextLink href="/docs" render={<Link href="/docs" />}>
  Docs
</MPTextLink>;
```

## It survives a host stylesheet

`<a>` is, with `<td>`, one of the two tags a host stylesheet still styles by name — `.prose a`, `.vp-doc a`, every CSS framework ever — and all of those are a class plus a type, which outranks a plain utility.

So the colour and the underline are written through the component's own class, doubling it into the selector and taking it to two classes. A link that lost its colour and its line inside a `.prose` block would have lost the only two things it is.

:::

::: fw flutter

```dart
MPTextLink(newTab: true, onPressed: open, child: label)              // the arrow leaving its box
MPTextLink(onPressed: open, child: label)                            // nothing
MPTextLink(icon: true, onPressed: open, child: label)                // the chain
MPTextLink(icon: const MyMark(), onPressed: open, child: label)      // yours
MPTextLink(newTab: true, icon: false, onPressed: open, child: label) // silent to the eye, not to a reader
```

`icon` is typed `Object?`, because Dart has no union type: a `bool` or a widget, checked in debug.

:::

## This is not a button with an `href`

[MPButton](../inputs/button) deliberately has no `href`, and this is the other half of that decision. A link is announced as a link, opens in a new tab on the middle mouse button, and shows its destination in the status bar; a button does none of those and should not pretend to.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `href` opens the page | `onPressed` goes there | Flutter has no default navigation. `href` is still told to assistive technology. |
| `target`, `rel` | — | There is no window to open and no opener to close; `onPressed` decides how the app leaves itself. |
| the new-tab note as hidden text | a semantics hint | Read after the label, as the hidden text is. |
| `text-underline-offset`, `0.08em` weight | the font's own underline, a little heavier | Flutter draws the underline where the font puts it and scales the font's thickness rather than taking an `em`. |
| `render` | — | There is no polymorphic element. Wrap the router's own navigation in `onPressed`. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPButton](../inputs/button) — when it is an action rather than a destination.
- [MPBreadcrumb](./breadcrumb) — a whole trail of them.
