---
title: Getting started
order: 1
---

# Getting started

Material Plus is a React component library that extends [Material UI](https://mui.com). Its components are built out of `@mui/material` rather than beside it, so they read the same `ThemeProvider`, take the same palette and sit at the same heights as the MUI components already in your app.

Styling that MUI has no answer for comes from [Tailwind CSS](https://tailwindcss.com) v4, and behaviour that neither covers comes from [Base UI](https://base-ui.com). Neither has to be installed in your project.

## Install

```bash
npm install material-plus
```

```bash
pnpm add material-plus
```

### Peer dependencies

These are the packages Material Plus expects to find in your project rather than bringing its own copy of:

| Package                             | Versions     |
| ----------------------------------- | ------------ |
| `@mui/material`                     | 6, 7, 8 or 9 |
| `@emotion/react`, `@emotion/styled` | 11           |
| `react`, `react-dom`                | 18 or 19     |

Only MUI 9 is exercised in CI. The components use APIs that have been stable since MUI 5, so the older majors are supported rather than merely tolerated — but if you hit a version-specific problem, [open an issue](https://github.com/jooy2/material-plus/issues) and it will be treated as a bug.

`lucide-react` is a real dependency and comes with the package. It is what the components' own glyphs are drawn from — see [MPIcon](../components/display/icon).

## Wiring up the stylesheet

Add one line to your app's CSS entry point.

```css
@import 'material-plus/styles.css';
```

If your bundler handles CSS, importing it from your entry module works just as well.

```ts
import 'material-plus/styles.css';
```

This is **finished CSS**: the design tokens and the real rules behind every utility class the components use. There is no build-side configuration, no PostCSS plugin and no `@source`.

### It contains no reset

This is the one place Material Plus departs from how a Tailwind-based component library is usually built, and it is deliberate. Tailwind's Preflight is a page reset, and your project already has one: `CssBaseline` from `@mui/material`. The two disagree in ways that show — Preflight flattens the heading sizes, list markers and link colours MUI's typography sets up, and its `border: 0 solid` restyles every MUI component on the page rather than only the ones from here.

Nothing in this library depends on Preflight. Keep using `CssBaseline`.

### If you already use Tailwind

When Tailwind v4 is already in your project, import the token sheet instead of the compiled one. Nothing is generated twice, and a `className` you pass to a component sorts correctly against the component's own classes.

```css
@import 'tailwindcss';
@import 'material-plus/tailwind.css';
```

| Line | What it does |
| --- | --- |
| `@import 'tailwindcss'` | Tailwind itself |
| `@import 'material-plus/tailwind.css'` | The design tokens, and the `@source` that registers the package |

You do not write an `@source` of your own. The classes the components use are Tailwind utilities, so Tailwind has to read the package's compiled files to find them; `material-plus/tailwind.css` takes care of that by declaring `@source '.'` inside itself. `@source` resolves relative to the file it is written in, which here is `node_modules/material-plus/dist/`, right next to those files. An explicitly registered source is scanned even inside `node_modules`, which automatic detection skips.

The upshot is that nothing depends on where your own CSS file sits.

## Use

Material Plus components go anywhere an MUI component goes, inside the same provider.

```tsx
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MPTextField } from 'material-plus';

const theme = createTheme({ palette: { mode: 'light' } });

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MPTextField label="Email" type="email" value={email} onChange={setEmail} />
    </ThemeProvider>
  );
}
```

## Dark mode

There is nothing to configure. The components read the palette from the surrounding `ThemeProvider`, so whatever you already do for dark mode in MUI — a `mode` on the theme, `useColorScheme`, `CssVarsProvider` — governs these components too.

## What is in the package

| Export                          | What it is                                           |
| ------------------------------- | ---------------------------------------------------- |
| `material-plus`                 | Every component and type                             |
| `material-plus/types`           | The shared prop vocabulary on its own                |
| `material-plus/constants/icons` | The icon set, as named exports and as a lookup table |
| `material-plus/styles.css`      | Finished CSS, for a project with no Tailwind         |
| `material-plus/tailwind.css`    | Tokens and `@source`, for a project that has it      |

## Next

- [All components](../components/) — one page each, with live previews and the full props table.
- [MPTextField](../components/inputs/text-field) — the field, and why composition needs handling at all.
- [MPIcon](../components/display/icon) — bringing your own icon set.
