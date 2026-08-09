/**
 * The size ladder, once.
 *
 * `MPSize` promises that a rung means the same thing on every control — see
 * `docs/{locale}/design/prop-conventions.md` — and a promise kept by twelve
 * separate tables is a promise that gets broken the first time one of them is
 * edited alone. So the heights, the type roles and the spacing that follow from
 * them live here, and a component picks the rows it needs.
 *
 * ## Why they are written out rather than computed
 *
 * Every value below is a literal class string, and it has to be: Tailwind finds
 * classes by scanning source text, so an interpolated `h-${n}` generates no rule
 * at all. That is also why this file is scanned — `@source '.'` in `styles.css`
 * covers the whole compiled library, this module included.
 *
 * ## What is *not* here
 *
 * Anything one component decides on its own. A switch's track is not on the
 * ladder because it is not a control height — it is a track a thumb runs along,
 * sized by the thumb. A checkbox's tick is not either. Those tables stay in the
 * component that owns them, next to the reasoning for their numbers.
 */
import type { MPSize } from '../types';

/**
 * The control heights, and the ladder every other table here is derived from.
 *
 * 32 / 40 / 56 / 64 / 72, with `md` at Material's own 56 — the same rungs
 * `MPTextField` is drawn at, so a button, a select and a field in one form row
 * line up. The first three are also MD3's own extra-small, small and medium
 * button heights; `lg` and `xl` are this library's, because the spec's are 96
 * and 136 and a 96px button beside a 64px field is not a row.
 */
export const CONTROL_HEIGHT: Record<MPSize, string> = {
  xs: 'h-8',
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-16',
  xl: 'h-18'
};

/** The same numbers as a square, for a control with no label to pad against. */
export const CONTROL_SQUARE: Record<MPSize, string> = {
  xs: 'size-8',
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-16',
  xl: 'size-18'
};

/**
 * What a control's own text is set in.
 *
 * `label-large` at the bottom two rungs and `title-medium` from `md` up, which
 * is the pair MD3 puts on its small and medium buttons. A smaller control moves
 * *down the Material type scale* rather than to an interpolated size of the
 * library's own — the same rule the text field follows into `body-medium`.
 */
export const CONTROL_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-large',
  sm: 'text-mp-label-large',
  md: 'text-mp-title-medium',
  lg: 'text-mp-title-medium',
  xl: 'text-mp-title-medium'
};

/**
 * Inline padding on a control with a label in it.
 *
 * MD3's own 12 / 16 / 24 for the first three rungs, continued at the same pace.
 * A button's padding grows faster than its height on purpose: the label is what
 * a pill is drawn around, so a taller button that kept 24px of padding would
 * come out looking squeezed.
 */
export const CONTROL_PAD_X: Record<MPSize, string> = {
  xs: 'px-3',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-10'
};

/** The gap between a control's icon and its label. */
export const CONTROL_GAP: Record<MPSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-2',
  lg: 'gap-2.5',
  xl: 'gap-3'
};

/**
 * The glyph a control draws beside its label, in CSS pixels.
 *
 * A number rather than a class because `MPIcon` takes a length — it is the one
 * component that is not on the ladder, for the reason given in the prop
 * conventions: an icon has no height of its own to pick from a scale.
 */
export const CONTROL_ICON: Record<MPSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 22,
  xl: 24
};

/**
 * What text *beside* a control is set in — a checkbox's label, a radio's.
 *
 * The body scale rather than the label scale, and the same two roles a text
 * field's own input takes. A checkbox's label is prose that happens to sit next
 * to a control; a button's label is part of one. Setting the first in
 * `title-medium` at 500 would make a list of options read as a list of headings.
 */
export const PROSE_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-medium',
  sm: 'text-mp-body-medium',
  md: 'text-mp-body-large',
  lg: 'text-mp-body-large',
  xl: 'text-mp-body-large'
};

/**
 * Supporting text: a label above a control, a description or an error under it.
 *
 * `body-small` at every rung, deliberately. Supporting text is prose about the
 * control rather than part of it, and prose that shrank with the control would
 * be unreadable at `xs` — where it is needed most, because that is the density a
 * form gets cramped at.
 */
export const META_TEXT = 'text-mp-body-small';

/** The gap between a control and the text stacked above or below it. */
export const STACK_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5'
};

/**
 * Whether a slot was given something worth drawing a wrapper around.
 *
 * `false` and `null` both mean "nothing here" in JSX — they are what a
 * `condition && <Icon />` leaves behind — and an empty string is a caller
 * clearing a default. Testing for `undefined` alone would draw a padded, gapped
 * box around each of them.
 */
export function hasContent(node: unknown): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}
