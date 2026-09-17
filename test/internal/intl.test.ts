import { describe, expect, it } from 'vitest';
import {
  CACHE_LIMIT,
  dateTimeFormatter,
  numberFormatter,
  segmenter
} from '../../src/internal/intl';

/**
 * What the caches under `internal/intl.ts` promise, and what they refuse to.
 *
 * Constructing an `Intl` formatter resolves a locale and loads CLDR data; the
 * object that comes back then formats for free. So the whole value of this
 * module is the identity below — a second call for the same question has to hand
 * back the object the first one built, or the components that lean on it are
 * paying the construction they were written to stop paying.
 *
 * `MPAnimateCounter` is the case that makes it worth asserting rather than
 * trusting. It re-renders on every frame of a count and formats on every one of
 * those, against an options object a caller writes inline — so a cache keyed on
 * the object's *identity* would miss sixty times a second while looking like it
 * worked. These tests ask with a fresh literal each time, on purpose.
 */
const JULY = new Date(2026, 6, 15);

describe('the number formatter cache', () => {
  it('hands the same formatter back for the same question', () => {
    expect(numberFormatter('en-GB')).toBe(numberFormatter('en-GB'));
  });

  /*
   * A fresh object every call, which is what a caller writing options inline
   * hands over. The key is what the options *say*, so both of these are one
   * question asked twice.
   */
  it('reads the options rather than the object that carried them', () => {
    const first = numberFormatter('en-GB', { style: 'percent', maximumFractionDigits: 1 });
    const second = numberFormatter('en-GB', { style: 'percent', maximumFractionDigits: 1 });

    expect(second).toBe(first);
    expect(first.format(0.125)).toBe(second.format(0.125));
  });

  it('keeps two different questions apart', () => {
    const plain = numberFormatter('en-GB');
    const percent = numberFormatter('en-GB', { style: 'percent' });

    expect(percent).not.toBe(plain);
    expect(plain.format(0.5)).not.toBe(percent.format(0.5));
  });

  it('keeps two locales apart', () => {
    expect(numberFormatter('de-DE')).not.toBe(numberFormatter('en-GB'));
    expect(numberFormatter('de-DE').format(1234.5)).not.toBe(
      numberFormatter('en-GB').format(1234.5)
    );
  });

  /*
   * The point of the cap. The options are a caller's prop, so how many distinct
   * keys exist is not something the module gets to decide — a table formatting a
   * figure per row against a per-row format would grow a `Map` that never
   * dropped anything. What has to survive the eviction is that every answer is
   * still correct; an evicted formatter is rebuilt, which costs exactly what the
   * miss it already was cost.
   */
  it('goes on answering correctly past the point where it starts forgetting', () => {
    for (let digits = 0; digits <= CACHE_LIMIT * 2; digits += 1) {
      const formatter = numberFormatter('en-GB', {
        minimumIntegerDigits: (digits % 21) + 1,
        useGrouping: digits % 2 === 0
      });

      expect(formatter.format(7)).toContain('7');
    }

    expect(numberFormatter('en-GB').format(1234.5)).toBe('1,234.5');
  });
});

describe('the date-time formatter cache', () => {
  it('hands the same formatter back for the same question', () => {
    const shape: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    expect(dateTimeFormatter('en-GB', { ...shape })).toBe(dateTimeFormatter('en-GB', { ...shape }));
  });

  it('does not share its cache with the number formatter', () => {
    // Same key, different constructor. One evicting the other would be a
    // `format` that took a `Date` and answered with a number's spelling.
    expect(dateTimeFormatter('en-GB').format(JULY)).toContain('2026');
    expect(numberFormatter('en-GB').format(2026)).toBe('2,026');
  });
});

describe('the segmenter cache', () => {
  it('hands the same segmenter back for the same granularity', () => {
    expect(segmenter('en-GB', { granularity: 'grapheme' })).toBe(
      segmenter('en-GB', { granularity: 'grapheme' })
    );
  });

  it('keeps the two granularities apart', () => {
    expect(segmenter('en-GB', { granularity: 'word' })).not.toBe(
      segmenter('en-GB', { granularity: 'grapheme' })
    );
  });

  /*
   * A family emoji is seven code points joined by zero-width joiners and one
   * grapheme. It is here because it is the answer `[...text]` gets wrong, which
   * is the fallback the module takes when there is no `Intl.Segmenter` — so this
   * also asserts that the cache is handing back a real one.
   */
  it('still segments by grapheme cluster', () => {
    const one = segmenter(undefined, { granularity: 'grapheme' });

    expect(one).not.toBeNull();
    expect([...one!.segment('👩‍👩‍👧')]).toHaveLength(1);
  });
});
