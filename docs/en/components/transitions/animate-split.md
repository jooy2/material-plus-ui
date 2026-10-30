---
title: MPAnimateSplit
order: 14
---

# MPAnimateSplit

<p class="mp-lede">A line arriving a word or a character at a time. <a href="./animate-appear">MPAnimateAppear</a> for a string — the same settling, over the pieces of a sentence rather than over children a caller wrote out.</p>

<Demo src="animate-split/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateSplit } from 'material-plus-ui';

<MPAnimateSplit>What we shipped this quarter</MPAnimateSplit>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateSplit(text: 'What we shipped this quarter');

const MPAnimateSplit(
  text: 'Character by character',
  by: MPAnimateSplitBy.character,
  stagger: Duration(milliseconds: 18),
);
```

:::

## Props

<PropsTable name="MPAnimateSplit" />

## The pieces are cut where a reader would cut them

::: fw react

Not `split(' ')`, and not `[...text]`.

A **word** boundary is not a space anywhere east of Myanmar. Japanese, Chinese, Thai, Khmer and Lao write without them, so splitting on whitespace hands back the entire sentence as one piece — and the effect silently does nothing, in exactly the languages where nobody testing it would notice.

A **character** is not a code point. `👩‍👩‍👧` is seven of them joined by zero-width joiners, a Korean syllable typed rather than pasted can be three, and a flag is two. A splitter working in code points hands each of those pieces its own delay, and the reader watches an emoji assemble itself out of parts that mean nothing on their own.

`Intl.Segmenter` knows both boundaries, and `internal/text.ts` is the one place this library asks it — shared with [MPAnimateTyping](./animate-typing) and [MPAnimateScramble](./animate-scramble), because three copies would be three opinions.

:::

::: fw flutter

A **character** is a grapheme, what a reader counts as one. `👩‍👩‍👧` is seven code points joined by zero-width joiners and a flag is two, and cut by code unit each of those would get its own delay and draw as a broken glyph. Dart's `characters` already counts graphemes, so `by: MPAnimateSplitBy.character` hands an emoji one piece.

A **word** is cut at spaces, and the space stays on the word before it, so the pieces still join back to the string that was passed in. There is no `Intl.Segmenter` to ask, so a sentence in a script written without spaces — Japanese, Chinese, Thai — is one word in `word` mode. Split it by `character` instead: there each of its characters is a piece of its own and the line wraps between any two of them, as its own running text does.

:::

## What a screen reader gets

::: fw react

The whole line, once, out of a clipped box; the animated copy is `aria-hidden`.

Without that, a line split into characters is announced as a **list of letters**, and a reader who cannot see the effect is made to sit through the performance to find out what the sentence said. Find-on-page still matches the sentence too, which a pile of one-character spans would not.

:::

::: fw flutter

The whole line, once: the widget is a `Semantics` node labelled with `text`, and the animated pieces under it are left out of the semantics.

Without that, a line split into characters is announced as a **list of letters**, and a reader who cannot see the effect is made to sit through the performance to find out what the sentence said.

:::

## Characters stay inside their words

::: fw react

A piece has to be `inline-block` for it to move at all — a transform does nothing to a non-replaced inline box. That also makes it a **break opportunity**, so a line split into characters would wrap in the middle of a word.

Each word is therefore its own inline-block with the characters inside it, and the line breaks where it always would. The spaces are kept on the words rather than dropped, so the pieces still concatenate to the string that was passed in.

:::

::: fw flutter

The line is a `Wrap`, and by `character` each word's characters are kept together in a run of their own inside it, so the line breaks between words and never in the middle of one. A word wider than the whole line still wraps rather than overflowing, as the `Text` of a whole word would. `textAlign` decides where the lines of a line that wraps sit across the width.

:::

## Examples

### by

`word` by default. `character` is the stronger effect and the one to use sparingly: it is five or six times as many pieces, so it wants a much smaller `stagger`, and on more than a short heading it becomes something a reader waits for rather than reads.

### stagger, durationStep and reverse

The same three the six single-keyframe effects take, over pieces instead of children. `stagger` is the whole effect; `durationStep` spreads the set out or draws it together as it lands; `reverse` runs the line from its last piece, with each piece still playing forwards.

### from, distance and fade

What a single piece does, and they are [MPAnimateAppear](./animate-appear)'s. The travel is short on purpose — a long one over forty pieces is a paragraph that is _moving_ rather than a paragraph arriving.

### timeline

::: fw react

`timeline="view"` puts every piece on its own travel through the scrollport, so the line resolves as the reader reaches it rather than on a clock. See [Scrolling is a clock](./animate-fade#scrolling-is-a-clock).

:::

::: fw flutter

Not offered: CSS's `view()` timeline has no counterpart here. `MPAnimateTrigger.visible` starts the line when it is scrolled into view, and plays it on the clock from there. See [Scrolling is a clock](./animate-fade#scrolling-is-a-clock).

:::

## Accessibility

::: fw react

- Under `prefers-reduced-motion` the animation is dropped and the line is simply there, whole.
- Only **text** is split. An element among the children gives its text and drops its markup, because there is no honest way to hand half of a link its own delay.

:::

::: fw flutter

- When the platform has animations turned off (`MediaQuery.disableAnimations`) the effect is dropped and the line is simply there, whole, from the first frame.
- Only **text** is split: the line is a `String`, because there is no honest way to hand half of a link its own delay.
- A screen reader hears `text` once; the pieces are left out of the semantics.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| The line as `children` or `text` | A required `text` | Only text is split, and a `String` says so; there is no element tree to read text out of. |
| `style` for the font size | `style`, a `TextStyle?`, and `textAlign` | The text style is merged over the inherited one, and a `Wrap` needs to be told where the lines of a wrapping line sit. |
| `locale` and `Intl.Segmenter` | — | There is no segmenter. Graphemes come from Dart's `characters`, words are cut at spaces, and a script without spaces wraps between its characters by `character`. |
| `duration`, `delay`, `stagger`, `durationStep` in milliseconds | `Duration` | The framework already has the type. |
| `distance` as a CSS length | `double`, in logical pixels | There is no `rem` to resolve. |
| `easing="emphasized-decelerate"` | `MPEasing.emphasizedDecelerate` | Each name maps onto one of the curves in `MPMotion`. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `timeline`, `range` | — | CSS's `view()` timeline has no counterpart. |
| `render`, `className` | — | There is no element to swap and no class list to pass through. |

:::

## See also

- [MPAnimateAppear](./animate-appear) — the same effect over children rather than over a string.
- [MPAnimateTyping](./animate-typing) — for a line being written rather than a line arriving.
- [MPAnimateScramble](./animate-scramble) — for a line settling out of noise, at its finished length from the first frame.
