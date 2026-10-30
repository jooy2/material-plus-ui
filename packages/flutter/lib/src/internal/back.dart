/// The system back, answered by the layer on top.
///
/// None of this is exported from `material_plus_ui.dart` — it is the library talking to
/// itself.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Takes the system back for a layer while [active] is on.
///
/// The system back is Android's back button and gesture, TalkBack's back, and
/// VoiceOver's escape scrub, all of which reach the app as the same request:
/// pop the page on top. A layer lifted into the [Overlay] is not a page, so
/// without this the request passes it by and pops the page under it, and the
/// layer goes with the page without ever saying it was closed.
///
/// So while it is [active] the layer is registered with the [ModalRoute] it sits
/// in, as a `PopScope` is, and that route refuses to be popped and tells the
/// guard instead. Only while it is active: a guard sits round every popup,
/// tooltips included, and a route tells the platform whether the app answers
/// the back every time an entry comes or goes.
///
/// Only the layer on top answers. A route tells every entry it holds, and a
/// modal opened from a modal would otherwise close both on one back. The one on
/// top is the one that took the back last, which is the one whose layer went up
/// last and is painted over the others.
///
/// A layer on a page something else has been pushed over is not asked, because
/// the back pops the page on top. With no route above it at all, an app that
/// has an [Overlay] and no [Navigator], there is no back to take, and the guard
/// does nothing.
class MPBackGuard extends StatefulWidget {
  /// Creates a guard.
  const MPBackGuard({required this.active, required this.child, this.onBack, super.key});

  /// Whether the layer takes the back now.
  final bool active;

  /// What the back does while the layer is on top. `null` takes the back and
  /// does nothing with it, which is a layer that refuses to be closed.
  final VoidCallback? onBack;

  /// The layer, which is drawn as it is.
  final Widget child;

  @override
  State<MPBackGuard> createState() => _MPBackGuardState();
}

class _MPBackGuardState extends State<MPBackGuard> {
  /// Every guard that takes the back now, in the order they started to.
  static final List<_MPBackGuardState> _taking = <_MPBackGuardState>[];

  late final _BackEntry _entry = _BackEntry(this);

  /// The route the layer sits in, and `null` where there is none.
  ModalRoute<Object?>? _route;

  /// The route the guard is registered with: [_route] while the layer takes
  /// the back, and `null` while it does not.
  ModalRoute<Object?>? _holding;

  @override
  void initState() {
    super.initState();

    if (widget.active) {
      _taking.add(this);
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _route = ModalRoute.of(context);
    _hold();
  }

  @override
  void didUpdateWidget(MPBackGuard oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.active != oldWidget.active) {
      _taking.remove(this);

      if (widget.active) {
        _taking.add(this);
      }

      _hold();
    }
  }

  @override
  void dispose() {
    _taking.remove(this);
    _holding?.unregisterPopEntry(_entry);
    _entry.dispose();
    super.dispose();
  }

  /// Registers with the route while the layer takes the back, and with none
  /// while it does not.
  void _hold() {
    final ModalRoute<Object?>? next = widget.active ? _route : null;

    if (next != _holding) {
      _holding?.unregisterPopEntry(_entry);
      _holding = next;
      _holding?.registerPopEntry(_entry);
    }
  }

  /// Whether no guard in the same route has taken the back since this one did.
  bool get _onTop {
    for (final _MPBackGuardState other in _taking.reversed) {
      if (identical(other, this)) {
        return true;
      }

      if (identical(other._route, _route)) {
        return false;
      }
    }

    return false;
  }

  void _back() {
    if (widget.active && _onTop) {
      widget.onBack?.call();
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

/// What the route holds for a guard: a refusal to be popped, and a call when it
/// was asked to be.
class _BackEntry extends PopEntry<Object?> {
  _BackEntry(this._guard);

  final _MPBackGuardState _guard;

  /// Always `false`. The entry is held only while the layer takes the back.
  final ValueNotifier<bool> _canPop = ValueNotifier<bool>(false);

  @override
  ValueListenable<bool> get canPopNotifier => _canPop;

  @override
  void onPopInvokedWithResult(bool didPop, Object? result) {
    // A route that did pop is gone with every layer on it. Only a back the
    // route refused is one a layer has to answer.
    if (!didPop) {
      _guard._back();
    }
  }

  void dispose() => _canPop.dispose();
}
