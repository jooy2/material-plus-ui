/**
 * The surfaces, and the two questions they answer.
 *
 * The first is what everything that floats above the page has in common. Nine
 * components portal something to the end of `<body>` — the dialog, the drawer,
 * the overlay, the menu, the popover, the snackbar, the select's list, the
 * combobox's list and the colour picker's panel — and the three strings below
 * are the parts of that which must not differ between them. A dialog opened
 * over an overlay would otherwise show a seam where two scrims of slightly
 * different alpha overlap, and a menu that faded on a different curve from the
 * dialog it was opened inside would read as two libraries.
 *
 * The second is what a *container* paints itself at, which is the last section
 * of the file.
 */
import type { MPVariant } from '../types';

/**
 * The positioner every portalled popup wears.
 *
 * `mp-portal` is a hook, not a style. A portalled element leaves the subtree a
 * host may have scoped its CSS reset to, so the class is there for that host to
 * hang the same reset off — this library never styles it.
 *
 * `z-50` is Tailwind's top stacking step and is shared by every popup here, so
 * the order two open popups stack in is the order they were opened in rather
 * than a number somebody picked.
 */
export const PORTAL_LAYER = 'mp-portal z-50 outline-none';

/**
 * The scrim: MD3's own `scrim` role at 32%.
 *
 * The alpha lives here rather than in the token because 32% is what the
 * *component* draws it at — the role itself is a colour, and a page that themes
 * `--mp-sys-color-scrim` should not have to restate an opacity to do it.
 *
 * The 2px blur is not a frost. It is enough to take the edge off text directly
 * under the sheet without turning the page into a smear, which is the difference
 * between "you cannot use this right now" and "this is gone".
 */
export const SCRIM = 'bg-mp-scrim/32 [backdrop-filter:blur(2px)]';

/**
 * Opacity, and only opacity — what a **popup** arrives on.
 *
 * A popup opens where the reader is already looking. A menu lands next to the
 * row the pointer is on; a select's list covers the field that was just pressed;
 * a tooltip appears under the thing being pointed at. All three are read the
 * instant they appear, and all three would be moving the target out from under
 * a pointer that is already travelling towards it. So none of them move.
 *
 * The scrim uses it too, which is the other reason it is one string: a dialog
 * opened over an overlay would otherwise show a seam where two scrims of
 * slightly different alpha fade in on slightly different curves.
 */
export const FADE = [
  'transition-opacity duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard',
  'data-starting-style:opacity-0 data-ending-style:opacity-0'
].join(' ');

/**
 * The timing a **sheet** arrives on, where `FADE` is the timing a popup arrives
 * on.
 *
 * The dialog and the modal drawer are the two surfaces in this library that
 * take the whole page rather than a corner of it. They are not opened *at* a
 * target the way a popup is — nothing is under them that the reader was aiming
 * for — and both are announcements rather than continuations, so both are given
 * the specification's own arrival: slower coming in than going out, on the
 * emphasized pair.
 *
 * `medium4` on `emphasized-decelerate` in, `short4` on `emphasized-accelerate`
 * out. That asymmetry is the ladder `internal/animate.ts` sets out at length:
 * something arriving is being introduced and is given time to read as an
 * arrival; something leaving has already said what it had to say.
 *
 * `data-ending-style` is what makes it one declaration rather than two states to
 * keep in step — the attribute is on the surface for exactly as long as it is
 * closing, so the exit's numbers are the ones in force while the exit runs.
 *
 * What is *not* here is the `transition-property` or the travel. A dialog grows
 * and a drawer slides, and each says so itself; this is only the pair of
 * timings they must agree on, plus the fade both of them carry underneath.
 */
export const SHEET_MOTION = [
  'duration-(--mp-sys-motion-duration-medium4)',
  'ease-(--mp-sys-motion-easing-emphasized-decelerate)',
  'data-ending-style:duration-(--mp-sys-motion-duration-short4)',
  'data-ending-style:ease-(--mp-sys-motion-easing-emphasized-accelerate)',
  'data-starting-style:opacity-0 data-ending-style:opacity-0'
].join(' ');

/* ---------------------------------------------------------------------------
 * Containers
 * ------------------------------------------------------------------------- */

/**
 * The five weights, said the way a **container** says them.
 *
 * This is the other half of the library's `variant` vocabulary, and the half
 * that is easy to get wrong. On a component that *is* the thing being coloured —
 * a button, a chip, an alert — `filled` is the accent under its own ink. On a
 * component that is a box holding **somebody else's** content it cannot be:
 * dyeing the box dyes their content's background, and every link, field and
 * button they put inside it would then need an on-accent treatment of its own.
 *
 * So a container's ladder runs up the neutral surface roles instead, and
 * `filled` is the loudest one it is allowed — MD3's `surface-container-highest`,
 * which is also the specification's own *filled card*. `elevated` and `outlined`
 * are MD3's other two card variants to the letter: `surface-container-low` under
 * a level-1 shadow, and a hairline in `outline-variant`. `text` paints nothing
 * at all, which is what a container nested inside another container wants.
 *
 * The ink is deliberately **not** here. Most callers want `text-mp-on-surface`
 * and say so once beside this, but a table sets the ink per cell and a carousel
 * has none of its own, and a ladder that decided for them would be a ladder they
 * had to undo.
 *
 * It lives in `internal/` for the reason `scale.ts` gives about the size ladder:
 * nine components read it, and a promise kept by nine separate tables is a
 * promise that gets broken the first time one of them is edited alone.
 */
export const CONTAINER_SURFACE: Record<MPVariant, string> = {
  filled: 'bg-mp-surface-container-highest',
  tonal: 'bg-mp-surface-container',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low',
  outlined: 'border-mp-outline-variant border bg-transparent',
  text: 'bg-transparent'
};
