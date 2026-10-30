/// A sheet over the whole app that stops it being used.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// How far the [MPOverlayTone.scrim] blurs what is behind it.
///
/// Not a frost. Enough to take the edge off text directly under the scrim
/// without turning the page into a smear, and the same 2px the React scrim
/// and a dialog's backdrop use, so a dialog opened over an overlay shows no
/// seam where the two meet.
const double _scrimBlur = 2;

/// How far the [MPOverlayTone.blur] blurs what is behind it: frosted, with
/// shape and colour left and words gone. Past about 16 a backdrop smears into
/// flat colour and reads opaque however low its alpha goes.
const double _frostBlur = 14;

/// How much scrim the [MPOverlayTone.blur] lays over its frost. Lighter than
/// the scrim's 32%, because the blur is doing most of the work.
const double _frostAlpha = 0.2;

/// How much of the page an [MPOverlay] takes away.
///
/// One axis, four steps: how legible is what is behind.
enum MPOverlayTone {
  /// MD3's own scrim, `scrim` at 32%, and exactly what a dialog puts behind
  /// itself. The page is still there and still readable; it has only stopped
  /// being reachable.
  scrim,

  /// Frosted. A lighter dim over a real blur, so the page is present as shape
  /// and colour but not as words. For "this is being replaced".
  blur,

  /// The page's own `surface`, opaque. For a screen that is genuinely gone.
  solid,

  /// Nothing drawn at all. Still catches the pointer, which is the whole
  /// reason to reach for it: an invisible sheet that catches a press.
  clear,
}

/// A sheet over the whole app that stops it being used.
///
/// ```dart
/// MPOverlay(
///   open: saving,
///   label: 'Saving',
///   child: const MPProgressCircular(size: MPSize.lg),
/// )
/// ```
///
/// What separates this from a dialog is what is *not* here: no surface, no
/// outline, no title, no actions. An overlay is the scrim on its own, with
/// whatever the caller puts on top of it, most often an `MPProgressCircular`
/// and a line saying what is being waited for.
///
/// [dismissible] is the one parameter worth reading twice, and it is off. A
/// dialog asks a question and <kbd>Escape</kbd> is the universal "no"; an
/// overlay is not asking anything, it is saying *wait*, and a save that can be
/// dismissed by a stray press is a save the reader will believe finished.
///
/// There is no `variant`: an overlay has taken the page, and [tone] is the
/// question it actually has to answer. There is no `color` either: an accent
/// says which of several things a control is, and there is only ever one
/// overlay.
///
/// The layer is lifted into the nearest [Overlay], which `WidgetsApp` with a
/// navigator provides. Where it is written does not matter, and it takes up no
/// room there. Focus is held inside it while it is up and goes back where it
/// came from when it closes.
class MPOverlay extends StatefulWidget {
  /// Creates an overlay.
  const MPOverlay({
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.tone = MPOverlayTone.scrim,
    this.dismissible = false,
    this.modal = true,
    this.align = MPAlign.center,
    this.size,
    this.label,
    this.locale,
    this.child,
    super.key,
  });

  /// Whether the overlay is up. Use with [onOpenChange] for a controlled
  /// overlay; `null` leaves it to [initialOpen] and to the overlay itself.
  final bool? open;

  /// Whether an uncontrolled overlay starts up. React's `defaultOpen`.
  final bool initialOpen;

  /// Called with `false` when the overlay asks to be closed.
  ///
  /// Only ever called while [dismissible] is on, because nothing else can ask.
  final ValueChanged<bool>? onOpenChange;

  /// How much of the page is taken away.
  final MPOverlayTone tone;

  /// Whether a press outside the content, <kbd>Escape</kbd> or the system back
  /// closes it.
  ///
  /// Off by default, which is the other way round from a dialog. Turn it on
  /// for the overlay whose job is to catch a press outside something. Off, and
  /// while [modal] is on, the system back is refused rather than let through to
  /// the page, so what it is waiting for is not left halfway.
  final bool dismissible;

  /// Whether the page behind is taken away for the pointer as well as the
  /// keyboard.
  ///
  /// `false` is React's `'trap-focus'`: the page stays clickable and
  /// scrollable while focus is still held inside, which is usually what a
  /// [MPOverlayTone.clear] overlay wants.
  final bool modal;

  /// Where the content sits down the screen.
  final MPAlign align;

  /// The room between the content and the edge of the screen. The one thing
  /// `size` decides here, because an overlay has no surface of its own to
  /// scale. [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// The overlay's name for a screen reader. Never drawn.
  ///
  /// It has a default rather than being left empty: an overlay that holds
  /// nothing readable, a bare spinner or a clear sheet, still has to say what
  /// it is. Defaults to the word for it in [locale].
  final String? label;

  /// Which language the default [label] is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// What sits on top: a spinner, a line of text, a small card.
  final Widget? child;

  @override
  State<MPOverlay> createState() => _MPOverlayState();
}

class _MPOverlayState extends State<MPOverlay> {
  /// The open state while nobody else owns it.
  late bool _uncontrolled = widget.initialOpen;

  bool get _open => widget.open ?? _uncontrolled;

  void _dismiss() {
    if (!_open) {
      return;
    }

    if (widget.open == null) {
      setState(() => _uncontrolled = false);
    }

    widget.onOpenChange?.call(false);
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final String label =
        widget.label ?? mpMessagesOf(context, mpOverlayMessages, locale: widget.locale)['label']!;

    final Widget? child = widget.child;

    return MPPortal(
      open: _open,
      modal: widget.modal,
      label: label,
      // A modal region, as React's popup is a `role="dialog"`: what tells a
      // screen reader the page has been taken away, and by what.
      role: SemanticsRole.dialog,
      barrierColor: switch (widget.tone) {
        MPOverlayTone.scrim => mpScrimColor(colors),
        MPOverlayTone.blur => colors.scrim.withValues(alpha: _frostAlpha),
        MPOverlayTone.solid => colors.surface,
        MPOverlayTone.clear => null,
      },
      barrierBlur: switch (widget.tone) {
        MPOverlayTone.scrim => _scrimBlur,
        MPOverlayTone.blur => _frostBlur,
        MPOverlayTone.solid || MPOverlayTone.clear => 0,
      },
      onDismiss: widget.dismissible ? _dismiss : null,
      child: Padding(
        padding: EdgeInsets.all(mpSheetPad[size]!),
        child: Align(
          alignment: switch (widget.align) {
            MPAlign.start => Alignment.topCenter,
            MPAlign.center => Alignment.center,
            MPAlign.end => Alignment.bottomCenter,
          },
          child: child == null
              ? const SizedBox.shrink()
              // A press on the content is not a press outside it, which is the
              // whole of what an outside press means, including one that lands
              // between two lines of it. A listener rather than a gesture, so
              // the content is given no tap on the semantics tree that does
              // nothing.
              : Listener(
                  behavior: HitTestBehavior.opaque,
                  child: DefaultTextStyle.merge(
                    style: TextStyle(color: colors.onSurface),
                    child: child,
                  ),
                ),
        ),
      ),
    );
  }
}
