/// Content at some window sizes and not others.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/types.dart';

/// Content at some window sizes and not others.
///
/// ```dart
/// MPShow(from: MPWindowClass.expanded, child: MPSidebar(child: nav))
/// MPShow(until: MPWindowClass.expanded, child: MPBottomNavigation(children: nav))
/// ```
///
/// The two halves of that pair are exclusive and exhaustive over the same
/// class, which is the shape worth writing: one of them is on screen at every
/// width, and never both.
///
/// The class is the **window's**, read through [MediaQuery] against MD3's
/// boundaries or the ones an `MPConfigProvider` moved, so two gates side by side
/// agree however wide each of them ended up.
///
/// ## It builds nothing while it is closed
///
/// Not an empty box with a size, and not a subtree hidden behind an
/// [Offstage]: the closed half is not built at all. That differs from the React
/// component, which sends both halves and hides one with `display: none`
/// because a media query is right on the first paint and JavaScript is not.
/// [MediaQuery] is right on the first frame here, so there is nothing to win by
/// building both, and the difference cuts both ways: an expensive subtree costs
/// nothing while it is closed, and any state inside one is lost when the window
/// crosses the boundary. Lift that state above the gate.
///
/// A closed gate is a zero-sized box, and an open one is [child] itself, so the
/// gate adds nothing to the semantics tree or the focus order.
class MPShow extends StatelessWidget {
  /// Creates a gate around [child].
  const MPShow({required this.child, this.from, this.until, this.only, super.key});

  /// The narrowest window [child] is shown in. `from: MPWindowClass.medium` is
  /// 600dp up: absent on a phone and present everywhere else.
  final MPWindowClass? from;

  /// The class [child] stops being shown at, exclusive. `until:
  /// MPWindowClass.expanded` is every window under 840dp, the mirror of `from:
  /// MPWindowClass.expanded`, and the two of them over the same class cover
  /// every width exactly once.
  final MPWindowClass? until;

  /// One class and no other, which is [from] and [until] said together:
  /// `only: MPWindowClass.medium` is 600dp to 839dp.
  ///
  /// [from] and [until] still override their own half, so `only: medium,
  /// until: large` is 600dp to 1199dp.
  final MPWindowClass? only;

  /// What is shown, in the windows it is shown in.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MPWindowClass current = mpWindowClassOf(context);
    final MPWindowClass? lower = from ?? only;
    final MPWindowClass? upper = until ?? _above(only);

    final bool open =
        (lower == null || current.index >= lower.index) &&
        (upper == null || current.index < upper.index);

    return open ? child : const SizedBox.shrink();
  }

  /// The class above [windowClass], or `null` at the top of the ladder or when
  /// there is nothing to go above.
  static MPWindowClass? _above(MPWindowClass? windowClass) {
    if (windowClass == null || windowClass == MPWindowClass.values.last) {
      return null;
    }

    return MPWindowClass.values[windowClass.index + 1];
  }
}
