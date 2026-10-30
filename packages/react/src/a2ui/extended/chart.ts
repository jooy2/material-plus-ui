/**
 * What the three charts share, and why any of it needs checking.
 *
 * **A bound list is not a validated list.** The SDK's binder checks a payload
 * against the schema, and a `series` the agent wrote out literally is therefore
 * known to be series-shaped. A `series` bound to a path is not: the schema
 * approved the *binding*, and what comes back is whatever the data model holds at
 * that moment — half-written by an earlier message, replaced by a later one, or
 * simply not what the agent intended. A chart handed `{ data: 'later' }` where it
 * expected numbers renders nothing and throws inside the scale.
 *
 * So the resolved value is read rather than trusted: a list becomes a list, a
 * number stays a number, and anything else becomes a gap. What that buys is a
 * chart that draws what arrived and keeps drawing as the rest of it does.
 */
import type { MPChartDatum, MPChartSeries } from '../../types';
import { asText } from '../internal/common';

/** One value, or a gap where the data has something else to say. */
const toDatum = (value: unknown): MPChartDatum =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** A list of values, from whatever the binding resolved to. */
export const toData = (value: unknown): MPChartDatum[] =>
  Array.isArray(value) ? value.map(toDatum) : [];

/** The series, from whatever the binding resolved to. */
export const toSeries = (value: unknown): MPChartSeries[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((one) => {
    const series = (one ?? {}) as Record<string, unknown>;

    return {
      name: asText(series.name),
      data: toData(series.data),
      color: asText(series.color) as MPChartSeries['color']
    };
  });
};

/** The category labels, which are strings or nothing. */
export const toCategories = (value: unknown): string[] | undefined =>
  Array.isArray(value) ? value.map((one) => asText(one) ?? '') : undefined;

/** An axis, only when there is something to name it. */
export const toAxis = (label?: string) => (label ? { label } : undefined);
