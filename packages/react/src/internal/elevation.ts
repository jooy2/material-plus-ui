/**
 * The elevation ladder, and a file of its own for the reason `density.ts` has
 * one: the split stylesheet is cut along the import graph a **file** at a time,
 * so a table of class strings living beside the ones every component reads is a
 * table every component's sheet carries. Levels 4 and 5 are drawn by nothing in
 * this library on its own, and left in `surface.ts` they were half a kilobyte on
 * the median component sheet — paid by the components that cannot be raised at
 * all.
 *
 * `MPElevation` is where the axis itself is explained: why a level moves the
 * tone as well as the shadow, and why that is the only shape an `elevation` prop
 * can take in a system that pairs the two.
 *
 * The bar half of the same question lives in `page-layout.ts`, next to the table
 * it falls back to, and reads this one. The dependency runs that way and not the
 * other for the reason this file exists at all: a bar's module carries the
 * window size class variants, and an `MPBox` reaching for a level should not end
 * up with a stylesheet full of breakpoints it never asked about.
 */
import { CONTAINER_SURFACE } from './surface';
import type { MPElevation, MPVariant } from '../types';

/**
 * The five weights of `CONTAINER_SURFACE` said as a height instead, one row per
 * MD3 level.
 *
 * A tone **and** a shadow per row, which is what makes an `elevation` prop
 * possible at all. The `elevated` row of the variant table is this table's level
 * 1, written twice because the two props are two different questions and neither
 * should have to resolve the other to answer its own.
 *
 * Levels 4 and 5 share `surface-container-high` and `surface-container-highest`
 * with the levels under them because the specification runs out of container
 * roles before it runs out of levels. Inventing a sixth tone to keep the columns
 * tidy would be inventing a colour role.
 */
export const ELEVATION_SURFACE: Record<MPElevation, string> = {
  0: 'bg-mp-surface shadow-none',
  1: 'shadow-mp-1 bg-mp-surface-container-low',
  2: 'shadow-mp-2 bg-mp-surface-container',
  3: 'shadow-mp-3 bg-mp-surface-container-high',
  4: 'shadow-mp-4 bg-mp-surface-container-high',
  5: 'shadow-mp-5 bg-mp-surface-container-highest'
};

/**
 * What a container paints, from whichever of the two props answered.
 *
 * A level wins where one was given, and takes the tone with it — so `variant` is
 * left holding only what a level does not describe, which is the hairline. Two
 * props writing one `background-color` would otherwise be settled by the order
 * two class names happened to reach the generated stylesheet, which is not a
 * decision anybody made.
 */
export function containerSurface(variant: MPVariant, elevation: MPElevation | undefined): string {
  if (elevation === undefined) {
    return CONTAINER_SURFACE[variant];
  }

  return variant === 'outlined'
    ? `border-mp-outline-variant border ${ELEVATION_SURFACE[elevation]}`
    : ELEVATION_SURFACE[elevation];
}
