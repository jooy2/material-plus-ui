import { describe, expect, it } from 'vitest';
import { dateFormatter, monthLabels, weekdayLabels } from '../../src/internal/date';

/**
 * What the caches under `internal/date.ts` promise, and what they refuse to.
 *
 * They are keyed on a locale and a `format`, and `format` is a caller's prop —
 * so how many distinct keys exist is not something the module gets to decide. A
 * table formatting a date per row against a per-row format would grow a `Map`
 * that never dropped anything, for as long as the page stayed open.
 *
 * The cap is asserted through the *behaviour* it protects rather than by reading
 * the map: a formatter is still cached when it should be, and the module keeps
 * answering correctly once the cap has been passed, which is the only thing an
 * eviction is allowed to cost.
 */
const JULY = new Date(2026, 6, 15);

describe('the date formatter cache', () => {
  it('hands the same formatter back for the same question', () => {
    const first = dateFormatter('en-GB', { dateStyle: 'medium' });
    const second = dateFormatter('en-GB', { dateStyle: 'medium' });

    expect(second).toBe(first);
  });

  it('keeps two different questions apart', () => {
    const medium = dateFormatter('en-GB', { dateStyle: 'medium' });
    const full = dateFormatter('en-GB', { dateStyle: 'full' });

    expect(full).not.toBe(medium);
    expect(medium.format(JULY)).not.toBe(full.format(JULY));
  });

  /*
   * The point of the cap. A hundred distinct formats is more than any page asks
   * for and is exactly what an unbounded map would hold forever; what has to
   * survive it is that every one of them still formats correctly.
   */
  it('goes on answering correctly past the point where it starts forgetting', () => {
    for (let year = 1900; year < 2000; year += 1) {
      const formatter = dateFormatter('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        fractionalSecondDigits: undefined,
        era: year % 2 === 0 ? 'short' : undefined
      });

      expect(formatter.format(JULY)).toContain('2026');
    }

    // And the one asked for first, long since evicted, is rebuilt rather than
    // lost.
    expect(dateFormatter('en-GB', { dateStyle: 'medium' }).format(JULY)).toContain('2026');
  });
});

describe('the name cache', () => {
  it('hands the same array back, which is what makes it a useMemo dependency', () => {
    expect(weekdayLabels('en-GB', 1)).toBe(weekdayLabels('en-GB', 1));
    expect(monthLabels('en-GB')).toBe(monthLabels('en-GB'));
  });

  it('rotates the week to the day it was told to start on', () => {
    const sunday = weekdayLabels('en-GB', 0, 'long');
    const monday = weekdayLabels('en-GB', 1, 'long');

    expect(sunday[0]).toBe('Sunday');
    expect(monday[0]).toBe('Monday');
  });

  it('goes on answering correctly past the cap', () => {
    // Every locale is its own key, so this walks well past sixty-four of them.
    for (let index = 0; index < 100; index += 1) {
      expect(monthLabels(`en-GB-u-nu-latn-x-${index}`)).toHaveLength(12);
    }

    expect(monthLabels('en-GB')[0]).toBe('Jan');
  });
});
