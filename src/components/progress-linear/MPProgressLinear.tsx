import * as React from 'react';
import { Progress } from '@base-ui/react/progress';
import { accentSlots } from '../../internal/accent';
import { META_TEXT, STACK_GAP } from '../../internal/scale';
import {
  BAR_THICKNESS,
  progressAriaText,
  progressFraction,
  progressText,
  type MPProgressProps
} from '../../internal/progress';
import type { MPColor, MPSize } from '../../types';

export interface MPProgressLinearProps extends MPProgressProps {
  /**
   * Thickness of the track. `md` is MD3's own 4dp; nothing else on a bar has a
   * size, so this is the only thing `size` touches here.
   * @default 'md'
   */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
}

/**
 * The bar that fills, and the workhorse of the three.
 *
 * It is the only one that can show *how much* is left at a glance, because length
 * is the one quantity a reader compares without counting. MD3 draws it as a 4dp
 * groove in `secondary-container` with the active indicator in `primary`; here
 * the two are the chosen family's own container and accent, so `color="error"` is
 * a red bar in a red groove rather than a red bar in a blue one.
 *
 * Both ends are fully rounded, which is MD3's own shape for it: at four pixels
 * tall there is no flat run left to preserve, and a square-ended bar reads as a
 * rendering fault rather than as a decision.
 *
 * Base UI's Progress owns the semantics — `role="progressbar"`, the value and
 * range attributes, `aria-valuetext`, and dropping the value entirely while the
 * bar is indeterminate — and it computes the fill width too, so the determinate
 * case here is a class list and nothing else.
 */
export const MPProgressLinear = React.forwardRef<HTMLDivElement, MPProgressLinearProps>(
  function MPProgressLinear(
    {
      size = 'md',
      color = 'primary',
      value = null,
      min = 0,
      max = 100,
      label,
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

    const bar = 'absolute inset-y-0 rounded-mp-full bg-(--_mp-accent)';

    return (
      <Progress.Root
        ref={ref}
        value={value ?? null}
        min={min}
        max={max}
        format={format}
        getAriaValueText={progressAriaText(fraction, hasFormat)}
        data-mp-size={size}
        className={['mp-progress-linear flex w-full flex-col', STACK_GAP[size], className ?? '']
          .filter(Boolean)
          .join(' ')}
        style={{ ...accentSlots(color), ...style }}
      >
        {label || showValue ? (
          <div
            className={[
              'flex items-baseline gap-2',
              label ? 'justify-between' : 'justify-end',
              META_TEXT
            ].join(' ')}
          >
            {label ? (
              <Progress.Label className="text-mp-on-surface min-w-0 truncate">
                {label}
              </Progress.Label>
            ) : null}
            {showValue ? (
              <Progress.Value className="text-mp-on-surface-variant shrink-0 tabular-nums">
                {(formatted) => progressText(fraction, formatted, hasFormat)}
              </Progress.Value>
            ) : null}
          </div>
        ) : null}

        <Progress.Track
          className={[
            'rounded-mp-full bg-mp-on-surface/12 relative w-full overflow-hidden',
            // The track is the family's container tone where the family has one
            // to spare. `on-surface` at 12% is MD3's own disabled-container wash
            // and reads as a groove on every scheme, which is what a track that
            // has to sit under four different accents needs.
            BAR_THICKNESS[size]
          ].join(' ')}
        >
          {indeterminate ? (
            /*
             * Two bars, not one. MD3's indeterminate track is a long sweep
             * followed by a short one that catches up; the second is what stops
             * the groove being empty for most of the cycle. Base UI renders no
             * indicator at all without a value, so both are ours.
             */
            <React.Fragment>
              <span className={`${bar} mp-progress-linear-lead`} />
              <span className={`${bar} mp-progress-linear-trail`} />
            </React.Fragment>
          ) : (
            <Progress.Indicator
              // Base UI supplies the width; this is what makes it move rather
              // than jump when the value changes.
              className={`${bar} start-0 transition-[width] duration-(--mp-sys-motion-duration-short4) ease-mp-standard`}
            />
          )}
        </Progress.Track>
      </Progress.Root>
    );
  }
);
