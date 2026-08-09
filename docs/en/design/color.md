---
title: Colour
order: 1
---

# Colour

Material Plus generates its whole scheme from **one source colour**, the way Material Design does. Set that and every role follows; set a role when you disagree with what came out.

```css
:root {
  --mp-source-color: #7c3aed;
}
```

There is no provider and no theme object. Every colour a component draws is a CSS custom property, so theming is CSS — which is also what lets it sit inside a project that already has its own Material tokens.

## The palette

Read back from what the browser actually computed, in both schemes at once. The page is only ever in one of them, so each swatch says which it was measured in.

<Demo src="color/palette" plain />

## Five roles, not fifty

Material defines around fifty colour roles. An outlined text field reads five of them, and those five are what exists here.

That is deliberate, and it is the same rule the tokens follow everywhere: **a token nobody reads is a promise to keep supporting a name.** Roles arrive when a component needs one. A `Button` will bring `on-primary` and `primary-container` with it; a `Card` will bring the `surface-container` steps. Until then their absence is honest.

It is also why this library does not try to reproduce Material completely. It has to _coexist_ with whatever Material implementation a page already runs rather than replace it, so the surface it claims stays as small as the components make necessary.

## How a role is derived

Each role is the source colour with its lightness and chroma replaced, using CSS relative colour syntax:

```css
oklch(from var(--mp-source-color) var(--tone) var(--chroma) h)
```

The `h` at the end is the source's own hue, kept. So a role is the same colour family as the seed at a different tone — which is what a Material tonal palette is.

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

One line, in a plain `:root` — not inside `@theme`. The library's defaults are declared in a cascade layer, and a layered rule loses to every unlayered one, so your override wins whether it sits before or after the `@import` and you never have to reason about order.

```css
@import 'material-plus-ui/styles.css';

:root {
  --mp-source-color: #7c3aed;
}
```

### A single role

```css
:root {
  --mp-sys-color-outline: #d0d0d8;
}
```

Unlike some token systems, overriding one role here does **not** leave eleven others stale — the roles are siblings derived from the seed, not a tree derived from each other. Setting `outline` changes `outline`.

<Demo src="color/override">

<<< @/.vitepress/demos/color/override.tsx

</Demo>

### Anywhere, not only the root

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

## Reading a role back

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

## Coexisting with an existing Material setup

A project running [Material Web](https://material-web.dev) already has `--md-sys-color-*` on the page. Material Plus **reads those and never writes them**, so it picks up an existing scheme with no configuration — and cannot overwrite a theme it does not own.

| What you set                             | Effect                           |
| ---------------------------------------- | -------------------------------- |
| `--mp-sys-color-primary`                 | Wins outright                    |
| `--md-sys-color-primary` already present | Taken as given                   |
| Neither                                  | Derived from `--mp-source-color` |

Mixing is the normal case: pin the roles you have, let the rest derive.

<Demo src="color/coexist">

<<< @/.vitepress/demos/color/coexist.tsx

</Demo>

## Dark mode

Nothing to configure — `prefers-color-scheme` is followed on its own. To drive it yourself, put an attribute or a class on any element:

```html
<html data-mp-scheme="dark">
  <!-- … -->
</html>
```

`.dark` works too, since that is what Tailwind's own `dark:` variant keys on. `[data-mp-scheme='light']` forces light back on a subtree, including inside a page whose system preference is dark.

## Next

- [Prop conventions](./prop-conventions) — what `size` and the other shared props mean.
- [Getting started](../guide/getting-started) — install, the stylesheet, and the rest of the tokens.
