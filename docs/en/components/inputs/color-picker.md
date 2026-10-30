---
title: MPColorPicker
order: 6
---

# MPColorPicker

<p class="mp-lede">A colour, chosen by eye. A saturation square with a hue rail beside it — the arrangement every design tool has settled on, because it is the one that puts every colour of a hue within a single movement of the pointer.</p>

<Demo src="color-picker/hero" :minHeight="100" />

::: fw react

```tsx
import { MPColorPicker } from 'material-plus-ui';

<MPColorPicker label="Tag colour" value={colour} onValueChange={setColour} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPColorPicker(
  label: const Text('Tag colour'),
  value: colour,
  onChanged: (String next) => setState(() => colour = next),
);
```

:::

## Props

<PropsTable name="MPColorPicker" />

::: fw flutter

The picker is controlled when `value` is given, `''` included, which is no colour. Leave `value` out and it keeps its own, starting at `initialValue`. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## This is not the theme

A colour chosen here is **data** — a tag's colour, a calendar's, a project's. It is not `--mp-source-color`, and it is not a way to re-theme the library at runtime; [Colour](../../design/color) is that.

The picker also deliberately does not offer the scheme's four families as swatches. Those are _roles_ — `primary` means "the most important thing on this screen" — and offering them here would be offering four colours that move under the reader the moment somebody re-themes the application.

## The panel's state is HSV, and it never leaves

That is what keeps the hue rail still while the pointer is in the black corner: through RGB, every shade of black is the same colour and the rail would snap to red the moment the square bottomed out.

The value is derived from the model rather than the other way round, and an incoming `value` only re-seeds the model when it says something different from what the model already means — compared as colours, not as strings, because `#FF0000` and `#ff0000` are the same colour written two ways.

There is no colour library under this. The conversions are a hundred lines of arithmetic, which is the whole reason a colour picker adds nothing to what the package already installs.

## Examples

### format and swatches

<Demo src="color-picker/format" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/color-picker/format.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/color_picker/format.dart

:::

</Demo>

`format` decides which notation comes back out. `hex` drops the alpha pair when the colour is opaque, and the two functional forms drop the fourth argument for the same reason — a caller who never turned `alpha` on should never see `rgba(…, 1)` come out of a control they only used three channels of.

`swatches` puts the handful of colours a product actually uses one click away.

::: fw react

`false` draws none.

:::

::: fw flutter

An empty list draws none, and leaving it out draws the built-in set.

:::

The tick fades from one swatch to the next rather than jumping. Choosing a swatch does not change the swatch, so the mark moving is the whole of the feedback — and a mark that arrived in one frame would read as a flicker rather than as a choice. A hovered swatch lifts to elevation 1 over the same 200ms.

### floatingLabel

While there is no colour and the trigger is unfocused, the label rests on the trigger's own line and rises into the notch on focus or on the first colour. See [MPTextField](./text-field#floatinglabel) for the rule in full.

The swatch comes down with it, and this is the one control in the library where a leading mark does. Everywhere else the mark before the value is an affordance — a calendar glyph says the trigger opens a calendar — so it keeps its place and holds the label out of it. A swatch is the value drawn: with no colour in the picker it is an empty ring saying nothing, so it gives its place up and returns with the label.

### inline

Draws the panel in the page with no trigger at all — for a sidebar or a settings pane, where the picker is the content rather than a field in a form.

<Demo src="color-picker/inline" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/color-picker/inline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/color_picker/inline.dart

:::

</Demo>

### alpha

Adds a third rail and lets the value carry a fourth channel. The rail is drawn over a chequerboard, which is the only honest way to show a colour that is partly not there.

### editable

The field under the panel. Typing a colour it understands moves the panel; typing anything else leaves the panel exactly where it was and shows the text as written.

### locale and labels

The seven strings the picker has to invent, because a colour square has nowhere to take a name from: the square, the two rails, the value field, the swatch grid, the ×, and the word the trigger shows before a colour has been chosen.

They live in the library's own [message table](../../design/localization) rather than as defaults kept in the component, which is the rule every component that invents a word follows — `locale` gets a translation, `MPLocaleProvider` gets one for a whole application at once, and `labels` gets whatever else:

::: fw react

```tsx
// Translated.
<MPColorPicker locale="ko" … />

// And one word of your own, over the top of it.
<MPColorPicker locale="ko" labels={{ empty: '아직 없음' }} … />
```

:::

::: fw flutter

```dart
// Translated.
MPColorPicker(locale: 'ko', …)

// And one word of your own, over the top of it.
MPColorPicker(locale: 'ko', labels: const <String, String>{'empty': '아직 없음'}, …)
```

:::

An override wins over the translation, and anything it does not name stays translated.

## Accessibility

- The square and both rails are sliders, driven by the arrow keys — Shift steps by ten, as everywhere else in the library.
- The trigger is named by the label in the notch, exactly as [MPSelect](./select)'s is.
- The tick on a chosen swatch is black or white, decided by the relative luminance of the swatch underneath it. A fixed white tick disappears on yellow.

::: fw flutter

- The trigger is one button node, carrying the written colour as its value and saying whether the popup is expanded.
- The focus goes into the square as the popup opens. Tab walks the square, the rails, the value field and the swatches; Escape or a press outside closes the popup and hands the focus back to the trigger, and Tab out of the panel closes it too.
- The rails also answer Home and End. A screen reader can step every slider up and down and is told what each step would make it.
- An inline picker is one group named by its label, so its sliders are not two sets of "Hue" and "Opacity" with nothing to tell them apart.

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onOpenChange` keeps its name. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter's names. |
| `swatches={false}` | `swatches: const <String>[]` | An empty list draws none; `null` is what asks for the built-in set. |
| `labels` (`Partial<MPColorPickerLabels>`) | `labels` (`Map<String, String>?`) | The same keys, as a map. |
| `label`, `description`, `errorMessage` (`ReactNode`) | `Widget?` | Usually a `Text`. |
| `id`, `className`, `style` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `focusNode`, `autofocus` | A name for a picker with no visible label, and the trigger's focus from outside. |

The rest is matched deliberately: the HSV model, the panel's ladder, the three notations, the chequer, the swatch grid and its tick, and the swatch that comes down with a resting label.

:::

## See also

- [MPSelect](./select) — the trigger this borrows.
- [Colour](../../design/color) — the library's own scheme, which this does not set.
- [Localization](../../design/localization) — where the picker's own seven words come from.
