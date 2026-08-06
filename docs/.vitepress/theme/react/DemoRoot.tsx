import * as React from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/**
 * The Material UI context every preview is rendered inside.
 *
 * A consumer's application has a `ThemeProvider` at its root, and the
 * components in this library read the palette, the typography and the density
 * from it. A preview with no provider would fall back to MUI's default theme
 * and stop matching the page around it the moment the site's dark switch is
 * touched — so the docs supply one, in whichever mode the preview is showing.
 *
 * `ScopedCssBaseline` rather than `CssBaseline`: the baseline is MUI's page
 * reset, and this page is VitePress's. Scoped, it applies the background,
 * colour and typography defaults to the preview alone and leaves the
 * documentation's own prose alone.
 *
 * Both themes are built once at module scope. `createTheme` is not cheap and a
 * component page holds a dozen previews, each of which would otherwise build
 * its own copy on every render — and two previews holding different theme
 * objects means Emotion generating the same class twice.
 */
const themes = {
  light: createTheme({ palette: { mode: 'light' } }),
  dark: createTheme({ palette: { mode: 'dark' } })
} as const;

export type DemoMode = keyof typeof themes;

export default function DemoRoot({
  mode,
  children
}: {
  mode: DemoMode;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={themes[mode]}>
      {/* The canvas behind it already carries the colour, and a second opaque
          background here would cover the grid the frame draws. */}
      <ScopedCssBaseline sx={{ backgroundColor: 'transparent' }}>{children}</ScopedCssBaseline>
    </ThemeProvider>
  );
}
