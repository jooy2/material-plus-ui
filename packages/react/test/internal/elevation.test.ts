import { describe, expect, it } from 'vitest';
import { containerSurface, ELEVATION_SURFACE } from '../../src/internal/elevation';
import { CONTAINER_SURFACE } from '../../src/internal/surface';
import { barSurface, BAR_SURFACE } from '../../src/internal/page-layout';
import type { MPElevation, MPVariant } from '../../src/types';

const LEVELS: readonly MPElevation[] = [0, 1, 2, 3, 4, 5];
const VARIANTS: readonly MPVariant[] = ['filled', 'tonal', 'elevated', 'outlined', 'text'];

/**
 * The pairing, and the one thing that would quietly undo it.
 *
 * `MPElevation` only holds together because every level carries a tone as well
 * as a shadow. A row that lost its tone would raise a surface the specification
 * has no name for, and it would look almost right — which is why the pairing is
 * asserted per row rather than left to a reading of the table.
 */
describe('ELEVATION_SURFACE', () => {
  it('pairs a shadow with a tone at every raised level', () => {
    for (const level of LEVELS) {
      const row = ELEVATION_SURFACE[level];

      expect(row).toMatch(/\bbg-mp-surface/);
      expect(row).toMatch(level === 0 ? /\bshadow-none\b/ : new RegExp(`\\bshadow-mp-${level}\\b`));
    }
  });

  it('is flat on the page at 0, and says so as the absence of a shadow', () => {
    // Level 0 has no token because it is not a shadow. It is the lack of one,
    // which CSS already spells.
    expect(ELEVATION_SURFACE[0]).toContain('shadow-none');
    expect(ELEVATION_SURFACE[0]).toContain('bg-mp-surface ');
  });

  it("is the variant table's `elevated` row at 1", () => {
    // `variant="elevated"` *is* `elevation={1}`, named. The two tables have to
    // agree about that or the same card is two different surfaces.
    expect(ELEVATION_SURFACE[1]).toBe(CONTAINER_SURFACE.elevated);
  });

  it('lets 4 and 5 share the tones under them', () => {
    // The specification runs out of container roles before it runs out of
    // levels; inventing a sixth tone would be inventing a colour role.
    expect(ELEVATION_SURFACE[4]).toContain('bg-mp-surface-container-high');
    expect(ELEVATION_SURFACE[3]).toContain('bg-mp-surface-container-high');
    expect(ELEVATION_SURFACE[4]).not.toBe(ELEVATION_SURFACE[3]);
  });
});

describe('containerSurface', () => {
  it('leaves the variant in charge when no level was given', () => {
    for (const variant of VARIANTS) {
      expect(containerSurface(variant, undefined)).toBe(CONTAINER_SURFACE[variant]);
    }
  });

  it('lets a level replace the surface, tone and all', () => {
    // Not a shadow added on top of whatever the variant painted: two props
    // writing one `background-color` would be settled by the order two class
    // names reached the stylesheet.
    expect(containerSurface('filled', 2)).toBe(ELEVATION_SURFACE[2]);
    expect(containerSurface('text', 2)).toBe(ELEVATION_SURFACE[2]);
    expect(containerSurface('filled', 2)).not.toContain('surface-container-highest');
  });

  it('keeps an outline, which is the one thing a level does not describe', () => {
    const raised = containerSurface('outlined', 3);

    expect(raised).toContain('border-mp-outline-variant');
    expect(raised).toContain(ELEVATION_SURFACE[3]);
  });

  it('never paints two backgrounds', () => {
    for (const variant of VARIANTS) {
      for (const level of LEVELS) {
        const painted = containerSurface(variant, level).match(/\bbg-[a-z-]+/g) ?? [];

        expect(painted).toHaveLength(1);
      }
    }
  });
});

describe('barSurface', () => {
  it('leaves the variant in charge when no level was given', () => {
    for (const variant of VARIANTS) {
      expect(barSurface(variant, undefined)).toBe(BAR_SURFACE[variant]);
    }
  });

  it('rests a step higher than a container does', () => {
    // A bar sits over the page's content rather than in it.
    expect(BAR_SURFACE.elevated).toContain('shadow-mp-2');
    expect(CONTAINER_SURFACE.elevated).toContain('shadow-mp-1');
  });

  it('draws no hairline round an outlined bar it was given a level for', () => {
    // The rule under a top app bar belongs to the bar's own edge treatment.
    expect(barSurface('outlined', 2)).toBe(ELEVATION_SURFACE[2]);
  });
});
