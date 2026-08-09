import * as React from 'react';

/**
 * The scheme context every preview is rendered inside.
 *
 * There is no provider. The components take their colours from CSS custom
 * properties, so telling a preview which scheme to draw is a `data-mp-scheme`
 * attribute on the element around it — the same one line an application writes,
 * and the reason a preview can be in a different scheme from the page it sits
 * on without a second React tree or a second theme object.
 *
 * This used to be an `@mui/material` `ThemeProvider` with a `createTheme` per
 * mode, plus a `ScopedCssBaseline` for the reset. None of it is needed now: the
 * scheme is an attribute, and the components carry their own resets on the
 * elements that need them rather than relying on a page-level one.
 *
 * What still has to be dealt with is the opposite problem — VitePress styling
 * the components, since a preview is rendered inside rendered Markdown and a
 * form is built from the same tags an article is. That is `styles/scope.css`.
 */
export type DemoMode = 'light' | 'dark';

export default function DemoRoot({
  mode,
  children
}: {
  mode: DemoMode;
  children: React.ReactNode;
}) {
  return <div data-mp-scheme={mode}>{children}</div>;
}
