import * as React from 'react';
import { Checkbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, RemoveIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { PROSE_TEXT, hasContent } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize } from '../../types';

/**
 * The tick, the glyph in it, and the halo around it.
 *
 * MD3 draws an 18dp box with a 40dp state layer centred on it — the box is what
 * you see and the halo is what you hit, and the gap between those two numbers is
 * deliberate: 18dp is far below any usable pointer target, so the target is the
 * halo. The ladder keeps that relationship rather than those numbers, which is
 * why every halo comes out a little over twice its box.
 *
 * The glyph is smaller than the box it sits in, so the tick never touches the
 * corners — which at a 2px radius it otherwise would.
 */
const TICK: Record<MPSize, { box: string; halo: string; glyph: number }> = {
  xs: { box: 'size-3.5', halo: 'size-8', glyph: 12 },
  sm: { box: 'size-4', halo: 'size-9', glyph: 14 },
  md: { box: 'size-[18px]', halo: 'size-10', glyph: 16 },
  lg: { box: 'size-5', halo: 'size-11', glyph: 18 },
  xl: { box: 'size-[22px]', halo: 'size-12', glyph: 20 }
};

export interface MPCheckboxProps {
  /** Whether the box is ticked. Use with `onCheckedChange` for a controlled box. */
  checked?: boolean;
  /** Whether the box starts ticked, for an uncontrolled one. */
  defaultChecked?: boolean;
  /**
   * Called with the new state. A boolean rather than an event, the same bargain
   * `MPTextField.onChange` makes: what a caller wants is the value.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Neither ticked nor empty — what a parent box shows when some of its children
   * are ticked. Drawn as a dash, and it is a *display* state: clicking a
   * half-ticked box ticks it.
   * @default false
   */
  indeterminate?: boolean;
  /** The text beside the tick, wired to it by Base UI's Field. */
  label?: React.ReactNode;
  /** The line under the label. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the label. Its presence is also what turns the checkbox
   * over into its error state, so there is no way to show one with no
   * explanation.
   */
  errorMessage?: React.ReactNode;
  /**
   * The tick's size and the label's type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the ticked box is filled with.
   * @default 'primary'
   */
  color?: MPColor;
  /** Marks the checkbox required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the checkbox out and stops it taking input. */
  disabled?: boolean;
  /**
   * Shows the state without allowing changes. Unlike `disabled` the box stays in
   * the tab order, which is what a value the reader still has to be able to find
   * needs.
   */
  readOnly?: boolean;
  /** Name of the form control, as on a native checkbox. */
  name?: string;
  /** The value submitted when the box is ticked. */
  value?: string;
  /**
   * The id put on the control and pointed at by the label. Generated when it is
   * left out.
   */
  id?: string;
  /**
   * Added to the outermost element — the box around the tick, its label and its
   * supporting line, rather than to the tick itself.
   */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A Material Design checkbox.
 *
 * The box is `on-surface-variant` at rest and fills with the accent family when
 * it is ticked — which is the one place this library expresses a state by
 * swapping the whole surface rather than washing it, because "on" and "off" are
 * not two strengths of the same thing.
 *
 * `label`, `description` and `errorMessage` are props rather than children for
 * the reason they are on `MPTextField`: the arrangement is fixed, and what a
 * caller decides is what goes in each slot. There is no `children`.
 *
 * Base UI's `Checkbox` is underneath, so the hidden input that submits with a
 * form, the `aria-checked="mixed"` an indeterminate box needs, and the label
 * association all come for free.
 */
export const MPCheckbox = React.forwardRef<HTMLElement, MPCheckboxProps>(function MPCheckbox(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    label,
    description,
    errorMessage,
    size: sizeProp,
    color: colorProp,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    value,
    id,
    className,
    style
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const invalid = hasContent(errorMessage);
  // Invalid re-points the accent family at `error`, so the box, its halo and the
  // message all turn over together rather than the message being the only clue.
  const family: MPColor = invalid ? 'error' : color;
  const tick = TICK[size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <Field.Root
      className={['mp-checkbox inline-block align-top', className ?? ''].filter(Boolean).join(' ')}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      style={{ ...accentSlots(family), ...style }}
    >
      <div className={['flex items-start gap-3', PROSE_TEXT[size]].join(' ')}>
        {/*
         * `1lh` centres the tick on the *first line* of the label rather than on
         * the whole block, so a label that wraps to three lines does not leave
         * the box floating in the middle of them.
         */}
        <span className="flex h-[1lh] shrink-0 items-center">
          <Checkbox.Root
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            checked={checked}
            defaultChecked={defaultChecked}
            indeterminate={indeterminate}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            onCheckedChange={(next) => onCheckedChange?.(next)}
            className={[
              // The `group` is here rather than on the Field, because what the
              // state layer has to follow is this element's hover and focus — a
              // group on the row would light the halo from the description.
              'mp-checkbox__tick group relative inline-flex shrink-0 items-center',
              // `box-border` explicitly: this library ships no page reset, so
              // without it the 2px border is added *outside* the 18px box and the
              // tick comes out 22px — which is the whole ladder off by four.
              //
              // Half `corner-extra-small` rather than a literal 2px, which is the
              // same 2dp the spec asks for and, unlike the literal, follows the
              // token: a tick that stayed square inside a rounded theme would be
              // the one square object on the page.
              'box-border justify-center border-2 p-0',
              'rounded-[calc(var(--mp-sys-shape-corner-extra-small)/2)]',
              // A native button arrives with the browser's own background, border
              // and font, and this library ships no page reset to take them off.
              'appearance-none bg-transparent font-[inherit] outline-none',
              'transition-[background-color,border-color]',
              'duration-(--mp-sys-motion-duration-short4)',
              tick.box,
              disabled
                ? [
                    'border-mp-on-surface/38 cursor-default',
                    'data-checked:bg-mp-on-surface/38 data-checked:border-transparent',
                    'data-indeterminate:bg-mp-on-surface/38 data-indeterminate:border-transparent'
                  ].join(' ')
                : [
                    readOnly ? 'cursor-default' : 'cursor-pointer',
                    invalid ? 'border-mp-error' : 'border-mp-on-surface-variant',
                    // `data-checked` rather than `:checked`: what you see is a
                    // `<button>`, and the real input is hidden beside it.
                    'data-checked:border-transparent data-checked:bg-(--_mp-accent)',
                    'data-checked:text-(--_mp-on-accent)',
                    'data-indeterminate:border-transparent data-indeterminate:bg-(--_mp-accent)',
                    'data-indeterminate:text-(--_mp-on-accent)'
                  ].join(' ')
            ].join(' ')}
          >
            {disabled ? null : (
              <MPStateLayer
                // The halo is bigger than the box it surrounds, so it cannot be
                // an inset: it is centred on the tick and overflows it in every
                // direction. `on-surface` while empty and the accent once ticked
                // — never the ink, which by then is the colour of the tick.
                layer={[
                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  tick.halo,
                  'bg-mp-on-surface',
                  'group-data-checked:bg-(--_mp-accent)',
                  'group-data-indeterminate:bg-(--_mp-accent)'
                ].join(' ')}
              />
            )}

            {/* The mark grows into the box the fill is arriving in, on the same
                200ms the box's own colour takes — so a tick is one event rather
                than a container that eases and a glyph that appears on top of
                it halfway through.

                It is drawn from `scale: 0.6` rather than from nothing, because
                a mark that starts at zero spends its first frames as a smudge
                too small to read as a tick, and the eye reads the arrival as a
                flicker rather than as a stroke.

                Base UI keeps the indicator mounted until this transition has
                finished, which is what gives the mark a way out as well as a
                way in — `data-ending-style` is the same frame played backwards. */}
            <Checkbox.Indicator
              className={[
                'flex items-center justify-center',
                'transition-[opacity,scale] duration-(--mp-sys-motion-duration-short4)',
                'ease-mp-standard',
                'data-starting-style:scale-60 data-starting-style:opacity-0',
                'data-ending-style:scale-60 data-ending-style:opacity-0'
              ].join(' ')}
            >
              <MPIcon
                icon={indeterminate ? RemoveIcon : CheckIcon}
                size={tick.glyph}
                strokeWidth={3}
              />
            </Checkbox.Indicator>
          </Checkbox.Root>
        </span>

        {hasContent(label) || hasContent(description) || invalid ? (
          <span className="flex min-w-0 flex-col gap-0.5">
            {hasContent(label) ? (
              <Field.Label
                htmlFor={fieldId}
                className={[
                  'leading-[1.4]',
                  disabled
                    ? 'text-mp-on-surface/38 cursor-default'
                    : readOnly
                      ? 'text-mp-on-surface'
                      : 'text-mp-on-surface cursor-pointer'
                ].join(' ')}
              >
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
              </Field.Label>
            ) : null}

            {/* Under the label rather than under the tick: the message is about
                the option, and the option is the words. */}
            <MPSupportingText description={description} errorMessage={errorMessage} />
          </span>
        ) : null}
      </div>
    </Field.Root>
  );
});
