import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { META_TEXT, hasContent } from '../../internal/scale';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/**
 * The rail, the handle, and the strip you can actually hit.
 *
 * MD3's slider is a 4dp track with a 20dp handle on it, and the ratio is the
 * point: the track is a *drawing* of the range and the handle is the only part
 * anybody grabs. The halo is bigger again, at 40dp, because Base UI moves the
 * value to wherever the control is pressed — so the pressable strip has to be as
 * tall as a finger, not as tall as the rail.
 */
const RAIL: Record<
  MPSize,
  { thickness: string; cross: string; handle: string; strip: string; stripCross: string }
> = {
  xs: { thickness: 'h-0.5', cross: 'w-0.5', handle: 'size-3.5', strip: 'h-8', stripCross: 'w-8' },
  sm: { thickness: 'h-[3px]', cross: 'w-[3px]', handle: 'size-4', strip: 'h-9', stripCross: 'w-9' },
  md: { thickness: 'h-1', cross: 'w-1', handle: 'size-5', strip: 'h-10', stripCross: 'w-10' },
  lg: { thickness: 'h-1.5', cross: 'w-1.5', handle: 'size-6', strip: 'h-11', stripCross: 'w-11' },
  xl: { thickness: 'h-2', cross: 'w-2', handle: 'size-7', strip: 'h-12', stripCross: 'w-12' }
};

/**
 * The handle catching up with a value it did not drag to.
 *
 * A slider moves in two quite different ways. Under a pointer it is *being*
 * dragged, and the one thing it must do then is stay under the finger — so this
 * is switched off while `data-dragging` is on the control, or the handle would
 * trail the pointer by the length of the transition and the reader would be
 * pushing a spring.
 *
 * Every other way it moves is a jump: an arrow key, Page Up, a click on the
 * track. Those are the ones this is for, and it is the same thing the tab
 * indicator does when a tab is chosen with the keyboard — a mark that travels to
 * where it is going rather than teleporting there.
 *
 * `short2` rather than the library's usual `short4`. An arrow key held down
 * repeats faster than 200ms, so a handle on the longer duration would never
 * finish one step before starting the next and would drift behind the value it
 * is drawing.
 *
 * The properties are written out for both orientations because Base UI positions
 * the parts with inline styles and picks different ones per axis: a horizontal
 * handle is placed by `inset-inline-start` and a vertical one by `bottom`, and
 * the indicator grows by `width` or by `height` from a start that is itself one
 * of the two.
 */
const TRAVEL = [
  'duration-(--mp-sys-motion-duration-short2) ease-mp-standard',
  'motion-reduce:transition-none'
].join(' ');

/** The halo, which is the same 40dp target every other tick in the library has. */
const HALO: Record<MPSize, string> = {
  xs: 'size-8',
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-11',
  xl: 'size-12'
};

export interface MPSliderProps {
  /**
   * The value, or the values. An array is what makes it a range slider — there is
   * no separate `range` prop, because the shape of the value already says which
   * one this is.
   */
  value?: number | readonly number[];
  /** The starting value, for an uncontrolled slider. */
  defaultValue?: number | readonly number[];
  /** Called on every move, with the same shape `value` takes. */
  onValueChange?: (value: number | number[]) => void;
  /** Called once the drag ends, which is where an expensive update belongs. */
  onValueCommitted?: (value: number | number[]) => void;
  /** The bottom of the range. @default 0 */
  min?: number;
  /** The top of the range. @default 100 */
  max?: number;
  /** How far one arrow key, or one notch of the drag, moves. @default 1 */
  step?: number;
  /** The label above the track. */
  label?: React.ReactNode;
  /** The line under the track. */
  description?: React.ReactNode;
  /**
   * Shows the current value beside the label. A slider with no readout is a
   * control whose value can only be estimated, which is fine for a volume dial
   * and wrong for anything with units.
   * @default false
   */
  showValue?: boolean;
  /** How the readout is written. Passed to `Intl.NumberFormat`. */
  format?: Intl.NumberFormatOptions;
  /**
   * Which way the slider runs. A vertical slider has no length of its own, so
   * give it a height — the default is a starting point, not a rule.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * The rail's thickness and the handle's size.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the active track and handle take.
   * @default 'primary'
   */
  color?: MPColor;
  /** Greys the slider out and stops it taking input. */
  disabled?: boolean;
  /** Name of the form control. */
  name?: string;
  /** The accessible name, for a slider with no visible `label`. */
  'aria-label'?: string;
}

/**
 * A Material Design slider.
 *
 * The active part of the track is the accent family and the rest is
 * `surface-container-highest`, which is MD3's own pairing and the reason the
 * inactive half reads as a groove rather than as a second value.
 *
 * Base UI owns everything that makes a slider hard: the pointer maths, the
 * keyboard steps, `aria-valuenow` and friends, the thumbs of a range slider
 * refusing to cross, and the hidden input that submits with a form.
 *
 * ## The handle is a circle, not a bar
 *
 * Material's 2025 revision draws the handle as a tall thin bar with a gap either
 * side of it. This is the earlier one, deliberately: the gap has to be punched
 * out of the track with a colour that matches whatever the slider is sitting on,
 * and a component library does not know what that is. A handle that assumes the
 * page is `surface` leaves a pale notch in the track on every screen that is not.
 */
export const MPSlider = React.forwardRef<HTMLDivElement, MPSliderProps>(function MPSlider(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    label,
    description,
    showValue = false,
    format,
    orientation = 'horizontal',
    size = 'md',
    color = 'primary',
    disabled = false,
    name,
    'aria-label': ariaLabel
  },
  ref
) {
  const vertical = orientation === 'vertical';
  const rail = RAIL[size];

  // One thumb per value, counted off whichever of the two was given — so an
  // uncontrolled range slider works without being told it is one.
  const given = value ?? defaultValue;
  const thumbCount = Array.isArray(given) ? given.length : 1;

  return (
    <Slider.Root
      ref={ref}
      value={value as number | number[] | undefined}
      defaultValue={defaultValue as number | number[] | undefined}
      onValueChange={(next) => onValueChange?.(next)}
      onValueCommitted={(next) => onValueCommitted?.(next)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
      format={format}
      name={name}
      data-mp-size={size}
      className={[
        'mp-slider flex',
        vertical ? 'w-fit flex-col items-center gap-2' : 'w-full flex-col gap-1',
        disabled ? 'cursor-default' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={accentSlots(color)}
    >
      {hasContent(label) || showValue ? (
        <div className={['flex w-full items-baseline gap-2', META_TEXT].join(' ')}>
          {hasContent(label) ? (
            <Slider.Label
              className={disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'}
            >
              {label}
            </Slider.Label>
          ) : null}
          {showValue ? (
            <Slider.Value
              className={[
                'ms-auto tabular-nums',
                disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface'
              ].join(' ')}
            />
          ) : null}
        </div>
      ) : null}

      <Slider.Control
        className={[
          'mp-slider__control group/rail flex touch-none items-center justify-center select-none',
          vertical ? `${rail.stripCross} h-40 flex-col` : `w-full ${rail.strip}`,
          disabled ? '' : 'cursor-pointer'
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Slider.Track
          className={[
            'mp-slider__track rounded-mp-full relative',
            vertical ? `${rail.cross} h-full` : `${rail.thickness} w-full`,
            disabled ? 'bg-mp-on-surface/12' : 'bg-mp-surface-container-highest'
          ].join(' ')}
        >
          <Slider.Indicator
            className={[
              'rounded-mp-full',
              '[transition-property:inset-inline-start,width,bottom,height]',
              TRAVEL,
              'group-data-dragging/rail:transition-none',
              disabled ? 'bg-mp-on-surface/38' : 'bg-(--_mp-accent)'
            ].join(' ')}
          />

          {Array.from({ length: thumbCount }, (_, index) => (
            <Slider.Thumb
              key={index}
              index={index}
              // On the thumb rather than on the control: the thumb is what
              // carries `role="slider"`, so it is the only element a name means
              // anything on. A visible `label` names them through Base UI
              // instead, which is why this is the fallback rather than the rule.
              aria-label={hasContent(label) ? undefined : ariaLabel}
              className={[
                'mp-slider__handle group rounded-mp-full relative outline-none',
                '[transition-property:inset-inline-start,bottom]',
                TRAVEL,
                // The handle carries `data-dragging` itself, so this needs no
                // group of its own the way the indicator does.
                'data-dragging:transition-none',
                rail.handle,
                disabled
                  ? 'bg-mp-on-surface/38 cursor-default'
                  : 'bg-(--_mp-accent) cursor-grab active:cursor-grabbing'
              ].join(' ')}
            >
              {disabled ? null : (
                <MPStateLayer
                  layer={[
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    HALO[size],
                    'bg-(--_mp-accent)'
                  ].join(' ')}
                  // A slider is the one control that has a *dragging* state, and
                  // MD3 gives it the heaviest layer of the four.
                  className="group-data-dragging:opacity-16"
                />
              )}
            </Slider.Thumb>
          ))}
        </Slider.Track>
      </Slider.Control>

      {hasContent(description) ? (
        <div
          className={[
            META_TEXT,
            disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
          ].join(' ')}
        >
          {description}
        </div>
      ) : null}
    </Slider.Root>
  );
});
