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

  it('carries the tokens', () => {
    expect(styles).toContain('--mp-duration');
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
    // MUI's `CssBaseline` is the reset in every project using this library, and
    // Tailwind's Preflight would restyle every `@mui/material` component on the
    // page rather than only the ones from here. See `src/standalone.css`.
    expect(styles).not.toContain('*,::before,::after');
    expect(styles).not.toContain('-moz-tab-size');
  });
});
