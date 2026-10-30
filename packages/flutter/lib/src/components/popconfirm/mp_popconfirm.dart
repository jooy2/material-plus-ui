/// A confirmation that stays where the control is.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/popover/mp_popover.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/types.dart';

/// Between the question and its two buttons, React's `mt-3`.
const double _actionsGap = 12;

/// Between the two buttons, React's `gap-1`.
const double _buttonGap = 4;

/// A confirmation that stays where the control is.
///
/// ```dart
/// MPPopconfirm(
///   trigger: (BuildContext context, VoidCallback toggle) => MPButton(
///     color: MPColor.error,
///     onPressed: toggle,
///     child: const Text('Delete'),
///   ),
///   title: const Text('Delete this row?'),
///   confirmLabel: const Text('Delete'),
///   color: MPColor.error,
///   onConfirm: () => remove(id),
/// )
/// ```
///
/// ## When this rather than `MPConfirmProvider`
///
/// They ask the same question and the difference is **where the reader's eye
/// is**. A row of twelve delete buttons is the case for this one: a modal that
/// covered the table would take away the row the reader was pointing at, and
/// having to find it again afterwards is how the wrong row gets deleted. A
/// confirmation about the *page*, leaving with unsaved changes or an
/// irreversible account action, wants the modal.
///
/// ## Every other way out is *no*
///
/// Escape, a press outside, the system back and the cancel button all close it
/// without confirming, and [onCancel] is called for each of them. The safe
/// answer to "are you sure" is no. Opening is not an answer, so neither
/// callback hears it.
///
/// ## It is a popover, not a dialog
///
/// So it does not hold the focus and the page behind it stays live. That is
/// the point of the shape, and it also means a reader can walk away from the
/// question with Tab, which a modal would not allow. Use the modal where the
/// answer genuinely has to be given.
class MPPopconfirm extends StatefulWidget {
  /// Creates a popconfirm.
  const MPPopconfirm({
    required this.trigger,
    this.title,
    this.description,
    this.child,
    this.onConfirm,
    this.onCancel,
    this.confirmLabel,
    this.cancelLabel,
    this.color,
    this.side = MPSide.top,
    this.align = MPAlign.center,
    this.arrow = true,
    this.size,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    super.key,
  });

  /// Builds the control that asks, and that the question hangs off, handed
  /// the call that opens and closes it.
  final MPPopoverTriggerBuilder trigger;

  /// The question, as the popup's heading and its name.
  final Widget? title;

  /// A line under it: what happens, and to what.
  final Widget? description;

  /// Anything else the popup should hold, above the two buttons.
  final Widget? child;

  /// Called when the reader says yes.
  ///
  /// A callback rather than a future, and that is the whole difference from
  /// `MPConfirmProvider`: this one is written where the button is, so there is
  /// already a handler there to put it in.
  final VoidCallback? onConfirm;

  /// Called when they say no, by the cancel button or by any other way out.
  final VoidCallback? onCancel;

  /// What the yes button says. Defaults to the word for "confirm" in the
  /// locale in force.
  final Widget? confirmLabel;

  /// What the no button says. Defaults to the word for "cancel".
  final Widget? cancelLabel;

  /// The accent the yes button is drawn in. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise.
  ///
  /// [MPColor.error] is what a destructive question wants, and it is not the
  /// default: a red button on every confirmation stops being a warning.
  final MPColor? color;

  /// Which edge of the trigger the question appears on.
  final MPSide side;

  /// Where it sits along that edge.
  final MPAlign align;

  /// Draws the wedge pointing back at the trigger.
  final bool arrow;

  /// The room inside the popup and the type in it. The two buttons stay at
  /// [MPSize.sm] whatever this is.
  final MPSize? size;

  /// Whether the question is open. Left `null`, it keeps its own state,
  /// starting from [initialOpen].
  final bool? open;

  /// Whether it starts open, for one that keeps its own state.
  final bool initialOpen;

  /// Called with what the open state should become.
  final ValueChanged<bool>? onOpenChange;

  @override
  State<MPPopconfirm> createState() => _MPPopconfirmState();
}

class _MPPopconfirmState extends State<MPPopconfirm> {
  late bool _uncontrolled = widget.initialOpen;

  bool get _open => widget.open ?? _uncontrolled;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  void _setOpen(bool next) {
    if (widget.open == null) {
      setState(() => _uncontrolled = next);
    }

    widget.onOpenChange?.call(next);
  }

  /// Closes, then says which way it was answered.
  void _answer(bool given) {
    _setOpen(false);

    if (given) {
      widget.onConfirm?.call();
    } else {
      widget.onCancel?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final Map<String, String> labels = mpMessagesOf(context, mpConfirmMessages);

    return MPPopover(
      trigger: widget.trigger,
      title: widget.title,
      description: widget.description,
      side: widget.side,
      align: widget.align,
      arrow: widget.arrow,
      size: widget.size,
      open: _open,
      onOpenChange: (bool next) {
        // Escape, the press outside, the back, Tab leaving it, the trigger
        // pressed again. Only a close is an answer; an open is the question
        // being asked.
        if (!next) {
          _answer(false);

          return;
        }

        _setOpen(true);
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          ?widget.child,
          Padding(
            padding: const EdgeInsets.only(top: _actionsGap),
            // A `Wrap` rather than a `Row`: two labels translated into
            // something longer than "Confirm" and "Cancel" stack instead of
            // running off the sheet.
            child: Wrap(
              alignment: WrapAlignment.end,
              spacing: _buttonGap,
              runSpacing: _buttonGap,
              children: <Widget>[
                MPButton(
                  variant: MPVariant.text,
                  size: MPSize.sm,
                  onPressed: () => _answer(false),
                  child: widget.cancelLabel ?? Text(labels['cancel']!),
                ),
                MPButton(
                  variant: MPVariant.text,
                  size: MPSize.sm,
                  color: _color,
                  onPressed: () => _answer(true),
                  child: widget.confirmLabel ?? Text(labels['confirm']!),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
