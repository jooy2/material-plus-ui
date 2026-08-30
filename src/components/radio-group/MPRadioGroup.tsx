import * as React from 'react';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Field } from '@base-ui/react/field';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { META_TEXT, PROSE_TEXT, hasContent } from '../../internal/scale';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/**
 * The dot, and the halo around it.
 *
 * MD3 draws a 20dp ring with a 10dp fill inside it — the inner dot is exactly
 * half, which is what makes a selected radio read as a ring *containing*
 * something rather than as a smaller ring. Every rung keeps that ratio.
 *
 * A radio is 20dp where a checkbox is 18dp, and that is the spec's own number
 * rather than a rounding: a circle inscribed in a square looks smaller than the
 * square, so the two have to differ to appear the same size in a column.
 */
const DOT: Record<MPSize, { ring: string; fill: string; halo: string }> = {
  xs: { ring: 'size-4', fill: 'size-2', halo: 'size-8' },
  sm: { ring: 'size-[18px]', fill: 'size-[9px]', halo: 'size-9' },
  md: { ring: 'size-5', fill: 'size-2.5', halo: 'size-10' },
  lg: { ring: 'size-[22px]', fill: 'size-[11px]', halo: 'size-11' },
  xl: { ring: 'size-6', fill: 'size-3', halo: 'size-12' }
};

/**
 * What an option inherits from the set around it.
 *
 * A radio button says nothing on its own — it only means anything relative to its
 * siblings — so the size, the accent family and the read-only state belong to the
 * group rather than to the member. Passing them on every `<MPRadio>` would be
 * four chances to get one of them wrong.
 */
interface MPRadioGroupContextValue {
  size: MPSize;
  readOnly: boolean;
  invalid: boolean;
}

const MPRadioGroupContext = React.createContext<MPRadioGroupContextValue>({
  size: 'md',
  readOnly: false,
  invalid: false
});

export interface MPRadioProps {
  /** What this option is worth. Reported by the group's `onValueChange`. */
  value: string;
  /** The text beside the dot, wired to it by Base UI's Field. */
  label?: React.ReactNode;
  /** The line under the label. */
  description?: React.ReactNode;
  /** Unavailable, but still listed — the option exists, it just cannot be taken. */
  disabled?: boolean;
  /** The id put on the control and pointed at by the label. */
  id?: string;
}

/**
 * One option in an `MPRadioGroup`.
 *
 * It has no `size` and no `color` of its own. Both come from the group, which is
 * the only place they can be set once and mean the same thing for every option.
 */
export const MPRadio = React.forwardRef<HTMLElement, MPRadioProps>(function MPRadio(
  { value, label, description, disabled = false, id },
  ref
) {
  const group = React.useContext(MPRadioGroupContext);
  const dot = DOT[group.size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <Field.Root
      className="mp-radio inline-block align-top"
      disabled={disabled}
      data-mp-value={value}
    >
      <div className={['flex items-start gap-3', PROSE_TEXT[group.size]].join(' ')}>
        {/* `1lh` centres the dot on the first line of the label rather than on
            the whole block, so it stays put when the label wraps. */}
        <span className="flex h-[1lh] shrink-0 items-center">
          <Radio.Root
            ref={ref}
            id={fieldId}
            value={value}
            disabled={disabled}
            className={[
              // The `group` is here rather than on the row: what the halo has to
              // follow is this element's hover and focus.
              'mp-radio__dot group relative inline-flex shrink-0 items-center justify-center',
              // `box-border` explicitly: with no page reset on the page, the 2px
              // ring would otherwise be added outside the 20px circle.
              'box-border rounded-full border-2 p-0',
              'appearance-none bg-transparent font-[inherit] outline-none',
              'transition-[border-color] duration-(--mp-sys-motion-duration-short4)',
              dot.ring,
              disabled
                ? 'border-mp-on-surface/38 cursor-default'
                : [
                    group.readOnly ? 'cursor-default' : 'cursor-pointer',
                    group.invalid ? 'border-mp-error' : 'border-mp-on-surface-variant',
                    // The ring takes the accent when it is chosen; unlike a
                    // checkbox it is never filled, because the fill is the dot.
                    'data-checked:border-(--_mp-accent)'
                  ].join(' ')
            ].join(' ')}
          >
            {disabled ? null : (
              <MPStateLayer
                layer={[
                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  dot.halo,
                  'bg-mp-on-surface',
                  'group-data-checked:bg-(--_mp-accent)'
                ].join(' ')}
              />
            )}

            {/* Unlike the checkbox's mark this one does start at nothing, and
                the difference is what each of them is. A tick is a stroke and
                has to stay legible as it arrives; a dot is a disc, and a disc
                at any size is still a disc — so it can grow out of the centre
                of the ring that is taking the accent around it, which is the
                arrival MD3 draws.

                On the same 200ms as the ring's own border colour, so the two
                halves of "chosen" land together. */}
            <Radio.Indicator
              className={[
                'rounded-full',
                dot.fill,
                'transition-[opacity,scale] duration-(--mp-sys-motion-duration-short4)',
                'ease-mp-standard',
                'data-starting-style:scale-0 data-starting-style:opacity-0',
                'data-ending-style:scale-0 data-ending-style:opacity-0',
                disabled ? 'bg-mp-on-surface/38' : 'bg-(--_mp-accent)'
              ].join(' ')}
            />
          </Radio.Root>
        </span>

        {hasContent(label) || hasContent(description) ? (
          <span className="flex min-w-0 flex-col gap-0.5">
            {hasContent(label) ? (
              <Field.Label
                htmlFor={fieldId}
                className={[
                  'leading-[1.4]',
                  disabled
                    ? 'text-mp-on-surface/38 cursor-default'
                    : group.readOnly
                      ? 'text-mp-on-surface'
                      : 'text-mp-on-surface cursor-pointer'
                ].join(' ')}
              >
                {label}
              </Field.Label>
            ) : null}
            {hasContent(description) ? (
              <Field.Description
                className={`${META_TEXT} text-mp-on-surface-variant data-disabled:text-mp-on-surface/38`}
              >
                {description}
              </Field.Description>
            ) : null}
          </span>
        ) : null}
      </div>
    </Field.Root>
  );
});

export interface MPRadioGroupProps {
  /** The chosen value. Use with `onValueChange` for a controlled group. */
  value?: string | null;
  /** The value chosen at the start, for an uncontrolled group. */
  defaultValue?: string | null;
  /** Called with the newly chosen value — a string, not an event. */
  onValueChange?: (value: string) => void;
  /**
   * The question the options answer. Rendered as the set's own label, which is
   * what a screen reader reads before the first option.
   */
  label?: React.ReactNode;
  /** The line under the label. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the options. Its presence is also what turns the group
   * over into its error state.
   */
  errorMessage?: React.ReactNode;
  /**
   * Which way the options stack. A column is scannable at any length; a row
   * silently stops being readable the moment one label is longer than expected.
   * @default 'vertical'
   */
  orientation?: MPOrientation;
  /**
   * The dots' size and the labels' type scale, for every option at once.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the chosen option is drawn in.
   * @default 'primary'
   */
  color?: MPColor;
  /** Marks the group required. */
  required?: boolean;
  /** Greys every option out and stops the set taking input. */
  disabled?: boolean;
  /** Shows the choice without allowing it to be changed. */
  readOnly?: boolean;
  /** Name of the form control, as on a set of native radios. */
  name?: string;
  /** The `MPRadio`s. */
  children?: React.ReactNode;
}

/**
 * A Material Design radio group: a set of options where exactly one is chosen.
 *
 * Base UI owns the part that makes it a group rather than a `<div>` full of
 * inputs — the set takes **one** tab stop and the arrow keys move within it,
 * which is what the ARIA pattern requires and what hand-rolled radio groups
 * almost always get wrong.
 *
 * The options are children rather than an `items` array, unlike `MPSelect`. The
 * difference is that a radio option is a *block* — it carries a label and a
 * description and is laid out down the page — so what a caller wants to vary is
 * its content, not just its text. A select's options are rows in a popup.
 */
export const MPRadioGroup = React.forwardRef<HTMLDivElement, MPRadioGroupProps>(
  function MPRadioGroup(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      description,
      errorMessage,
      orientation = 'vertical',
      size = 'md',
      color = 'primary',
      required = false,
      disabled = false,
      readOnly = false,
      name,
      children
    },
    ref
  ) {
    const invalid = hasContent(errorMessage);
    const family: MPColor = invalid ? 'error' : color;
    const labelId = React.useId();

    const context = React.useMemo(() => ({ size, readOnly, invalid }), [size, readOnly, invalid]);

    return (
      <MPRadioGroupContext.Provider value={context}>
        <Field.Root
          className="mp-radio-group flex flex-col gap-2"
          disabled={disabled}
          invalid={invalid}
          data-mp-size={size}
          data-mp-orientation={orientation}
          style={accentSlots(family)}
        >
          {/*
           * A sibling element pointed at by `aria-labelledby`, rather than a
           * `<legend>` inside the group. Base UI documents both; this one is the
           * only one that survives `orientation="horizontal"`, where a legend
           * would become a flex item in the row of options and sit beside the
           * first one instead of above it.
           */}
          {hasContent(label) ? (
            <span
              id={labelId}
              className={[
                META_TEXT,
                disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
              ].join(' ')}
            >
              {label}
              {required ? <span aria-hidden="true"> *</span> : null}
            </span>
          ) : null}

          <RadioGroup
            ref={ref}
            aria-labelledby={hasContent(label) ? labelId : undefined}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(next) => onValueChange?.(String(next ?? ''))}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            name={name}
            className={[
              'flex',
              orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-6 gap-y-2' : 'flex-col gap-2'
            ].join(' ')}
          >
            {children}
          </RadioGroup>

          {/*
           * Outside the `RadioGroup` deliberately. Anything inside an element
           * with `role="radiogroup"` that is not a radio is content a screen
           * reader has to walk past to reach the next option.
           */}
          <MPSupportingText description={description} errorMessage={errorMessage} />
        </Field.Root>
      </MPRadioGroupContext.Provider>
    );
  }
);
