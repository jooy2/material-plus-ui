/**
 * The few places a computed or inline style has to be compared as a string, and
 * the browsers disagree about how to spell it.
 */

/**
 * `transform-origin` in the one spelling every engine agrees on.
 *
 * The property is three-dimensional, and reading it back gives a two-value
 * answer in Chromium and WebKit — `left top` — and a three-value one in Firefox,
 * which serialises the Z component it left at zero: `left top 0px`. Both are
 * correct and both describe the same point, so the trailing zero is dropped
 * rather than written into the expectation of one engine and asserted against
 * all three.
 *
 * A depth a component actually asked for survives, because it would not be
 * `0px`. Nothing in this library sets one — the effects scale and rotate in the
 * plane — but a test that quietly discarded a real value would be worse than no
 * helper at all.
 */
export function transformOrigin(element: HTMLElement): string {
  return element.style.transformOrigin.replace(/ 0px$/, '');
}
