/// A day and a time, in one popup.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/calendar.dart';
import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/picker.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/date.dart'
    show MPDateNames, MPDatePatterns, MPTimeUnit;

/// A day and a time, in one popup.
///
/// ```dart
/// MPDateTimePicker(
///   label: const Text('Starts'),
///   value: starts,
///   onChanged: (DateTime? next) => setState(() => starts = next),
/// )
/// ```
///
/// Not a date picker that grew a clock and not a time picker that grew a
/// calendar: the two panels sit side by side, the clock's columns exactly as
/// tall as the calendar's seven rows of cells, so the popup is one rectangle
/// rather than two of different sizes pushed together.
///
/// The bounds do more work here than anywhere else. [minDate] is read at full
/// precision, so a minimum of 09:30 on the 27th leaves the 27th selectable in
/// the calendar and greys out the morning in the clock.
///
/// ## Controlled and uncontrolled
///
/// Left without [value], the picker keeps its own moment, starting at
/// [initialValue]. Given one, it shows it and reports what it should become
/// through [onChanged]; a new [value] from the parent, `null` included,
/// replaces whatever the picker held.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPDateTimePicker extends StatefulWidget {
  /// Creates a date-time picker.
  const MPDateTimePicker({
    this.value,
    this.initialValue,
    this.onChanged,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.defaultMonth,
    this.minDate,
    this.maxDate,
    this.shouldDisableDate,
    this.shouldDisableTime,
    this.locale,
    this.names,
    this.weekStartsOn,
    this.format,
    this.hour12,
    this.showSeconds = false,
    this.hourStep = 1,
    this.minuteStep = 1,
    this.secondStep = 1,
    this.placeholder,
    this.clearable = false,
    this.showNowButton = true,
    this.closeOnSelect = false,
    this.labels,
    this.name,
    this.size,
    this.color,
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.startIcon = const MPPickerDefaultIcon(),
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.onKeyEvent,
    this.onFocusChange,
    super.key,
  });

  /// The chosen moment. Given, the picker shows it; see the class
  /// documentation.
  final DateTime? value;

  /// The moment an uncontrolled picker starts on. The React build's
  /// `defaultValue`.
  final DateTime? initialValue;

  /// Called with the newly chosen moment, or `null` when the picker is
  /// emptied. The React build's `onValueChange`.
  final ValueChanged<DateTime?>? onChanged;

  /// Whether the popup is open. Given, the parent drives it through
  /// [onOpenChange].
  final bool? open;

  /// Whether an uncontrolled picker starts open.
  final bool initialOpen;

  /// Called when the popup should open or close.
  final ValueChanged<bool>? onOpenChange;

  /// Which month the calendar opens on when there is no value.
  final DateTime? defaultMonth;

  /// The earliest moment that may be chosen.
  ///
  /// Unlike a date picker's, this one is read at **full precision**: the day it
  /// falls on stays available in the calendar and the clock's columns block
  /// the hours before it. That is what a "not before now" rule needs.
  final DateTime? minDate;

  /// The latest moment that may be chosen, likewise at full precision.
  final DateTime? maxDate;

  /// Blocks individual days.
  final bool Function(DateTime date)? shouldDisableDate;

  /// Blocks individual rows of the clock, given the instant a row would
  /// produce and the column it is in.
  final bool Function(DateTime value, MPTimeUnit unit)? shouldDisableTime;

  /// A BCP 47 tag deciding every name and number the picker draws and the
  /// words it says. Falls back to the nearest `MPLocaleProvider`, then to an
  /// [MPConfigProvider], then to the app's `Localizations`.
  final String? locale;

  /// The names and the shapes, in place of the library's own table for
  /// [locale].
  final MPDateNames? names;

  /// Which day the week starts on. Defaults to whatever the locale says.
  final MPWeekday? weekStartsOn;

  /// How the trigger writes the chosen moment. Left out, a medium date and a
  /// short time, joined the way the locale joins them.
  final String Function(DateTime value)? format;

  /// A 12-hour dial with an AM/PM column. Defaults to whatever the locale
  /// does.
  final bool? hour12;

  /// Adds the seconds column.
  final bool showSeconds;

  /// How far apart the rows of the hours column are. Held between 1 and the
  /// column's own span.
  final int hourStep;

  /// How far apart the minutes are.
  final int minuteStep;

  /// How far apart the seconds are.
  final int secondStep;

  /// Shown in the trigger while nothing is chosen.
  final String? placeholder;

  /// Offers the × in the trigger and the word in the footer that empty the
  /// control.
  final bool clearable;

  /// Offers the shortcut to this moment in the footer.
  final bool showNowButton;

  /// Closes the popup as soon as a day is chosen.
  ///
  /// `false` here and `true` on a date picker, because a moment is a day *and*
  /// a time and closing on the first of the two would leave the second
  /// unanswered.
  final bool closeOnSelect;

  /// Overrides for the words the picker says on its own behalf, by key of the
  /// `picker` namespace.
  final Map<String, String>? labels;

  /// The name an `MPForm` files the value under, as `YYYY-MM-DDTHH:MM`.
  final String? name;

  /// Which rung of the size ladder: the trigger, one calendar cell and one row
  /// of the clock.
  final MPSize? size;

  /// Which accent family the popup reads.
  final MPColor? color;

  /// The label, drawn in the outline's notch.
  final Widget? label;

  /// Whether the label rests on the trigger's line while there is nothing to
  /// make room for. Only takes effect with `startIcon: null`.
  final bool floatingLabel;

  /// The line under the control.
  final Widget? description;

  /// The message under the control, and the error state with it.
  final Widget? errorMessage;

  /// Content placed before the value. Defaults to the calendar glyph alone,
  /// not a clock beside it: a control cannot say two things at once, and the
  /// date is the part a reader scans for. `null` asks for none.
  final Widget? startIcon;

  /// Marks the picker required, and holds an `MPForm` back while nothing is
  /// chosen.
  final bool required;

  /// Greys the picker out and stops it opening.
  final bool disabled;

  /// Shows the value without allowing it to be changed, and stays focusable.
  final bool readOnly;

  /// Fills the width it is given.
  final bool fullWidth;

  /// The picker's name for a screen reader, for one with no visible [label].
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// Hears every key pressed on the trigger that the trigger does not answer
  /// itself.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called when the trigger takes or loses the focus.
  final ValueChanged<bool>? onFocusChange;

  @override
  State<MPDateTimePicker> createState() => _MPDateTimePickerState();
}

class _MPDateTimePickerState extends State<MPDateTimePicker> {
  late DateTime? _own = widget.value ?? widget.initialValue;
  late bool _ownOpen = widget.initialOpen;
  final MPPickerSamples _samples = MPPickerSamples();
  late DateTime _month = _openingMonth();

  DateTime? get _value => widget.value ?? _own;

  bool get _open => widget.open ?? _ownOpen;

  DateTime _openingMonth() {
    return startOfMonth(widget.value ?? _own ?? widget.defaultMonth ?? todayDate());
  }

  @override
  void didUpdateWidget(MPDateTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.value != widget.value) {
      _own = widget.value;
    }

    if (widget.open == true && oldWidget.open != true) {
      _month = _openingMonth();
    }
  }

  void _setOpen(bool next) {
    if (next && (widget.readOnly || widget.disabled || MPFieldsetScope.disabledOf(context))) {
      return;
    }

    setState(() {
      if (next) {
        _month = _openingMonth();
      }

      if (widget.open == null) {
        _ownOpen = next;
      }
    });

    widget.onOpenChange?.call(next);
  }

  void _commit(DateTime? next) {
    setState(() => _own = next);
    widget.onChanged?.call(next);
  }

  /// Blocks a clock row whose whole span falls outside the bounds: the span
  /// test the time picker makes, moved onto the day the columns are writing
  /// into.
  bool _isTimeBlocked(DateTime candidate, MPTimeUnit unit) {
    final List<int> span = timeUnitSpan(unit, candidate);
    final DateTime? min = widget.minDate;
    final DateTime? max = widget.maxDate;

    // Built from the day and a count of seconds rather than by adding a
    // `Duration`, which is not a day's worth across a daylight-saving change.
    DateTime at(int seconds) =>
        DateTime(candidate.year, candidate.month, candidate.day, 0, 0, seconds);

    if (min != null && at(span[1]).isBefore(min)) {
      return true;
    }

    if (max != null && at(span[0]).isAfter(max)) {
      return true;
    }

    return widget.shouldDisableTime?.call(candidate, unit) ?? false;
  }

  void _selectDay(DateTime date) {
    // The day changes, the clock does not. A picker that reset the time to
    // midnight every time the date was corrected would make choosing a moment
    // an ordered task, and nobody reads a popup in the order it was written.
    final DateTime? value = _value;
    final DateTime next = value == null ? startOfDay(date) : mergeDateAndTime(date, value);

    _commit(next);
    setState(() => _month = startOfMonth(next));

    if (widget.closeOnSelect) {
      _setOpen(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPDateNames names = mpDateNamesOf(context, locale: widget.locale, names: widget.names);
    final Map<String, String> labels = mpMessagesOf(
      context,
      mpPickerMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );
    final bool hour12 = widget.hour12 ?? names.hour12;
    final DateTime? value = _value;

    // `hour12` reaches the trigger as well as the clock, for the reason the
    // time picker gives.
    String write(DateTime date) =>
        widget.format?.call(date) ?? names.dateTime(date, hour12: hour12);

    final DateTime moment = DateTime.now();
    final DateTime nowValue = withTime(moment, seconds: widget.showSeconds ? moment.second : 0);
    final bool nowBlocked =
        isDayOutside(nowValue, widget.minDate, widget.maxDate) ||
        (widget.shouldDisableDate?.call(nowValue) ?? false) ||
        _isTimeBlocked(nowValue, MPTimeUnit.second);
    final String? written = value == null ? null : write(value);

    return MPPickerShell(
      size: size,
      empty: value == null,
      open: _open,
      onOpenChange: _setOpen,
      formValue: value == null ? '' : toIsoDateTime(value, seconds: widget.showSeconds),
      display: written == null ? null : Text(written),
      semanticValue: written,
      placeholder: widget.placeholder,
      samples: _samples.of((names, widget.format, hour12), (DateTime date) => write(date)),
      clearable: widget.clearable,
      onClear: () => _commit(null),
      clearLabel: labels['clear']!,
      label: widget.label,
      floatingLabel: widget.floatingLabel,
      description: widget.description,
      errorMessage: widget.errorMessage,
      startIcon: mpPickerStartIcon(widget.startIcon, MPGlyphShape.calendar, size),
      required: widget.required,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      fullWidth: widget.fullWidth,
      semanticLabel: widget.semanticLabel,
      focusNode: widget.focusNode,
      autofocus: widget.autofocus,
      onKeyEvent: widget.onKeyEvent,
      onFocusChange: widget.onFocusChange,
      name: widget.name,
      locale: widget.locale,
      popup: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 6,
        children: <Widget>[
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                MPCalendarGrid(
                  size: size,
                  color: color,
                  names: names,
                  labels: labels,
                  weekStartsOn: widget.weekStartsOn ?? names.firstDayOfWeek,
                  month: _month,
                  onMonthChange: (DateTime next) => setState(() => _month = next),
                  selected: <DateTime?>[value],
                  onSelect: _selectDay,
                  minDate: widget.minDate,
                  maxDate: widget.maxDate,
                  shouldDisableDate: widget.shouldDisableDate,
                  autofocus: true,
                ),
                const MPPickerDivider(),
                Align(
                  alignment: AlignmentDirectional.topStart,
                  child: MPTimeGrid(
                    size: size,
                    color: color,
                    names: names,
                    labels: labels,
                    value: value,
                    // With no day chosen yet the clock writes onto today, and
                    // picking a day afterwards keeps whatever time was set.
                    referenceDate: value ?? todayDate(),
                    onChanged: _commit,
                    hour12: hour12,
                    showSeconds: widget.showSeconds,
                    hourStep: widget.hourStep,
                    minuteStep: widget.minuteStep,
                    secondStep: widget.secondStep,
                    shouldDisableTime: _isTimeBlocked,
                  ),
                ),
              ],
            ),
          ),
          MPPickerFooter(
            children: <Widget>[
              if (widget.clearable)
                MPPickerAction(
                  size: size,
                  color: color,
                  label: labels['clear']!,
                  onPressed: () {
                    _commit(null);
                    _setOpen(false);
                  },
                ),
              if (widget.showNowButton)
                MPPickerAction(
                  size: size,
                  color: color,
                  label: labels['now']!,
                  disabled: nowBlocked,
                  onPressed: () {
                    _commit(nowValue);
                    setState(() => _month = startOfMonth(nowValue));
                  },
                ),
              MPPickerAction(
                size: size,
                color: color,
                label: labels['done']!,
                filled: true,
                onPressed: () => _setOpen(false),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
