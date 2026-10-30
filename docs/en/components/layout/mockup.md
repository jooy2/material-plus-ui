---
title: MPMockup
order: 26
---

# MPMockup

<p class="mp-lede">A picture of a device with a real page inside it. The content is laid out against the machine's own resolution and the whole device is then scaled once to fit the room it was given.</p>

<Demo src="mockup/hero" :minHeight="460" />

::: fw react

```tsx
import { MPMockup } from 'material-plus-ui';

<MPMockup device="mobile" width={280}>
  <YourScreen />
</MPMockup>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPMockup(device: MPMockupDevice.mobile, width: 280, child: YourScreen());
```

:::

## Props

<PropsTable name="MPMockup" />

## The screen is a real viewport

`children` are laid out against the device's own resolution — 390 by 844 CSS pixels for a phone at `md` — and the device is then scaled. So a layout inside wraps where it would wrap on the machine, not where it would wrap in the box the picture happens to fit in.

::: fw react

The one thing to know is that **a media query still measures the window**. `@media (max-width: 600px)` inside a phone mockup on a laptop is false, and always will be — nothing on a page can change what the window is. Content that has to respond inside the frame should measure the frame, with a container query:

```css
.card {
  container-type: inline-size;
}
```

:::

::: fw flutter

Flutter goes a step further than a page can. The screen is handed a `MediaQuery` the size of the device, so anything inside that reads the window (an `MPGrid`, an `MPShow`, your own `MediaQuery.sizeOf`) answers for the phone and not for the screen the phone is drawn on. A layout that switches at a window size class switches inside the frame exactly as it would on the machine.

:::

## That scale is a transform, and it is the exception

The rule everywhere else in this library is that a surface is not moved or scaled. It is a rule about **controls**: a scaled button is a button whose text was resampled at the moment it was pressed.

Nothing here is pressed, and the scale never changes on an interaction — it is set once from the room available, and again only when that room changes. A device drawn at a third of its size is a picture of a device, which is the whole point, and no other mechanism lays a 390-pixel page out inside a 130-pixel box.

::: fw react

Until the room has been measured there is no scale, and the device is hidden rather than drawn at full size for a frame. On a server-rendered page that lasts until the page has hydrated, so a mockup that is the largest thing at the top of a page should be given a `width` or a `height` in pixels: the scale is then known from the start, and the device is in the first paint.

:::

::: fw flutter

The scale is a `FittedBox` round the device laid out at its own size, so there is no frame drawn at full size first and nothing to hide: the device is right on the first frame whether or not it was given a `width`.

:::

## What `size` means here

Not a height, and not a type scale. `size` picks between five **real resolutions** per device, because the number that matters is the one a media query fires at: a layout tested at 390 and at 430 has been tested at the two widths most phones actually are.

|           | `xs`     | `sm`     | `md`     | `lg`      | `xl`      |
| --------- | -------- | -------- | -------- | --------- | --------- |
| `mobile`  | 320×568  | 360×780  | 390×844  | 414×896   | 430×932   |
| `tablet`  | 744×1133 | 810×1080 | 820×1180 | 1024×1366 | 1032×1376 |
| `desktop` | 1024×640 | 1280×800 | 1440×900 | 1680×1050 | 1920×1200 |

`resolution` overrides it outright when none of the five is the machine you mean.

::: fw flutter

In Dart the axes are enums: `MPMockupDevice.mobile`, `MPMockupOs.android`, `MPMockupBezel.none`, `MPMockupNotch.dynamicIsland`, and a resolution of your own is `MPMockupResolution(375, 667)`.

:::

## Hardware is a photograph, software is a page

The finishes are fixed colours and do not follow the theme. A graphite phone stays graphite on a page switched to dark, because a mockup whose aluminium turned white with the page would be a mockup of nothing.

The chrome on the screen does follow it. A menu bar, a status bar and a dock are drawn out of `surface` and `on-surface`, so the frame stays a frame around **your** page rather than becoming a picture of somebody else's screenshot. The one exception inside the exception is macOS's three window lights, which are a shape rather than a surface — a red that followed the page would stop being the close button.

## The chrome takes room rather than covering anything

Each bar the system draws — a status bar and a home indicator, a menu bar and a dock, a taskbar — takes its own space out of the screen. So `systemUi={false}` gives the screen back to `children` rather than uncovering something that was hidden underneath, and a layout that filled the frame with the chrome on still fills it with the chrome off.

The camera cut-out is the other way round: it is **hardware**, so it is drawn whether or not `systemUi` is on and it sits over the content. A phone does not stop having a camera because the status bar was turned off.

## `bezel="none"` is not a thinner bezel

It is no hardware at all — the screen on its own, with its corners cut. That is what a mockup that only wants the viewport is asking for: a responsive preview rather than a marketing shot.

`thick` is an older device rather than a thicker version of the same one: narrow sides, a forehead and a chin, and a much squarer corner, because that is what a device with a bezel that size was.

## Mismatches are corrected, not refused

`os="macos"` on a phone is a caller who changed `device` and forgot the other prop, so it falls back to that device's own system. The useful answer is a phone, not a desktop menu bar across a 390-pixel screen.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| a media query inside the frame still measures the window | the screen is handed a `MediaQuery` the size of the device | Flutter can say what the window is for a subtree, and a page cannot. |
| hidden until the room is measured | right on the first frame | The scale is laid out, not measured afterwards. |
| `width` and `height` take a CSS length | `double`, logical pixels | There are no CSS lengths here. |
| `device="mobile"`, `notch="dynamic-island"` | `MPMockupDevice.mobile`, `MPMockupNotch.dynamicIsland` | String unions are enums in Dart. |

:::
