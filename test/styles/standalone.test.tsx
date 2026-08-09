import { describe, expect, it } from 'vitest';
import styles from '../../dist/styles.css?inline';

/**
 * The shipped stylesheet, read as text.
 *
 * `dist/styles.css` is what a project with no Tailwind of its own imports, and
 * it is generated: Tailwind scans the compiled components and emits a rule for
 * each utility class it finds spelled out there. That makes it the one build
 * output that can silently come out empty — a wrong `@source`, a class built by
 * string concatenation, a `source(none)` that swept too much away — and nothing
 * in a component test would notice, because the components render the same
 * markup either way.
 *
 * So this file asserts on the CSS rather than on a component. `npm run build`
 * has to have run, which `npm ci` and `npm install` both do via `prepare`.
 */
describe('dist/styles.css', () => {
  it('is not empty', () => {
    expect(styles.length).toBeGreaterThan(0);
  });

  it('carries the tokens a consumer sets', () => {
    // The input side: the source colour, and the tone stops the two schemes are
    // read at. These live in a plain `:root` precisely so Tailwind cannot prune
    // them — a variable referenced only from inside another custom property's
    // value has no utility pointing at it, and would be a removal candidate if
    // it were declared in `@theme`.
    for (const token of ['--mp-source-color', '--_mp-tone-primary', '--_mp-chroma-outline']) {
      expect(styles).toContain(token);
    }
  });

  it('reassigns every tone stop for the dark scheme', () => {
    // The two schemes are the same tonal palettes read at different tones, so a
    // stop that only got a light value would silently keep it in dark. Both
    // entry points have to carry the full set: the page's own
    // `prefers-color-scheme`, and the explicit attribute or class.
    const stops = [...new Set(styles.match(/--_mp-(?:tone|chroma|hue)-[a-z-]+/g) ?? [])];

    expect(stops.length).toBeGreaterThan(0);

    for (const block of [
      styles.match(/@media \(prefers-color-scheme:\s*dark\)\{[^{]*\{([^}]*)\}/)?.[1],
      styles.match(/\[data-mp-scheme=["']?dark["']?\][^{]*\{([^}]*)\}/)?.[1]
    ]) {
      expect(block).toBeDefined();

      for (const stop of stops) {
        expect(block).toContain(`${stop}:`);
      }
    }
  });

  it('derives the colour roles on every element, not on `:root`', () => {
    // `var()` is substituted where a property is *declared*, and descendants
    // inherit the result. A role declared once on `:root` would freeze the
    // baseline source colour and the light scheme there, so a `.dark` on
    // `<body>`, a scoped override on a section, and a runtime inline style would
    // all silently do nothing. Declaring on `*` is what keeps them working, and
    // this is the assertion that catches a well-meaning move back to `:root`.
    // Found by working back from the declaration to the selector that carries
    // it, rather than by matching a selector spelling: the optimiser rewrites
    // `::before` to `:before`, and Tailwind's own utilities put `*` in plenty of
    // other selectors.
    const at = styles.indexOf('--_mp-color-primary:');

    expect(at).toBeGreaterThan(-1);

    const selector = styles.slice(0, at).split('}').pop()!.split('{')[0];

    expect(selector.startsWith('*,')).toBe(true);
    expect(selector).toContain('backdrop');

    // And the roles are *not* declared on `:root`, which is the mistake this
    // guards against. Referencing them from there is fine and expected — that is
    // how `@theme` hands them to the utilities — so the check is for a
    // declaration, which is the form carrying a colon.
    for (const rule of styles.match(/:root[^{}]*\{[^}]*\}/g) ?? []) {
      expect(rule).not.toMatch(/--_mp-color-[a-z-]+\s*:/);
    }
  });

  it("reads the page's own MD3 tokens without ever writing them", () => {
    // A project running Material Web Components already defines `--md-sys-*`.
    // Those are read as the middle link of each role's fallback chain; writing
    // to them would overwrite a theme this library does not own.
    expect(styles).toContain('--md-sys-color-primary');
    expect(styles).not.toMatch(/--md-sys-color-primary\s*:/);
  });

  it('carries the layout utilities the components lay themselves out with', () => {
    for (const rule of ['inline-flex', 'shrink-0', 'items-center', 'justify-center']) {
      expect(styles).toContain(`.${rule}`);
    }
  });

  it('carries the utilities behind an MPIcon prop', () => {
    // `center`, and the pair that scales a glyph into a sized box. Both are
    // written as conditional class strings rather than interpolated, which is
    // the only form Tailwind can see — this is what checks that they stayed
    // that way.
    expect(styles).toContain('.justify-self-center');
    expect(styles).toContain('size-full');
  });

  it('does not ship a global reset', () => {
    // The library adds no page-level styling at all, so Preflight has no place
    // in it: it would restyle every element on a consumer's page rather than
    // only the ones rendered from here. See `src/standalone.css`.
    expect(styles).not.toContain('*,::before,::after');
    expect(styles).not.toContain('-moz-tab-size');
  });
});
