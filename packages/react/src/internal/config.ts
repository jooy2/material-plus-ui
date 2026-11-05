/**
 * The prop defaults an application can move for the whole page.
 *
 * `size`, `color` and `density` are axes where every component that has them
 * starts from the *same* answer — `md`, `primary` and `0` — which is what makes a
 * single app-wide default meaningful for them. `floatingLabel` is the same kind:
 * every field starts at `true`. `weekStartsOn` starts from the locale on every
 * calendar, and a provider's value replaces that question rather than one
 * component's answer.
 * A `variant` default is per component by design (`MPAccordion` is `outlined`,
 * `MPAlert` is `tonal`, `MPBadge` is `filled`), so one global value would be
 * overwriting six considered decisions with one arbitrary one.
 *
 * The same rule decides which components read this at all: a component that was
 * taking the library's default takes the configured one instead, and a component
 * that had chosen its own keeps it. `MPBadge` stays `error`, `MPTooltip` stays
 * `sm`, `MPDialog`, `MPPill` and `MPShortcut` stay `secondary` — those are not
 * unfilled defaults, they are answers.
 *
 * ## Why this needs context at all
 *
 * Which is the question `MPLocaleProvider` answers for itself, and the answer
 * here is the same shape. Everything a theme normally carries — the colour
 * roles, the type scale, the corners, the motion — is a CSS custom property and
 * reaches a component through the cascade. `size` cannot: it resolves to literal
 * Tailwind class strings (`h-14`, `text-mp-body-large`), because Tailwind finds
 * classes by scanning source text and an interpolated `h-${n}` generates no rule
 * at all. See `internal/scale.ts`. A value that cannot be a custom property and
 * has to reach every call site is exactly what context is for.
 */
import * as React from 'react';
import type { MPPartialMessages } from './i18n';
import type { MPColor, MPDensity, MPSize, MPWeekday, MPWindowClass } from '../types';

/** What an `MPConfigProvider` can set. Anything unset is inherited, then default. */
export interface MPConfigValue {
  size?: MPSize;
  color?: MPColor;
  density?: MPDensity;
  /**
   * Where the window size classes begin, for the JavaScript half of the library.
   *
   * Partial and merged over MD3's own, in CSS pixels. See `MPConfigProvider` for
   * what this does and does not reach — the stylesheet is not downstream of it,
   * and cannot be.
   */
  breakpoints?: Partial<Record<MPWindowClass, number>>;
  /** Whether a field keeps a line under itself for a message it has not got yet. */
  reserveSupportingText?: boolean;
  /** Whether a field's label rests on its line until there is something in it. */
  floatingLabel?: boolean;
  /** Which day the calendars' weeks start on, when the locale should not decide. */
  weekStartsOn?: MPWeekday;
  /**
   * The words the library says, by namespace, over whatever the locale's table
   * says. Merged a word at a time with the providers above, so a nested provider
   * that renames one button keeps every other word the application chose.
   */
  labels?: MPPartialMessages;
}

/**
 * Frozen and module-level so that the no-provider case is one stable object
 * rather than a new one per render — a fresh `{}` as the default value would
 * make every `useMPConfig` consumer a new reference on every render of anything
 * above it.
 */
const EMPTY: MPConfigValue = Object.freeze({});

export const MPConfigContext = React.createContext<MPConfigValue>(EMPTY);

/** The configuration in force at this point in the tree. */
export function useMPConfig(): MPConfigValue {
  return React.useContext(MPConfigContext);
}

/**
 * `prop ?? config ?? the library's own`, which is the order of specificity: what
 * this call site said, then what the application said, then what Material says.
 */
export function useMPSize(size: MPSize | undefined): MPSize {
  // Read first and decide second, which is not a style choice. Written as
  // `size ?? React.useContext(…)` the context is only read when the prop is
  // absent, so a control given a `size` on one render and not on the next calls
  // a different number of hooks — React says so out loud, and the render after
  // it reads the wrong slot.
  const config = React.useContext(MPConfigContext);

  return size ?? config.size ?? 'md';
}

export function useMPColor(color: MPColor | undefined): MPColor {
  const config = React.useContext(MPConfigContext);

  return color ?? config.color ?? 'primary';
}

/**
 * The third axis with an app-wide default, and the one most likely to be set
 * once and never again: a product decides how dense it is at the top, not per
 * table.
 *
 * Only the components that hold things read it, so a page set to `-2` tightens
 * its lists and leaves its buttons at the height they have to be.
 */
export function useMPDensity(density: MPDensity | undefined): MPDensity {
  const config = React.useContext(MPConfigContext);

  return density ?? config.density ?? 0;
}

/**
 * Whether a field's label floats, which is a decision about the product's forms
 * rather than about any one field: a product whose labels always sit in the
 * notch wants all of them there.
 */
export function useMPFloatingLabel(floatingLabel: boolean | undefined): boolean {
  const config = React.useContext(MPConfigContext);

  return floatingLabel ?? config.floatingLabel ?? true;
}

/**
 * The day a calendar's week starts on, or `undefined` for "ask the locale".
 *
 * It stops short of the locale on purpose. The locale's answer is in
 * `internal/date.ts`, and importing that here would put the date code into the
 * module every sized component already imports.
 */
export function useMPWeekStart(weekStartsOn: MPWeekday | undefined): MPWeekday | undefined {
  const config = React.useContext(MPConfigContext);

  return weekStartsOn ?? config.weekStartsOn;
}
