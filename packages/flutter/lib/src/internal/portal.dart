/// The layer everything that takes the page away is built on.
library;

import 'dart:ui' as ui;

import 'package:flutter/scheduler.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/back.dart';
import 'package:material_plus_ui/src/internal/ease.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

/// A layer lifted out of the tree and laid over the whole app.
///
/// What a `MPOverlay` and a `MPModal` have in common, which is nearly all of
/// it: the lift into the nearest [Overlay], the backdrop, the fade, the pointer
/// held outside, the focus held inside, <kbd>Escape</kbd> and the system back,
/// and focus going back where it came from on the way out.
///
/// The system back — Android's back button and gesture, TalkBack's back,
/// VoiceOver's escape scrub — does what <kbd>Escape</kbd> does, and only the
/// layer on top answers it. While a [modal] layer is up the back never pops the
/// page under it; a layer that cannot be dismissed takes it and does nothing.
/// A layer that is not [modal] takes it only to close, so one that cannot be
/// dismissed lets it go on to the page, which is still in use. It needs a
/// [ModalRoute] above it for that, which a navigator gives every page.
///
/// It needs an [Overlay] above it — `WidgetsApp` with a navigator and
/// `MaterialApp` both provide one, and an app that has neither can add one
/// itself. Lifting is the whole point: a sheet drawn where it was written would
/// be clipped by the first ancestor with `overflow: hidden`, and in Flutter that
/// is every `ClipRRect` on the way up, which on a Material Plus page is every card.
///
/// The fade is opacity and nothing else. A sheet that scales or slides drags
/// whatever is written on it across the screen, which is the one thing the house
/// style is against — and unlike a control, a sheet is usually carrying a
/// sentence. It eases on [MPTokens.motionEase], which is the curve the
/// React build's fade reads from `--Material Plus-ease`.
///
/// It runs at [MPTokens.motionDurationSlow] rather than the control
/// duration, and that is the line between this and [MPAnchoredPortal]: 150ms
/// is a key going down, and on a sheet the size of the window it is not a fade
/// but a cut with a hint of blur on it. A page that changes this completely
/// that fast leaves a reader looking for what moved. A popup that hangs off a
/// control stays at the control duration, because it is the size of one.
class MPPortal extends StatefulWidget {
  /// Creates a layer.
  const MPPortal({
    required this.open,
    required this.child,
    this.barrierColor,
    this.barrierBlur = 0,
    this.modal = true,
    this.onDismiss,
    this.label,
    this.role,
    super.key,
  });

  /// Whether the layer is up.
  final bool open;

  /// What is laid over the backdrop, already aligned and padded.
  final Widget child;

  /// What the backdrop is washed with. `null` paints nothing, and the layer
  /// still catches the pointer — which is the whole reason to ask for it.
  final Color? barrierColor;

  /// How far the backdrop blurs what is behind it, as a CSS `blur()` radius.
  ///
  /// `0` leaves the filter out entirely rather than asking for a blur of zero:
  /// a `BackdropFilter` over the whole viewport is a saved layer per frame.
  final double barrierBlur;

  /// Whether the page behind is taken away for the pointer as well as the
  /// keyboard, and from the system back.
  ///
  /// `false` leaves the page clickable and scrollable while focus is still held
  /// inside the layer, which is what a layer drawing nothing usually wants.
  final bool modal;

  /// Called when the layer asks to be closed — a press outside it,
  /// <kbd>Escape</kbd>, or the system back. `null` is a layer that cannot be
  /// dismissed.
  final VoidCallback? onDismiss;

  /// The name a screen reader gives the layer.
  final String? label;

  /// What the layer is to a screen reader beyond a route of its own, such as
  /// [SemanticsRole.alertDialog]. `null` claims nothing more.
  final SemanticsRole? role;

  @override
  State<MPPortal> createState() => _MPPortalState();
}

/// The role the layer of a component under it is announced with, for a
/// component that lifts its layer through another one.
///
/// [MPConfirmProvider] asks in a `MPModal`, and its question is an alert
/// dialog, which a `MPModal` of its own is not. The modal reads the role from
/// here rather than taking it as a prop, so the question's role is not a thing
/// every modal has to offer.
class MPLayerRole extends InheritedWidget {
  /// Hands [role] to the layer of the component under it.
  const MPLayerRole({required this.role, required super.child, super.key});

  /// What that layer is to a screen reader.
  final SemanticsRole role;

  /// The role in scope, or `null` for none.
  static SemanticsRole? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<MPLayerRole>()?.role;

  @override
  bool updateShouldNotify(MPLayerRole oldWidget) => role != oldWidget.role;
}

class _MPPortalState extends State<MPPortal> with SingleTickerProviderStateMixin {
  final OverlayPortalController _portal = OverlayPortalController();
  final FocusScopeNode _scope = FocusScopeNode(debugLabel: 'MPPortal');

  /// The group the layer's sheets read the backdrop in, which is theirs alone.
  ///
  /// An `OverlayPortal` child sits under the widget that opened it, so a
  /// `BackdropGroup` above that widget would reach the layer too. The layer is
  /// painted last and over everything, and a key it shared with a sheet on the
  /// page would hand it the backdrop as it was when that sheet was drawn.
  final BackdropKey _layer = BackdropKey();

  // No duration here. `_syncMotion` gives it the theme's before the first
  // frame, and again whenever the theme or the reader's motion preference
  // changes, as a fold's is given.
  late final AnimationController _fade = AnimationController(vsync: this);

  /// The fade as it is drawn, on the theme's curve. A stand-in curve here for
  /// the reason the duration has none.
  late final CurvedAnimation _opacity = CurvedAnimation(parent: _fade, curve: Curves.linear);

  /// Where focus was before the layer went up, so it can be put back.
  FocusNode? _restore;

  @override
  void initState() {
    super.initState();
    _fade.addStatusListener(_onFade);

    if (widget.open) {
      _show();
    }
  }

  @override
  void didUpdateWidget(MPPortal oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.open != oldWidget.open) {
      // Read here as well as below: an update runs before the dependencies
      // are refreshed, and a theme that changed in the same frame as `open`
      // would otherwise fade out on the old duration.
      _syncMotion();
      widget.open ? _show() : _hide();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
  }

  /// Hands the fade the theme's slow duration and curve, or no duration at all
  /// for a reader who asked for less movement.
  void _syncMotion() {
    _fade.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.medium2;
    easeBothWays(_opacity, MPMotion.standard);
  }

  @override
  void dispose() {
    _fade.removeStatusListener(_onFade);
    _opacity.dispose();
    _fade.dispose();
    _scope.dispose();
    super.dispose();
  }

  void _onFade(AnimationStatus status) {
    // Taken down only once it has finished going out, so the fade is seen
    // rather than skipped by the widget disappearing on the first frame.
    if (status != AnimationStatus.dismissed || !_portal.isShowing) {
      return;
    }

    // A fade with no duration has finished the moment it is reversed, and
    // under reduced motion that moment is inside the build that closed the
    // layer, where a portal cannot be taken down. So it goes once that frame
    // is over.
    if (SchedulerBinding.instance.schedulerPhase == SchedulerPhase.persistentCallbacks) {
      _afterFrame(_takeDown);
    } else {
      _takeDown();
    }
  }

  /// Takes the layer down, unless it has been opened again or has left the
  /// tree since it finished going out.
  void _takeDown() {
    if (mounted && !widget.open && _fade.isDismissed && _portal.isShowing) {
      _portal.hide();
    }
  }

  /// Runs [callback] once the frame that asked for it is over.
  ///
  /// Everything a layer does to itself is out of bounds during a build, and a
  /// build is nearly always where the change arrives from: a `setState` above
  /// it. So the work is queued rather than refused.
  void _afterFrame(VoidCallback callback) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => callback());
  }

  void _show() {
    _restore = FocusManager.instance.primaryFocus;

    _afterFrame(() {
      if (!mounted || !widget.open) {
        return;
      }

      _portal.show();
      _fade.forward();

      // One more frame: the layer has to be in the tree before its scope can be
      // asked for focus. It is asked rather than autofocused because Flutter
      // applies an autofocus only when nothing in the enclosing scope holds
      // focus, and something almost always does — whatever opened the layer.
      _afterFrame(() {
        if (mounted && widget.open) {
          _scope.requestFocus();
        }
      });
    });
  }

  void _hide() {
    _fade.reverse();

    // Back where it came from, which is the half of a focus trap that is easy
    // to forget: a dialog that leaves focus on the body drops the reader at the
    // top of the page.
    final restore = _restore;
    _restore = null;

    if (restore != null && restore.context != null) {
      restore.requestFocus();
    }
  }

  void _dismiss() {
    widget.onDismiss?.call();
  }

  @override
  Widget build(BuildContext context) {
    return MPBackGuard(
      // A modal layer takes the back whether or not it can be dismissed: the
      // page under it has been taken away, and the back is not the one way
      // left to reach it. A layer that leaves the page in use takes it only to
      // close, and one that cannot be closed lets it go on to the page.
      active: widget.open && (widget.modal || widget.onDismiss != null),
      onBack: widget.onDismiss == null ? null : _dismiss,
      child: OverlayPortal(
        controller: _portal,
        overlayChildBuilder: _buildLayer,
        child: const SizedBox.shrink(),
      ),
    );
  }

  Widget _buildLayer(BuildContext context) {
    Widget backdrop = widget.barrierColor == null
        ? const SizedBox.expand()
        : ColoredBox(color: widget.barrierColor!, child: const SizedBox.expand());

    if (widget.barrierBlur > 0) {
      // Not `.grouped`, and deliberately. A barrier covers the whole viewport,
      // so it overlaps every sheet on the page under it and the sheet laid over
      // it; sharing a backdrop key with that sheet would blur the page once,
      // before the barrier was drawn, and show through the sheet as if the page
      // had not been dimmed at all. Grouped, it would join `_layer` below.
      backdrop = BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: widget.barrierBlur, sigmaY: widget.barrierBlur),
        child: backdrop,
      );
    }

    // The press that closes is on the backdrop rather than on the layer, so a
    // press that lands on the content is not an outside press. Opaque so that
    // nothing behind it is reached even where nothing is painted.
    backdrop = GestureDetector(
      behavior: HitTestBehavior.opaque,
      // Not handed to a screen reader, as the React backdrop is hidden from one
      // while the layer is open. On the tree it would be a node the size of the
      // screen with no name, whose tap closes the layer. A reader closes it with
      // Escape, the system back, or a button the layer draws.
      excludeFromSemantics: true,
      onTap: widget.onDismiss == null ? null : _dismiss,
      child: backdrop,
    );

    Widget layer = Stack(
      fit: StackFit.expand,
      children: <Widget>[
        widget.modal ? backdrop : IgnorePointer(child: backdrop),
        widget.child,
      ],
    );

    layer = FadeTransition(opacity: _opacity, child: layer);

    // `Shortcuts` outside the scope and `Actions` between them: a shortcut is
    // answered by an ancestor of whatever holds focus, and the action it looks
    // up has to be one too.
    final Widget scoped = Semantics(
      container: true,
      explicitChildNodes: true,
      scopesRoute: true,
      namesRoute: widget.label != null,
      label: widget.label,
      role: widget.role,
      child: Shortcuts(
        shortcuts: const <ShortcutActivator, Intent>{
          SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
        },
        child: Actions(
          actions: <Type, Action<Intent>>{
            DismissIntent: CallbackAction<DismissIntent>(
              onInvoke: (DismissIntent intent) {
                _dismiss();

                return null;
              },
            ),
          },
          // Focus goes in and stays in: traversal is bounded by the nearest
          // scope, so a `Tab` inside the layer cannot land on the page under it.
          child: FocusScope(node: _scope, child: layer),
        ),
      ),
    );

    // The screen reader's half of the barrier. The backdrop stops the pointer
    // and the scope stops Tab, but a semantics action goes through neither, so
    // without this a reader could still find and press the page under an open
    // modal. Wrapped round the whole layer rather than round the backdrop: inside
    // the layer's own container it would only hide what the layer painted first.
    return BackdropGroup(
      backdropKey: _layer,
      child: BlockSemantics(blocking: widget.modal && widget.open, child: scoped),
    );
  }
}
