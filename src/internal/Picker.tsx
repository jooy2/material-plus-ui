import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { MPIcon } from '../components/icon/MPIcon';
import { CloseIcon } from '../constants/icons';
import { accentSlots } from './accent';
import { MPFieldLabel, MPFieldOutline, useFloatingLabel } from './FieldOutline';
import { MPStateLayer } from './StateLayer';
import { MPSupportingText } from './SupportingText';
import { MPWidthSizer } from './WidthSizer';
import { displaySamples } from './date';
import { CONTROL_ICON, hasContent, PROSE_TEXT } from './scale';
import { FADE, PORTAL_LAYER } from './surface';
import type { MPPickerLabels } from './Calendar';
import type { MPColor, MPControlEventProps, MPSize, MPStyleProps } from '../types';

/**
 * The strings a trigger is held open by, kept across renders that did not
 * change what it could say.
 *
 * `displaySamples` formats two dozen instants and deduplicates them, which is
 * cheap once and not cheap sixty times a second — and sixty times a second is
 * exactly what a range picker asks for, because moving the pointer across the
 * calendar re-renders the whole control to redraw the band.
 *
 * ## Why it is keyed on the format's *contents*
 *
 * Because an options object is nearly always a fresh one. Three of the four
 * pickers build theirs from a default parameter or a literal, so it is a new
 * object on every render by construction; and a caller who writes
 * `format={{ dateStyle: 'full' }}` inline hands over a new object too. Keyed on
 * identity, the memo would miss every single time — which is what it was doing.
 *
 * Serialising instead means the memo holds for as long as the format *says* the
 * same thing, whoever built the object. `internal/date.ts` keys its formatter
 * cache the same way, and inherits the same harmless quirk: two objects whose
 * keys are in a different order read as two formats. That costs one extra miss,
 * never a wrong answer.
 */
export function useDisplaySamples(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): string[] {
  const key = `${locale ?? ''} ${JSON.stringify(options)}`;

  // `key` is the whole of the dependency on purpose: it is what `locale` and
  // `options` amount to, and both are read from the render the key belongs to,
  // so they cannot be stale relative to it.
  return React.useMemo(() => displaySamples(locale, options), [key]);
}

/**
 * The shell all four pickers wear: a field-shaped trigger with a popup hanging
 * off it.
 *
 * It is here rather than in one of the components for the reason the calendar
 * is: four components need it, and none of them should have to import another.
 * What it draws is deliberately not new — the trigger is `MPFieldOutline` and
 * `MPFieldLabel`, which is the same notched shell an `MPTextField`, an
 * `MPSelect` and an `MPColorPicker` are drawn on, to the pixel. A form where the
 * date field is a different height, radius or outline weight from the text field
 * beside it is a form that looks assembled rather than designed.
 *
 * ## The one thing the pickers do not offer
 *
 * Typing a date into the trigger. Parsing a date out of free text is
 * locale-dependent in a way that cannot be done honestly without a date library
 * — `27/7/26` is three different days depending on who is reading it — and a
 * field that understands it in one browser and not the next is worse than one
 * that never claimed to. So the trigger is a button, exactly as a select's is,
 * and the calendar is where the answer comes from.
 */

/**
 * The trigger's own geometry, which is a text field's to the pixel.
 *
 * The same table `MPSelect` keeps, and duplicated for the same reason it is:
 * the two answer different questions — a text field's height is its type scale
 * plus padding *because a textarea has to be able to grow past it*, and a
 * trigger's is fixed — so they agree today by construction and the size test is
 * what keeps them agreeing.
 */
const TRIGGER: Record<MPSize, { padding: string; height: string }> = {
  xs: { padding: 'px-2', height: 'h-8' },
  sm: { padding: 'px-3', height: 'h-10' },
  md: { padding: 'px-4', height: 'h-14' },
  lg: { padding: 'px-4', height: 'h-16' },
  xl: { padding: 'px-5', height: 'h-18' }
};

/**
 * The popup's room, one track tighter than a control's.
 *
 * A calendar is already a grid of forty-two padded cells; giving the sheet
 * around it a control's 16px as well would put 24px of nothing between the last
 * column and the edge.
 */
const POPUP_PAD: Record<MPSize, string> = {
  xs: 'p-1.5',
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
  xl: 'p-3.5'
};

/**
 * The props a picker takes from its shell rather than inventing.
 *
 * Written out here rather than left to `MPStyleProps` alone because these are
 * the rows a reader of the docs is actually looking at — every one of the four
 * pickers lists them, and they mean the same thing on all four.
 */
export interface MPPickerShellProps extends MPStyleProps, MPControlEventProps<HTMLButtonElement> {
  /**
   * Which accent family the popup reads: the chosen day's fill, the band across
   * a range, today's outline, the footer's confirm button.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Label for the picker, drawn in the outline's notch and — while nothing is
   * chosen, the popup is shut and there is no leading glyph — resting on the
   * trigger's own line where the placeholder would be. See `floatingLabel`.
   */
  label?: React.ReactNode;
  /**
   * Whether the label rests on the trigger's line while there is nothing to make
   * room for, and rises into the notch on focus or on the first choice.
   *
   * A picker draws its own glyph before the value, and that glyph stands exactly
   * where a resting label would — so in practice this only takes effect on a
   * picker asked for without one, `startIcon={null}`. Two things cannot share a
   * spot, and of the two the glyph is what says the trigger opens a calendar.
   * @default true
   */
  floatingLabel?: boolean;
  /** The line under the control. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the control. Its presence is also what puts the picker
   * into its error state — there is no separate `error` boolean, so there is no
   * way to render a control that is visibly wrong with no explanation of why.
   */
  errorMessage?: React.ReactNode;
  /**
   * Content placed before the value. Defaults to the picker's own glyph, and
   * `null` is how that glyph is asked for by name to go away.
   */
  startIcon?: React.ReactNode;
  /** Marks the picker required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the picker out and stops it opening. */
  disabled?: boolean;
  /**
   * Shows the value without allowing it to be changed, and stays focusable.
   *
   * The popup does not open either. What a read-only picker holds is something
   * to read, and a calendar whose every cell was inert would be a menu of
   * nothing.
   */
  readOnly?: boolean;
  /**
   * The id put on the trigger and pointed at by the label. Generated when it is
   * left out.
   */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface InternalShellProps extends MPPickerShellProps {
  /** Which component this is, for the class hook and the generated id. */
  slug: string;
  /** What the trigger reads. A placeholder when `empty`. */
  display: React.ReactNode;
  /**
   * Every string the display could hold, so the trigger stops changing width
   * with its value. `displaySamples` in `internal/date` produces them and
   * `MPWidthSizer` is what lays them out.
   */
  samples?: string[];
  /** Nothing has been chosen yet, so the display is muted. */
  empty: boolean;
  /** Offers the × that empties the control. */
  clearable?: boolean;
  onClear: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: MPPickerLabels;
  /**
   * `<input type="hidden">` rows, so the control submits with a form.
   *
   * Each row carries its own name, which is why the shell takes no `name` of
   * its own: a range picker submits two of them under one name, and the id the
   * label points at is generated rather than derived from it.
   */
  hiddenValues?: Array<{ name: string; value: string }>;
  children: React.ReactNode;
  triggerRef?: React.Ref<HTMLButtonElement>;
}

/**
 * A trigger, a label, the line of text under it, and a popup.
 *
 * Everything about it that is visible is a decision already made elsewhere: the
 * notched outline, the label in the notch, the supporting text, the disabled
 * treatment, and the popup's `surface-container` at elevation 2 — which is the
 * same floating sheet a menu and a select's list are drawn on.
 */
export function MPPickerShell({
  slug,
  size = 'md',
  color = 'primary',
  fullWidth = false,
  label,
  floatingLabel = true,
  description,
  errorMessage,
  startIcon,
  required = false,
  disabled = false,
  readOnly = false,
  id,
  className,
  style,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onClick,
  onDoubleClick,
  onContextMenu,
  display,
  samples,
  empty,
  clearable = false,
  onClear,
  open,
  onOpenChange,
  labels,
  hiddenValues,
  children,
  triggerRef
}: InternalShellProps) {
  const invalid = hasContent(errorMessage);
  const scale = TRIGGER[size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  // A read-only picker keeps its value on screen and keeps its place in the tab
  // order; what it loses is the × and the popup.
  const inert = disabled || readOnly;
  const showClear = clearable && !empty && !inert;
  // The open popup is here for the reason `MPSelect`'s is: focus moves into the
  // calendar, so the trigger blurs the instant it appears and the label would
  // fall back down over a picker that is plainly being answered.
  const { shrunk, focusProps } = useFloatingLabel({
    floating: floatingLabel && hasContent(label),
    filled: !empty,
    pinned: open || hasContent(startIcon)
  });

  return (
    <Field.Root
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      className={[
        `mp-${slug} group flex-col align-top`,
        fullWidth ? 'flex w-full' : 'inline-flex w-fit',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...focusProps}
    >
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        {/*
         * The shell. `relative` so the outline can fill it and the label can sit
         * on its top edge; the `group` stays on the Field above, which is where
         * the validity and disabled attributes the outline reads actually live.
         */}
        <div className="relative w-full">
          <Popover.Trigger
            id={fieldId}
            ref={triggerRef}
            disabled={disabled}
            nativeButton
            // The caller's, on the trigger rather than on the field around it —
            // the trigger is what holds the focus, and the × beside it is a
            // button of its own whose presses are not the picker's. Base UI
            // still opens the popup on a press unless `onClick` prevents it.
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            className={[
              'relative flex w-full items-center gap-2 select-none',
              'appearance-none bg-transparent font-[inherit] outline-none',
              scale.padding,
              // The × is drawn over the trigger rather than inside it — a button
              // inside a button is not a button — so the room for it has to be
              // taken out of the trigger's own end padding.
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

            {/* The value and, under it and invisible, every value it could be. */}
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={[
                  'w-full truncate text-start',
                  // The placeholder is muted the same way a text field's is, so
                  // an empty picker and an empty field read as equally empty.
                  empty && !disabled ? 'text-mp-on-surface-variant' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Withheld while a floating label is resting in the same
                    place: what a picker shows when it is empty is a hint, and
                    two greyed strings in one box is not a hint. */}
                {empty && !shrunk ? null : display}
              </span>
              <MPWidthSizer samples={samples ?? []} />
            </span>
          </Popover.Trigger>

          {showClear ? (
            // Outside the trigger, because a button inside a button is not a
            // button — the browser drops the inner one and the × stops being
            // reachable by keyboard at all.
            <button
              type="button"
              aria-label={labels.clear}
              onClick={onClear}
              className={[
                'group/clear rounded-mp-full text-mp-on-surface-variant absolute inset-y-0',
                'end-1 my-auto flex size-8 cursor-pointer items-center justify-center',
                'appearance-none border-0 bg-transparent font-[inherit]',
                'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
                'focus-visible:outline-solid outline-none'
              ].join(' ')}
            >
              <MPStateLayer className="group-hover/clear:opacity-8 group-focus-visible/clear:opacity-10" />
              <MPIcon icon={CloseIcon} size={CONTROL_ICON[size]} />
            </button>
          ) : null}

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

        <Popover.Portal>
          <Popover.Positioner className={PORTAL_LAYER} sideOffset={4} align="start">
            <Popover.Popup
              // Base UI is told to leave the focus alone so the calendar can
              // take it into the grid itself. Its own move would land on the
              // popup element and run *after* the grid's, undoing it.
              initialFocus={false}
              className={[
                `mp-${slug}__popup rounded-mp-md shadow-mp-2 bg-mp-surface-container`,
                'text-mp-on-surface outline-none',
                POPUP_PAD[size],
                PROSE_TEXT[size],
                FADE
              ].join(' ')}
            >
              {children}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <MPSupportingText
        description={description}
        errorMessage={errorMessage}
        className={scale.padding}
      />

      {hiddenValues?.map((entry, index) => (
        <input key={index} type="hidden" name={entry.name} value={entry.value} />
      ))}
    </Field.Root>
  );
}

/**
 * The row of shortcuts under a picker's panel.
 *
 * A hairline above it rather than a gap, because the actions act on the panel
 * and a gap would read as a second popup stacked under the first.
 */
export function MPPickerFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-mp-outline-variant flex items-center justify-end gap-1 border-t pt-1.5">
      {children}
    </div>
  );
}

/** The vertical hairline between a calendar and the clock beside it. */
export function MPPickerDivider() {
  return <div aria-hidden="true" className="bg-mp-outline-variant w-px self-stretch" />;
}

/**
 * What a picker's footer buttons are drawn at.
 *
 * The same rung the calendar's header uses, for the same reason: a `md` picker's
 * footer sitting at the control ladder's 56px would be taller than two rows of
 * the calendar above it.
 */
export const FOOTER_SIZE: Record<MPSize, MPSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
  xl: 'md'
};
