import { describe, expect, it } from 'vitest';
import { formatTimeTick, timeScale } from '../../src/internal/time-scale';

const at = (iso: string) => new Date(iso).getTime();

/** Every tick of a scale, as local ISO-ish strings, which is what the eye reads. */
const ticks = (scale: ReturnType<typeof timeScale>) =>
  scale.ticks.map((tick) => {
    const d = new Date(tick);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
      2,
      '0'
    )}`;
  });

describe('timeScale', () => {
  it('steps in days over a fortnight rather than in round numbers', () => {
    // The 1-2-5-10 family is right for a count and wrong for an instant: on
    // epoch milliseconds it puts a tick every 200,000,000 ms, which lands at
    // 14:53:20 on an arbitrary Tuesday.
    const scale = timeScale({ min: at('2026-03-02T00:00:00'), max: at('2026-03-16T00:00:00') });

    expect(scale.unit).toBe('day');
    expect(ticks(scale).every((tick) => tick.endsWith('00:00'))).toBe(true);
  });

  it('steps in hours over a day', () => {
    const scale = timeScale({ min: at('2026-03-02T00:00:00'), max: at('2026-03-03T00:00:00') });

    expect(scale.unit).toBe('hour');
  });

  it('steps in months over a year', () => {
    const scale = timeScale({ min: at('2026-01-01T00:00:00'), max: at('2026-12-31T00:00:00') });

    expect(scale.unit).toBe('month');
    // Every tick is the first of a month, whatever the month's length.
    expect(ticks(scale).every((tick) => tick.slice(8, 10) === '01')).toBe(true);
  });

  it('aligns a multi-hour step to the clock', () => {
    // A three-hour axis reads 00:00, 03:00, 06:00 and not 01:00, 04:00, 07:00.
    // Evenly spaced ticks that land on nothing a reader recognises give up most
    // of the value of using a calendar step at all.
    const scale = timeScale({ min: at('2026-03-02T01:20:00'), max: at('2026-03-03T04:00:00') });
    const hours = scale.ticks.map((tick) => new Date(tick).getHours());

    expect(hours.every((hour) => hour % scale.count === 0)).toBe(true);
  });

  it('rounds the start outward so work beginning mid-afternoon starts at a landmark', () => {
    const scale = timeScale({ min: at('2026-03-02T14:37:00'), max: at('2026-03-16T09:00:00') });

    expect(scale.min).toBeLessThanOrEqual(at('2026-03-02T14:37:00'));
    expect(new Date(scale.min).getHours()).toBe(0);
  });

  it('covers the whole range', () => {
    const scale = timeScale({ min: at('2026-03-02T14:37:00'), max: at('2026-03-16T09:00:00') });

    expect(scale.min).toBeLessThanOrEqual(at('2026-03-02T14:37:00'));
    expect(scale.max).toBeGreaterThanOrEqual(at('2026-03-16T09:00:00'));
  });

  it('opens a band around a single instant rather than dividing by nothing', () => {
    const one = at('2026-03-02T12:00:00');
    const scale = timeScale({ min: one, max: one });

    expect(scale.max).toBeGreaterThan(scale.min);
    expect(scale.ticks.length).toBeGreaterThan(1);
  });

  it('walks a month step by the calendar rather than by thirty days', () => {
    // February is not thirty days, so an arithmetic step drifts off the first
    // of the month within a year and never comes back.
    const scale = timeScale({ min: at('2026-01-01T00:00:00'), max: at('2027-01-01T00:00:00') });

    expect(scale.ticks.every((tick) => new Date(tick).getDate() === 1)).toBe(true);
  });

  it('keeps a fraction of zero at the start and one at the end', () => {
    const scale = timeScale({ min: at('2026-03-02T00:00:00'), max: at('2026-03-16T00:00:00') });

    expect(scale.fraction(scale.min)).toBeCloseTo(0, 6);
    expect(scale.fraction(scale.max)).toBeCloseTo(1, 6);
  });

  it('takes both ends from the caller when they pinned them', () => {
    const min = at('2026-03-02T06:00:00');
    const max = at('2026-03-04T18:00:00');
    const scale = timeScale(null, { min, max });

    expect(scale.min).toBe(min);
    expect(scale.max).toBe(max);
  });

  it('scales the year count past the end of the table', () => {
    // The written steps stop at one year, so a century has to fall back to the
    // 1-2-5-10 family — which is the right family again, years being counted
    // rather than clocked.
    const scale = timeScale({ min: at('1926-01-01T00:00:00'), max: at('2026-01-01T00:00:00') });

    expect(scale.unit).toBe('year');
    expect([1, 2, 5, 10, 20, 50].includes(scale.count)).toBe(true);
    expect(scale.ticks.length).toBeLessThan(20);
  });
});

describe('formatTimeTick', () => {
  it('writes a tick at the resolution its step implies', () => {
    // An axis of identical strings differing in one field is the least readable
    // form of a date there is.
    expect(formatTimeTick(at('2026-03-02T14:00:00'), 'hour', 'en-US')).toMatch(/2/);
    expect(formatTimeTick(at('2026-03-02T00:00:00'), 'day', 'en-US')).toBe('Mar 2');
    expect(formatTimeTick(at('2026-03-01T00:00:00'), 'month', 'en-US')).toBe('Mar 2026');
    expect(formatTimeTick(at('2026-01-01T00:00:00'), 'year', 'en-US')).toBe('2026');
  });
});
