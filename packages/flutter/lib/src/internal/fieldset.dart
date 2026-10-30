/// What a control reads off a disabled [MPFieldset] around it.
///
/// There is no attribute here that every widget below reads the way a browser
/// applies `<fieldset disabled>`, so the fieldset says it through a scope, and
/// each control counts it in with its own `disabled`: it draws itself drained
/// once, reports itself unavailable to a screen reader, and stops answering, as
/// it does when it is disabled itself. The React build hands the same answer
/// down through a context of its own.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

/// Whether the controls below are in a disabled fieldset.
class MPFieldsetScope extends InheritedWidget {
  /// Wraps what a fieldset holds.
  const MPFieldsetScope({required this.disabled, required super.child, super.key});

  /// Whether a fieldset around the controls below is disabled, the nearest one
  /// or any further out.
  final bool disabled;

  /// Whether a disabled fieldset is around [context].
  static bool disabledOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPFieldsetScope>()?.disabled ?? false;
  }

  @override
  bool updateShouldNotify(MPFieldsetScope oldWidget) => disabled != oldWidget.disabled;
}
