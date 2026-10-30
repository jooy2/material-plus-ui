/**
 * What the two navigation bars share, which is everything except the sheet.
 *
 * `MPBottomNavigation` is the bar held against the bottom edge of the window;
 * `MPFloatingBottomNavigation` is the same row of destinations lifted clear of
 * it. They differ in shape, in where they sit and in how wide they are — and in
 * nothing a destination can see. So the context an `MPBottomNavigationItem`
 * reads lives here rather than inside either of them, and an item works in
 * both without knowing which it is in.
 *
 * A file of its own rather than one bar importing the other, because that
 * import would run the wrong way: an item belongs to whichever bar it was put
 * in, and a floating bar that had to pull in the full-width bar's height table
 * and position map to reach a context would carry both sheets' CSS into every
 * page that rendered either.
 *
 * There are no class strings in here, which is why it costs nothing to be
 * shared — see the note at the top of `internal/density.ts` for what happens
 * when there are.
 */
import * as React from 'react';
import type { MPSize } from '../types';

/** A destination's value. The same restraint `MPTabs` puts on a tab's. */
export type MPBottomNavigationValue = string | number;

/**
 * Which names are drawn.
 *
 * MD3's three label behaviours, and the order they lose information in:
 *
 * - `all` — every destination is named. The only one that works for a reader
 *   who has not used the application before.
 * - `selected` — only the destination the reader is on.
 * - `none` — glyphs only.
 *
 * Undrawn is never unsaid: in both of the last two the names stay in the
 * document for a screen reader, because a glyph on its own has no accessible
 * name at all.
 */
export type MPBottomNavigationLabels = 'all' | 'selected' | 'none';

/** What an `MPBottomNavigationItem` inherits from whichever bar it is in. */
export interface MPBottomNavigationContextValue {
  value: MPBottomNavigationValue | null;
  change: (value: MPBottomNavigationValue) => void;
  size: MPSize;
  labels: MPBottomNavigationLabels;
  disabled: boolean;
  /**
   * Whether the bar is the floating one.
   *
   * The one thing a destination does need to know, and it is about width rather
   * than about looks: a full-width bar divides its own width between its
   * destinations, so each is `flex-1`; a floating one is only as wide as what is
   * in it, so each is as wide as its own contents. Stretched inside a lozenge
   * they would each take a fifth of nothing.
   */
  floating: boolean;
}

export const MPBottomNavigationContext = React.createContext<MPBottomNavigationContextValue>({
  value: null,
  change: () => {},
  size: 'md',
  labels: 'all',
  disabled: false,
  floating: false
});
