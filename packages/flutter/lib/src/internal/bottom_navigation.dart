/// What the two navigation bars share, which is everything except the sheet.
///
/// `MPBottomNavigation` is the bar held against the bottom edge of the screen;
/// `MPFloatingBottomNavigation` is the same row of destinations lifted clear of
/// it. They differ in shape, in where they sit and in how wide they are, and
/// in nothing a destination can see. So the scope an `MPBottomNavigationItem`
/// reads lives here rather than inside either of them, and an item works in
/// both without knowing which one it is in.
///
/// A file of its own rather than one bar importing the other's private parts,
/// for the reason React's `internal/bottom-navigation.ts` gives: an item belongs
/// to whichever bar it was put in. The two public names are exported from
/// `mp_bottom_navigation.dart`; the scope is the library talking to itself.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// A destination's value. What `onChanged` reports.
///
/// Any value that compares with `==`, as React's `string | number` does: a
/// string, a number, an enum, a route.
typedef MPBottomNavigationValue = Object;

/// Which names are drawn.
///
/// MD3's three label behaviours, in the order they lose information. Undrawn is
/// never unsaid: in the last two the names stay on the semantics tree, because
/// a glyph on its own has no accessible name at all.
enum MPBottomNavigationLabels {
  /// Every destination is named. The only one that works for a reader who has
  /// not used the application before.
  all,

  /// Only the destination the reader is on.
  selected,

  /// Glyphs only.
  none,
}

/// What an `MPBottomNavigationItem` inherits from whichever bar it is in.
class MPBottomNavigationScope extends InheritedWidget {
  /// Hands [child] what its bar decided.
  const MPBottomNavigationScope({
    required this.value,
    required this.onSelect,
    required this.size,
    required this.labels,
    required this.disabled,
    required this.floating,
    required super.child,
    super.key,
  });

  /// The destination the reader is on, or `null` for none of them.
  final MPBottomNavigationValue? value;

  /// Moves the bar to the destination worth the value it is called with.
  final ValueChanged<MPBottomNavigationValue> onSelect;

  /// The bar's rung, which sizes every destination in it.
  final MPSize size;

  /// Which names are drawn.
  final MPBottomNavigationLabels labels;

  /// Whether every destination has stopped answering.
  final bool disabled;

  /// Whether the bar is the floating one.
  ///
  /// The one thing a destination does need to know, and it is about width
  /// rather than looks: a full-width bar divides its width between its
  /// destinations, and a floating one is only as wide as what is in it.
  final bool floating;

  /// The scope round [context], or `null` for an item put outside a bar.
  static MPBottomNavigationScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPBottomNavigationScope>();
  }

  @override
  bool updateShouldNotify(MPBottomNavigationScope oldWidget) {
    return value != oldWidget.value ||
        onSelect != oldWidget.onSelect ||
        size != oldWidget.size ||
        labels != oldWidget.labels ||
        disabled != oldWidget.disabled ||
        floating != oldWidget.floating;
  }
}
