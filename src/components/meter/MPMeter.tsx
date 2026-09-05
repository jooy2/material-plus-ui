import * as React from 'react';
import { Meter } from '@base-ui/react/meter';
import { accentSlots } from '../../internal/accent';
import { META_TEXT, STACK_GAP } from '../../internal/scale';
import { BAR_THICKNESS, progressFraction } from '../../internal/progress';
import { useMPColor, useMPSize } from '../../internal/config';
import { thresholdColor } from '../../internal/threshold';
import type { MPColor, MPSize, MPThreshold } from '../../types';

export interface MPMeterProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /**
   * How much there is.
   *
   * Required, and that is the whole difference from `MPProgressLinear`: a meter
   * reports a quantity that is already known, so there is no indeterminate case
   * for a default to stand in for.
   */
  value: number;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** A name for what is being measured. Read out with the value. */
  label?: React.ReactNode;
  /**
   * Shows the value as text beside the bar. A share of the range unless
   * `format` says otherwise.
   * @default false
   */
  showValue?: boolean;
  /**
   * How to write that value — `Intl.NumberFormat` options, so bytes,
   * currencies and plain counts all work.
   *
   * It matters more here than on a progress bar. A meter usually has real
   * units: 41 of 60 seats, 2.1 GB of 5, £340 of a £500 budget. A percentage is
   * what a range nobody described reads as, not what the reader came for.
   */
  format?: Intl.NumberFormatOptions;
  /**
   * Where the bar changes colour, smallest `from` first. The family of the last
   * threshold the value has reached wins; below all of them `color` stands.
   */
  thresholds?: readonly MPThreshold[];
  /**
   * Thickness of the groove. Nothing else on a bar has a size.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * The family the bar carries before any threshold is reached.
   * @default 'primary'
   */
  color?: MPColor;
}

/**
 * How much of something there is, on a scale known in advance — disk used, seats
 * taken, quota spent, a password's strength.
 *
 * ```tsx
 * <MPMeter
 *   value={41}
 *   max={60}
 *   label="Seats taken"
 *   showValue
 *   thresholds={[{ from: 48, color: 'tertiary' }, { from: 57, color: 'error' }]}
 * />
 * ```
 *
 * ## It looks like a progress bar and is not one
 *
 * A progress bar is about **time**: something is happening, this is how far it
 * has got, it may have no value at all, and it is expected to move on its own.
 * A meter is about **quantity**: the number is already known, it does not move
 * unless the thing it measures does, and it is meaningful to say the reading is
 * bad — which is what `thresholds` is for and what a progress bar has no use
 * for. A disk that is 94% full is not 94% finished.
 *
 * The two carry different roles for that reason, so a screen reader announces a
 * meter as a measurement rather than as something in progress. Reaching for the
 * wrong one is not a styling mistake; it is a claim about what the number means.
 *
 * ## `thresholds` names roles, not colours
 *
 * MD3 has four accent families and none of them is called `warning`, so an amber
 * band is `tertiary` under whatever source colour the page is themed from. That
 * is the honest answer rather than a limitation: a threshold that named a colour
 * would be a colour that ignores the theme, on the one component whose whole
 * point is to be read at a glance.
 *
 * The last threshold the value has reached wins, so they are listed smallest
 * first and the list is read in the order it was given.
 */
export const MPMeter = React.forwardRef<HTMLDivElement, MPMeterProps>(function MPMeter(
  {
    value,
    min = 0,
    max = 100,
    label,
    showValue = false,
    format,
    thresholds,
    size: sizeProp,
    color: colorProp,
    className,
    style,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const fraction = progressFraction(value, min, max);
  const family = thresholdColor(value, color, thresholds);
  const hasFormat = format !== undefined;

  return (
    <Meter.Root
      ref={ref}
      value={value}
      min={min}
      max={max}
      format={format}
      data-mp-size={size}
      className={['mp-meter flex w-full flex-col', STACK_GAP[size], className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(family), ...style }}
      {...props}
    >
      {label || showValue ? (
        <div
          className={[
            'mp-meter__header flex items-baseline gap-2',
            label ? 'justify-between' : 'justify-end',
            META_TEXT
          ].join(' ')}
        >
          {label ? (
            <Meter.Label className="text-mp-on-surface min-w-0 truncate">{label}</Meter.Label>
          ) : null}
          {showValue ? (
            <Meter.Value className="text-mp-on-surface-variant shrink-0 tabular-nums">
              {/* Base UI's own default is the raw number, which is only right
                  once somebody has said what the units are. Without `format`
                  the honest reading is a share of the range. */}
              {(formatted) => (hasFormat ? formatted : `${Math.round((fraction ?? 0) * 100)}%`)}
            </Meter.Value>
          ) : null}
        </div>
      ) : null}

      <Meter.Track
        className={[
          // The same groove `MPProgressLinear` cuts, because they are the same
          // object: `on-surface` at 12% is MD3's disabled-container wash, and it
          // reads as a groove under all four accents on both schemes.
          'mp-meter__track rounded-mp-full bg-mp-on-surface/12 relative w-full overflow-hidden',
          BAR_THICKNESS[size]
        ].join(' ')}
      >
        <Meter.Indicator
          // Base UI supplies the width. The transitions are what make a reading
          // that changed travel there and change family rather than jumping —
          // and the colour needs its own, because a bar that crosses a threshold
          // has two things happening at once.
          className={[
            'mp-meter__bar rounded-mp-full absolute inset-y-0 start-0 bg-(--_mp-accent)',
            'transition-[width,background-color] duration-(--mp-sys-motion-duration-short4)',
            'ease-mp-standard motion-reduce:transition-none'
          ].join(' ')}
        />
      </Meter.Track>
    </Meter.Root>
  );
});
