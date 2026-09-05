---
title: MPTour
order: 16
---

# MPTour

<p class="mp-lede">A guided walk over a page that already exists: a few steps, each anchored to something on screen, with the dimming cut away around it.</p>

<Demo src="tour/hero" :minHeight="320" />

```tsx
import { MPTour } from 'material-plus-ui';

<MPTour
  open={running}
  onOpenChange={setRunning}
  steps={[
    { title: 'Welcome', content: 'Three things worth knowing.' },
    { target: '#search', title: 'Search', content: 'Everything is findable from here.' }
  ]}
/>;
```

## Props

<PropsTable name="MPTour" />

### MPTourStep

<PropsTable name="MPTourStep" />

## The dimming never takes the pointer

**That is the whole difference between a tour and a sequence of dialogs.** A reader can use the control being pointed at while the card is up — type into the field the second step is about, press the button the third one names — and everything they learn, they learn by doing it rather than by reading that it can be done.

It follows through the rest of the component. Nothing outside the card is blocked, no focus is trapped, and neither a press outside nor the focus leaving ends the tour. What ends one is Escape, the ×, and the card's own buttons; a [dialog](dialog) is the component for the other thing.

The dimming also does not blur, where [MPOverlay](overlay)'s does. A 2px blur says "you cannot use this right now", and a tour is saying the opposite.

## The hole is one element, not four

One box the size of the target carrying a shadow larger than any screen. Four rectangles around the target is the other way to draw it, and their corners never quite meet: the seams show as hairlines across the page the moment the dimming is anything but opaque — and MD3's scrim, at 32%, is not.

The hole travels between steps rather than jumping, and it is the only thing on screen that moves during a tour. Everything else is already where it was, which is the point.

## Steps are given by selector

`target` is a CSS selector, not an element and not a ref. What a tour is about is already on the page, and it is found on whatever the page looks like at the moment the step is reached — so a step can point at something that is rendered by another part of the application, or by a route that has not loaded yet when the tour is written.

A step with no `target` is centred over the page with nothing cut out, which is what a welcome step and a closing step are.

## How the hole keeps up

**Nothing in the platform reports that an element has moved.** A `ResizeObserver` fires when it changes _size_; `scroll` and `resize` fire when the window does. A banner loading above the target, an image arriving with no reserved height, a panel expanding beside it — every one of those moves the target and none of them says so, and what the reader sees is a hole beside the thing it was pointing at.

So the tour reads the target's position every frame while it is running, which is the same answer a positioning library gives to the same question. The rect is compared before any state is set, so a page holding still costs a read and nothing else — no render, no paint. It is bounded by what makes it acceptable: a tour is up for seconds, one at a time, over a page the reader is looking at rather than working in.

## What it is not

It is not documentation, and it is not a place to put anything a reader will need twice. A tour is shown once, unasked, over a page somebody is trying to get on with. Three or four steps is the shape of one; anything that has to be found again belongs on the page, and anything that takes a paragraph belongs in the guide the page links to.

It is also [MPStepper](../display/stepper) turned inside out. That component puts the instructions _in_ the page and the reader follows them; this one leaves the page exactly as it is and stands over it. If the steps are the task rather than a description of it, the stepper is the component.

## Skipping is not finishing

`onFinish` fires on the last step's button and nowhere else. Skip, Escape and the × all close the tour without it, which is what keeps an onboarding flow that writes "seen" on finish from marking itself complete for somebody who left.
