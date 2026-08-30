import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { Field } from '@base-ui/react/field';
import { MPChip } from '../chip/MPChip';
import { MPIcon } from '../icon/MPIcon';
import { AddIcon, CheckIcon, ChevronDownIcon, CloseIcon } from '../../constants/icons';
import { MPFieldLabel, MPFieldOutline, useFloatingLabel } from '../../internal/FieldOutline';
import { fillMessage } from '../../internal/i18n';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { MPStateLayer } from '../../internal/StateLayer';
import { MPSupportingText } from '../../internal/SupportingText';
import { CONTROL_ICON, PROSE_TEXT, hasContent } from '../../internal/scale';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import type { MPSize, MPStyleProps } from '../../types';

/**
 * What a combobox's value may be — the same two types `MPSelect` submits, and for
 * the same reason: a form control's value is what a form sends, and every escape
 * from that buys flexibility by making the common case harder to write.
 *
 * A value the list does not contain arrives as a `string`. It is what the reader
 * typed.
 */
export type MPComboboxValue = string | number;

export interface MPComboboxOption {
  /** Submitted, and what `value` and `onValueChange` speak in. */
  value: MPComboboxValue;
  /**
   * Shown in the list, in the input and on the chip. Defaults to the value.
   *
   * A `string` rather than a `ReactNode`, which is the one place this differs
   * from `MPSelect`: the label is what the filter matches against and what is
   * written into a text input, and neither of those can be done to an element.
   */
  label?: string;
  /** Unavailable, but still listed — the option exists, it just cannot be picked. */
  disabled?: boolean;
}

/** One value, or an array of them, depending on `multiple`. */
type Selection<Multiple extends boolean | undefined> = Multiple extends true
  ? MPComboboxValue[]
  : MPComboboxValue | null;

export interface MPComboboxProps<
  Multiple extends boolean | undefined = false
> extends MPStyleProps {
  /**
   * The options, as data — the same shape `MPSelect` takes, and for the same
   * reason: what a caller has is almost always an array already.
   */
  items: readonly MPComboboxOption[];
  /**
   * Whether more than one value may be held. The chosen ones become `MPChip`s
   * inside the field, and the input goes on filtering after each.
   * @default false
   */
  multiple?: Multiple;
  /** The chosen value. Use with `onValueChange` for a controlled combobox. */
  value?: Selection<Multiple> | null;
  /** The initially chosen value, for an uncontrolled combobox. */
  defaultValue?: Selection<Multiple> | null;
  onValueChange?: (value: Selection<Multiple>) => void;
  /** Called as the text in the input changes — the filter query, not the value. */
  onInputValueChange?: (inputValue: string) => void;
  /**
   * Whether a value the list does not contain may be committed.
   *
   * On by default, and it is what separates this from a searchable select: the
   * typed text is offered as its own row at the end of the list, so committing it
   * is a choice the reader makes rather than something that happens to them on
   * blur. Turn it off for a field whose values are a closed set.
   * @default true
   */
  allowCustom?: boolean;
  /** What that row says. Receives the trimmed query. */
  customLabel?: (query: string) => React.ReactNode;
  /**
   * Shows a × that empties the field. Off by default — a field that can be
   * cleared in one click is a field that can be emptied by accident.
   * @default false
   */
  clearable?: boolean;
  /**
   * Shown in the popup when nothing matches and no value may be added.
   * @default 'No matches'
   */
  emptyMessage?: React.ReactNode;
  /** The most rows the list will show at once. `-1` is all of them. @default -1 */
  limit?: number;
  /**
   * Shown in the input while nothing is typed. With a floating label it is held
   * back until the label has risen out of its way.
   */
  placeholder?: string;
  /**
   * Label for the combobox, drawn in the outline's notch and — while nothing is
   * chosen or typed, the control is unfocused and there is no `startIcon` —
   * resting on the input's own line. See `floatingLabel`.
   */
  label?: React.ReactNode;
  /**
   * Whether the label rests on the input's line while there is nothing to make
   * room for, and rises into the notch on focus, on the first character or on
   * the first chip.
   *
   * `false` pins it in the notch, which is the one thing a floating label costs:
   * a combobox with a label and one without no longer sit at the same height in
   * a form until both are answered. A `startIcon` holds the label up regardless.
   * @default true
   */
  floatingLabel?: boolean;
  /** The line under the control. Replaced by `errorMessage` when there is one. */
  description?: React.ReactNode;
  /**
   * The message under the control. Its presence is also what puts the combobox
   * into its error state.
   */
  errorMessage?: React.ReactNode;
  /** Content placed before the input — an `MPIcon`, usually. */
  startIcon?: React.ReactNode;
  /** Marks the combobox required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the control out and stops it taking input. */
  disabled?: boolean;
  /** Shows the value without allowing it to be changed, and stays focusable. */
  readOnly?: boolean;
  /** Name of the form control. */
  name?: string;
  /** The popup is open. Use with `onOpenChange` for a controlled popup. */
  open?: boolean;
  /** Whether the popup starts open. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Accessible name of the clear button. Defaults to the word for "clear" in
   * `locale`.
   */
  clearLabel?: string;
  /**
   * Which language the two adornments' default names are written in. Falls back
   * to the nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * Accessible name of the chevron that opens the list, **for a combobox with no
   * `label`**.
   *
   * With a label, Base UI names the chevron after the field itself and that name
   * wins — `aria-labelledby` outranks `aria-label` — which is the right answer:
   * a button called "Fruit" beside a field called "Fruit" is the button that
   * opens that field. This is the fallback for the unlabelled case, where the
   * chevron would otherwise be a button with a glyph in it and no name at all.
   *
   * Defaults to the word for "open" in `locale`.
   */
  openLabel?: string;
  /**
   * Accessible name of a chip's remove button. Receives the chip's label.
   *
   * Left out, the chip is still named — "Remove Seoul" in `locale`'s own word
   * order — rather than being one of five buttons all called "Remove".
   */
  removeLabel?: (label: string) => string;
  /** A ref to the text input the reader types into. */
  inputRef?: React.Ref<HTMLInputElement>;
  /**
   * The id put on the input and pointed at by the label. Generated when it is
   * left out.
   */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * What Base UI holds.
 *
 * The public value is a string or a number; this object is what carries the label
 * the input and the filter need, plus the flag that says "this row is offering a
 * value the list does not have".
 */
interface Entry {
  value: MPComboboxValue;
  label: string;
  disabled?: boolean;
  custom?: boolean;
}

/**
 * The field's own geometry, which is `MPSelect`'s trigger to the pixel — and
 * therefore `MPTextField`'s.
 *
 * The end padding is smaller than the start's because the chevron brings its own
 * hit area; stacking the field's padding on top of it would leave the glyph
 * floating in the middle of a gap.
 */
const FIELD: Record<MPSize, { padding: string; height: string }> = {
  xs: { padding: 'ps-2 pe-1', height: 'h-8' },
  sm: { padding: 'ps-3 pe-1.5', height: 'h-10' },
  md: { padding: 'ps-4 pe-2', height: 'h-14' },
  lg: { padding: 'ps-4 pe-2', height: 'h-16' },
  xl: { padding: 'ps-5 pe-2.5', height: 'h-18' }
};

/**
 * With chips in it the field cannot have a fixed height — the chips wrap.
 *
 * The padding is `(control height − chip height) / 2` instead, so a one-row
 * combobox is exactly as tall as the field beside it, and `min-h-*` is what holds
 * the height once the chips are gone.
 */
const CHIPS_INSET: Record<MPSize, string> = {
  xs: 'min-h-8 py-1',
  sm: 'min-h-10 py-1.5',
  md: 'min-h-14 py-3',
  lg: 'min-h-16 py-3',
  xl: 'min-h-18 py-3'
};

/** The chips inside the field sit a rung below the field's own size. */
const CHIP_SIZE: Record<MPSize, MPSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'md'
};

/** Always an array inside, however the caller spelled it. */
function toArray(value: unknown): MPComboboxValue[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? (value.slice() as MPComboboxValue[]) : [value as MPComboboxValue];
}

/**
 * A field you can type into and also choose from.
 *
 * The shell is `MPTextField`'s wearing a chevron, exactly as `MPSelect`'s trigger
 * is — the three have to be indistinguishable in a form, or the form looks
 * assembled rather than designed. What is different is what the text does: it
 * filters the list, and — unless `allowCustom` is off — it can become the value
 * itself, offered as the last row rather than committed silently on blur.
 *
 * With `multiple` the chosen values become chips inside the field and the input
 * goes on filtering after each one, so a set of tags is built without the field
 * ever closing.
 *
 * Base UI owns everything hard about this: the filtering and its collator, the
 * popup's positioning and flipping, the `combobox`/`listbox` wiring, arrow-key
 * navigation across both the list and the chips, and the hidden input that makes
 * the whole thing submit with a form.
 */
export function MPCombobox<Multiple extends boolean | undefined = false>({
  items,
  multiple,
  value,
  defaultValue,
  onValueChange,
  onInputValueChange,
  allowCustom = true,
  customLabel,
  clearable = false,
  emptyMessage = 'No matches',
  limit,
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
  open,
  defaultOpen,
  onOpenChange,
  clearLabel,
  openLabel,
  locale: localeProp,
  removeLabel,
  inputRef,
  id,
  className,
  style
}: MPComboboxProps<Multiple>) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMON, locale);
  const invalid = hasContent(errorMessage);
  const isMultiple = multiple === true;
  const scale = FIELD[size];
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  const options = React.useMemo<Entry[]>(
    () =>
      items.map((item) => ({
        value: item.value,
        label: item.label ?? String(item.value),
        disabled: item.disabled
      })),
    [items]
  );

  // The selection is mirrored internally even when the caller controls it. The
  // "add this" row has to know what has already been chosen — otherwise a tag
  // that was just added goes on being offered — and in uncontrolled mode there is
  // nowhere else that knowledge lives.
  const [ownSelection, setOwnSelection] = React.useState<MPComboboxValue[]>(() =>
    toArray(defaultValue)
  );
  const selection = value === undefined ? ownSelection : toArray(value);

  const [query, setQuery] = React.useState('');

  // Typed text counts as content as much as a chosen row does: the label cannot
  // sit on top of what is being typed under it, and in single mode Base UI puts
  // the chosen option's own label into the input anyway.
  const { shrunk, focusProps } = useFloatingLabel({
    floating: floatingLabel && hasContent(label),
    filled: selection.length > 0 || query !== '',
    pinned: !!startIcon
  });

  const entryFor = React.useCallback(
    (item: MPComboboxValue): Entry =>
      options.find((option) => option.value === item) ?? {
        value: item,
        label: String(item),
        custom: true
      },
    [options]
  );

  // The row that offers what was typed. It is a real item rather than a special
  // case in the keyboard handling, so Enter, a click and the arrow keys all reach
  // it the same way every other row is reached — and Base UI's own filter keeps
  // it visible, because its label *is* the query.
  const trimmed = query.trim();
  const folded = trimmed.toLocaleLowerCase();
  const alreadyKnown =
    trimmed === '' ||
    options.some(
      (option) =>
        option.label.toLocaleLowerCase() === folded ||
        String(option.value).toLocaleLowerCase() === folded
    ) ||
    selection.some((item) => String(item).toLocaleLowerCase() === folded);
  const customValue = allowCustom && !readOnly && !disabled && !alreadyKnown ? trimmed : null;

  const listItems = React.useMemo<Entry[]>(
    () =>
      customValue === null
        ? options
        : [...options, { value: customValue, label: customValue, custom: true }],
    [options, customValue]
  );

  const baseValue = isMultiple
    ? selection.map(entryFor)
    : selection.length > 0
      ? entryFor(selection[0])
      : null;

  function commit(next: MPComboboxValue[]) {
    if (value === undefined) {
      setOwnSelection(next);
    }

    onValueChange?.((isMultiple ? next : (next[0] ?? null)) as Selection<Multiple>);
  }

  const inputClasses = [
    // `self-stretch` and no height of its own, in both modes. An input centres its
    // own text in its box, so letting the box be the full height of the row it
    // sits on is what puts the placeholder on the same baseline as the chips
    // beside it.
    'min-w-0 flex-1 self-stretch bg-transparent font-[inherit] text-inherit outline-none',
    'placeholder:text-mp-on-surface-variant',
    disabled ? 'text-mp-on-surface/38 cursor-default' : 'text-mp-on-surface caret-mp-primary'
  ].join(' ');

  const adornment = [
    'group rounded-mp-full relative flex size-8 shrink-0 cursor-pointer items-center justify-center',
    'text-mp-on-surface-variant',
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
    'focus-visible:outline-solid outline-none',
    'disabled:text-mp-on-surface/38 disabled:cursor-default'
  ].join(' ');

  /**
   * `afterChips` is the space between the last chip and where typing starts.
   *
   * The row's own gap is the distance between two chips, which is right between
   * two things of the same kind and too little between a chip and a caret — the
   * query reads as another chip's label rather than as the field's own text. It
   * is only added when there is a chip to be clear of, so an empty multi-select
   * lines its placeholder up with every other field in the form.
   */
  const renderInput = (afterChips: boolean) => (
    <Combobox.Input
      ref={inputRef}
      id={fieldId}
      // Withheld while a floating label is resting in the same place.
      placeholder={shrunk ? placeholder : undefined}
      className={
        isMultiple ? `${inputClasses} min-w-16 ${afterChips ? 'ms-1.5' : ''}` : inputClasses
      }
    />
  );

  return (
    <Field.Root
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      className={[
        'mp-combobox group flex-col align-top',
        fullWidth ? 'flex w-full' : 'inline-flex w-fit',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...focusProps}
    >
      <Combobox.Root<Entry, boolean>
        name={name}
        items={listItems}
        multiple={isMultiple}
        value={baseValue}
        onValueChange={(next) => {
          const chosen = next === null ? [] : Array.isArray(next) ? next : [next];

          commit(chosen.map((entry) => entry.value));
        }}
        // The text is Base UI's to own rather than ours: in single mode it is the
        // chosen option's label, which has to be there from the first paint, and
        // in multiple mode it empties itself after each pick. What is kept here is
        // a copy, and only so the "add this" row knows what was typed.
        onInputValueChange={(next) => {
          setQuery(next);
          onInputValueChange?.(next);
        }}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        // The first match lights up as you type, so Enter commits without an arrow
        // key first. This is also what makes the "add this" row reachable from the
        // keyboard at all: a value the list does not have is the only match there
        // is, so it is the one Enter lands on.
        autoHighlight
        itemToStringLabel={(entry) => entry.label}
        itemToStringValue={(entry) => String(entry.value)}
        isItemEqualToValue={(a, b) => a.value === b.value}
        limit={limit}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
      >
        {/* The shell. `relative` so the outline can fill it and the label can sit
            on its top edge; the `group` stays on the Field above, which is where
            the validity and disabled attributes the outline reads actually live. */}
        <div className="relative w-full">
          <Combobox.InputGroup
            className={[
              'relative flex w-full items-center gap-2',
              scale.padding,
              isMultiple ? CHIPS_INSET[size] : scale.height,
              PROSE_TEXT[size],
              disabled ? 'cursor-default' : 'cursor-text'
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

            {isMultiple ? (
              <Combobox.Chips className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                <Combobox.Value>
                  {(chosen: Entry[]) => (
                    <React.Fragment>
                      {chosen.map((entry, index) => (
                        <Combobox.Chip
                          /* Position as well as value, for `MPSelect`'s reason:
                             a duplicate key reconciles two chips wrongly the
                             moment the list is reordered. */
                          key={`${index}:${String(entry.value)}`}
                          render={
                            <MPChip
                              variant={invalid ? 'outlined' : 'tonal'}
                              color={invalid ? 'error' : 'primary'}
                              size={CHIP_SIZE[size]}
                              disabled={disabled}
                              endIcon={
                                readOnly || disabled ? null : (
                                  <Combobox.ChipRemove
                                    aria-label={
                                      // Named for the chip it removes rather
                                      // than being one of five buttons all
                                      // called "Remove" — which is a row a
                                      // screen reader cannot tell apart.
                                      removeLabel
                                        ? removeLabel(entry.label)
                                        : fillMessage(messages.removeNamed, {
                                            label: entry.label
                                          })
                                    }
                                    className="flex cursor-pointer items-center opacity-70 hover:opacity-100"
                                  >
                                    <MPIcon icon={CloseIcon} size={16} />
                                  </Combobox.ChipRemove>
                                )
                              }
                            />
                          }
                        >
                          {entry.label}
                        </Combobox.Chip>
                      ))}
                      {renderInput(chosen.length > 0)}
                    </React.Fragment>
                  )}
                </Combobox.Value>
              </Combobox.Chips>
            ) : (
              renderInput(false)
            )}

            {clearable && !readOnly ? (
              <Combobox.Clear aria-label={clearLabel ?? messages.clear} className={adornment}>
                <MPStateLayer />
                <MPIcon icon={CloseIcon} size={CONTROL_ICON[size]} />
              </Combobox.Clear>
            ) : null}

            <Combobox.Trigger aria-label={openLabel ?? messages.open} className={adornment}>
              <MPStateLayer />
              <Combobox.Icon
                className={[
                  // The chevron is the one thing here that may turn: it is a glyph
                  // rather than a label, so nothing about it is resampled.
                  'relative flex items-center',
                  'transition-transform duration-(--mp-sys-motion-duration-short4)',
                  'data-popup-open:rotate-180'
                ].join(' ')}
              >
                <MPIcon icon={ChevronDownIcon} size={CONTROL_ICON[size]} />
              </Combobox.Icon>
            </Combobox.Trigger>
          </Combobox.InputGroup>

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

        <Combobox.Portal>
          <Combobox.Positioner className={PORTAL_LAYER} sideOffset={4}>
            <Combobox.Popup
              className={[
                'mp-combobox__popup rounded-mp-xs shadow-mp-2 bg-mp-surface-container p-2',
                'text-mp-on-surface w-[var(--anchor-width)] outline-none',
                'max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain',
                PROSE_TEXT[size],
                FADE
              ].join(' ')}
            >
              <Combobox.Empty className="text-mp-on-surface-variant px-3 py-2 empty:hidden">
                {emptyMessage}
              </Combobox.Empty>

              <Combobox.List>
                {(entry: Entry, index: number) => (
                  <Combobox.Item
                    key={`${index}:${entry.custom ? 'custom:' : ''}${String(entry.value)}`}
                    value={entry}
                    disabled={entry.disabled}
                    className={[
                      'mp-combobox__item group rounded-mp-xs relative flex cursor-pointer',
                      'items-center gap-3 py-2 ps-2 pe-3 select-none outline-none',
                      'transition-[background-color,color]',
                      'duration-(--mp-sys-motion-duration-short4)',
                      'data-selected:bg-mp-secondary-container',
                      'data-selected:text-mp-on-secondary-container',
                      'data-disabled:text-mp-on-surface/38 data-disabled:cursor-default'
                    ].join(' ')}
                  >
                    {/* A state layer rather than a background, for the two
                        reasons `MPSelect`'s list gives: a chosen row already has
                        a background and a second one would only replace it, and
                        a layer is a thing that can fade.

                        `data-highlighted` rather than `:hover`: it is also where
                        the arrow keys are, so the mouse and the keyboard light
                        the same row. */}
                    <MPStateLayer className="group-data-highlighted:opacity-8 group-data-disabled:opacity-0" />

                    {/* The column is always there and only the mark comes and
                        goes: an indicator that is not rendered at all takes its
                        column with it, and every label in the list shifts
                        sideways as the selection moves down it. */}
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      {entry.custom ? (
                        <MPIcon icon={AddIcon} size={18} />
                      ) : (
                        <Combobox.ItemIndicator>
                          <MPIcon icon={CheckIcon} size={18} />
                        </Combobox.ItemIndicator>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {entry.custom
                        ? customLabel
                          ? customLabel(entry.label)
                          : `Add “${entry.label}”`
                        : entry.label}
                    </span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <MPSupportingText
        description={description}
        errorMessage={errorMessage}
        className={scale.padding}
      />
    </Field.Root>
  );
}
