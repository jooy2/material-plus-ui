/**
 * Text for a screen reader and nobody else.
 *
 * The sentence behind a bare number on a badge, the "opens in a new tab" after a
 * link's label, the name an avatar's initials are standing in for, the direction
 * a sorted column is sorted in. In every one of those the visible mark is
 * shorthand a reader who can see it expands instantly and a reader who cannot
 * gets nothing from at all.
 *
 * Not `hidden`, not `display: none` and not `opacity: 0` — the first two take the
 * text off the accessibility tree along with the screen, which is the opposite of
 * what is wanted, and the third leaves a clickable ghost the size of the words. A
 * 1px clipped box is the one form that is invisible to a sighted reader and
 * present to every other kind.
 *
 * This is Tailwind's own `sr-only` written out. It is written out because
 * Preflight is not the only thing this library leaves off: `sr-only` is a
 * *utility*, so it is generated — but a consumer running their own Tailwind build
 * with a `prefix` configured would generate it under a different name, and a
 * component that hardcoded `sr-only` would come out visible on their page. The
 * arbitrary properties below survive any prefix.
 */
export const VISUALLY_HIDDEN =
  'absolute size-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]';
