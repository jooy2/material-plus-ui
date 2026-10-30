/**
 * The wedge that points a floating sheet back at what opened it.
 *
 * Three components draw one — `MPTooltip`, `MPPopover` and `MPHoverCard` — and
 * all three drew it themselves: the same four turn classes, the same viewBox,
 * the same path, the same `aria-hidden`. Only the fill ever differed, and only
 * because a tooltip is drawn on its own ink rather than on a container tone.
 *
 * Three copies of one shape is three chances for one of them to be edited alone,
 * and the failure would be quiet — a wedge one pixel out of line with the sheet
 * above it is not something anybody reports.
 *
 * The positioning stays with the caller. Each of the three has its own `Arrow`
 * part from Base UI, which is what measures the collision and reports the side,
 * and none of them can be swapped for another. So this takes the **className**
 * that goes on that part and the drawing that goes inside it, and the caller
 * spells the two lines that say which part it is.
 *
 * Nothing here is exported from `src/index.ts`. It is the library talking to
 * itself, in the sense `internal/` always means.
 */
import * as React from 'react';

/**
 * Which way the wedge is turned, by the side Base UI says it landed on.
 *
 * Drawn pointing down once and rotated to match, which is a rotation of a glyph
 * — the one allowance the rule against moving a surface makes. The one-pixel
 * overlap on each side is what closes the hairline a fractional position would
 * otherwise leave between the wedge and the sheet it belongs to.
 */
export const POPUP_ARROW_TURN = [
  'data-[side=top]:bottom-[-1px]',
  'data-[side=bottom]:top-[-1px] data-[side=bottom]:rotate-180',
  'data-[side=left]:right-[-1px] data-[side=left]:-rotate-90',
  'data-[side=right]:left-[-1px] data-[side=right]:rotate-90'
].join(' ');

/**
 * The drawing itself, twice as wide as it is tall.
 *
 * `aria-hidden`, because the wedge says nothing a reader has not already been
 * told: the sheet it hangs off is announced by the thing that opened it, and an
 * arrow announced separately would be a second object in the tree that is really
 * a corner of the first.
 *
 * @param size the wedge's width in pixels. It is half that tall.
 * @param fill the surface the sheet is drawn on, as a custom property.
 */
export function PopupArrow({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size / 2} viewBox="0 0 10 5" aria-hidden="true" className="block">
      <path d="M0 0h10L5 5z" fill={fill} />
    </svg>
  );
}

/**
 * How wide the wedge is at each rung.
 *
 * `MPPopover` and `MPHoverCard` share this one; `MPTooltip` keeps its own, two
 * pixels narrower throughout, because a tooltip is a strip of text rather than a
 * sheet and a wedge sized for a card reads as a spike coming off it.
 */
export const POPUP_ARROW_SIZE = {
  xs: 8,
  sm: 9,
  md: 10,
  lg: 11,
  xl: 12
} as const;
