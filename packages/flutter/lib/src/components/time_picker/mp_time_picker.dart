/// A time of day, chosen from columns.
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

/// A time of day, chosen from columns.
///
/// ```dart
/// MPTimePicker(
///   label: const Text('Start'),
///   value: start,
///   onChanged: (DateTime? next) => setState(() => start = next),
/// )
/// ```
///
/// The bounds are checked at the granularity of the column being drawn, which
/// is the detail that separates a working time picker from a frustrating one.
/// With a [minTime] of 09:30 the hour `9` stays available, because the hour
/// *contains* allowed minutes, and it is the minute column that greys out `00`
/// through `25`. The naive check compares the whole candidate instant, hides
/// the 9 entirely, and makes half past nine unreachable.
///
/// The value is a [DateTime] rather than a string or a number of minutes,
/// because everything else in this library that carries a moment is one, and
/// because a time on its own has nowhere to record which day it is on.
/// [referenceDate] is the day a bare time is written onto.
///
/// ## Columns, not MD3's dial
///
/// This is the one place the library knowingly draws something the
/// specification draws differently. A dial is a pointer control, MD3 ships a
/// second "time input" mode precisely because a dial cannot serve a keyboard,
/// and a component with two implementations of one question has the accessible
/// one hidden behind a toggle. Columns answer both readers at once.
///
/// ## Controlled and uncontrolled
///
/// Left without [value], the picker keeps its own time, starting at
/// [initialValue]. Given one, it shows it and reports what it should become
/// through [onChanged]; a new [value] from the parent, `null` included,
/// replaces whatever the picker held.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPTimePicker extends StatefulWidget {
  /// Creates a time picker.
  const MPTimePicker({
    this.value,
    this.initialValue,
    this.onChanged,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.referenceDate,
    this.minTime,
    this.maxTime,
    this.shouldDisableTime,
    this.hour12,
    this.showSeconds = false,
    this.hourStep = 1,
    this.minuteStep = 1,
    this.secondStep = 1,
    this.locale,
    this.names,
    this.format,
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

  /// The chosen time, a [DateTime] so it carries a day as well: see
  /// [referenceDate].
  final DateTime? value;

  /// The time an uncontrolled picker starts on. The React build's
  /// `defaultValue`.
  final DateTime? initialValue;

  /// Called with the newly chosen time, or `null` when the picker is emptied.
  /// The React build's `onValueChange`.
  final ValueChanged<DateTime?>? onChanged;

  /// Whether the clock is open. Given, the parent drives it through
  /// [onOpenChange].
  final bool? open;

  /// Whether an uncontrolled picker starts open.
  final bool initialOpen;

  /// Called when the clock should open or close.
  final ValueChanged<bool>? onOpenChange;

  /// The day a chosen time is written onto while there is no value yet. Today,
  /// held still for as long as the picker is up, when left out: a popup left
  /// open across midnight does not quietly move the value onto a new day.
  final DateTime? referenceDate;

  /// The earliest time of day that may be chosen. Only the clock is read.
  final DateTime? minTime;

  /// The latest time of day that may be chosen.
  final DateTime? maxTime;

  /// Blocks individual rows. Called once per row per column with the instant
  /// that row would produce and the column it is in, so a rule may be as
  /// coarse as "no afternoons" or as fine as one minute.
  final bool Function(DateTime value, MPTimeUnit unit)? shouldDisableTime;

  /// A 12-hour dial with an AM/PM column. Defaults to whatever the locale
  /// does.
  final bool? hour12;

  /// Adds the seconds column.
  final bool showSeconds;

  /// How far apart the rows of the hours column are. Held between 1 and the
  /// column's own span: a step of nought has no number of rows at all, and one
  /// wider than the column leaves the single row it can offer.
  final int hourStep;

  /// How far apart the minutes are. See [hourStep].
  final int minuteStep;

  /// How far apart the seconds are. See [hourStep].
  final int secondStep;

  /// A BCP 47 tag deciding whether the clock is 12- or 24-hour, what AM and
  /// PM are called, how the trigger writes the time, and the words the picker
  /// says. Falls back to the nearest `MPLocaleProvider`, then to an
  /// [MPConfigProvider], then to the app's `Localizations`.
  final String? locale;

  /// AM, PM, the 12- or 24-hour default and the time's shape, in place of the
  /// library's own table for [locale].
  final MPDateNames? names;

  /// How the trigger writes the chosen time. Left out, the locale's own shape
  /// on the dial [hour12] picks, with the seconds when they are shown.
  final String Function(DateTime value)? format;

  /// Shown in the trigger while nothing is chosen.
  final String? placeholder;

  /// Offers the × in the trigger and the word in the footer that empty the
  /// control.
  final bool clearable;

  /// Offers the shortcut to the current time in the footer.
  final bool showNowButton;

  /// Closes the popup as soon as any column is touched.
  ///
  /// `false` by default, unlike a date picker: a time is two answers, and
  /// closing after the first would make choosing 9:30 a matter of opening the
  /// popup twice. While it is off the footer carries *Done*.
  final bool closeOnSelect;

  /// Overrides for the words the picker says on its own behalf, by key of the
  /// `picker` namespace.
  final Map<String, String>? labels;

  /// The name an `MPForm` files the value under, as `HH:MM` (`HH:MM:SS` with
  /// [showSeconds]).
  final String? name;

  /// Which rung of the size ladder: the trigger and one row of the clock.
  final MPSize? size;

  /// Which accent family the chosen rows and the footer read.
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

  /// Content placed before the value. Defaults to the clock glyph, and `null`
  /// asks for none.
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
  State<MPTimePicker> createState() => _MPTimePickerState();
}

class _MPTimePickerState extends State<MPTimePicker> {
  late DateTime? _own = widget.value ?? widget.initialValue;
  late bool _ownOpen = widget.initialOpen;
  final MPPickerSamples _samples = MPPickerSamples();

  /// Held still for as long as the picker is mounted.
  late final DateTime _fallbackDay = widget.referenceDate ?? DateTime.now();

  DateTime? get _value => widget.value ?? _own;

  bool get _open => widget.open ?? _ownOpen;

  DateTime get _referenceDate => widget.referenceDate ?? _fallbackDay;

  @override
  void didUpdateWidget(MPTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.value != widget.value) {
      _own = widget.value;
    }
  }

  void _setOpen(bool next) {
    if (next && (widget.readOnly || widget.disabled || MPFieldsetScope.disabledOf(context))) {
      return;
    }

    if (widget.open == null) {
      setState(() => _ownOpen = next);
    }

    widget.onOpenChange?.call(next);
  }

  void _commit(DateTime? next) {
    setState(() => _own = next);
    widget.onChanged?.call(next);
  }

  /// Whether a row's whole span falls outside the bounds, or a rule blocks it.
  bool _isBlocked(DateTime candidate, MPTimeUnit unit) {
    final List<int> span = timeUnitSpan(unit, candidate);
    final DateTime? min = widget.minTime;
    final DateTime? max = widget.maxTime;

    if (min != null && span[1] < secondsOfDay(min)) {
      return true;
    }

    if (max != null && span[0] > secondsOfDay(max)) {
      return true;
    }

    return widget.shouldDisableTime?.call(candidate, unit) ?? false;
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

    // `hour12` reaches the trigger as well as the columns: a picker whose dial
    // is 24-hour and whose trigger still says "9:05 AM" is a control
    // disagreeing with itself. A `format` of the caller's still wins.
    String write(DateTime date) {
      return widget.format?.call(date) ??
          names.time(date, hour12: hour12, seconds: widget.showSeconds);
    }

    final DateTime now = DateTime.now();
    final DateTime nowValue = withTime(
      _referenceDate,
      hours: now.hour,
      minutes: now.minute,
      seconds: widget.showSeconds ? now.second : 0,
    );
    final bool hasFooter = widget.showNowButton || widget.clearable || !widget.closeOnSelect;
    final String? written = value == null ? null : write(value);

    return MPPickerShell(
      size: size,
      empty: value == null,
      open: _open,
      onOpenChange: _setOpen,
      formValue: value == null ? '' : toIsoTime(value, seconds: widget.showSeconds),
      display: written == null ? null : Text(written),
      semanticValue: written,
      placeholder: widget.placeholder,
      samples: _samples.of((
        names,
        widget.format,
        hour12,
        widget.showSeconds,
      ), (DateTime date) => write(date)),
      clearable: widget.clearable,
      onClear: () => _commit(null),
      clearLabel: labels['clear']!,
      label: widget.label,
      floatingLabel: widget.floatingLabel,
      description: widget.description,
      errorMessage: widget.errorMessage,
      startIcon: mpPickerStartIcon(widget.startIcon, MPGlyphShape.clock, size),
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
          MPTimeGrid(
            size: size,
            color: color,
            names: names,
            labels: labels,
            value: value,
            referenceDate: _referenceDate,
            onChanged: (DateTime next) {
              _commit(next);

              if (widget.closeOnSelect) {
                _setOpen(false);
              }
            },
            hour12: hour12,
            showSeconds: widget.showSeconds,
            hourStep: widget.hourStep,
            minuteStep: widget.minuteStep,
            secondStep: widget.secondStep,
            shouldDisableTime: _isBlocked,
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
                if (widget.showNowButton)
                  MPPickerAction(
                    size: size,
                    color: color,
                    label: labels['now']!,
                    disabled: _isBlocked(nowValue, MPTimeUnit.second),
                    onPressed: () {
                      _commit(nowValue);
                      _setOpen(false);
                    },
                  ),
                // The popup stays open while the columns are being read, so
                // there has to be something to press that means "that is the
                // one".
                if (!widget.closeOnSelect)
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
