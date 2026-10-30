/**
 * What a menu row inherits from the menu around it.
 *
 * The same arrangement `MPButtonGroup` uses, and for the same reason: `size` and
 * `color` are properties of the *menu*, not of any one row in it, and passing
 * them per row would be two chances per row to get one wrong — with a silent
 * failure, a menu whose fourth item is a size bigger than the three above it.
 *
 * It lives in `internal/` rather than in `MPMenu.tsx` because a submenu is a menu
 * inside a menu and a context menu is the same rows hung off a right-click, so
 * three components read this and none of them should have to import the others.
 *
 * Unlike the button group's context this one is never `null`: a row rendered
 * outside a menu is a bug Base UI will report first, and defaulting here keeps
 * every row from having to answer "what if there is no menu".
 */
import * as React from 'react';
import type { MPColor, MPSize } from '../types';

export interface MPMenuContextValue {
  size: MPSize;
  color: MPColor;
}

export const MPMenuContext = React.createContext<MPMenuContextValue>({
  size: 'md',
  color: 'primary'
});
