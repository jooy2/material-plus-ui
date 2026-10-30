---
title: MPCarousel
order: 6
---

# MPCarousel

<p class="mp-lede">A strip of slides, one of which is in view. Swiping, trackpad dragging and the arrow keys all move it, and it runs the other way under right-to-left text.</p>

<Demo src="carousel/hero" :minHeight="260" />

::: fw react

```tsx
import { MPCarousel } from 'material-plus-ui';

<MPCarousel label="Trails">
  <img src="/forest-trail.jpg" alt="A path through tall trees" />
  <img src="/snowy-cabin.jpg" alt="A cabin in snow beside a frozen stream" />
</MPCarousel>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPCarousel(
  label: 'Trails',
  children: <Widget>[
    Image(image: AssetImage('forest-trail.jpg'), semanticLabel: 'A path through tall trees'),
    Image(image: AssetImage('snowy-cabin.jpg'), semanticLabel: 'A cabin in snow beside a frozen stream'),
  ],
);
```

:::

## Props

<PropsTable name="MPCarousel" />

::: fw react

## Why it is a scroll container

Nearly everything good about this component follows from one choice: the strip is a real scroll container with `scroll-snap-type`, not a track being translated.

- **Swiping and trackpad dragging work**, because they are the browser's own scrolling rather than a handler imitating it.
- **It runs the other way under RTL** without being told, because scrolling is directional and `translate` is not.
- **The arrow keys work** on the strip, again from the browser — and correctly under RTL, which a handler mapping <kbd>→</kbd> to "next" would not have been.
- **Nothing is transformed**, so this library's rule against moving a surface holds here for free.

The motion is `scroll-behavior: smooth`, which means a reader who has asked for reduced motion gets an instant cut out of the same code path rather than out of a second one written to remember them.

:::

::: fw flutter

## How the strip moves

The slides sit side by side, each as wide as the frame, and the strip slides along under it. The frame is as tall as the tallest slide, so a carousel needs no height of its own.

- **Swiping, trackpad dragging and mouse dragging** all move it. A quick flick carries it on to the next slide; a short, slow drag springs back.
- **It runs the other way under RTL**, the drag and the arrow keys included.
- **The arrow keys work** once the strip has the focus, following the writing direction, with <kbd>Home</kbd> and <kbd>End</kbd> for the ends.
- **Nothing is transformed** but the strip under its frame, so this library's rule against moving a surface holds.

With `MediaQuery.disableAnimations` set, every move is an instant cut.

:::

## Every <Fw react="top-level child" flutter="child" /> is a slide

There is no `MPCarouselSlide`. <Fw react="`<MPCarousel><img /><img /></MPCarousel>`" flutter="`MPCarousel(children: <Widget>[photo, photo])`" /> is the whole API.

The wrapper the component puts around each child is what carries the width and the name a screen reader needs — none of which a caller should have to remember to put on a photograph.

::: fw react

The wrapper also carries the snap point and the `role="group"` / `aria-roledescription="slide"` pair. A `null` or a `false` left behind by a conditional slide is dropped, and everything that survives gets a stable key.

One consequence worth knowing: a **component** is one slide, whatever it renders inside. Three slides means three children, so a `.map()` returning an array is three and a `<Group />` that renders three is one.

:::

## autoPlay is off, and pauses at every excuse

A carousel that moves while it is being read is the most complained-about pattern on the web, so nothing here advances until it is asked to. When it is:

::: fw react

| It stops when                   | Why                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| The pointer is over it          | Somebody is looking at this one                             |
| Anything inside it has focus    | A keyboard reader has tabbed into a slide and is reading it |
| The tab is in the background    | Nothing is being read at all                                |
| It is scrolled out of view      | A slide turned where nobody can see it is a slide missed    |
| `prefers-reduced-motion` is set | The reader asked for exactly this not to happen             |

:::

::: fw flutter

| It stops when | Why |
| --- | --- |
| The pointer is over it | Somebody is looking at this one |
| Anything inside it has focus | A keyboard reader has tabbed into a slide and is reading it |
| The app is in the background | Nothing is being read at all |
| Its tickers are muted, as off a route | A slide turned where nobody can see it is a slide missed |
| `MediaQuery.disableAnimations` is set | The reader asked for exactly this not to happen |

:::

The live region goes quiet at the same time. A region that announces a new slide's name every five seconds is what makes a screen reader unusable on a page that has one — so while `autoPlay` is on it is <Fw react="`aria-live=&quot;off&quot;`" flutter="no longer a live region" />, and the reader is told where they are only when they moved themselves.

## The arrows sit at 85%

MD3 names no arrow. Its carousel is a strip the reader drags, and the spec covers the container, the item widths, the padding and the corner radius and stops — so this is the library's own decision rather than a token being followed.

A slide is usually a photograph, and two solid discs of the accent sitting on one is chrome shouting over the thing it is there to move. So the **container** is let down to 85% and the glyph is left alone. The alpha is on the background rather than on the button, because `opacity` would take the glyph down with it and the glyph against its own disc is the contrast that has to survive.

Eighty-five is measured. The worst case is a white slide, where the accent blends towards the picture and the white glyph has the least to work with: against the default source that is 6.45:1 at full strength, 5.04 at 88%, 4.73 at 85% and 4.26 at 80%. It is the lowest step that still clears 4.5:1, which is the threshold for _text_; a glyph only owes 3:1. A source colour of your own moves those figures, and the margin is there for that.

Hover, focus and a press take the disc back to solid. A disabled arrow keeps the spec's own treatment, which is already a wash of `on-surface` at 12%.

## loop

On by default. With it off the arrows go `disabled` at the ends instead of wrapping, which is the honest thing for a set that has a beginning and an end: a gallery of three photographs does, a rotating banner does not.

<Demo src="carousel/controlled" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/carousel/controlled.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/carousel/controlled.dart

:::

</Demo>

<Fw react="`onValueChange`" flutter="`onChanged`" /> fires for **every** way the index can move — an arrow, a mark, a key, a drag that settled on a new slide — so something beside the frame can stay in step with a gesture nobody wrote a handler for.

## What this is, in MD3's terms

The specification describes four carousel layouts. Three of them — hero, multi-browse and uncontained — resize their items as they travel past the frame's edge. **This is the fourth**: one item to a view, snapping.

The other three are a per-item transform driven by scroll position, which is a different component and not one this library ships. What is here is drawn out of the specification's own parts: a filled icon button either side, and a selected indicator that is a short **bar** rather than a bigger dot — which is also the only treatment that does not move its neighbours, because the mark grows along the row instead of scaling.

## Examples

### Slides that are not pictures

Anything can be a slide. A card, a form step, a chart:

::: fw react

```tsx
<MPCarousel variant="text" arrows={false} label="Setup">
  <MPCard title="Step one">…</MPCard>
  <MPCard title="Step two">…</MPCard>
</MPCarousel>
```

:::

::: fw flutter

```dart
const MPCarousel(
  variant: MPVariant.text,
  arrows: false,
  label: 'Setup',
  children: <Widget>[
    MPCard(title: Text('Step one'), child: Text('…')),
    MPCard(title: Text('Step two'), child: Text('…')),
  ],
);
```

:::

<Fw react="`variant=&quot;text&quot;`" flutter="`MPVariant.text`" /> draws no frame at all, which is what to reach for when the slides already have edges of their own.

### slideLabel

The sentence a screen reader hears, and the name on each mark. It takes the position and the count so it can be written in any language:

::: fw react

```tsx
<MPCarousel slideLabel={(index, count) => `${count}장 중 ${index}번째`}>…</MPCarousel>
```

:::

::: fw flutter

```dart
MPCarousel(slideLabel: (int index, int count) => '$count장 중 $index번째', children: slides);
```

:::

## Accessibility

::: fw react

- The whole component is a `region` with `aria-roledescription="carousel"` and a name from `label`.
- Every slide is a `group` with `aria-roledescription="slide"` and a name from `slideLabel`.
- An off-screen slide is **not** `aria-hidden`. The strip is scrollable, so everything in it is genuinely reachable — and an `aria-hidden` subtree that is still in the tab order is the exact shape of the bug where a keyboard reader lands somewhere their screen reader refuses to describe.
- The strip itself is focusable, so the arrow keys reach it. That is the browser's own scroll-container handling, which is already correct under RTL.
- The marks are real buttons with names, and the current one carries `aria-current`.

:::

::: fw flutter

- The whole component is one node named by `label`, and every slide is a node named by `slideLabel`.
- An off-screen slide stays in the semantics tree. Every slide is built, so everything in it is genuinely reachable, and a subtree a screen reader refuses to describe that a keyboard can still reach is the bug hiding it would be.
- The strip itself is a focus stop, so the arrow keys reach it, following the writing direction.
- The arrows and the marks are buttons with names, and the current mark is announced as selected.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| a scroll container with snap points | a strip the carousel drags itself | Flutter has no CSS scroll snapping; the strip measures, drags and settles on its own. |
| `defaultValue` | `initialValue` | Flutter's word for a starting value the widget then keeps. |
| `onValueChange` | `onChanged` | Flutter's name for a plain change of value. |
| `interval` in milliseconds | `interval` as a `Duration` | Dart's type for a length of time. |
| any children | `children: List<Widget>` | Every widget in the list is one slide. |
| scrolled out of view | tickers muted | Flutter has no viewport observer; a carousel whose tickers are off is taken as unseen. |
| `className`, `style` | — | There is no class list or style attribute to pass through. |

:::

## See also

- [MPPanes](./panes) — for content the reader resizes rather than pages through.
- [MPAccordion](./accordion) — for sections, where only one being open is the point.
- [MPProgressBox](../feedback/progress-box) — for "this is step three of four" as a readout rather than as a control.
