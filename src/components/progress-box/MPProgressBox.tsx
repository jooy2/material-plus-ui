import * as React from 'react';
import { Progress } from '@base-ui/react/progress';
import { accentSlots } from '../../internal/accent';
import { META_TEXT, STACK_GAP } from '../../internal/scale';
import {
  SEGMENT_GAP,
  SEGMENT_RADIUS,
  SEGMENT_SIZE,
  progressAriaText,
  progressFraction,
  progressText,
  type MPProgressProps
} from '../../internal/progress';
import type { MPColor, MPSize } from '../../types';

export interface MPProgressBoxProps extends MPProgressProps {
  /** Size of one segment. @default 'md' */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
  /**
   * How many segments the row is made of.
   *
   * Four by default: enough that the wave reads as a wave, few enough that a
   * determinate row can be counted at a glance rather than measured. Set it to
   * the number of steps when the thing being waited on genuinely has steps.
   * @default 4
   */
  count?: number;
}

/**
 * A row of segments that light up.
 *
 * The third shape, and the one that answers a different question from the other
 * two. A bar and a ring both say "this much of it is done" — a quantity a reader
 * reads off a length. A row of four segments says "this is step three", which is
 * a quantity they *count*, and counting is faster than measuring for any number
 * small enough to count.
 *
 * That is what makes it the right indicator for work that genuinely has steps —
 * an upload with a verify and a publish after it, a four-page form — and the
 * wrong one for a percentage. This is not an MD3 component: the specification
 * has a bar and a ring and stops there. It is drawn out of the spec's own parts
 * all the same — `corner-extra-small` tiles, the accent, `on-surface` at 12% —
 * so a row of them sits in a Material page without announcing that it is extra.
 *
 * It answers a value when it has one: the segments fill left to right, the
 * leading one partially, so four segments read as a four-part bar rather than
 * rounding 30% away to a quarter. Without a value they cycle, each held back by
 * its own index.
 */
export const MPProgressBox = React.forwardRef<HTMLDivElement, MPProgressBoxProps>(
  function MPProgressBox(
    {
      size = 'md',
      color = 'primary',
      count = 4,
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
    // A row of no segments is not an indicator, and a fractional count is a
    // caller who divided something. Both land on one segment rather than none.
    const segments = Math.max(1, Math.floor(count));

    return (
      <Progress.Root
        ref={ref}
        value={value ?? null}
        min={min}
        max={max}
        format={format}
        getAriaValueText={progressAriaText(fraction, hasFormat)}
        data-mp-size={size}
        className={['mp-progress-box inline-flex flex-col', STACK_GAP[size], className ?? '']
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

        <Progress.Track className={`flex ${SEGMENT_GAP[size]}`}>
          {Array.from({ length: segments }, (_, index) => (
            <span
              key={index}
              className={[
                'bg-mp-on-surface/12 relative overflow-hidden',
                SEGMENT_SIZE[size],
                SEGMENT_RADIUS[size],
                // The wave animates opacity, not position, and reads `--_mp-index`
                // for its own delay — which is why the whole row is one class and
                // one custom property rather than N generated keyframe names.
                indeterminate ? 'mp-progress-segment-wave bg-(--_mp-accent)' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              style={indeterminate ? ({ '--_mp-index': index } as React.CSSProperties) : undefined}
            >
              {indeterminate ? null : (
                // Each segment is a track of its own, so the leading one can be
                // part full. Without that, four segments could only ever show 0,
                // 25, 50, 75 or 100.
                <span
                  className="absolute inset-y-0 start-0 bg-(--_mp-accent) transition-[width] duration-(--mp-sys-motion-duration-short4) ease-mp-standard"
                  style={{
                    width: `${Math.min(100, Math.max(0, (fraction * segments - index) * 100))}%`
                  }}
                />
              )}
            </span>
          ))}
        </Progress.Track>
      </Progress.Root>
    );
  }
);
