import { describe, expect, it } from 'vitest';
import tokens from '../../dist/styles/tokens.css?inline';
import box from '../../dist/styles/box.css?inline';
import grid from '../../dist/styles/grid.css?inline';
import animateFade from '../../dist/styles/animate-fade.css?inline';
import progressLinear from '../../dist/styles/progress-linear.css?inline';
import whole from '../../dist/styles.css?inline';

/**
 * The split stylesheets, read as text.
 *
 * `dist/styles.css` is every rule in one file; `dist/styles/` is the same rules
 * cut up by component, so a page that renders an `MPBox` can import the tokens
 * and the box and nothing else. `scripts/build-split-styles.mjs` does the
 * cutting, and it already fails the build over the two mistakes that would be
 * invisible from a component test — a rule that ends up in no sheet, and a sheet
 * that reads a custom property nothing defines.
 *
 * What is left for here is the shape of the seam: that the tokens really are
 * only tokens, that a component's sheet carries its own hand-written rules and
 * not somebody else's, and that the split is worth doing at all. Those are the
 * decisions a future change would break quietly, and they are all readable off
 * the text.
 */
describe('dist/styles/', () => {
  describe('the token sheet', () => {
    it('carries the tokens a consumer sets', () => {
      for (const token of ['--mp-source-color', '--_mp-tone-accent', '--_mp-chroma-outline']) {
        expect(tokens).toContain(token);
      }
    });

    it('pins the layer order, which is otherwise whichever sheet was imported first', () => {
      // Written as `@layer properties, theme;` and emitted as a bare
      // declaration of the first — either way it is `properties` before
      // `theme`, which is the order the whole sheet has and the order a split
      // one would otherwise get from whichever file a consumer imported first.
      const declared = tokens.indexOf('@layer properties');
      const used = tokens.indexOf('@layer theme');

      expect(declared).toBeGreaterThanOrEqual(0);
      expect(declared).toBeLessThan(used);
    });

    it('is tokens and nothing else — no component draws from it alone', () => {
      // The hand-written rules moved out to the components that draw with them;
      // finding one here means the tokens sheet has started carrying weight for
      // a component nobody on the page rendered.
      expect(tokens).not.toContain('@keyframes');
      expect(tokens).not.toContain('.mp-anim');
      expect(tokens).not.toContain('.mp-grid');
    });
  });

  describe('a component sheet', () => {
    it('carries the hand-written rules its own component draws with', () => {
      // The grid's breakpoints are real CSS in `src/styles.css`, not utilities,
      // so Tailwind passes them through and cannot attribute them. This is the
      // assertion that the build did.
      expect(grid).toContain('@media (min-width:600px)');
      expect(animateFade).toContain('@keyframes mp-anim-fade');
      expect(progressLinear).toContain('@keyframes mp-progress-linear-lead');
    });

    it('carries nobody else’s', () => {
      expect(box).not.toContain('@keyframes');
      expect(box).not.toContain('@media (min-width:600px)');
      expect(grid).not.toContain('@keyframes mp-anim-fade');
      expect(progressLinear).not.toContain('@keyframes mp-anim-fade');
    });

    it('leaves the colour roles to the token sheet', () => {
      // A sheet that redeclared them would be a sheet that overrides whatever
      // the page set, in whichever order the imports happened to land.
      expect(box).not.toContain('--mp-source-color');
      expect(box).not.toContain('--mp-sys-color-surface:');
    });
  });

  it('is smaller than the whole sheet for the page that renders one component', () => {
    // The whole reason the split exists. Uncompressed here rather than gzipped,
    // because the ratio only widens once both are compressed — the build prints
    // the compressed figures and the point at which the whole sheet wins again.
    expect((tokens + box).length).toBeLessThan(whole.length / 2);
  });
});
