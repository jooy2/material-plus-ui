import * as React from 'react';

/**
 * `useLayoutEffect` in a browser, and `useEffect` — which a server skips just
 * the same, without React 18's warning that a layout effect does nothing there
 * — everywhere else.
 */
export const useBrowserLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
