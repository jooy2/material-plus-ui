---
title: MPAnimateTyping
order: 13
---

# MPAnimateTyping

<p class="mp-lede">Text appearing one character at a time. The whole string is in the document from the first frame, so nothing reflows and nobody is kept waiting on the performance.</p>

<Demo src="animate-typing/hero" :minHeight="200" />

::: fw react

```tsx
import { MPAnimateTyping } from 'material-plus-ui';

<MPAnimateTyping text="anything you can name" repeat="infinite" erase />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPAnimateTyping(text: 'anything you can name', repeat: null, erase: true);
```

:::

## Props

<PropsTable name="MPAnimateTyping" />

## Two copies, and why

::: fw react

There is a **clipped copy for a screen reader**, which reads the string once and is not made to sit through the effect, and a **visible copy** that is `aria-hidden` and animates.

So the effect costs a reader who cannot see it nothing, and costs a reader who can nothing either: the box is not laid out from the characters that have arrived so far, so the text around it does not reflow on every frame — which is what a naïvely implemented typewriter does to a paragraph, twenty-four times a second.

:::

::: fw flutter

The widget is a `Semantics` node labelled with the whole string, which a screen reader reads once without sitting through the effect, and the **visible copy** under it is left out of the semantics and animates.

So the effect costs a reader who cannot see it nothing, and costs a reader who can nothing either: the box is laid out for the finished string from the first frame, so whatever is around it does not move on every frame — which is what a naïvely implemented typewriter does to a paragraph, twenty-four times a second.

:::

## Only text is typed

::: fw react

Pass a string, or strings. An element among the children gives its **text and drops its markup**, because there is no honest way to reveal half of a `<strong>` or half of a link. The text is typed, read out and sent in the server-rendered markup like any other.

:::

::: fw flutter

`text` is a `String`, and that is the whole of what is typed, because there is no honest way to reveal half of a bold run or half of a link. `style` sets the text style, merged over the inherited one.

:::

If part of the line needs to be bold, the line is not a typewriter — set it as text and animate it with [MPAnimateFade](./animate-fade).

## It advances by grapheme, not by code point

A code point is not a character. `👩‍👩‍👧` is seven of them, `한` typed on a Korean keyboard can be three, and a typewriter that advanced by code points would spend four frames assembling an emoji out of parts that mean nothing on their own — and, in Korean, would show a bare consonant that is not a syllable.

::: fw react

`Intl.Segmenter` knows where the boundaries actually are. The spread is the fallback for a runtime that does not have it.

:::

::: fw flutter

Dart's `characters` knows where the boundaries actually are, and the typewriter counts in them.

:::

## `speed`, and when `duration` wins

`speed` is characters per second and is the natural unit here: a long paragraph and a short one should be typed at the same **pace**, not in the same time.

`duration` is still honoured, as the time for the whole string, because a caller who has set one on every other `MPAnimate*` will reach for it here too. Where both are given, `duration` wins.

## Examples

<Demo src="animate-typing/terminal" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/animate-typing/terminal.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/animate_typing/terminal.dart

:::

</Demo>

### erase and hold

`repeat`, `hold` and `erase` are what make it a loop: type, hold, delete, type again. Without `erase` a repeat clears in one frame, which is right for a line being **replaced** rather than rewritten.

`eraseSpeed` defaults to twice `speed`, which is what a person actually does.

::: fw flutter

A loop that never ends is `repeat: null`, the way `MPAnimateRepeat` says _never stop_.

:::

### caret

::: fw react

A blinking block after the text, on by default. It runs on `step-end` rather than a fade, because a caret that eases looks like a caret being rendered slowly. `caretChar` redraws it — `'▌'`, `'_'`, anything.

:::

::: fw flutter

A blinking block after the text, on by default. It cuts on and off rather than fading, because a caret that eases looks like a caret being rendered slowly. `caretChar` redraws it — `'▌'`, `'_'`, any `String`.

:::

### delay

Several of these in a column, each with a larger `delay`, is how a sequence of lines is typed one after another. Nothing coordinates them, which is the point: they are ordinary components with ordinary delays.

## Accessibility

::: fw react

- The string is announced **in full, once**, from the first frame. A screen reader is never made to follow a live region updating twenty-four times a second.
- Under `prefers-reduced-motion` the text is simply there — not "nothing happens", but the only outcome that still delivers what the component was carrying. The caret stops blinking too, since a cursor after text nobody is typing says the wrong thing.
- Until it is triggered the visible copy is **empty rather than finished**. A typewriter that showed its whole string until it scrolled into view and then blanked to begin would be worse than no effect at all.
- Reserve the line's height in the layout if the text is long enough to wrap, or the block below it will move when the first line breaks.

:::

::: fw flutter

- The string is announced **in full, once**, from the first frame. A screen reader is never made to follow a label updating twenty-four times a second.
- When the platform has animations turned off (`MediaQuery.disableAnimations`) the text is simply there — not "nothing happens", but the only outcome that still delivers what the widget was carrying. The caret holds still too, since a cursor blinking after text nobody is typing says the wrong thing.
- Until it is triggered the visible copy is **empty rather than finished**. A typewriter that showed its whole string until it scrolled into view and then blanked to begin would be worse than no effect at all.
- The box is laid out for the finished string, caret included, from the first frame, so a line long enough to wrap has its height already and the widget below it does not move.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| The line as `children` or `text` | A required `text` | Only text is typed, and a `String` says so; there is no element tree to read text out of. |
| `style` for the font size | `style`, a `TextStyle?` | Merged over the inherited text style. |
| `caretChar: ReactNode` | `caretChar`, a `String` | The caret is drawn as text after the line. |
| A clipped copy for a screen reader | A `Semantics` label over the drawn copy | The same answer in the framework's own terms. |
| `duration`, `delay`, `hold` in milliseconds | `Duration` | The framework already has the type. |
| `repeat: number \| 'infinite'` | `MPAnimateRepeat`, an `int?` where `null` never stops | Dart has no union of a number and a word. |
| `trigger="visible"` through `IntersectionObserver` | watches every `Scrollable` above the widget | There is no observer. With no scrollable above it, it runs at once. |
| `render`, `className` | — | There is no element to swap and no class list to pass through. |
| An endless loop or caret runs while off screen | It rests while none of it is in view | Flutter goes on drawing an animation nobody can see, so a loop that never ends is held off screen. |

:::

## See also

- [MPAnimateHeadline](./animate-headline) — for several lines being swapped rather than one being written.
- [MPAnimateFade](./animate-fade) — for a line that has markup in it.
- [MPChatBubble](../display/chat-bubble) — which has its own "somebody is writing" indicator, and is the right one for a real conversation.
