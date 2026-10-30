import { describe, expect, it } from 'vitest';
import { controlHeight, sheetPad, sheetPadX, sheetPadY } from '../../src/internal/density';
import type { MPDensity, MPSize } from '../../src/types';

const SIZES: readonly MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const STEPS: readonly MPDensity[] = [0, -1, -2, -3];

/** `h-13` → 52, `p-3.5` → 14. The Tailwind spacing scale is 0.25rem a step. */
function pixels(className: string): number {
  const step = Number(className.slice(className.indexOf('-') + 1));

  return step * 4;
}

/**
 * The density ladder, and the arithmetic that keeps it lined up with everything
 * else.
 *
 * These are the four tables `MPDensity` describes, and the reason they are
 * tested as tables rather than through a component: every one of them is a class
 * string that has to *be* a particular measurement, and a mistyped rung is a row
 * four pixels out of step with the button beside it — which is exactly the kind
 * of wrong that looks fine in a screenshot.
 */
describe('controlHeight', () => {
  it('is the ladder itself at density 0', () => {
    expect(controlHeight('xs')).toBe('h-8');
    expect(controlHeight('sm')).toBe('h-10');
    expect(controlHeight('md')).toBe('h-14');
    expect(controlHeight('lg')).toBe('h-16');
    expect(controlHeight('xl')).toBe('h-18');
  });

  it("takes MD3's four pixels out a step", () => {
    expect(pixels(controlHeight('md', 0))).toBe(56);
    expect(pixels(controlHeight('md', -1))).toBe(52);
    expect(pixels(controlHeight('md', -2))).toBe(48);
    expect(pixels(controlHeight('md', -3))).toBe(44);
  });

  it('stops at 24, rather than at whatever the subtraction gives', () => {
    // `xs` starts closest to the floor: 32, 28, 24, and the third step has
    // nowhere to go. Below 24 a control stops meeting a touch target.
    expect(pixels(controlHeight('xs', -1))).toBe(28);
    expect(pixels(controlHeight('xs', -2))).toBe(24);
    expect(pixels(controlHeight('xs', -3))).toBe(24);
  });

  it('never draws a control under the floor, at any pair', () => {
    for (const size of SIZES) {
      for (const density of STEPS) {
        expect(pixels(controlHeight(size, density))).toBeGreaterThanOrEqual(24);
      }
    }
  });

  it('lands a denser rung exactly on a plainer one', () => {
    // What makes a dense list line up with the controls beside it: every cell of
    // the table is a height the ladder already has a name for.
    expect(controlHeight('md', -2)).toBe('h-12');
    expect(controlHeight('lg', -2)).toBe(controlHeight('md', 0));
    expect(controlHeight('xl', -2)).toBe(controlHeight('lg', 0));
  });
});

describe('sheetPad', () => {
  it('is the padding track itself at density 0', () => {
    expect(sheetPad('md')).toBe('p-4');
    expect(sheetPadX('md')).toBe('px-4');
    expect(sheetPadY('md')).toBe('py-4');
  });

  it('takes two pixels a face, which is four out of the box', () => {
    // Padding sits on both sides of what it surrounds, so two off each face is
    // what takes MD3's four off the height.
    expect(pixels(sheetPad('md', -1))).toBe(14);
    expect(pixels(sheetPad('md', -2))).toBe(12);
    expect(pixels(sheetPad('md', -3))).toBe(10);
  });

  it('stops at 6, which is where the room around content runs out', () => {
    expect(pixels(sheetPad('xs', -1))).toBe(8);
    expect(pixels(sheetPad('xs', -2))).toBe(6);
    expect(pixels(sheetPad('xs', -3))).toBe(6);
  });

  it('says the same thing on all three tracks', () => {
    // Three tables exist because Tailwind reads source text, not because the
    // axes disagree — a `p-4` cannot become a `py-4` at runtime.
    for (const size of SIZES) {
      for (const density of STEPS) {
        const all = sheetPad(size, density);

        expect(sheetPadX(size, density)).toBe(`px-${all.slice(2)}`);
        expect(sheetPadY(size, density)).toBe(`py-${all.slice(2)}`);
      }
    }
  });

  it('never goes under the floor, at any pair', () => {
    for (const size of SIZES) {
      for (const density of STEPS) {
        expect(pixels(sheetPad(size, density))).toBeGreaterThanOrEqual(6);
      }
    }
  });
});
