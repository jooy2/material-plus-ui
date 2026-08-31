import * as React from 'react';
import { Progress } from '@base-ui/react/progress';
import { accentSlots } from '../../internal/accent';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { CONTROL_GAP, META_TEXT } from '../../internal/scale';
import {
  RING_DIAMETER,
  RING_STROKE,
  progressAriaText,
  progressFraction,
  progressText,
  type MPProgressProps
} from '../../internal/progress';
import type { MPColor, MPSize } from '../../types';

export interface MPProgressCircularProps extends MPProgressProps {
  /**
   * Diameter of the ring. `md` is MD3's own 48dp, and every rung sits inside the
   * control height of the same name — so a spinner dropped into a button, a field
   * or a table row never makes the row taller than it was.
   * @default 'md'
   */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
}

/**
 * The ring that fills, and the one to reach for where there is no room for a bar
 * — inside a button, at the end of a table row, next to a field.
 *
 * The value and the label sit *beside* the ring rather than inside it. A number
 * in the middle of a dial is the picture everyone has of this component, and it
 * only works at two of the five sizes: at `xs` the ring is twenty-four pixels
 * across and there is nowhere for "40%" to go. Beside it, every size reads.
 *
 * ## `pathLength`
 *
 * The circle declares `pathLength={100}`, which re-scales the units
 * `stroke-dasharray` and `stroke-dashoffset` are measured in — so an arc is
 * written as a percentage rather than as a fraction of 2πr. That is what lets one
 * `@keyframes` rule in the stylesheet serve all five diameters: without it, every
 * rung would need arithmetic in a stylesheet that cannot do arithmetic.
 */
export const MPProgressCircular = React.forwardRef<HTMLDivElement, MPProgressCircularProps>(
  function MPProgressCircular(
    {
      size = 'md',
      color = 'primary',
      value = null,
      min = 0,
      max = 100,
      label,
      hideLabel = false,
      showValue = false,
      format,
      className,
      style
    },
    ref
  ) {
    const fraction = progressFraction(value, min, max);
    const indeterminate = fraction === null;
    const hasFormat = format !== undefined;

    const diameter = RING_DIAMETER[size];
    const stroke = RING_STROKE[size];
    const centre = diameter / 2;
    // The stroke straddles the path, so the radius has to come in by half of it
    // or the ring is clipped by its own viewBox.
    const radius = centre - stroke / 2;

    return (
      <Progress.Root
        ref={ref}
        /*
         * The fraction rather than the raw value, which is the same number
         * except in the one case they disagree — and there the raw value is
         * wrong. `progressFraction` answers `null` for a range with nothing in
         * it (`max <= min`) as well as for a `value` of `null`, because a bar
         * cannot say how far along something is between ten and ten. The shape
         * already drew itself indeterminate; Base UI was still being handed the
         * number, so a screen reader heard "5%" on a bar that was reporting it
         * did not know.
         */
        value={fraction === null ? null : (value ?? null)}
        min={min}
        max={max}
        format={format}
        getAriaValueText={progressAriaText(fraction, hasFormat)}
        data-mp-size={size}
        className={[
          'mp-progress-circular inline-flex items-center',
          CONTROL_GAP[size],
          META_TEXT,
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...accentSlots(color), ...style }}
      >
        <svg
          // The turn is on the whole `<svg>`, not on a group inside it:
          // `transform-origin: center` resolves against an element's border box,
          // which an SVG child does not have unless `transform-box` is set as
          // well. One element, one rule, no surprises across browsers.
          className={indeterminate ? 'mp-progress-circular-turn shrink-0' : 'shrink-0'}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          fill="none"
          aria-hidden="true"
        >
          {/* The track. `on-surface` at 12% rather than the family's container
              tone, for the reason the linear bar's groove takes it: one wash has
              to read under all four accents on both schemes. */}
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke="var(--_mp-color-on-surface)"
            strokeOpacity={0.12}
            strokeWidth={stroke}
          />
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            pathLength={100}
            stroke="var(--_mp-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={
              indeterminate
                ? 'mp-progress-circular-arc'
                : 'transition-[stroke-dashoffset] duration-(--mp-sys-motion-duration-short4) ease-mp-standard'
            }
            // An SVG geometry attribute rather than a CSS transform: this is
            // where the arc *starts*, not something the ring does when its state
            // changes. Without it a determinate ring would fill from 3 o'clock.
            transform={`rotate(-90 ${centre} ${centre})`}
            {...(indeterminate
              ? null
              : { strokeDasharray: 100, strokeDashoffset: 100 * (1 - fraction) })}
          />
        </svg>

        {hideLabel ? (
          // Out of flow, so it costs neither a line nor the row's gap.
          label ? (
            <Progress.Label className={VISUALLY_HIDDEN}>{label}</Progress.Label>
          ) : null
        ) : label ? (
          <Progress.Label className="text-mp-on-surface min-w-0 truncate">{label}</Progress.Label>
        ) : null}
        {showValue ? (
          <Progress.Value className="text-mp-on-surface-variant shrink-0 tabular-nums">
            {(formatted) => progressText(fraction, formatted, hasFormat)}
          </Progress.Value>
        ) : null}
      </Progress.Root>
    );
  }
);
