/// How a field takes part in the `MPForm` around it.
///
/// On the web a field is part of a `<form>` without anybody wiring it: its
/// `name` puts its value in the submission, `required` is checked by the
/// browser, and Base UI's `Form` routes a server's errors back to the field by
/// that same name. Flutter has none of that, so the wiring is here, and every
/// field in the library uses it the same way, the pickers included: a field
/// holds an [MPFormFieldBinding], calls [MPFormFieldBinding.bind] in its build,
/// and tells the binding when its value changes and when it loses the focus.
///
/// ```dart
/// late final MPFormFieldBinding _form = MPFormFieldBinding(
///   read: () => widget.value,                   // what onSubmit receives
///   validate: () => widget.required && widget.value.isEmpty
///       ? mpMessagesOf(context, mpCommonMessages)['required']
///       : null,                                 // the field's own checks
///   focus: _focusNode.requestFocus,             // where a failed submit lands
///   onUpdate: () => setState(() {}),            // the form has news for it
/// );
///
/// // build():
/// _form.bind(context, name: widget.name, disabled: disabled);
/// final String? message = ownErrorMessage ?? _form.error;
///
/// // on every change the reader makes:   _form.changed();
/// // when the field loses the focus:     _form.blurred();
/// // dispose():                          _form.dispose();
/// ```
///
/// Outside an `MPForm` every call is a no-op and [MPFormFieldBinding.error] is
/// always `null`, so a field does not need to know whether it is in one.
///
/// None of it is exported from `material_plus_ui.dart`, apart from
/// [MPFormValidationMode], which `mp_form.dart` re-exports.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// When a field decides whether it is valid.
///
/// Base UI's own three, under Base UI's own spelling: this is one of the few
/// places the library does not invent a word of its own, because
/// `validationMode` is what a reader will meet everywhere else.
enum MPFormValidationMode {
  /// On submit, and on every change afterwards. The default, and the only one
  /// that does not tell somebody their email address is wrong while they are
  /// still typing it.
  onSubmit,

  /// When a field loses the focus, and on every change after that.
  onBlur,

  /// On every change.
  onChange,
}

/// What an `MPForm` keeps about the fields inside it.
///
/// Owned by the form's state and handed down through [MPFormScope]; a field
/// reaches it only through its [MPFormFieldBinding].
class MPFormRegistry {
  /// Creates a registry for the form whose element is [root].
  MPFormRegistry({required this.root});

  /// The form's own context, which the fields are ordered in: a failed submit
  /// focuses the first invalid field in the order the tree has them, not the
  /// order they happened to join in.
  final BuildContext root;

  /// When fields validate. Written by the form on every build.
  MPFormValidationMode mode = MPFormValidationMode.onSubmit;

  /// Errors from outside, by field name. Written by the form on every build.
  Map<String, String> errors = const <String, String>{};

  /// Called with the values on a submit that found every field valid.
  ValueChanged<Map<String, Object?>>? onValid;

  final Set<MPFormFieldBinding> _bindings = <MPFormFieldBinding>{};

  /// The names whose outside error a change has cleared, until the form is
  /// handed a different set of errors.
  final Set<String> _cleared = <String>{};

  /// Forgets which outside errors were cleared, for a new set of them.
  void resetErrors() => _cleared.clear();

  /// The message for [binding], or `null` while it has nothing to say.
  ///
  /// An error from outside comes first, until the field changes. After that,
  /// the field's own checks, once the mode says they may be shown.
  String? errorFor(MPFormFieldBinding binding) {
    if (binding._disabled) {
      return null;
    }

    final String? name = binding._name;

    if (name != null && !_cleared.contains(name)) {
      final String? outside = errors[name];

      if (outside != null && outside.isNotEmpty) {
        return outside;
      }
    }

    return binding._shown ? binding.validate() : null;
  }

  void _changed(MPFormFieldBinding binding) {
    final String? name = binding._name;
    bool news = false;

    if (name != null && errors.containsKey(name) && _cleared.add(name)) {
      news = true;
    }

    if (mode == MPFormValidationMode.onChange && !binding._shown) {
      binding._shown = true;
      news = true;
    }

    // A field whose checks are showing is checked again on every change, so a
    // message goes away as soon as the field is put right.
    if (news || binding._shown) {
      for (final MPFormFieldBinding other in _bindings) {
        if (identical(other, binding) || (name != null && other._name == name)) {
          other.onUpdate();
        }
      }
    }
  }

  void _blurred(MPFormFieldBinding binding) {
    if (mode == MPFormValidationMode.onBlur && !binding._shown) {
      binding._shown = true;
      binding.onUpdate();
    }
  }

  /// The fields in the order the tree has them.
  List<MPFormFieldBinding> _ordered() {
    final Map<Element, MPFormFieldBinding> byElement = <Element, MPFormFieldBinding>{
      for (final MPFormFieldBinding binding in _bindings)
        if (binding._context is Element) binding._context! as Element: binding,
    };
    final List<MPFormFieldBinding> ordered = <MPFormFieldBinding>[];

    void visit(Element element) {
      final MPFormFieldBinding? binding = byElement.remove(element);

      if (binding != null) {
        ordered.add(binding);
      }

      element.visitChildren(visit);
    }

    if (root is Element && (root as Element).mounted) {
      (root as Element).visitChildren(visit);
    }

    return ordered..addAll(byElement.values);
  }

  /// Checks every field, shows every field's message, and either focuses the
  /// first one that failed or hands the values to [onValid]. Returns whether
  /// the form was valid.
  ///
  /// An error from outside does not hold a submit back: it is shown until the
  /// field changes, and it is the outside's to replace with the next answer.
  bool submit() {
    final List<MPFormFieldBinding> ordered = _ordered();
    MPFormFieldBinding? failed;

    for (final MPFormFieldBinding binding in ordered) {
      binding._shown = true;

      if (failed == null && !binding._disabled && binding.validate() != null) {
        failed = binding;
      }
    }

    for (final MPFormFieldBinding binding in ordered) {
      binding.onUpdate();
    }

    if (failed != null) {
      failed.focus();

      return false;
    }

    onValid?.call(<String, Object?>{
      for (final MPFormFieldBinding binding in ordered)
        if (binding._name != null && !binding._disabled) binding._name!: binding.read(),
    });

    return true;
  }
}

/// Hands an `MPForm`'s registry to the fields below it.
class MPFormScope extends InheritedWidget {
  /// Wraps a form's children.
  const MPFormScope({
    required this.registry,
    required this.errors,
    required this.mode,
    required super.child,
    super.key,
  });

  /// The form's registry.
  final MPFormRegistry registry;

  /// The errors from outside, kept here so the fields build again when they
  /// change.
  final Map<String, String> errors;

  /// The validation mode, for the same reason.
  final MPFormValidationMode mode;

  /// The registry of the form above [context], or `null` outside one.
  static MPFormRegistry? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPFormScope>()?.registry;
  }

  @override
  bool updateShouldNotify(MPFormScope oldWidget) {
    return !identical(registry, oldWidget.registry) ||
        mode != oldWidget.mode ||
        !mapEquals(errors, oldWidget.errors);
  }
}

/// One field's part in the form around it.
class MPFormFieldBinding {
  /// Creates a binding for a field.
  MPFormFieldBinding({
    required this.read,
    required this.validate,
    required this.focus,
    required this.onUpdate,
  });

  /// The field's value, as the form's `onSubmit` receives it.
  final ValueGetter<Object?> read;

  /// The field's own checks: a message for what is wrong, or `null`. Asked
  /// only while the field is not disabled.
  final ValueGetter<String?> validate;

  /// Puts the focus on the field, for a submit that failed on it.
  final VoidCallback focus;

  /// Called when the form has something new to say to the field: build again.
  final VoidCallback onUpdate;

  MPFormRegistry? _form;
  BuildContext? _context;
  String? _name;
  bool _disabled = false;

  /// Whether the field's own checks are being shown, which the mode decides.
  bool _shown = false;

  /// Joins the form above [context], or moves to a new one, under [name].
  ///
  /// Called from the field's build, which is what makes the field build again
  /// when the form's errors or mode change. A disabled field stays registered,
  /// as a `<fieldset disabled>` leaves its fields in the form, but is neither
  /// checked nor submitted.
  void bind(BuildContext context, {required String? name, bool disabled = false}) {
    final MPFormRegistry? form = MPFormScope.maybeOf(context);

    _context = context;
    _name = name;
    _disabled = disabled;

    if (identical(form, _form)) {
      return;
    }

    _form?._bindings.remove(this);
    _form = form;
    _form?._bindings.add(this);
  }

  /// The message the form has for the field, or `null`.
  String? get error => _form?.errorFor(this);

  /// Whether the field is in a form at all.
  bool get inForm => _form != null;

  /// The field's value changed at the reader's hand.
  void changed() => _form?._changed(this);

  /// The field lost the focus.
  void blurred() => _form?._blurred(this);

  /// Submits the form the field is in, as Enter in a single-line `<input>`
  /// does. Returns whether it was valid, or `false` outside a form.
  bool submitForm() => _form?.submit() ?? false;

  /// Leaves the form.
  void dispose() {
    _form?._bindings.remove(this);
    _form = null;
    _context = null;
  }
}
