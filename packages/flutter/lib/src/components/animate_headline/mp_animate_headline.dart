/// One line replacing the one above it, on a timer.
library;

import 'dart:async';

import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// One line replacing the one above it, on a timer.
///
/// ```dart
/// const MPAnimateHeadline(children: [Text('a component library'), Text('Material Design 3')])
/// ```
///
/// Every line sits in the same place, so the box is as tall and as wide as the
/// largest of them from the first frame and never resizes as the reel turns —
/// which is the whole difficulty with this effect, and the reason the lines
/// that are not showing keep their space rather than being taken out of the
/// layout.
///
/// It is deliberately **not a ticker**. A line comes up, it stops, and it is
/// held long enough to read; [interval] is counted from the moment it arrives
/// rather than from the start of the cycle, so a longer [duration] does not
/// quietly eat the reading time.
///
/// The swap is the one place in the library where both halves of MD3's
/// emphasized curve are written out: the line arriving decelerates into place
/// while the line leaving accelerates away. Everywhere else an exit is a
/// reversed entrance; here the two genuinely are two animations on two lines
/// at the same moment.
///
/// Use it for a set of phrases where any one of them would have done. What it
/// is not for is content a reader has to see, because there is no guarantee
/// they are looking during the two seconds it is up.
class MPAnimateHeadline extends StatelessWidget {
  /// Creates a reel of [children].
  const MPAnimateHeadline({
    required this.children,
    this.interval = const Duration(milliseconds: 2600),
    this.index,
    this.defaultIndex = 0,
    this.onIndexChange,
    this.loop = true,
    this.rise,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.repeat,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// The lines, in the order they should be read.
  final List<Widget> children;

  /// How long each line is held before the next one comes up, counted from
  /// the moment a line arrives, so it is reading time rather than a cycle.
  final Duration interval;

  /// Which line is showing. Pass it to drive the reel yourself — from a step in
  /// a form, a tab, or a timer of your own — and the reel stops turning on its
  /// own: a second timer underneath yours would fight it for the same state.
  final int? index;

  /// Where a reel that turns on its own starts.
  final int defaultIndex;

  /// Called with the line that has just come up.
  final ValueChanged<int>? onIndexChange;

  /// Starts again after the last line. Off, the reel stops on the last one and
  /// stays there.
  final bool loop;

  /// How far a line travels as it comes up or leaves, in logical pixels. Left
  /// out, one line's own height.
  final double? rise;

  /// How long one swap takes. Left out, MD3's `long2`.
  final Duration? duration;

  /// How long before the reel starts turning at all. Added once, before the
  /// first line's [interval], rather than to every line.
  final Duration delay;

  /// Which Material curve both lines of a swap run on. Left out, the arriving
  /// line decelerates on `emphasizedDecelerate` and the leaving one
  /// accelerates on `emphasizedAccelerate`.
  final MPEasing? easing;

  /// How many times it runs. `null`, the default, never stops; the reel turns
  /// for as long as [loop] says, and this only decides whether a hover trigger
  /// stops it when the pointer leaves.
  final MPAnimateRepeat repeat;

  /// Holds the reel on the line it is on, and the wait for the next one where
  /// it is.
  final bool paused;

  /// What starts the reel turning.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual].
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it starts only the first time.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the reel has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    final Duration swap = duration ?? MPMotion.long2;

    return MPAnimateGate(
      // Told nothing of `paused`, so what it hands over is whether the trigger
      // has let the reel go. The reel reads the pause itself, because a pause
      // holds the wait for the next line where it is.
      settings: MPAnimateSettings(
        duration: swap,
        repeat: repeat,
        trigger: trigger,
        play: play,
        once: once,
        threshold: threshold,
        // A reel that loops on its own timer turns for ever, so it rests off
        // screen, and its timer with it, unless a pause already holds it.
        endless: loop && index == null && !paused,
      ),
      builder: (BuildContext context, bool running, int runs, bool resting, Widget? _) {
        return _Reel(
          started: running || resting,
          held: paused || resting,
          interval: interval,
          index: index,
          defaultIndex: defaultIndex,
          onIndexChange: onIndexChange,
          loop: loop,
          rise: rise,
          duration: swap,
          delay: delay,
          easing: easing,
          children: children,
        );
      },
    );
  }
}

class _Reel extends StatefulWidget {
  const _Reel({
    required this.started,
    required this.held,
    required this.interval,
    required this.index,
    required this.defaultIndex,
    required this.onIndexChange,
    required this.loop,
    required this.rise,
    required this.duration,
    required this.delay,
    required this.easing,
    required this.children,
  });

  final bool started;
  final bool held;
  final List<Widget> children;
  final Duration interval;
  final int? index;
  final int defaultIndex;
  final ValueChanged<int>? onIndexChange;
  final bool loop;
  final double? rise;
  final Duration duration;
  final Duration delay;
  final MPEasing? easing;

  @override
  State<_Reel> createState() => _ReelState();
}

class _ReelState extends State<_Reel> with SingleTickerProviderStateMixin {
  late final AnimationController _swap = AnimationController(
    vsync: this,
    duration: widget.duration,
  );

  late int _uncontrolled = widget.defaultIndex;

  /// The line on its way out, cleared once its swap is over.
  int? _leaving;

  /// The wait for the next line.
  Timer? _turn;

  /// Whether a wait has been begun for the line that is up.
  bool _waiting = false;

  /// Whether that wait is counting, rather than held.
  bool _counting = false;

  /// How much of the wait went by before it was last held.
  Duration _gone = Duration.zero;

  /// When the wait last started counting, on [mpAnimationNow].
  Duration? _waitFrom;

  /// Whether the reel has turned once, after which [_Reel.delay] is spent.
  bool _turned = false;

  Duration get _length => widget.interval + (_turned ? Duration.zero : widget.delay);

  int get _count => widget.children.length;

  bool get _turns => _count >= 2 && (widget.loop || _active < _count - 1);

  int get _active {
    final int wanted = widget.index ?? _uncontrolled;

    return wanted.clamp(0, _count > 0 ? _count - 1 : 0);
  }

  @override
  void initState() {
    super.initState();
    _swap.value = 1;
    _schedule();
  }

  @override
  void didUpdateWidget(_Reel oldWidget) {
    super.didUpdateWidget(oldWidget);
    _swap.duration = widget.duration;

    final int before = (oldWidget.index ?? _uncontrolled).clamp(
      0,
      oldWidget.children.isEmpty ? 0 : oldWidget.children.length - 1,
    );

    if (before != _active) {
      _showFrom(before);
    }

    // Only when something the timer depends on changed: a parent that rebuilds
    // every second would otherwise restart the wait before it ever ran out.
    final bool fresh =
        (widget.started && !oldWidget.started) ||
        widget.index != oldWidget.index ||
        before != _active;

    if (fresh ||
        widget.started != oldWidget.started ||
        widget.held != oldWidget.held ||
        widget.interval != oldWidget.interval ||
        widget.delay != oldWidget.delay ||
        widget.loop != oldWidget.loop ||
        widget.children.length != oldWidget.children.length) {
      _schedule(fresh: fresh);
    }
  }

  @override
  void dispose() {
    _turn?.cancel();
    _swap.dispose();
    super.dispose();
  }

  void _showFrom(int previous) {
    // Swapped in one frame under reduced motion: nothing travels, so there is
    // nothing for a ticker to draw.
    if (mpReducedMotion(context)) {
      _swap.value = 1;
      setState(() => _leaving = null);

      return;
    }

    setState(() => _leaving = previous);
    _swap
      ..value = 0
      ..forward().whenCompleteOrCancel(() {
        if (mounted) {
          setState(() => _leaving = null);
        }
      });
  }

  /// Begins, holds or goes on with the wait for the next line.
  void _schedule({bool fresh = false}) {
    // Only a reel that turns on its own waits: a controlled one is somebody
    // else's timer.
    final bool waits = widget.index == null && _count >= 1 && widget.started;

    if (fresh || !waits || !_waiting) {
      _turn?.cancel();
      _turn = null;
      _counting = false;
      _waitFrom = null;
      _gone = Duration.zero;
      _waiting = waits;
    }

    if (!waits) {
      return;
    }

    _hold();

    if (!widget.held) {
      _run();
    }
  }

  void _hold() {
    _turn?.cancel();
    _turn = null;

    if (!_counting) {
      return;
    }

    _counting = false;

    final Duration? from = _waitFrom;

    if (from != null) {
      _gone += mpAnimationNow() - from;
    }

    _waitFrom = null;
  }

  void _run() {
    final Duration remaining = _length - _gone;

    _counting = true;

    if (_turns) {
      _turn = Timer(remaining > Duration.zero ? remaining : Duration.zero, _onTurn);
    }

    final SchedulerBinding scheduler = SchedulerBinding.instance;

    if (scheduler.schedulerPhase != SchedulerPhase.idle) {
      _waitFrom = mpAnimationNow();

      return;
    }

    // Started between two frames, from the timer that brought a line up: the
    // wait is measured from the frame that draws the line, which is when it
    // arrives.
    _waitFrom = null;
    scheduler.addPostFrameCallback((_) {
      if (_counting) {
        _waitFrom ??= mpAnimationNow();
      }
    });
    scheduler.scheduleFrame();
  }

  void _onTurn() {
    _turn = null;
    _waitFrom = null;
    _waiting = false;
    _counting = false;

    if (!mounted) {
      return;
    }

    _turned = true;

    final int previous = _active;
    final int next = previous + 1 >= _count ? 0 : previous + 1;

    if (next == 0 && !widget.loop) {
      return;
    }

    setState(() => _uncontrolled = next);
    widget.onIndexChange?.call(next);
    _showFrom(previous);
    _schedule(fresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final bool still = mpReducedMotion(context);
    final Curve arriving = (widget.easing ?? MPEasing.emphasizedDecelerate).curve;
    final Curve leaving = (widget.easing ?? MPEasing.emphasizedAccelerate).curve;

    // Clipped, so a line travelling in or out is cut at the box's edge.
    return ClipRect(
      child: Stack(
        alignment: AlignmentDirectional.topStart,
        children: <Widget>[
          for (int position = 0; position < _count; position += 1)
            _line(position, arriving: arriving, leaving: leaving, still: still),
        ],
      ),
    );
  }

  Widget _line(
    int position, {
    required Curve arriving,
    required Curve leaving,
    required bool still,
  }) {
    final bool active = position == _active;
    // The reel still turns under reduced motion — it is a set of phrases, and
    // stopping on the first would be a different message — but the lines swap
    // rather than travel, so nothing is on its way out.
    final bool going = position == _leaving && !still;
    final bool shown = active || going;

    return AnimatedBuilder(
      animation: _swap,
      child: widget.children[position],
      builder: (BuildContext context, Widget? inner) {
        final double value = still ? 1 : _swap.value.clamp(0.0, 1.0);
        final double t = active ? arriving.transform(value) : leaving.transform(value);
        // Coming up from below, or leaving upward.
        final double travel = !shown ? 0 : (active ? 1 - t : -t);
        final double opacity = !shown ? 0 : (active ? t : 1 - t);

        // A line that is not up keeps its space and nothing else: it is not
        // drawn, not hit and not read out, as `visibility: hidden` leaves it.
        return Visibility(
          visible: shown,
          maintainSize: true,
          maintainAnimation: true,
          maintainState: true,
          child: MPAnimateOpacity(
            opacity: opacity.clamp(0.0, 1.0),
            child: mpTranslate(
              offset: Offset(0, travel * (widget.rise ?? 0)),
              fraction: Offset(0, travel),
              useFraction: widget.rise == null,
              child: inner!,
            ),
          ),
        );
      },
    );
  }
}
