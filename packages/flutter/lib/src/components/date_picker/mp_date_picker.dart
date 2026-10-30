/// One day, chosen from a calendar.
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
    show MPDateNames, MPDatePatterns, MPDatePrecision;

/// One day, chosen from a calendar.
///
/// ```dart
/// MPDatePicker(
///   label: const Text('Due date'),
///   value: due,
///   onChanged: (DateTime? next) => setState(() => due = next),
/// )
/// ```
///
/// The trigger is a text field's shell wearing a calendar glyph, on purpose: a
/// form where the date field is a different height, radius or outline weight
/// from the fields around it is a form that looks assembled rather than
/// designed.
///
/// What the calendar is actually for is its header. A picker that only steps
/// a month at a time puts a birthday thirty years back a hundred and eighty
/// presses away, so the month name and the year are each a button that opens a
/// grid of its own: twelve months, then twelve years at a time. That is MD3's
/// own docked date picker, drawn on MD3's own numbers: a 40dp cell, a filled
/// circle for the chosen day, an outlined one for today.
///
/// ## A day, a month, or a year
///
/// [precision] decides which of the three the calendar stops at, and it stops
/// by leaving the finer views out rather than by refusing them. Everything
/// downstream follows: how the trigger writes the value, what a form is handed,
/// and whether the footer's shortcut says *Today*, *This month* or *This year*.
///
/// ## Where the words come from
///
/// The month and weekday names, which day the week starts on, the order of the
/// header's two buttons and how the trigger writes the date all follow
/// [locale], from the library's own table for each of the eighteen languages
/// it ships words for. [names] is the way in for any other.
///
/// ## Controlled and uncontrolled
///
/// Left without [value], the picker keeps its own day, starting at
/// [initialValue]. Given one, it shows it and reports what it should become
/// through [onChanged]; a new [value] from the parent, `null` included,
/// replaces whatever the picker held. [open] works the same way, with
/// [initialOpen].
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPDatePicker extends StatefulWidget {
  /// Creates a date picker.
  const MPDatePicker({
    this.value,
    this.initialValue,
    this.onChanged,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.precision = MPDatePrecision.day,
    this.defaultMonth,
    this.minDate,
    this.maxDate,
    this.shouldDisableDate,
    this.locale,
    this.names,
    this.weekStartsOn,
    this.format,
    this.placeholder,
    this.clearable = false,
    this.showTodayButton = true,
    this.closeOnSelect = true,
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

  /// The chosen day. Given, the picker shows it; see the class documentation.
  final DateTime? value;

  /// The day an uncontrolled picker starts on. The React build's
  /// `defaultValue`.
  final DateTime? initialValue;

  /// Called with the newly chosen day, or `null` when the picker is emptied.
  /// The React build's `onValueChange`.
  final ValueChanged<DateTime?>? onChanged;

  /// Whether the calendar is open. Given, the parent drives it through
  /// [onOpenChange].
  final bool? open;

  /// Whether an uncontrolled picker starts open.
  final bool initialOpen;

  /// Called when the calendar should open or close.
  final ValueChanged<bool>? onOpenChange;

  /// Which unit the picker asks for.
  ///
  /// [MPDatePrecision.month] stops the calendar at its grid of twelve months
  /// and answers with the 1st of the one that is pressed;
  /// [MPDatePrecision.year] stops at the grid of years and answers with 1
  /// January. A card's expiry, a fiscal year, the month a report covers.
  final MPDatePrecision precision;

  /// Which month the calendar opens on when there is no value. This month,
  /// when left out.
  final DateTime? defaultMonth;

  /// The earliest day that may be chosen. Day-granular: the time is ignored.
  ///
  /// Read at whatever [precision] asks for: a minimum of 10 July still leaves
  /// July pickable on a month picker, because there the bound is about which
  /// months exist.
  final DateTime? minDate;

  /// The latest day that may be chosen.
  final DateTime? maxDate;

  /// Blocks individual days that are inside the range but still not available:
  /// weekends, holidays, a room that is already booked.
  ///
  /// Asked about days and only about days, so a picker whose [precision] is a
  /// month or a year never consults it.
  final bool Function(DateTime date)? shouldDisableDate;

  /// A BCP 47 tag deciding the month and weekday names, the order of the
  /// header's two buttons, which day the week starts on, how the trigger
  /// writes the date, and the words the picker says. Falls back to the nearest
  /// `MPLocaleProvider`, then to an [MPConfigProvider], then to the app's
  /// `Localizations`.
  final String? locale;

  /// The month and weekday names and the date shapes, in place of the
  /// library's own table for [locale].
  final MPDateNames? names;

  /// Which day the week starts on. Defaults to whatever the locale says.
  final MPWeekday? weekStartsOn;

  /// How the trigger writes the chosen day.
  ///
  /// A function rather than React's `Intl.DateTimeFormatOptions`, since there
  /// is no `Intl` to hand options to. Left out, it follows [precision]: a
  /// medium date, the month and year, or the year, in the locale's own shape.
  final String Function(DateTime value)? format;

  /// Shown in the trigger while nothing is chosen.
  final String? placeholder;

  /// Offers the × in the trigger and the word in the footer that empty the
  /// control.
  final bool clearable;

  /// Offers the shortcut to today in the footer. It lands on whatever unit is
  /// being asked for, and says so: *Today*, *This month* or *This year*.
  final bool showTodayButton;

  /// Closes the popup as soon as a day is chosen.
  final bool closeOnSelect;

  /// Overrides for the words the picker says on its own behalf, by key of the
  /// `picker` namespace. Whatever is not given falls back to the translation
  /// for [locale], and then to English.
  final Map<String, String>? labels;

  /// The name an `MPForm` files the value under, as `YYYY-MM-DD`, or as
  /// `YYYY-MM` or `YYYY` when [precision] asks for less.
  final String? name;

  /// Which rung of the size ladder: the trigger and one calendar cell alike.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the popup reads: the chosen day's fill, today's
  /// outline, the footer's buttons.
  final MPColor? color;

  /// The label, drawn in the outline's notch. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the trigger's line while there is nothing to
  /// make room for. The picker's own glyph stands where a resting label would,
  /// so this only takes effect on a picker asked for without one, `startIcon:
  /// null`.
  final bool floatingLabel;

  /// The line under the control. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the control, and the error state with it.
  final Widget? errorMessage;

  /// Content placed before the value. Defaults to the calendar glyph, and
  /// `null` asks for none.
  final Widget? startIcon;

  /// Marks the picker required, to a screen reader and with an asterisk on the
  /// label, and holds an `MPForm` back while nothing is chosen.
  final bool required;

  /// Greys the picker out and stops it opening.
  final bool disabled;

  /// Shows the value without allowing it to be changed, and stays focusable.
  /// The popup does not open either: a calendar whose every cell was inert
  /// would be a menu of nothing.
  final bool readOnly;

  /// Fills the width it is given rather than the width of the longest date it
  /// could show.
  final bool fullWidth;

  /// The picker's name for a screen reader, for one with no visible [label].
  /// The React build's `aria-label`.
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  /// Hears every key pressed on the trigger that the trigger does not answer
  /// itself. The React build's `onKeyDown`.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Called when the trigger takes or loses the focus. The React build's
  /// `onFocus` and `onBlur`.
  final ValueChanged<bool>? onFocusChange;

  @override
  State<MPDatePicker> createState() => _MPDatePickerState();
}

class _MPDatePickerState extends State<MPDatePicker> {
  late DateTime? _own = widget.value ?? widget.initialValue;
  late bool _ownOpen = widget.initialOpen;
  final MPPickerSamples _samples = MPPickerSamples();
  late DateTime _month = _openingMonth();

  DateTime? get _value => widget.value ?? _own;

  bool get _open => widget.open ?? _ownOpen;

  bool get _inert => widget.readOnly || widget.disabled || MPFieldsetScope.disabledOf(context);

  DateTime _openingMonth() {
    return startOfMonth(widget.value ?? _own ?? widget.defaultMonth ?? todayDate());
  }

  @override
  void didUpdateWidget(MPDatePicker oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.value != widget.value) {
      _own = widget.value;
    }

    // A popup opened from outside starts on the chosen day too.
    if (widget.open == true && oldWidget.open != true) {
      _month = _openingMonth();
    }
  }

  void _setOpen(bool next) {
    if (next && _inert) {
      return;
    }

    // Opening puts the calendar back on the chosen day. Without this, a
    // picker left on 2019 while browsing stays there the next time it is
    // opened, which reads as the control having forgotten its own value.
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

  void _select(DateTime date) {
    // Trimmed to the unit that was asked for, so a month picker's value is the
    // month rather than whichever day the shortcut happened to arrive on.
    final DateTime at = startOfUnit(date, widget.precision);
    // The unit changes; the time of day, if the value had one, does not.
    final DateTime? value = _value;
    final DateTime next = value == null ? at : mergeDateAndTime(at, value);

    _commit(next);
    setState(() => _month = startOfMonth(next));

    if (widget.closeOnSelect) {
      _setOpen(false);
    }
  }

  String _write(DateTime date, MPDateNames names) {
    final String Function(DateTime value)? format = widget.format;

    if (format != null) {
      return format(date);
    }

    return switch (widget.precision) {
      MPDatePrecision.day => names.medium(date),
      MPDatePrecision.month => names.monthYear(date),
      MPDatePrecision.year => names.year(date),
    };
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
    final DateTime? value = _value;
    final MPDatePrecision precision = widget.precision;

    final DateTime now = todayDate();
    // The bounds at the precision being asked for, and `shouldDisableDate`
    // only where there are days for it to have an opinion about.
    final bool nowBlocked =
        isUnitOutside(now, precision, widget.minDate, widget.maxDate) ||
        (precision == MPDatePrecision.day && (widget.shouldDisableDate?.call(now) ?? false));
    final String nowLabel = switch (precision) {
      MPDatePrecision.day => labels['today']!,
      MPDatePrecision.month => labels['thisMonth']!,
      MPDatePrecision.year => labels['thisYear']!,
    };
    final bool hasFooter = widget.showTodayButton || widget.clearable;
    final String? written = value == null ? null : _write(value, names);

    return MPPickerShell(
      size: size,
      empty: value == null,
      open: _open,
      onOpenChange: _setOpen,
      formValue: value == null ? '' : toIsoUnit(value, precision),
      display: written == null ? null : Text(written),
      semanticValue: written,
      placeholder: widget.placeholder,
      // Every date the trigger could write, so choosing the 1st after the 28th
      // does not shrink the field.
      samples: _samples.of((
        names,
        widget.format,
        precision,
      ), (DateTime date) => _write(date, names)),
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
        spacing: hasFooter ? 6 : 0,
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
            onSelect: _select,
            minDate: widget.minDate,
            maxDate: widget.maxDate,
            shouldDisableDate: precision == MPDatePrecision.day ? widget.shouldDisableDate : null,
            precision: precision,
            autofocus: true,
          ),
          if (hasFooter)
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
                if (widget.showTodayButton)
                  MPPickerAction(
                    size: size,
                    color: color,
                    label: nowLabel,
                    disabled: nowBlocked,
                    onPressed: () => _select(now),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}
