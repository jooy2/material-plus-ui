/**
 * Showing and hiding at a window size class, as class names.
 *
 * Two components need this and neither is really about it: `MPShow` is nothing
 * but this, and `MPSidebar` uses it to keep a column off a narrow screen for the
 * one paint before JavaScript has found out how wide the window is.
 *
 * ## Why it is CSS and not the hook
 *
 * `useMPWindowClass` could answer the same question, and a page that swapped a
 * whole navigation pattern on it would be right — eventually. The correction is
 * a second render, so the first paint is a guess, and on a phone that guess is a
 * desktop sidebar drawn and thrown away. A media query has no first render to be
 * wrong: the browser resolves it before it paints anything, on the server's own
 * markup.
 *
 * The cost is that both branches are in the DOM. That is the trade, and it is
 * the right way round for a nav bar or a column of filters and the wrong way
 * round for a heavy subtree that only one width ever sees — which is where the
 * hook earns its second render.
 *
 * ## Why the names are written out
 *
 * These are Tailwind's own `hidden`, under the variants `src/styles.css`
 * registers. Tailwind finds classes by scanning source text, so
 * `mp-${windowClass}:hidden` assembled at runtime generates no rule at all and
 * the component comes out visible at every width. Ten literal strings is what
 * that costs, and it is why these are tables rather than a function.
 *
 * A consumer can spell the same classes — they are in the shipped stylesheet
 * either way.
 */
import type { MPWindowClass } from '../types';

/**
 * Hidden while the window is *narrower* than this class — "show from here up".
 *
 * `compact` is the empty string rather than a class: no window is narrower than
 * compact, so there is nothing to hide it at.
 */
export const HIDDEN_BELOW: Record<MPWindowClass, string> = {
  compact: '',
  medium: 'mp-below-medium:hidden',
  expanded: 'mp-below-expanded:hidden',
  large: 'mp-below-large:hidden',
  'extra-large': 'mp-below-extra-large:hidden'
};

/**
 * Hidden from this class *up* — "show until here", the upper bound.
 *
 * `compact` is a plain `hidden`, and that is not a special case being smuggled
 * in: shown only below compact is shown nowhere, and the honest answer to a
 * bound of zero is an element that never appears.
 */
export const HIDDEN_FROM: Record<MPWindowClass, string> = {
  compact: 'hidden',
  medium: 'mp-medium:hidden',
  expanded: 'mp-expanded:hidden',
  large: 'mp-large:hidden',
  'extra-large': 'mp-extra-large:hidden'
};
