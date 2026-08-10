/**
 * What everything that floats above the page has in common.
 *
 * Six components portal something to the end of `<body>` — the dialog, the
 * overlay, the menu, the snackbar, the combobox's list and the colour picker's
 * panel — and the three strings below are the parts of that which must not
 * differ between them. A dialog opened over an overlay would otherwise show a
 * seam where two scrims of slightly different alpha overlap, and a menu that
 * faded on a different curve from the dialog it was opened inside would read as
 * two libraries.
 */

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
 * Opacity, and only opacity.
 *
 * Everything that uses this is a box full of text. A surface that scales or
 * slides on the way in drags its own sentence across the screen while the reader
 * is already looking at it, and a menu that slides has moved the row the pointer
 * was already reaching for.
 */
export const FADE = [
  'transition-opacity duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard',
  'data-starting-style:opacity-0 data-ending-style:opacity-0'
].join(' ');
