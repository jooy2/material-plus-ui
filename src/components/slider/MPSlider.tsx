import * as React from 'react';
import { Slider } from '@base-ui/react/slider';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { META_TEXT, hasContent } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
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

/**
 * A tick's diameter, which is deliberately smaller than anything else on the
 * control.
 *
 * MD3 draws tick marks as dots *inside* the 4dp track, so a tick can never be
 * more than the track is thick — and at `md` that is 4px for the rail and 3px
 * for the dot. They are a texture that says "this slider stops at places", not a
 * second thing to look at.
 */
const TICK: Record<MPSize, string> = {
  xs: 'size-[2px]',
  sm: 'size-[2px]',
  md: 'size-[3px]',
  lg: 'size-1',
  xl: 'size-1.5'
};

/**
 * The most ticks `marks` will draw for a range it was not given by hand.
 *
 * `marks` with `step={1}` over nought to a thousand is a thousand elements
 * describing a track four hundred pixels wide, which is not a row of ticks — it
 * is a dotted line, drawn out of a thousand DOM nodes, that says less than no
 * ticks at all would. Past this the boolean form draws nothing and the array
 * form is the way to say which ones matter.
 *
 * Fifty is where a 400px track has eight pixels between ticks, which is the last
 * point two of them are still two.
 */
const MAX_TICKS = 50;

/** The halo, which is the same 40dp target every other tick in the library has. */
const HALO: Record<MPSize, string> = {
  xs: 'size-8',
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-11',
  xl: 'size-12'
};

export interface MPSliderMark {
  /** Where on the range it sits. Outside `min`…`max` it is not drawn. */
  value: number;
  /**
   * What is written under it — or beside it on a vertical slider. Left out, the
   * mark is a tick on the track and nothing else.
   */
  label?: React.ReactNode;
}

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
  /**
   * The ticks on the track, and optionally what is written under them.
   *
   * `true` puts one at every `step`, which is MD3's discrete slider — up to fifty
   * of them, past which they stop being ticks and become a dotted line (see
   * `MAX_TICKS`). An array names them instead, and is the form that can carry
   * labels: `[{ value: 1990, label: '1990' }, …]` for the decade markings under
   * a year range.
   *
   * A tick over the filled part of the track is drawn in the accent's own ink and
   * one over the groove in `on-surface-variant`, which is the specification's
   * pairing and the reason a tick stays visible as the handle passes it.
   *
   * Labels are laid out from the tick's centre and are not measured, so two that
   * would collide will overlap — an array with fewer entries is the answer, not a
   * smaller type scale.
   */
  marks?: boolean | readonly MPSliderMark[];
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
  /**
   * Added to the slider's outermost element, which holds the label row as well
   * as the track.
   */
  className?: string;
  style?: React.CSSProperties;
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
    marks,
    label,
    description,
    showValue = false,
    format,
    orientation = 'horizontal',
    size: sizeProp,
    color: colorProp,
    disabled = false,
    name,
    'aria-label': ariaLabel,
    className,
    style
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const vertical = orientation === 'vertical';
  const rail = RAIL[size];
  const describedById = React.useId();

  // One thumb per value, counted off whichever of the two was given — so an
  // uncontrolled range slider works without being told it is one.
  const given = value ?? defaultValue;
  const thumbCount = Array.isArray(given) ? given.length : 1;

  /*
   * The ticks, resolved once rather than per render of the track.
   *
   * A mark outside the range is dropped rather than clamped: two decades pinned
   * to the same end of a track are two ticks in one place, which reads as one
   * tick and loses the fact that a value was out of range at all.
   */
  const ticks = React.useMemo<MPSliderMark[]>(() => {
    if (!marks || max <= min) {
      return [];
    }

    if (marks !== true) {
      return marks.filter((mark) => mark.value >= min && mark.value <= max);
    }

    const count = Math.floor((max - min) / step);

    if (!Number.isFinite(count) || count < 1 || count > MAX_TICKS) {
      return [];
    }

    return Array.from({ length: count + 1 }, (_, index) => ({ value: min + index * step }));
  }, [marks, min, max, step]);

  /*
   * Which part of the track a tick is over, which is what decides its ink.
   *
   * The value is mirrored rather than read back off the DOM, and it has to be:
   * an uncontrolled slider's value lives inside Base UI, and a tick that could
   * not see it would be drawn in the groove's colour on top of the accent — the
   * one place a 3px dot disappears entirely.
   */
  const [ownValue, setOwnValue] = React.useState<number | readonly number[] | undefined>(
    defaultValue
  );
  const current = value ?? ownValue;
  const filled = React.useMemo(() => {
    const numbers = Array.isArray(current) ? current : current === undefined ? [] : [current];

    if (numbers.length === 0) {
      return null;
    }

    // A single value fills from the bottom of the range; a pair fills between
    // them, which is the same sentence with a different floor.
    return numbers.length === 1
      ? { from: min, to: numbers[0] }
      : { from: Math.min(...numbers), to: Math.max(...numbers) };
  }, [current, min]);

  /* Along the track, from its start. The percentage is the same number Base UI
     positions the thumb with, which is what keeps a tick under the handle that
     stopped on it. */
  const offsetOf = (at: number) => `${((at - min) / (max - min)) * 100}%`;

  return (
    <Slider.Root
      ref={ref}
      value={value as number | number[] | undefined}
      defaultValue={defaultValue as number | number[] | undefined}
      onValueChange={(next) => {
        // Only when nobody else is holding it. A slider reports every pointer
        // move, and a controlled one would be paying for a second state update
        // per frame that nothing reads.
        if (value === undefined) {
          setOwnValue(next);
        }

        onValueChange?.(next);
      }}
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
        disabled ? 'cursor-default' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
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

          {/* On the track and under the handle, which is where MD3 draws them.
              `aria-hidden` throughout: the ticks are a picture of `step`, and a
              screen reader is already told the step by the range attributes on
              the thumb. Announcing fifty dots would be reading the ruler out. */}
          {ticks.map((mark) => {
            const over = filled !== null && mark.value >= filled.from && mark.value <= filled.to;

            return (
              <span
                key={`tick:${mark.value}`}
                aria-hidden="true"
                className={[
                  'mp-slider__tick pointer-events-none absolute rounded-full',
                  TICK[size],
                  disabled
                    ? 'bg-mp-on-surface/38'
                    : over
                      ? 'bg-(--_mp-on-accent)'
                      : 'bg-mp-on-surface-variant'
                ].join(' ')}
                style={
                  vertical
                    ? {
                        bottom: offsetOf(mark.value),
                        insetInlineStart: '50%',
                        transform: 'translate(-50%, 50%)'
                      }
                    : {
                        insetInlineStart: offsetOf(mark.value),
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }
                }
              />
            );
          })}

          {Array.from({ length: thumbCount }, (_, index) => (
            <Slider.Thumb
              key={index}
              index={index}
              // On the thumb rather than on the control: the thumb is what
              // carries `role="slider"`, so it is the only element a name means
              // anything on. A visible `label` names them through Base UI
              // instead, which is why this is the fallback rather than the rule.
              aria-label={hasContent(label) ? undefined : ariaLabel}
              /*
               * The thumb carries `role="slider"`, so it is the only element a
               * description means anything on. Drawn under the track it was a
               * paragraph nobody was pointed at — read out only by somebody
               * already walking the page in order, and never at the moment they
               * are actually on the control it is about.
               */
              aria-describedby={hasContent(description) ? describedById : undefined}
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

      {/* The labels, out of the track's flow entirely: they are longer than the
          ticks they belong to and a track that had to be as tall as its own
          captions would stop being 4dp. `relative` on the strip is what the
          percentages below are measured against. */}
      {ticks.some((mark) => hasContent(mark.label)) ? (
        <div
          aria-hidden="true"
          className={[
            'mp-slider__marks relative',
            META_TEXT,
            vertical ? 'h-full' : 'w-full',
            disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
          ].join(' ')}
          style={vertical ? undefined : { height: '1lh' }}
        >
          {ticks.map((mark) =>
            hasContent(mark.label) ? (
              <span
                key={`label:${mark.value}`}
                className="absolute whitespace-nowrap"
                style={
                  vertical
                    ? { bottom: offsetOf(mark.value), transform: 'translateY(50%)' }
                    : { insetInlineStart: offsetOf(mark.value), transform: 'translateX(-50%)' }
                }
              >
                {mark.label}
              </span>
            ) : null
          )}
        </div>
      ) : null}

      {hasContent(description) ? (
        <div
          id={describedById}
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
