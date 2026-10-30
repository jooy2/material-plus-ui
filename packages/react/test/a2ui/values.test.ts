import { describe, expect, it } from 'vitest';
import { asText, formatIsoValue, parseIsoValue } from '../../src/a2ui/internal/common';

/**
 * The conversions between the protocol's values and this library's.
 *
 * Worth a test of their own because both directions have a failure that is
 * invisible in a rendering test: a date read as UTC draws the day before west of
 * Greenwich, and a date written as UTC moves every time the agent reads it back.
 * Neither shows up in a suite whose browser happens to run at UTC, which is why
 * these assert on local parts rather than on formatted output.
 */
describe('parseIsoValue', () => {
  it('reads a date as a local day rather than as UTC midnight', () => {
    const parsed = parseIsoValue('2026-03-01');

    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(1);
    expect(parsed?.getHours()).toBe(0);
  });

  it('reads a date and time as the wall clock it is written as', () => {
    const parsed = parseIsoValue('2026-03-01T14:30');

    expect(parsed?.getDate()).toBe(1);
    expect(parsed?.getHours()).toBe(14);
    expect(parsed?.getMinutes()).toBe(30);
  });

  it('reads a time on its own against today', () => {
    const today = new Date();
    const parsed = parseIsoValue('09:05');

    expect(parsed?.getDate()).toBe(today.getDate());
    expect(parsed?.getHours()).toBe(9);
    expect(parsed?.getMinutes()).toBe(5);
  });

  it('reads a time that was formatted out of a full timestamp', () => {
    const parsed = parseIsoValue('09:05:30.500');

    expect(parsed?.getHours()).toBe(9);
    expect(parsed?.getMinutes()).toBe(5);
  });

  it('converts a value that carries its own offset', () => {
    // 12:00 UTC is one instant whatever the reader's clock says, so this is the
    // one shape that must not be read as local parts.
    const parsed = parseIsoValue('2026-03-01T12:00:00Z');

    expect(parsed?.getTime()).toBe(Date.UTC(2026, 2, 1, 12, 0, 0));
  });

  it('answers null for nothing, and for something that is not a date', () => {
    expect(parseIsoValue(undefined)).toBeNull();
    expect(parseIsoValue('')).toBeNull();
    expect(parseIsoValue('next tuesday')).toBeNull();
  });
});

describe('formatIsoValue', () => {
  const march = new Date(2026, 2, 1, 14, 30, 45);

  it('writes a date at the precision that was asked for', () => {
    expect(formatIsoValue(march, { withDate: true, withTime: false })).toBe('2026-03-01');
  });

  it('writes a time on its own', () => {
    expect(formatIsoValue(march, { withDate: false, withTime: true })).toBe('14:30');
  });

  it('writes both without a time zone, as a local wall clock', () => {
    expect(formatIsoValue(march, { withDate: true, withTime: true })).toBe('2026-03-01T14:30');
  });

  it('writes an empty string for nothing chosen', () => {
    // Which is what the schema asks for: "if not yet set, initialize with an
    // empty string".
    expect(formatIsoValue(null, { withDate: true, withTime: false })).toBe('');
    expect(formatIsoValue(new Date('nonsense'), { withDate: true, withTime: false })).toBe('');
  });

  it('survives a round trip through the parser', () => {
    const written = formatIsoValue(march, { withDate: true, withTime: true });
    const read = parseIsoValue(written);

    expect(read?.getFullYear()).toBe(2026);
    expect(read?.getHours()).toBe(14);
    expect(read?.getMinutes()).toBe(30);
  });
});

describe('asText', () => {
  it('keeps a string and drops anything else', () => {
    // The binder resolves a nested binding before a component sees it. If one
    // ever arrives unresolved, the label is missing rather than `[object Object]`.
    expect(asText('Sign in')).toBe('Sign in');
    expect(asText({ path: '/label' })).toBeUndefined();
    expect(asText(undefined)).toBeUndefined();
  });
});
