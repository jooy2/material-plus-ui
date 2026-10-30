/// What an arrow key a control answers tells the focus system.
///
/// A set of options, a value on a rail and a walk through a chart all take the
/// arrow keys for themselves. On a keyboard that costs nothing, because Tab is
/// how a reader leaves. Under [NavigationMode.directional], a remote's D-pad,
/// the arrows are the only way to leave, so an arrow a control cannot use has
/// to go on to the focus system, or the control holds the reader where they
/// stand.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

/// Whether the arrow keys are how a reader moves the focus from one control to
/// the next, which they are under [NavigationMode.directional].
///
/// Read as `MPInteractive` reads the mode: no [MediaQuery], or one that does
/// not say, is [NavigationMode.traditional].
bool mpArrowsMoveFocus(BuildContext context) {
  return MediaQuery.maybeNavigationModeOf(context) == NavigationMode.directional;
}

/// Whether [key] is one of the four arrow keys.
bool mpIsArrow(LogicalKeyboardKey key) {
  return key == LogicalKeyboardKey.arrowUp ||
      key == LogicalKeyboardKey.arrowDown ||
      key == LogicalKeyboardKey.arrowLeft ||
      key == LogicalKeyboardKey.arrowRight;
}

/// The axis [key] moves along, or `null` for a key that is not an arrow.
Axis? mpArrowAxis(LogicalKeyboardKey key) {
  if (key == LogicalKeyboardKey.arrowLeft || key == LogicalKeyboardKey.arrowRight) {
    return Axis.horizontal;
  }

  if (key == LogicalKeyboardKey.arrowUp || key == LogicalKeyboardKey.arrowDown) {
    return Axis.vertical;
  }

  return null;
}

/// Whether a control that runs along [axis], a row or a column of options or
/// a rail, leaves an arrow along [arrow] to the focus system without changing
/// anything.
///
/// Under [NavigationMode.directional] it does for the arrows across it: the
/// arrows along it move its value, and the others are how a reader on a
/// remote moves on to the control above or below it, or beside it, before
/// the value has been driven to an end. Under [NavigationMode.traditional] a
/// control answers all four, as it always has.
bool mpArrowAcross(BuildContext context, {required Axis axis, required Axis? arrow}) {
  return arrow != null && arrow != axis && mpArrowsMoveFocus(context);
}

/// What a control reports for an arrow key, given whether the key [moved]
/// anything: the choice, a value, or the place being read.
///
/// An arrow that moved something is handled. One that moved nothing, at the
/// end of a set or a range or on a control that cannot be changed, is handled
/// too under [NavigationMode.traditional], where the key belongs to the control
/// and Tab leaves it, and is left to the focus system under
/// [NavigationMode.directional], which takes it on to the next control.
KeyEventResult mpArrowResult(BuildContext context, {required bool moved}) {
  return moved || !mpArrowsMoveFocus(context) ? KeyEventResult.handled : KeyEventResult.ignored;
}

/// An action bound to arrow keys, whose [onInvoke] returns whether the key
/// moved anything, reported to the key's [Shortcuts] as [mpArrowResult]
/// says.
///
/// [context] is the control's own, which is where the navigation mode is read
/// when a key arrives.
class MPArrowAction<T extends Intent> extends CallbackAction<T> {
  /// Creates the action.
  MPArrowAction(this.context, {required bool Function(T intent) onArrow})
    : super(onInvoke: onArrow);

  /// The control's own context.
  final BuildContext context;

  @override
  KeyEventResult toKeyEventResult(T intent, covariant bool? invokeResult) {
    return mpArrowResult(context, moved: invokeResult ?? true);
  }
}
