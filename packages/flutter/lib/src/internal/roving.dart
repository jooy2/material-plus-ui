import 'package:flutter/widgets.dart';

/// The one focus stop of a group whose arrow keys move the choice.
///
/// A radio group, a segmented button and a tab bar put exactly one item in the
/// tab order, and the arrows hand that stop on as they change the value. The
/// stop is one node that moves with the choice, so a caller's own [FocusNode]
/// stays the stop wherever it lands.
///
/// Moving a node takes it off the item it leaves, and a node taken off its item
/// gives focus back to whatever held it before the group. So a group whose stop
/// held focus asks for it again once the new item has been built; without that,
/// the first arrow key changes the value and throws the reader out of the group.
mixin MPRovingStop<W extends StatefulWidget> on State<W> {
  final FocusNode _ownStop = FocusNode(debugLabel: 'MPRovingStop');

  /// The caller's own node, when they passed one.
  FocusNode? get callerStop;

  /// The node the item holding the stop is given.
  FocusNode get stop => callerStop ?? _ownStop;

  /// Keeps focus in the group across a rebuild that may move the stop.
  ///
  /// Called from `didUpdateWidget` with the old widget's node, which is before
  /// the rebuild has moved anything, or with the current one before a
  /// `setState` that moves the stop.
  void keepStop(FocusNode? oldCallerStop) {
    final FocusNode previous = oldCallerStop ?? _ownStop;

    if (!previous.hasFocus) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted) {
        stop.requestFocus();
      }
    });
  }

  @override
  void dispose() {
    _ownStop.dispose();
    super.dispose();
  }
}
