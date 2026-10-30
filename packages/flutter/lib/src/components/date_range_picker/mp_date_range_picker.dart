/// A span between two days.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/calendar.dart';
import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/picker.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/date.dart' show MPDateNames, MPDatePatterns;

/// Two ends, either of which may be missing.
///
/// One object rather than a pair of values or two parameters. A range is one
/// value: it is chosen in one gesture, cleared in one gesture and validated as
/// a whole, and the two names are what stop a caller writing the end into the
/// start. Half a range is a real state: it is what the picker holds between the
/// first press and the second.
@immutable
class MPDateRange {
  /// Creates a range from its two ends.
  const MPDateRange({this.start, this.end});

  /// The empty range, which is what a cleared picker holds.
  static const MPDateRange empty = MPDateRange();

  /// The first day.
  final DateTime? start;

  /// The last day.
  final DateTime? end;

  @override
  bool operator ==(Object other) =>
      other is MPDateRange && other.start == start && other.end == end;

  @override
  int get hashCode => Object.hash(start, end);

  @override
  String toString() => 'MPDateRange($start, $end)';
}

/// A named range offered as a shortcut beside the calendars.
@immutable
class MPDateRangePreset {
  /// A preset for a range that does not move: a fixed holiday, a quarter.
  const MPDateRangePreset({required this.label, required MPDateRange this.value}) : resolve = null;

  /// A preset worked out when it is pressed.
  ///
  /// Which is almost always what one is: "the last 7 days" worked out once,
  /// when the screen was built, is a range that is wrong for anyone who left
  /// the app open overnight.
  const MPDateRangePreset.computed({
    required this.label,
    required MPDateRange Function() this.resolve,
  }) : value = null;

  /// What the shortcut says. Usually a [Text].
  final Widget label;

  /// The range, for a preset that does not move.
  final MPDateRange? value;

  /// The function that works the range out, for one that does.
  final MPDateRange Function()? resolve;

  /// The range this preset stands for, now.
  MPDateRange get range => resolve?.call() ?? value!;
}

/// A span between two days.
///
/// ```dart
/// MPDateRangePicker(
///   label: const Text('Stay'),
///   value: stay,
///   onChanged: (MPDateRange next) => setState(() => stay = next),
/// )
/// ```
///
/// Two months side by side, because a range that crosses a month boundary is
/// the ordinary case and a one-month picker makes it a two-step navigation
/// problem. The two panels are one calendar in two halves: the left one has no
/// forward stepper, the right one has no back stepper, and either header's
/// month and year buttons move both.
///
/// The band between the ends is drawn as the pointer moves, before the second
/// press lands. That preview is the whole affordance: without it the first
/// press has no visible consequence and the control looks broken for the
/// second or so between the two.
///
/// The band is the accent's *container* tone under its own ink, and the two
/// ends are the accent proper: the pair MD3 uses for a selected range, and what
/// keeps the ends distinguishable from the days between them.
///
/// ## Controlled and uncontrolled
///
/// Left without [value], the picker keeps its own range, starting at
/// [initialValue]. Given one, it shows it and reports what it should become
/// through [onChanged]; a new [value] from the parent replaces whatever the
/// picker held.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPDateRangePicker extends StatefulWidget {
  /// Creates a date range picker.
  const MPDateRangePicker({
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
    this.locale,
    this.names,
    this.weekStartsOn,
    this.format,
    this.monthCount = 2,
    this.startPlaceholder,
    this.endPlaceholder,
    this.presets = const <MPDateRangePreset>[],
    this.clearable = false,
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
  }) : assert(monthCount == 1 || monthCount == 2, 'monthCount must be 1 or 2');

  /// The chosen range. Given, the picker shows it; see the class
  /// documentation.
  final MPDateRange? value;

  /// The range an uncontrolled picker starts on. The React build's
  /// `defaultValue`.
  final MPDateRange? initialValue;

  /// Called with the range as it is chosen. The React build's
  /// `onValueChange`.
  ///
  /// Always called with a range: a cleared one is [MPDateRange.empty] rather
  /// than `null`, so a caller never has to test two shapes for "empty". Half a
  /// range is reported as half a range, after the first press.
  final ValueChanged<MPDateRange>? onChanged;

  /// Whether the popup is open. Given, the parent drives it through
  /// [onOpenChange].
  final bool? open;

  /// Whether an uncontrolled picker starts open.
  final bool initialOpen;

  /// Called when the popup should open or close.
  final ValueChanged<bool>? onOpenChange;

  /// Which month the left calendar opens on when there is no value.
  final DateTime? defaultMonth;

  /// The earliest day that may be chosen. Day-granular.
  final DateTime? minDate;

  /// The latest day that may be chosen.
  final DateTime? maxDate;

  /// Blocks individual days.
  final bool Function(DateTime date)? shouldDisableDate;

  /// A BCP 47 tag deciding every name the calendars draw, how the trigger
  /// writes the two ends, and the words the picker says. Falls back to the
  /// nearest `MPLocaleProvider`, then to an [MPConfigProvider], then to the
  /// app's `Localizations`.
  final String? locale;

  /// The names and the shapes, in place of the library's own table for
  /// [locale].
  final MPDateNames? names;

  /// Which day the week starts on. Defaults to whatever the locale says.
  final MPWeekday? weekStartsOn;

  /// How the trigger writes each end. Left out, the locale's medium date.
  final String Function(DateTime value)? format;

  /// How many months are on screen at once: 1 or 2. Two is the default
  /// because a range that crosses a month boundary is the ordinary case, not
  /// the exception.
  final int monthCount;

  /// Shown in the start half of the trigger while that end is unchosen.
  final String? startPlaceholder;

  /// Shown in the end half while that end is unchosen.
  final String? endPlaceholder;

  /// Shortcuts listed beside the calendars: "Last 7 days", "This month".
  final List<MPDateRangePreset> presets;

  /// Offers the × in the trigger and the word in the footer that empty the
  /// control.
  final bool clearable;

  /// Closes the popup once both ends are chosen.
  final bool closeOnSelect;

  /// Overrides for the words the picker says on its own behalf, by key of the
  /// `picker` namespace: `start` and `end` are the footer's hint.
  final Map<String, String>? labels;

  /// The name an `MPForm` files the value under, as an ISO 8601 interval,
  /// `2026-07-03/2026-07-09`, once both ends are chosen.
  final String? name;

  /// Which rung of the size ladder: the trigger and one calendar cell alike.
  final MPSize? size;

  /// Which accent family the popup reads: the ends, the band, today, the
  /// footer.
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

  /// Content placed before the value. Defaults to the calendar glyph, and
  /// `null` asks for none.
  final Widget? startIcon;

  /// Marks the picker required, and holds an `MPForm` back until both ends
  /// are chosen.
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
  State<MPDateRangePicker> createState() => _MPDateRangePickerState();
}

class _MPDateRangePickerState extends State<MPDateRangePicker> {
  late MPDateRange _own = widget.value ?? widget.initialValue ?? MPDateRange.empty;
  late bool _ownOpen = widget.initialOpen;
  final MPPickerSamples _samples = MPPickerSamples();
  late DateTime _month = _openingMonth();

  /// The first of the two presses. Held here rather than in the value so a
  /// controlled caller is never handed a range whose first end is still being
  /// previewed: half a selection is this component's business, until it is
  /// reported as half a range.
  DateTime? _anchor;

  /// The day under the pointer while a range is half chosen.
  DateTime? _preview;

  MPDateRange get _value => widget.value ?? _own;

  bool get _open => widget.open ?? _ownOpen;

  DateTime _openingMonth() {
    return startOfMonth(_value.start ?? widget.defaultMonth ?? todayDate());
  }

  @override
  void didUpdateWidget(MPDateRangePicker oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.value != widget.value) {
      _own = widget.value ?? MPDateRange.empty;
    }

    if (widget.open != oldWidget.open && widget.open != null) {
      _settle(widget.open!);
    }
  }

  /// Opening puts the calendars back on the start; closing drops an abandoned
  /// half-selection, which does not survive the popup going away.
  void _settle(bool open) {
    if (open) {
      _month = _openingMonth();
    } else {
      _anchor = null;
      _preview = null;
    }
  }

  void _setOpen(bool next) {
    if (next && (widget.readOnly || widget.disabled || MPFieldsetScope.disabledOf(context))) {
      return;
    }

    setState(() {
      _settle(next);

      if (widget.open == null) {
        _ownOpen = next;
      }
    });

    widget.onOpenChange?.call(next);
  }

  void _commit(MPDateRange next) {
    setState(() => _own = next);
    widget.onChanged?.call(next);
  }

  void _select(DateTime date) {
    final DateTime day = startOfDay(date);
    final DateTime? anchor = _anchor;

    // The first press of a new selection: there is no anchor, or the range is
    // already complete and this press starts over.
    if (anchor == null) {
      setState(() {
        _anchor = day;
        _preview = day;
      });
      _commit(MPDateRange(start: day));

      return;
    }

    // The second. Pressing backwards is not a mistake to be rejected, it is
    // the same range given in the other order.
    final bool backwards = compareDay(day, anchor) < 0;

    setState(() {
      _anchor = null;
      _preview = null;
    });
    _commit(MPDateRange(start: backwards ? day : anchor, end: backwards ? anchor : day));

    if (widget.closeOnSelect) {
      _setOpen(false);
    }
  }

  void _applyPreset(MPDateRangePreset preset) {
    final MPDateRange range = preset.range;

    setState(() {
      _anchor = null;
      _preview = null;

      if (range.start != null) {
        _month = startOfMonth(range.start!);
      }
    });
    _commit(range);

    if (widget.closeOnSelect) {
      _setOpen(false);
    }
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
    final bool disabled = widget.disabled || MPFieldsetScope.disabledOf(context);
    final DateTime? start = _value.start;
    final DateTime? end = _value.end;
    final DateTime? anchor = _anchor;
    final bool twoUp = widget.monthCount == 2;

    String write(DateTime date) => widget.format?.call(date) ?? names.medium(date);

    // Every date either half could show, so neither end of the trigger
    // changes width as the range is filled in.
    final List<String> samples = _samples.of((names, widget.format), write);

    // Neither half takes an equal share. Two equal halves would size the
    // trigger to twice the shorter of the two; each taking its own width sizes
    // the control to what it actually has to say. Each carries its own sizer
    // for the same reason.
    Widget half(DateTime? date, String? placeholder) {
      return Flexible(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            if (date != null)
              Text(write(date))
            else
              Text(
                placeholder ?? '',
                style: TextStyle(color: MPFieldPaint.muted(colors, disabled: disabled)),
              ),
            if (!widget.fullWidth)
              MPWidthSizer(
                samples: <String>[...samples, ?placeholder],
                style: MPFieldMetrics.of(size).text(theme.typescale).style(),
              ),
          ],
        ),
      );
    }

    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    final Widget halves = Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 6,
      children: <Widget>[
        half(start, widget.startPlaceholder),
        // The arrow points the way the line reads.
        MPGlyph(
          MPGlyphShape.arrowRight,
          size: mpControlIcon[size],
          color: MPFieldPaint.muted(colors, disabled: disabled),
          quarterTurns: rtl ? 2 : 0,
        ),
        half(end, widget.endPlaceholder),
      ],
    );

    // What the band is drawn between: the finished range, or the anchor and
    // whatever the pointer is over.
    final DateTime? bandStart = anchor ?? start;
    final DateTime? bandEnd = anchor != null ? _preview : end;

    // Which end the next press fills. The trigger says the same thing with
    // its two halves, but the trigger is behind the popup while the popup is
    // up, so the footer is the only place that can say it where it is read.
    final String? hint = anchor != null
        ? labels['end']
        : start == null
        ? labels['start']
        : null;

    MPCalendarGrid calendar({required bool second}) {
      return MPCalendarGrid(
        size: size,
        color: color,
        names: names,
        labels: labels,
        weekStartsOn: widget.weekStartsOn ?? names.firstDayOfWeek,
        month: second ? addMonths(_month, 1) : _month,
        // The right panel is a month ahead, so moving it means moving the
        // pair: both headers drive one number.
        onMonthChange: (DateTime next) =>
            setState(() => _month = second ? addMonths(next, -1) : next),
        selected: <DateTime?>[start, end, anchor],
        rangeStart: bandStart,
        rangeEnd: bandEnd,
        onSelect: _select,
        onPreviewChange: (DateTime? date) {
          if (_anchor != null) {
            setState(() => _preview = date ?? _anchor);
          }
        },
        minDate: widget.minDate,
        maxDate: widget.maxDate,
        shouldDisableDate: widget.shouldDisableDate,
        // With both panels showing six full weeks, the 1st of August is a
        // trailing day of the July panel and the first day of the August one,
        // and two cells with one name in a popup is broken to a screen reader.
        showOutsideDays: false,
        showPreviousButton: !second,
        showNextButton: second || !twoUp,
        autofocus: !second,
      );
    }

    final double cell = mpCalendarCell[size]!;
    final bool hasFooter = widget.clearable || hint != null;

    return MPPickerShell(
      size: size,
      empty: start == null && end == null,
      open: _open,
      onOpenChange: _setOpen,
      // One string for the pair, and only once both ends are chosen: half a
      // range does not answer a required one.
      formValue: start != null && end != null ? '${toIsoDate(start)}/${toIsoDate(end)}' : '',
      display: halves,
      emptyDisplay: halves,
      semanticValue: start == null && end == null
          ? null
          : '${start == null ? '' : write(start)} – ${end == null ? '' : write(end)}',
      clearable: widget.clearable,
      onClear: () => _commit(MPDateRange.empty),
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
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: <Widget>[
                if (widget.presets.isNotEmpty)
                  Container(
                    constraints: BoxConstraints(maxHeight: cell * 8),
                    padding: const EdgeInsetsDirectional.only(end: 6),
                    decoration: BoxDecoration(
                      border: BorderDirectional(end: BorderSide(color: colors.outlineVariant)),
                    ),
                    child: SingleChildScrollView(
                      primary: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          for (final MPDateRangePreset preset in widget.presets)
                            MPButton(
                              variant: MPVariant.text,
                              size: mpCalendarHeaderSize[size],
                              color: color,
                              onPressed: () => _applyPreset(preset),
                              child: preset.label,
                            ),
                        ],
                      ),
                    ),
                  ),
                calendar(second: false),
                if (twoUp) calendar(second: true),
              ],
            ),
          ),
          if (hasFooter)
            MPPickerFooter(
              children: <Widget>[
                if (hint != null)
                  Expanded(
                    child: Text(
                      hint,
                      style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                    ),
                  ),
                if (widget.clearable)
                  MPPickerAction(
                    size: size,
                    color: color,
                    label: labels['clear']!,
                    onPressed: () {
                      setState(() {
                        _anchor = null;
                        _preview = null;
                      });
                      _commit(MPDateRange.empty);
                      _setOpen(false);
                    },
                  ),
              ],
            ),
        ],
      ),
    );
  }
}
