/**
 * The mark that comes and goes, and the timing every one of them shares.
 *
 * Six controls in this library draw a small shape to say "this one" — a
 * checkbox's tick, a radio's dot, the tick beside a chosen row in a select, in a
 * combobox, and in a menu's two kinds of item. They are the same event, so they
 * have to be the same motion: a tick that grows into a `MPSelect` and one that
 * is stamped into an `MPMenu` beside it read as two libraries, and that is
 * exactly what the library had before this file.
 *
 * It is a string rather than a component because the elements it goes on are
 * Base UI's own indicator parts. There is nothing to wrap: what differs between
 * the six is which part renders and what the mark is drawn with, and what does
 * not differ is the two hundred milliseconds and the frame it arrives from.
 *
 * ## Two from-states, because there are two kinds of mark
 *
 * A tick is a **stroke**. Drawn from nothing it spends its first frames as a
 * smudge too small to read as a tick, and the eye takes the arrival for a
 * flicker rather than for a stroke — so it starts at 0.6, already legible.
 *
 * A dot is a **disc**, and a disc at any size is still a disc. It can grow out
 * of the centre of the ring taking the accent around it, which is the arrival
 * MD3 draws for a radio.
 *
 * ## Why the third one is spelled differently
 *
 * `data-starting-style` and `data-ending-style` are Base UI's own two frames,
 * and they are what `MARK_MOTION` and `DOT_MOTION` are written against. They
 * work wherever the part stays mounted for the length of its exit, which the
 * checkbox's, the radio's and the menu's indicators all do.
 *
 * `Select.ItemIndicator` and `Combobox.ItemIndicator` do not: both return `null`
 * the moment their row stops being the chosen one, so `data-ending-style` never
 * reaches the DOM and a tick that faded in vanished in a frame. Their answer is
 * `keepMounted` plus `MARK_MOTION_KEPT`, which drives both directions off
 * `data-selected` and needs neither frame. The cost is one empty `aria-hidden`
 * span per row, in a column the list already reserves the width of.
 */

/**
 * What all six agree on.
 *
 * `short4` is the same 200ms a checkbox's own box takes to fill, which is the
 * point of naming it once: the container and the mark in it are one event, and
 * a mark that outlasted its fill would read as a glyph landing on top of a
 * finished shape.
 */
const MARK_TRANSITION = [
  'transition-[opacity,scale]',
  'duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard'
].join(' ');

/** A stroke, arriving from 0.6 and leaving the same way. */
export const MARK_MOTION = [
  MARK_TRANSITION,
  'data-starting-style:scale-60 data-starting-style:opacity-0',
  'data-ending-style:scale-60 data-ending-style:opacity-0'
].join(' ');

/** A disc, arriving from nothing. */
export const DOT_MOTION = [
  MARK_TRANSITION,
  'data-starting-style:scale-0 data-starting-style:opacity-0',
  'data-ending-style:scale-0 data-ending-style:opacity-0'
].join(' ');

/**
 * A stroke on a part that is kept mounted, so its resting state is the empty
 * one and `data-selected` is what draws it.
 *
 * Always paired with `keepMounted` on the indicator. Without it the part is only
 * ever in the DOM while it is selected, and a rule that hides everything else
 * would hide the only thing there is.
 */
export const MARK_MOTION_KEPT = [
  MARK_TRANSITION,
  'scale-60 opacity-0',
  'data-selected:scale-100 data-selected:opacity-100'
].join(' ');
