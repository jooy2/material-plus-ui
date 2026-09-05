---
title: MPCarousel
order: 6
---

# MPCarousel

<p class="mp-lede">A strip of slides, one of which is in view. Built on the browser's own scrolling with CSS snap points, so swiping, trackpad dragging and the arrow keys all work without a gesture handler.</p>

<Demo src="carousel/hero" :minHeight="260" />

```tsx
import { MPCarousel } from 'material-plus-ui';

<MPCarousel label="Trails">
  <img src="/forest-trail.jpg" alt="A path through tall trees" />
  <img src="/snowy-cabin.jpg" alt="A cabin in snow beside a frozen stream" />
</MPCarousel>;
```

## Props

<PropsTable name="MPCarousel" />

## Why it is a scroll container

Nearly everything good about this component follows from one choice: the strip is a real scroll container with `scroll-snap-type`, not a track being translated.

- **Swiping and trackpad dragging work**, because they are the browser's own scrolling rather than a handler imitating it.
- **It runs the other way under RTL** without being told, because scrolling is directional and `translate` is not.
- **The arrow keys work** on the strip, again from the browser — and correctly under RTL, which a handler mapping <kbd>→</kbd> to "next" would not have been.
- **Nothing is transformed**, so this library's rule against moving a surface holds here for free.

The motion is `scroll-behavior: smooth`, which means a reader who has asked for reduced motion gets an instant cut out of the same code path rather than out of a second one written to remember them.

## Every top-level child is a slide

There is no `MPCarouselSlide`. `<MPCarousel><img /><img /></MPCarousel>` is the whole API.

The wrapper the component puts around each child is what carries the snap point, the width and the `role="group"` / `aria-roledescription="slide"` pair a screen reader needs — none of which a caller should have to remember to put on a photograph. A `null` or a `false` left behind by a conditional slide is dropped, and everything that survives gets a stable key.

One consequence worth knowing: a **component** is one slide, whatever it renders inside. Three slides means three children, so a `.map()` returning an array is three and a `<Group />` that renders three is one.

## autoPlay is off, and pauses at every excuse

A carousel that moves while it is being read is the most complained-about pattern on the web, so nothing here advances until it is asked to. When it is:

| It stops when                   | Why                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| The pointer is over it          | Somebody is looking at this one                             |
| Anything inside it has focus    | A keyboard reader has tabbed into a slide and is reading it |
| The tab is in the background    | Nothing is being read at all                                |
| `prefers-reduced-motion` is set | The reader asked for exactly this not to happen             |

The live region goes quiet at the same time. A region that announces a new slide's name every five seconds is what makes a screen reader unusable on a page that has one — so while `autoPlay` is on it is `aria-live="off"`, and the reader is told where they are only when they moved themselves.

## loop

On by default. With it off the arrows go `disabled` at the ends instead of wrapping, which is the honest thing for a set that has a beginning and an end: a gallery of three photographs does, a rotating banner does not.

<Demo src="carousel/controlled" :minHeight="320">

<<< @/.vitepress/demos/carousel/controlled.tsx

</Demo>

`onValueChange` fires for **every** way the index can move — an arrow, a mark, a drag that settled on a new snap point — so something beside the frame can stay in step with a gesture nobody wrote a handler for.

## What this is, in MD3's terms

The specification describes four carousel layouts. Three of them — hero, multi-browse and uncontained — resize their items as they travel past the frame's edge. **This is the fourth**: one item to a view, snapping.

The other three are a per-item transform driven by scroll position, which is a different component and not one this library ships. What is here is drawn out of the specification's own parts: a filled icon button either side, and a selected indicator that is a short **bar** rather than a bigger dot — which is also the only treatment that does not move its neighbours, because the mark grows along the row instead of scaling.

## Examples

### Slides that are not pictures

Anything can be a slide. A card, a form step, a chart:

```tsx
<MPCarousel variant="text" arrows={false} label="Setup">
  <MPCard title="Step one">…</MPCard>
  <MPCard title="Step two">…</MPCard>
</MPCarousel>
```

`variant="text"` draws no frame at all, which is what to reach for when the slides already have edges of their own.

### slideLabel

The sentence a screen reader hears, and the name on each mark. It takes the position and the count so it can be written in any language:

```tsx
<MPCarousel slideLabel={(index, count) => `${count}장 중 ${index}번째`}>…</MPCarousel>
```

## Accessibility

- The whole component is a `region` with `aria-roledescription="carousel"` and a name from `label`.
- Every slide is a `group` with `aria-roledescription="slide"` and a name from `slideLabel`.
- An off-screen slide is **not** `aria-hidden`. The strip is scrollable, so everything in it is genuinely reachable — and an `aria-hidden` subtree that is still in the tab order is the exact shape of the bug where a keyboard reader lands somewhere their screen reader refuses to describe.
- The strip itself is focusable, so the arrow keys reach it. That is the browser's own scroll-container handling, which is already correct under RTL.
- The marks are real buttons with names, and the current one carries `aria-current`.

## See also

- [MPPanes](./panes) — for content the reader resizes rather than pages through.
- [MPAccordion](./accordion) — for sections, where only one being open is the point.
- [MPProgressBox](../feedback/progress-box) — for "this is step three of four" as a readout rather than as a control.
