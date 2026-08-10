---
title: MPOverlay
order: 5
---

# MPOverlay

<p class="mp-lede">A sheet over the whole page that stops it being used. What separates it from a dialog is what is <em>not</em> here: no surface, no outline, no title, no actions — the scrim on its own, with whatever the caller puts on top of it.</p>

<Demo src="overlay/hero" :minHeight="80" />

```tsx
import { MPOverlay, MPProgressCircular } from 'material-plus-ui';

<MPOverlay open={saving} label="Saving">
  <MPProgressCircular size="lg" />
</MPOverlay>;
```

## Props

<PropsTable name="MPOverlay" />

## `dismissible` is off, and it is the one prop to read twice

This is the other way round from [MPDialog](./dialog). A dialog asks a question and Escape is the universal "no"; an overlay is not asking anything — it is saying **wait** — and a save that can be dismissed by a stray click is a save the reader will believe finished.

Turn it on for the overlay whose job is to catch a click outside something.

## Examples

### tone

One axis, four steps: how legible is what is behind. They are tuned with the blur radius as much as with the alpha, because past about 16px a backdrop smears into flat colour and the sheet reads opaque however low its alpha goes.

<Demo src="overlay/tones" :minHeight="80">

<<< @/.vitepress/demos/overlay/tones.tsx

</Demo>

- `scrim` — MD3's own scrim, and exactly what `MPDialog` puts behind itself. The page is still there and still readable; it has only stopped being reachable.
- `blur` — frosted. The page is present as shape and colour but not as words. For "this is being replaced".
- `solid` — the page's own `surface`, opaque. For a screen that is genuinely gone.
- `clear` — nothing drawn at all, and still covering the viewport. That is the whole reason to reach for it: an invisible sheet that catches a click.

### label

It has a default, which almost nothing else in this library does. An overlay that holds nothing readable — a bare spinner, a `clear` sheet — still has to say what it is, and the alternative is a modal region a screen reader announces as nothing at all.

### modal

`'trap-focus'` leaves the page scrollable and clickable while still holding focus inside, which is usually what a `clear` overlay wants.

### align and size

`align` puts the content at the top, the middle or the bottom of the viewport; `size` is the room between the content and the edge of it. That is the only thing `size` decides here — an overlay has no surface of its own to scale.

## Accessibility

- The overlay is a modal region named by `label`.
- Base UI owns the portal, the scroll lock, the focus held inside, the page behind going inert, and focus returning to wherever it came from when the overlay closes.
- A `clear` overlay is invisible but not absent: it still blocks the pointer and still traps focus, so anything behind it is genuinely unreachable rather than merely hidden.

## See also

- [MPProgressCircular](./progress-circular) — what usually sits on top of one.
- [MPDialog](./dialog) — when there is something to read and something to answer.
