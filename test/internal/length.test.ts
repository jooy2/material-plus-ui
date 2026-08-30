import { describe, expect, it } from 'vitest';
import { cssLength, pixelsIn } from '../../src/internal/length';

/**
 * The one rule the whole library states about a size, and the parser the two
 * draggable components share.
 *
 * Sixteen places used to write the first of these out inline. They all agreed,
 * which is the argument for collecting them rather than against it: sixteen
 * agreeing copies are sixteen chances for the seventeenth to be written slightly
 * differently, and the difference would be a prop that quietly took a number to
 * mean something else.
 */
describe('cssLength', () => {
  it('reads a number as pixels', () => {
    expect(cssLength(240)).toBe('240px');
    expect(cssLength(0)).toBe('0px');
    expect(cssLength(-8)).toBe('-8px');
  });

  it('leaves a string as whatever it says', () => {
    expect(cssLength('15rem')).toBe('15rem');
    expect(cssLength('50%')).toBe('50%');
    expect(cssLength('calc(100% - 2rem)')).toBe('calc(100% - 2rem)');
  });

  it('answers nothing for nothing', () => {
    expect(cssLength(undefined)).toBeUndefined();
    expect(cssLength(null)).toBeUndefined();
  });
});

describe('pixelsIn', () => {
  it('reads pixels as themselves', () => {
    expect(pixelsIn('240px')).toBe(240);
    expect(pixelsIn('  240px  ')).toBe(240);
    expect(pixelsIn('-12.5px')).toBe(-12.5);
  });

  it('reads a percentage against the extent it was given', () => {
    expect(pixelsIn('50%', 800)).toBe(400);
  });

  // A percentage of nothing is not zero, it is unanswerable — and a caller that
  // read it as zero would pin a pane shut.
  it('refuses a percentage with nothing to measure against', () => {
    expect(pixelsIn('50%')).toBeUndefined();
  });

  it('reads rem against the document', () => {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    expect(pixelsIn('2rem')).toBeCloseTo(root * 2, 3);
  });

  /*
   * `em` is the *component's* text rather than the page's, which is the whole
   * reason it is worth accepting: a bound written in `em` inside a scaled-down
   * panel means something different from the same bound on the page.
   */
  it('reads em against the element it was given', () => {
    const box = document.createElement('div');

    box.style.fontSize = '10px';
    document.body.append(box);

    try {
      expect(pixelsIn('3em', undefined, box)).toBeCloseTo(30, 3);
    } finally {
      box.remove();
    }
  });

  it('refuses em with no element to measure against', () => {
    expect(pixelsIn('3em')).toBeUndefined();
  });

  /*
   * `undefined` rather than a fallback, so each caller decides what an
   * unresolvable bound means. They do not agree and should not: a pane with an
   * unreadable `minSize` has no minimum, and a sidebar with one still has a
   * default to fall back to.
   */
  it('refuses a unit it does not read, rather than guessing', () => {
    expect(pixelsIn('10vw')).toBeUndefined();
    expect(pixelsIn('auto')).toBeUndefined();
    expect(pixelsIn('calc(100% - 2rem)')).toBeUndefined();
    expect(pixelsIn('')).toBeUndefined();
  });
});
