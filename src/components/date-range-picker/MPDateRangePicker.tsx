import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { ArrowRightIcon, CalendarIcon } from '../../constants/icons';
import { MPCalendar, type MPPickerLabels } from '../../internal/Calendar';
import {
  FOOTER_SIZE,
  MPPickerFooter,
  MPPickerShell,
  useDisplaySamples,
  type MPPickerShellProps
} from '../../internal/Picker';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { MPWidthSizer } from '../../internal/WidthSizer';
import { CONTROL_ICON, META_TEXT } from '../../internal/scale';
import {
  addMonths,
  compareDay,
  formatDate,
  isValidDate,
  localeWeekStart,
  startOfDay,
  startOfMonth,
  toISODate,
  today,
  withPlaceholder
} from '../../internal/date';
import type { MPWeekday } from '../../types';

/**
 * Two ends, either of which may be missing.
 *
 * An object rather than a `[Date, Date]` tuple, and rather than two props. A
 * range is one value — it is chosen in one gesture, cleared in one gesture and
 * validated as a whole — and the two names are what stop a caller writing the
 * end into the start. Half a range is a real state: it is what the picker holds
 * between the first click and the second.
 */
export interface MPDateRange {
  start: Date | null;
  end: Date | null;
}

/** A named range offered as a shortcut beside the calendars. */
export interface MPDateRangePreset {
  label: React.ReactNode;
  /**
   * The range it stands for. A function when it depends on today, which is
   * almost always — "the last 7 days" computed once at module scope is a range
   * that would be wrong for anyone who left the tab open overnight.
   */
  value: MPDateRange | (() => MPDateRange);
}

const EMPTY: MPDateRange = { start: null, end: null };

export interface MPDateRangePickerProps extends MPPickerShellProps {
  /** The chosen range. Use with `onValueChange` for a controlled picker. */
  value?: MPDateRange | null;
  defaultValue?: MPDateRange | null;
  /**
   * Always called with an object. A cleared range is `{ start: null, end: null }`
   * rather than `null`, so a caller never has to test two shapes for "empty".
   */
  onValueChange?: (value: MPDateRange) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which month the left calendar opens on when there is no value. */
  defaultMonth?: Date;
  minDate?: Date | null;
  maxDate?: Date | null;
  shouldDisableDate?: (date: Date) => boolean;
  /**
   * A BCP 47 tag deciding every name the calendars draw and how the trigger
   * writes the two ends. Falls back to the nearest `MPLocaleProvider`, then to
   * the platform's own.
   */
  locale?: string;
  weekStartsOn?: MPWeekday;
  /** @default { dateStyle: 'medium' } */
  format?: Intl.DateTimeFormatOptions;
  /**
   * How many months are on screen at once. Two is the default because a range
   * that crosses a month boundary is the ordinary case, not the exception.
   * @default 2
   */
  monthCount?: 1 | 2;
  /** Shown in each half of the trigger while that end is unchosen. */
  startPlaceholder?: React.ReactNode;
  endPlaceholder?: React.ReactNode;
  /** Shortcuts listed beside the calendars — "Last 7 days", "This month". */
  presets?: readonly MPDateRangePreset[];
  clearable?: boolean;
  /**
   * Closes the popup once both ends are chosen.
   * @default true
   */
  closeOnSelect?: boolean;
  labels?: Partial<MPPickerLabels>;
  /**
   * Identifies the field when a form is submitted. Two hidden inputs of the same
   * name, so the two ends arrive as `FormData.getAll(name)`.
   */
  name?: string;
}

/**
 * A span between two days.
 *
 * Two months side by side, because a range that crosses a month boundary is the
 * ordinary case and a one-month picker makes it a two-step navigation problem.
 * The two panels are one calendar in two halves: the left one has no forward
 * stepper, the right one has no back stepper, and either header's month and year
 * buttons move both.
 *
 * The band between the ends is drawn as the pointer moves, before the second
 * click lands. That preview is the whole affordance — without it the first click
 * has no visible consequence and the control looks broken for the second or so
 * between the two.
 *
 * The band itself is the accent's *container* tone under its own ink, and the
 * two ends are the accent proper. That is the same pair MD3 uses for a selected
 * range, and it is what keeps the ends distinguishable from the days between
 * them: a band drawn in the accent would make a nine-day range look like nine
 * separately chosen days.
 */
export const MPDateRangePicker = React.forwardRef<HTMLButtonElement, MPDateRangePickerProps>(
  function MPDateRangePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      defaultMonth,
      minDate,
      maxDate,
      shouldDisableDate,
      locale: localeProp,
      weekStartsOn,
      format = { dateStyle: 'medium' },
      monthCount = 2,
      startPlaceholder,
      endPlaceholder,
      presets,
      clearable = false,
      closeOnSelect = true,
      labels: labelOverrides,
      name,
      size = 'md',
      color = 'primary',
      readOnly = false,
      disabled = false,
      startIcon,
      ...shell
    },
    ref
  ) {
    const locale = useMPLocale(localeProp);
    const labels = useMPMessages('picker', locale, labelOverrides);
    const firstDay = weekStartsOn ?? localeWeekStart(locale);

    const [uncontrolledValue, setUncontrolledValue] = React.useState<MPDateRange>(
      defaultValue ?? EMPTY
    );
    const value = valueProp !== undefined ? (valueProp ?? EMPTY) : uncontrolledValue;
    const start = isValidDate(value.start) ? value.start : null;
    const end = isValidDate(value.end) ? value.end : null;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const open = openProp ?? uncontrolledOpen;

    // The first of the two clicks. Held here rather than in `value` so a
    // controlled caller is never handed a range with only one end — half a
    // selection is this component's business, not the form's.
    const [anchor, setAnchor] = React.useState<Date | null>(null);
    const [preview, setPreview] = React.useState<Date | null>(null);

    const [month, setMonth] = React.useState(() => startOfMonth(start ?? defaultMonth ?? today()));

    React.useEffect(() => {
      if (open) {
        setMonth(startOfMonth(start ?? defaultMonth ?? today()));
      } else {
        // An abandoned half-selection does not survive the popup closing.
        setAnchor(null);
        setPreview(null);
      }
    }, [open]);

    const setOpen = (next: boolean) => {
      if (next && (readOnly || disabled)) {
        return;
      }

      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    };

    const commit = (next: MPDateRange) => {
      if (valueProp === undefined) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    };

    const select = (date: Date) => {
      const day = startOfDay(date);

      // The first click of a new selection — either there is no anchor, or the
      // range is already complete and this click starts over.
      if (anchor === null) {
        setAnchor(day);
        setPreview(day);
        commit({ start: day, end: null });

        return;
      }

      // The second. Clicking backwards is not a mistake to be rejected, it is
      // the same range typed in the other order.
      const [from, to] = compareDay(day, anchor) < 0 ? [day, anchor] : [anchor, day];

      setAnchor(null);
      setPreview(null);
      commit({ start: from, end: to });

      if (closeOnSelect) {
        setOpen(false);
      }
    };

    const applyPreset = (preset: MPDateRangePreset) => {
      const range = typeof preset.value === 'function' ? preset.value() : preset.value;

      setAnchor(null);
      setPreview(null);
      commit(range);

      if (isValidDate(range.start)) {
        setMonth(startOfMonth(range.start));
      }

      if (closeOnSelect) {
        setOpen(false);
      }
    };

    // What the band is drawn between: the finished range, or the anchor and
    // whatever the pointer is currently over.
    const bandStart = anchor ?? start;
    const bandEnd = anchor !== null ? preview : end;

    const write = (date: Date | null, fallback: React.ReactNode) =>
      isValidDate(date) ? (
        formatDate(date, locale, format)
      ) : (
        <span className="text-mp-on-surface-variant">{fallback ?? ''}</span>
      );

    const secondMonth = addMonths(month, 1);
    const twoUp = monthCount === 2;

    // Every date either half could show, so neither end of the trigger changes
    // width as the range is filled in. Held across renders, which matters more
    // here than anywhere else: moving the pointer across a calendar redraws the
    // band, so this component re-renders on every cell the pointer crosses.
    const dateSamples = useDisplaySamples(locale, format);

    // Which end the next click will fill. The trigger says the same thing with
    // its two halves, but the trigger is behind the popup while the popup is up,
    // so the footer is the only place that can say it where it will be read.
    const hint = anchor !== null ? labels.end : start === null ? labels.start : null;

    const calendarProps = {
      size,
      color,
      locale,
      weekStartsOn: firstDay,
      selected: [start, end, anchor],
      rangeStart: bandStart,
      rangeEnd: bandEnd,
      onSelect: select,
      onPreviewChange: (date: Date | null) => {
        if (anchor !== null) {
          setPreview(date ?? anchor);
        }
      },
      minDate,
      maxDate,
      shouldDisableDate,
      // With both panels showing six full weeks, the 1st of August is a trailing
      // day of the July panel *and* the first day of the August one. Two cells
      // with the same name in one popup is ambiguous to a pointer and outright
      // broken to a screen reader.
      showOutsideDays: false,
      labels
    };

    return (
      <MPPickerShell
        {...shell}
        slug="date-range-picker"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        name={name}
        triggerRef={ref}
        startIcon={startIcon ?? <MPIcon icon={CalendarIcon} size={CONTROL_ICON[size]} />}
        display={
          // Neither half is `flex-1`. Two equal halves would size the trigger to
          // twice the *shorter* of the two, which truncates a date next to a
          // word like "Check out"; letting each take its own width sizes the
          // control to what it actually has to say.
          //
          // Each half carries its own sizer for the same reason it carries its
          // own width: one sizer across both would reserve the widest of the two
          // twice over, and the trigger would sit wider than anything it can
          // actually hold.
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{write(start, startPlaceholder)}</span>
              <MPWidthSizer samples={withPlaceholder(dateSamples, startPlaceholder)} />
            </span>
            <span
              aria-hidden="true"
              className="text-mp-on-surface-variant flex shrink-0 items-center rtl:rotate-180"
            >
              <MPIcon icon={ArrowRightIcon} size={CONTROL_ICON[size]} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{write(end, endPlaceholder)}</span>
              <MPWidthSizer samples={withPlaceholder(dateSamples, endPlaceholder)} />
            </span>
          </span>
        }
        empty={start === null && end === null}
        clearable={clearable}
        onClear={() => commit(EMPTY)}
        open={open}
        onOpenChange={setOpen}
        labels={labels}
        hiddenValues={
          name
            ? [
                { name, value: start ? toISODate(start) : '' },
                { name, value: end ? toISODate(end) : '' }
              ]
            : undefined
        }
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-stretch gap-2">
            {presets && presets.length > 0 ? (
              <div className="border-mp-outline-variant flex max-h-[calc(var(--_mp-cell,2.5rem)*8)] flex-col overflow-y-auto border-e pe-1.5">
                {presets.map((preset, index) => (
                  <MPButton
                    key={index}
                    variant="text"
                    size={FOOTER_SIZE[size]}
                    color={color}
                    className="justify-start whitespace-nowrap"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </MPButton>
                ))}
              </div>
            ) : null}

            <MPCalendar
              {...calendarProps}
              month={month}
              onMonthChange={setMonth}
              showNextButton={!twoUp}
              autoFocus
            />

            {twoUp ? (
              <MPCalendar
                {...calendarProps}
                month={secondMonth}
                // The right panel is a month ahead, so moving it means moving the
                // pair. Both headers drive one number.
                onMonthChange={(next) => setMonth(addMonths(next, -1))}
                showPreviousButton={false}
              />
            ) : null}
          </div>

          {clearable || hint !== null ? (
            <MPPickerFooter>
              {hint !== null ? (
                <span className={`text-mp-on-surface-variant me-auto ${META_TEXT}`}>{hint}</span>
              ) : null}
              {clearable ? (
                <MPButton
                  variant="text"
                  size={FOOTER_SIZE[size]}
                  color={color}
                  onClick={() => {
                    setAnchor(null);
                    setPreview(null);
                    commit(EMPTY);
                    setOpen(false);
                  }}
                >
                  {labels.clear}
                </MPButton>
              ) : null}
            </MPPickerFooter>
          ) : null}
        </div>
      </MPPickerShell>
    );
  }
);
