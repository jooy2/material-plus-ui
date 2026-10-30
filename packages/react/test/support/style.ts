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

/**
 * Where an element has been displaced to, as a pair of numbers.
 *
 * For asserting on a transition that is **running**, which is the only moment a
 * displacement exists at all — and where a test must not name a frame. An
 * animation is two hundred milliseconds wide and every engine lands somewhere
 * different inside it: reading a drawer's travel the instant it opens gives
 * `-100%` in Chromium and `-97.7%` in Firefox, and both of them mean the panel
 * is to the left of where it is going. The sign is the claim; the distance is
 * the engine's business.
 *
 * `translate` serialises with the axes it was given, so a single-axis travel
 * comes back as one value and `none` comes back as a word. Both resolve to a
 * pair here, with the missing half at zero.
 *
 * The units are deliberately not resolved. A percentage and a length are not
 * comparable to each other and nothing here needs them to be — every caller is
 * asking which side of home the element is on.
 */
export function translation(element: Element): { x: number; y: number } {
  const [x, y] = getComputedStyle(element).translate.split(' ');

  return { x: Number.parseFloat(x) || 0, y: Number.parseFloat(y) || 0 };
}

/**
 * How far an element has been scaled, as one number.
 *
 * The same job `translation` does, for the other property a surface arrives on.
 * `scale: none` is the resting state and reads back as the word rather than as
 * `1`, so it is spelled out here — a caller comparing against 1 should not have
 * to know that.
 */
export function scaled(element: Element): number {
  const value = getComputedStyle(element).scale;

  return value === 'none' ? 1 : Number.parseFloat(value);
}
