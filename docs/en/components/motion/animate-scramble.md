---
title: MPAnimateScramble
order: 15
---

# MPAnimateScramble

<p class="mp-lede">Text settling out of noise. <a href="./animate-typing">MPAnimateTyping</a>'s sibling, and the difference is what the box does: this one is its finished length from the first frame.</p>

<Demo src="animate-scramble/hero" :minHeight="360" />

```tsx
import { MPAnimateScramble } from 'material-plus-ui';

<MPAnimateScramble>Decrypting</MPAnimateScramble>;
```

## Props

<PropsTable name="MPAnimateScramble" />

## Why this rather than a typewriter

A typed line **grows** a character at a time, so everything after it on the page moves while it runs. That is fine for a line on its own in a hero, and it is not fine in a heading with a rule under it, in a table cell, or beside anything at all.

This one is its finished length from the first frame and only the characters inside it change. Nothing reflows, so it can go where a typewriter cannot.

The other difference is what the two say. A typewriter says _this is being written_ — there is somebody at the other end. A scramble says _this is being resolved_, which is what a figure arriving from somewhere, a code being checked or a name being looked up actually is.

## Written in JavaScript, and paused like everything else

There is no keyframe for this: replacing a character with a random one is not an interpolation, so the frame loop is real.

What it borrows is the trigger, the play state and the rewind, so `trigger="visible"`, `paused` and a `manual` replay behave exactly as they do on the six declared effects. What it does **not** have is a clock of its own that could drift out of step with them.

## Waiting is noise, and the noise holds still

Before it is triggered it shows its own **first frame**, which for this effect is the line fully scrambled — not the answer. A heading that has already resolved while it waits to be scrolled to has given away the thing it was about to do.

The waiting noise is fixed rather than churning. Motion that starts before the trigger is not the effect; it is a distraction beside it, and a page of paragraphs quietly flickering is a page nobody can read. The characters are drawn from the index and the frame rather than from a `Math.random()` held in state, so a re-render for any other reason cannot make them jump either.

## Examples

### spread

How much of the run is spent on the difference between the first character and the last. At `0` the whole line resolves at once; at `1` the last character is still noise when the first has been still for the entire run. The default of `0.4` reads as a wave passing along the line.

### tick

How often an unsettled character is replaced. Below about 30ms the noise stops reading as characters and starts reading as flicker.

### characters

The alphabet the noise is drawn from. The default is Latin upper case, digits and a few marks: one width apart in most faces and — more to the point — visibly **not words**. A noise alphabet with lower case in it spends half the effect looking like text that has been misspelled rather than like text that has not arrived.

## Accessibility

- A screen reader gets the finished line, once, out of a clipped box; the settling copy is `aria-hidden`. Noise read out character by character is not text, and find-on-page still matches the real words.
- Under `prefers-reduced-motion` the line is simply there, **finished**, from the first frame — the state rather than the animation. An effect switched off at the wrong end would leave a heading permanently unreadable.
- Characters are counted with `Intl.Segmenter`, so `👩‍👩‍👧` is one character of noise rather than seven unrelated glyphs.

## See also

- [MPAnimateTyping](./animate-typing) — for a line being written, where the reflow is the point.
- [MPAnimateSplit](./animate-split) — for a line arriving rather than resolving.
- [MPAnimateCounter](./animate-counter) — the same idea for a number.
