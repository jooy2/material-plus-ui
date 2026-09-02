import { describe, expect, it } from 'vitest';
import source from '../../src/styles.css?raw';
import { WINDOW_CLASSES, WINDOW_MIN } from '../../src/internal/window-class';

/**
 * The one duplication in the breakpoint system, held to account.
 *
 * The window size classes exist twice and have to: `WINDOW_MIN` is the ladder
 * the hook and the sidebar's collapse are measured against, and the
 * `@custom-variant` block in `src/styles.css` is the ladder every `@variant` in
 * the stylesheet compiles to. Neither can read the other — a media query is
 * resolved before any JavaScript runs and cannot name a custom property, and
 * JavaScript cannot see a registration Tailwind consumed at build time.
 *
 * A page whose stylesheet reflows at 600 and whose hook says `compact` until 640
 * is wrong across one band of widths and right everywhere else, which is about
 * the hardest kind of wrong to be shown. So the copies are checked rather than
 * trusted.
 *
 * Read as `?raw` — the source, not the compiled sheet. By the time Tailwind has
 * run, the variant names are widths and the question this file asks has already
 * been answered one way or the other.
 *
 * Comments come out first. The file documents how to move a boundary, and the
 * example it gives is a `@custom-variant` line at a width that is deliberately
 * not the library's — a test that read the prose would be asserting against the
 * documentation rather than against the stylesheet.
 */
const declarations = source.replace(/\/\*[\s\S]*?\*\//g, '');

/** The same again with the registrations themselves taken out — every other rule. */
const rules = declarations.replace(/@custom-variant[^;]*;/g, '');

function registered(name: string): { at: number; below: number | null } | null {
  const at = new RegExp(`@custom-variant mp-${name} \\(@media \\(width >= (\\d+)px\\)\\)`).exec(
    declarations
  );
  const under = new RegExp(
    `@custom-variant mp-below-${name} \\(@media \\(width < (\\d+)px\\)\\)`
  ).exec(declarations);

  return at ? { at: Number(at[1]), below: under ? Number(under[1]) : null } : null;
}

describe('the window size classes', () => {
  it('are registered to the stylesheet at the widths JavaScript measures', () => {
    for (const windowClass of WINDOW_CLASSES) {
      if (WINDOW_MIN[windowClass] === 0) {
        continue;
      }

      expect(registered(windowClass)?.at, windowClass).toBe(WINDOW_MIN[windowClass]);
    }
  });

  it('register both halves of every boundary at the same width', () => {
    // `mp-medium` and `mp-below-medium` are two registrations rather than one
    // Tailwind derives a pair from, so nothing but this stops them drifting a
    // pixel apart — which would be a band of widths where a thing is in neither
    // half, or in both.
    for (const windowClass of WINDOW_CLASSES) {
      if (WINDOW_MIN[windowClass] === 0) {
        continue;
      }

      const pair = registered(windowClass);

      expect(pair?.below, windowClass).toBe(pair?.at);
    }
  });

  it('leave `compact` out, because a floor of nought is not a query', () => {
    // `(width >= 0)` matches every window there is and `(width < 0)` matches
    // none, so the pair would be one registration that can never not apply and
    // one that can never apply.
    expect(registered('compact')).toBeNull();
  });

  it('are the only widths the stylesheet changes at', () => {
    // Every width-driven query in the file has to come from the ladder, which
    // means being written as a variant. A literal one is a boundary a consumer
    // moving the registrations cannot move, and it would show up as one
    // component reflowing a beat after the rest of the page.
    const literal = [...rules.matchAll(/@media[^{;]*\b(?:width|min-width|max-width)\b[^{;]*/g)];

    expect(literal.map((match) => match[0].trim())).toEqual([]);
  });

  it('are what every responsive rule in the stylesheet is written against', () => {
    const used = new Set(
      [...declarations.matchAll(/@variant\s+(mp-[a-z-]+)/g)].map(([, name]) => name)
    );

    expect(used.size).toBeGreaterThan(0);

    for (const name of used) {
      const windowClass = name.replace(/^mp-(below-)?/, '') as (typeof WINDOW_CLASSES)[number];

      expect(WINDOW_CLASSES, name).toContain(windowClass);
      expect(registered(windowClass)?.at, name).toBe(WINDOW_MIN[windowClass]);
    }
  });
});
