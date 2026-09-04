/**
 * The density steps, and a file of their own so that only the components taking
 * them pay for them.
 *
 * The tables here are literal class strings for the reason every table in
 * `scale.ts` is, and that is exactly why they cannot live beside them: the
 * stylesheet is cut along the import graph a **file** at a time, so a component
 * that reads one row of `scale.ts` gets a sheet carrying every class the whole
 * module spells out. Left in there, the density rungs were 0.2 kB on the
 * compressed sheet of every button in the library — a cost paid by the
 * components that have no density at all.
 *
 * `MPDensity` is where the axis itself is explained. What is here is the
 * arithmetic: four pixels a step off a control, two a face off a sheet, and the
 * two floors that stop each of them.
 */
import { CONTROL_HEIGHT, SHEET_PAD, SHEET_PAD_X, SHEET_PAD_Y } from './scale';
import type { MPDensity, MPSize } from '../types';

/**
 * The same ladder with the density steps taken out of it.
 *
 * Three columns rather than four: `0` is `CONTROL_HEIGHT` itself, and repeating
 * it here would be the same number written twice. `controlHeight` reads either.
 *
 * Each step is MD3's own 4dp, and the row stops where 24px does. `xs` runs out
 * first because it starts closest to the floor: 32 → 28 → 24, and the third step
 * has nowhere left to go. That is the clamp `MPDensity` describes, made of the
 * one thing a class table can be made of — a repeated value.
 */
const CONTROL_HEIGHT_DENSE: Record<MPSize, readonly [string, string, string]> = {
  xs: ['h-7', 'h-6', 'h-6'],
  sm: ['h-9', 'h-8', 'h-7'],
  md: ['h-13', 'h-12', 'h-11'],
  lg: ['h-15', 'h-14', 'h-13'],
  xl: ['h-17', 'h-16', 'h-15']
};

/** The control height at a rung, tightened by a density step. */
export function controlHeight(size: MPSize, density: MPDensity = 0): string {
  return density === 0 ? CONTROL_HEIGHT[size] : CONTROL_HEIGHT_DENSE[size][-density - 1];
}

/**
 * The three padding tracks with the density steps taken out of them.
 *
 * **2px a step, not 4.** Padding sits on both sides of what it surrounds, so
 * taking two off each face is what takes MD3's four off the height — the step is
 * the specification's, said in the units the property is written in. Taking four
 * off each face would take eight out of a row, and `md` would fall from 16 to 4
 * in three steps, which is not a denser sheet but a different one.
 *
 * The floor is 6px rather than 24: this is the room around content, not a
 * control's height, and a target's size is decided by the row it is in. `xs`
 * still runs out first, for the same reason it does above.
 *
 * Three tracks because Tailwind reads source text — `p-4` cannot become `py-4`
 * at runtime — and the reason a sheet needs the axes separately is written above
 * `SHEET_PAD_Y` in `scale.ts`.
 */
const SHEET_PAD_DENSE: Record<MPSize, readonly [string, string, string]> = {
  xs: ['p-2', 'p-1.5', 'p-1.5'],
  sm: ['p-2.5', 'p-2', 'p-1.5'],
  md: ['p-3.5', 'p-3', 'p-2.5'],
  lg: ['p-4.5', 'p-4', 'p-3.5'],
  xl: ['p-5.5', 'p-5', 'p-4.5']
};

const SHEET_PAD_X_DENSE: Record<MPSize, readonly [string, string, string]> = {
  xs: ['px-2', 'px-1.5', 'px-1.5'],
  sm: ['px-2.5', 'px-2', 'px-1.5'],
  md: ['px-3.5', 'px-3', 'px-2.5'],
  lg: ['px-4.5', 'px-4', 'px-3.5'],
  xl: ['px-5.5', 'px-5', 'px-4.5']
};

const SHEET_PAD_Y_DENSE: Record<MPSize, readonly [string, string, string]> = {
  xs: ['py-2', 'py-1.5', 'py-1.5'],
  sm: ['py-2.5', 'py-2', 'py-1.5'],
  md: ['py-3.5', 'py-3', 'py-2.5'],
  lg: ['py-4.5', 'py-4', 'py-3.5'],
  xl: ['py-5.5', 'py-5', 'py-4.5']
};

/** The room inside a sheet at a rung, tightened by a density step. */
export function sheetPad(size: MPSize, density: MPDensity = 0): string {
  return density === 0 ? SHEET_PAD[size] : SHEET_PAD_DENSE[size][-density - 1];
}

/** The same, sideways only. */
export function sheetPadX(size: MPSize, density: MPDensity = 0): string {
  return density === 0 ? SHEET_PAD_X[size] : SHEET_PAD_X_DENSE[size][-density - 1];
}

/** And the other axis. */
export function sheetPadY(size: MPSize, density: MPDensity = 0): string {
  return density === 0 ? SHEET_PAD_Y[size] : SHEET_PAD_Y_DENSE[size][-density - 1];
}
