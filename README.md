# Material Plus

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/material-plus/blob/main/LICENSE) ![Programming Language Usage](https://img.shields.io/github/languages/top/jooy2/material-plus) [![npm downloads](https://img.shields.io/npm/dm/material-plus-ui.svg)](https://www.npmjs.com/package/material-plus-ui) [![npm latest package](https://img.shields.io/npm/v/material-plus-ui/latest.svg)](https://www.npmjs.com/package/material-plus-ui) ![npm bundle size](https://img.shields.io/bundlephobia/min/material-plus-ui)

### 📘 [**material-plus.cdget.com**](https://material-plus.cdget.com)

Live previews and full props for every component. This README is just the quick start.

---

**Material Plus is a React component library that extends Material UI.** It is the pile of components you end up writing in every MUI project — the field that handles IME composition properly, the icon wrapper that agrees with your set — extracted, documented and tested.

It is not a replacement for `@mui/material` and does not try to be one. Every component is built out of MUI, reads your `ThemeProvider`, and sits at the same height as the MUI control next to it in the same form.

- **MUI is a peer, not a copy.** `@mui/material` and Emotion stay your dependencies, so there is never a second MUI in the bundle or a second theme in the tree.
- **IME-safe by construction.** Korean, Japanese and Chinese composition survives whatever your `onChange` does with the value.
- **Bring your own icons.** `MPIcon` takes a component or an element from any set. `lucide-react` ships with the package, gathered in one readable constants file.
- **ESM only**, TypeScript declarations included, tree-shakeable — every component compiles to its own module.
- **One runtime dependency.** React 18 or 19, Node.js 18 or later.

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

You already have all of these in an MUI project:

| Package                             | Versions     |
| ----------------------------------- | ------------ |
| `@mui/material`                     | 6, 7, 8 or 9 |
| `@emotion/react`, `@emotion/styled` | 11           |
| `react`, `react-dom`                | 18 or 19     |

Only MUI 9 is exercised in CI, though the components use APIs stable since MUI 5.

### Setup

Add one line to your app's CSS entry point:

```css
@import 'material-plus-ui/styles.css';
```

This is finished CSS — no PostCSS plugin, no `@source`, no build-side configuration. It deliberately contains **no reset**: `CssBaseline` from `@mui/material` is already one, and Tailwind's Preflight would restyle every MUI component on your page rather than only the ones from here.

If Tailwind v4 is already in your project, import the token sheet instead:

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';
```

## Usage

Material Plus components go anywhere an MUI component goes, inside the same provider.

```tsx
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MPTextField, MPIcon, ICONS } from 'material-plus-ui';

const theme = createTheme({ palette: { mode: 'light' } });

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MPTextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        startIcon={<MPIcon icon={ICONS.search} size={18} />}
      />
    </ThemeProvider>
  );
}
```

## Components

| Component | What it is |
| --- | --- |
| [`MPTextField`](https://material-plus.cdget.com/components/inputs/text-field) | A text field that survives an IME, with the label, helper text, adornments and password toggle already assembled. |
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
