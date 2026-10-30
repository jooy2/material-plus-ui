/// A row of destinations floating clear of the bottom edge of the screen.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/bottom_navigation.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The lozenge's height.
///
/// Shorter than the full-width bar at every rung, and that is the shape rather
/// than a different opinion about spacing. A bar against the bottom edge is
/// 80dp because it has a whole screen edge to hold; a lozenge floating over the
/// screen is a control, and one as tall as the specification's bar would read
/// as a misplaced bar rather than as something lifted off the screen.
const Map<MPSize, double> _barHeight = <MPSize, double>{
  MPSize.xs: 48,
  MPSize.sm: 56,
  MPSize.md: 64,
  MPSize.lg: 72,
  MPSize.xl: 80,
};

/// The air inside the sheet, on either side of the row.
///
/// Tight, and that is what the shape needs: a destination carries a rounded
/// indicator of its own, and this is the gap between that indicator and the
/// lozenge's edge. Any more and there are two concentric stadiums with a
/// stripe of nothing between them.
const Map<MPSize, double> _rowPad = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// Between one destination and the next.
const Map<MPSize, double> _rowGap = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 4,
  MPSize.md: 6,
  MPSize.lg: 8,
  MPSize.xl: 10,
};

/// The level the lozenge is lifted to while nobody has chosen a surface.
const MPElevation _defaultElevation = 3;

/// A row of destinations floating clear of the bottom edge of the screen.
///
/// ```dart
/// MPFloatingBottomNavigation(
///   label: 'Main',
///   initialValue: 'home',
///   children: const <Widget>[
///     MPBottomNavigationItem(value: 'home', label: 'Home', icon: HomeGlyph()),
///     MPBottomNavigationItem(value: 'search', label: 'Search', icon: SearchGlyph()),
///   ],
/// )
/// ```
///
/// It is `MPBottomNavigation` lifted off the screen: the same navigation
/// landmark, the same `MPBottomNavigationItem` children, the same selected
/// destination, and deliberately not a tab bar, for the same reason.
///
/// ## Everything about the shape follows from [offset]
///
/// Because the screen keeps going underneath, the sheet is a stadium rather
/// than a bar; it is only as wide as its destinations; it carries a shadow,
/// because a lozenge lying flat over what it floats above reads as a mistake;
/// and it names only the destination the reader is on, since five drawn names
/// would stretch it back into a bar.
///
/// ## There is no second highlight
///
/// The destination the reader is on wears the same active indicator it wears
/// in the full-width bar. A lozenge with a tile sliding between destinations as
/// well would be saying where the reader is twice, on two different curves.
///
/// ## Where it sits
///
/// Wherever the layout puts it, usually the bottom of a `Stack` over the
/// content it floats above. The widget is as wide as what it is given, with
/// the lozenge centred in it and [offset] under it.
class MPFloatingBottomNavigation extends StatefulWidget {
  /// Creates a floating bar of [children], which are `MPBottomNavigationItem`s.
  const MPFloatingBottomNavigation({
    required this.children,
    this.value,
    this.initialValue,
    this.onChanged,
    this.offset = 16,
    this.labels = MPBottomNavigationLabels.selected,
    this.variant,
    this.elevation,
    this.size,
    this.safeArea = true,
    this.disabled = false,
    this.label,
    super.key,
  });

  /// The destinations: the same `MPBottomNavigationItem` the full-width bar
  /// takes.
  final List<Widget> children;

  /// The destination the reader is on. Given, the bar is controlled.
  ///
  /// `null` cannot also mean "controlled, on none of them", so a controlled
  /// bar with nothing current holds its own place until the first press,
  /// reports it through [onChanged], and is controlled from then on.
  final MPBottomNavigationValue? value;

  /// The destination that starts current, for a bar that holds its own place.
  final MPBottomNavigationValue? initialValue;

  /// Called with the value of the destination that was pressed.
  final ValueChanged<MPBottomNavigationValue>? onChanged;

  /// How far the lozenge floats above the bottom edge, in logical pixels.
  ///
  /// The whole difference between this and `MPBottomNavigation`: the gap under
  /// it is what makes the screen keep going underneath rather than stop at a
  /// bar.
  final double offset;

  /// Which names are drawn. [MPBottomNavigationLabels.selected] here, against
  /// the `all` a full-width bar takes: this one is only as wide as what is in
  /// it, and five drawn names would stretch it across the screen.
  final MPBottomNavigationLabels labels;

  /// How much surface the lozenge paints, on a container's ladder, so the
  /// sheet is never dyed: what carries the accent is the one destination that
  /// is current.
  ///
  /// [MPVariant.filled] when left out. Naming one draws that surface flat
  /// unless it is [MPVariant.elevated]; leaving it out is what gives the bar
  /// its default [elevation] of 3.
  final MPVariant? variant;

  /// How far off the screen it is lifted, `0` to `5`.
  ///
  /// `3` while [variant] is left out, against the nothing every other surface
  /// defaults to, because this bar is *defined* by not being part of the
  /// screen. A level brings its own tone, so the default stops applying once a
  /// variant is chosen: it would leave that variant nothing to paint.
  final MPElevation? elevation;

  /// The height of the row and its type scale. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Adds the window's bottom inset to [offset], so the bar clears a phone's
  /// home indicator rather than sitting on it.
  ///
  /// Unlike on `MPBottomNavigation` this moves the whole sheet rather than the
  /// row inside it: there is nothing under a floating bar that has to stay
  /// covered.
  final bool safeArea;

  /// Every destination stops answering.
  final bool disabled;

  /// The name the bar is announced by: "Main", "Sections".
  final String? label;

  @override
  State<MPFloatingBottomNavigation> createState() => _MPFloatingBottomNavigationState();
}

class _MPFloatingBottomNavigationState extends State<MPFloatingBottomNavigation> {
  late MPBottomNavigationValue? _own = widget.initialValue;

  MPBottomNavigationValue? get _value => widget.value ?? _own;

  void _select(MPBottomNavigationValue next) {
    if (widget.value == null) {
      setState(() => _own = next);
    }

    widget.onChanged?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double height = _barHeight[size]!;
    final double inset = widget.safeArea ? MediaQuery.maybePaddingOf(context)?.bottom ?? 0 : 0;

    // A level takes the tone with it, so the lift the bar is known by is only
    // a default while nobody has chosen a surface.
    final MPContainerPaint paint = mpContainerPaint(
      theme.colors,
      widget.variant ?? MPVariant.filled,
      elevation: widget.elevation ?? (widget.variant == null ? _defaultElevation : null),
    );

    final Widget row = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: _rowGap[size]!,
      children: <Widget>[
        // Loose rather than expanded: each destination is as wide as its own
        // contents, until the lozenge is wider than the screen, and then the
        // names truncate before the sheet does.
        for (final Widget child in widget.children) Flexible(child: child),
      ],
    );

    final Widget lozenge = Semantics(
      container: true,
      explicitChildNodes: true,
      role: SemanticsRole.navigation,
      label: widget.label,
      child: DecoratedBox(
        decoration: paint.decoration(MPShapes.circular(theme.shapes.full, height: height)),
        child: SizedBox(
          height: height,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: _rowPad[size]!),
            child: MPBottomNavigationScope(
              value: _value,
              onSelect: _select,
              size: size,
              labels: widget.labels,
              disabled: widget.disabled,
              floating: true,
              child: row,
            ),
          ),
        ),
      ),
    );

    // The whole sheet moves up rather than only the row inside it, which is
    // the other half of what `offset` means here. Centred by the layout rather
    // than by a translation, so it stays centred under RTL without being told.
    return Padding(
      padding: EdgeInsets.only(bottom: widget.offset + inset),
      child: Center(heightFactor: 1, child: lozenge),
    );
  }
}
