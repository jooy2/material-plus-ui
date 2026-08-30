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

/* ---------------------------------------------------------------------------
 * Sheets
 *
 * A control holds one line of text at a fixed height. A *sheet* — a quote, an
 * empty state, a list row, a table cell — holds a heading, a paragraph and a
 * footer, all of which wrap. That is a different problem, and the four tables
 * below are its answer.
 *
 * They arrived with the display components and are shared from the start, for
 * the reason the top of this file gives: `md` has to mean 16px of padding on
 * every sheet in the library, and four copies of that number is four chances to
 * disagree about it.
 * ------------------------------------------------------------------------- */

/**
 * The room inside a sheet.
 *
 * `md` is 16px, which is MD3's own card padding, and the ladder is centred on it
 * the same way the control heights are centred on 56. The steps are 4px apart at
 * the bottom and widen at the top, because the difference between 20 and 24 is
 * the difference between "roomy" and "spacious" while 8 and 10 are both "tight".
 */
export const SHEET_PAD: Record<MPSize, string> = {
  xs: 'p-2.5',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6'
};

/** The same track sideways only, for a sheet that sets its own vertical room. */
export const SHEET_PAD_X: Record<MPSize, string> = {
  xs: 'px-2.5',
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-5',
  xl: 'px-6'
};

/**
 * And the other axis, for the sheet that is built out of stacked sections.
 *
 * A card, a drawer and a collapsible all make the same trade: without dividers
 * the *sheet* carries the vertical room and each section carries only the
 * horizontal, so the gaps between sections belong to the sheet; with them each
 * section carries both, so a hairline can reach the sheet's edges. That needs
 * the two axes separately, and it needs them written out — Tailwind finds
 * classes by scanning source text, so a `p-4` turned into a `py-4` at runtime
 * generates no rule at all and the padding simply would not exist.
 */
export const SHEET_PAD_Y: Record<MPSize, string> = {
  xs: 'py-2.5',
  sm: 'py-3',
  md: 'py-4',
  lg: 'py-5',
  xl: 'py-6'
};

/**
 * A sheet's heading.
 *
 * The `title` roles rather than the `headline` ones: a headline is what a page
 * is about, and a list row's first line is not. `md` lands on `title-medium`,
 * which is `body-large` at weight 500 — exactly the relationship MD3 draws
 * between a list item's headline and its supporting text.
 */
export const SHEET_TITLE: Record<MPSize, string> = {
  xs: 'text-mp-title-small',
  sm: 'text-mp-title-small',
  md: 'text-mp-title-medium',
  lg: 'text-mp-title-large',
  xl: 'text-mp-headline-small'
};

/** Between a sheet's stacked parts — a heading and the paragraph under it. */
export const SHEET_GAP: Record<MPSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3.5',
  xl: 'gap-4'
};

/** The gap between a control and the text stacked above or below it. */
export const STACK_GAP: Record<MPSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5'
};

/**
 * The measure — how wide a row of content is allowed to get — in `rem` and
 * pinned to MD3's window size class boundaries: 600, 840, 1200 and 1600dp, with
 * one rung below them.
 *
 * So `maxWidth="md"` is "never wider than a medium window", which is a sentence
 * about the specification rather than a number somebody liked. Tailwind's own
 * `max-w-*` scale is a different set — `max-w-lg` is 32rem — and two ladders
 * called `lg` on one page is how a layout drifts by a few pixels for no reason
 * anybody can find later.
 *
 * It is here rather than in `MPContainer`, which was its first reader, for the
 * reason at the top of this file: a header, a footer and a container that hold
 * their content to "a medium window" have to agree on where that edge is, or the
 * bar and the article under it line up at every width but one.
 */
export const MEASURE: Record<MPSize, string> = {
  xs: 'max-w-[30rem]',
  sm: 'max-w-[37.5rem]',
  md: 'max-w-[52.5rem]',
  lg: 'max-w-[75rem]',
  xl: 'max-w-[100rem]'
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
