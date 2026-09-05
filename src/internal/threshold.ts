import type { MPColor, MPThreshold } from '../types';

/**
 * Where a reading changes colour, resolved once.
 *
 * A meter and a gauge are the same quantity in two shapes, and a page carrying
 * both must not disagree about where the amber starts. That is the whole reason
 * this is not a private function inside whichever component needed it first —
 * two copies of a scan this short would agree until the day one of them was
 * edited alone.
 *
 * It is a file of its own rather than a section of `internal/chart.ts` because
 * `MPMeter` is not a chart: reaching into that module for six lines would hand
 * a bar the scales, the path builders and the palette.
 *
 * Written as a scan rather than a sort, so the array is read in the order it
 * was given. Thresholds are meant to be listed in ascending order, and quietly
 * reordering them would hide the one call site that did not.
 */
export function thresholdColor(
  value: number,
  color: MPColor,
  thresholds: readonly MPThreshold[] | undefined
): MPColor {
  if (!thresholds || thresholds.length === 0) {
    return color;
  }

  let current = color;

  for (const threshold of thresholds) {
    if (value >= threshold.from) {
      current = threshold.color;
    }
  }

  return current;
}
