/// What a [MPToggle] reads off the [MPToggleGroup] around it.
///
/// A scope rather than a rewritten child list, for `internal/button_group.dart`'s
/// reason: a toggle wrapped in something else or produced by a `map` is still
/// inside the group, and a scope reaches it wherever it ended up.
///
/// The **value** and the **focus stop** live here. The style axes and
/// `disabled` travel on `MPButtonGroupScope`, which the group publishes as
/// well, so a toggle picks up a `MPButtonGroup` and a `MPToggleGroup` by
/// exactly the same route.
///
/// The set takes one focus stop, as Base UI's toggle group does in the React
/// build: one member is in the focus order and the arrow keys move the stop
/// between members. [MPToggleGroupSlot] tells each member which entry of the
/// set it is, and the scope says which entry holds the stop.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// The set's value, and the one thing a member can do to it.
class MPToggleGroupScope extends InheritedWidget {
  /// Wraps the members of a set.
  const MPToggleGroupScope({
    required this.value,
    required this.onToggle,
    required super.child,
    this.stopIndex,
    this.stop,
    this.onActivate,
    super.key,
  });

  /// The values that are currently on.
  final List<String> value;

  /// Turns one of them on or off. The group decides what that does to the rest.
  final void Function(String value) onToggle;

  /// Which entry holds the set's one focus stop, or `null` for a set that
  /// leaves every member in the focus order.
  final int? stopIndex;

  /// The node the member holding the stop is given.
  final FocusNode? stop;

  /// Tells the set a member was pressed, so the stop moves to it.
  final ValueChanged<int>? onActivate;

  /// The set this toggle is in, or `null` when it is not in one.
  static MPToggleGroupScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPToggleGroupScope>();
  }

  @override
  bool updateShouldNotify(MPToggleGroupScope oldWidget) {
    return !listEquals(value, oldWidget.value) ||
        stopIndex != oldWidget.stopIndex ||
        !identical(stop, oldWidget.stop) ||
        onToggle != oldWidget.onToggle ||
        onActivate != oldWidget.onActivate;
  }
}

/// Which entry of the set a member is.
class MPToggleGroupSlot extends InheritedWidget {
  /// Marks [child] as entry [index].
  const MPToggleGroupSlot({required this.index, required super.child, super.key});

  /// The entry's place in the set, from the start.
  final int index;

  /// The entry [context] is in, or `null` outside a set.
  static int? indexOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPToggleGroupSlot>()?.index;
  }

  @override
  bool updateShouldNotify(MPToggleGroupSlot oldWidget) => index != oldWidget.index;
}
