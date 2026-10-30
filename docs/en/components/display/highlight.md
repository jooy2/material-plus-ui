---
title: MPHighlight
order: 5
---

# MPHighlight

<p class="mp-lede">Marks the words a reader is looking for, inside text they were already reading. The component is the search, not just the styling: <code>query</code> is whatever a search box holds, and the matching re-runs on its own as it changes.</p>

<Demo src="highlight/hero" :minHeight="180" />

::: fw react

```tsx
import { MPHighlight } from 'material-plus-ui';

<MPHighlight query={search}>{article.summary}</MPHighlight>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPHighlight(article.summary, query: search);
```

:::

## Props

<PropsTable name="MPHighlight" />

::: fw react

Everything a `<span>` takes passes through, and the mark itself is a real `<mark>` — the element for text of relevance to the reader.

:::

::: fw flutter

The text is the first positional argument, and `style`, `align` and `lines` are `Text`'s own. Each mark is a `WidgetSpan` laid on the line's baseline.

:::

## There is no `size`, and it is the prop you will look for

A mark sits inside running text and has to be the size of the text it is inside. A `size` prop would only offer ways to be wrong.

This is the same reason [MPIcon](./icon) is off the ladder, and it is written down in [prop conventions](../../design/prop-conventions).

## Examples

### query

A string is one term. An array (a `List<String>` in Flutter) is several — the longest is tried first, so `['data', 'database']` marks the whole word rather than the first four letters of it. A `RegExp` is used as written, matching every occurrence.

<Demo src="highlight/matching" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/highlight/matching.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/highlight/matching.dart

:::

</Demo>

`caseSensitive` and `wholeWord` are ignored for a `RegExp`, because a regular expression already says both of those things itself.

### variant

Four weights, and the default is the one that is actually a highlighter pen: `tonal` is a container tone — a pale wash under dark ink — rather than a word replaced by a block of colour.

<Demo src="highlight/variants" :minHeight="180">

::: fw react

<<< @/.vitepress/demos/highlight/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/highlight/variants.dart

:::

</Demo>

`elevated` is deliberately not offered. Elevation is a surface lifting off the page, and a mark is _inside_ a line of text — a raised word would cast a shadow onto the sentence it is part of.

### color

`tertiary` rather than `primary`, and this is the one place in the library where that is the right default. `primary` is what a page uses for the thing it wants pressed; a search match is not that, and a page whose marked words are the same colour as its buttons has two things competing to be the loudest thing on it.

### children

::: fw react

Elements are walked into and left otherwise untouched, so a match inside a `<strong>` is still marked and the `<strong>` survives.

```tsx
<MPHighlight query="cat">
  the <strong>cat</strong> sat
</MPHighlight>
```

Requiring a string instead is what most libraries do, and it fails on the first search result that has a `<strong>` in it.

:::

::: fw flutter

The Flutter build searches a `String`. A widget tree cannot be walked into the way React children can: what a widget draws is only decided when it builds. A result with a bold run in it is two `MPHighlight`s in a `Text.rich`, or a styled span of your own around one.

:::

## Accessibility

::: fw react

- The mark is a `<mark>`, which is announced as text of relevance to the reader.
- That has one consequence worth knowing: marking eleven words in a paragraph tells a screen reader that eleven things are important, which is a way of saying nothing. A highlight is for a handful of matches.
- The mark carries a hair of padding and the same hair back out as a negative margin, so a marked line is exactly as long as it was. Nothing on the page moves when a search runs.

:::

::: fw flutter

- The whole text is read once, as one string. The marks are widgets, and without that their words would reach a screen reader as placeholders between the plain runs.
- Flutter has no semantics for "relevant to the reader", so a mark is not announced as one. Say so in the surrounding screen, such as a count of matches beside the search field, when it matters.
- The mark's surface is painted a hair past the word on either side rather than padded, so a marked line is exactly as long as it was. Nothing on the screen moves when a search runs.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children`, walked into | a `String` | A widget tree cannot be searched before it builds. |
| `<mark>` | the whole string, read once | Flutter has no "relevant to the reader" role; the sentence is read as it was written. |
| `variant` as `Exclude<MPVariant, 'elevated'>` | `MPHighlightVariant` | Dart cannot take a value out of an enum, so the four are an enum of their own. |
| `query` as a union | `Object` | Dart has no union type: a `String`, a `List<String>` or a `RegExp`, checked in debug. |
| a mark wrapping across two lines | one unbroken mark | A `WidgetSpan` is laid out whole, so a marked phrase moves to the next line together. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPTextField](../inputs/text-field) — the box the query usually comes from.
- [MPTypography](./typography) — the prose this sits inside.
