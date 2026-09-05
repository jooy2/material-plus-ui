<!-- An absolute URL, not `docs/public/logo-large.png`: this file is the package
     page on npm as well as the front page on GitHub, `.npmignore` keeps `docs/`
     out of the tarball, and npm resolves a relative image against the published
     package before it falls back to anything else. -->
<img src="https://raw.githubusercontent.com/jooy2/material-plus/main/docs/public/logo-large.png" alt="Material Plus" width="96" height="96">

# Material Plus

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/material-plus/blob/main/LICENSE) ![Programming Language Usage](https://img.shields.io/github/languages/top/jooy2/material-plus) [![npm downloads](https://img.shields.io/npm/dm/material-plus-ui.svg)](https://www.npmjs.com/package/material-plus-ui) [![npm latest package](https://img.shields.io/npm/v/material-plus-ui/latest.svg)](https://www.npmjs.com/package/material-plus-ui) ![npm bundle size](https://img.shields.io/bundlephobia/min/material-plus-ui)

### 📘 [**material-plus.cdget.com**](https://material-plus.cdget.com)

Live previews and full props for every component. This README is just the quick start.

---

**Material Plus is a React component library implementing Material Design 3.** It is the pile of components you end up writing in every Material project — the field that handles IME composition properly, the icon wrapper that agrees with your set — extracted, documented and tested.

It follows the specification directly rather than wrapping somebody's implementation of it, so its colour roles, type scale and shapes are the ones the spec names.

- **Themed in one line.** Set `--mp-source-color` and every colour role follows, the way Material generates a scheme from a source colour. No provider, no theme object, no re-render.
- **It coexists.** Nothing here is page-level — no reset, no provider, no global styling — and it reads the `--md-sys-color-*` tokens your page already has if they are there. A project already running Material keeps its own setup.
- **IME-safe by construction.** Korean, Japanese and Chinese composition survives whatever your `onChange` does with the value.
- **Bring your own icons.** `MPIcon` takes a component or an element from any set. `lucide-react` ships with the package, gathered in one readable constants file.
- **Works in a Next.js server component**, and in any bundler: the components carry `"use client"`, the barrel and the data do not, and every specifier in `dist/` names a file — so webpack, Vite, esbuild, Rollup and plain Node all resolve it.
- **ESM only**, TypeScript declarations included, and tree-shakeable for real: one component is 3.0 kB gzipped and five are 9.0 kB, against 108.8 kB for every export there is. `npm run measure` prints those numbers off a real bundler, so they cannot quietly stop being true. The stylesheet splits the same way.
- **One runtime dependency.** React 18 or 19, Node.js 22 or later.

## Documentation

Everything is documented at **[material-plus.cdget.com](https://material-plus.cdget.com)**, where the previews are not screenshots — they are the components, running in the page.

| Page | What you will find |
| --- | --- |
| [**Getting started**](https://material-plus.cdget.com/guide/getting-started) | Install and setup, end to end. |
| [**All components**](https://material-plus.cdget.com/components/) | Every component, one page each: live previews and the full props table. |
| [**Changelog**](https://material-plus.cdget.com/changelog) | What changed in each release. |

Also available in Korean / 한국어 문서: **[material-plus.cdget.com/ko/](https://material-plus.cdget.com/ko/)**

## Installation

```bash
npm install material-plus-ui
```

```bash
pnpm add material-plus-ui
```

### Peer dependencies

| Package              | Versions |
| -------------------- | -------- |
| `@base-ui/react`     | 1        |
| `react`, `react-dom` | 18 or 19 |

`@base-ui/react` is a peer rather than a dependency because it carries React context: a `Form` of yours has to be able to see a field of ours, and that only works with one copy in the tree.

### Setup

Add one line to your app's CSS entry point:

```css
@import 'material-plus-ui/styles.css';
```

This is finished CSS — no PostCSS plugin, no `@source`, no build-side configuration. It deliberately contains **no reset**, and no page-level styling of any kind: a component resets what it owns on the element it owns, so whatever your page already does stays in charge.

If Tailwind v4 is already in your project, import the token sheet instead:

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';
```

A page that renders a handful of components can take the tokens and a sheet each instead of the whole 141 kB — 4.5 kB gzipped for one component against 20.6 kB for the lot. [The guide](https://material-plus.cdget.com/guide/getting-started#if-you-only-render-a-few-components) has the numbers and where the two paths cross.

```ts
import 'material-plus-ui/styles/tokens.css';
import 'material-plus-ui/styles/button.css';
```

### Languages other than English

The library carries English. Every other translation is a module you hand over, once, at startup:

```ts
import { registerMPMessages } from 'material-plus-ui';
import { ko } from 'material-plus-ui/locales';

registerMPMessages(ko);
```

After that `locale="ko"` resolves the way it always did. Eighteen languages ship; `registerMPMessages(...LOCALES)` takes all of them, a tag nobody registered falls back to English, and a table of your own is a plain object. See [the localisation guide](https://material-plus.cdget.com/design/localization).

## Usage

There is no provider. Import a component and render it.

```tsx
import { useState } from 'react';
import { MPTextField, MPIcon, ICONS } from 'material-plus-ui';

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <MPTextField
      label="Email"
      type="email"
      value={email}
      onChange={setEmail}
      startIcon={<MPIcon icon={ICONS.search} size={18} />}
    />
  );
}
```

## Theming

Material generates a whole scheme from one source colour, and so does this.

```css
:root {
  --mp-source-color: #7c3aed;
}
```

Dark mode follows `prefers-color-scheme` on its own; `data-mp-scheme="dark"` or `.dark` on any element drives it yourself. To disagree with one generated colour, set that role — `--mp-sys-color-outline` — and to follow tokens your page already defines, do nothing: `--md-sys-color-*` is read where it is present.

Full details, including scoped and runtime theming, are in [the theming guide](https://material-plus.cdget.com/guide/getting-started#theming).

## Components

| Component | What it is |
| --- | --- |
| [`MPTextField`](https://material-plus.cdget.com/components/inputs/text-field) | An outlined text field that survives an IME, with the label, supporting text, adornments and password toggle already assembled. |
| [`MPIcon`](https://material-plus.cdget.com/components/display/icon) | A glyph at a known size in a known colour, from whichever icon set you use. |

### Why `MPTextField` exists

A controlled `<input>` renders from its `value`. While an input method is composing, the browser holds a **provisional** string in the element that has not been committed — and writing `value` back over it in that moment throws away the syllable in progress and jumps the caret. Trimming, upper-casing or validating in your `onChange` is enough to trigger it.

`MPTextField` stops rendering `value` for the duration of a composition and shows what the element actually contains, while `onChange` keeps firing for every keystroke. When the composition ends, the field is controlled again.

```tsx
// Upper-cases everything — and a Korean syllable still composes correctly.
<MPTextField value={name} onChange={(next) => setName(next.toUpperCase())} />
```

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install        # also builds, via `prepare`
npm run test       # vitest, in a real browser
npm run typecheck  # src, test and docs
npm run docs:dev   # the documentation site
```

## License

[MIT](LICENSE) © [CDGet](https://cdget.com)
