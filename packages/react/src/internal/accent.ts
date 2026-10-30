/**
 * The `color` prop, made available to a stylesheet.
 *
 * `color="tertiary"` has to reach a `background-color`, and there is no way for
 * it to do that through a class name: Tailwind finds classes by scanning source
 * text, so `bg-mp-${color}` generates nothing at all. The alternative — a table
 * of every variant crossed with every colour, written out — is twenty literal
 * strings per component that all say the same thing.
 *
 * So the family is a *value* rather than a name. Four custom properties are set
 * on the component's root and the classes read those, which means one set of
 * classes covers all four families and the ladder of roles inside each of them
 * stays intact: `filled` is always the accent under its own ink, whichever accent
 * that turns out to be.
 *
 * The names are `--_mp-*` because they are private, in the same sense the derived
 * colours in `styles.css` are: read by components, not a name to set. What a
 * consumer sets is the *role* — `--mp-sys-color-tertiary` — and it arrives here
 * on its own, because these are indirections through the role rather than copies
 * of its value.
 *
 * ## Why an inline style rather than a class
 *
 * A custom property's `var()` references are substituted at the element the
 * property is declared on. Declaring these on the component's own root is what
 * makes the substitution happen *there* — so a family set on a wrapper, or a
 * source colour scoped to a section, is what the component resolves against.
 */
import type * as React from 'react';
import type { MPColor } from '../types';

/**
 * The four roles an accent family has, pointed at one of the four families.
 *
 * `error` is a family like any other here. That is deliberate: a destructive
 * button and a primary one differ only in which palette they read, and a
 * component that special-cased the error colour would need a second code path
 * for the one case that most needs to look like all the others.
 */
export function accentSlots(color: MPColor): React.CSSProperties {
  return {
    '--_mp-accent': `var(--_mp-color-${color})`,
    '--_mp-on-accent': `var(--_mp-color-on-${color})`,
    '--_mp-accent-container': `var(--_mp-color-${color}-container)`,
    '--_mp-on-accent-container': `var(--_mp-color-on-${color}-container)`
  } as React.CSSProperties;
}
