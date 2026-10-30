/// The calendar grid and the clock columns, written once for the pickers.
///
/// They live here for the reason the React package keeps `internal/Calendar.tsx`:
/// a date-time picker is a date picker and a time picker in one popup, and a
/// range picker is two calendars, so several components need this and none of
/// them should have to import another. The two things it reaches *up* for are
/// [MPButton] and [MPIconButton]: the header's steppers are buttons, they are
/// not a new kind of control.
///
/// Everything here is fully controlled and takes its words already resolved,
/// because the callers have already decided those things. `MPCalendar` is where
/// the state and the translation are put back for a consumer.
///
/// The day cells are deliberately *not* buttons in that sense. A cell has
/// states a button has no vocabulary for (inside a range, at the end of a
/// range, today, belonging to the month next door) and four of them have to be
/// told apart at a glance in a grid of forty-two.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/internal/date_locales.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/* ---------------------------------------------------------------------------
 * Scale
 * ------------------------------------------------------------------------ */

/// The side of one day cell: 28, 32, 40, 44, 48.
///
/// `md` is 40, which is MD3's own date-picker cell to the pixel. The rest of
/// the ladder is the library's, and it is *not* the control ladder: a control's
/// `md` is 56, and a calendar drawn at 56 a cell is 392 wide before it has a
/// popup around it, which is wider than the field that opened it.
const Map<MPSize, double> mpCalendarCell = <MPSize, double>{
  MPSize.xs: 28,
  MPSize.sm: 32,
  MPSize.md: 40,
  MPSize.lg: 44,
  MPSize.xl: 48,
};

/// What the header's buttons, and a picker's footer buttons, are drawn at.
///
/// One rung down from the calendar's own, and for the same reason the cell
/// ladder is not the control ladder: at `md` this lands the steppers on 40,
/// which is what the cells beneath them are, so the header row and a row of
/// days are the same height and the panel reads as a grid rather than as a
/// toolbar with a calendar under it.
const Map<MPSize, MPSize> mpCalendarHeaderSize = <MPSize, MPSize>{
  MPSize.xs: MPSize.xs,
  MPSize.sm: MPSize.xs,
  MPSize.md: MPSize.sm,
  MPSize.lg: MPSize.sm,
  MPSize.xl: MPSize.md,
};

/// The month and year buttons' rung, one below the steppers'.
const Map<MPSize, MPSize> _viewButtonSize = <MPSize, MPSize>{
  MPSize.xs: MPSize.xs,
  MPSize.sm: MPSize.xs,
  MPSize.md: MPSize.sm,
  MPSize.lg: MPSize.md,
  MPSize.xl: MPSize.lg,
};

/// How wide one clock column is, as a multiple of a day cell.
const double mpClockColumnFactor = 1.75;

/// Between two rows of one clock column, `gap-0.5`.
const double _rowGap = 2;

/// Between the header and the grid, and between the clock's columns, `gap-1`.
const double _gap = 4;

/// The names a picker writes dates with at [context]: [names] when the caller
/// gave some, otherwise the library's table for the locale in force, which is
/// [locale], then the nearest `MPLocaleProvider`, then `MPConfigProvider`,
/// then the app's `Localizations`, and English for a language without one.
MPDateNames mpDateNamesOf(BuildContext context, {String? locale, MPDateNames? names}) {
  return names ?? mpDateNamesFor(mpLocaleOf(context, locale));
}

/* ---------------------------------------------------------------------------
 * The cell
 * ------------------------------------------------------------------------ */

/// Where a cell sits in a run of banded days, so the band knows where to stop.
enum _RangeEdge { none, start, end, both, middle }

/// One pressable cell in a grid.
///
/// The state branch is an if/else ladder in the order of importance.
/// Unavailable first: a blocked day still wearing the range's tint would be
/// advertising membership of a range it cannot join. Then chosen, then inside
/// the range, then today, then the days belonging to the month next door.
///
/// Today is an **outlined** circle, MD3's own mark for it, and the outline is a
/// border rather than a ring so it cannot be mistaken for the focus ring: a
/// cell that is both today and focused has to show both.
///
/// The focus ring is drawn *inside* the cell, which is the one place the
/// library's focus rule is bent. The grid is gapless, and a ring drawn outside
/// a cell is a ring drawn on its neighbours.
class _CalendarCell extends StatefulWidget {
  const _CalendarCell({
    required this.label,
    required this.size,
    required this.color,
    required this.height,
    required this.onPressed,
    required this.child,
    this.width,
    this.selected = false,
    this.inRange = false,
    this.rangeEdge = _RangeEdge.none,
    this.current = false,
    this.muted = false,
    this.disabled = false,
    this.focused = false,
    this.focusNode,
    this.onHover,
    this.onKey,
    this.onFocused,
    super.key,
  });

  /// What a screen reader hears. Always the full date, never the bare number.
  final String label;
  final MPSize size;
  final MPColor color;
  final double height;
  final double? width;
  final VoidCallback onPressed;
  final Widget child;
  final bool selected;
  final bool inRange;
  final _RangeEdge rangeEdge;
  final bool current;
  final bool muted;

  /// Blocked. Still in the grid and still in the arrow-key path: a reader
  /// arrowing across a month must not fall into a hole at every blocked day.
  final bool disabled;

  /// The grid's single tab stop.
  final bool focused;
  final FocusNode? focusNode;
  final VoidCallback? onHover;
  final KeyEventResult Function(KeyEvent event)? onKey;
  final VoidCallback? onFocused;

  @override
  State<_CalendarCell> createState() => _CalendarCellState();
}

class _CalendarCellState extends State<_CalendarCell> {
  bool _hovered = false;
  bool _pressed = false;
  bool _hasFocus = false;

  @override
  void initState() {
    super.initState();
    FocusManager.instance.addHighlightModeListener(_onHighlightMode);
  }

  @override
  void dispose() {
    FocusManager.instance.removeHighlightModeListener(_onHighlightMode);
    super.dispose();
  }

  void _onHighlightMode(FocusHighlightMode mode) {
    if (mounted && _hasFocus) {
      setState(() {});
    }
  }

  void _press() {
    if (!widget.disabled) {
      widget.onPressed();
    }
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;

    if (key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter ||
        key == LogicalKeyboardKey.space) {
      if (event is KeyDownEvent) {
        _press();
      }

      return KeyEventResult.handled;
    }

    return widget.onKey?.call(event) ?? KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(widget.color);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final bool focusVisible =
        _hasFocus && FocusManager.instance.highlightMode == FocusHighlightMode.traditional;

    const Color clear = Color(0x00000000);
    Color fill = clear;
    Color ink;
    BorderSide? border;

    if (widget.disabled) {
      ink = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    } else if (widget.selected) {
      fill = accent.color;
      ink = accent.onColor;
    } else if (widget.inRange) {
      fill = accent.container;
      ink = accent.onContainer;
    } else if (widget.current) {
      ink = accent.color;
      border = BorderSide(color: accent.color);
    } else if (widget.muted) {
      ink = colors.onSurfaceVariant;
    } else {
      ink = colors.onSurface;
    }

    // Square through the middle of a run and rounded where the run stops, so
    // a week of banded days reads as one shape rather than as seven tokens. A
    // run opens at the reading start of the week, which is the right under
    // RTL, so the corners are resolved against the direction.
    final Radius round = Radius.circular(widget.height / 2);
    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;
    final BorderRadius radius = switch (widget.rangeEdge) {
      _RangeEdge.start => BorderRadiusDirectional.horizontal(start: round).resolve(direction),
      _RangeEdge.end => BorderRadiusDirectional.horizontal(end: round).resolve(direction),
      _RangeEdge.middle => BorderRadius.zero,
      _RangeEdge.none || _RangeEdge.both => BorderRadius.all(round),
    };

    final double opacity = widget.disabled
        ? 0
        : _pressed
        ? MPStateOpacity.press
        : focusVisible
        ? MPStateOpacity.focus
        : _hovered
        ? MPStateOpacity.hover
        : 0;

    Widget cell = AnimatedDefaultTextStyle(
      duration: duration,
      curve: MPMotion.standard,
      style: mpProseText(
        theme.typescale,
        widget.size,
      ).style(ink).copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
      maxLines: 1,
      softWrap: false,
      overflow: TextOverflow.clip,
      child: Center(child: widget.child),
    );

    cell = MPStateLayer(color: ink, opacity: opacity, borderRadius: radius, child: cell);

    cell = AnimatedContainer(
      duration: duration,
      curve: MPMotion.standard,
      width: widget.width ?? widget.height,
      height: widget.height,
      decoration: BoxDecoration(
        color: fill,
        borderRadius: radius,
        border: border == null ? null : Border.fromBorderSide(border),
      ),
      clipBehavior: Clip.antiAlias,
      child: cell,
    );

    cell = CustomPaint(
      foregroundPainter: focusVisible
          ? MPFocusRingPainter(
              color: colors.secondary,
              borderRadius: radius,
              offset: -focusRingWidth,
            )
          : null,
      child: cell,
    );

    return Focus(
      focusNode: widget.focusNode,
      // One roving tab stop per grid: the focused cell is reachable and every
      // other one is skipped, which is what stops Tab walking forty-two cells.
      skipTraversal: !widget.focused,
      includeSemantics: false,
      onFocusChange: (bool focused) {
        setState(() => _hasFocus = focused);

        if (focused) {
          widget.onFocused?.call();
        }
      },
      onKeyEvent: _onKey,
      child: Builder(
        builder: (BuildContext context) {
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            container: true,
            button: true,
            selected: widget.selected,
            enabled: !widget.disabled,
            label: widget.label,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: widget.disabled ? null : widget.onPressed,
            excludeSemantics: true,
            child: MouseRegion(
              cursor: widget.disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
              onEnter: (PointerEnterEvent event) {
                setState(() => _hovered = true);
                widget.onHover?.call();
              },
              onExit: (PointerExitEvent event) => setState(() => _hovered = false),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                excludeFromSemantics: true,
                onTap: _press,
                onTapDown: widget.disabled
                    ? null
                    : (TapDownDetails details) => setState(() => _pressed = true),
                onTapUp: (TapUpDetails details) => setState(() => _pressed = false),
                onTapCancel: () => setState(() => _pressed = false),
                child: cell,
              ),
            ),
          );
        },
      ),
    );
  }
}

/* ---------------------------------------------------------------------------
 * The calendar
 * ------------------------------------------------------------------------ */

/// One month, with a way to reach every other one.
///
/// Three views on the same footprint: the days of a month, the twelve months of
/// a year, twelve years at a time. They are deliberately the same width *and*
/// the same height (the day view is seven rows counting its header, and the
/// other two spread four rows and three rows across that same height) so
/// switching view never resizes the popup under the pointer that opened it.
///
/// Arrow keys move by one cell, `PageUp`/`PageDown` by a month (a year with
/// Shift), `Home`/`End` to the ends of the week, and running off an edge steps
/// the calendar rather than stopping. One roving tab stop, so `Tab` leaves the
/// grid instead of walking forty-two cells: the pattern the ARIA date-picker
/// practice describes, and the reason no cell ever leaves the focus order.
class MPCalendarGrid extends StatefulWidget {
  /// Creates a calendar.
  const MPCalendarGrid({
    required this.size,
    required this.color,
    required this.names,
    required this.labels,
    required this.weekStartsOn,
    required this.month,
    required this.onMonthChange,
    required this.selected,
    required this.onSelect,
    this.rangeStart,
    this.rangeEnd,
    this.onPreviewChange,
    this.minDate,
    this.maxDate,
    this.shouldDisableDate,
    this.showOutsideDays = true,
    this.autofocus = false,
    this.showPreviousButton = true,
    this.showNextButton = true,
    this.precision = MPDatePrecision.day,
    super.key,
  });

  /// The cell size and the type scale.
  final MPSize size;

  /// The accent family the chosen day, the band and today read.
  final MPColor color;

  /// The month and weekday names, and the order the header writes them in.
  final MPDateNames names;

  /// The `picker` namespace, already resolved.
  final Map<String, String> labels;

  /// Which day the week starts on.
  final MPWeekday weekStartsOn;

  /// The month on screen. Controlled, so two panels can be kept a month apart.
  final DateTime month;

  /// Called when the panel moves to another month.
  final ValueChanged<DateTime> onMonthChange;

  /// The days drawn filled: one for a single picker, up to two for a range.
  final List<DateTime?> selected;

  /// Called with the day, month or year that was pressed.
  final ValueChanged<DateTime> onSelect;

  /// The two ends the band is drawn between. Both `null` outside range mode.
  final DateTime? rangeStart;

  /// See [rangeStart].
  final DateTime? rangeEnd;

  /// The day under the pointer, for a range that is only half chosen.
  final ValueChanged<DateTime?>? onPreviewChange;

  /// The earliest day that may be chosen. Day-granular.
  final DateTime? minDate;

  /// The latest day that may be chosen.
  final DateTime? maxDate;

  /// Blocks individual days. Asked about days and only about days.
  final bool Function(DateTime date)? shouldDisableDate;

  /// Draws the leading and trailing days that belong to the neighbouring
  /// months.
  ///
  /// On by default, because pressing the 1st of next month from this month's
  /// panel is a real shortcut. A two-month range picker turns it *off*, and not
  /// as a matter of taste: with both panels showing six full weeks, the 1st of
  /// August appears twice, and two cells with the same name in one popup is
  /// ambiguous to a pointer and outright broken to a screen reader.
  final bool showOutsideDays;

  /// Takes the focus on mount: the popup has just opened.
  final bool autofocus;

  /// Whether the header offers its back stepper. A hole its size is left when
  /// it does not, so two panels side by side keep their headings on one
  /// centre line.
  final bool showPreviousButton;

  /// See [showPreviousButton].
  final bool showNextButton;

  /// The finest view the calendar offers, and therefore what a press answers
  /// with. A month calendar never draws a day grid and a year calendar never
  /// draws either of the other two.
  final MPDatePrecision precision;

  @override
  State<MPCalendarGrid> createState() => _MPCalendarGridState();
}

class _MPCalendarGridState extends State<MPCalendarGrid> {
  /// The one node the tab stop carries, handed to whichever cell holds it.
  final FocusNode _cursor = FocusNode(debugLabel: 'MPCalendar cursor');

  /// The nodes the two header buttons sit in, which say whether the grid they
  /// open is open, as a trigger's `aria-expanded` does.
  final FocusNode _monthHolder = FocusNode(debugLabel: 'MPCalendar month', skipTraversal: true);
  final FocusNode _yearHolder = FocusNode(debugLabel: 'MPCalendar year', skipTraversal: true);

  late MPCalendarView _requestedView = MPCalendarView.values[widget.precision.index];

  /// The one cell that carries the tab stop.
  ///
  /// It starts on the chosen day, or on today when today is on screen, or on
  /// the 1st: never nowhere, because a grid whose tab stop is nowhere cannot be
  /// reached by a keyboard at all.
  late DateTime _focused = _initialFocus();

  /// Set only by the interactions that *move* the focus (an arrow key, a view
  /// change) so nothing yanks the focus out from under a pointer doing
  /// something else on the screen.
  bool _pendingFocus = false;

  /// The view drawn, clamped so a precision that coarsens while the calendar is
  /// up cannot leave it showing a grid it no longer has an answer for.
  MPCalendarView get _view {
    final int floor = widget.precision.index;

    return _requestedView.index < floor ? MPCalendarView.values[floor] : _requestedView;
  }

  @override
  void initState() {
    super.initState();

    if (widget.autofocus) {
      _pendingFocus = true;
      _afterFrame();
    }
  }

  @override
  void didUpdateWidget(MPCalendarGrid oldWidget) {
    super.didUpdateWidget(oldWidget);

    // Following the month keeps the tab stop inside the grid the reader is
    // looking at: stepping a month and then pressing an arrow lands somewhere
    // sensible instead of scrolling the panel back where it came from.
    if (!isSameMonth(_focused, widget.month)) {
      _focused = startOfMonth(widget.month);
    }

    if (_pendingFocus) {
      _afterFrame();
    }
  }

  @override
  void dispose() {
    _cursor.dispose();
    _monthHolder.dispose();
    _yearHolder.dispose();
    super.dispose();
  }

  DateTime _initialFocus() {
    for (final DateTime? date in widget.selected) {
      if (date != null && isSameMonth(date, widget.month)) {
        return startOfDay(date);
      }
    }

    final DateTime today = todayDate();

    return isSameMonth(today, widget.month) ? today : startOfMonth(widget.month);
  }

  /// Puts the focus on the tab stop once the frame that moved it is built: a
  /// node handed from one cell to the next can lose the focus on the way.
  void _afterFrame() {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (!mounted || !_pendingFocus) {
        return;
      }

      _pendingFocus = false;
      _cursor.requestFocus();
    });
  }

  bool _isDisabled(DateTime date) {
    return isDayOutside(date, widget.minDate, widget.maxDate) ||
        (widget.shouldDisableDate?.call(date) ?? false);
  }

  /// Moves the tab stop, pulling the month along when it lands outside.
  void _moveFocus(DateTime next) {
    setState(() {
      _pendingFocus = true;
      _focused = startOfDay(next);
    });

    if (!isSameMonth(next, widget.month)) {
      widget.onMonthChange(startOfMonth(next));
    } else {
      _afterFrame();
    }
  }

  void _step(int direction) {
    switch (_view) {
      case MPCalendarView.day:
        widget.onMonthChange(addMonths(widget.month, direction));
      case MPCalendarView.month:
        widget.onMonthChange(addYears(widget.month, direction));
      case MPCalendarView.year:
        widget.onMonthChange(addYears(widget.month, direction * yearPageSize));
    }
  }

  void _changeView(MPCalendarView next) {
    setState(() {
      _pendingFocus = true;
      _requestedView = next;
    });
    _afterFrame();
  }

  /// In month and year view the header's month *is* the cursor.
  void _moveCursor(DateTime next) {
    setState(() => _pendingFocus = true);
    widget.onMonthChange(next);
    _afterFrame();
  }

  @override
  Widget build(BuildContext context) {
    final double side = mpCalendarCell[widget.size]!;

    return MouseRegion(
      onExit: (PointerExitEvent event) => widget.onPreviewChange?.call(null),
      child: SizedBox(
        width: side * 7,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: _gap,
          children: <Widget>[
            _header(side),
            // Seven rows of cells, whichever view is drawn into it.
            SizedBox(height: side * 7, child: _grid()),
          ],
        ),
      ),
    );
  }

  /// The two steppers and, between them, the way into the other two views.
  ///
  /// This is what the component is for. A calendar that only steps a month at
  /// a time puts a birthday thirty years back a hundred and eighty presses
  /// away, so the month and the year are each a button that opens a grid of its
  /// own: two presses to any month of the year on screen, three to any year at
  /// all.
  Widget _header(double side) {
    final MPThemeData theme = MPTheme.of(context);
    final Map<String, String> labels = widget.labels;
    final MPSize buttonSize = mpCalendarHeaderSize[widget.size]!;
    final double icon = mpControlIcon[buttonSize]!;
    final MPCalendarView view = _view;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    final List<String> stepNames = switch (view) {
      MPCalendarView.day => <String>[labels['previousMonth']!, labels['nextMonth']!],
      MPCalendarView.month => <String>[labels['previousYear']!, labels['nextYear']!],
      MPCalendarView.year => <String>[labels['previousYears']!, labels['nextYears']!],
    };

    Widget stepper(int direction, bool shown) {
      if (!shown) {
        // A hole the size of a cell, as the React header leaves.
        return SizedBox.square(dimension: side);
      }

      // The chevron points the way the reading runs, which turns under RTL
      // along with everything else: "back" is whichever way the text runs
      // from.
      final bool left = (direction == -1) != rtl;

      return MPIconButton(
        size: buttonSize,
        color: widget.color,
        label: stepNames[direction == -1 ? 0 : 1],
        icon: MPGlyph(MPGlyphShape.chevron, size: icon, quarterTurns: left ? 1 : 3),
        onPressed: () => _step(direction),
      );
    }

    Widget disclosure(bool open) {
      return AnimatedRotation(
        turns: open ? 0.5 : 0,
        duration: reduceMotion ? Duration.zero : MPMotion.short4,
        curve: MPMotion.standard,
        child: MPGlyph(MPGlyphShape.chevron, size: icon),
      );
    }

    // Named by what they do, as the React buttons' `aria-label` names them,
    // and said to be open while their grid is.
    Widget headerButton({
      required FocusNode holder,
      required bool open,
      required String label,
      required String text,
      required VoidCallback onPressed,
      required Key key,
    }) {
      return Focus(
        key: key,
        focusNode: holder,
        canRequestFocus: false,
        includeSemantics: false,
        child: MPFocusHolder(
          node: holder,
          holding: false,
          open: open,
          child: MPButton(
            variant: MPVariant.text,
            // One rung below the steppers. The label keeps its type role (the
            // two lowest rungs share `labelLarge`) and loses padding, which is
            // what lets `October 2026` fit inside the grid's width. The React
            // popup widens to its header instead; a Flutter popup is as wide as
            // its grid.
            size: _viewButtonSize[buttonSize]!,
            color: widget.color,
            semanticLabel: label,
            endIcon: disclosure(open),
            onPressed: onPressed,
            child: Text(
              text,
              style: const TextStyle(fontFeatures: <FontFeature>[FontFeature.tabularFigures()]),
            ),
          ),
        ),
      );
    }

    final Widget monthButton = headerButton(
      key: const ValueKey<String>('month'),
      holder: _monthHolder,
      open: view == MPCalendarView.month,
      label: labels['chooseMonth']!,
      text: widget.names.months[widget.month.month - 1],
      onPressed: () =>
          _changeView(view == MPCalendarView.month ? MPCalendarView.day : MPCalendarView.month),
    );

    final Widget yearButton = headerButton(
      key: const ValueKey<String>('year'),
      holder: _yearHolder,
      open: view == MPCalendarView.year,
      label: labels['chooseYear']!,
      text: '${widget.month.year}',
      onPressed: () =>
          _changeView(view == MPCalendarView.year ? MPCalendarView.day : MPCalendarView.year),
    );

    final int page = yearPageStart(widget.month.year);

    final Widget middle = switch (view) {
      // A range, not a control: there is nothing above a page of years to
      // open. It keeps the row's height so switching views never moves it.
      MPCalendarView.year => SizedBox(
        height: side,
        child: Center(
          child: Text(
            '$page–${page + yearPageSize - 1}',
            maxLines: 1,
            style: mpProseText(theme.typescale, widget.size)
                .style(theme.colors.onSurface)
                .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
          ),
        ),
      ),
      MPCalendarView.month => Flexible(child: yearButton),
      // The month gives way first. A year is four digits and takes the room
      // it needs; a month name is what varies wildly between languages, so it
      // is the one that truncates when the row runs out, rather than both
      // buttons splitting the row in half and `October` losing to `2026`.
      // Printed in the order the language writes them: `July 2026`,
      // `2026년 7월`.
      MPCalendarView.day => SizedBox(
        height: side,
        child: CustomMultiChildLayout(
          delegate: _MonthYearLayout(
            gap: _gap,
            // Visual order, left to right: the language's order, turned round
            // under right-to-left text as a `Row` would turn it.
            monthOnLeft: widget.names.monthBeforeYear != rtl,
          ),
          children: <Widget>[
            LayoutId(id: _MonthYearSlot.month, child: monthButton),
            LayoutId(id: _MonthYearSlot.year, child: yearButton),
          ],
        ),
      ),
    };

    return Row(
      spacing: _gap,
      children: <Widget>[
        stepper(-1, widget.showPreviousButton),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[if (view == MPCalendarView.day) Expanded(child: middle) else middle],
          ),
        ),
        stepper(1, widget.showNextButton),
      ],
    );
  }

  Widget _grid() {
    // Keyed, so switching view builds a fresh grid rather than reusing the
    // last one's cells, whose animated sizes would tween from one grid's
    // cell width to the other's.
    return switch (_view) {
      MPCalendarView.day => _DayGrid(
        key: const ValueKey<String>('day'),
        size: widget.size,
        color: widget.color,
        names: widget.names,
        weekStartsOn: widget.weekStartsOn,
        month: widget.month,
        selected: widget.selected,
        rangeStart: widget.rangeStart,
        rangeEnd: widget.rangeEnd,
        focused: _focused,
        cursor: _cursor,
        showOutsideDays: widget.showOutsideDays,
        isDisabled: _isDisabled,
        onSelect: (DateTime date) {
          setState(() => _focused = startOfDay(date));
          widget.onSelect(date);
        },
        onPreviewChange: widget.onPreviewChange,
        onMoveFocus: _moveFocus,
        onFocusCell: (DateTime date) {
          if (!isSameDay(date, _focused)) {
            setState(() => _focused = startOfDay(date));
          }
        },
      ),
      MPCalendarView.month => KeyedSubtree(
        key: const ValueKey<String>('month'),
        child: _monthGrid(),
      ),
      MPCalendarView.year => KeyedSubtree(key: const ValueKey<String>('year'), child: _yearGrid()),
    };
  }

  /// Which way "right" runs, as a multiplier for a horizontal step.
  ///
  /// A grid under RTL flows right to left, so the cell visually to the right
  /// of today is *yesterday*. The arrow keys follow what the reader can see.
  /// Home and End are not flipped: they go to the ends of the week, which is a
  /// logical question with the same answer in both directions.
  int get _across => Directionality.of(context) == TextDirection.rtl ? -1 : 1;

  /// Twelve months, three across.
  ///
  /// The tab stop is the header's own month, so moving it *is* moving the
  /// header: arrowing right off December lands on January of the next year and
  /// the year button follows.
  Widget _monthGrid() {
    final double side = mpCalendarCell[widget.size]!;
    final int year = widget.month.year;
    final DateTime now = DateTime.now();
    final double width = (side * 7 - _gap * 2) / 3;

    KeyEventResult onKey(KeyEvent event) {
      if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
        return KeyEventResult.ignored;
      }

      final int? step = switch (event.logicalKey) {
        LogicalKeyboardKey.arrowLeft => -_across,
        LogicalKeyboardKey.arrowRight => _across,
        LogicalKeyboardKey.arrowUp => -3,
        LogicalKeyboardKey.arrowDown => 3,
        LogicalKeyboardKey.pageUp => -12,
        LogicalKeyboardKey.pageDown => 12,
        _ => null,
      };

      if (step == null) {
        return KeyEventResult.ignored;
      }

      final DateTime next = addMonths(startOfMonth(widget.month), step);

      // Under directional navigation the year shown is where the arrows end,
      // as the month shown is in the day grid.
      if (mpIsArrow(event.logicalKey) && mpArrowsMoveFocus(context) && next.year != year) {
        return KeyEventResult.ignored;
      }

      _moveCursor(next);

      return KeyEventResult.handled;
    }

    // The rows are spread over the height the day view occupies rather than
    // stretched to fill it: the popup keeps its size across a view change, and
    // a month cell stays a cell rather than becoming a panel.
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: '$year',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          for (int row = 0; row < 4; row += 1)
            Row(
              spacing: _gap,
              children: <Widget>[
                for (int column = 0; column < 3; column += 1)
                  _monthCell(row * 3 + column, year, now, width, side, onKey),
              ],
            ),
        ],
      ),
    );
  }

  Widget _monthCell(
    int index,
    int year,
    DateTime now,
    double width,
    double side,
    KeyEventResult Function(KeyEvent event) onKey,
  ) {
    final DateTime first = DateTime(year, index + 1);
    final bool focused = index + 1 == widget.month.month;

    return _CalendarCell(
      // The whole month, written the way the language writes it: on a picker
      // whose precision is a month these twelve names are everything a reader
      // hears.
      label: widget.names.monthYear(first),
      size: widget.size,
      color: widget.color,
      height: side,
      width: width,
      selected: widget.selected.any(
        (DateTime? entry) => entry != null && entry.year == year && entry.month == index + 1,
      ),
      current: now.year == year && now.month == index + 1,
      // A month is out of bounds only when every day in it is: the month a
      // `minDate` falls in is still reachable, it just starts late.
      disabled: isMonthOutside(first, widget.minDate, widget.maxDate),
      focused: focused,
      focusNode: focused ? _cursor : null,
      onKey: onKey,
      onPressed: () {
        // A month picker's answer, rather than a way down to the days in it:
        // there is no view below this one to send the reader to.
        if (widget.precision == MPDatePrecision.month) {
          widget.onSelect(first);

          return;
        }

        widget.onMonthChange(first);
        _changeView(MPCalendarView.day);
      },
      child: Text(widget.names.monthsShort[index]),
    );
  }

  /// Twelve years, four across, and the same trick with the cursor.
  Widget _yearGrid() {
    final double side = mpCalendarCell[widget.size]!;
    final int page = yearPageStart(widget.month.year);
    final int now = DateTime.now().year;
    final double width = (side * 7 - _gap * 3) / 4;

    KeyEventResult onKey(KeyEvent event) {
      if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
        return KeyEventResult.ignored;
      }

      final int? step = switch (event.logicalKey) {
        LogicalKeyboardKey.arrowLeft => -_across,
        LogicalKeyboardKey.arrowRight => _across,
        LogicalKeyboardKey.arrowUp => -4,
        LogicalKeyboardKey.arrowDown => 4,
        LogicalKeyboardKey.pageUp => -yearPageSize,
        LogicalKeyboardKey.pageDown => yearPageSize,
        _ => null,
      };

      if (step == null) {
        return KeyEventResult.ignored;
      }

      final DateTime next = addYears(startOfMonth(widget.month), step);

      if (mpIsArrow(event.logicalKey) &&
          mpArrowsMoveFocus(context) &&
          yearPageStart(next.year) != page) {
        return KeyEventResult.ignored;
      }

      _moveCursor(next);

      return KeyEventResult.handled;
    }

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: '$page–${page + yearPageSize - 1}',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          for (int row = 0; row < 3; row += 1)
            Row(
              spacing: _gap,
              children: <Widget>[
                for (int column = 0; column < 4; column += 1)
                  Builder(
                    builder: (BuildContext context) {
                      final int year = page + row * 4 + column;
                      final bool focused = year == widget.month.year;

                      return _CalendarCell(
                        label: '$year',
                        size: widget.size,
                        color: widget.color,
                        height: side,
                        width: width,
                        selected: widget.selected.any(
                          (DateTime? entry) => entry != null && entry.year == year,
                        ),
                        current: year == now,
                        disabled: isYearOutside(DateTime(year), widget.minDate, widget.maxDate),
                        focused: focused,
                        focusNode: focused ? _cursor : null,
                        onKey: onKey,
                        onPressed: () {
                          if (widget.precision == MPDatePrecision.year) {
                            widget.onSelect(DateTime(year));

                            return;
                          }

                          widget.onMonthChange(DateTime(year, widget.month.month));
                          _changeView(MPCalendarView.month);
                        },
                        child: Text('$year'),
                      );
                    },
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

/// The weekday names and six weeks, and the page turn between months.
class _DayGrid extends StatefulWidget {
  const _DayGrid({
    required this.size,
    required this.color,
    required this.names,
    required this.weekStartsOn,
    required this.month,
    required this.selected,
    required this.rangeStart,
    required this.rangeEnd,
    required this.focused,
    required this.cursor,
    required this.showOutsideDays,
    required this.isDisabled,
    required this.onSelect,
    required this.onPreviewChange,
    required this.onMoveFocus,
    required this.onFocusCell,
    super.key,
  });

  final MPSize size;
  final MPColor color;
  final MPDateNames names;
  final MPWeekday weekStartsOn;
  final DateTime month;
  final List<DateTime?> selected;
  final DateTime? rangeStart;
  final DateTime? rangeEnd;
  final DateTime focused;
  final FocusNode cursor;
  final bool showOutsideDays;
  final bool Function(DateTime date) isDisabled;
  final ValueChanged<DateTime> onSelect;
  final ValueChanged<DateTime?>? onPreviewChange;
  final ValueChanged<DateTime> onMoveFocus;
  final ValueChanged<DateTime> onFocusCell;

  @override
  State<_DayGrid> createState() => _DayGridState();
}

class _DayGridState extends State<_DayGrid> with SingleTickerProviderStateMixin {
  /// The page turn.
  ///
  /// A month that swapped in place said which month it was in the header and
  /// nothing at all about which way the reader had gone: forward and back were
  /// the same event, on a control whose whole job is moving between them. MD3
  /// turns the page, and this is that: the arriving weeks come from the side
  /// they were fetched from and settle. Only the weeks, since the weekday names
  /// above them do not change and a Monday sliding in to become Monday says
  /// something happened when nothing did.
  late final AnimationController _page = AnimationController(
    vsync: this,
    duration: MPMotion.medium2,
    value: 1,
  );

  late final CurvedAnimation _turn = CurvedAnimation(
    parent: _page,
    curve: MPMotion.emphasizedDecelerate,
  );

  /// Which side the weeks arrive from: `1` from the end of the line, `-1` from
  /// its start, flipped under RTL with the header's chevrons.
  double _from = 0;

  /// The six weeks and the name of every cell in them, kept until the month,
  /// the week start or the names change.
  ///
  /// Forty-two whole dates written out is a real cost to pay once and an
  /// absurd one to pay per pointer move, which is what a range picker asks
  /// for: moving across a cell rebuilds the control to redraw the band, and it
  /// draws two of these.
  ({DateTime month, MPWeekday start, MPDateNames names})? _weeksKey;
  List<List<(DateTime, String)>> _weeks = const <List<(DateTime, String)>>[];

  List<List<(DateTime, String)>> _weeksFor() {
    final ({DateTime month, MPWeekday start, MPDateNames names}) key = (
      month: startOfMonth(widget.month),
      start: widget.weekStartsOn,
      names: widget.names,
    );

    if (key != _weeksKey) {
      _weeksKey = key;
      _weeks = <List<(DateTime, String)>>[
        for (final List<DateTime> week in calendarWeeks(widget.month, widget.weekStartsOn))
          <(DateTime, String)>[for (final DateTime date in week) (date, widget.names.spell(date))],
      ];
    }

    return _weeks;
  }

  @override
  void didUpdateWidget(_DayGrid oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (isSameMonth(oldWidget.month, widget.month)) {
      return;
    }

    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _page.value = 1;

      return;
    }

    _from = widget.month.isAfter(oldWidget.month) ? 1 : -1;
    _page.forward(from: 0);
  }

  @override
  void dispose() {
    _turn.dispose();
    _page.dispose();
    super.dispose();
  }

  KeyEventResult _onKey(KeyEvent event, DateTime date) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    final int across = Directionality.of(context) == TextDirection.rtl ? -1 : 1;
    final int offsetInWeek = (date.weekday % 7 - widget.weekStartsOn.value % 7 + 7) % 7;
    // With Shift the page keys move a year rather than a month, as the ARIA
    // date-picker practice has them.
    final int page = HardwareKeyboard.instance.isShiftPressed ? 12 : 1;

    final DateTime? next = switch (event.logicalKey) {
      LogicalKeyboardKey.arrowLeft => addDays(date, -across),
      LogicalKeyboardKey.arrowRight => addDays(date, across),
      LogicalKeyboardKey.arrowUp => addDays(date, -7),
      LogicalKeyboardKey.arrowDown => addDays(date, 7),
      LogicalKeyboardKey.home => addDays(date, -offsetInWeek),
      LogicalKeyboardKey.end => addDays(date, 6 - offsetInWeek),
      LogicalKeyboardKey.pageUp => addMonths(date, -page),
      LogicalKeyboardKey.pageDown => addMonths(date, page),
      _ => null,
    };

    if (next == null) {
      return KeyEventResult.ignored;
    }

    // Under directional navigation the month shown is where the arrows end:
    // they are how a remote moves on to the next control, and a grid that
    // turned the month at every edge would never let one go.
    if (mpIsArrow(event.logicalKey) &&
        mpArrowsMoveFocus(context) &&
        !isSameMonth(next, widget.month)) {
      return KeyEventResult.ignored;
    }

    widget.onMoveFocus(next);

    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final double side = mpCalendarCell[widget.size]!;
    final List<List<(DateTime, String)>> weeks = _weeksFor();
    final List<String> narrow = widget.names.weekdayRow(widget.weekStartsOn, narrow: true);
    final List<String> long = widget.names.weekdayRow(widget.weekStartsOn, short: false);
    final List<DateTime>? band = orderedRange(widget.rangeStart, widget.rangeEnd);
    final DateTime now = todayDate();
    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    final Widget header = Row(
      children: <Widget>[
        for (int column = 0; column < 7; column += 1)
          SizedBox(
            width: side,
            height: side,
            child: Center(
              child: Text(
                narrow[column],
                // The whole name, so a screen reader hears "Monday" and not
                // "M": English narrow names collide.
                semanticsLabel: long[column],
                maxLines: 1,
                style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant),
              ),
            ),
          ),
      ],
    );

    final Widget page = Column(
      children: <Widget>[
        for (final List<(DateTime, String)> week in weeks)
          Row(
            children: <Widget>[
              for (final (DateTime date, String label) in week) _cell(date, label, band, now, side),
            ],
          ),
      ],
    );

    // Named by the month it is showing. A grid with no name leaves the reader
    // to work out which month they are in from the cells, and the cells are
    // numbers.
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.names.monthYear(widget.month),
      child: Column(
        children: <Widget>[
          header,
          AnimatedBuilder(
            animation: _turn,
            child: page,
            builder: (BuildContext context, Widget? child) {
              final double t = _turn.value;

              if (t >= 1) {
                return child!;
              }

              final double from = rtl ? -_from : _from;

              return Opacity(
                opacity: t.clamp(0, 1),
                child: Transform.translate(offset: Offset(from * side * (1 - t), 0), child: child),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _cell(DateTime date, String label, List<DateTime>? band, DateTime now, double side) {
    final bool outside = !isSameMonth(date, widget.month);

    // A hole the size of a cell rather than a missing one: the grid has to
    // keep its seven columns and six rows whatever month it is on.
    if (outside && !widget.showOutsideDays) {
      return SizedBox.square(dimension: side);
    }

    final bool chosen = widget.selected.any((DateTime? entry) => isSameDay(entry, date));
    final bool within =
        band != null && compareDay(date, band[0]) >= 0 && compareDay(date, band[1]) <= 0;
    final bool atStart = within && isSameDay(date, band[0]);
    final bool atEnd = within && isSameDay(date, band[1]);
    final bool focused = isSameDay(date, widget.focused);

    return _CalendarCell(
      key: ValueKey<int>(date.year * 10000 + date.month * 100 + date.day),
      label: label,
      size: widget.size,
      color: widget.color,
      height: side,
      selected: chosen,
      inRange: within && !chosen,
      rangeEdge: !within
          ? _RangeEdge.none
          : atStart && atEnd
          ? _RangeEdge.both
          : atStart
          ? _RangeEdge.start
          : atEnd
          ? _RangeEdge.end
          : _RangeEdge.middle,
      current: isSameDay(date, now) && !chosen,
      muted: outside,
      disabled: widget.isDisabled(date),
      focused: focused,
      focusNode: focused ? widget.cursor : null,
      onHover: () => widget.onPreviewChange?.call(date),
      onPressed: () => widget.onSelect(date),
      onKey: (KeyEvent event) => _onKey(event, date),
      onFocused: () => widget.onFocusCell(date),
      child: Text('${date.day}'),
    );
  }
}

/* ---------------------------------------------------------------------------
 * The clock
 * ------------------------------------------------------------------------ */

/// How far apart a column's rows are, as a number the column can be built
/// from: held between 1 and the column's own span. A step of nought has no
/// number of rows at all, and one wider than the column leaves the single row
/// it can offer rather than none.
int _columnStep(int step, int span) => step < 1 ? 1 : (step > span ? span : step);

/// Hours, minutes and, when asked for, seconds, as columns you scroll.
///
/// ## Why this is not MD3's dial
///
/// The specification's time picker is a clock face, and this is not one. A
/// dial is a *pointer* control: reading it takes a glance at an analogue clock,
/// setting it takes a drag, and the keyboard and screen-reader path is a
/// separate "time input" mode MD3 ships precisely because the dial cannot serve
/// one. Columns answer both readers with one control. "Half past nine" is two
/// glances, "any time at all, on the hour" is a column you never touch, and
/// every row is a real option the arrow keys reach.
///
/// The chosen row of each column is brought into view once, on open. That is
/// the only imperative work here and it is not optional: a column of sixty
/// minutes that opens at `00` while the value is `45` has hidden its own
/// answer.
class MPTimeGrid extends StatefulWidget {
  /// Creates the clock.
  const MPTimeGrid({
    required this.size,
    required this.color,
    required this.names,
    required this.labels,
    required this.value,
    required this.referenceDate,
    required this.onChanged,
    required this.hour12,
    this.showSeconds = false,
    this.hourStep = 1,
    this.minuteStep = 1,
    this.secondStep = 1,
    this.shouldDisableTime,
    this.autofocus = false,
    super.key,
  });

  /// The row height and the type scale.
  final MPSize size;

  /// The accent family a chosen row reads.
  final MPColor color;

  /// Where AM and PM come from, and how the time is spoken.
  final MPDateNames names;

  /// The `picker` namespace, already resolved.
  final Map<String, String> labels;

  /// The time on screen, or `null` while nothing has been chosen.
  final DateTime? value;

  /// The day the columns write into while [value] is still `null`.
  final DateTime referenceDate;

  /// Called with the instant the pressed row produces.
  final ValueChanged<DateTime> onChanged;

  /// A 12-hour dial with an AM/PM column.
  final bool hour12;

  /// Adds the seconds column.
  final bool showSeconds;

  /// How far apart the rows of the hours column are.
  final int hourStep;

  /// See [hourStep].
  final int minuteStep;

  /// See [hourStep].
  final int secondStep;

  /// Blocks individual rows, given the instant a row would produce and the
  /// column it is in.
  final bool Function(DateTime value, MPTimeUnit unit)? shouldDisableTime;

  /// Takes the focus on mount: the popup has just opened.
  final bool autofocus;

  @override
  State<MPTimeGrid> createState() => _MPTimeGridState();
}

class _MPTimeGridState extends State<MPTimeGrid> {
  final Map<MPTimeUnit, ScrollController> _scrollers = <MPTimeUnit, ScrollController>{
    for (final MPTimeUnit unit in MPTimeUnit.values) unit: ScrollController(),
  };

  /// One node per row of each column, so the arrow keys can take the focus to
  /// the row they choose.
  final Map<MPTimeUnit, List<FocusNode>> _nodes = <MPTimeUnit, List<FocusNode>>{};

  /// Where each column's single tab stop is, once the reader has moved it.
  ///
  /// Empty until then: a column with nothing here falls back to the row it has
  /// chosen, which is what Tab should land on the first time. Once they have
  /// arrowed somewhere, Tab comes back to where they left off.
  final Map<MPTimeUnit, int> _cursor = <MPTimeUnit, int>{};

  @override
  void initState() {
    super.initState();
    // Once, on open. Re-running it on every change would drag a column back
    // under the pointer that is scrolling it.
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => _opened());
  }

  @override
  void dispose() {
    for (final ScrollController controller in _scrollers.values) {
      controller.dispose();
    }

    for (final List<FocusNode> nodes in _nodes.values) {
      for (final FocusNode node in nodes) {
        node.dispose();
      }
    }

    super.dispose();
  }

  /// The nodes for a column of [count] rows, grown or shrunk to fit. A node a
  /// shorter column no longer needs is disposed after the frame, once the row
  /// that held it has gone.
  List<FocusNode> _nodesFor(MPTimeUnit unit, int count) {
    final List<FocusNode> nodes = _nodes.putIfAbsent(unit, () => <FocusNode>[]);

    while (nodes.length < count) {
      nodes.add(FocusNode(debugLabel: 'MPTimeGrid ${unit.name} ${nodes.length}'));
    }

    if (nodes.length > count) {
      final List<FocusNode> spare = nodes.sublist(count);

      nodes.removeRange(count, nodes.length);
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        for (final FocusNode node in spare) {
          node.dispose();
        }
      });
    }

    return nodes;
  }

  DateTime get _base => widget.value ?? widget.referenceDate;

  int get _displayHour =>
      widget.hour12 ? (_base.hour % 12 == 0 ? 12 : _base.hour % 12) : _base.hour;

  List<int> get _hours {
    final int span = widget.hour12 ? 12 : 24;
    final int step = _columnStep(widget.hourStep, span);
    final List<int> raw = <int>[for (int hour = 0; hour < span; hour += step) hour];

    // 12, 1, 2 … 11: the order a 12-hour dial is read in, not 0…11.
    return widget.hour12 ? <int>[for (final int hour in raw) hour == 0 ? 12 : hour] : raw;
  }

  List<int> _sixty(int step) {
    final int by = _columnStep(step, 60);

    return <int>[for (int value = 0; value < 60; value += by) value];
  }

  /// The rows of [unit], with which of them is chosen and how each is written.
  ({List<int> rows, bool Function(int raw) chosen, String Function(int raw) render}) _column(
    MPTimeUnit unit,
  ) {
    String pad(int value) => value.toString().padLeft(2, '0');

    return switch (unit) {
      MPTimeUnit.hour => (
        rows: _hours,
        chosen: (int raw) => raw == _displayHour,
        render: (int raw) => widget.hour12 ? '$raw' : pad(raw),
      ),
      MPTimeUnit.minute => (
        rows: _sixty(widget.minuteStep),
        chosen: (int raw) => raw == _base.minute,
        render: pad,
      ),
      MPTimeUnit.second => (
        rows: _sixty(widget.secondStep),
        chosen: (int raw) => raw == _base.second,
        render: pad,
      ),
      MPTimeUnit.meridiem => (
        rows: const <int>[0, 1],
        chosen: (int raw) => (_base.hour >= 12 ? 1 : 0) == raw,
        render: (int raw) => raw == 0 ? widget.names.am : widget.names.pm,
      ),
    };
  }

  List<MPTimeUnit> get _units => <MPTimeUnit>[
    MPTimeUnit.hour,
    MPTimeUnit.minute,
    if (widget.showSeconds) MPTimeUnit.second,
    if (widget.hour12) MPTimeUnit.meridiem,
  ];

  /// The instant choosing this row would produce.
  DateTime _candidate(MPTimeUnit unit, int raw) {
    final DateTime base = _base;

    return switch (unit) {
      MPTimeUnit.hour => withTime(
        base,
        hours: widget.hour12 ? raw % 12 + (base.hour >= 12 ? 12 : 0) : raw,
      ),
      MPTimeUnit.minute => withTime(base, minutes: raw),
      MPTimeUnit.second => withTime(base, seconds: raw),
      // `raw` is 0 for the first half of the day and 1 for the second.
      MPTimeUnit.meridiem => withTime(base, hours: base.hour % 12 + raw * 12),
    };
  }

  double get _rowExtent => mpCalendarCell[widget.size]! + _rowGap;

  /// Brings row [index] into view inside its own column, and nowhere else.
  ///
  /// Computed and set rather than asked for with `ensureVisible`, which walks
  /// every scrollable ancestor: the popup this runs in has only just been
  /// placed, and a scroll that reached past the column would move the screen
  /// behind it. [animate] glides there, for an arrow key walking off the end
  /// of the visible rows; the first reveal lands instead, because three
  /// columns easing into place inside a popup that is arriving is three things
  /// moving where one arrived.
  void _reveal(MPTimeUnit unit, int index, {bool animate = false}) {
    final ScrollController controller = _scrollers[unit]!;

    if (!controller.hasClients) {
      return;
    }

    final ScrollPosition position = controller.position;
    final double top = index * _rowExtent;
    final double bottom = top + mpCalendarCell[widget.size]!;
    double? target;

    if (top < position.pixels) {
      target = top;
    } else if (bottom > position.pixels + position.viewportDimension) {
      target = bottom - position.viewportDimension;
    }

    if (target == null) {
      return;
    }

    target = target.clamp(position.minScrollExtent, position.maxScrollExtent);

    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    if (animate && !still) {
      controller.animateTo(target, duration: MPMotion.short4, curve: MPMotion.standard);
    } else {
      controller.jumpTo(target);
    }
  }

  void _opened() {
    if (!mounted) {
      return;
    }

    if (widget.value != null) {
      for (final MPTimeUnit unit in _units) {
        final ({List<int> rows, bool Function(int raw) chosen, String Function(int raw) render})
        column = _column(unit);
        final int index = column.rows.indexWhere(column.chosen);

        if (index >= 0) {
          _reveal(unit, index);
        }
      }
    }

    if (widget.autofocus) {
      final List<FocusNode>? nodes = _nodes[MPTimeUnit.hour];

      if (nodes != null && nodes.isNotEmpty) {
        nodes[_stopOf(MPTimeUnit.hour)].requestFocus();
      }
    }
  }

  /// The row that carries [unit]'s tab stop.
  int _stopOf(MPTimeUnit unit) {
    final ({List<int> rows, bool Function(int raw) chosen, String Function(int raw) render})
    column = _column(unit);
    final int chosen = widget.value == null ? -1 : column.rows.indexWhere(column.chosen);
    final int at = _cursor[unit] ?? (chosen >= 0 ? chosen : 0);

    return at.clamp(0, column.rows.length - 1);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _gap,
      children: <Widget>[
        for (final MPTimeUnit unit in _units) _buildColumn(unit),
        // Three unlabelled lists of numbers, to anyone reading the screen
        // rather than looking at it. This is the sentence that says what they
        // add up to. A pixel square rather than nothing: a node with no size is
        // taken off the tree, and the sentence with it.
        Semantics(
          liveRegion: true,
          label: widget.value == null
              ? null
              : widget.names.time(
                  widget.value!,
                  hour12: widget.hour12,
                  seconds: widget.showSeconds,
                ),
          child: const SizedBox.square(dimension: 1),
        ),
      ],
    );
  }

  Widget _buildColumn(MPTimeUnit unit) {
    final double side = mpCalendarCell[widget.size]!;
    final ({List<int> rows, bool Function(int raw) chosen, String Function(int raw) render})
    column = _column(unit);
    final List<int> rows = column.rows;
    final List<FocusNode> nodes = _nodesFor(unit, rows.length);
    final int stop = _stopOf(unit);
    final String name =
        widget.labels[switch (unit) {
          MPTimeUnit.hour => 'hour',
          MPTimeUnit.minute => 'minute',
          MPTimeUnit.second => 'second',
          MPTimeUnit.meridiem => 'meridiem',
        }]!;

    void moveTo(int index) {
      final int next = index.clamp(0, rows.length - 1);

      setState(() => _cursor[unit] = next);
      nodes[next].requestFocus();
      _reveal(unit, next, animate: true);
    }

    KeyEventResult onKey(int from, KeyEvent event) {
      if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
        return KeyEventResult.ignored;
      }

      // A page is five rows rather than a screenful: the number a reader can
      // predict is worth more than the one that fills the box.
      final int? to = switch (event.logicalKey) {
        LogicalKeyboardKey.arrowDown => from + 1,
        LogicalKeyboardKey.arrowUp => from - 1,
        LogicalKeyboardKey.pageDown => from + 5,
        LogicalKeyboardKey.pageUp => from - 5,
        LogicalKeyboardKey.home => 0,
        LogicalKeyboardKey.end => rows.length - 1,
        _ => null,
      };

      if (to == null) {
        return KeyEventResult.ignored;
      }

      // An arrow that moved nothing, at the top or the bottom, goes on to the
      // focus system under directional navigation.
      if (mpIsArrow(event.logicalKey) &&
          mpArrowsMoveFocus(context) &&
          to.clamp(0, rows.length - 1) == from) {
        return KeyEventResult.ignored;
      }

      // Held rather than let through: an arrow in a column would otherwise
      // scroll the popup out from under the row it just moved to.
      moveTo(to);

      return KeyEventResult.handled;
    }

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: name,
      child: SizedBox(
        width: side * mpClockColumnFactor,
        // The same height as the calendar beside it, so a date-time picker's
        // popup is one rectangle rather than two of different heights.
        height: side * 7,
        child: ScrollConfiguration(
          behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
          child: SingleChildScrollView(
            controller: _scrollers[unit],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: _rowGap,
              children: <Widget>[
                for (int index = 0; index < rows.length; index += 1)
                  _row(
                    unit: unit,
                    index: index,
                    raw: rows[index],
                    chosen: widget.value != null && column.chosen(rows[index]),
                    text: column.render(rows[index]),
                    name: name,
                    stop: stop,
                    node: nodes[index],
                    onKey: onKey,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row({
    required MPTimeUnit unit,
    required int index,
    required int raw,
    required bool chosen,
    required String text,
    required String name,
    required int stop,
    required FocusNode node,
    required KeyEventResult Function(int from, KeyEvent event) onKey,
  }) {
    final double side = mpCalendarCell[widget.size]!;
    final DateTime at = _candidate(unit, raw);
    final bool disabled = widget.shouldDisableTime?.call(at, unit) ?? false;

    return _CalendarCell(
      key: ValueKey<int>(raw),
      label: '$text $name',
      size: widget.size,
      color: widget.color,
      height: side,
      width: side * mpClockColumnFactor,
      selected: chosen,
      disabled: disabled,
      focused: index == stop,
      focusNode: node,
      onKey: (KeyEvent event) => onKey(index, event),
      // A row reached by the pointer or the focus is where the reader is, so
      // Tab comes back to it.
      onFocused: () {
        if (_cursor[unit] != index) {
          setState(() => _cursor[unit] = index);
        }
      },
      onPressed: () {
        setState(() => _cursor[unit] = index);
        widget.onChanged(at);
      },
      child: Text(text),
    );
  }
}

/// The two buttons in the day view's header.
enum _MonthYearSlot { month, year }

/// Lays the month and the year buttons out side by side, centred, with the
/// month giving way first.
///
/// A `Row` with both in `Flexible` splits the room in half whatever each needs,
/// and a `Row` with the year rigid overflows once the year alone is wider than
/// the room. This gives the year its natural width up to half the room, the
/// month whatever is left, and centres the pair.
class _MonthYearLayout extends MultiChildLayoutDelegate {
  _MonthYearLayout({required this.gap, required this.monthOnLeft});

  final double gap;
  final bool monthOnLeft;

  @override
  void performLayout(Size size) {
    final double room = size.width;
    final Size year = layoutChild(
      _MonthYearSlot.year,
      BoxConstraints(maxWidth: math.max(0, (room - gap) / 2), maxHeight: size.height),
    );
    final Size month = layoutChild(
      _MonthYearSlot.month,
      BoxConstraints(maxWidth: math.max(0, room - gap - year.width), maxHeight: size.height),
    );
    final double total = month.width + gap + year.width;
    final double start = math.max(0, (room - total) / 2);
    final (Size first, Size second) = monthOnLeft ? (month, year) : (year, month);

    positionChild(
      monthOnLeft ? _MonthYearSlot.month : _MonthYearSlot.year,
      Offset(start, (size.height - first.height) / 2),
    );
    positionChild(
      monthOnLeft ? _MonthYearSlot.year : _MonthYearSlot.month,
      Offset(start + first.width + gap, (size.height - second.height) / 2),
    );
  }

  @override
  bool shouldRelayout(_MonthYearLayout oldDelegate) {
    return gap != oldDelegate.gap || monthOnLeft != oldDelegate.monthOnLeft;
  }
}
