/// How far each mark on a chart has eased towards the state it was put in.
///
/// The React marks fade and grow on a CSS transition: a series fades as a
/// legend entry points at another, a bar or a span comes up under the
/// crosshair, and a scatter mark grows a pixel, each over the house duration.
/// A painter has no transition to hand a value to, and a chart is built again
/// for every column the pointer crosses, so a chart keeps one of these and its
/// painter asks it how far along each mark is.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/animation.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';

/// Where each mark is between at rest, `0`, and fully in the state it was put
/// in, `1`.
///
/// A mark is named by a key the chart chooses, and every key starts at rest.
/// [aim] says which keys are in their state now; each one that turns round
/// sets off from where it stands, on a clock of its own, as an element under a
/// CSS transition does. A mark the change leaves heading the same way keeps
/// going, so a pointer crossing a row of bars leaves each easing out on its
/// own time rather than starting every one of them over.
///
/// Only the fraction eases. What a painter does with it, a fade to 0.28 or a
/// pixel of growth, is its own, and at `0` and `1` it draws exactly what it
/// drew before anything eased.
class MPMarkEase extends ChangeNotifier {
  /// Runs on a ticker from [vsync].
  MPMarkEase(TickerProvider vsync) {
    _ticker = vsync.createTicker(_tick);
  }

  late final Ticker _ticker;

  /// Every key that is not at rest, or that is on its way back to it.
  final Map<Object, _Leg> _legs = <Object, _Leg>{};

  Duration _duration = Duration.zero;
  Curve _curve = Curves.linear;

  /// The time on this clock, which runs only while something is moving, so a
  /// chart at rest carries no frame callback.
  Duration _now = Duration.zero;

  /// What [_now] was when the ticker last started.
  Duration _base = Duration.zero;

  /// Sends every key in [on] to `1` and every other key to `0`, over
  /// [duration] on [curve]. [Duration.zero] puts each one there at once, which
  /// is what a chart asks for when the platform wants less movement.
  ///
  /// Nothing is notified: a chart calls this while it is being built, and what
  /// it builds is painted with the new state anyway.
  void aim(Set<Object> on, {required Duration duration, required Curve curve}) {
    _duration = duration;
    _curve = curve;

    final bool still = duration == Duration.zero;
    bool moving = false;

    for (final Object key in <Object>{..._legs.keys, ...on}) {
      final double target = on.contains(key) ? 1 : 0;
      final _Leg? leg = _legs[key];

      if (leg != null && leg.to == target && !still) {
        moving = moving || leg.from != leg.to;

        continue;
      }

      final double from = leg == null ? 0 : _at(leg);

      if (still || from == target) {
        if (target == 0) {
          _legs.remove(key);
        } else {
          _legs[key] = _Leg(target, target);
        }

        continue;
      }

      _legs[key] = _Leg(from, target);
      moving = true;
    }

    if (still || !moving) {
      if (_ticker.isActive) {
        _ticker.stop();
        _base = _now;
      }

      return;
    }

    if (!_ticker.isActive) {
      _base = _now;
      _ticker.start();
    }
  }

  /// How far [key] is along, from `0` at rest to `1` in its state.
  double of(Object key) {
    final _Leg? leg = _legs[key];

    return leg == null ? 0 : _at(leg);
  }

  double _at(_Leg leg) {
    final Duration? start = leg.start;

    // A leg that has not had its first frame yet is still where it set off
    // from, as an animation is until the frame after it was started.
    if (leg.from == leg.to || start == null) {
      return leg.from;
    }

    if (_duration <= Duration.zero) {
      return leg.to;
    }

    final double t = ((_now - start).inMicroseconds / _duration.inMicroseconds).clamp(0.0, 1.0);

    return leg.from + (leg.to - leg.from) * _curve.transform(t);
  }

  void _tick(Duration elapsed) {
    _now = _base + elapsed;

    bool moving = false;

    for (final _Leg leg in _legs.values) {
      if (leg.from == leg.to) {
        continue;
      }

      leg.start ??= _now;

      if (_now - leg.start! < _duration) {
        moving = true;
      }
    }

    if (!moving) {
      // Every leg has arrived: the ones at rest are let go, and the rest stand
      // where they arrived, exactly, so nothing on screen moves as they settle.
      _legs.removeWhere((Object _, _Leg leg) => leg.to == 0);

      for (final _Leg leg in _legs.values) {
        leg.from = leg.to;
      }

      _ticker.stop();
      _base = _now;
    }

    notifyListeners();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }
}

/// One key's way from where it was to where it is going.
class _Leg {
  _Leg(this.from, this.to);

  /// Where it set off from, and where it stands once it has arrived.
  double from;
  final double to;

  /// When it set off, on the ease's clock, or `null` until its first frame.
  Duration? start;
}
