---
title: MPHighlight
order: 5
---

# MPHighlight

<p class="mp-lede">Marks the words a reader is looking for, inside text they were already reading. The component is the search, not just the styling: <code>query</code> is whatever a search box holds, and the matching re-runs on its own as it changes.</p>

<Demo src="highlight/hero" :minHeight="180" />

```tsx
import { MPHighlight } from 'material-plus-ui';

<MPHighlight query={search}>{article.summary}</MPHighlight>;
```

## Props

<PropsTable name="MPHighlight" />

Everything a `<span>` takes passes through, and the mark itself is a real `<mark>` — the element for text of relevance to the reader.

## There is no `size`, and it is the prop you will look for

A mark sits inside running text and has to be the size of the text it is inside. A `size` prop would only offer ways to be wrong.

This is the same reason [MPIcon](./icon) is off the ladder, and it is written down in [prop conventions](../../design/prop-conventions).

## Examples

### query

A string is one term. An array is several — the longest is tried first, so `['data', 'database']` marks the whole word rather than the first four letters of it. A `RegExp` is used as written, with the global flag forced on.

<Demo src="highlight/matching" :minHeight="200">

<<< @/.vitepress/demos/highlight/matching.tsx

</Demo>

`caseSensitive` and `wholeWord` are ignored for a `RegExp`, because a regular expression already says both of those things itself.

### variant

Four weights, and the default is the one that is actually a highlighter pen: `tonal` is a container tone — a pale wash under dark ink — rather than a word replaced by a block of colour.

<Demo src="highlight/variants" :minHeight="180">

<<< @/.vitepress/demos/highlight/variants.tsx

</Demo>

`elevated` is deliberately not offered. Elevation is a surface lifting off the page, and a mark is _inside_ a line of text — a raised word would cast a shadow onto the sentence it is part of.

### color

`tertiary` rather than `primary`, and this is the one place in the library where that is the right default. `primary` is what a page uses for the thing it wants pressed; a search match is not that, and a page whose marked words are the same colour as its buttons has two things competing to be the loudest thing on it.

### children

Elements are walked into and left otherwise untouched, so a match inside a `<strong>` is still marked and the `<strong>` survives.

```tsx
<MPHighlight query="cat">
  the <strong>cat</strong> sat
</MPHighlight>
```

Requiring a string instead is what most libraries do, and it fails on the first search result that has a `<strong>` in it.

## Accessibility

- The mark is a `<mark>`, which is announced as text of relevance to the reader.
- That has one consequence worth knowing: marking eleven words in a paragraph tells a screen reader that eleven things are important, which is a way of saying nothing. A highlight is for a handful of matches.
- The mark carries a hair of padding and the same hair back out as a negative margin, so a marked line is exactly as long as it was. Nothing on the page moves when a search runs.

## See also

- [MPTextField](../inputs/text-field) — the box the query usually comes from.
- [MPTypography](./typography) — the prose this sits inside.
