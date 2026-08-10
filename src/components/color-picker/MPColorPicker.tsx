import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, CloseIcon } from '../../constants/icons';
import { MPFieldLabel, MPFieldOutline } from '../../internal/FieldOutline';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { CONTROL_ICON, META_TEXT, PROSE_TEXT, STACK_GAP, hasContent } from '../../internal/scale';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import {
  CHECKER_BACKGROUND,
  DEFAULT_SWATCHES,
  clamp,
  cssColor,
  formatColor,
  parseColor,
  readableInk
} from '../../internal/color';
import type { MPColorFormat, MPHsv } from '../../internal/color';
import type { MPSize, MPStyleProps } from '../../types';

/** The names for the parts of the picker that have no text on them. */
export interface MPColorPickerLabels {
  /** The saturation/brightness square. */
  area: string;
  /** The hue rail beside it. */
  hue: string;
  /** The opacity rail, when `alpha` is on. */
  alpha: string;
  /** The field the value can be typed into. */
  value: string;
  /** The grid of ready-made colours. */
  swatches: string;
  /** The × that empties the control. */
  clear: string;
  /** What the trigger reads before anything has been chosen. */
  empty: string;
}

/**
 * The English the picker says on its own behalf.
 *
 * Almost nothing in this library writes text a reader sees — a button says what
 * it was handed — but a colour square has nowhere to take a name from, so these
 * six have to be invented. They are collected rather than scattered because they
 * are a *set*: a product in another language does not want six components each
 * defaulting to English and each needing an override of its own.
 */
const DEFAULT_LABELS: MPColorPickerLabels = {
  area: 'Saturation and brightness',
  hue: 'Hue',
  alpha: 'Opacity',
  value: 'Colour value',
  swatches: 'Swatches',
  clear: 'Clear',
  empty: 'No colour'
};

export interface MPColorPickerProps extends MPStyleProps {
  /** The colour, as a CSS string. Pass it to drive the picker yourself. */
  value?: string;
  /** Where an uncontrolled picker starts. @default '#00639b' */
  defaultValue?: string;
  /** Called with the new colour, written in `format`. */
  onValueChange?: (value: string) => void;
  /**
   * Which notation the value is written in on the way out.
   * @default 'hex'
   */
  format?: MPColorFormat;
  /**
   * Offers an opacity rail, and lets the value carry a fourth channel.
   * @default false
   */
  alpha?: boolean;
  /**
   * The ready-made colours under the panel. `false` draws none; an array of CSS
   * colour strings replaces the built-in set.
   */
  swatches?: readonly string[] | false;
  /**
   * Draws the panel in the page instead of in a popup, with no trigger.
   * @default false
   */
  inline?: boolean;
  /**
   * The field under the panel the value can be typed into.
   * @default true
   */
  editable?: boolean;
  /** Label in the outline's notch, or above the panel when `inline`. */
  label?: React.ReactNode;
  /** The line under the control. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the control. Its presence is also what puts the picker into
   * its error state.
   */
  errorMessage?: React.ReactNode;
  /** Marks the control required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the control out and stops it opening. */
  disabled?: boolean;
  /** Shows the colour without allowing it to change, and stays focusable. */
  readOnly?: boolean;
  /** Offers the × that empties the control. @default false */
  clearable?: boolean;
  /** Name of the form control. Submits the value as written in `format`. */
  name?: string;
  /** Whether the popup is open. Use with `onOpenChange` for a controlled popup. */
  open?: boolean;
  /** Whether it starts open. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Overrides for the accessible names, one at a time. */
  labels?: Partial<MPColorPickerLabels>;
  /**
   * The id put on the trigger and pointed at by the label. Derived from `name`
   * when omitted, and generated when there is no name either.
   */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* ---------------------------------------------------------------------------
 * Scale
 * ------------------------------------------------------------------------- */

/**
 * How wide the panel is, and a ladder of its own rather than a step off the
 * control heights.
 *
 * A saturation square is a *space* to aim at, not a row to read: one 56px tall
 * would give the pointer four hundred distinguishable colours out of a possible
 * ten thousand. So this ladder is about how much room the pointer has, which is a
 * different quantity from how tall a control is.
 */
const PANEL_WIDTH: Record<MPSize, string> = {
  xs: 'w-40',
  sm: 'w-44',
  md: 'w-52',
  lg: 'w-60',
  xl: 'w-72'
};

const AREA_HEIGHT: Record<MPSize, string> = {
  xs: 'h-24',
  sm: 'h-28',
  md: 'h-32',
  lg: 'h-40',
  xl: 'h-48'
};

const RAIL_HEIGHT: Record<MPSize, string> = {
  xs: 'h-2.5',
  sm: 'h-3',
  md: 'h-3.5',
  lg: 'h-4',
  xl: 'h-5'
};

const PANEL_GAP: Record<MPSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2.5',
  md: 'gap-3',
  lg: 'gap-3.5',
  xl: 'gap-4'
};

/**
 * The thumb, in pixels rather than on the spacing scale.
 *
 * It is centred on its value with a negative margin rather than a `translate`,
 * which needs the number rather than a class — and a negative margin is also the
 * one centring that survives a caller's own transform on the panel.
 */
const THUMB: Record<MPSize, number> = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 };

/** The trigger's geometry, which is `MPSelect`'s and therefore `MPTextField`'s. */
const TRIGGER: Record<MPSize, { padding: string; height: string }> = {
  xs: { padding: 'px-2', height: 'h-8' },
  sm: { padding: 'px-3', height: 'h-10' },
  md: { padding: 'px-4', height: 'h-14' },
  lg: { padding: 'px-4', height: 'h-16' },
  xl: { padding: 'px-5', height: 'h-18' }
};

/* ---------------------------------------------------------------------------
 * Surfaces
 * ------------------------------------------------------------------------- */

/**
 * The spectrum, drawn rather than sampled.
 *
 * Seven stops at the six primaries plus a repeat of red, which is what makes the
 * rail seamless — the wheel is a circle and a gradient is a line, so the only way
 * for 359° to sit next to 0° is to write red down twice.
 */
const HUE_RAIL =
  'linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)';

/** A hairline round something whose fill is the caller's, not the scheme's. */
const WELL = 'border-mp-outline-variant relative overflow-hidden border';

const THUMB_CLASSES = [
  'pointer-events-none absolute rounded-full border-2 border-white',
  // Two shadows: a dark hairline so the white ring survives on white, and a soft
  // drop so it survives on black. Neither is tinted with the colour under it,
  // which would make the thumb disappear at exactly the moment it matters.
  '[box-shadow:0_0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.4)]'
].join(' ');

/* ---------------------------------------------------------------------------
 * Panel
 * ------------------------------------------------------------------------- */

interface PanelProps {
  hsv: MPHsv;
  alphaValue: number;
  /**
   * One callback for both channels rather than two.
   *
   * A swatch changes the colour *and* the opacity, and two callbacks would mean
   * two updates in one event — the second built from the state the first has only
   * just replaced. That is not a race that shows up under a pointer drag, where
   * only one channel moves; it shows up the first time somebody picks a
   * translucent swatch and gets the old colour at the new opacity.
   */
  onChange: (next: { hsv: MPHsv; alpha: number }) => void;
  text: string;
  onTextChange: (text: string) => void;
  withAlpha: boolean;
  swatches: readonly string[] | false;
  editable: boolean;
  size: MPSize;
  inert: boolean;
  labels: MPColorPickerLabels;
}

/** Where a pointer landed inside an element, as a 0–1 fraction of each axis. */
function fractionsOf(event: React.PointerEvent<HTMLElement>): { x: number; y: number } {
  const rect = event.currentTarget.getBoundingClientRect();

  return {
    x: rect.width === 0 ? 0 : clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: rect.height === 0 ? 0 : clamp((event.clientY - rect.top) / rect.height, 0, 1)
  };
}

/**
 * Arrow keys, in the two step sizes every slider in the library uses.
 *
 * Returns `null` for a key it does not answer to, so the caller can leave the
 * event alone — a picker that swallowed Tab would trap the focus in a gradient.
 */
function arrowStep(event: React.KeyboardEvent): { x: number; y: number } | null {
  const step = event.shiftKey ? 10 : 1;

  switch (event.key) {
    case 'ArrowLeft':
      return { x: -step, y: 0 };
    case 'ArrowRight':
      return { x: step, y: 0 };
    case 'ArrowUp':
      return { x: 0, y: step };
    case 'ArrowDown':
      return { x: 0, y: -step };
    default:
      return null;
  }
}

function ColorPanel({
  hsv,
  alphaValue,
  onChange,
  text,
  onTextChange,
  withAlpha,
  swatches,
  editable,
  size,
  inert,
  labels
}: PanelProps) {
  const thumb = THUMB[size];
  const offset = -thumb / 2;
  const pure = cssColor({ h: hsv.h, s: 100, v: 100 });
  const solid = cssColor(hsv);

  /** Pointer capture on the element itself, so a drag off the panel keeps working. */
  const track = (handler: (event: React.PointerEvent<HTMLElement>) => void) => ({
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (inert) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      handler(event);
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (inert || !event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }

      handler(event);
    }
  });

  const railProps = (label: string, now: number, max: number, onStep: (delta: number) => void) => ({
    role: 'slider' as const,
    tabIndex: inert ? -1 : 0,
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': Math.round(now),
    'aria-orientation': 'horizontal' as const,
    'aria-disabled': inert || undefined,
    onKeyDown: (event: React.KeyboardEvent) => {
      const step = arrowStep(event);

      if (inert || !step || step.x === 0) {
        return;
      }

      event.preventDefault();
      onStep(step.x);
    }
  });

  const ring = [
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-solid outline-none'
  ].join(' ');

  return (
    <div className={`mp-color-picker__panel flex flex-col ${PANEL_WIDTH[size]} ${PANEL_GAP[size]}`}>
      <div
        {...track((event) => {
          const { x, y } = fractionsOf(event);

          onChange({ hsv: { h: hsv.h, s: x * 100, v: (1 - y) * 100 }, alpha: alphaValue });
        })}
        role="slider"
        tabIndex={inert ? -1 : 0}
        aria-label={labels.area}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s)}
        aria-valuetext={`${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`}
        aria-disabled={inert || undefined}
        onKeyDown={(event) => {
          const step = arrowStep(event);

          if (inert || !step) {
            return;
          }

          event.preventDefault();
          onChange({
            hsv: {
              h: hsv.h,
              s: clamp(hsv.s + step.x, 0, 100),
              v: clamp(hsv.v + step.y, 0, 100)
            },
            alpha: alphaValue
          });
        }}
        className={[
          WELL,
          'rounded-mp-sm',
          AREA_HEIGHT[size],
          ring,
          inert ? 'cursor-default' : 'cursor-crosshair touch-none'
        ].join(' ')}
        style={{
          backgroundColor: pure,
          // Black over white: the first image in the list is the one on top, and
          // the brightness ramp has to be above the saturation ramp or the bottom
          // of the square never reaches black.
          backgroundImage:
            'linear-gradient(to top, #000000, rgb(0 0 0 / 0)), linear-gradient(to right, #ffffff, rgb(255 255 255 / 0))'
        }}
      >
        <span
          className={THUMB_CLASSES}
          style={{
            width: thumb,
            height: thumb,
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            marginLeft: offset,
            marginTop: offset,
            backgroundColor: solid
          }}
        />
      </div>

      <div
        {...track((event) =>
          onChange({ hsv: { ...hsv, h: fractionsOf(event).x * 360 }, alpha: alphaValue })
        )}
        {...railProps(labels.hue, hsv.h, 360, (delta) =>
          onChange({ hsv: { ...hsv, h: (hsv.h + delta * 2 + 360) % 360 }, alpha: alphaValue })
        )}
        className={[
          WELL,
          'rounded-mp-full',
          RAIL_HEIGHT[size],
          ring,
          inert ? 'cursor-default' : 'cursor-pointer touch-none'
        ].join(' ')}
        style={{ backgroundImage: HUE_RAIL }}
      >
        <span
          className={THUMB_CLASSES}
          style={{
            width: thumb,
            height: thumb,
            left: `${(hsv.h / 360) * 100}%`,
            top: '50%',
            marginLeft: offset,
            marginTop: offset,
            backgroundColor: pure
          }}
        />
      </div>

      {withAlpha ? (
        <div
          {...track((event) => onChange({ hsv, alpha: fractionsOf(event).x }))}
          {...railProps(labels.alpha, alphaValue * 100, 100, (delta) =>
            onChange({ hsv, alpha: clamp(alphaValue + delta / 100, 0, 1) })
          )}
          className={[
            WELL,
            'rounded-mp-full',
            RAIL_HEIGHT[size],
            ring,
            inert ? 'cursor-default' : 'cursor-pointer touch-none'
          ].join(' ')}
          style={CHECKER_BACKGROUND}
        >
          {/* The ramp is a layer over the chequer rather than another background
              on the same element, because a gradient and a chequer cannot share
              one `background-image` without one of them tiling the other. */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${cssColor(hsv, 0)}, ${solid})`
            }}
          />
          <span
            className={THUMB_CLASSES}
            style={{
              width: thumb,
              height: thumb,
              left: `${alphaValue * 100}%`,
              top: '50%',
              marginLeft: offset,
              marginTop: offset,
              backgroundColor: cssColor(hsv, alphaValue)
            }}
          />
        </div>
      ) : null}

      {editable ? (
        <div className={`flex items-center ${PANEL_GAP[size]}`}>
          <span
            aria-hidden="true"
            className="border-mp-outline-variant shrink-0 rounded-full border"
            style={{ width: thumb + 8, height: thumb + 8, ...CHECKER_BACKGROUND }}
          >
            <span
              className="block size-full rounded-full"
              style={{ backgroundColor: cssColor(hsv, alphaValue) }}
            />
          </span>
          <input
            type="text"
            value={text}
            readOnly={inert}
            spellCheck={false}
            autoComplete="off"
            aria-label={labels.value}
            onChange={(event) => onTextChange(event.target.value)}
            className={[
              'rounded-mp-xs border-mp-outline text-mp-on-surface min-w-0 flex-1 border',
              'bg-transparent px-2 py-1 font-mono lowercase',
              META_TEXT,
              'focus-visible:border-mp-primary outline-none'
            ].join(' ')}
          />
        </div>
      ) : null}

      {swatches && swatches.length > 0 ? (
        <div role="group" aria-label={labels.swatches} className="grid grid-cols-8 gap-1">
          {swatches.map((swatch) => {
            const parsed = parseColor(swatch);
            const chosen =
              parsed !== null &&
              formatColor(parsed.hsv, parsed.alpha, 'hex') === formatColor(hsv, alphaValue, 'hex');

            return (
              <button
                key={swatch}
                type="button"
                disabled={inert}
                aria-label={swatch}
                aria-pressed={chosen}
                onClick={() => {
                  if (parsed) {
                    onChange(parsed);
                  }
                }}
                className={[
                  'border-mp-outline-variant flex aspect-square items-center justify-center',
                  'rounded-full border',
                  ring,
                  inert ? 'cursor-default' : 'hover:shadow-mp-1 cursor-pointer'
                ].join(' ')}
                style={{ backgroundColor: swatch }}
              >
                {/* Black or white, decided by what can actually be read on the
                    swatch — a fixed white tick vanishes on yellow. */}
                {chosen && parsed ? (
                  <span style={{ color: readableInk(parsed.hsv) }}>
                    <MPIcon icon={CheckIcon} size={12} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * The component
 * ------------------------------------------------------------------------- */

/** Where an unparseable value leaves the panel, so the square is never blank. */
const FALLBACK: MPHsv = { h: 202, s: 100, v: 61 };

/**
 * A colour, chosen by eye.
 *
 * A saturation square with a hue rail beside it — the arrangement every design
 * tool has settled on, because it is the one that puts every colour of a hue
 * within a single movement of the pointer. `alpha` adds a third rail, `format`
 * decides which notation comes back out, and `swatches` puts the handful of
 * colours a product actually uses one click away.
 *
 * The trigger is `MPTextField`'s shell wearing a swatch, so a picker in a form is
 * the same object as the fields around it — the same notched outline, the same
 * label in the notch, the same supporting text underneath.
 *
 * ## Why the panel's state is HSV
 *
 * It never leaves that model, which is what keeps the hue rail still while the
 * pointer is in the black corner: through RGB, every shade of black is the same
 * colour and the rail would snap to red the moment the square bottomed out.
 *
 * ## This is not the theme
 *
 * A colour chosen here is *data* — a tag's colour, a calendar's, a project's. It
 * is not `--mp-source-color`, and the picker deliberately does not offer the
 * scheme's four families as swatches: those are roles that mean something, and
 * they move when somebody re-themes the application.
 */
export const MPColorPicker = React.forwardRef<HTMLDivElement, MPColorPickerProps>(
  function MPColorPicker(
    {
      value,
      defaultValue = '#00639b',
      onValueChange,
      format = 'hex',
      alpha = false,
      swatches = DEFAULT_SWATCHES,
      inline = false,
      editable = true,
      label,
      description,
      errorMessage,
      required = false,
      disabled = false,
      readOnly = false,
      clearable = false,
      name,
      open,
      defaultOpen = false,
      onOpenChange,
      labels: labelOverrides,
      size = 'md',
      fullWidth = false,
      id,
      className,
      style
    },
    ref
  ) {
    const labels = React.useMemo<MPColorPickerLabels>(
      () => ({ ...DEFAULT_LABELS, ...labelOverrides }),
      [labelOverrides]
    );

    const invalid = hasContent(errorMessage);
    const scale = TRIGGER[size];
    const generatedId = React.useId();
    const fieldId = id ?? `mp-color-picker-${name ?? generatedId}`;

    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const current = value ?? uncontrolledValue;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isOpen = open ?? uncontrolledOpen;

    /**
     * HSV is the state, and the value is what it is written down as.
     *
     * The other way round — parsing the string on every render — is what makes a
     * picker's hue rail jump: `#000000` has no hue to read back, so dragging into
     * the bottom of the square would reset the rail to red. So the model is kept
     * and the string is derived from it, and an incoming `value` only re-seeds the
     * model when it says something different from what the model already means.
     */
    const [model, setModel] = React.useState(
      () => parseColor(current) ?? { hsv: FALLBACK, alpha: 1 }
    );
    const [text, setText] = React.useState(() => current);

    const written = formatColor(model.hsv, alpha ? model.alpha : 1, format);
    const empty = current === '';

    React.useEffect(() => {
      const parsed = parseColor(current);

      if (!parsed) {
        // Not a colour this understands — `''` after a clear, or something a
        // caller made up. The field shows it and the panel stays where it was.
        setText(current);

        return;
      }

      // Compared as colours rather than as strings. `#FF0000` and `#ff0000` are
      // the same colour written two ways, and a string comparison would re-seed
      // the model from a value it had just produced, on every render, forever.
      if (formatColor(parsed.hsv, alpha ? parsed.alpha : 1, format) === written) {
        return;
      }

      setText(current);
      setModel(parsed);
    }, [current, written, alpha, format]);

    const inert = disabled || readOnly;
    // Whether the × is drawn, decided once: the trigger has to reserve room for
    // it in the same breath, or the value runs underneath it.
    const showClear = clearable && !inert && !empty;

    const commit = (next: { hsv: MPHsv; alpha: number }, typed?: string) => {
      setModel(next);

      const output = formatColor(next.hsv, alpha ? next.alpha : 1, format);

      setText(typed ?? output);

      if (value === undefined) {
        setUncontrolledValue(output);
      }

      onValueChange?.(output);
    };

    const panel = (
      <ColorPanel
        hsv={model.hsv}
        alphaValue={model.alpha}
        onChange={commit}
        text={text}
        onTextChange={(next) => {
          setText(next);

          const parsed = parseColor(next);

          if (parsed) {
            commit(parsed, next);
          }
        }}
        withAlpha={alpha}
        swatches={swatches}
        editable={editable}
        size={size}
        inert={inert}
        labels={labels}
      />
    );

    /** The swatch in the trigger, over a chequer so a translucent value reads. */
    const preview = (
      <span
        aria-hidden="true"
        className="border-mp-outline-variant block size-5 shrink-0 rounded-full border"
        style={CHECKER_BACKGROUND}
      >
        <span
          className="block size-full rounded-full"
          style={{
            backgroundColor: empty ? 'transparent' : cssColor(model.hsv, alpha ? model.alpha : 1)
          }}
        />
      </span>
    );

    const hidden = name ? <input type="hidden" name={name} value={empty ? '' : written} /> : null;

    if (inline) {
      return (
        <div
          ref={ref}
          data-mp-size={size}
          className={['mp-color-picker flex flex-col', STACK_GAP[size], className ?? '']
            .filter(Boolean)
            .join(' ')}
          style={style}
        >
          {hasContent(label) ? (
            <span
              className={[
                META_TEXT,
                disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
              ].join(' ')}
            >
              {label}
              {required ? <span aria-hidden="true"> *</span> : null}
            </span>
          ) : null}

          {panel}

          {hasContent(errorMessage) ? (
            <span className={`${META_TEXT} text-mp-error`}>{errorMessage}</span>
          ) : hasContent(description) ? (
            <span className={`${META_TEXT} text-mp-on-surface-variant`}>{description}</span>
          ) : null}

          {hidden}
        </div>
      );
    }

    return (
      <Field.Root
        ref={ref}
        disabled={disabled}
        invalid={invalid}
        data-mp-size={size}
        className={[
          'mp-color-picker group flex-col align-top',
          fullWidth ? 'flex w-full' : 'inline-flex w-fit',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
      >
        <Popover.Root
          open={isOpen}
          onOpenChange={(next) => {
            if (open === undefined) {
              setUncontrolledOpen(next);
            }

            onOpenChange?.(next);
          }}
        >
          <div className="relative w-full">
            <Popover.Trigger
              id={fieldId}
              disabled={disabled}
              nativeButton
              className={[
                'relative flex w-full items-center gap-2 select-none',
                'appearance-none bg-transparent font-[inherit] outline-none',
                scale.padding,
                // The × is drawn over the trigger rather than inside it — a
                // button inside a button is not a button — so the room for it
                // has to be taken out of the trigger's own end padding.
                showClear ? 'pe-10' : '',
                scale.height,
                PROSE_TEXT[size],
                disabled
                  ? 'text-mp-on-surface/38 cursor-default'
                  : `text-mp-on-surface ${readOnly ? 'cursor-default' : 'cursor-pointer'}`
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {preview}
              <span
                className={[
                  'min-w-0 flex-1 truncate text-start',
                  empty ? 'text-mp-on-surface-variant' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {empty ? labels.empty : written}
              </span>
            </Popover.Trigger>

            {showClear ? (
              // Outside the trigger, because a button inside a button is not a
              // button — the browser drops the inner one and the × stops being
              // reachable by keyboard at all.
              <button
                type="button"
                aria-label={labels.clear}
                onClick={() => {
                  if (value === undefined) {
                    setUncontrolledValue('');
                  }

                  setText('');
                  onValueChange?.('');
                }}
                className={[
                  'group/clear rounded-mp-full text-mp-on-surface-variant absolute inset-y-0',
                  'end-1 my-auto flex size-8 cursor-pointer items-center justify-center',
                  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
                  'focus-visible:outline-solid outline-none'
                ].join(' ')}
              >
                <MPStateLayer className="group-hover/clear:opacity-8 group-focus-visible/clear:opacity-10" />
                <MPIcon icon={CloseIcon} size={CONTROL_ICON[size]} />
              </button>
            ) : null}

            <MPFieldOutline label={label} required={required} />

            {hasContent(label) ? (
              <MPFieldLabel size={size} label={label} required={required} htmlFor={fieldId} />
            ) : null}
          </div>

          <Popover.Portal>
            <Popover.Positioner className={PORTAL_LAYER} sideOffset={4} align="start">
              <Popover.Popup
                className={[
                  'mp-color-picker__popup rounded-mp-md shadow-mp-2 bg-mp-surface-container',
                  'text-mp-on-surface p-3 outline-none',
                  PROSE_TEXT[size],
                  FADE
                ].join(' ')}
              >
                {panel}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <MPSupportingText
          description={description}
          errorMessage={errorMessage}
          className={scale.padding}
        />

        {hidden}
      </Field.Root>
    );
  }
);
