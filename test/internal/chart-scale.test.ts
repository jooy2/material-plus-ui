import { describe, expect, it } from 'vitest';
import {
  bandScale,
  categoryAt,
  fitsLast,
  formatCategory,
  seriesExtent,
  showsTick,
  textWidth,
  tickStride,
  toValue,
  toValues,
  truncate,
  valueScale
} from '../../src/internal/chart';

describe('valueScale', () => {
  it('rounds the top outward so the tallest mark stops short of the ceiling', () => {
    // A scale whose last mark touches the frame reads as clipped even when it
    // is exactly right, and 4,830 is not a number anybody labels an axis with.
    const scale = valueScale({ min: 0, max: 4830 });

    expect(scale.max).toBe(5000);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(5000);
  });

  it('only ever ticks at 1, 2, 5 or 10 times a power of ten', () => {
    // An axis exists to be measured against, and measuring means adding the
    // step up in your head. A gridline every 3,000 is one nobody counts from.
    for (const max of [7, 23, 47, 380, 4830, 91_000]) {
      const ticks = valueScale({ min: 0, max }).ticks;
      const step = ticks[1] - ticks[0];
      const unit = step / 10 ** Math.floor(Math.log10(step));

      expect([1, 2, 5, 10]).toContain(Math.round(unit));
    }
  });

  it('keeps zero in range by default', () => {
    // Bar length is proportional to value only from a zero baseline, so the
    // frame's default has to be the one that cannot lie about proportion.
    expect(valueScale({ min: 3200, max: 3400 }).min).toBe(0);
  });

  it('leaves zero out when asked, so a flat-looking series keeps its shape', () => {
    const scale = valueScale({ min: 3200, max: 3400 }, { includeZero: false });

    expect(scale.min).toBeGreaterThan(3000);
    expect(scale.max).toBeLessThan(3600);
  });

  it('writes the top tick down when both ends are pinned', () => {
    // With `min` and `max` fixed the ends cannot move, so the *step* is what
    // has to give. A step that does not divide 0.5 leaves 100 — the one number
    // the reader came for — off the axis entirely.
    const scale = valueScale(null, { min: 99.5, max: 100 });

    expect(scale.ticks[0]).toBe(99.5);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(100);
  });

  it('opens a band around a flat series rather than dividing by nothing', () => {
    const scale = valueScale({ min: 5, max: 5 }, { includeZero: false });

    expect(scale.min).toBeLessThan(5);
    expect(scale.max).toBeGreaterThan(5);
    expect(scale.fraction(5)).toBeCloseTo(0.5, 5);
  });

  it('prints a tick as a number rather than as its floating-point residue', () => {
    // `0.1 * 3` is 0.30000000000000004, and a tick labelled that is worse than
    // a missing one.
    const ticks = valueScale({ min: 0, max: 0.5 }).ticks;

    expect(ticks.every((tick) => String(tick).length <= 4)).toBe(true);
  });

  it('does not drop the last tick to a floating-point comparison', () => {
    expect(valueScale({ min: 0, max: 0.5 }).ticks).toContain(0.5);
  });
});

describe('seriesExtent', () => {
  it('measures the tallest column when the marks are stacked', () => {
    // The tallest column is not made of the largest values: two series of 6 and
    // 7 stack to 13, and an axis that stopped at 7 would clip every bar.
    expect(seriesExtent([[{ value: 6 }], [{ value: 7 }]], true)).toEqual({ min: 0, max: 13 });
  });

  it('accumulates the two signs apart, because a column has two ends', () => {
    // +8 and −3 at one category is eleven units of bar reaching from −3 to 8,
    // not five units reaching from 0 to 5.
    expect(seriesExtent([[{ value: 8 }], [{ value: -3 }]], true)).toEqual({ min: -3, max: 8 });
  });

  it('answers null for a chart with nothing measured in it', () => {
    // Different from `{ min: 0, max: 0 }`, which is a chart of zeroes — one is
    // an empty state and the other is data.
    expect(seriesExtent([[{ value: null }, { value: null }]], false)).toBeNull();
  });
});

describe('toValue', () => {
  it('collapses every way of being absent to one', () => {
    // A `NaN` that survives this far reaches the scale and leaves the letters
    // in the `d` attribute, where it silently draws nothing at all.
    expect(toValue(null).value).toBeNull();
    expect(toValue(Number.NaN).value).toBeNull();
    expect(toValue(Number.POSITIVE_INFINITY).value).toBeNull();
    expect(toValue({ y: null }).value).toBeNull();
  });

  it('keeps what a point said about itself', () => {
    const value = toValue({ y: 4, x: 'Mar', label: 'four' });

    expect(value.value).toBe(4);
    expect(value.x).toBe('Mar');
    expect(value.label).toBe('four');
  });

  it('resolves a point colour that names an accent role', () => {
    expect(toValue({ y: 1, color: 'tertiary' }).color).toBe('var(--_mp-color-tertiary)');
  });

  it('passes a CSS colour through untouched', () => {
    expect(toValue({ y: 1, color: '#ff0000' }).color).toBe('#ff0000');
  });
});

describe('categoryAt', () => {
  const values = toValues([{ data: [{ y: 1, x: 'Mar' }] }]);

  it('prefers the chart-wide categories', () => {
    expect(categoryAt(0, ['Jan'], values)).toBe('Jan');
  });

  it('falls back to whatever the point said its x was', () => {
    expect(categoryAt(0, undefined, values)).toBe('Mar');
  });

  it('numbers the axis rather than leaving it blank', () => {
    // A numbered axis is a great deal better than an unlabelled one.
    expect(categoryAt(3, undefined, values)).toBe(3);
  });
});

describe('bandScale', () => {
  it('centres a mark in its slot', () => {
    const band = bandScale(4, 400, 1);

    expect(band.step).toBe(100);
    expect(band.centre(0)).toBe(50);
    expect(band.centre(3)).toBe(350);
  });

  it('reserves only part of the slot when the ratio says so', () => {
    expect(bandScale(4, 400, 0.6).band).toBeCloseTo(60, 5);
  });
});

describe('textWidth', () => {
  it('counts a CJK character as about twice a Latin one', () => {
    // A Korean axis reserving 60% of the room it needs is an axis that overlaps
    // itself, so the wider script decides.
    expect(textWidth('가나', 12)).toBeGreaterThan(textWidth('ab', 12));
  });
});

describe('truncate', () => {
  it('leaves a label that already fits alone', () => {
    expect(truncate('Mar', 200, 12)).toBe('Mar');
  });

  it('cuts rather than dropping, so five long names stay five labels', () => {
    const cut = truncate('Onboarding flow', 40, 12);

    expect(cut.endsWith('…')).toBe(true);
    expect(cut.length).toBeLessThan('Onboarding flow'.length);
  });

  it('comes back as an ellipsis rather than empty when nothing fits', () => {
    expect(truncate('Onboarding', 4, 12)).toBe('…');
  });
});

describe('tickStride', () => {
  it('is one when every label has room', () => {
    expect(tickStride(5, 500, 40)).toBe(1);
  });

  it('thins the labels rather than rotating them', () => {
    // A rotated axis is unreadable at a glance, and it takes a band of the plot
    // to be unreadable in.
    expect(tickStride(30, 300, 40)).toBeGreaterThan(1);
  });
});

describe('showsTick', () => {
  it('always keeps the first', () => {
    // A reader who cannot see where the axis starts cannot read any of it.
    expect(showsTick(0, 14, 3, false)).toBe(true);
  });

  it('keeps the last when there is room for it', () => {
    // A fourteen-day axis at a stride of two otherwise ends at day thirteen,
    // and the end of a scale is the number a reader looks for first.
    expect(showsTick(13, 14, 2, true)).toBe(true);
    expect(showsTick(13, 14, 2, false)).toBe(false);
  });
});

describe('fitsLast', () => {
  it('refuses the last label when it would overlap the one before it', () => {
    // Forcing it turns a missing "Jun" into an overlapping "MayJun", which is
    // worse than what it fixed.
    expect(fitsLast(14, 3, 10, 40)).toBe(false);
  });

  it('allows it once the gap is wider than the label', () => {
    expect(fitsLast(14, 3, 40, 20)).toBe(true);
  });

  it('refuses when the stride already kept it', () => {
    // Drawn twice in the same place is not a second label.
    expect(fitsLast(13, 3, 100, 10)).toBe(false);
  });
});

describe('formatCategory', () => {
  it('writes a date short enough to sit beside its neighbours', () => {
    expect(formatCategory(new Date(2026, 2, 4), 'en-US')).toBe('Mar 4');
  });

  it('leaves a string alone', () => {
    expect(formatCategory('Onboarding', 'en-US')).toBe('Onboarding');
  });
});
