---
title: MPOverlay
order: 5
---

# MPOverlay

<p class="mp-lede">A sheet over the whole page that stops it being used. What separates it from a dialog is what is <em>not</em> here: no surface, no outline, no title, no actions — the scrim on its own, with whatever the caller puts on top of it.</p>

<Demo src="overlay/hero" :minHeight="80" />

::: fw react

```tsx
import { MPOverlay, MPProgressCircular } from 'material-plus-ui';

<MPOverlay open={saving} label="Saving">
  <MPProgressCircular size="lg" />
</MPOverlay>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPOverlay(
  open: saving,
  label: 'Saving',
  child: const MPProgressCircular(size: MPSize.lg),
);
```

An overlay lifts itself out of the tree, so it needs an `Overlay` above it, which `WidgetsApp` with a navigator provides. Where it is written does not matter, and it takes up no room there.

:::

## Props

<PropsTable name="MPOverlay" />

## `dismissible` is off, and it is the one prop to read twice

This is the other way round from [MPDialog](./dialog). A dialog asks a question and Escape is the universal "no"; an overlay is not asking anything — it is saying **wait** — and a save that can be dismissed by a stray click is a save the reader will believe finished.

Turn it on for the overlay whose job is to catch a click outside something.

::: fw flutter

`onOpenChange` is only ever called while `dismissible` is on, because nothing else can ask the overlay to close. While it is off and `modal` is on, the system back is refused rather than let through to the page, so what the overlay is waiting for is not left halfway.

:::

## Examples

### tone

One axis, four steps: how legible is what is behind. They are tuned with the blur radius as much as with the alpha, because past about 16px a backdrop smears into flat colour and the sheet reads opaque however low its alpha goes.

<Demo src="overlay/tones" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/overlay/tones.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/overlay/tones.dart

:::

</Demo>

- `scrim` — MD3's own scrim, and exactly what `MPDialog` puts behind itself. The page is still there and still readable; it has only stopped being reachable.
- `blur` — frosted. The page is present as shape and colour but not as words. For "this is being replaced".
- `solid` — the page's own `surface`, opaque. For a screen that is genuinely gone.
- `clear` — nothing drawn at all, and still covering the viewport. That is the whole reason to reach for it: an invisible sheet that catches a click.

### label

It has a default, which almost nothing else in this library does. An overlay that holds nothing readable — a bare spinner, a `clear` sheet — still has to say what it is, and the alternative is a modal region a screen reader announces as nothing at all.

### modal

<Fw react="`'trap-focus'`" flutter="`modal: false`" /> leaves the page scrollable and clickable while still holding focus inside, which is usually what a `clear` overlay wants.

### align and size

`align` puts the content at the top, the middle or the bottom of the viewport; `size` is the room between the content and the edge of it. That is the only thing `size` decides here — an overlay has no surface of its own to scale.

## Accessibility

- The overlay is a modal region named by `label`.
- <Fw react="Base UI owns the portal, the scroll lock, the focus held inside, the page behind going inert, and focus returning to wherever it came from when the overlay closes." flutter="The layer is a focus scope of its own, so focus goes in and stays in, and the page behind is out of reach of the pointer, the keyboard and a screen reader. When the overlay closes, focus goes back to whatever had it." />
- A `clear` overlay is invisible but not absent: it still blocks the pointer and still traps focus, so anything behind it is genuinely unreachable rather than merely hidden.

::: fw flutter

- The layer says it is a dialog (`SemanticsRole.dialog`) and names the route it opens with `label`, which is how a screen reader knows the screen changed.
- The system back (Android's back button and gesture, TalkBack's back, VoiceOver's escape scrub) closes a `dismissible` overlay as <kbd>Escape</kbd> does. With `modal: false` the back goes on to the page, which is still in use.
- With animations turned off at the OS, the overlay appears and goes at once.

## Differences from the React build

- **`modal` is a `bool`.** `false` is React's `'trap-focus'`: the page stays usable by pointer and the focus stays in the layer. React's `false`, which lets the focus leave as well, has no counterpart here, because the layer is always a focus scope of its own.
- **`defaultOpen` is `initialOpen`**, Flutter's word for a starting value, and `children` is `child`.
- **`blur` does not saturate.** React's frost is `blur(14px) saturate(1.4)`; Flutter's layer takes a blur and nothing else, so the page behind keeps its own colour.
- **No scrim knob.** `--mp-scrim-blur` is a CSS custom property, and the scrim's blur here is fixed at 2px.
- **No scroll lock.** There is no document to lock. The barrier already takes the pointer, so a scrollable behind it cannot be reached.
- **No `className` or `style`.** There is no class list or style attribute to pass through.

:::

## See also

- [MPProgressCircular](./progress-circular) — what usually sits on top of one.
- [MPDialog](./dialog) — when there is something to read and something to answer.
