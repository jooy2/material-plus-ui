---
title: Colour
order: 1
---

# Colour

Material Plus generates its whole scheme from **one source colour**, the way Material Design does. Set that and every role follows; set a role when you disagree with what came out.

::: fw react

```css
:root {
  --mp-source-color: #7c3aed;
}
```

There is no provider and no theme object. Every colour a component draws is a CSS custom property, so theming is CSS — which is also what lets it sit inside a project that already has its own Material tokens.

:::

::: fw flutter

```dart
MPTheme(sourceColor: const Color(0xFF7C3AED), child: const App())
```

Nothing has to be installed first. Without an `MPTheme` above it, a component draws the default scheme at the platform's brightness. `MPTheme` is the Flutter spelling of the custom property: a widget that themes the subtree under it, so one part of the screen can differ from the rest.

:::

Both packages derive the roles with the same arithmetic and the same numbers, so a source colour gives the same scheme whichever package draws it. The Flutter package's `test/theme/color_scheme_test.dart` holds its default scheme to the React stylesheet's values, role by role and in both brightnesses, to within one step of 255 in each channel, which is rounding.

## The palette

Read back from what the browser actually computed, in both schemes at once. The page is only ever in one of them, so each swatch says which it was measured in.

<Demo src="color/palette" plain />

::: fw flutter

The palette is read from the React package's stylesheet, and the Flutter package produces the same values. To read them in Dart, generate the scheme yourself:

```dart
final MPColorScheme light = MPColorScheme.fromSource();
final MPColorScheme dark = MPColorScheme.fromSource(brightness: Brightness.dark);

// light.primary, dark.onSurfaceVariant, light.chart[0], …
```

:::

## Twenty-nine roles, not fifty

Material defines around fifty colour roles. The components here read twenty-nine of them, and those twenty-nine are what exists.

That is deliberate, and it is the same rule the tokens follow everywhere: **a token nobody reads is a promise to keep supporting a name.** Every role here is here because a component reads it. The rest, such as the fixed roles, `surface-dim`, `surface-bright` and `surface-container-lowest`, are absent because nothing draws with them yet, and that absence is honest. [Spec coverage](./spec-coverage.md) lists them against the specification one by one.

It is also why this library does not try to reproduce Material completely. It has to _coexist_ with whatever Material implementation a page already runs rather than replace it, so the surface it claims stays as small as the components make necessary.

::: fw flutter

In Dart they are the fields of `MPColorScheme`, with the names in camelCase: `onSurfaceVariant` for `on-surface-variant`. Next to them are `chart` and `chartScale`, the two chart palettes.

:::

## How a role is derived

Each role is the source colour with its lightness and chroma replaced and its hue kept.

::: fw react

The stylesheet does that with CSS relative colour syntax:

```css
oklch(from var(--mp-source-color) var(--tone) var(--chroma) h)
```

The `h` at the end is the source's own hue, kept.

:::

::: fw flutter

`MPColorScheme.fromSource` does it in Dart: it converts the source to OKLCh once, then builds each role at that role's lightness and chroma around the source's hue. The tone and chroma for each role are the React stylesheet's numbers.

:::

So a role is the same colour family as the seed at a different tone — which is what a Material tonal palette is.

### Light and dark are one palette, read twice

Material's two schemes are not two sets of colours. They are the same tonal palettes read at **different tones** — light `primary` is tone 40, dark `primary` is tone 80.

That is how it works here too, so the dark scheme is a reassignment of tone numbers rather than a second copy of every value. Change the source colour and both schemes move together; there is nothing to keep in sync.

### Where the numbers come from

The tone and chroma values were read off Material's own baseline reference palette, converted to OKLCh — not chosen by eye. Fed the specification's baseline source colour, the derivation lands on the specification's baseline scheme:

|           | `primary`  | `on-surface` | `on-surface-variant` | `outline` | `error`    |
| --------- | ---------- | ------------ | -------------------- | --------- | ---------- |
| light, ΔE | **0.0000** | 0.0026       | 0.0041               | 0.0038    | **0.0000** |
| dark, ΔE  | 0.0072     | 0.0046       | 0.0047               | 0.0036    | **0.0000** |

`primary` and `error` match the reference hex exactly in both schemes; the near-grey roles are all well under 0.02, which is the threshold below which a difference is not visible.

One divergence is known and accepted: every derived role keeps the source colour's hue, while Material's neutral palettes sit 10–20° off it. At a chroma of 0.01–0.02 that is a couple of thousandths of a difference in a/b — below anything perceptible, and chasing it would be fitting to noise, since hue is barely determined that close to grey.

### Inside sRGB

A palette's chroma is more than the ends of its own ramp can hold. At the tone of `on-primary` sRGB has no chroma left at all, and at the tone of a container it has a fraction of what the palette carries. A browser does not bring such a colour in at constant lightness and hue: it clips each channel on its own. In Chromium, Firefox and WebKit alike that turned the default `on-primary` from white into `#b8ffff`, and `error-container` into a salmon.

So the accent and error roles bring the colour inside sRGB themselves. They first reduce its chroma in OKLab, keeping the lightness and hue, by an estimate of how much sRGB can hold there. Whatever still does not fit is then moved in linear light towards the grey of the same lightness. A colour that already fits comes out unchanged. Fed the baseline source, the container and `on-` roles land within a ΔE of 0.02 of Material's, and `on-primary`, `on-secondary` and `on-tertiary` exactly on its white.

::: fw react

A role you set through `--mp-sys-color-*` is used as you wrote it.

:::

::: fw flutter

Flutter has no browser in the way, but the Flutter package runs the same two passes in Dart so that its roles land on the same colours as the stylesheet's. A role you set through `copyWith` is used as you wrote it.

:::

### `error` is not derived from your colour

Material's error palette is a fixed red whatever the seed is, and so is this one. An error that shifted hue with the brand would stop reading as an error.

## The default

The default source colour is a deep azure, `#00639b`.

Material's own baseline is `#6750a4`, and a library defaulting to it makes a louder statement than it looks: purple is the one hue nobody arrives at by accident, so an application that has not chosen a colour yet ends up looking like it chose that one.

The azure was picked for its **chroma** as much as its hue — 0.118, close to the baseline's 0.130 — because every role takes its saturation from there. A more vivid blue (Google's `#0b57d0` sits at 0.199) pulls the whole scheme brighter than any reference Material palette, which reads as a brand rather than as Material.

::: warning A source colour must not be near-grey

Below a chroma of roughly 0.05 the derived `primary` stops being distinguishable from `outline`, and a focus ring then reads as no change at all. A slate like `#4a5c6a` looks like a reasonable neutral brand colour and is not usable as a seed.

:::

## Changing it

### The source colour

::: fw react

One line, in a plain `:root` — not inside `@theme`. The library's defaults are declared in a cascade layer, and a layered rule loses to every unlayered one, so your override wins whether it sits before or after the `@import` and you never have to reason about order.

```css
@import 'material-plus-ui/styles.css';

:root {
  --mp-source-color: #7c3aed;
}
```

:::

::: fw flutter

One widget, above the app or above any part of it:

```dart
MPTheme(
  sourceColor: const Color(0xFF7C3AED),
  child: const App(),
)
```

The scheme is generated once per source colour and brightness and then reused, so a rebuild of the subtree does not run the derivation again.

:::

### A single role

::: fw react

```css
:root {
  --mp-sys-color-outline: #d0d0d8;
}
```

:::

::: fw flutter

`colors` takes a whole scheme, and `copyWith` is how one role in it is replaced:

```dart
final Brightness brightness = MediaQuery.platformBrightnessOf(context);

return MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: const Color(0xFF7C3AED),
    brightness: brightness,
  ).copyWith(outline: const Color(0xFFD0D0D8)),
  child: child,
);
```

A scheme passed as `colors` is used exactly as given, so it also decides the brightness: one built for light stays light when the device goes dark. Building it from `MediaQuery.platformBrightnessOf`, as above, keeps it following the platform.

:::

Unlike some token systems, overriding one role here does **not** leave eleven others stale — the roles are siblings derived from the seed, not a tree derived from each other. Setting `outline` changes `outline`.

<Demo src="color/override" :flutter="false">

<<< @/.vitepress/demos/color/override.tsx

</Demo>

::: fw flutter

The preview above is drawn by the React package, from the source under it. The Dart for the same override is the `copyWith` call above.

:::

### Anywhere, not only the root

:::: fw react

Every token is an ordinary inherited custom property, and the derived roles are declared on `*` rather than on `:root`, so each element re-resolves them against whatever is in scope where it sits.

```html
<section style="--mp-source-color: #00696d">…</section>
```

That is what makes a scoped override work at all. A `var()` is substituted on the element that **declares** the property, so a role declared once on `:root` would freeze there — a source colour set further down the tree could not reach back and change it, and neither could a `.dark` on `<body>` rather than on `<html>`.

A colour a reader picks at runtime is the same mechanism, with no re-render and no theme rebuild:

```tsx
<div style={{ '--mp-source-color': userColour } as React.CSSProperties}>
  <MPTextField … />
</div>
```

::: tip One caveat on the value

The derivation uses relative colour syntax, so the source has to be a **complete colour** — `#7c3aed`, `oklch(0.49 0.24 292)`, `rgb(124 58 237)`. A design token holding bare channels needs wrapping: `hsl(var(--brand))`, not `var(--brand)`.

:::

::::

::: fw flutter

Every parameter an `MPTheme` leaves out is inherited from the theme above it, so a nested theme says only what it changes. A section with its own brand colour is one widget, and a theme inside that one can change the brightness without restating the colour:

```dart
MPTheme(
  sourceColor: const Color(0xFF00696D),
  child: MPTheme(
    brightness: Brightness.dark,
    child: const PromoBanner(), // the section's teal, in the dark scheme
  ),
)
```

A colour a reader picks at runtime is a rebuild with a new `sourceColor`. The last 32 generated schemes are kept, so returning to a colour does not derive it again.

:::

## Reading a role back

::: fw react

To colour your own markup with one of these, read the Tailwind-facing name, or use the utility if you run Tailwind:

```css
.my-hint {
  color: var(--color-mp-on-surface-variant);
}
```

```html
<p class="text-mp-on-surface-variant">…</p>
```

Note the asymmetry: you **write** `--mp-sys-color-*` and **read** `--color-mp-*`. The write name is an override slot that is unset by default, so reading it gives you nothing; the read name is where the resolved value lands.

That first half is worth saying plainly, because the empty read is what sends people the wrong way: **`--mp-sys-color-*` is the public API.** `getComputedStyle(document.documentElement).getPropertyValue('--mp-sys-color-outline')` returns an empty string on an untouched page — the slot exists to be overridden and nothing has overridden it — and a token that reads as empty looks like a token that is not there.

The wrong turn it invites is setting `--color-mp-outline` instead, and that one does not work no matter where you put it. The derived roles are declared on every element so that a scoped override can reach them, which means every element redeclares its own copy: a `:root { --color-mp-outline: … }` is overwritten on every element under it before anything reads it. Write the `--mp-sys-color-*` slot and the derivation carries it down.

:::

::: fw flutter

`MPTheme.of(context)` returns the theme in force at that point in the tree, with every role resolved:

```dart
final MPColorScheme colors = MPTheme.of(context).colors;

return Text('Saved', style: TextStyle(color: colors.onSurfaceVariant));
```

It never returns `null`. With no `MPTheme` above, it is the default scheme at the platform's brightness, and the widget that asked rebuilds when the device switches between light and dark. `MPTheme.maybeOf(context)` is the one that returns `null` instead, for a widget that needs to know whether anybody set a theme.

For a widget of your own that takes a `color` the way the library's components do, `colors.accent(MPColor.tertiary)` returns that family's four roles at once: the colour, the ink on it, its container and the ink on that.

:::

## Coexisting with an existing Material setup

::: fw react

A project running [Material Web](https://material-web.dev) already has `--md-sys-color-*` on the page. Material Plus **reads those and never writes them**, so it picks up an existing scheme with no configuration — and cannot overwrite a theme it does not own.

| What you set                             | Effect                           |
| ---------------------------------------- | -------------------------------- |
| `--mp-sys-color-primary`                 | Wins outright                    |
| `--md-sys-color-primary` already present | Taken as given                   |
| Neither                                  | Derived from `--mp-source-color` |

Mixing is the normal case: pin the roles you have, let the rest derive.

<Demo src="color/coexist" :flutter="false">

<<< @/.vitepress/demos/color/coexist.tsx

</Demo>

:::

::: fw flutter

The Flutter package imports no Material, so it reads nothing from a `MaterialApp`'s `ThemeData` and writes nothing to it. An app that already has a Material `ColorScheme` and wants the two to agree hands the roles across once, by name, in its own code:

```dart
final ColorScheme scheme = Theme.of(context).colorScheme; // the app's Material scheme

return MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: scheme.primary,
    brightness: scheme.brightness,
  ).copyWith(
    primary: scheme.primary,
    onPrimary: scheme.onPrimary,
    surface: scheme.surface,
  ),
  child: child,
);
```

It is the same arrangement as on the web. The roles you pin win outright, and the rest derive from the source colour.

:::

## Dark mode

::: fw react

Nothing to configure — `prefers-color-scheme` is followed on its own. To drive it yourself, put an attribute or a class on any element:

```html
<html data-mp-scheme="dark">
  <!-- … -->
</html>
```

`.dark` works too, since that is what Tailwind's own `dark:` variant keys on. `[data-mp-scheme='light']` forces light back on a subtree, including inside a page whose system preference is dark.

:::

::: fw flutter

Nothing to configure — with no `brightness` anywhere above it, a component follows `MediaQuery.platformBrightness` and redraws when it changes. To drive it yourself, say it on a theme, which applies to the subtree like everything else an `MPTheme` sets:

```dart
MPTheme(brightness: Brightness.dark, child: const EditorPanel())
```

`brightness: Brightness.light` forces light back on a subtree, including inside a dark one.

:::

## Next

- [Prop conventions](./prop-conventions) — what `size` and the other shared props mean.
- [Getting started](../guide/getting-started) — install, the stylesheet, and the rest of the tokens.
