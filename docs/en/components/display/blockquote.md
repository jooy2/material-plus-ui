---
title: MPBlockquote
order: 10
---

# MPBlockquote

<p class="mp-lede">Somebody else's words, set apart from your own. There is no state and no keyboard contract here: a rule in the margin, a quotation mark, and an attribution kept apart from what was said.</p>

<Demo src="blockquote/hero" :minHeight="220" />

::: fw react

```tsx
import { MPBlockquote } from 'material-plus-ui';

<MPBlockquote author="Ada Lovelace" source="Notes on the Analytical Engine">
  The Analytical Engine has no pretensions whatever to originate anything.
</MPBlockquote>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPBlockquote(
  author: Text('Ada Lovelace'),
  source: Text('Notes on the Analytical Engine'),
  child: Text('The Analytical Engine has no pretensions whatever to originate anything.'),
);
```

:::

## Props

<PropsTable name="MPBlockquote" />

::: fw react

Every native `<figure>` attribute passes through, and a `ref` reaches the wrapper.

## The wrapper changes with the attribution

A `<div>` when there is none, a `<figure>` when there is. The HTML specification is explicit that the attribution goes _outside_ the blockquote — a name inside it claims the speaker said their own name — and a `<figure>` with no `<figcaption>` in it is a figure of nothing.

```html
<!-- no attribution -->
<div><blockquote>…</blockquote></div>

<!-- with one -->
<figure>
  <blockquote>…</blockquote>
  <figcaption>— Ada Lovelace <cite>Notes on the Analytical Engine</cite></figcaption>
</figure>
```

`author` is a person and `source` is a work. They are different elements because `<cite>` is for the title of a work and, per the specification, **never** for the name of a person.

`cite` is the third one and it is machine-readable: a URL that lands on the `<blockquote>`'s own attribute and is shown to nobody.

## Nothing is drawn on the `<blockquote>`

The surface, the rule and the padding all belong to the element around it, and that is not tidiness. `blockquote` is one of the handful of tags a host stylesheet still styles by name — VitePress's `.vp-doc blockquote` sets a grey `border-left`, a `padding-left` and a `color`, all at a specificity a one-class utility cannot outrank, so a rule drawn on the quote itself would silently come out grey and a pixel too thin.

The markup is easy to get wrong, and getting it right is most of what the React build is for.

:::

::: fw flutter

## The attribution sits under the quote

`author` and `source` are set under the quote in `bodySmall`, in the supporting role on a bare quote and in the sheet's own ink, a little quieter, on a painted one. The author comes after an em dash that a screen reader does not read: "em dash" before a name is reading the typography rather than the text.

The rule down the leading edge is drawn on the start side, so it moves to the right under a right-to-left `Directionality`.

:::

## Examples

### variant

<Demo src="blockquote/variants">

::: fw react

<<< @/.vitepress/demos/blockquote/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/blockquote/variants.dart

:::

</Demo>

`text` is the default and the one that belongs in running prose: a rule in the margin and nothing else, which is what a quote has looked like since long before there were surfaces to put one on.

`elevated` and `outlined` leave the sheet **neutral**, because a quote holds somebody else's words and words on a tinted panel are words on a background nobody chose them against. `filled` and `tonal` dye it anyway — which is what a pull quote in a brand colour is — and they are the two a caller has to ask for by name.

On a painted quote the corners on the ruled edge stay square. A 2px rule that curves away from the text it marks is a bracket, not a margin rule.

### size

`md` is `title-large` — 22px at weight 400, MD3's own largest role that is not a heading, and exactly what a pull quote is. The leading is the role's, so a quote that runs to four lines gets the air a paragraph needs rather than a title's tight 1.27.

<Demo src="blockquote/sizes" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/blockquote/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/blockquote/sizes.dart

:::

</Demo>

Every rung is one of Material's own roles rather than an interpolated size, so a quote set at `lg` is the same text as a `headline-small` heading elsewhere on the page.

### icon

The quotation mark is drawn rather than typed. A real `“` would be set in whatever face the page uses and would change shape, weight and baseline with it — and at 2em it is the largest single glyph in the component, so it changing is the most visible thing that could.

::: fw react

```tsx
<MPBlockquote />                       // the house mark
<MPBlockquote icon={false} />          // nothing
<MPBlockquote icon={<MyMark />} />     // yours
```

:::

::: fw flutter

```dart
const MPBlockquote(child: words)                       // the house mark
const MPBlockquote(icon: false, child: words)          // nothing
const MPBlockquote(icon: MyMark(), child: words)       // yours
```

`icon` is typed `Object?`, because Dart has no union type: a widget or `false`, checked in debug.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `<figure>`, `<blockquote>`, `<cite>` | widgets | There is no markup to choose elements for. The quote, the author and the source are laid out apart. |
| `cite` | — | A machine-readable URL on an element nobody sees has nowhere to go. |
| `author`, `source` as `ReactNode` | `Widget?` | Usually a `Text`. |
| `children` | `child` | Flutter's name, and required: a quote with nothing in it is not a quote. |
| `transition`, `className`, `style`, `ref` | — | The entrance belongs to an animation widget, and there is no class list, style attribute or element to pass through. |

:::

## See also

- [MPTypography](./typography) — the type roles this is built out of.
- [MPTextLink](./text-link) — for a link inside the quote.
