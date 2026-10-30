/// A bar of tabs, and the panel under whichever one is chosen.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/roving.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// MD3's two kinds of tab bar.
///
/// Not two levels of emphasis but two depths: primary tabs are the top level
/// of a screen, and secondary tabs divide the content inside one of them. The
/// specification draws the difference three ways, and all three are here: the
/// indicator is 3dp and rounded against 2dp and square, it hugs the label
/// rather than filling the tab, and the chosen label takes the accent rather
/// than the plain ink.
enum MPTabsVariant {
  /// The top level of a screen.
  primary,

  /// A division inside one of a primary bar's panels.
  secondary,
}

/// Where a tab's glyph sits against its label.
enum MPTabIconPosition {
  /// Above the label, which makes the tab taller.
  top,

  /// Before the label, on the same line.
  start,
}

/// A tab's height without a glyph above the label. `md` is MD3's own 48dp.
const Map<MPSize, double> _tabHeight = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 40,
  MPSize.md: 48,
  MPSize.lg: 56,
  MPSize.xl: 64,
};

/// And with one above it, where MD3's own is 64dp.
///
/// A table of its own rather than a padding added to the one above: 64 is not
/// 48 plus the glyph. The specification gives the stacked tab proportionally
/// less air, because the glyph is already doing the work the space would have
/// done.
const Map<MPSize, double> _tabHeightStacked = <MPSize, double>{
  MPSize.xs: 44,
  MPSize.sm: 52,
  MPSize.md: 64,
  MPSize.lg: 72,
  MPSize.xl: 80,
};

/// A tab's inline padding, MD3's 16dp at `md`, and also how far a primary
/// indicator insets itself to end up under the label instead of the tab.
const Map<MPSize, double> _tabPadX = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// The glyph: 24 at `md`, MD3's tab icon and a step up from a button's. A
/// stacked tab is mostly its glyph.
const Map<MPSize, double> _tabIcon = <MPSize, double>{
  MPSize.xs: 18,
  MPSize.sm: 20,
  MPSize.md: 24,
  MPSize.lg: 24,
  MPSize.xl: 28,
};

/// The gap between a stacked tab's glyph and its label.
const double _stackedGap = 4;

/// How much of each end of an overflowing bar is faded out: about one glyph,
/// enough to read as an edge that continues.
const double _fadeLength = 24;

/// What a tab's label is set in: `titleSmall` at `md`, which is MD3's own tab
/// label and a step quieter than the `titleMedium` a button of the same rung
/// takes. A tab is a place rather than an action.
MPTypeRole _tabText(MPTypescale scale, MPSize size) {
  return switch (size) {
    MPSize.xs => scale.labelMedium,
    MPSize.sm => scale.labelLarge,
    MPSize.md || MPSize.lg => scale.titleSmall,
    MPSize.xl => scale.titleMedium,
  };
}

/// One set of panels, one of which is shown.
///
/// ```dart
/// MPTabs<String>(
///   semanticLabel: 'Trip',
///   initialValue: 'flights',
///   children: const <Widget>[
///     MPTab<String>(value: 'flights', child: Text('Flights')),
///     MPTab<String>(value: 'stays', child: Text('Stays')),
///     MPTabPanel<String>(value: 'flights', child: Text('Two seats, Friday.')),
///     MPTabPanel<String>(value: 'stays', child: Text('Three nights.')),
///   ],
/// )
/// ```
///
/// The tabs and the panels go in as one list and are sorted into the bar and
/// the body here, as the React bar sorts its children. There is no tab list to
/// remember: a wrapper whose only job was to say what the widgets already say
/// would be one more thing to get wrong. Every child is an [MPTab] or an
/// [MPTabPanel], and the order of the [MPTab]s is the order of the bar.
///
/// The bar is one focus stop. The arrow keys move the focus along it, Home and
/// End go to either end, and Enter or Space chooses, unless [activateOnFocus]
/// says the arrows choose as they go.
///
/// ## Horizontal only
///
/// There is no `orientation`, and the omission is the specification's. A
/// column of destinations down the side of a screen is a navigation rail, a
/// different component: it switches what the screen is rather than which
/// panel of one is showing.
///
/// A bar with more tabs than room scrolls rather than wrapping, which is MD3's
/// scrollable tabs, and fades the end that still has tabs past it.
class MPTabs<T> extends StatefulWidget {
  /// Creates a set of tabs from [children], a run of [MPTab]s and
  /// [MPTabPanel]s in any order.
  const MPTabs({
    required this.children,
    this.value,
    this.initialValue,
    this.onChanged,
    this.variant = MPTabsVariant.primary,
    this.color,
    this.size,
    this.iconPosition,
    this.activateOnFocus = false,
    this.loopFocus = true,
    this.divider = true,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The [MPTab]s and the [MPTabPanel]s.
  final List<Widget> children;

  /// The chosen tab, for a controlled set: the bar shows this whatever is
  /// pressed, and reports the press through [onChanged]. `null` leaves the set
  /// to keep its own choice.
  final T? value;

  /// Which tab starts chosen, for an uncontrolled set. Left out, the first tab
  /// that is not disabled.
  final T? initialValue;

  /// Called with the value of the tab that was chosen.
  final ValueChanged<T>? onChanged;

  /// Which of MD3's two kinds of tab bar this is: [MPTabsVariant.primary] for
  /// the top level of a screen, [MPTabsVariant.secondary] for a division inside
  /// one of its panels.
  final MPTabsVariant variant;

  /// Which accent family the indicator, and a primary bar's chosen label,
  /// read. [MPColor.primary] unless an [MPConfigProvider] says otherwise.
  final MPColor? color;

  /// The tab height, type role, padding and glyph. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Where a tab's glyph sits. Defaults to what the variant does in the
  /// specification: above the label on a primary tab, before it on a secondary
  /// one.
  final MPTabIconPosition? iconPosition;

  /// Whether the arrow keys also choose the tab they land on.
  ///
  /// `false` by default. Automatic activation is only kind when every panel is
  /// already built; the moment one of them fetches, walking past four tabs
  /// fires four requests.
  final bool activateOnFocus;

  /// Whether the arrow keys wrap from the last tab back to the first.
  ///
  /// Under directional navigation, a remote's D-pad, the arrows are also the
  /// only way out of the bar, so they halt at either end whatever this says.
  final bool loopFocus;

  /// The hairline under the bar, MD3's divider between a tab bar and the
  /// content it is about. Turn it off inside a card that already has an edge.
  final bool divider;

  /// The tabs share the bar's width, each taking an equal part of it.
  final bool fullWidth;

  /// The name a screen reader gives the bar. The tabs only name themselves.
  final String? semanticLabel;

  /// Drives the bar's one focus stop from outside.
  final FocusNode? focusNode;

  /// Puts the focus on the bar's stop as it is inserted.
  final bool autofocus;

  @override
  State<MPTabs<T>> createState() => _MPTabsState<T>();
}

/// One tab.
///
/// It has no `size`, no `color` and no `variant` of its own: all three belong
/// to the [MPTabs] around it, the only place they can be set once and mean the
/// same thing for every tab. It is drawn only as a child of one.
class MPTab<T> extends StatelessWidget {
  /// Creates a tab for [value].
  const MPTab({
    required this.value,
    this.child,
    this.icon,
    this.disabled = false,
    this.semanticLabel,
    super.key,
  });

  /// Identifies the tab, and picks out the [MPTabPanel] with the same value.
  final T value;

  /// The label, usually a [Text].
  final Widget? child;

  /// The glyph, drawn above or before the label as the bar's
  /// [MPTabs.iconPosition] says and sized by the bar's rung.
  final Widget? icon;

  /// Unavailable, but still in the bar and still announced. The arrow keys
  /// pass over it.
  final bool disabled;

  /// The tab's name for a screen reader, in place of what it shows. The one an
  /// icon-only tab needs.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final _TabSlot? slot = context.dependOnInheritedWidgetOfExactType<_TabSlot>();

    if (slot == null) {
      throw FlutterError('An MPTab is drawn by the MPTabs it is a child of, and by nothing else.');
    }

    return _TabView(tab: this, slot: slot);
  }
}

/// The content behind one tab.
///
/// Taken out of the tree while it is hidden unless [keepMounted] says
/// otherwise, which is right for four panels of which one is on screen and
/// wrong for a panel holding a half-filled form.
class MPTabPanel<T> extends StatelessWidget {
  /// Creates the panel [value]'s tab shows.
  const MPTabPanel({required this.value, required this.child, this.keepMounted = false, super.key});

  /// Which tab shows this panel.
  final T value;

  /// The content.
  final Widget child;

  /// Keeps the panel built while it is hidden, for one that is expensive to
  /// build or holds state that should survive being switched away from. A
  /// hidden panel is not painted, not reachable by the focus and not on the
  /// semantics tree, and its animations are paused.
  final bool keepMounted;

  @override
  Widget build(BuildContext context) => child;
}

class _MPTabsState<T> extends State<MPTabs<T>>
    with MPRovingStop<MPTabs<T>>, SingleTickerProviderStateMixin {
  /// One key per tab, in bar order, which is how a tab's box is found to put
  /// the indicator under it and to bring it into view.
  final List<GlobalKey> _keys = <GlobalKey>[];

  /// The box the indicator is measured against.
  final GlobalKey _bar = GlobalKey();

  /// The uncontrolled choice.
  late T? _own = widget.initialValue ?? _firstEnabled;

  /// The tab the arrow keys put the focus on, or `null` while the focus is
  /// not in the bar and the stop rests on the chosen tab.
  int? _focusIndex;

  /// Whether something inside the bar holds the focus.
  bool _barFocused = false;

  /// The chosen tab's box, in the bar's own coordinates, or `null` before it
  /// has been measured or while no tab is chosen.
  Rect? _indicator;

  /// Whether a measure is already waiting for the end of the frame.
  bool _measuring = false;

  /// A tag that makes this set's panel identifiers its own, so a tab can say
  /// which panel it controls without colliding with another set's.
  late final String _tag = 'mp-tabs-${identityHashCode(this)}';

  /// The arriving panel's fade. At full from the start, so nothing fades on
  /// the first paint: a bar that faded its own content in as the screen opened
  /// would be answering a question nobody asked.
  late final AnimationController _fade;

  late final CurvedAnimation _fadeCurve;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(vsync: this, duration: MPMotion.short4, value: 1);
    _fadeCurve = CurvedAnimation(parent: _fade, curve: MPMotion.standard);
  }

  @override
  FocusNode? get callerStop => widget.focusNode;

  List<MPTab<T>> get _tabs => widget.children.whereType<MPTab<T>>().toList(growable: false);

  List<MPTabPanel<T>> get _panels =>
      widget.children.whereType<MPTabPanel<T>>().toList(growable: false);

  T? get _firstEnabled {
    for (final MPTab<T> tab in widget.children.whereType<MPTab<T>>()) {
      if (!tab.disabled) {
        return tab.value;
      }
    }

    return null;
  }

  T? get _value => widget.value ?? _own;

  /// Which tab the one focus stop rests on: where the arrow keys last put it,
  /// or the chosen tab, or the first one that is not disabled.
  int _stopIn(List<MPTab<T>> tabs, int chosen) {
    final int? focused = _focusIndex;

    if (focused != null && focused < tabs.length) {
      return focused;
    }

    if (chosen >= 0) {
      return chosen;
    }

    final int first = tabs.indexWhere((MPTab<T> tab) => !tab.disabled);

    return first < 0 ? 0 : first;
  }

  @override
  void didUpdateWidget(MPTabs<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    keepStop(oldWidget.focusNode);

    final T? before = oldWidget.value ?? _own;

    if (before != _value) {
      _arrive();
    }
  }

  @override
  void dispose() {
    _fadeCurve.dispose();
    _fade.dispose();
    super.dispose();
  }

  /// Fades the panel that has just been chosen in.
  ///
  /// An entrance and no exit, as in the React bar: a panel that faded out
  /// would have to stay in the layout while it did, and the page would grow
  /// to hold both before collapsing onto the new one.
  void _arrive() {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    if (reduceMotion) {
      _fade.value = 1;
    } else {
      _fade.forward(from: 0);
    }
  }

  void _syncKeys(int count) {
    while (_keys.length < count) {
      _keys.add(GlobalKey());
    }

    if (_keys.length > count) {
      _keys.removeRange(count, _keys.length);
    }
  }

  /// Measures the chosen tab once the frame being built has been laid out.
  void _scheduleMeasure() {
    if (_measuring) {
      return;
    }

    _measuring = true;
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      _measuring = false;
      _measure();
    });
  }

  /// Reads the chosen tab's box, in the bar's own coordinates.
  ///
  /// A measurement rather than arithmetic on the count: tabs are as wide as
  /// their labels unless [MPTabs.fullWidth] says otherwise, and an indicator
  /// placed by division would sit under the wrong one the moment two labels
  /// differ.
  void _measure() {
    if (!mounted) {
      return;
    }

    final List<MPTab<T>> tabs = _tabs;
    final int chosen = tabs.indexWhere((MPTab<T> tab) => tab.value == _value);
    final RenderBox? bar = _bar.currentContext?.findRenderObject() as RenderBox?;
    final RenderBox? tab = chosen >= 0 && chosen < _keys.length
        ? _keys[chosen].currentContext?.findRenderObject() as RenderBox?
        : null;

    final Rect? next = tab != null && bar != null && tab.attached && tab.hasSize && bar.hasSize
        ? tab.localToGlobal(Offset.zero, ancestor: bar) & tab.size
        : null;

    if (next != _indicator) {
      setState(() => _indicator = next);
    }
  }

  void _select(int index) {
    final List<MPTab<T>> tabs = _tabs;

    if (index < 0 || index >= tabs.length || tabs[index].disabled) {
      return;
    }

    final T next = tabs[index].value;

    if (next == _value) {
      return;
    }

    if (widget.value == null) {
      setState(() => _own = next);
      _arrive();
    }

    widget.onChanged?.call(next);
  }

  /// A press: the tab is chosen, and the stop goes with the choice.
  void _press(int index) {
    if (_focusIndex != null && _focusIndex != index) {
      keepStop(widget.focusNode);
      setState(() => _focusIndex = null);
    }

    _select(index);
  }

  /// Moves the stop to the next tab in [step]'s direction that is not
  /// disabled, and says whether there was one.
  bool _move(int step) {
    final List<MPTab<T>> tabs = _tabs;

    if (tabs.isEmpty) {
      return false;
    }

    final int count = tabs.length;
    final int chosen = tabs.indexWhere((MPTab<T> tab) => tab.value == _value);
    final bool wraps = widget.loopFocus && !mpArrowsMoveFocus(context);
    int index = _stopIn(tabs, chosen);

    for (int tried = 0; tried < count; tried += 1) {
      index += step;

      if (wraps) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return false;
      }

      if (!tabs[index].disabled) {
        _focusOn(index);

        return true;
      }
    }

    return false;
  }

  /// Puts the stop on the first or the last tab that is not disabled.
  bool _edge({required bool last}) {
    final List<MPTab<T>> tabs = _tabs;
    final Iterable<int> order = last
        ? Iterable<int>.generate(tabs.length, (int i) => tabs.length - 1 - i)
        : Iterable<int>.generate(tabs.length);

    for (final int index in order) {
      if (!tabs[index].disabled) {
        _focusOn(index);

        return true;
      }
    }

    return false;
  }

  void _focusOn(int index) {
    keepStop(widget.focusNode);
    setState(() => _focusIndex = index);

    if (widget.activateOnFocus) {
      _select(index);
    }
  }

  void _onBarFocus(bool focused) {
    // The stop goes back to the chosen tab once the reader has left the bar,
    // so a reader who arrives again by Tab arrives on the tab that is open.
    setState(() {
      _barFocused = focused;

      if (!focused) {
        _focusIndex = null;
      }
    });
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }

    // The bar runs the way the text does, so under RTL the next tab is the one
    // to the left.
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final LogicalKeyboardKey forward = rtl
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    final LogicalKeyboardKey back = rtl
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;
    final LogicalKeyboardKey key = event.logicalKey;

    // An arrow that moved nothing, past an end, goes on to the focus system
    // under directional navigation, where it is the way out of the bar.
    if (key == forward) {
      return mpArrowResult(context, moved: _move(1));
    }

    if (key == back) {
      return mpArrowResult(context, moved: _move(-1));
    }

    if (key == LogicalKeyboardKey.home) {
      return _edge(last: false) ? KeyEventResult.handled : KeyEventResult.ignored;
    }

    if (key == LogicalKeyboardKey.end) {
      return _edge(last: true) ? KeyEventResult.handled : KeyEventResult.ignored;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    assert(
      widget.children.every((Widget child) => child is MPTab<T> || child is MPTabPanel<T>),
      'Every child of an MPTabs<$T> is an MPTab<$T> or an MPTabPanel<$T>.',
    );

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPAccent accent = colors.accent(color);
    final bool primary = widget.variant == MPTabsVariant.primary;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    final List<MPTab<T>> tabs = _tabs;
    final List<MPTabPanel<T>> panels = _panels;
    final T? value = _value;
    final int chosen = tabs.indexWhere((MPTab<T> tab) => tab.value == value);
    final int stopIndex = _stopIn(tabs, chosen);

    _syncKeys(tabs.length);

    // The specification's own pairing: a primary tab stacks its glyph and a
    // secondary one keeps it inline. Read from the variant rather than
    // defaulted to one of them, so a bar that changes kind changes shape.
    final MPTabIconPosition iconPosition =
        widget.iconPosition ?? (primary ? MPTabIconPosition.top : MPTabIconPosition.start);

    final _TabsLook look = _TabsLook(
      variant: widget.variant,
      size: size,
      iconPosition: iconPosition,
      fullWidth: widget.fullWidth,
      colors: colors,
      accent: accent,
      typescale: theme.typescale,
      reduceMotion: reduceMotion,
    );

    String panelId(int index) => '$_tag-${tabs[index].value}';

    final Widget bar = LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final bool bounded = constraints.hasBoundedWidth;
        final bool share = widget.fullWidth && bounded;

        // A relayout that moves or resizes the chosen tab moves the indicator,
        // and a new width is one: this builder runs again whenever the bar is
        // given one.
        _scheduleMeasure();

        final List<Widget> slots = <Widget>[
          for (int index = 0; index < tabs.length; index += 1)
            KeyedSubtree(
              key: _keys[index],
              // A tab whose label grows or shrinks on its own moves the tabs
              // after it, and the indicator with them.
              child: SizeChangedLayoutNotifier(
                child: _TabSlot(
                  look: look,
                  chosen: index == chosen,
                  holdsStop: index == stopIndex,
                  stop: index == stopIndex ? stop : null,
                  autofocus: index == stopIndex && widget.autofocus,
                  onPressed: () => _press(index),
                  controls: index == chosen && panels.any((MPTabPanel<T> p) => p.value == value)
                      ? panelId(index)
                      : null,
                  child: tabs[index],
                ),
              ),
            ),
        ];

        Widget row = Row(
          mainAxisSize: share ? MainAxisSize.max : MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[for (final Widget slot in slots) share ? Expanded(child: slot) : slot],
        );

        // The bar's own node, and the only thing under it is the tabs: a
        // screen reader is told this is a set of tabs and how many there are.
        if (tabs.isNotEmpty) {
          row = Semantics(
            container: true,
            explicitChildNodes: true,
            role: SemanticsRole.tabBar,
            label: widget.semanticLabel,
            child: row,
          );
        }

        row = NotificationListener<SizeChangedLayoutNotification>(
          onNotification: (SizeChangedLayoutNotification notification) {
            _scheduleMeasure();

            return true;
          },
          child: row,
        );

        final Rect? measured = _indicator;
        final double inset = _tabPadX[size]!;
        final Duration motion = reduceMotion ? Duration.zero : MPMotion.short4;

        Widget strip = Stack(
          key: _bar,
          alignment: AlignmentDirectional.topStart,
          children: <Widget>[
            row,
            if (measured != null)
              AnimatedPositioned(
                duration: motion,
                curve: MPMotion.standard,
                // `left` and not `start`: the box was measured from the bar's
                // left edge, and it stays a distance from the left under RTL.
                left: primary ? measured.left + inset : measured.left,
                width: primary
                    ? (measured.width - inset * 2).clamp(0.0, double.infinity)
                    : measured.width,
                bottom: 0,
                height: primary ? 3 : 2,
                child: IgnorePointer(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: accent.color,
                      // 3dp with a rounded top on a primary bar, inset by the
                      // tab's own padding so it is under the label. Square across
                      // the whole tab on a secondary one, which is the clearest
                      // of the three signals telling the two apart.
                      borderRadius: primary
                          ? const BorderRadius.vertical(top: Radius.circular(3))
                          : null,
                    ),
                  ),
                ),
              ),
          ],
        );

        if (share) {
          // A bar whose tabs share its width has nothing past its ends.
          strip = SizedBox(width: constraints.maxWidth, child: strip);
        } else {
          strip = _EdgeFade(
            reveal: tabs.isEmpty
                ? null
                : _keys[_barFocused ? stopIndex : (chosen >= 0 ? chosen : 0)],
            follow: _barFocused,
            child: ConstrainedBox(
              // As wide as the room at least, so the divider and the strip run
              // the whole width of the bar with the tabs at its start.
              constraints: BoxConstraints(minWidth: bounded ? constraints.maxWidth : 0),
              child: strip,
            ),
          );
        }

        if (widget.divider) {
          // Outside the fade, so the line between the bar and the panel runs
          // the full width whatever the tabs are doing, and under the strip
          // rather than behind it, as a CSS border sits under its content.
          strip = DecoratedBox(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: colors.outlineVariant)),
            ),
            child: Padding(padding: const EdgeInsets.only(bottom: 1), child: strip),
          );
        }

        return Focus(
          canRequestFocus: false,
          skipTraversal: true,
          includeSemantics: false,
          onKeyEvent: _onKey,
          onFocusChange: _onBarFocus,
          child: strip,
        );
      },
    );

    // Every panel that is built is built in the same place in the tree whether
    // it shows or not, so a kept panel keeps its state as it is switched to and
    // away from.
    final List<Widget> built = <Widget>[
      for (final MPTabPanel<T> panel in panels)
        if (panel.value == value || panel.keepMounted)
          KeyedSubtree(
            key: ValueKey<Object?>(panel.value),
            child: _PanelHost(
              visible: panel.value == value,
              fade: _fadeCurve,
              identifier: chosen >= 0 && panel.value == value ? panelId(chosen) : null,
              ink: colors.onSurface,
              child: panel,
            ),
          ),
    ];

    final bool showing = built.isNotEmpty && panels.any((MPTabPanel<T> p) => p.value == value);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        bar,
        if (built.isNotEmpty)
          Padding(
            padding: EdgeInsets.only(top: showing ? mpSheetGap[size]! : 0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: built,
            ),
          ),
      ],
    );
  }
}

/// What every tab in one bar is drawn with.
@immutable
class _TabsLook {
  const _TabsLook({
    required this.variant,
    required this.size,
    required this.iconPosition,
    required this.fullWidth,
    required this.colors,
    required this.accent,
    required this.typescale,
    required this.reduceMotion,
  });

  final MPTabsVariant variant;
  final MPSize size;
  final MPTabIconPosition iconPosition;
  final bool fullWidth;
  final MPColorScheme colors;
  final MPAccent accent;
  final MPTypescale typescale;
  final bool reduceMotion;

  @override
  bool operator ==(Object other) {
    return other is _TabsLook &&
        other.variant == variant &&
        other.size == size &&
        other.iconPosition == iconPosition &&
        other.fullWidth == fullWidth &&
        other.colors == colors &&
        other.accent.color == accent.color &&
        other.typescale == typescale &&
        other.reduceMotion == reduceMotion;
  }

  @override
  int get hashCode => Object.hash(
    variant,
    size,
    iconPosition,
    fullWidth,
    colors,
    accent.color,
    typescale,
    reduceMotion,
  );
}

/// What the bar tells one tab: how the bar looks, and where the tab stands in
/// it. The React bar's context, plus what Base UI tells each tab.
class _TabSlot extends InheritedWidget {
  const _TabSlot({
    required this.look,
    required this.chosen,
    required this.holdsStop,
    required this.stop,
    required this.autofocus,
    required this.onPressed,
    required this.controls,
    required super.child,
  });

  final _TabsLook look;
  final bool chosen;
  final bool holdsStop;
  final FocusNode? stop;
  final bool autofocus;
  final VoidCallback onPressed;

  /// The identifier of the panel this tab shows, while it shows one.
  final String? controls;

  @override
  bool updateShouldNotify(_TabSlot oldWidget) {
    // `onPressed` is a new closure on every build of the bar and reads the
    // index it was made with, which only changes along with the rest of this.
    return look != oldWidget.look ||
        chosen != oldWidget.chosen ||
        holdsStop != oldWidget.holdsStop ||
        !identical(stop, oldWidget.stop) ||
        autofocus != oldWidget.autofocus ||
        controls != oldWidget.controls;
  }
}

/// One drawn tab.
class _TabView extends StatelessWidget {
  const _TabView({required this.tab, required this.slot});

  final MPTab<Object?> tab;
  final _TabSlot slot;

  @override
  Widget build(BuildContext context) {
    final _TabsLook look = slot.look;
    final MPColorScheme colors = look.colors;
    final MPSize size = look.size;
    final bool disabled = tab.disabled;
    final bool stacked = look.iconPosition == MPTabIconPosition.top && tab.icon != null;
    final Duration duration = look.reduceMotion ? Duration.zero : MPMotion.short4;

    // Where the two kinds part company for the second time: a primary tab's
    // chosen label takes the accent, a secondary one's the plain ink. The
    // indicator carries the colour either way.
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : slot.chosen
        ? (look.variant == MPTabsVariant.primary ? look.accent.color : colors.onSurface)
        : colors.onSurfaceVariant;

    final double glyph = _tabIcon[size]!;

    Widget? label = tab.child;

    if (label != null && look.fullWidth) {
      // A shared width can be narrower than the label, which then truncates
      // rather than pushing the tab past its share.
      label = stacked ? label : Flexible(child: label);
    }

    final List<Widget> parts = <Widget>[
      if (tab.icon != null)
        SizedBox.square(
          dimension: glyph,
          child: Center(child: tab.icon),
        ),
      ?label,
    ];

    final Widget content = stacked
        ? Column(mainAxisSize: MainAxisSize.min, spacing: _stackedGap, children: parts)
        : Row(mainAxisSize: MainAxisSize.min, spacing: mpControlGap[size]!, children: parts);

    return ExcludeFocus(
      // One stop for the whole bar: only the tab holding it can be reached by
      // Tab, and the arrow keys hand it on.
      excluding: !slot.holdsStop,
      child: MPInteractive(
        onTap: slot.onPressed,
        enabled: !disabled,
        interactive: !disabled,
        focusNode: slot.stop,
        autofocus: slot.autofocus,
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        builder: (BuildContext context, MPInteraction state) {
          Widget body = SizedBox(
            height: stacked ? _tabHeightStacked[size] : _tabHeight[size],
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: _tabPadX[size]!),
              child: Center(
                widthFactor: look.fullWidth ? null : 1,
                child: ExcludeSemantics(
                  excluding: tab.semanticLabel != null,
                  child: DefaultTextStyle.merge(
                    style: _tabText(look.typescale, size).style(),
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    child: _Ink(color: ink, size: glyph, duration: duration, child: content),
                  ),
                ),
              ),
            ),
          );

          // No wash on a disabled tab, which has its own treatment.
          body = MPStateLayer(
            color: ink,
            opacity: mpStateLayerOpacity(state, enabled: !disabled),
            child: body,
          );

          // Said on the tab's own node, which is in here, and only by the tab
          // holding the stop: the others are behind an `ExcludeFocus`.
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            container: true,
            role: SemanticsRole.tab,
            selected: slot.chosen,
            enabled: !disabled,
            label: tab.semanticLabel,
            focused: focus.focused,
            onFocus: focus.onFocus,
            controlsNodes: slot.controls == null ? null : <String>{slot.controls!},
            onTap: disabled ? null : slot.onPressed,
            child: CustomPaint(
              // Inset rather than offset: a ring outside a tab in a row of them
              // is drawn on top of its neighbours.
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(
                      color: colors.secondary,
                      borderRadius: BorderRadius.zero,
                      offset: -focusRingWidth,
                    )
                  : null,
              child: body,
            ),
          );
        },
      ),
    );
  }
}

/// A tab's ink, eased as it is chosen rather than jumping to the new colour,
/// and handed to the label and the glyph alike.
class _Ink extends StatelessWidget {
  const _Ink({
    required this.color,
    required this.size,
    required this.duration,
    required this.child,
  });

  final Color color;
  final double size;
  final Duration duration;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<Color?>(
      tween: ColorTween(end: color),
      duration: duration,
      curve: MPMotion.standard,
      builder: (BuildContext context, Color? value, Widget? child) {
        return DefaultTextStyle.merge(
          style: TextStyle(color: value),
          child: IconTheme.merge(
            data: IconThemeData(color: value, size: size),
            child: child!,
          ),
        );
      },
      child: child,
    );
  }
}

/// One built panel, shown or kept hidden.
class _PanelHost extends StatelessWidget {
  const _PanelHost({
    required this.visible,
    required this.fade,
    required this.identifier,
    required this.ink,
    required this.child,
  });

  final bool visible;
  final Animation<double> fade;
  final String? identifier;
  final Color ink;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    // The same widgets round the panel whether it shows or not, so switching
    // a kept panel in and out changes values and never the tree's shape.
    return Offstage(
      offstage: !visible,
      child: TickerMode(
        enabled: visible,
        child: ExcludeFocus(
          excluding: !visible,
          child: FadeTransition(
            opacity: visible ? fade : kAlwaysCompleteAnimation,
            child: Semantics(
              container: true,
              role: SemanticsRole.tabPanel,
              identifier: identifier,
              child: DefaultTextStyle.merge(
                style: TextStyle(color: ink),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A bar that runs off the end of its own box, and the fade that says so.
///
/// The bar scrolls, which is what makes this necessary: a scroll bar under a
/// row of tab labels is fifteen pixels of furniture on one platform and an
/// overlay that is invisible until it moves on another. So the ends are faded
/// instead, and only the end that still has something past it, which is what
/// makes the fade a signal rather than a decoration.
///
/// A [ShaderMask] rather than two gradients laid over the ends, for the reason
/// the React package uses a CSS mask: an overlay would have to be painted in
/// the colour of whatever is behind the bar, and a bar can sit on anything.
/// The mask is left out while both ends are settled, so a bar whose tabs all
/// fit pays for no compositing layer at all.
class _EdgeFade extends StatefulWidget {
  const _EdgeFade({required this.reveal, required this.follow, required this.child});

  /// The tab brought into view as the bar is first laid out, and as the reader
  /// moves the focus to it.
  final GlobalKey? reveal;

  /// Whether the bar holds the focus, so that a change of [reveal] is the
  /// reader moving along it. A value set from outside the bar leaves the strip
  /// where the reader put it.
  final bool follow;

  final Widget child;

  @override
  State<_EdgeFade> createState() => _EdgeFadeState();
}

class _EdgeFadeState extends State<_EdgeFade> {
  final ScrollController _controller = ScrollController();

  /// Keeps the scroller when the mask comes or goes around it. Rebuilt at the
  /// new depth instead, it would start again from the first tab.
  final GlobalKey _scroller = GlobalKey();

  bool _start = false;
  bool _end = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      _reveal();
      _onScroll();
    });
  }

  @override
  void didUpdateWidget(_EdgeFade oldWidget) {
    super.didUpdateWidget(oldWidget);
    final bool moved = widget.follow && widget.reveal != oldWidget.reveal;

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (moved) {
        _reveal();
      }
      _onScroll();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Brings the tab into the strip, moving the least it can: not at all while
  /// it already shows clear of the fade, and otherwise just far enough to put
  /// its nearer edge the fade's length in from the edge of the strip, as a
  /// browser scrolls a focused tab into view.
  ///
  /// Only this strip moves. [Scrollable.ensureVisible] would move every
  /// scrollable round the bar too, the page included.
  void _reveal() {
    if (!mounted || !_controller.hasClients) {
      return;
    }

    final RenderObject? tab = widget.reveal?.currentContext?.findRenderObject();

    if (tab == null || !tab.attached) {
      return;
    }

    final ScrollPosition position = _controller.position;
    final RenderAbstractViewport viewport = RenderAbstractViewport.of(tab);
    final double leading = viewport.getOffsetToReveal(tab, 0).offset - _fadeLength;
    final double trailing = viewport.getOffsetToReveal(tab, 1).offset + _fadeLength;
    final double target = position.pixels
        .clamp(trailing < leading ? trailing : leading, leading)
        .clamp(position.minScrollExtent, position.maxScrollExtent);

    if (target != position.pixels) {
      position.jumpTo(target);
    }
  }

  void _onScroll() {
    if (mounted && _controller.hasClients) {
      _read(_controller.position);
    }
  }

  void _read(ScrollMetrics metrics) {
    // A pixel of slack: a fractional layout leaves a strip that fits reporting
    // an extent a hair longer than its box, and a bar that fades because of
    // rounding is a bar that lies.
    final bool start = metrics.pixels > 1;
    final bool end = metrics.maxScrollExtent - metrics.pixels > 1;

    if (start != _start || end != _end) {
      setState(() {
        _start = start;
        _end = end;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // The metrics change without anybody scrolling when the bar is resized or
    // a tab is added, which a scroll listener cannot see. The notification is
    // dispatched after the frame it belongs to, so this may set state directly.
    Widget strip = NotificationListener<ScrollMetricsNotification>(
      key: _scroller,
      onNotification: (ScrollMetricsNotification notification) {
        _read(notification.metrics);

        return false;
      },
      // No scroll bar, which a desktop platform would otherwise add: under a
      // row of labels it is furniture where it is drawn and invisible until it
      // moves where it is not. The fade below is what says the bar runs on.
      child: ScrollConfiguration(
        behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
        child: SingleChildScrollView(
          controller: _controller,
          scrollDirection: Axis.horizontal,
          child: widget.child,
        ),
      ),
    );

    if (!_start && !_end) {
      return strip;
    }

    // The gradient runs in the reader's direction, so the two middle stops
    // stay the two ends of the strip and the whole thing turns round under
    // RTL with nothing else having to know.
    final TextDirection direction = Directionality.of(context);

    strip = ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (Rect bounds) {
        final double fade = bounds.width > 0 ? (_fadeLength / bounds.width).clamp(0.0, 0.5) : 0.0;

        // The scroll's own start is the reader's start under either direction,
        // so `_start` belongs to the first pair of stops as it is.
        return LinearGradient(
          begin: AlignmentDirectional.centerStart,
          end: AlignmentDirectional.centerEnd,
          colors: const <Color>[
            Color(0x00000000),
            Color(0xFF000000),
            Color(0xFF000000),
            Color(0x00000000),
          ],
          stops: <double>[0, _start ? fade : 0, _end ? 1 - fade : 1, 1],
        ).createShader(bounds, textDirection: direction);
      },
      child: strip,
    );

    return strip;
  }
}
