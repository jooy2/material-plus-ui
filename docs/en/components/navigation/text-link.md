---
title: MPTextLink
order: 1
---

# MPTextLink

<p class="mp-lede">A link, in a sentence or on its own. Everything about it is deliberately smaller than a button — no surface, no height of its own, no colour unless asked. What it has is a line under it.</p>

<Demo src="text-link/hero" :minHeight="160" />

```tsx
import { MPTextLink } from 'material-plus-ui';

<MPTextLink href="/docs">the colour page</MPTextLink>
<MPTextLink href="https://m3.material.io" newTab>m3.material.io</MPTextLink>;
```

## Props

<PropsTable name="MPTextLink" />

Every native `<a>` attribute passes through, and a `ref` reaches the anchor.

## Three things a bare `<a>` does not do

It draws the underline on a schedule, it marks a link that opens a new tab both visibly and for a screen reader, and it takes `render`, so the `Link` a router brings can wear all of it.

## `color` and `size` have no default

A link in a paragraph is usually the paragraph's own colour with a line under it, and it is the size of the sentence it sits in. A component that arrived pre-dyed is one a page has to undo.

Set them for a link that stands on its own — in a footer, in a nav bar, as the last line of a card.

## Examples

### underline

<Demo src="text-link/underline">

<<< @/.vitepress/demos/text-link/underline.tsx

</Demo>

`always` is the default, and the reason is `color`: with no accent and no line there would be nothing at all distinguishing a link from the sentence around it.

That is also why this is not a boolean. "No underline" is a real choice for a link in a nav bar or a footer, where position already says what it is, and it should have to be spelled out rather than fallen into.

The line rests at 45% of whatever the text is and goes to the full colour under the pointer, so one rule works on an inherited colour and on an accent one. Hover deliberately leaves the _text_ colour alone: a link inside running prose that changes colour under the pointer drags the reader's eye off the line they were reading.

### newTab

A window changing under the reader is the one thing about a link that cannot be seen before it happens. So `newTab` does three things at once:

```html
<a href="…" target="_blank" rel="noopener noreferrer">
  Example
  <span>↗</span>
  <span class="visually-hidden">Opens in a new tab</span>
</a>
```

`noopener` is what stops the new page reaching back through `window.opener`; `noreferrer` is kept beside it for the browsers that still need the pair. The note is a real text node preceded by a space, so the accessible name comes out as two words rather than as the label with a bracket stuck to the end of it — and `newTabLabel` is how it gets written in the reader's language.

### icon

Left out, it follows `newTab`. That is the whole reason it is not a plain boolean with a `false` default: a link that takes over the window should say so, and a caller should have to ask for the silent version.

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

## This is not a button with an `href`

[MPButton](../actions/button) deliberately has no `href`, and this is the other half of that decision. A link is announced as a link, opens in a new tab on the middle mouse button, and shows its destination in the status bar; a button does none of those and should not pretend to.

## See also

- [MPButton](../actions/button) — when it is an action rather than a destination.
- [MPBreadcrumb](./breadcrumb) — a whole trail of them.
