import * as React from 'react';
import { NumberField } from '@base-ui/react/number-field';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { AddIcon, RemoveIcon } from '../../constants/icons';
import { MPFieldLabel, MPFieldOutline, useFloatingLabel } from '../../internal/FieldOutline';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { NUMBER_FIELD } from '../../internal/messages/number-field';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { CONTROL_ICON, PROSE_TEXT, hasContent } from '../../internal/scale';
import type { MPSize, MPStyleProps } from '../../types';

/**
 * Where the two steppers sit.
 *
 * - `end` — both at the trailing edge, the way a spinner has always looked.
 * - `split` — minus at the start, plus at the end, with the number between them.
 *   For a quantity that is nudged rather than typed.
 * - `none` — no buttons. It is still a number field: the arrow keys, the
 *   clamping and the formatting all stay.
 *
 * There is deliberately no stacked pair of half-height chevrons. At `xs` each
 * arrow would be under three pixels tall, and a target that small is a target
 * nobody hits.
 */
export type MPNumberFieldSteppers = 'end' | 'split' | 'none';

/** The shell's geometry, which is a text field's. See `MPSelect` for the note. */
const SHELL: Record<MPSize, { padding: string; height: string; stepper: string }> = {
  xs: { padding: 'px-2', height: 'h-8', stepper: 'size-6' },
  sm: { padding: 'px-3', height: 'h-10', stepper: 'size-8' },
  md: { padding: 'px-4', height: 'h-14', stepper: 'size-10' },
  lg: { padding: 'px-4', height: 'h-16', stepper: 'size-11' },
  xl: { padding: 'px-5', height: 'h-18', stepper: 'size-12' }
};

export interface MPNumberFieldProps extends MPStyleProps {
  /** The number. Use with `onValueChange` for a controlled field. */
  value?: number | null;
  /** The starting number, for an uncontrolled field. */
  defaultValue?: number;
  /** Called on every change — typing, stepping, the wheel. */
  onValueChange?: (value: number | null) => void;
  /**
   * Called when the value settles: on blur after typing, on pointer release
   * after a press, and together with `onValueChange` for the keyboard.
   */
  onValueCommitted?: (value: number | null) => void;
  /** The bottom of the range. Stepping stops here. */
  min?: number;
  /** The top of the range. */
  max?: number;
  /** How far one step goes. @default 1 */
  step?: number;
  /** The step taken while Shift is held. @default 10 */
  largeStep?: number;
  /** The step taken while Alt is held. @default 0.1 */
  smallStep?: number;
  /**
   * Whether the wheel changes the value while the field is focused and hovered.
   * Off by default: a page that scrolls under the pointer and a field that
   * changes under it are the same gesture, and only one of them was meant.
   * @default false
   */
  allowWheelScrub?: boolean;
  /**
   * How the number is written — currency, percent, decimal places. Passed
   * straight to `Intl.NumberFormat`, so the field can show `$1,240.00` and still
   * report `1240`.
   */
  format?: Intl.NumberFormatOptions;
  /**
   * Which locale the number is written and parsed in. Defaults to the runtime's.
   *
   * A plain BCP 47 string also names the language the two steppers are announced
   * in; anything wider falls back to the nearest `MPLocaleProvider`, then to
   * English.
   */
  locale?: Intl.LocalesArgument;
  /**
   * Where the steppers sit, or `none` for a field without them.
   * @default 'end'
   */
  steppers?: MPNumberFieldSteppers;
  /**
   * The accessible name of the increment button. Defaults to the word for it in
   * `locale`.
   */
  incrementLabel?: string;
  /** The same for the decrement button. */
  decrementLabel?: string;
  /**
   * Label for the field, drawn in the outline's notch and — while the field is
   * empty, unfocused and has nothing standing at its start — resting on the
   * field's own line where a placeholder would be. See `floatingLabel`.
   */
  label?: React.ReactNode;
  /**
   * Whether the label rests on the field's line while there is nothing to make
   * room for, and rises into the notch on focus or on the first digit.
   *
   * `false` pins it in the notch, which is the one thing a floating label costs:
   * a field with a label and one without no longer sit at the same height in a
   * form until both are filled. A `startIcon` — or `steppers="split"`, whose
   * minus sits in the same place — holds the label up regardless.
   * @default true
   */
  floatingLabel?: boolean;
  /** The line under the control. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /** The message under the control, which also turns the field over. */
  errorMessage?: React.ReactNode;
  /**
   * Placeholder shown while the field is empty. With a floating label it is held
   * back until the label has risen out of its way.
   */
  placeholder?: string;
  /** Content placed before the number — a currency mark, a unit, an icon. */
  startIcon?: React.ReactNode;
  /** Marks the field required. */
  required?: boolean;
  /** Greys the field out and stops it taking input. */
  disabled?: boolean;
  /** Shows the number without allowing edits, and drops the steppers. */
  readOnly?: boolean;
  /** Name of the form control. */
  name?: string;
  /** The id put on the control and pointed at by the label. */
  id?: string;
}

/**
 * A Material Design field that only holds a number.
 *
 * The shell is `MPTextField`'s, to the pixel — the same notched outline, the same
 * label in the notch, the same supporting text — because a form where the
 * quantity box is a different height or radius from the boxes around it is a form
 * that looks assembled rather than designed.
 *
 * What is added on top is a real numeric control rather than
 * `<input type="number">`, which is worth being explicit about: the native one
 * silently accepts text in some browsers, has a spinner nobody can style, scrubs
 * on scroll by default, and reports `''` for anything it cannot parse. Base UI's
 * owns the parsing against the locale, the clamping, the press-and-hold repeat on
 * the steppers, and the hidden input that submits with a form.
 */
export function MPNumberField({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min,
  max,
  step,
  largeStep,
  smallStep,
  allowWheelScrub = false,
  format,
  locale,
  steppers = 'end',
  incrementLabel,
  decrementLabel,
  label,
  floatingLabel = true,
  description,
  errorMessage,
  placeholder,
  startIcon,
  size = 'md',
  fullWidth = false,
  required = false,
  disabled = false,
  readOnly = false,
  name,
  id
}: MPNumberFieldProps) {
  /*
   * The steppers' names come from the same `locale` the number does.
   *
   * One prop rather than two, because two would be a caller having to say the
   * same tag twice — and the second one is the one they would forget. It is
   * `Intl.LocalesArgument` here, which is wider than a BCP 47 string, so only a
   * plain string is handed to the table; anything else falls through to the
   * provider, which is what a component with no `locale` at all does.
   */
  const messages = useMPMessages(
    NUMBER_FIELD,
    useMPLocale(typeof locale === 'string' ? locale : undefined)
  );
  const invalid = hasContent(errorMessage);
  const scale = SHELL[size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  // A read-only field keeps its value and loses the buttons: leaving them there
  // disabled is two ways of saying the same thing, and the disabled one is the
  // one that looks broken.
  const showSteppers = steppers !== 'none' && !readOnly && !disabled;

  /*
   * A copy of the number, read only to answer "is there anything in here".
   *
   * The value itself stays Base UI's, so an uncontrolled field is still
   * uncontrolled. A half-typed `-` or `1.` parses to `null` and would drop the
   * label mid-keystroke, except that the field is focused while that is being
   * typed and focus holds the label up on its own.
   */
  const [entered, setEntered] = React.useState<number | null>(defaultValue ?? null);
  const current = value === undefined ? entered : value;
  const { shrunk, focusProps } = useFloatingLabel({
    floating: floatingLabel && hasContent(label),
    filled: current !== null,
    pinned: !!startIcon || (showSteppers && steppers === 'split')
  });

  const stepperClasses = [
    'mp-number-field__stepper group relative flex shrink-0 items-center justify-center',
    'rounded-mp-full cursor-pointer appearance-none bg-transparent p-0 font-[inherit]',
    'text-mp-on-surface-variant outline-none',
    'disabled:text-mp-on-surface/38 disabled:cursor-default',
    scale.stepper
  ].join(' ');

  const decrement = (
    <NumberField.Decrement
      aria-label={decrementLabel ?? messages.decrease}
      className={stepperClasses}
    >
      <MPStateLayer />
      <MPIcon icon={RemoveIcon} size={CONTROL_ICON[size]} />
    </NumberField.Decrement>
  );

  const increment = (
    <NumberField.Increment
      aria-label={incrementLabel ?? messages.increase}
      className={stepperClasses}
    >
      <MPStateLayer />
      <MPIcon icon={AddIcon} size={CONTROL_ICON[size]} />
    </NumberField.Increment>
  );

  return (
    <Field.Root
      className={[
        'mp-number-field group flex-col align-top',
        fullWidth ? 'flex w-full' : 'inline-flex w-fit'
      ].join(' ')}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      {...focusProps}
    >
      {/* `contents` so the group below is laid out by the shell rather than by a
          box of its own — the Root is a grouping element, not an element. */}
      <NumberField.Root
        id={fieldId}
        name={name}
        className="contents"
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setEntered(next);
          onValueChange?.(next);
        }}
        onValueCommitted={(next) => onValueCommitted?.(next)}
        min={min}
        max={max}
        step={step}
        largeStep={largeStep}
        smallStep={smallStep}
        allowWheelScrub={allowWheelScrub}
        format={format}
        locale={locale}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
      >
        <div className="relative w-full">
          <NumberField.Group
            className={[
              'flex w-full items-center gap-2',
              scale.height,
              // The steppers bring their own hit area; stacking the shell's
              // padding on top of it would leave the buttons floating in a gap.
              // The shell keeps its padding on whichever side has no button.
              showSteppers && steppers === 'end'
                ? `${scale.padding} pe-1`
                : showSteppers && steppers === 'split'
                  ? 'px-1'
                  : scale.padding
            ].join(' ')}
          >
            {showSteppers && steppers === 'split' ? decrement : null}

            {startIcon ? (
              <span
                className={[
                  'flex shrink-0 items-center',
                  disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
                ].join(' ')}
              >
                {startIcon}
              </span>
            ) : null}

            <NumberField.Input
              // Withheld while a floating label is resting in the same place.
              placeholder={shrunk ? placeholder : undefined}
              className={[
                'w-full min-w-0 flex-1 tabular-nums',
                PROSE_TEXT[size],
                // A native control does not inherit the page's font, and with no
                // reset on the page nothing else will hand it one.
                'font-[family-name:var(--mp-sys-typescale-body-large-font)]',
                'appearance-none border-0 bg-transparent px-0 outline-none',
                'caret-mp-primary text-mp-on-surface',
                'placeholder:text-mp-on-surface-variant',
                'disabled:text-mp-on-surface/38 disabled:placeholder:text-mp-on-surface/38',
                // Split steppers put the number between the two buttons, so it
                // belongs in the middle rather than against an edge.
                showSteppers && steppers === 'split' ? 'text-center' : ''
              ]
                .filter(Boolean)
                .join(' ')}
            />

            {showSteppers && steppers === 'end' ? (
              <span className="flex shrink-0 items-center">
                {decrement}
                {increment}
              </span>
            ) : null}
            {showSteppers && steppers === 'split' ? increment : null}
          </NumberField.Group>

          <MPFieldOutline label={label} required={required} notched={shrunk} />

          {hasContent(label) ? (
            <MPFieldLabel
              size={size}
              label={label}
              required={required}
              htmlFor={fieldId}
              shrunk={shrunk}
            />
          ) : null}
        </div>
      </NumberField.Root>

      <MPSupportingText
        description={description}
        errorMessage={errorMessage}
        className={scale.padding}
      />
    </Field.Root>
  );
}
