/**
 * The prop vocabulary shared across Material Plus components.
 *
 * This library sits on top of Material UI rather than beside it, so the rule
 * here is the opposite of the usual one for a component library: **where MUI
 * already has a word, use MUI's word.** A `size` of `'small'`, a `color` of
 * `'primary'` and an `error` boolean mean on an `MP*` component exactly what
 * they mean on the `@mui/material` component next to it in the same form. A
 * second vocabulary would make a consumer translate between two libraries on
 * every line, which is the thing this package exists to avoid.
 *
 * What lives here is only what MUI has no word for.
 */
import type * as React from 'react';

/**
 * The size ladder for controls, spelled the way MUI spells it.
 *
 * Re-declared rather than imported from `@mui/material` on purpose: it is two
 * string literals, and importing it would put a type-only dependency on a
 * peer's internal module path in every component's declaration file.
 */
export type MPSize = 'small' | 'medium';

/** A palette role. The same six names `@mui/material` uses. */
export type MPColor = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

/**
 * The props a glyph component is handed when Material Plus renders one.
 *
 * Deliberately the shape `lucide-react` icons already take, which is also the
 * shape most icon sets settle on — a size, a colour and a stroke. Any component
 * accepting these can be passed as an `icon`, so an application is not tied to
 * the set this library happens to depend on.
 */
export interface MPIconGlyphProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  [key: string]: unknown;
}

/**
 * Something that can be drawn as an icon.
 *
 * Two forms, because icon sets hand back two different things:
 *
 * - **A component** — `<MPIcon icon={ICONS.close} />`. This is what
 *   `lucide-react`, `react-icons` and most sets export, and it is the form that
 *   lets `MPIcon` pass a size and a colour *into* the glyph rather than trying
 *   to style an element from the outside.
 * - **An element** — `<MPIcon icon={<svg>…</svg>} />`. A drawing of your own, a
 *   `@mui/icons-material` glyph already constructed, an `<img>`. It is sized by
 *   the box it is laid into.
 *
 * Note that this is *not* `React.ReactNode`. A component and an element are
 * rendered differently, and the distinction has to survive into the type or a
 * caller passing `ICONS.close` would be told to pass `<ICONS.close />` instead.
 */
export type MPIconGlyph = React.ComponentType<MPIconGlyphProps> | React.ReactElement;
