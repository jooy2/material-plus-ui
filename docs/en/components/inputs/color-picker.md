---
title: MPColorPicker
order: 6
---

# MPColorPicker

<p class="mp-lede">A colour, chosen by eye. A saturation square with a hue rail beside it — the arrangement every design tool has settled on, because it is the one that puts every colour of a hue within a single movement of the pointer.</p>

<Demo src="color-picker/hero" :minHeight="100" />

```tsx
import { MPColorPicker } from 'material-plus-ui';

<MPColorPicker label="Tag colour" value={colour} onValueChange={setColour} />;
```

## Props

<PropsTable name="MPColorPicker" />

## This is not the theme

A colour chosen here is **data** — a tag's colour, a calendar's, a project's. It is not `--mp-source-color`, and it is not a way to re-theme the library at runtime; [Colour](../../design/color) is that.

The picker also deliberately does not offer the scheme's four families as swatches. Those are _roles_ — `primary` means "the most important thing on this screen" — and offering them here would be offering four colours that move under the reader the moment somebody re-themes the application.

## The panel's state is HSV, and it never leaves

That is what keeps the hue rail still while the pointer is in the black corner: through RGB, every shade of black is the same colour and the rail would snap to red the moment the square bottomed out.

The value is derived from the model rather than the other way round, and an incoming `value` only re-seeds the model when it says something different from what the model already means — compared as colours, not as strings, because `#FF0000` and `#ff0000` are the same colour written two ways.

There is no colour library under this. The conversions are a hundred lines of arithmetic, which is the whole reason the package still has one runtime dependency.

## Examples

### format and swatches

<Demo src="color-picker/format" :minHeight="220">

<<< @/.vitepress/demos/color-picker/format.tsx

</Demo>

`format` decides which notation comes back out. `hex` drops the alpha pair when the colour is opaque, and the two functional forms drop the fourth argument for the same reason — a caller who never turned `alpha` on should never see `rgba(…, 1)` come out of a control they only used three channels of.

`swatches` puts the handful of colours a product actually uses one click away; `false` draws none.

### inline

Draws the panel in the page with no trigger at all — for a sidebar or a settings pane, where the picker is the content rather than a field in a form.

<Demo src="color-picker/inline" :minHeight="320">

<<< @/.vitepress/demos/color-picker/inline.tsx

</Demo>

### alpha

Adds a third rail and lets the value carry a fourth channel. The rail is drawn over a chequerboard, which is the only honest way to show a colour that is partly not there.

### editable

The field under the panel. Typing a colour it understands moves the panel; typing anything else leaves the panel exactly where it was and shows the text as written.

### labels

The six strings the picker has to invent, because a colour square has nowhere to take a name from. They are collected in one prop because they are a **set**: an application in another language does not want six components each defaulting to English and each needing an override of its own.

## Accessibility

- The square and both rails are sliders, driven by the arrow keys — Shift steps by ten, as everywhere else in the library.
- The trigger is named by the label in the notch, exactly as [MPSelect](./select)'s is.
- The tick on a chosen swatch is black or white, decided by the relative luminance of the swatch underneath it. A fixed white tick disappears on yellow.

## See also

- [MPSelect](./select) — the trigger this borrows.
- [Colour](../../design/color) — the library's own scheme, which this does not set.
