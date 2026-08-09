import * as React from 'react';
import { Switch } from '@base-ui/react/switch';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, CloseIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { PROSE_TEXT, hasContent } from '../../internal/scale';
import type { MPColor, MPSize } from '../../types';

/** Which side of the track the label sits on. */
export type MPSwitchLabelPlacement = 'start' | 'end';

/**
 * The track, the thumb, and where the thumb stops.
 *
 * MD3's own switch is a 52×32 track holding a 16dp thumb that grows to 24dp once
 * it is on, and that growth is the whole trick: the control says "off" with a
 * small dot adrift in a wide groove and "on" with a large one filling the end of
 * it, so the state survives being read at a glance, in greyscale, from the far
 * side of a settings page.
 *
 * The numbers per rung are not independent. The thumb is centred vertically, so
 * its inset is `(height − thumb) / 2`; `left` at rest is that inset, and `left`
 * once on is `width − inset − thumb`. Only the two diameters are chosen — the
 * rest is arithmetic, done here rather than in CSS because a `calc()` chain four
 * deep is not more readable than its result.
 *
 * ## Why the edge is a ring rather than a border
 *
 * An unselected track carries a 2dp outline and a selected one does not, and a
 * `border` that comes and goes changes the box the thumb is positioned inside —
 * so the thumb would jump two pixels at the moment it is already moving. An inset
 * ring is drawn as a shadow: it appears and disappears without ever being part of
 * the layout.
 */
const TRACK: Record<MPSize, { track: string; thumb: string; halo: string; glyph: number }> = {
  xs: {
    track: 'h-5 w-8',
    thumb: 'left-[5px] size-2.5 data-checked:left-[15px] data-checked:size-3.5',
    halo: 'size-8',
    glyph: 8
  },
  sm: {
    track: 'h-6 w-10',
    thumb: 'left-1.5 size-3 data-checked:left-[19px] data-checked:size-[18px]',
    halo: 'size-9',
    glyph: 10
  },
  md: {
    track: 'h-8 w-13',
    thumb: 'left-2 size-4 data-checked:left-6 data-checked:size-6',
    halo: 'size-10',
    glyph: 14
  },
  lg: {
    track: 'h-9 w-15',
    thumb: 'left-[9px] size-[18px] data-checked:left-7 data-checked:size-7',
    halo: 'size-11',
    glyph: 16
  },
  xl: {
    track: 'h-10 w-17',
    thumb: 'left-2.5 size-5 data-checked:left-[33px] data-checked:size-[30px]',
    halo: 'size-12',
    glyph: 18
  }
};

export interface MPSwitchProps {
  /** Whether the switch is on. Use with `onCheckedChange` for a controlled one. */
  checked?: boolean;
  /** Whether it starts on, for an uncontrolled one. */
  defaultChecked?: boolean;
  /** Called with the new state — a boolean, not an event. */
  onCheckedChange?: (checked: boolean) => void;
  /** The text beside the track, wired to it by Base UI's Field. */
  label?: React.ReactNode;
  /** The line under the label. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /** The message under the label, which also turns the switch over. */
  errorMessage?: React.ReactNode;
  /**
   * Draws a tick in the thumb when it is on and a cross when it is off.
   *
   * Off by default, and worth turning on wherever the two states are not
   * obviously different in context: the thumb's position and the track's colour
   * are otherwise the only signals, and one of those is a hue.
   * @default false
   */
  icons?: boolean;
  /**
   * Which side the label sits on. `end` reads as a caption for the control;
   * `start` is for a settings list, where the labels form a column and every
   * switch lines up on the right.
   * @default 'end'
   */
  labelPlacement?: MPSwitchLabelPlacement;
  /**
   * The track's size and the label's type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the track takes when it is on.
   * @default 'primary'
   */
  color?: MPColor;
  /** Marks the switch required. */
  required?: boolean;
  /** Greys the switch out and stops it taking input. */
  disabled?: boolean;
  /** Shows the state without allowing it to be changed. */
  readOnly?: boolean;
  /** Name of the form control. */
  name?: string;
  /**
   * The id put on the control and pointed at by the label. Derived from `name`
   * when omitted, and generated when there is no name either.
   */
  id?: string;
  /**
   * Stretches the row, so a `start` label takes the slack and the track sits
   * against the far edge. This is what makes a column of settings line up.
   */
  fullWidth?: boolean;
}

/**
 * A Material Design switch.
 *
 * The difference from a checkbox is not visual, it is temporal: a checkbox is a
 * value that gets submitted with a form, a switch takes effect the moment it
 * moves. If there is a Save button underneath, it should have been a checkbox.
 *
 * The thumb is the one thing in this library that actually travels, so this is
 * also the only place the spec's `standard` easing is read — quick to leave, slow
 * to arrive, which is what makes a 200ms move read as something being pushed
 * rather than as something being teleported and then apologised for.
 */
export const MPSwitch = React.forwardRef<HTMLElement, MPSwitchProps>(function MPSwitch(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    label,
    description,
    errorMessage,
    icons = false,
    labelPlacement = 'end',
    size = 'md',
    color = 'primary',
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id,
    fullWidth = false
  },
  ref
) {
  const invalid = hasContent(errorMessage);
  const family: MPColor = invalid ? 'error' : color;
  const scale = TRACK[size];
  const generatedId = React.useId();
  const fieldId = id ?? `mp-switch-${name ?? generatedId}`;

  const track = (
    <span className="flex h-[1lh] shrink-0 items-center">
      <Switch.Root
        ref={ref}
        id={fieldId}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onCheckedChange={(next) => onCheckedChange?.(next)}
        className={[
          // `group` here rather than on the row, so the halo follows the track's
          // own hover and focus rather than the label's.
          'mp-switch__track group relative box-border inline-flex shrink-0 p-0',
          // A pill, and one of the few places in this library that is right: a
          // switch is not a sheet with its corners cut off, it is a groove
          // something runs along, and a groove with corners is one the thumb
          // would have to climb out of.
          'rounded-mp-full appearance-none font-[inherit] outline-none',
          'transition-[background-color,box-shadow]',
          'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
          scale.track,
          disabled
            ? [
                'bg-mp-surface-container-highest inset-ring-2 inset-ring-mp-on-surface/12',
                'cursor-default',
                'data-checked:bg-mp-on-surface/12 data-checked:inset-ring-0'
              ].join(' ')
            : [
                readOnly ? 'cursor-default' : 'cursor-pointer',
                // Off: a filled groove with a visible edge, which is what stops
                // an unchecked switch reading as an empty outline.
                'bg-mp-surface-container-highest inset-ring-2',
                invalid ? 'inset-ring-mp-error' : 'inset-ring-mp-outline',
                'data-checked:inset-ring-0 data-checked:bg-(--_mp-accent)'
              ].join(' ')
        ].join(' ')}
      >
        <Switch.Thumb
          className={[
            'mp-switch__thumb absolute top-1/2 flex -translate-y-1/2 items-center justify-center',
            'rounded-full',
            'transition-[left,width,height,background-color]',
            'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
            scale.thumb,
            disabled
              ? 'bg-mp-on-surface/38 data-checked:bg-mp-surface-container-highest'
              : [
                  // Off: the thumb is the outline colour, so it reads as part of
                  // the groove it is sitting in. On: it is the ink of the accent
                  // it is now sitting on.
                  invalid ? 'bg-mp-error' : 'bg-mp-outline',
                  'data-checked:bg-(--_mp-on-accent)'
                ].join(' ')
          ].join(' ')}
        >
          {disabled ? null : (
            // Inside the thumb rather than on the track, so it travels with the
            // thing that is being pressed instead of hanging over the groove.
            <MPStateLayer
              layer={[
                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                scale.halo,
                'bg-mp-on-surface group-data-checked:bg-(--_mp-accent)'
              ].join(' ')}
            />
          )}

          {icons ? (
            <>
              {/*
               * Both glyphs are rendered and one is hidden, rather than one
               * being chosen in JavaScript: an uncontrolled switch's state lives
               * in the DOM, so a prop-driven choice would show the wrong glyph
               * from the first click onwards.
               *
               * The `display` toggle goes on the wrapper rather than on the
               * glyph. `MPIcon` is `inline-flex`, and both that and `hidden` are
               * display utilities — so they resolve by their order in the
               * generated stylesheet, where `inline-flex` sorts after `hidden`
               * and quietly wins. A wrapper has no display class of its own to
               * lose to.
               */}
              <span
                className={[
                  'hidden items-center group-data-checked:flex',
                  disabled ? 'text-mp-surface-container-highest' : 'text-(--_mp-accent)'
                ].join(' ')}
              >
                <MPIcon icon={CheckIcon} size={scale.glyph} strokeWidth={3} />
              </span>
              <span className="text-mp-surface-container-highest flex items-center group-data-checked:hidden">
                <MPIcon icon={CloseIcon} size={scale.glyph} strokeWidth={3} />
              </span>
            </>
          ) : null}
        </Switch.Thumb>
      </Switch.Root>
    </span>
  );

  const text =
    hasContent(label) || hasContent(description) || invalid ? (
      <span
        className={[
          'flex min-w-0 flex-col gap-0.5',
          // With the label on the left it has to take the slack, or the track
          // sits against the text instead of against the edge of the row.
          labelPlacement === 'start' ? 'flex-1' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
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

        <MPSupportingText description={description} errorMessage={errorMessage} />
      </span>
    ) : null;

  return (
    <Field.Root
      className={['mp-switch align-top', fullWidth ? 'flex w-full' : 'inline-flex'].join(' ')}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      style={accentSlots(family)}
    >
      <div className={['flex w-full items-start gap-3', PROSE_TEXT[size]].join(' ')}>
        {labelPlacement === 'start' ? (
          <>
            {text}
            {track}
          </>
        ) : (
          <>
            {track}
            {text}
          </>
        )}
      </div>
    </Field.Root>
  );
});
