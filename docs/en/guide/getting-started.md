---
title: Getting started
order: 1
---

# Getting started

Material Plus is a React component library that implements [Material Design 3](https://m3.material.io). It follows the specification directly rather than wrapping somebody's implementation of it, so its colour roles, type scale and shapes are the ones the spec names.

Behaviour comes from [Base UI](https://base-ui.com) — the labelling, the validity plumbing, the accessibility. Styling comes from [Tailwind CSS](https://tailwindcss.com) v4, and theming from plain CSS custom properties, which is what lets the library sit inside a project that already has its own Material setup without either one fighting the other.

## Install

```bash
npm install material-plus-ui
```

```bash
pnpm add material-plus-ui
```

### Peer dependencies

These are the packages Material Plus expects to find in your project rather than bringing its own copy of:

| Package              | Versions |
| -------------------- | -------- |
| `@base-ui/react`     | 1        |
| `react`, `react-dom` | 18 or 19 |

`@base-ui/react` is a peer rather than a dependency on purpose: it carries React context, so a `Form` of yours has to be able to see a field of ours, and that only works if there is one copy in the tree.

`lucide-react` is a real dependency and comes with the package. It is what the components' own glyphs are drawn from — see [MPIcon](../components/display/icon).

## Wiring up the stylesheet

Add one line to your app's CSS entry point.

```css
@import 'material-plus-ui/styles.css';
```

If your bundler handles CSS, importing it from your entry module works just as well.

```ts
import 'material-plus-ui/styles.css';
```

This is **finished CSS**: the design tokens and the real rules behind every utility class the components use. There is no build-side configuration, no PostCSS plugin and no `@source`.

### If you only render a few components

The sheet above is every rule the library has, and for most projects that is the right trade: one line, and never a thought about which components are on the page. It is also 120 kB — 17.4 kB compressed — whether the page renders one component or all of them, because Tailwind generates from a file scan and not from your imports.

So the package also ships the same rules cut along the same seams the components are: the tokens once, and a sheet per component.

```ts
import 'material-plus-ui/styles/tokens.css';
import 'material-plus-ui/styles/button.css';
import 'material-plus-ui/styles/text-field.css';
```

`tokens.css` first, always — it declares the layer order and the colour roles every other sheet reads. The component sheets are named after the directories in the package, which are the kebab-cased component names: `date-range-picker.css`, `animate-fade.css`.

| Components on the page | The whole sheet | Tokens plus a sheet each |
| ---------------------- | --------------- | ------------------------ |
| 1                      | 17.4 kB         | 4.4 kB                   |
| 5                      | 17.4 kB         | 6.9 kB                   |
| 10                     | 17.4 kB         | 9.7 kB                   |
| 35 or more             | 17.4 kB         | 17.4 kB and climbing     |

Compressed, as a bundler would concatenate them, and against the same sets the bundle table below uses. The sheets repeat each other — `flex` is in a dozen of them — so their total climbs faster than the whole sheet's does and eventually passes it, at around thirty-five components. Past that, `styles.css` is both smaller and one line.

Two things this path is not. It is not tree-shaking: nothing drops a sheet you imported and did not use, so the list is yours to keep honest. And it is not for a project running Tailwind — that one generates the utilities in its own pass, and the section below is the whole of its setup.

### It contains no reset

Material Plus adds no page-level styling of any kind — no Preflight, no baseline, nothing that reaches an element it did not render. A component resets what it owns on the element it owns: a `<button>`'s browser-default grey background, a control's font, which a native form control does not inherit.

That means whatever reset your page already has stays in charge, and nothing here will restyle the rest of it.

### If you already use Tailwind

When Tailwind v4 is already in your project, import the token sheet instead of the compiled one. Nothing is generated twice, and a `className` you pass to a component sorts correctly against the component's own classes.

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';
```

| Line | What it does |
| --- | --- |
| `@import 'tailwindcss'` | Tailwind itself |
| `@import 'material-plus-ui/tailwind.css'` | The design tokens, and the `@source` that registers the package |

You do not write an `@source` of your own. The classes the components use are Tailwind utilities, so Tailwind has to read the package's compiled files to find them; `material-plus-ui/tailwind.css` takes care of that by declaring `@source '.'` inside itself. `@source` resolves relative to the file it is written in, which here is `node_modules/material-plus-ui/dist/`, right next to those files.

The upshot is that nothing depends on where your own CSS file sits.

## Use

There is no provider. Import a component and render it.

```tsx
import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

export default function App() {
  const [email, setEmail] = useState('');

  return <MPTextField label="Email" type="email" value={email} onChange={setEmail} />;
}
```

## Theming

Everything the components draw comes from CSS custom properties, so theming is CSS. No provider, no theme object, no re-render when a colour changes — and it works the same whether or not you run Tailwind.

### One line, for most projects

Material generates a whole scheme from a single **source colour**. Set yours and every role follows.

```css
:root {
  --mp-source-color: #7c3aed;
}
```

Write it in a plain `:root`, not inside `@theme`. The library's own defaults are declared in a cascade layer, and a layered rule loses to every unlayered one — so your override wins whether it sits before or after the `@import`, and you never have to reason about order.

The default is a deep azure, `#00639b`. [Colour](../design/color#the-default) has the reasoning, along with the one constraint on a source colour worth knowing: it must not be near-grey.

### Everything else about colour

Overriding a single role, reading a role back in your own markup, coexisting with a page that already defines `--md-sys-color-*`, and how the derivation is calibrated against Material's reference palette are all on the [Colour](../design/color) page.

### Dark mode

Nothing to configure. The components follow `prefers-color-scheme` on their own.

To drive it yourself, put an attribute or a class on any element:

```html
<html data-mp-scheme="dark">
  <!-- … -->
</html>
```

`.dark` works too, since that is what Tailwind's own `dark:` variant keys on. `[data-mp-scheme='light']` forces light back on a subtree, including inside a page whose system preference is dark.

Both schemes come from the same tonal palettes read at different tones, which is how Material defines them — so a source colour you set moves light and dark together, and there is no second set of values to keep in sync.

### Scoped and runtime theming

Every token above is a normal inherited custom property, so any of them can be set on any element rather than on the root. A section with its own branding is one attribute:

```html
<section style="--mp-source-color: #00696d">…</section>
```

And a colour a reader picks at runtime is a style object — no re-render of the tree, no theme rebuild:

```tsx
<div style={{ '--mp-source-color': userColour } as React.CSSProperties}>
  <MPTextField … />
</div>
```

### The other tokens

Type, shape and motion work the same way. As with the colour roles, only what a component reads is here:

```css
:root {
  /* Type. `*-font` is `inherit`, so the fields speak in your application's own
     typeface unless you say otherwise. */
  --mp-sys-typescale-body-large-font: inherit;
  --mp-sys-typescale-body-large-size: 1rem;
  --mp-sys-typescale-body-large-line-height: 1.5rem;
  --mp-sys-typescale-body-large-tracking: 0.03125rem;
  --mp-sys-typescale-body-large-weight: 400;
  /* …and the same five for `body-small`. */

  --mp-sys-shape-corner-extra-small: 4px;
  --mp-sys-motion-duration-short4: 200ms;
}
```

### Shape

Corners are a token like any other, and there are six of them. Which one a component takes is a statement about what kind of object it is rather than a size to taste — a field is a well, a chip is a tile, a button is a pill:

| Token | Default | What reads it |
| --- | --- | --- |
| `--mp-sys-shape-corner-extra-small` | `4px` | Text field, OTP field, tooltip, menu, snackbar, highlight |
| `--mp-sys-shape-corner-small` | `8px` | Chip, list row, key cap |
| `--mp-sys-shape-corner-medium` | `12px` | Box, card, collapsible, accordion, carousel, table, dropzone, list sheet, empty state |
| `--mp-sys-shape-corner-large` | `16px` | A drawer's free edge |
| `--mp-sys-shape-corner-extra-large` | `28px` | Dialog, chat bubble, bottom sheet |
| `--mp-sys-shape-corner-full` | `9999px` | Button, segmented button, slider, progress bar |

Set any of them and every component that reads it moves together. For the two obvious destinations there is an attribute instead, on the same model as `data-mp-scheme` — say nothing and you get the specification's corners, name a preset and the whole subtree moves:

```html
<html data-mp-shape="rounded">
  <!-- 8 / 12 / 20 / 24 / 32. Buttons are unaffected: a pill has no rounder to go. -->
</html>
```

```html
<section data-mp-shape="sharp">
  <!-- Every corner to 0, buttons included — the one direction a pill can travel. -->
</section>
```

Two things worth knowing:

- **`rounded` does not touch buttons, sliders or progress bars.** They are already at `corner-full`, so the preset moves the five rungs that have somewhere to move. If you want a rounder screen _and_ squarer buttons, that is `--mp-sys-shape-corner-full` set to a length of your own.
- **A dialog is portalled**, so an attribute on a section around the trigger is not an ancestor of the popup. Set the preset on `<html>` — or on `:root` — if you want it to reach one.

Anything you set yourself beats a preset, whatever order the two are imported in:

```css
:root {
  --mp-sys-shape-corner-small: 10px; /* wins over data-mp-shape */
}
```

To change one instance rather than the theme, hand it the token — not a `rounded-*` class. A class you pass is concatenated rather than merged, and [Class names and styles](#class-names-and-styles) is what that costs:

```tsx
<MPChip style={{ '--mp-sys-shape-corner-small': '9999px' } as React.CSSProperties}>Filter</MPChip>
```

### One caveat on the source colour

The derivation uses CSS relative colour syntax, so `--mp-source-color` has to be a **complete colour value** — `#7c3aed`, `oklch(0.49 0.24 292)`, `rgb(124 58 237)`. A design token holding bare channels will not work:

```css
:root {
  --brand: 262 83% 58%; /* channels only */

  --mp-source-color: var(--brand); /* ✗ not a colour */
  --mp-source-color: hsl(var(--brand)); /* ✓ */
}
```

## Sizes

Every control takes a `size` from one ladder — `xs`, `sm`, `md`, `lg`, `xl` — and `md` is Material's own size, so you get it by saying nothing.

```tsx
<MPTextField label="Search" size="sm" value={query} onChange={setQuery} />
```

The ladder is the one place the library knowingly goes beyond the specification. Why, and what each rung is, is in [Prop conventions](../design/prop-conventions#size).

To run a whole product at one rung, set it once rather than at every call site — see [App-wide defaults](./config).

## Class names and styles

Every component takes a `className` and a `style`. Both land on the element its props table names — the outermost one it draws, except where the visible part is portalled out of the tree the trigger sits in: a dialog's sheet, a menu's popup, a tooltip's plate.

### The class is concatenated, not merged

Yours is appended to the component's own, and nothing is removed to make room for it. Two classes setting the same property both end up on the element, at equal specificity, and **the one that wins is the one the stylesheet happens to put last** — not the one you wrote.

A class for something the component does not already set always works. That is most of what a class is for, and there is nothing more to know about it:

```tsx
<MPButton className="mt-4 w-full">Save</MPButton>
```

Past that it depends on the pair. On the precompiled path it depends on which sheet the application imported second; on the Tailwind path both are generated in one pass and Tailwind's own ordering decides. Measured against this repository's own stylesheet, on an `MPButton` at the default size:

| You pass                    | It sets                | Result  |
| --------------------------- | ---------------------- | ------- |
| `px-8`                      | `px-6`                 | applies |
| `px-2`                      | `px-6`                 | ignored |
| `h-20`                      | `h-14`                 | applies |
| `h-8`                       | `h-14`                 | ignored |
| `text-lg`, `text-xs`        | `text-mp-title-medium` | applies |
| `bg-red-500`                | `bg-(--_mp-accent)`    | applies |
| `rounded-lg`                | `rounded-mp-full`      | ignored |
| `shadow-lg`                 | `shadow-mp-1`          | ignored |
| `p-8`                       | `px-6`                 | ignored |
| any of the above with a `!` | —                      | applies |

The first four rows are the ones worth staring at. `px-8` works and `px-2` does not, on the same component and the same property, because Tailwind emits a scale in scale order and the larger step is therefore later — so _making a control bigger tends to work and making it smaller tends not to_. The rest is which of two theme keys Tailwind happened to sort first: the library's `--text-mp-*` land before Tailwind's own, so any `text-*` you pass wins, while `--radius-mp-*` and `--shadow-mp-*` land after, so `rounded-*` and `shadow-*` do not.

None of that is a promise. It is what one version of Tailwind emits, it is per pair rather than per property, and it can move under you when either side adds a token. Treat `className` as the tool for what the component leaves alone.

### To take something over

- **Hand it the token.** `style` is inline, so it beats every stylesheet no matter how they were ordered, and it changes the thing the component is actually reading:

  ```tsx
  <MPChip style={{ '--mp-sys-shape-corner-small': '9999px' } as React.CSSProperties}>Filter</MPChip>
  ```

- **Use the prop.** A height, a type scale and a set of paddings are what `size` is; an accent is what `color` is. A control resized with utilities is a control that has left the ladder every other control on the page is on.
- **Say `!`.** Tailwind's important modifier — `px-8!` — wins whatever the order was. It is a call-site override no theme can reach, so keep it for the one-off it is.

  One thing to know before reaching for it, because it catches people twice: **`!important` reverses the layer order.** Ordinary declarations outside a layer beat every layered one, which is the rule the theming advice above rests on. Important ones go the other way — the earliest layer wins and unlayered comes last. So an `!` in a plain stylesheet does _not_ beat a page's own `[&_h3]:my-7.5!`, which is a Tailwind utility and therefore inside `@layer utilities`: to win, yours has to carry `!` **and** sit in a layer declared before `utilities`. Two unlayered `!` declarations are back to ordinary specificity and source order.

The library ships no class merger of its own, deliberately. `tailwind-merge` is the tool for this and it is a good one, but it would be a runtime dependency on every component — against 3.0 kB for a button on its own — and its class groups would have to be taught every `mp-` token this package adds, in step. Merging at the call site is one line and costs the projects that do not need it nothing.

### The class hooks, and Tailwind's underscore

Every component puts a class of its own on the element it draws — `mp-button`, `mp-list-item`, `mp-accordion` — and names the parts inside it in BEM: `mp-list-item__label`, `mp-accordion__title`, `mp-card__header`. Those are the stable way to reach a part that no prop and no `className` can land on.

**In a Tailwind arbitrary variant they have to be escaped, and without it they fail silently.** Tailwind reads `_` inside square brackets as a space, so BEM's `__` becomes a descendant combinator and the selector goes looking for an element nobody wrote:

```
[&_.mp-accordion__title]:text-lg
  ↓
.mp-accordion title { … }     /* a <title> element inside .mp-accordion */
```

Nothing matches, and nothing says so. Spell the underscores `\_\_`:

```tsx
<MPAccordion className="[&_.mp-accordion\_\_title]:text-lg" />
```

That is a JSX attribute, where a backslash is literal. Inside a JavaScript string — `clsx('[&_.mp-accordion\\_\\_title]:text-lg')` — they have to be doubled.

Or write the rule in a stylesheet, where the name needs no escaping at all, and where a rule that holds for every accordion on the site is arguably where it belonged:

```css
.mp-accordion__title {
  font-size: 1.125rem;
}
```

## What it weighs

Gzipped, from a real bundler, with React and `@base-ui/react` held external — so this is the library's own contribution rather than the whole download.

| On the page           | JavaScript | Stylesheet, split |
| --------------------- | ---------- | ----------------- |
| `MPBox` alone         | 1.7 kB     | 4.5 kB            |
| `MPButton` alone      | 3.0 kB     | 4.5 kB            |
| Five components       | 9.0 kB     | 7.5 kB            |
| Ten components        | 13.3 kB    | 10.3 kB           |
| Every export there is | 90.2 kB    | 18.1 kB           |

Two things to read off it. The first column is marginal: a component you did not import is not in it, which is what `sideEffects`, the build's `@__PURE__` annotations and a message table per namespace are all for. The second column is not marginal — a stylesheet is a file you either imported or did not — so it assumes the list of sheets matches what the page renders.

Base UI is the larger half of a real download and is in neither column. Five components come to 20.3 kB with it bundled in and ten to 93.0 kB, but it is a peer dependency: shared with anything else that uses it, and versioned by you.

Both sets of figures are printed by the build rather than remembered, so they cannot quietly stop being true.

## Next.js and React Server Components

Every component in this library carries `"use client"`, so a server component can import and render any of it without a directive of its own:

```tsx
// app/page.tsx — a server component, no "use client" here
import { MPBox, MPButton, MPTextField } from 'material-plus-ui';

export default function Page() {
  return (
    <MPBox>
      <MPTextField label="Name" value="" />
      <MPButton>Save</MPButton>
    </MPBox>
  );
}
```

The barrel itself is not marked, which is what keeps that cheap: importing `MPBox` from a server component pulls `MPBox` across the boundary and nothing else. Neither is the data — `registerMPMessages`, the locale tables and the shared types run wherever you call them, so the one line an application writes at startup can live in a server file:

```ts
import { registerMPMessages } from 'material-plus-ui';
import { ko } from 'material-plus-ui/locales/ko';

registerMPMessages(ko);
```

The icons work from a server component both ways round — the named export and the lookup table:

```tsx
import { MPIcon, CheckIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={CheckIcon} />
<MPIcon icon={ICONS.check} />
```

What still needs `"use client"` at the top of **your** file is what needs it for any React library:

- **The hooks.** `useMPSnackbar` and `useMPLocale` are hooks, and a hook only runs in a client component. The _providers_ are fine where they are — `MPLocaleProvider`, `MPSnackbarProvider` and `MPTooltipProvider` all render from a server layout.
- **Anything you pass a callback to.** `onChange`, `onOpenChange`, `onValueChange`: a function cannot cross from a server component into a client one. That is React's rule rather than this library's, and it is the same rule for a bare `<input onChange>`.

### On other bundlers

The directive is inert everywhere else. esbuild, webpack, Vite and Next.js all bundle it away without a word, and the gzipped sizes above are the same with it and without — measured both ways, to the byte. Only a bare Rollup build says anything: `MODULE_LEVEL_DIRECTIVE`, one warning per component. Every library that supports server components produces them, and `onwarn` filters them out:

```js
onwarn(warning, warn) {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
  warn(warning);
}
```

## What is in the package

| Export | What it is |
| --- | --- |
| `material-plus-ui` | Every component and type |
| `material-plus-ui/types` | The shared prop vocabulary on its own |
| `material-plus-ui/constants/icons` | The icon set, as named exports and as a lookup table |
| `material-plus-ui/hooks` | The five hooks that have no component of their own |
| `material-plus-ui/locales` | The eighteen translations, none of them loaded until you ask |
| `material-plus-ui/styles.css` | Finished CSS, for a project with no Tailwind |
| `material-plus-ui/styles/*.css` | The same CSS, one sheet per component |
| `material-plus-ui/tailwind.css` | Tokens and `@source`, for a project that has it |

## Next

- [All components](../components/) — one page each, with live previews and the full props table.
- [MPTextField](../components/inputs/text-field) — the field, and why composition needs handling at all.
- [MPIcon](../components/display/icon) — bringing your own icon set.
