---
title: MPAnimateTyping
order: 11
---

# MPAnimateTyping

<p class="mp-lede">Text appearing one character at a time. The whole string is in the document from the first frame, so nothing reflows and nobody is kept waiting on the performance.</p>

<Demo src="animate-typing/hero" :minHeight="200" />

```tsx
import { MPAnimateTyping } from 'material-plus-ui';

<MPAnimateTyping text="anything you can name" repeat="infinite" erase />;
```

## Props

<PropsTable name="MPAnimateTyping" />

## Two copies, and why

There is a **clipped copy for a screen reader**, which reads the string once and is not made to sit through the effect, and a **visible copy** that is `aria-hidden` and animates.

So the effect costs a reader who cannot see it nothing, and costs a reader who can nothing either: the box is not laid out from the characters that have arrived so far, so the text around it does not reflow on every frame — which is what a naïvely implemented typewriter does to a paragraph, twenty-four times a second.

## Only text is typed

Pass a string, or strings. An element among the children contributes its **text and nothing about its markup**, because there is no honest way to reveal half of a `<strong>` or half of a link.

If part of the line needs to be bold, the line is not a typewriter — set it as text and animate it with [MPAnimateFade](./animate-fade).

## It advances by grapheme, not by code point

A code point is not a character. `👩‍👩‍👧` is seven of them, `한` typed on a Korean keyboard can be three, and a typewriter that advanced by code points would spend four frames assembling an emoji out of parts that mean nothing on their own — and, in Korean, would show a bare consonant that is not a syllable.

`Intl.Segmenter` knows where the boundaries actually are. The spread is the fallback for a runtime that does not have it.

## `speed`, and when `duration` wins

`speed` is characters per second and is the natural unit here: a long paragraph and a short one should be typed at the same **pace**, not in the same time.

`duration` is still honoured, as the time for the whole string, because a caller who has set one on every other `MPAnimate*` will reach for it here too. Where both are given, `duration` wins.

## Examples

<Demo src="animate-typing/terminal" :minHeight="240">

<<< @/.vitepress/demos/animate-typing/terminal.tsx

</Demo>

### erase and hold

`repeat`, `hold` and `erase` are what make it a loop: type, hold, delete, type again. Without `erase` a repeat clears in one frame, which is right for a line being **replaced** rather than rewritten.

`eraseSpeed` defaults to twice `speed`, which is what a person actually does.

### caret

A blinking block after the text, on by default. It runs on `step-end` rather than a fade, because a caret that eases looks like a caret being rendered slowly. `caretChar` redraws it — `'▌'`, `'_'`, anything.

### delay

Several of these in a column, each with a larger `delay`, is how a sequence of lines is typed one after another. Nothing coordinates them, which is the point: they are ordinary components with ordinary delays.

## Accessibility

- The string is announced **in full, once**, from the first frame. A screen reader is never made to follow a live region updating twenty-four times a second.
- Under `prefers-reduced-motion` the text is simply there — not "nothing happens", but the only outcome that still delivers what the component was carrying. The caret stops blinking too, since a cursor after text nobody is typing says the wrong thing.
- Until it is triggered the visible copy is **empty rather than finished**. A typewriter that showed its whole string until it scrolled into view and then blanked to begin would be worse than no effect at all.
- Reserve the line's height in the layout if the text is long enough to wrap, or the block below it will move when the first line breaks.

## See also

- [MPAnimateHeadline](./animate-headline) — for several lines being swapped rather than one being written.
- [MPAnimateFade](./animate-fade) — for a line that has markup in it.
- [MPChatBubble](../display/chat-bubble) — which has its own "somebody is writing" indicator, and is the right one for a real conversation.
