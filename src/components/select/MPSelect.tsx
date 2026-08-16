import * as React from 'react';
import { Select } from '@base-ui/react/select';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, ChevronDownIcon } from '../../constants/icons';
import { MPFieldLabel, MPFieldOutline, useFloatingLabel } from '../../internal/FieldOutline';
import { MPSupportingText } from '../../internal/SupportingText';
import { CONTROL_ICON, PROSE_TEXT, hasContent } from '../../internal/scale';
import type { MPSize, MPStyleProps } from '../../types';

/**
 * What a select's value may be.
 *
 * Deliberately not generic over arbitrary objects. A select is a form control,
 * its value is what a form submits, and every escape from that — object values,
 * a custom equality, a stringifier for the trigger — buys flexibility by making
 * the common case harder to write. Keep the identifier here and look the object
 * up on the other side.
 */
export type MPSelectValue = string | number;

export interface MPSelectOption {
  /** Submitted, and what `value` and `onValueChange` speak in. */
  value: MPSelectValue;
  /** Shown in the list and in the trigger. Defaults to the value itself. */
  label?: React.ReactNode;
  /** Unavailable, but still listed — the option exists, it just cannot be taken. */
  disabled?: boolean;
}

/**
 * The trigger's own geometry, which is a text field's to the pixel.
 *
 * The same table `MPTextField` keeps, minus the parts a control with no caret has
 * no use for. It is duplicated rather than shared because the two tables answer
 * different questions: a text field's height is its type scale plus padding
 * *because a textarea has to be able to grow past it*, and a trigger's is fixed.
 * They agree today by construction, and the size test is what keeps them
 * agreeing.
 */
const TRIGGER: Record<MPSize, { padding: string; height: string }> = {
  xs: { padding: 'px-2', height: 'h-8' },
  sm: { padding: 'px-3', height: 'h-10' },
  md: { padding: 'px-4', height: 'h-14' },
  lg: { padding: 'px-4', height: 'h-16' },
  xl: { padding: 'px-5', height: 'h-18' }
};

export interface MPSelectProps extends MPStyleProps {
  /**
   * The options, as data. There is no `<MPSelect.Option>` to compose: what a
   * caller has is almost always an array already, and the list has to be
   * available to the trigger before the popup has ever been opened — otherwise
   * a closed select can only show its raw value.
   */
  items: readonly MPSelectOption[];
  /** The chosen value. Use with `onValueChange` for a controlled select. */
  value?: MPSelectValue | null;
  /** The value chosen at the start, for an uncontrolled select. */
  defaultValue?: MPSelectValue | null;
  /** Called with the newly chosen value — a value, not an event. */
  onValueChange?: (value: MPSelectValue | null) => void;
  /**
   * Shown in the trigger while nothing is chosen.
   *
   * With a floating label it is held back until the label has risen out of its
   * way, which is the moment the select is focused or opened. Two greyed strings
   * in one box is not a hint, it is a collision.
   */
  placeholder?: React.ReactNode;
  /**
   * Label for the select, drawn in the outline's notch and — while nothing is
   * chosen, the popup is shut and there is no `startIcon` — resting on the
   * trigger's own line where the placeholder would be. See `floatingLabel`.
   */
  label?: React.ReactNode;
  /**
   * Whether the label rests on the trigger's line while there is nothing to make
   * room for, and rises into the notch on focus or on the first choice.
   *
   * `false` pins it in the notch, which is the one thing a floating label costs:
   * a select with a label and one without no longer sit at the same height in a
   * form until both are answered. A `startIcon` holds the label up regardless —
   * the icon is already standing where the resting label would be.
   * @default true
   */
  floatingLabel?: boolean;
  /** The line under the control. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the control. Its presence is also what puts the select
   * into its error state.
   */
  errorMessage?: React.ReactNode;
  /** Content placed before the value — an `MPIcon`, usually. */
  startIcon?: React.ReactNode;
  /** Marks the select required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the select out and stops it opening. */
  disabled?: boolean;
  /** Shows the value without allowing it to be changed, and stays focusable. */
  readOnly?: boolean;
  /** Name of the form control. */
  name?: string;
  /**
   * The id put on the trigger and pointed at by the label. Generated when it is
   * left out.
   */
  id?: string;
}

/**
 * A Material Design select.
 *
 * The trigger is `MPTextField`'s shell wearing a chevron, and that is the point:
 * a form where the dropdown is a different height, radius or outline weight from
 * the fields around it is a form that looks assembled rather than designed. The
 * notched outline, the label in the notch and the supporting text underneath are
 * the same components the field uses.
 *
 * The popup is `surface-container` at elevation 2 — the one surface in this
 * library that genuinely floats, and the only one that carries a shadow by
 * default. A chosen row is marked with a tick rather than only with a highlight,
 * because a highlight is also what the keyboard's cursor looks like, and a list
 * where "selected" and "where the arrow keys are" are the same colour is a list
 * you cannot read.
 *
 * Base UI owns everything hard here: positioning and flipping the popup, the
 * focus trap, typeahead, and the hidden input that makes the whole thing submit
 * with a form.
 */
export const MPSelect = React.forwardRef<HTMLButtonElement, MPSelectProps>(function MPSelect(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    label,
    floatingLabel = true,
    description,
    errorMessage,
    startIcon,
    size = 'md',
    fullWidth = false,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id
  },
  ref
) {
  const invalid = hasContent(errorMessage);
  const scale = TRIGGER[size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  /*
   * Two states the select did not need until the label started moving.
   *
   * `chosen` is only ever read to answer "is there anything in here" — the value
   * itself stays Base UI's, so an uncontrolled select is still uncontrolled and
   * this is a copy rather than a second source of truth. `open` is here because
   * Base UI moves focus into the popup, so the trigger blurs the instant the
   * list appears and the label would fall back down over a select that is
   * plainly being answered.
   */
  const [chosen, setChosen] = React.useState<MPSelectValue | null>(defaultValue ?? null);
  const [open, setOpen] = React.useState(false);
  const current = value === undefined ? chosen : value;
  const { shrunk, focusProps } = useFloatingLabel({
    floating: floatingLabel && hasContent(label),
    filled: current !== null && current !== '',
    pinned: open || !!startIcon
  });

  // Base UI reads this to render the chosen option's *label* in the trigger
  // rather than its raw value, which is the only way a closed select can say
  // "Seoul" for `value="kr-11"` before the popup has ever been mounted.
  const baseItems = React.useMemo(
    () => items.map((item) => ({ label: item.label ?? String(item.value), value: item.value })),
    [items]
  );

  return (
    <Field.Root
      className={[
        'mp-select group flex-col align-top',
        fullWidth ? 'flex w-full' : 'inline-flex w-fit'
      ].join(' ')}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      {...focusProps}
    >
      <Select.Root
        id={fieldId}
        name={name}
        items={baseItems}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setChosen((next ?? null) as MPSelectValue | null);
          onValueChange?.((next ?? null) as MPSelectValue | null);
        }}
        onOpenChange={setOpen}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
      >
        {/*
         * The shell. `relative` so the outline can fill it and the label can sit
         * on its top edge; the `group` stays on the Field above, which is where
         * the validity and disabled attributes the outline reads actually live.
         */}
        <div className="relative w-full">
          <Select.Trigger
            ref={ref}
            className={[
              'relative flex w-full items-center gap-2 select-none',
              'appearance-none bg-transparent font-[inherit] outline-none',
              scale.padding,
              scale.height,
              PROSE_TEXT[size],
              disabled
                ? 'text-mp-on-surface/38 cursor-default'
                : `text-mp-on-surface ${readOnly ? 'cursor-default' : 'cursor-pointer'}`
            ].join(' ')}
          >
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

            <Select.Value
              className={[
                'min-w-0 flex-1 truncate text-start',
                // The placeholder is muted the same way a text field's is, so an
                // empty select and an empty field read as equally empty.
                'data-placeholder:text-mp-on-surface-variant',
                disabled ? 'data-placeholder:text-mp-on-surface/38' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              // Withheld while a floating label is resting in the same place.
              placeholder={shrunk ? placeholder : undefined}
            />

            <Select.Icon
              className={[
                'flex shrink-0 items-center',
                // The chevron is the one thing here that may turn: it is a glyph
                // rather than a label, so nothing about it is resampled.
                'transition-transform duration-(--mp-sys-motion-duration-short4)',
                'data-popup-open:rotate-180',
                disabled ? 'text-mp-on-surface/38' : 'text-mp-on-surface-variant'
              ].join(' ')}
            >
              <MPIcon icon={ChevronDownIcon} size={CONTROL_ICON[size]} />
            </Select.Icon>
          </Select.Trigger>

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

        <Select.Portal>
          <Select.Positioner
            className="z-50 outline-none"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <Select.Popup
              className={[
                'mp-select__popup rounded-mp-xs shadow-mp-2 bg-mp-surface-container p-2',
                'text-mp-on-surface min-w-[var(--anchor-width)] outline-none',
                PROSE_TEXT[size]
              ].join(' ')}
            >
              <Select.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain">
                {items.map((item) => (
                  <Select.Item
                    key={String(item.value)}
                    value={item.value}
                    disabled={item.disabled}
                    className={[
                      'mp-select__item group rounded-mp-xs relative flex cursor-pointer items-center',
                      'gap-3 py-2 pe-3 ps-2 select-none outline-none',
                      // `data-highlighted` rather than `:hover`: it is also where
                      // the arrow keys are, so the mouse and the keyboard light
                      // the same row.
                      'data-highlighted:bg-mp-on-surface/8',
                      'data-selected:text-mp-on-secondary-container',
                      'data-selected:bg-mp-secondary-container',
                      'data-disabled:text-mp-on-surface/38 data-disabled:cursor-default'
                    ].join(' ')}
                  >
                    {/* The box is always there and only the tick comes and goes:
                        an indicator that is not rendered at all takes its column
                        with it, and every label in the list shifts sideways as
                        the selection moves down it. */}
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <Select.ItemIndicator>
                        <MPIcon icon={CheckIcon} size={18} />
                      </Select.ItemIndicator>
                    </span>
                    <Select.ItemText className="min-w-0 flex-1 truncate">
                      {item.label ?? String(item.value)}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>

      <MPSupportingText
        description={description}
        errorMessage={errorMessage}
        className={scale.padding}
      />
    </Field.Root>
  );
});
