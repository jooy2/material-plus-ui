/// A strip of anything, laid out in one direction and scrolled in it.
library;

import 'package:flutter/gestures.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/keyboard_scroll.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/wheel.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// When the two scroll buttons are drawn.
enum MPScrollZoneButtons {
  /// Neither while everything fits, and at an end whichever costs less: an
  /// [MPScrollZoneButtonPlacement.overlay] button with nowhere to go is
  /// removed, an [MPScrollZoneButtonPlacement.inline] one is drawn disabled.
  auto,

  /// Both, from the first frame, disabled rather than gone at an end. What a
  /// strip whose content arrives later wants, so the buttons are not appearing
  /// under the pointer half a second in.
  always,

  /// None at all. A finger, a drag, the wheel and the keyboard still scroll it;
  /// this is the strip that scrolls the way a phone scrolls.
  none,
}

/// Where the scroll buttons sit, which is also where the strip ends.
enum MPScrollZoneButtonPlacement {
  /// Beside the strip, in the layout. The scroller stops where the button
  /// starts, so an item is cut off at the button's edge rather than sliding
  /// under it: nothing is ever half hidden behind a control.
  ///
  /// The lane is held open even while its button has nowhere to go, or the
  /// strip would resize under the pointer each time it reached an end.
  inline,

  /// Over the ends of the strip, which keeps every pixel of the box for
  /// content. What a shelf of pictures wants.
  overlay,
}

/// What pressing a scroll button does.
enum MPScrollZoneMode {
  /// Moves to the next child along, `step` of them at a time: the only one that
  /// lands on something rather than between two things.
  item,

  /// Moves by everything currently in view, the way Page Down does.
  page,

  /// Travels for as long as the button is held, at `speed` pixels a second. A
  /// press too short to be a hold moves one item instead, so the button is
  /// never dead to a quick tap.
  hold,
}

/// How far an overlay button sits in from the edge it is held against.
const Map<MPSize, double> _buttonInset = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// And the air between an inline button and the strip it flanks.
const Map<MPSize, double> _buttonGap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// Under this, a press in [MPScrollZoneMode.hold] was a tap, and moves one item.
const Duration _tap = Duration(milliseconds: 140);

/// A pixel of slack at each end: a strip pushed fully to one end on a scaled
/// display reports a hair short of it.
const double _epsilon = 1;

/// The scroll behaviour of a zone that answers a mouse drag.
///
/// A finger and a trackpad already scroll; what this adds is the mouse, which
/// Flutter deliberately leaves out, and a shelf is exactly the place that asks
/// for it. It also stops the framework drawing a platform scrollbar or an
/// overscroll glow of its own: the zone draws its own bar when asked, and the
/// glow is another design system's ink.
class _DragBehavior extends ScrollBehavior {
  const _DragBehavior({required this.drag});

  final bool drag;

  @override
  Set<PointerDeviceKind> get dragDevices => <PointerDeviceKind>{
    PointerDeviceKind.touch,
    PointerDeviceKind.stylus,
    PointerDeviceKind.invertedStylus,
    PointerDeviceKind.trackpad,
    if (drag) PointerDeviceKind.mouse,
  };

  @override
  Widget buildScrollbar(BuildContext context, Widget child, ScrollableDetails details) => child;

  @override
  Widget buildOverscrollIndicator(BuildContext context, Widget child, ScrollableDetails details) {
    return child;
  }
}

/// A strip of anything, laid out in one direction and scrolled in it.
///
/// ```dart
/// MPScrollZone(
///   label: 'Categories',
///   children: <Widget>[for (final String name in categories) MPChip(label: Text(name))],
/// )
/// ```
///
/// The mechanism is an **ordinary scroll view**, and everything the widget
/// offers is a way of driving one. A finger, a trackpad and the keyboard are
/// Flutter's own and are never intercepted. What is added on top is a pair of
/// buttons for the pointer that has neither a wheel nor a finger, a mouse drag
/// for the strip that reads as something to pull, and, only where it is asked
/// for, the wheel turned onto the axis the strip runs along.
///
/// Nothing is transformed. A scroll offset is also what makes the strip run the
/// other way under right-to-left text without being told.
///
/// It draws no sheet of its own. [variant], [size] and [color] reach the two
/// buttons, which are icon `MPButton`s, the same thing an `MPIconButton` is.
///
/// [lines] is what separates this from `MPCarousel`: a carousel is one thing at
/// a time and knows which one, while a scroll zone is a shelf that happens to be
/// longer than the room it is in.
class MPScrollZone extends StatefulWidget {
  /// Creates a scroll zone.
  const MPScrollZone({
    required this.children,
    this.orientation = MPOrientation.horizontal,
    this.lines = 1,
    this.gap = 8,
    this.buttons = MPScrollZoneButtons.auto,
    this.buttonPlacement = MPScrollZoneButtonPlacement.inline,
    this.mode = MPScrollZoneMode.item,
    this.step = 1,
    this.speed = 900,
    this.snap = false,
    this.drag = true,
    this.wheel = false,
    this.scrollbar = false,
    this.controller,
    this.variant = MPVariant.filled,
    this.size,
    this.color,
    this.label,
    this.previousLabel,
    this.nextLabel,
    this.locale,
    super.key,
  }) : assert(lines >= 1, 'lines must be at least 1'),
       assert(step >= 1, 'step must be at least 1');

  /// The strip. Every child is one item of it.
  final List<Widget> children;

  /// Which way the children run, and so which way the zone scrolls.
  final MPOrientation orientation;

  /// How many rows a horizontal zone lays its children out in before it starts
  /// a new column, and how many columns a vertical one uses. `2` is the shelf
  /// that holds twice as much in the same width.
  final int lines;

  /// The space between children, in logical pixels.
  final double gap;

  /// When the scroll buttons are drawn.
  final MPScrollZoneButtons buttons;

  /// Whether they sit beside the strip or over it.
  final MPScrollZoneButtonPlacement buttonPlacement;

  /// What pressing one does.
  final MPScrollZoneMode mode;

  /// How many children one press moves, in [MPScrollZoneMode.item].
  final int step;

  /// How fast a held button travels, in pixels a second.
  final double speed;

  /// Brings the nearest child to the leading edge when the scrolling stops, a
  /// drag and the wheel included, not only the buttons.
  final bool snap;

  /// Lets a mouse drag the strip along, the way a finger already can.
  final bool drag;

  /// Turns a wheel rolled over a horizontal strip into travel along it: the one
  /// axis a mouse has, on a strip that does not run along it.
  ///
  /// Off by default, because a wheel taken from the page is the page's: a
  /// reader who meant to scroll past the shelf is held by it instead. What it
  /// takes it gives back at the ends. A trackpad swiping sideways is left
  /// alone, and a vertical zone ignores this; there the wheel already points the
  /// way the strip runs.
  final bool wheel;

  /// Draws a thin scrollbar over the strip.
  final bool scrollbar;

  /// Drives the scroll from outside. Left out, the zone owns one of its own.
  final ScrollController? controller;

  /// How the scroll buttons are drawn.
  final MPVariant variant;

  /// The size of the buttons, and how far they sit from the strip. Not the size
  /// of a child, which is whatever the caller made it.
  final MPSize? size;

  /// Which accent family the buttons read.
  final MPColor? color;

  /// What the strip is called: "Categories", "Recent files". Defaults to the
  /// wording in [locale].
  final String? label;

  /// What the back button is called. Defaults to the wording in [locale].
  final String? previousLabel;

  /// What the forward button is called. Defaults to the wording in [locale].
  final String? nextLabel;

  /// Which language the default names are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  @override
  State<MPScrollZone> createState() => _MPScrollZoneState();
}

class _MPScrollZoneState extends State<MPScrollZone> with TickerProviderStateMixin {
  ScrollController? _own;
  Ticker? _hold;

  /// One key per *group*, a column of a horizontal strip and a row of a
  /// vertical one, so a press moves one whole group rather than part of one.
  final List<GlobalKey> _groupKeys = <GlobalKey>[];
  final GlobalKey _viewportKey = GlobalKey();

  bool _back = false;
  bool _forward = false;

  /// Whether the last press on a button lasted long enough to be a hold, so
  /// the tap reported on its release can be swallowed.
  bool _wasHeld = false;

  ScrollController get _scroll => widget.controller ?? (_own ??= ScrollController());

  bool get _horizontal => widget.orientation == MPOrientation.horizontal;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  /// The children, chunked into the groups [MPScrollZone.lines] asks for.
  List<List<Widget>> get _groups {
    final List<List<Widget>> groups = <List<Widget>>[];
    final List<Widget> children = widget.children;

    for (int index = 0; index < children.length; index += widget.lines) {
      final int end = index + widget.lines > children.length
          ? children.length
          : index + widget.lines;

      groups.add(children.sublist(index, end));
    }

    return groups;
  }

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_measure);
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => _measure());
  }

  @override
  void didUpdateWidget(MPScrollZone oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.controller != oldWidget.controller) {
      (oldWidget.controller ?? _own)?.removeListener(_measure);
      _scroll.addListener(_measure);
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) => _measure());
  }

  @override
  void dispose() {
    _hold?.dispose();
    _scroll.removeListener(_measure);
    _own?.dispose();
    super.dispose();
  }

  /// Whether there is anything left in each direction.
  ///
  /// Read after every scroll and after every layout, which covers what the
  /// React zone needs a resize observer for: a strip that is zero wide inside a
  /// closed panel until it is opened, and content that changes size.
  void _measure() {
    if (!mounted || !_scroll.hasClients || !_scroll.position.hasContentDimensions) {
      return;
    }

    final ScrollPosition position = _scroll.position;
    final bool back = position.pixels > position.minScrollExtent + _epsilon;
    final bool forward = position.pixels < position.maxScrollExtent - _epsilon;

    if (back != _back || forward != _forward) {
      setState(() {
        _back = back;
        _forward = forward;
      });
    }
  }

  bool get _reduceMotion => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  /// Moves the strip to [offset], held inside its extent. A reader who asked
  /// for less motion gets the cut rather than the travel.
  void _to(double offset) {
    if (!_scroll.hasClients) {
      return;
    }

    final ScrollPosition position = _scroll.position;
    final double target = offset.clamp(position.minScrollExtent, position.maxScrollExtent);

    if (_reduceMotion) {
      _scroll.jumpTo(target);

      return;
    }

    _scroll.animateTo(target, duration: MPMotion.medium2, curve: MPMotion.standard);
  }

  /// Where each group starts, as a scroll offset.
  List<double> _groupStarts() {
    final RenderBox? viewport = _viewportKey.currentContext?.findRenderObject() as RenderBox?;

    if (viewport == null || !viewport.hasSize || !_scroll.hasClients) {
      return <double>[];
    }

    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final List<double> starts = <double>[];

    for (final GlobalKey key in _groupKeys) {
      final RenderBox? box = key.currentContext?.findRenderObject() as RenderBox?;

      if (box == null || !box.hasSize) {
        continue;
      }

      final Offset local = box.localToGlobal(Offset.zero, ancestor: viewport);

      // A distance along the run from its leading edge, which is the right edge
      // of a horizontal strip under right-to-left text.
      final double along = _horizontal
          ? (rtl ? viewport.size.width - local.dx - box.size.width : local.dx)
          : local.dy;

      starts.add(along + _scroll.position.pixels);
    }

    return starts..sort();
  }

  /// One press, in whichever unit [MPScrollZone.mode] counts in.
  void _advance(bool forward, {MPScrollZoneMode? unit}) {
    if (!_scroll.hasClients) {
      return;
    }

    final ScrollPosition position = _scroll.position;
    final double extent = position.viewportDimension;

    if ((unit ?? widget.mode) == MPScrollZoneMode.page) {
      _to(position.pixels + (forward ? extent : -extent));

      return;
    }

    final List<double> starts = _groupStarts();
    final List<double> ahead = starts
        .where((double start) => start > position.pixels + _epsilon)
        .toList();
    final List<double> behind = starts
        .where((double start) => start < position.pixels - _epsilon)
        .toList();
    final double? target = forward
        ? (ahead.length >= widget.step ? ahead[widget.step - 1] : null)
        : (behind.length >= widget.step ? behind[behind.length - widget.step] : null);

    // Nothing that far along: go as far as there is, or the last part of a
    // strip would be out of reach of the buttons.
    _to(target ?? position.pixels + (forward ? extent : -extent));
  }

  /// `hold`: a ticker rather than a timer, so the strip travels at `speed`
  /// pixels a second whatever the display is doing.
  void _beginHold(bool forward) {
    _stopHold();

    Duration previous = Duration.zero;

    _hold = createTicker((Duration elapsed) {
      final Duration delta = elapsed - previous;

      previous = elapsed;

      if (!_scroll.hasClients) {
        return;
      }

      final ScrollPosition position = _scroll.position;
      final double by = widget.speed * delta.inMicroseconds / Duration.microsecondsPerSecond;

      _scroll.jumpTo(
        (position.pixels + (forward ? by : -by)).clamp(
          position.minScrollExtent,
          position.maxScrollExtent,
        ),
      );
    })..start();
  }

  void _stopHold() {
    _hold?.dispose();
    _hold = null;
  }

  /// Snaps to the nearest group when the scrolling stops, however it stopped.
  bool _onScrollEnd(ScrollEndNotification notification) {
    if (!widget.snap || !_scroll.hasClients) {
      return false;
    }

    final List<double> starts = _groupStarts();

    if (starts.isEmpty) {
      return false;
    }

    final double pixels = _scroll.position.pixels;
    double nearest = starts.first;

    for (final double start in starts) {
      if ((start - pixels).abs() < (nearest - pixels).abs()) {
        nearest = start;
      }
    }

    if ((nearest - pixels).abs() > _epsilon) {
      WidgetsBinding.instance.addPostFrameCallback((Duration _) => _to(nearest));
    }

    return false;
  }

  Widget _button(BuildContext context, {required bool forward}) {
    final bool available = forward ? _forward : _back;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpScrollMessages,
      locale: widget.locale,
    );

    // The chevron is drawn pointing down and turned, and turned the other way
    // under right-to-left text, where forward is on the other side.
    final int turns = _horizontal ? (forward ? (rtl ? 1 : -1) : (rtl ? -1 : 1)) : (forward ? 0 : 2);

    Widget button = MPButton(
      variant: widget.variant,
      size: _size,
      color: _color,
      disabled: !available,
      semanticLabel: forward
          ? widget.nextLabel ?? messages['next']!
          : widget.previousLabel ?? messages['previous']!,
      startIcon: MPGlyph(MPGlyphShape.chevron, size: mpControlIcon[_size], quarterTurns: turns),
      onPressed: () {
        // A hold has already moved the strip; the tap reported on release would
        // move it one more item on top of that.
        if (_wasHeld) {
          _wasHeld = false;

          return;
        }

        _advance(forward);
      },
    );

    if (widget.mode == MPScrollZoneMode.hold) {
      // A listener above the button rather than a gesture inside it: the button
      // owns the tap, and this only needs to know when the pointer went down
      // and when it came back up.
      button = Listener(
        onPointerDown: (PointerDownEvent event) {
          if (!available) {
            return;
          }

          _wasHeld = false;
          _beginHold(forward);

          Future<void>.delayed(_tap, () {
            if (_hold != null) {
              _wasHeld = true;
            }
          });
        },
        onPointerUp: (PointerUpEvent _) => _stopHold(),
        onPointerCancel: (PointerCancelEvent _) => _stopHold(),
        child: button,
      );
    }

    return button;
  }

  @override
  Widget build(BuildContext context) {
    final List<List<Widget>> groups = _groups;
    final MPSize size = _size;

    while (_groupKeys.length < groups.length) {
      _groupKeys.add(GlobalKey());
    }

    if (_groupKeys.length > groups.length) {
      _groupKeys.removeRange(groups.length, _groupKeys.length);
    }

    // A group is a column of a horizontal strip and a row of a vertical one,
    // which is what the React track's `grid-auto-flow` says. The cross axis of
    // a vertical zone divides evenly, as `minmax(0, 1fr)` does there.
    final List<Widget> track = <Widget>[
      for (int index = 0; index < groups.length; index += 1)
        KeyedSubtree(
          key: _groupKeys[index],
          child: _horizontal
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: widget.gap,
                  children: groups[index],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: widget.gap,
                  children: <Widget>[
                    for (final Widget child in groups[index]) Expanded(child: child),
                    // A short last row keeps the columns the rows above it have.
                    for (int gap = groups[index].length; gap < widget.lines; gap += 1)
                      const Expanded(child: SizedBox.shrink()),
                  ],
                ),
        ),
    ];

    Widget strip = SingleChildScrollView(
      key: _viewportKey,
      controller: _scroll,
      scrollDirection: _horizontal ? Axis.horizontal : Axis.vertical,
      child: _horizontal
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              spacing: widget.gap,
              children: track,
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              spacing: widget.gap,
              children: track,
            ),
    );

    if (widget.scrollbar) {
      strip = RawScrollbar(
        controller: _scroll,
        thumbColor: MPTheme.of(
          context,
        ).colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
        radius: const Radius.circular(2),
        thickness: 4,
        child: strip,
      );
    }

    strip = ScrollConfiguration(
      behavior: _DragBehavior(drag: widget.drag),
      child: NotificationListener<ScrollEndNotification>(
        onNotification: _onScrollEnd,
        child: NotificationListener<ScrollMetricsNotification>(
          onNotification: (ScrollMetricsNotification notification) {
            _measure();

            return false;
          },
          child: strip,
        ),
      ),
    );

    // The wheel turned onto the strip's own axis, only where asked for and only
    // for a horizontal strip; whatever it takes it gives back at the ends.
    strip = MPWheelScroll(
      controller: _scroll,
      turn: widget.wheel && _horizontal,
      overscroll: MPOverscroll.auto,
      child: strip,
    );

    // A strip with no buttons, or with nothing focusable in it, is still one
    // the keyboard can scroll, and a focusable group with a name.
    strip = Semantics(
      container: true,
      label:
          widget.label ?? mpMessagesOf(context, mpScrollMessages, locale: widget.locale)['label']!,
      child: MPKeyboardScroll(
        vertical: _horizontal ? null : _scroll,
        horizontal: _horizontal ? _scroll : null,
        borderRadius: BorderRadius.zero,
        ringOffset: -focusRingWidth,
        child: strip,
      ),
    );

    final bool drawn =
        widget.buttons != MPScrollZoneButtons.none &&
        (widget.buttons == MPScrollZoneButtons.always || _back || _forward);

    if (!drawn) {
      return strip;
    }

    if (widget.buttonPlacement == MPScrollZoneButtonPlacement.inline) {
      final double gap = _buttonGap[size]!;
      final List<Widget> lane = <Widget>[
        _button(context, forward: false),
        Expanded(child: strip),
        _button(context, forward: true),
      ];

      return _horizontal ? Row(spacing: gap, children: lane) : Column(spacing: gap, children: lane);
    }

    final double inset = _buttonInset[size]!;
    final bool always = widget.buttons == MPScrollZoneButtons.always;
    final TextDirection direction = Directionality.of(context);

    return Stack(
      children: <Widget>[
        strip,
        // An overlay button with nowhere to go is not drawn at all: there is no
        // lane to keep, because the strip already has every pixel of the box.
        if (always || _back)
          Positioned.directional(
            textDirection: direction,
            start: _horizontal ? inset : 0,
            end: _horizontal ? null : 0,
            top: _horizontal ? 0 : inset,
            bottom: _horizontal ? 0 : null,
            child: Center(child: _button(context, forward: false)),
          ),
        if (always || _forward)
          Positioned.directional(
            textDirection: direction,
            start: _horizontal ? null : 0,
            end: _horizontal ? inset : 0,
            top: _horizontal ? 0 : null,
            bottom: _horizontal ? 0 : inset,
            child: Center(child: _button(context, forward: true)),
          ),
      ],
    );
  }
}
