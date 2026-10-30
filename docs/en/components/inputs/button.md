---
title: MPButton
order: 1
---

# MPButton

<p class="mp-lede">Material Design's five buttons — filled, tonal, elevated, outlined and text — across four accent families and the library's size ladder. The state layer, the disabled opacities and the pill shape all come from Material Design 3's own component tokens.</p>

<Demo src="button/hero" :minHeight="64" />

::: fw react

```tsx
import { MPButton } from 'material-plus-ui';

<MPButton onClick={save}>Save</MPButton>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPButton(onPressed: save, child: const Text('Save'));
```

:::

## Props

<PropsTable name="MPButton" />

::: fw flutter

`MPButton` needs nothing above it in the tree. Without an `MPTheme` it follows the platform's own brightness, so a button dropped into any app is already in the right scheme. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## Examples

### variant

Five, and they are not five shades of one thing. Each is a different answer to the same question — how does this action separate itself from the page.

<Demo src="button/variants" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/button/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/button/variants.dart

:::

</Demo>

`elevated` is the one worth knowing about. It is a **neutral** surface that separates itself with a shadow rather than with colour, which is what makes it the one to reach for over a photograph or a coloured panel — the two tonal variants have nothing quiet enough to sit on there.

::: tip One filled button per screen

Material's rule, and it survives contact with real screens: `filled` is the single thing this view is for. A screen with three filled buttons on it has told the reader nothing about which one to press.

:::

### color

Four accent families: `primary`, `secondary`, `tertiary` and `error`. Not Material UI's six — the specification's colour system has no `info`, `success` or `warning`, and offering them would promise roles [the token sheet](../../design/color) has no way to derive.

::: fw react

```tsx
<MPButton color="error">Delete account</MPButton>
```

:::

::: fw flutter

```dart
MPButton(color: MPColor.error, onPressed: deleteAccount, child: const Text('Delete account'));
```

:::

`error` is a family like any other here, deliberately. A destructive button and a primary one differ only in which palette they read, and a component that special-cased the error colour would need a second code path for the one case that most needs to look like all the others.

Arbitrary colour values are not accepted. To change what `primary` _is_, <Fw react="set the token" flutter="set the `sourceColor` of an `MPTheme`" /> — that way one change reaches every component at once instead of every call site.

### loading

Swaps `startIcon` for a spinner and stops the button firing.

<Demo src="button/states" :minHeight="64">

::: fw react

<<< @/.vitepress/demos/button/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/button/states.dart

:::

</Demo>

It is deliberately **not** `disabled`. A button that leaves the <Fw react="tab order" flutter="focus order" /> the moment it is pressed takes the keyboard focus with it, and the reader is returned to the top of the document while the request they just made is still in flight.

::: fw react

So the button keeps its place, says `aria-busy` and `aria-disabled`, and swallows the click.

:::

::: fw flutter

So the button keeps its place and its focus and swallows the press, and a screen reader hears its spinner named by `loadingLabel`, or by the word for "loading" in the button's language when there is none.

:::

### startIcon and endIcon

::: fw react

Content placed either side of the label. A glyph keeps the size it was given — an `MPIcon` with no `size` draws at the icon set's own — and the spinner that takes `startIcon`'s place while `loading` is the one glyph sized from the button's rung.

```tsx
<MPButton startIcon={<MPIcon icon={ICONS.check} size={20} />}>Save</MPButton>
```

:::

::: fw flutter

Content placed either side of the label. The button puts an `IconTheme` around both slots with its rung's icon size and its label colour, so an `Icon` with no `size` of its own matches the label without being told. The glyph can come from whichever icon set the app uses.

```dart
MPButton(startIcon: const Icon(Icons.check), onPressed: save, child: const Text('Save'));
```

:::

With no <Fw react="children" flutter="child" code /> at all the button goes square and becomes an icon button. Give it an <Fw react="aria-label" flutter="semanticLabel" code /> when it does — there is no text left to name it.

::: fw react

```tsx
<MPButton aria-label="Search" startIcon={<MPIcon icon={ICONS.search} size={20} />} />
```

:::

::: fw flutter

```dart
MPButton(semanticLabel: 'Search', startIcon: const Icon(Icons.search), onPressed: openSearch);
```

:::

### size

Five rungs, sharing the library's control ladder: 32, 40, 56, 64 and 72 pixels. The first three are Material's own extra-small, small and medium button heights; `lg` and `xl` are this library's, because the spec's are 96 and 136 and a 96px button beside a 64px field is not a row. See [Prop conventions](../../design/prop-conventions#size).

<Demo src="button/sizes" :minHeight="330">

::: fw react

<<< @/.vitepress/demos/button/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/button/sizes.dart

:::

</Demo>

The label's type scale and the padding around it come off the same rung, which is why a taller button is not simply a taller pill.

## What this does not have

**No `href`.** A button that navigates is a link, and the difference is not cosmetic: a link is announced as one, and a reader expects to be able to treat it as one.

::: fw react

A link opens in a new tab on the middle button and shows its destination in the status bar. So a link that looks like a button is written as a link:

```tsx
<MPButton render={<a href="/pricing" />} nativeButton={false} role="link">
  Pricing
</MPButton>
```

All three parts matter. `render` is Base UI's own escape hatch and brings the whole surface with it; `nativeButton={false}` tells Base UI the element is not a `<button>`, which it otherwise says in the console; and `role="link"` puts back the one thing `nativeButton={false}` then assumes, because Base UI takes it to mean the element is _acting_ as a button and gives it `role="button"` to say so. Without that last prop the anchor is announced as a button, which is exactly the lie this section is about.

:::

::: fw flutter

Flutter has no element to swap, so there is no `render` to give a button a link's semantics. A destination the reader should be able to treat as a link belongs to your router's own link widget; a button that moves the screen as the result of an action calls the router from `onPressed`.

:::

**No ripple.** MD3 still has one: its pressed state is a ripple, a state layer that spreads out from where the press landed. This library draws the pressed layer flat and all at once instead, which says the same thing without an animation that has to finish before the screen it triggered is allowed to change.

## Accessibility

::: fw react

- The focus indicator is `secondary` and drawn **outside** the button, which is MD3's own rule: a ring drawn inside a filled button is a ring drawn on top of the fill it is meant to be distinguishable from.
- `type` defaults to `button` rather than the native `submit`, so an unrelated button inside a form does not submit it.
- `loading` announces itself with `aria-busy` and keeps the button focusable.
- An icon-only button needs an `aria-label`. Nothing else can name it.

:::

::: fw flutter

- The focus indicator is `secondary` and drawn **outside** the button, which is MD3's own rule: a ring drawn inside a filled button is a ring drawn on top of the fill it is meant to be distinguishable from. It appears when the keyboard moves the focus, not on a tap.
- <kbd>Enter</kbd>, <kbd>Space</kbd> and the numpad <kbd>Enter</kbd> press the button. They are bound on the button itself, so it behaves the same with or without an app widget above it.
- The button is announced as a button, and as disabled when it is.
- `loading` keeps the button focusable, and its spinner is announced by `loadingLabel`.
- An icon-only button needs a `semanticLabel`. Nothing else can name it.
- A `semanticLabel` on a button that has words on it replaces them for a screen reader. Include those words in it, so a reader who says them to a voice-control tool still reaches the button.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onClick` | `onPressed` | Flutter's name. Leaving it `null` disables the button, as it does everywhere else in Flutter. |
| `disabled` | `disabled` | Kept, for a button whose callback is always there. Either one disables the button. |
| `children` | `child` | Flutter's name. |
| `aria-label` | `semanticLabel` | Flutter's name. |
| `render`, `nativeButton` | — | Flutter has no element to swap. Navigate from `onPressed`, or use your router's link widget. |
| `type` | — | There is no form element for a button to submit. |
| `className`, `style`, native attributes | — | There is nothing to pass them through to. `focusNode` and `autofocus` are offered instead. |
| — | `onLongPress` | The touch equivalent of a context menu. |
| — | `locale` | The language of the spinner's default name, for a button that speaks a different one from the app around it. |

One more that is not a parameter: in React a glyph in `startIcon` or `endIcon` keeps the size it was given, while in Flutter an `Icon` reads the `IconTheme` the button puts around it and takes the rung's size.

The rest is matched deliberately: the five variants, the four families, the size ladder, the focus indicator drawn outside the button, and `loading` keeping the focus while it swallows the press.

:::

## See also

::: fw react

- [MPButtonGroup](./button-group) — for a run of them.
- [MPSegmentedButton](./segmented-button) — for one-of-a-set, which is not what a group of buttons is.
- [Base UI Button](https://base-ui.com/react/components/button) — the behaviour underneath.

:::

::: fw flutter

- [MPButtonGroup](./button-group) — for a run of them.
- [MPSegmentedButton](./segmented-button) — for one-of-a-set, which is not what a group of buttons is.

:::
