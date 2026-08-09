/**
 * The prop vocabulary shared across Material Plus components.
 *
 * This library implements the Material Design specification rather than wrapping
 * somebody's implementation of it, so the rule is: **where the spec already has a
 * word, use the spec's word.** A colour role is `primary` or `on-surface-variant`
 * because that is what MD3 calls it, a corner is `extra-small`, a type role is
 * `body-large`.
 *
 * In particular they are *not* Material UI's words. MUI's palette is
 * `main`/`light`/`dark`/`contrastText`, which is a different and earlier colour
 * model; borrowing those names would describe a system this library does not
 * implement. See `src/styles.css` for the token side of the same decision.
 *
 * What lives here is only what a component actually needs in its props.
 */
import type * as React from 'react';

/**
 * The size ladder every control is drawn at.
 *
 * **This is the one place the library goes beyond the specification, knowingly.**
 * Material defines a single size per component — a text field is 56dp, full
 * stop — because it is describing a design system for whole products, where one
 * height per control is the point. A component library gets used in places a
 * design system does not plan for: a filter bar, a table's inline editor, a
 * dense settings page, a marketing hero. Those need a ladder, and a consumer
 * who cannot get one from the library builds it out of `!important`.
 *
 * So `md` **is** the spec's size, and the other four are ours. That is the whole
 * rule, and it is why the ladder is centred rather than starting at the spec's
 * value: `md` is what you get by saying nothing, and nobody has to know the
 * scale exists to be given the Material size.
 *
 * `xs` and `xl` are deliberately at the edges of usable rather than merely
 * smaller and larger — below `xs` a control stops meeting a 24px touch target,
 * and there is no sixth step because a ladder long enough to need one is a sign
 * the caller wants a custom control instead.
 */
export type MPSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * An accent colour role.
 *
 * MD3's four, not Material UI's six: there is no `info`, `success` or `warning`
 * in the specification's colour system, and offering them would promise roles the
 * token sheet has no way to derive.
 */
export type MPColor = 'primary' | 'secondary' | 'tertiary' | 'error';

/**
 * The axes most components share.
 *
 * A component extends this and adds only what is genuinely its own, which is what
 * keeps `size="md"` meaning the same thing on every one of them. The rule for
 * adding to this interface is the same as the rule for adding a token: an axis
 * arrives when a second component needs it, not in anticipation of one.
 */
export interface MPStyleProps {
  /**
   * The control's height and type scale.
   * @default 'md'
   */
  size?: MPSize;
  /** Stretches the control to the width of its container. */
  fullWidth?: boolean;
}

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
 *   glyph another set has already constructed, an `<img>`. It is sized by
 *   the box it is laid into.
 *
 * Note that this is *not* `React.ReactNode`. A component and an element are
 * rendered differently, and the distinction has to survive into the type or a
 * caller passing `ICONS.close` would be told to pass `<ICONS.close />` instead.
 */
export type MPIconGlyph = React.ComponentType<MPIconGlyphProps> | React.ReactElement;
