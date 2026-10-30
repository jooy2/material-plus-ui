---
title: MPAnimateScramble
order: 15
---

# MPAnimateScramble

<p class="mp-lede">Text settling out of noise. <a href="./animate-typing">MPAnimateTyping</a>'s sibling, and the difference is what the box does: this one is its finished length from the first frame.</p>

<Demo src="animate-scramble/hero" :minHeight="360" />

::: fw react

```tsx
import { MPAnimateScramble } from 'material-plus-ui';

<MPAnimateScramble>Decrypting</MPAnimateScramble>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateScramble(text: 'Decrypting');
```

:::

## Props

<PropsTable name="MPAnimateScramble" />

## Why this rather than a typewriter

A typed line **grows** a character at a time, so everything after it on the page moves while it runs. That is fine for a line on its own in a hero, and it is not fine in a heading with a rule under it, in a table cell, or beside anything at all.

This one is its finished length from the first frame and only the characters inside it change. Nothing reflows, so it can go where a typewriter cannot.

The other difference is what the two say. A typewriter says _this is being written_ — there is somebody at the other end. A scramble says _this is being resolved_, which is what a figure arriving from somewhere, a code being checked or a name being looked up actually is.

::: fw react

## Written in JavaScript, and paused like everything else

There is no keyframe for this: replacing a character with a random one is not an interpolation, so the frame loop is real.

What it borrows is the trigger, the play state and the rewind, so `trigger="visible"`, `paused` and a `manual` replay behave exactly as they do on the six declared effects. What it does **not** have is a clock of its own that could drift out of step with them.

:::

::: fw flutter

## Drawn from the shared run, and paused like everything else

There is no interpolation for this: replacing a character with a random one is not a value between two others, so each frame works the line out from the run's progress.

What it borrows is the run itself — the trigger, the pause and the rewind — so `MPAnimateTrigger.visible`, `paused` and a `manual` replay behave exactly as they do on the other effects. What it does **not** have is a clock of its own that could drift out of step with them.

:::

## Waiting is noise, and the noise holds still

Before it is triggered it shows its own **first frame**, which for this effect is the line fully scrambled — not the answer. A heading that has already resolved while it waits to be scrolled to has given away the thing it was about to do.

::: fw react

The waiting noise is fixed rather than churning. Motion that starts before the trigger is not the effect; it is a distraction beside it, and a page of paragraphs quietly flickering is a page nobody can read. The characters are drawn from the index and the frame rather than from a `Math.random()` held in state, so a re-render for any other reason cannot make them jump either.

:::

::: fw flutter

The waiting noise is fixed rather than churning. Motion that starts before the trigger is not the effect; it is a distraction beside it, and a screen of paragraphs quietly flickering is a screen nobody can read. The characters are drawn from the position and the beat rather than from a random source, so a rebuild for any other reason cannot make them jump either, and nothing ticks while it waits.

:::

## Examples

### spread

How much of the run is spent on the difference between the first character and the last. At `0` the whole line resolves at once; at `1` the last character is still noise when the first has been still for the entire run. The default of `0.4` reads as a wave passing along the line.

### tick

How often an unsettled character is replaced. Below about 30ms the noise stops reading as characters and starts reading as flicker.

### characters

The alphabet the noise is drawn from. The default is Latin upper case, digits and a few marks: one width apart in most faces and — more to the point — visibly **not words**. A noise alphabet with lower case in it spends half the effect looking like text that has been misspelled rather than like text that has not arrived.

## Accessibility

::: fw react

- A screen reader gets the finished line, once, out of a clipped box; the settling copy is `aria-hidden`. Noise read out character by character is not text, and find-on-page still matches the real words.
- Under `prefers-reduced-motion` the line is simply there, **finished**, from the first frame — the state rather than the animation. An effect switched off at the wrong end would leave a heading permanently unreadable.
- Characters are counted with `Intl.Segmenter`, so `👩‍👩‍👧` is one character of noise rather than seven unrelated glyphs.
- Only **text** is settled. An element among the children gives its text and drops its markup, because there is no honest way to scramble the third letter of a `<strong>` and keep the emphasis.

:::

::: fw flutter

- A screen reader gets the finished line, once, as the label of a `Semantics` node; the settling copy is left out of the semantics. Noise read out character by character is not text.
- When the platform has animations turned off (`MediaQuery.disableAnimations`) the line is simply there, **finished**, from the first frame — the state rather than the animation. An effect stopped at the wrong end would leave a heading permanently unreadable.
- Characters are counted by grapheme with Dart's `characters`, so `👩‍👩‍👧` is one character of noise rather than seven unrelated glyphs.
- Only **text** is settled: `text` is a `String`, so there is no markup to keep or drop. Style the whole line with `style`.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `duration`, `tick`, `delay` in milliseconds | `Duration` | The framework already has the type. |
| The text as `children`, or as `text` | `text`, a required `String` | A widget's children are widgets, and only text is settled. |
| `locale`, for where a character ends | — | Dart's `characters` finds graphemes without being told the language. |
| `tabular-nums` in the stylesheet, CSS `style` for the rest | `FontFeature.tabularFigures()`, with `style: TextStyle?` merged under it | The text style is a widget's own parameter. |
| The finished line in a visually hidden box | The finished line as a `Semantics` label | The semantics tree takes a label directly. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `render`, `className` | — | There is no element to swap and no class list to pass through. |

:::

## See also

- [MPAnimateTyping](./animate-typing) — for a line being written, where the reflow is the point.
- [MPAnimateSplit](./animate-split) — for a line arriving rather than resolving.
- [MPAnimateCounter](./animate-counter) — the same idea for a number.
