---
title: MPAnimateSplit
order: 14
---

# MPAnimateSplit

<p class="mp-lede">A line arriving a word or a character at a time. <a href="./animate-appear">MPAnimateAppear</a> for a string — the same settling, over the pieces of a sentence rather than over children a caller wrote out.</p>

<Demo src="animate-split/hero" :minHeight="360" />

```tsx
import { MPAnimateSplit } from 'material-plus-ui';

<MPAnimateSplit>What we shipped this quarter</MPAnimateSplit>;
```

## Props

<PropsTable name="MPAnimateSplit" />

## The pieces are cut where a reader would cut them

Not `split(' ')`, and not `[...text]`.

A **word** boundary is not a space anywhere east of Myanmar. Japanese, Chinese, Thai, Khmer and Lao write without them, so splitting on whitespace hands back the entire sentence as one piece — and the effect silently does nothing, in exactly the languages where nobody testing it would notice.

A **character** is not a code point. `👩‍👩‍👧` is seven of them joined by zero-width joiners, a Korean syllable typed rather than pasted can be three, and a flag is two. A splitter working in code points hands each of those pieces its own delay, and the reader watches an emoji assemble itself out of parts that mean nothing on their own.

`Intl.Segmenter` knows both boundaries, and `internal/text.ts` is the one place this library asks it — shared with [MPAnimateTyping](./animate-typing) and [MPAnimateScramble](./animate-scramble), because three copies would be three opinions.

## What a screen reader gets

The whole line, once, out of a clipped box; the animated copy is `aria-hidden`.

Without that, a line split into characters is announced as a **list of letters**, and a reader who cannot see the effect is made to sit through the performance to find out what the sentence said. Find-on-page still matches the sentence too, which a pile of one-character spans would not.

## Characters stay inside their words

A piece has to be `inline-block` for it to move at all — a transform does nothing to a non-replaced inline box. That also makes it a **break opportunity**, so a line split into characters would wrap in the middle of a word.

Each word is therefore its own inline-block with the characters inside it, and the line breaks where it always would. The spaces are kept on the words rather than dropped, so the pieces still concatenate to the string that was passed in.

## Examples

### by

`word` by default. `character` is the stronger effect and the one to use sparingly: it is five or six times as many pieces, so it wants a much smaller `stagger`, and on more than a short heading it becomes something a reader waits for rather than reads.

### stagger, durationStep and reverse

The same three the six single-keyframe effects take, over pieces instead of children. `stagger` is the whole effect; `durationStep` spreads the set out or draws it together as it lands; `reverse` runs the line from its last piece, with each piece still playing forwards.

### from, distance and fade

What a single piece does, and they are [MPAnimateAppear](./animate-appear)'s. The travel is short on purpose — a long one over forty pieces is a paragraph that is _moving_ rather than a paragraph arriving.

### timeline

`timeline="view"` puts every piece on its own travel through the scrollport, so the line resolves as the reader reaches it rather than on a clock. See [Scrolling is a clock](./animate-fade#scrolling-is-a-clock).

## Accessibility

- Under `prefers-reduced-motion` the animation is dropped and the line is simply there, whole.
- Only **text** is split. An element among the children contributes its text and nothing about its markup, because there is no honest way to hand half of a link its own delay.

## See also

- [MPAnimateAppear](./animate-appear) — the same effect over children rather than over a string.
- [MPAnimateTyping](./animate-typing) — for a line being written rather than a line arriving.
- [MPAnimateScramble](./animate-scramble) — for a line settling out of noise, at its finished length from the first frame.
