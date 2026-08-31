import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { OTPField } from '@base-ui/react/otp-field';
import { MPSupportingText } from '../../internal/SupportingText';
import { META_TEXT, STACK_GAP, hasContent } from '../../internal/scale';
import { useMPSize } from '../../internal/config';
import type { MPSize, MPStyleProps } from '../../types';

/**
 * What may be typed into a slot.
 *
 * `numeric` is the default because that is what a texted code is, and it is also
 * what puts a number pad in front of a phone. `any` accepts whatever the keyboard
 * produces — for a licence key with punctuation in it.
 */
export type MPOtpFieldCharset = 'numeric' | 'alpha' | 'alphanumeric' | 'any';

/** How many slots a code may have. Two is the shortest thing worth splitting. */
const MIN_LENGTH = 2;
const MAX_LENGTH = 12;

export interface MPOtpFieldProps extends MPStyleProps {
  /**
   * How many characters the code has. Clamped to 2–12: a single box is an
   * `MPTextField`, and past twelve the row stops fitting a phone.
   * @default 6
   */
  length?: number;
  /**
   * What may be typed. Anything rejected is dropped rather than shown, and
   * `onValueInvalid` reports it.
   * @default 'numeric'
   */
  charset?: MPOtpFieldCharset;
  /** Hides the characters, the way a password field does. @default false */
  mask?: boolean;
  /**
   * Splits the row every `groupSize` slots with a separator. `3` on a six-digit
   * code gives the familiar two blocks of three.
   */
  groupSize?: number;
  /** What is drawn between two groups. @default '–' */
  separator?: React.ReactNode;
  /** The code. Use with `onValueChange` for a controlled field. */
  value?: string;
  /** What it starts as, for an uncontrolled one. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fires once every slot is filled — the moment to verify the code. */
  onComplete?: (value: string) => void;
  /** Fires when typed or pasted text held characters the charset rejects. */
  onValueInvalid?: (value: string) => void;
  /** Submits the owning form as soon as the code is complete. @default false */
  autoSubmit?: boolean;
  /**
   * The label above the row.
   *
   * Above it rather than in a notch, which is the one place this control departs
   * from `MPTextField`'s shell. A notched label belongs to *one* outlined box; a
   * code is six of them, and cutting the notch into the first would name the
   * first digit rather than the field.
   */
  label?: React.ReactNode;
  /** The line under the row. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the row. Its presence is also what puts the field into its
   * error state — there is no separate boolean, so there is no way to render a
   * control that is visibly wrong with no explanation of why.
   */
  errorMessage?: React.ReactNode;
  /** Name of the form control. */
  name?: string;
  /** The form must have a complete code before it submits. @default false */
  required?: boolean;
  /** Greys every slot out and stops them taking input. */
  disabled?: boolean;
  /** Readable and copyable, but not typeable. @default false */
  readOnly?: boolean;
  /** Puts the caret in the first slot on mount. @default false */
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A slot's box.
 *
 * The height is `CONTROL_HEIGHT`'s, to the pixel, so a code sits at the same
 * height as the fields above and below it in a form. The width is not: a slot
 * holds one character, so it is drawn narrower than it is tall, which is what
 * makes a row of them read as places for one character each rather than as a row
 * of tiny fields.
 */
const SLOT: Record<MPSize, string> = {
  xs: 'h-8 w-7',
  sm: 'h-10 w-9',
  md: 'h-14 w-12',
  lg: 'h-16 w-14',
  xl: 'h-18 w-16'
};

/**
 * And its own type scale, well above the control ladder.
 *
 * A verification code is read out loud off a phone and typed with the other hand;
 * it is the one piece of text in a form that should be larger than the label above
 * it. Every rung is a real MD3 role — the ladder moves *up the type scale* rather
 * than to a size of the library's own invention.
 */
const SLOT_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-large',
  sm: 'text-mp-title-medium',
  md: 'text-mp-title-large',
  lg: 'text-mp-headline-small',
  xl: 'text-mp-headline-medium'
};

/** Between the slots, and a little wider at the rungs where the boxes are. */
const GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
  xl: 'gap-3'
};

/** `charset` is this library's word; Base UI's is `validationType`. */
const VALIDATION: Record<MPOtpFieldCharset, 'numeric' | 'alpha' | 'alphanumeric' | 'none'> = {
  numeric: 'numeric',
  alpha: 'alpha',
  alphanumeric: 'alphanumeric',
  any: 'none'
};

/**
 * A row of one-character slots: a PIN, a texted verification code, an invite key.
 *
 * Base UI owns everything that makes this harder than it looks — one hidden value
 * behind however many inputs, paste spread across the slots from wherever the
 * caret was, backspace stepping back a box, a click landing on the first empty
 * slot rather than the one under the pointer, and the autofill hook that lets a
 * phone offer the code straight from the message.
 *
 * What is here is the box a slot is drawn in, and it is Material's outlined text
 * field cut down to one character: the same `corner-extra-small`, the same
 * hairline in `outline`, the same two-pixel `primary` ring on focus. A form
 * holding a text field and a code should not look like two form kits stacked on
 * each other.
 */
export const MPOtpField = React.forwardRef<HTMLDivElement, MPOtpFieldProps>(function MPOtpField(
  {
    size: sizeProp,
    fullWidth = false,
    length = 6,
    charset = 'numeric',
    mask = false,
    groupSize,
    separator = '–',
    value,
    defaultValue,
    onValueChange,
    onComplete,
    onValueInvalid,
    autoSubmit = false,
    label,
    description,
    errorMessage,
    name,
    required = false,
    disabled = false,
    readOnly = false,
    autoFocus = false,
    className,
    style
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const slots = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(length)));
  const invalid = hasContent(errorMessage);
  const every = groupSize && groupSize > 0 ? Math.round(groupSize) : 0;

  const slotClasses = [
    'rounded-mp-xs border bg-transparent text-center font-[inherit]',
    SLOT[size],
    SLOT_TEXT[size],
    'transition-[border-color,color] duration-(--mp-sys-motion-duration-short4)',
    // `focus` rather than `focus-visible`: a slot is put in focus by clicking it
    // as often as by typing into it, and the ring is the only thing saying which
    // character the next keystroke lands on.
    'focus:border-2 focus:border-mp-primary focus:outline-none',
    // An if/else rather than stacked variants. Two Tailwind classes of equal
    // specificity resolve by their order in the generated stylesheet, not by the
    // order they were written in.
    disabled
      ? 'border-mp-on-surface/12 text-mp-on-surface/38 cursor-default'
      : invalid
        ? 'border-mp-error text-mp-on-surface caret-mp-error hover:border-mp-error'
        : readOnly
          ? 'border-mp-outline-variant text-mp-on-surface cursor-default'
          : 'border-mp-outline text-mp-on-surface caret-mp-primary hover:border-mp-on-surface'
  ].join(' ');

  return (
    <Field.Root
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      className={[
        'mp-otp-field flex-col align-top',
        STACK_GAP[size],
        fullWidth ? 'flex w-full' : 'inline-flex w-fit',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {hasContent(label) ? (
        <Field.Label
          className={`${META_TEXT} text-mp-on-surface-variant data-disabled:text-mp-on-surface/38 data-invalid:text-mp-error`}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </Field.Label>
      ) : null}

      <OTPField.Root
        ref={ref}
        length={slots}
        validationType={VALIDATION[charset]}
        mask={mask}
        name={name}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoSubmit={autoSubmit}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        onValueComplete={(next) => onComplete?.(next)}
        onValueInvalid={(next) => onValueInvalid?.(next)}
        className={`flex items-center ${GAP[size]}`}
      >
        {Array.from({ length: slots }, (_, index) => (
          <React.Fragment key={index}>
            {/*
              `aria-hidden` and a plain span rather than a `role="separator"`: the
              dash is punctuation inside one value, not a break between two things,
              and a reader that announces it once per group is reading out the
              shape of the box instead of the code in it.
            */}
            {every > 0 && index > 0 && index % every === 0 ? (
              <span
                aria-hidden="true"
                className={`text-mp-on-surface-variant px-0.5 select-none ${SLOT_TEXT[size]}`}
              >
                {separator}
              </span>
            ) : null}
            <OTPField.Input className={slotClasses} autoFocus={autoFocus && index === 0} />
          </React.Fragment>
        ))}
      </OTPField.Root>

      <MPSupportingText description={description} errorMessage={errorMessage} />
    </Field.Root>
  );
});
