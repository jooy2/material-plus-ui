/// A month on the page, rather than in a popup.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/calendar.dart';
import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/picker.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/date.dart'
    show MPDateNames, MPDatePatterns, MPDatePrecision;

/// A month on the page, rather than in a popup.
///
/// The same grid `MPDatePicker` opens, and it was always the larger half of
/// that component: three views on one footprint, a roving tab stop, arrow keys
/// that step the month when they run off an edge, and a header where the month
/// name and the year are each a button into a grid of their own. What it did
/// not have was a way to be used without a trigger in front of it.
///
/// ```dart
/// MPCalendar(
///   value: day,
///   onChanged: (DateTime next) => setState(() => day = next),
/// )
/// ```
///
/// ## It paints nothing by default
///
/// [variant] is [MPVariant.text], so what arrives is the grid and the header
/// and no surface under them: a standalone calendar almost always lands
/// somewhere that is already a surface, and a default that painted a second
/// one would be a box inside a box. Give it [MPVariant.outlined] or
/// [MPVariant.elevated] to have it stand on its own.
///
/// ## The month on screen is its own state
///
/// And it stays where the reader left it. A date picker puts its calendar back
/// on the chosen day every time its popup opens, because opening is an event
/// that says "start again"; a calendar that is always on screen has no such
/// moment. [month] and [onMonthChange] are there for the cases that do want to
/// drive it.
///
/// ## Controlled and uncontrolled
///
/// Left without [value], the calendar keeps its own day, starting at
/// [initialValue]. Given one, it shows it and reports what it should become
/// through [onChanged]; a new [value] from the parent, `null` included,
/// replaces whatever the calendar held.
class MPCalendar extends StatefulWidget {
  /// Creates a calendar.
  const MPCalendar({
    this.value,
    this.initialValue,
    this.onChanged,
    this.month,
    this.defaultMonth,
    this.onMonthChange,
    this.precision = MPDatePrecision.day,
    this.minDate,
    this.maxDate,
    this.shouldDisableDate,
    this.locale,
    this.names,
    this.weekStartsOn,
    this.showOutsideDays = true,
    this.showPreviousButton = true,
    this.showNextButton = true,
    this.autofocus = false,
    this.variant = MPVariant.text,
    this.size,
    this.color,
    this.labels,
    this.name,
    super.key,
  });

  /// The chosen day. Given, the calendar shows it; see the class
  /// documentation.
  final DateTime? value;

  /// The day an uncontrolled calendar starts on. The React build's
  /// `defaultValue`.
  final DateTime? initialValue;

  /// Called with the newly chosen day. The React build's `onValueChange`.
  ///
  /// Never `null`, unlike a date picker's: there is no × on a calendar and
  /// pressing the chosen day again does not unchoose it. A control that emptied
  /// itself on a second press would lose a value to a double tap.
  final ValueChanged<DateTime>? onChanged;

  /// The month on screen. Given, the header is driven from outside: two
  /// calendars kept a month apart, a "jump to December" button of your own.
  final DateTime? month;

  /// Which month it opens on: the month of [value], or this month, when left
  /// out.
  final DateTime? defaultMonth;

  /// Called when the header steps, or when choosing a month or a year moves
  /// it.
  final ValueChanged<DateTime>? onMonthChange;

  /// Which unit the calendar stops at, and therefore what a press answers with.
  ///
  /// [MPDatePrecision.month] never draws a day grid and answers with the 1st of
  /// the month pressed; [MPDatePrecision.year] stops at the grid of years and
  /// answers with 1 January. The finer views are absent rather than refused.
  final MPDatePrecision precision;

  /// The earliest day that may be chosen. Day-granular: the time is ignored.
  final DateTime? minDate;

  /// The latest day that may be chosen.
  final DateTime? maxDate;

  /// Blocks individual days that are inside the range but still not available:
  /// weekends, holidays, a room already booked. A blocked day is still drawn.
  ///
  /// Asked about days and only about days, so a calendar whose [precision] is a
  /// month or a year never consults it.
  final bool Function(DateTime date)? shouldDisableDate;

  /// A BCP 47 tag deciding the month and weekday names, the order of the
  /// header's two buttons, which day the week starts on, and the words the
  /// calendar says. Falls back to the nearest `MPLocaleProvider`, then to an
  /// [MPConfigProvider], then to the app's `Localizations`.
  final String? locale;

  /// The month and weekday names and the date shapes, in place of the
  /// library's own table for [locale]: for a language or a region it does not
  /// carry.
  final MPDateNames? names;

  /// Which day the week starts on. Defaults to whatever the locale says.
  final MPWeekday? weekStartsOn;

  /// Draws the leading and trailing days belonging to the neighbouring months.
  final bool showOutsideDays;

  /// Whether the header offers its back stepper.
  final bool showPreviousButton;

  /// Whether the header offers its forward stepper.
  final bool showNextButton;

  /// Takes the focus on mount.
  ///
  /// `false` here and `true` inside a picker, which is the whole difference
  /// between the two: a popup that has just opened is the reader's current
  /// business, and a calendar sitting in a page is not.
  final bool autofocus;

  /// How much surface the calendar paints under itself. [MPVariant.text],
  /// nothing, unless it is asked for.
  final MPVariant variant;

  /// The cell size and the type scale. [MPSize.md], 40 a cell, unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the chosen day is painted in.
  final MPColor? color;

  /// Overrides for the words the calendar says on its own behalf, by key of
  /// the `picker` namespace: `previousMonth`, `chooseYear`. Whatever is not
  /// given falls back to the translation for [locale], and then to English.
  final Map<String, String>? labels;

  /// The name an `MPForm` files the value under, as `YYYY-MM-DD`, or as
  /// `YYYY-MM` or `YYYY` when [precision] asks for less.
  final String? name;

  @override
  State<MPCalendar> createState() => _MPCalendarState();
}

class _MPCalendarState extends State<MPCalendar> {
  late DateTime? _own = widget.value ?? widget.initialValue;

  late DateTime _ownMonth = startOfMonth(
    widget.value ?? widget.initialValue ?? widget.defaultMonth ?? todayDate(),
  );

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => _value == null ? '' : toIsoUnit(_value!, widget.precision),
    validate: () => null,
    focus: () {},
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  DateTime? get _value => widget.value ?? _own;

  DateTime get _month => widget.month == null ? _ownMonth : startOfMonth(widget.month!);

  @override
  void didUpdateWidget(MPCalendar oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A value the parent changed replaces the calendar's own, `null` included,
    // which is how a controlled calendar is emptied.
    if (oldWidget.value != widget.value) {
      _own = widget.value;
    }
  }

  @override
  void dispose() {
    _form.dispose();
    super.dispose();
  }

  void _changeMonth(DateTime next) {
    if (widget.month == null) {
      setState(() => _ownMonth = next);
    }

    widget.onMonthChange?.call(next);
  }

  void _select(DateTime date) {
    // Trimmed to the unit that was asked for, so a month calendar's value is
    // the month rather than whichever day the grid handed over.
    final DateTime at = startOfUnit(date, widget.precision);
    // The unit changes; the time of day, if the value had one, does not. A
    // calendar bound to a field that also carries a time should not reset it
    // to midnight every time the day is corrected.
    final DateTime? value = _value;
    final DateTime next = value == null ? at : mergeDateAndTime(at, value);

    setState(() => _own = next);
    widget.onChanged?.call(next);
    _form.changed();
    _changeMonth(startOfMonth(next));
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
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

    _form.bind(context, name: widget.name);

    final Widget grid = MPCalendarGrid(
      size: size,
      color: color,
      names: names,
      labels: labels,
      weekStartsOn: widget.weekStartsOn ?? names.firstDayOfWeek,
      month: _month,
      onMonthChange: _changeMonth,
      selected: <DateTime?>[_value],
      onSelect: _select,
      minDate: widget.minDate,
      maxDate: widget.maxDate,
      shouldDisableDate: widget.precision == MPDatePrecision.day ? widget.shouldDisableDate : null,
      showOutsideDays: widget.showOutsideDays,
      showPreviousButton: widget.showPreviousButton,
      showNextButton: widget.showNextButton,
      precision: widget.precision,
      autofocus: widget.autofocus,
    );

    // The room only exists once there is a surface to hold it. A `text`
    // calendar is the bare grid, and padding it would push it off the
    // alignment of whatever it was dropped beside.
    if (widget.variant == MPVariant.text) {
      return grid;
    }

    final MPContainerPaint paint = mpContainerPaint(colors, widget.variant);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: paint.color,
        border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
        borderRadius: BorderRadius.circular(theme.shapes.medium),
        boxShadow: paint.shadows,
      ),
      child: Padding(
        padding: EdgeInsets.all(mpPickerPopupPad[size]!),
        child: DefaultTextStyle.merge(
          style: TextStyle(color: colors.onSurface),
          child: grid,
        ),
      ),
    );
  }
}
