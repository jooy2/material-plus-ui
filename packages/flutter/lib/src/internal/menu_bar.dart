/// What a menu on a menu bar is told by the bar.
///
/// None of this is exported from `material_plus_ui.dart`. It is how
/// `MPMenubar` and `MPMenu` talk to each other: a menu on a bar is the same
/// menu as one on its own, except that the arrow keys it cannot use belong to
/// the bar, and a menu the bar opened from the keyboard lights its first row.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// Wraps one menu on a bar.
class MPMenuBarScope extends InheritedWidget {
  /// Tells the menu under it which bar it is on.
  const MPMenuBarScope({
    required this.orientation,
    required this.lightOnOpen,
    required this.onCross,
    required super.child,
    super.key,
  });

  /// Which way the bar runs.
  ///
  /// On a row, the arrow that runs along it and that the open menu has no use
  /// for walks to the next word. On a column, the arrows along it walk the
  /// words while every menu is shut, so a shut menu does not open on them.
  final MPOrientation orientation;

  /// Whether the menu, once open, lights its first row: true when the bar
  /// opened it from the keyboard, as it does when an arrow walks from one open
  /// menu to the next.
  final bool lightOnOpen;

  /// Called by an open menu with `1` for an arrow towards the end of the bar
  /// and `-1` for one towards its start, in reading order.
  final ValueChanged<int> onCross;

  /// The scope round [context], read without depending on it: the menu reads
  /// it when a key arrives or when it opens, never to build.
  static MPMenuBarScope? maybeOf(BuildContext context) {
    return context.getInheritedWidgetOfExactType<MPMenuBarScope>();
  }

  @override
  bool updateShouldNotify(MPMenuBarScope oldWidget) {
    return orientation != oldWidget.orientation || lightOnOpen != oldWidget.lightOnOpen;
  }
}
