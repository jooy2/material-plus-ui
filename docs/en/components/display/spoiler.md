---
title: MPSpoiler
order: 14
---

# MPSpoiler

<p class="mp-lede">Content that is covered until somebody asks for it. A plot twist, a salary range, a photograph with a warning on it — visible as a shape, unreadable by accident.</p>

<Demo src="spoiler/hero" :minHeight="320" />

```tsx
import { MPSpoiler } from 'material-plus-ui';

<MPSpoiler reversible>She was his sister the whole time.</MPSpoiler>;
```

## Props

<PropsTable name="MPSpoiler" />

## The cover is a blur, not a `display: none`

That is the whole point. A reader can see that there is something there, roughly how much of it there is, and — with `maxHeight` — that it has been clamped. What they cannot do is read it by accident.

Blur alone is not cover, though. It takes a paragraph apart but leaves its colour and its rhythm, and a photograph blurred at 10px is still recognisably a photograph of a face — so a wash of the page's own `surface` role goes over the top. That settles two things at once: the content goes to a wash of its own colours, and the button gets something to stand on rather than sitting on whatever happened to be underneath it.

`surface` rather than one of the container roles, because the wash is standing in for the **page** rather than for a sheet on it. It is the same role [MPOverlay](../feedback/overlay)'s `solid` tone reads, for the same reason.

## Why the content is `inert`

While it is covered, the content is not tabbable, not readable by a screen reader, and **not selectable by a drag across the page**.

All three matter. A spoiler that can be defeated by Ctrl-A is not a spoiler, and `aria-hidden` alone would leave a keyboard reader tabbing into a link their screen reader has been told is not there. One attribute does all of it.

## The words are translated

The cover is the one place in this library where a component's own words are **drawn** rather than only announced, so they come from the [message table](../../design/localization) rather than from a prop with an English default:

```tsx
<MPSpoiler locale="ko">가려진 내용</MPSpoiler>
// "보기", "실수로 읽지 않도록 가려 두었습니다"
```

`locale` follows the nearest [`MPLocaleProvider`](../../design/localization) when it is left out. `label`, `hideLabel` and `description` are there for the case where the default wording is not the right wording — a spoiler on a job listing wants "Salary range", not "Hidden so it is not read by accident".

## Examples

<Demo src="spoiler/clamped" :minHeight="420">

<<< @/.vitepress/demos/spoiler/clamped.tsx

</Demo>

### maxHeight

Clamps the **covered** box only. Set it for something long enough that a page of blurred content would be a page of nothing.

Revealing releases the clamp and the content takes whatever height it needs — revealing something and leaving it in a box with a scrollbar is answering the wrong question.

### reversible

Once revealed, a hide button appears under the content. Off by default, because most spoilers are read once and stay read.

### padded

Off for content that should reach the edges — a picture, a video. The sheet's own corners still crop it, and the cover still fills the whole box.

### action

Replaces the reveal button entirely, for a spoiler that is unlocked by something other than a press — a purchase, an age check, a permission:

```tsx
<MPSpoiler revealed={unlocked} action={<MPButton onClick={verify}>Verify your age</MPButton>}>
  …
</MPSpoiler>
```

The replacement is yours to wire up: pass `revealed` and drive it from your own state. `label` is the prop for the far commoner case of wanting different words on the button that is already there.

## Accessibility

- The reveal button is a real [MPButton](../inputs/button) carrying `aria-expanded` and an `aria-controls` pointing at the content, so a screen reader is told there is something behind it and that it is currently closed.
- The covered content is `inert`, so nothing inside it is reachable — by tab, by screen reader, or by selection — while it is covered.
- The notice above the button is ordinary text, so what is being covered and why is readable before the reader decides.
- The blur is a `filter` transition and is dropped under `prefers-reduced-motion`; the cover itself is not animated, because a spoiler that fades away slowly is a spoiler that can be read while it fades.

## See also

- [MPCollapsible](../layout/collapsible) — for content that is folded away to save room, rather than hidden to protect the reader.
- [MPOverlay](../feedback/overlay) — for covering a region because something is happening to it.
- [MPSkeleton](../feedback/skeleton) — for content that is not there yet, rather than content being withheld.
