import * as React from 'react';
import type { MPDensity, MPSize } from '../types';

/**
 * The geometry two tables have to agree on.
 *
 * `MPTable` draws a grid of data and `MPDataTable` draws one you can sort,
 * search, page and choose from. They are separate components on purpose — the
 * second is not the first with props bolted on, and the first should not carry
 * a CSV writer — but a data table sitting one pixel off the plain table beside
 * it is the drift a shared file exists to prevent. So the cells' room, the type
 * they are set in and the slot a row's background is read from live here, once.
 *
 * There are no rules in this file, only the numbers and names both components
 * write. `internal/data-table.ts` is where the arithmetic went, and nothing here
 * imports it: a plain `MPTable` must not pay for a sort it does not do.
 */

/**
 * The cell padding, as raw lengths rather than classes — and this is the one
 * place in the library that has to do that.
 *
 * A button owns its `<button>`; nobody else styles it. A `<td>` is different:
 * VitePress's `.vp-doc td`, Tailwind Typography's `.prose td` and every CSS
 * framework in existence style table cells by tag name, at two-class specificity
 * that a one-class Tailwind utility cannot outrank. Padding, alignment and
 * borders all silently lost to the host before this was inline.
 *
 * The numbers are `SHEET_PAD_X`'s, in CSS pixels — the Tailwind spacing scale is
 * 0.25rem a step, so `px-4` and 16 are the same measurement written twice. Keep
 * them in step.
 *
 * Pixels rather than rem strings, because these are the one padding track in the
 * library that is arithmetic rather than a lookup: an inline length can be
 * *computed*, so the density steps below are a subtraction instead of the
 * three-column table every class-based track needs.
 */
const CELL_PAD_X: Record<MPSize, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24
};

/**
 * Row height, as vertical padding.
 *
 * MD3's data table row is 52dp: `body-medium` is a 20px line box, and 20 plus
 * `1rem` either side is 52 exactly. The rungs above and below walk out from
 * there.
 */
const CELL_PAD_Y: Record<MPSize, number> = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24
};

/** A pixel count as the unit the cells are written in. */
function rem(px: number): string {
  return `${px / 16}rem`;
}

/**
 * The cell padding at a density step: two pixels off each face, which is MD3's
 * four off the row.
 *
 * The two axes bottom out in different places because they are answering
 * different questions. Sideways it is the room between one column and the next,
 * and 6px is where two numbers start touching. Vertically it is the row height,
 * and 4px is what keeps the shortest row — `body-small`'s 16px line box at `xs`
 * — on the 24px floor `MPDensity` names.
 */
export function cellPadX(size: MPSize, density: MPDensity): string {
  return rem(Math.max(6, CELL_PAD_X[size] + density * 2));
}

export function cellPadY(size: MPSize, density: MPDensity): string {
  return rem(Math.max(4, CELL_PAD_Y[size] + density * 2));
}

/**
 * What a cell is set in. MD3's data table puts its cells in `body-medium` and
 * its column headings in `title-small` — 14px at weight 500, which is the same
 * size one weight up, so a heading reads as a heading without changing the
 * column's measure.
 */
export const CELL_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-medium',
  lg: 'text-mp-body-medium',
  xl: 'text-mp-body-large'
};

export const HEAD_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-medium',
  md: 'text-mp-title-small',
  lg: 'text-mp-title-small',
  xl: 'text-mp-title-medium'
};

/**
 * A row's own background, read from a slot rather than written inline.
 *
 * Everything else about a cell is inline because a host stylesheet outranks a
 * utility — but a row has a *hover* state, and an inline style has no `:hover`.
 * A custom property is the way out: the host cannot see it, so a one-class
 * variant sets it without a fight, and the inline `background-color` on the row
 * just reads whatever it currently holds.
 */
export const ROW = [
  '[--_mp-row:transparent]',
  'transition-[background-color] duration-(--mp-sys-motion-duration-short4)'
].join(' ');

/**
 * A cell's raw value, if React can draw it, and nothing if it cannot.
 *
 * Without `render`, a cell is `row[column.key]` — and `Row` is the caller's own
 * type, so that value is genuinely anything. A `Date`, a nested object, a `Map`:
 * handed to React each of them throws *Objects are not valid as a React child*,
 * from inside a `.map()` in a `<tbody>`, which takes down the table and every
 * boundary above it. One unexpected column in an API response was a blank page.
 *
 * A blank cell is the honest answer to "this is not text". The column already
 * has `render` for the case where it is something else, and the prop docs
 * already say so — what was missing is that failing to reach for it cost the
 * whole page rather than one cell.
 *
 * The list is what React itself will draw: strings, numbers, bigints, and the
 * three nothings. `null`, `undefined` and `boolean` are already nothing to
 * React, and are passed through rather than filtered so that the `false` a
 * `condition && value` leaves behind stays as harmless here as it is anywhere
 * else in this library.
 */
export function drawableCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  const kind = typeof value;

  if (kind === 'string' || kind === 'number' || kind === 'bigint' || kind === 'boolean') {
    return value as React.ReactNode;
  }

  return React.isValidElement(value) ? value : null;
}
