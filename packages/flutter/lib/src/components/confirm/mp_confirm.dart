/// "Are you sure?", as a future.
library;

import 'dart:async';

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/dialog/mp_dialog.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/types.dart';

/// What a confirmation asks, and how it is drawn.
///
/// Every field is optional. Left out, a field falls back to the provider's
/// [MPConfirmProvider.defaults], then to the component's own default.
@immutable
class MPConfirmOptions {
  /// Creates a question.
  const MPConfirmOptions({
    this.title,
    this.description,
    this.icon,
    this.child,
    this.confirmLabel,
    this.cancelLabel,
    this.color,
    this.size,
    this.dismissible,
    this.semanticLabel,
  });

  /// The question, as the heading that names the dialog.
  final Widget? title;

  /// The sentence under it: what happens, and to what.
  final Widget? description;

  /// A glyph above the title, the way `MPDialog` draws one.
  final Widget? icon;

  /// Anything else the dialog should hold: a field, a list of what is about
  /// to be deleted, a checkbox that says "do not ask again".
  final Widget? child;

  /// What the yes button says. Defaults to the word for "Confirm", or "OK" on
  /// an [MPConfirmResult.alert], in the locale in force.
  final Widget? confirmLabel;

  /// What the no button says. Defaults to the word for "Cancel".
  final Widget? cancelLabel;

  /// The accent the yes button, and the [icon], are drawn in.
  ///
  /// [MPColor.error] is what a destructive confirmation wants, and it is not
  /// the default: most confirmations are not destructive, and a red button on
  /// every one of them stops being a warning. [MPColor.primary] unless said.
  final MPColor? color;

  /// The type scale and width of the dialog. [MPSize.md] unless said.
  final MPSize? size;

  /// Whether <kbd>Escape</kbd>, the system back and a press outside answer
  /// **no**.
  ///
  /// On unless said, because a dialog a reader cannot leave is a trap and
  /// because the safe answer to "are you sure" is no. Switch it off for a
  /// question that genuinely has to be answered: the reader then has exactly
  /// two ways out, and both of them are your buttons.
  final bool? dismissible;

  /// The name a screen reader gives the dialog as it opens.
  ///
  /// Defaults to the text of [title] when that is a plain [Text].
  final String? semanticLabel;

  /// These options, with whatever they leave out taken from [defaults].
  ///
  /// [title], [description], [child] and [semanticLabel] are never taken from
  /// the defaults: a question is about one thing, and the provider does not
  /// know what.
  MPConfirmOptions _over(MPConfirmOptions? defaults) {
    return MPConfirmOptions(
      title: title,
      description: description,
      child: child,
      semanticLabel: semanticLabel,
      icon: icon ?? defaults?.icon,
      confirmLabel: confirmLabel ?? defaults?.confirmLabel,
      cancelLabel: cancelLabel ?? defaults?.cancelLabel,
      color: color ?? defaults?.color,
      size: size ?? defaults?.size,
      dismissible: dismissible ?? defaults?.dismissible,
    );
  }
}

/// What [MPConfirmProvider.of] hands back: the two ways to ask.
abstract interface class MPConfirmResult {
  /// Asks, and completes with the answer.
  ///
  /// `true` for the confirm button, `false` for cancel, and `false` for
  /// <kbd>Escape</kbd>, a press outside and anything else that closes the
  /// dialog. There is no third answer and the future never completes with an
  /// error, so a caller writes one `if`.
  Future<bool> confirm(MPConfirmOptions options);

  /// Tells, and completes once it has been acknowledged.
  ///
  /// One button, because there is nothing to refuse, and a `Future<void>`
  /// rather than a `Future<bool>` for the same reason: a boolean nobody can
  /// vary is a value a caller would have to learn to ignore.
  Future<void> alert(MPConfirmOptions options);
}

/// Holds the one dialog every confirmation under it is drawn in.
///
/// What a caller has at the moment a question is warranted is a callback, not
/// a place in the tree. So the dialog lives here, and the callback gets a
/// future:
///
/// ```dart
/// onPressed: () async {
///   final bool sure = await MPConfirmProvider.of(context).confirm(
///     const MPConfirmOptions(
///       title: Text('Delete this project?'),
///       description: Text('Everything in it goes too, and it cannot be undone.'),
///       confirmLabel: Text('Delete'),
///       color: MPColor.error,
///     ),
///   );
///
///   if (sure) {
///     await api.delete(id);
///   }
/// }
/// ```
///
/// [MPConfirmProvider.of] is the Flutter shape of the React build's
/// `useMPConfirm` hook: a lookup from any context under the provider.
///
/// ## Where it goes
///
/// Inside the application rather than around it, because above a `WidgetsApp`
/// there is no `Directionality` yet. `builder` is the place, and what `builder`
/// returns sits above the navigator and its [Overlay], so the dialog needs an
/// overlay of its own:
///
/// ```dart
/// WidgetsApp(
///   // …
///   builder: (BuildContext context, Widget? child) =>
///       Overlay.wrap(child: MPConfirmProvider(child: child!)),
/// )
/// ```
///
/// ## One at a time
///
/// A second question asked while one is open **replaces** it, and the first
/// future completes with `false`. Not a queue: a queue would ask about
/// something the reader has already moved on from, and the answer to a stale
/// question is not information. A provider that leaves the tree with a
/// question open answers it `false` too, so a callback waiting on it still
/// runs its `finally`.
///
/// The question is announced as an alert dialog, WAI-ARIA's name for a dialog
/// that breaks into what the reader was doing and waits for an answer. Cancel
/// holds the focus as it opens, so an <kbd>Enter</kbd> pressed by habit
/// answers no.
class MPConfirmProvider extends StatefulWidget {
  /// Creates a provider round [child].
  const MPConfirmProvider({required this.child, this.defaults, super.key});

  /// The application, or the part of it that asks.
  final Widget child;

  /// Defaults for every question asked under this: a [MPConfirmOptions.size]
  /// to match the application, an accent, a `cancelLabel` in your own words.
  ///
  /// Each question still says whatever it needs to and wins. Read when a
  /// question is asked, so a later change is the one used. The `title`,
  /// `description`, `child` and `semanticLabel` here are never used.
  final MPConfirmOptions? defaults;

  /// The questions the nearest provider above [context] asks.
  ///
  /// Throws when there is none, rather than handing back a future that never
  /// completes: a button that hangs is the hardest possible way to be told a
  /// provider is missing.
  ///
  /// Meant for a callback. It does not make [context] depend on the provider,
  /// which never changes what it hands back.
  static MPConfirmResult of(BuildContext context) {
    final MPConfirmResult? result = maybeOf(context);

    if (result == null) {
      throw FlutterError.fromParts(<DiagnosticsNode>[
        ErrorSummary('MPConfirmProvider.of() was called with no MPConfirmProvider above it.'),
        ErrorDescription(
          'The provider is what holds the dialog every confirm() is drawn in. Put one round '
          'the application, in WidgetsApp.builder under an Overlay of its own.',
        ),
        context.describeElement('The context used was'),
      ]);
    }

    return result;
  }

  /// The same, or `null` when there is no provider above [context].
  static MPConfirmResult? maybeOf(BuildContext context) {
    return context.getInheritedWidgetOfExactType<_MPConfirmScope>()?.result;
  }

  @override
  State<MPConfirmProvider> createState() => _MPConfirmProviderState();
}

class _MPConfirmScope extends InheritedWidget {
  const _MPConfirmScope({required this.result, required super.child});

  final MPConfirmResult result;

  @override
  bool updateShouldNotify(_MPConfirmScope oldWidget) => result != oldWidget.result;
}

/// One question, with what the provider's defaults added to it.
class _Question {
  const _Question({required this.options, required this.acknowledge});

  final MPConfirmOptions options;

  /// An acknowledgement draws one button and cannot be refused.
  final bool acknowledge;
}

class _MPConfirmProviderState extends State<MPConfirmProvider> implements MPConfirmResult {
  /// The question waiting for its answer, and `null` once it has one.
  _Question? _pending;

  /// The question the sheet draws: [_pending] while it is open, and the last
  /// one asked once it has been answered.
  ///
  /// Answering empties [_pending], and the sheet then takes a moment to fade
  /// and shrink away. Drawn from [_pending], everything on it would go in the
  /// frame the button was pressed, and the reader would watch a sheet collapse
  /// to the height of an empty one and then fade. The next question replaces
  /// this before the sheet is drawn again.
  _Question? _shown;

  /// Completes the future of the question on screen, exactly once: from a
  /// button, from Escape, from the question that replaces it, or from the
  /// provider leaving the tree.
  Completer<bool>? _settle;

  /// How many questions have reached the sheet, which is what the buttons are
  /// keyed by. A replacement question needs new buttons, or the old ones
  /// would be reused, `autofocus` would not run again, and the focus would
  /// stay wherever it was in the question that was replaced.
  int _turn = 0;

  @override
  void dispose() {
    // A future that never completes is a callback that never runs its
    // `finally`, so a route change would leave a button spinning for good.
    _settle?.complete(false);
    _settle = null;
    super.dispose();
  }

  Future<bool> _raise(MPConfirmOptions options, {required bool acknowledge}) {
    // A question already on screen is answered `false` before this one takes
    // its place. Its caller asked about something the reader has since moved
    // past, and no is the safe reading of that.
    _settle?.complete(false);

    final Completer<bool> settle = Completer<bool>();
    final _Question question = _Question(
      options: options._over(widget.defaults),
      acknowledge: acknowledge,
    );

    _settle = settle;
    setState(() {
      _pending = question;
      _shown = question;
      _turn += 1;
    });

    return settle.future;
  }

  void _answer(bool value) {
    final Completer<bool>? settle = _settle;

    _settle = null;
    settle?.complete(value);

    if (_pending != null) {
      // Only the answer and the open state change. `_shown` stays, so the
      // sheet fades out with the words it was asked with.
      setState(() => _pending = null);
    }
  }

  @override
  Future<bool> confirm(MPConfirmOptions options) => _raise(options, acknowledge: false);

  @override
  Future<void> alert(MPConfirmOptions options) => _raise(options, acknowledge: true);

  @override
  Widget build(BuildContext context) {
    final MPConfirmOptions? options = _shown?.options;
    final bool acknowledging = _shown?.acknowledge ?? false;
    final Map<String, String> labels = mpMessagesOf(context, mpConfirmMessages);
    final MPColor color = options?.color ?? MPColor.primary;

    return _MPConfirmScope(
      result: this,
      child: Stack(
        fit: StackFit.passthrough,
        children: <Widget>[
          widget.child,
          MPLayerRole(
            role: SemanticsRole.alertDialog,
            child: MPDialog(
              open: _pending != null,
              // Reached by Escape, the system back and a press outside, and
              // every one of them is no. An acknowledgement has no no, so it
              // completes the way its one button does. The buttons settle the
              // question themselves.
              onOpenChange: (bool next) {
                if (!next) {
                  _answer(acknowledging);
                }
              },
              icon: options?.icon,
              title: options?.title,
              description: options?.description,
              semanticLabel: options?.semanticLabel,
              size: options?.size ?? MPSize.md,
              color: color,
              dismissible: options?.dismissible ?? true,
              actions: <Widget>[
                if (!acknowledging)
                  MPButton(
                    key: ValueKey<String>('cancel-$_turn'),
                    variant: MPVariant.text,
                    // The first focus, as the first button a React dialog
                    // holds is: a confirmation exists to make somebody stop.
                    autofocus: true,
                    onPressed: () => _answer(false),
                    child: options?.cancelLabel ?? Text(labels['cancel']!),
                  ),
                MPButton(
                  key: ValueKey<String>('confirm-$_turn'),
                  variant: MPVariant.text,
                  color: color,
                  autofocus: acknowledging,
                  onPressed: () => _answer(true),
                  child:
                      options?.confirmLabel ??
                      Text(acknowledging ? labels['ok']! : labels['confirm']!),
                ),
              ],
              child: options?.child,
            ),
          ),
        ],
      ),
    );
  }
}
