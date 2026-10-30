/// A form that knows which of its fields is wrong.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/field_form.dart' show MPFormValidationMode;

/// A form that knows which of its fields is wrong.
///
/// ```dart
/// final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
///
/// MPForm(
///   key: form,
///   errors: serverErrors,
///   onSubmit: (Map<String, Object?> values) => save(values['email']),
///   children: <Widget>[
///     MPTextField(
///       name: 'email',
///       label: const Text('Email'),
///       required: true,
///       value: email,
///       onChanged: ...,
///     ),
///     MPButton(onPressed: () => form.currentState!.submit(), child: const Text('Sign in')),
///   ],
/// )
/// ```
///
/// On its own, a screen of `MPTextField`s validates one field at a time, and a
/// failed submit leaves the reader to go and find the red one. What this adds
/// is the part that has to be owned **above** the fields: a submit collects
/// every field's validity at once, the focus lands on the first one that
/// failed, and [errors] puts a server's answer back on the field it belongs to
/// rather than in a banner at the top of the screen.
///
/// Every field of this package takes part by its `name`: `MPTextField`,
/// `MPNumberField`, `MPOtpField`, and the select and picker fields. A submit
/// comes from [MPFormState.submit], from Enter in a single-line text field that
/// has no `onSubmit` of its own, as Enter in an `<input>` submits its `<form>`,
/// and from a complete `MPOtpField` with `autoSubmit`.
///
/// ## It is not a form library
///
/// There is no schema here, no resolver and no field array. A project that
/// wants those keeps the one it already has and hands the result to [errors],
/// which is the seam this is built around: every one of those libraries can
/// produce `{name: message}`.
///
/// ## Why it lays its children out at all
///
/// Because a form is a **stack**, and a stack with no gap is a stack of fields
/// touching. The gap is the only visual decision here: no surface, no padding.
/// Those belong to an `MPCard` or an `MPContainer` round it.
class MPForm extends StatefulWidget {
  /// Creates a form of [children].
  const MPForm({
    required this.children,
    this.validationMode = MPFormValidationMode.onSubmit,
    this.errors = const <String, String>{},
    this.onSubmit,
    this.size,
    super.key,
  });

  /// The fields, and whatever submits them.
  final List<Widget> children;

  /// When a field validates. See [MPFormValidationMode].
  final MPFormValidationMode validationMode;

  /// Errors from outside the fields' own checks (a server, a schema) keyed by
  /// the `name` of the field each belongs to.
  ///
  /// Shown **on the field**, and cleared as soon as that field changes. A new
  /// map with different messages shows them again.
  final Map<String, String> errors;

  /// Called on a valid submit, with each named field's value under its name: a
  /// `String` from a text field or a code, a `double?` from a number field.
  final ValueChanged<Map<String, Object?>>? onSubmit;

  /// The gap between the form's children: which rung of the ladder it stacks
  /// on. [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// The form round [context], or `null` when there is none: what a button
  /// inside the form calls [MPFormState.submit] on.
  static MPFormState? maybeOf(BuildContext context) {
    return context.findAncestorStateOfType<MPFormState>();
  }

  /// The form round [context].
  static MPFormState of(BuildContext context) {
    final MPFormState? form = maybeOf(context);

    assert(form != null, 'MPForm.of() called with a context that has no MPForm above it.');

    return form!;
  }

  @override
  State<MPForm> createState() => MPFormState();
}

/// The state of an [MPForm], which is what submits it.
class MPFormState extends State<MPForm> {
  late final MPFormRegistry _registry = MPFormRegistry(root: context);

  /// Checks every field and shows every field's message. If all of them pass,
  /// calls [MPForm.onSubmit] with the values and returns `true`; otherwise puts
  /// the focus on the first field that failed and returns `false`.
  ///
  /// An error from [MPForm.errors] does not hold a submit back. It is the
  /// outside's answer to the last submit, and the next one is how the outside
  /// is asked again.
  bool submit() => _registry.submit();

  @override
  void didUpdateWidget(MPForm oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (!mapEquals(oldWidget.errors, widget.errors)) {
      _registry.resetErrors();
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

    _registry
      ..mode = widget.validationMode
      ..errors = widget.errors
      ..onValid = widget.onSubmit;

    return MPFormScope(
      registry: _registry,
      errors: widget.errors,
      mode: widget.validationMode,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: mpSheetGap[size]!,
        children: widget.children,
      ),
    );
  }
}
