/**
 * A length, said the way this library says lengths.
 *
 * One rule, everywhere: **a number is CSS pixels and a string is already a CSS
 * length.** Twelve components had written it out inline and four more had a
 * private `toLength` of their own, which is sixteen copies of a sentence that is
 * either true of the whole library or true of nothing.
 *
 * They all happened to agree. That is the argument for collecting them rather
 * than against it — sixteen agreeing copies are sixteen chances for the
 * seventeenth to be written slightly differently, and the difference would be a
 * prop that quietly took a number to mean something else.
 *
 * Nothing here is exported from `src/index.ts`. It is the library talking to
 * itself, in the sense `internal/` always means.
 */

/** A number is pixels; a string is whatever it says; nothing is nothing. */
export function cssLength(value: number | string): string;
export function cssLength(value: number | string | undefined | null): string | undefined;
export function cssLength(value: number | string | undefined | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
}

/** The four units a size in this library is ever written in. */
const LENGTH = /^\s*(-?[\d.]+)\s*(px|rem|em|%)\s*$/;

/**
 * A CSS length string, in pixels, or `undefined` for one this cannot resolve.
 *
 * The two components that let a reader *drag* a size — `MPSidebar` and
 * `MPPanes` — both have to turn a written bound into a number to clamp against,
 * and both had the same regex and the same unit arithmetic. This is that,
 * once.
 *
 * `undefined` rather than a fallback, so each caller decides what an
 * unresolvable bound means. They do not agree, and should not: a pane with an
 * unreadable `minSize` is a pane with no minimum, and a sidebar with an
 * unreadable one still has a default to fall back to. A parser that picked for
 * them would have to pick wrongly for one of them.
 *
 * ## What the units are measured against
 *
 * `%` is a share of `extent`, which is whatever the caller is dividing up — the
 * split's own width, the window's. `rem` is the document's font size and `em` is
 * `root`'s, which is the distinction that makes `em` worth accepting at all: a
 * bound written in `em` is a bound in the *component's* text, and a component
 * inside a scaled-down panel means something different by it than the page does.
 */
export function pixelsIn(
  value: string,
  extent?: number,
  root?: Element | null
): number | undefined {
  const match = LENGTH.exec(value);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);

  if (Number.isNaN(amount)) {
    return undefined;
  }

  switch (match[2]) {
    case 'px':
      return amount;
    case '%':
      return extent === undefined ? undefined : (extent * amount) / 100;
    case 'rem':
      return typeof document === 'undefined'
        ? undefined
        : amount * (Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    default:
      return typeof document === 'undefined' || !root
        ? undefined
        : amount * (Number.parseFloat(getComputedStyle(root).fontSize) || 16);
  }
}
