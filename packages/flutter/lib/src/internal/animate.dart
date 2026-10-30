/// The machinery every `MPAnimate*` widget runs on.
///
/// The Dart half of the React package's `internal/animate.ts` and
/// `internal/animate-core.ts`, and the same split of labour: seventeen widgets
/// need this and none of them should have to import another.
///
/// ## What is the same
///
/// The vocabulary. `duration`, `delay`, `easing`, `repeat`, `alternate`,
/// `paused`, `trigger`, `play`, `once` and `threshold` mean exactly what they
/// mean over there, and a `delay` of 200ms produces the same wait on a fade as
/// on a marquee. A duration nobody gave is the effect's own MD3 token, and an
/// easing nobody gave is the effect's own MD3 curve, from the same two tables.
///
/// **Waiting is a held first frame, not a hidden widget.** A `visible` fade sits
/// at its first frame, faded out but laid out and taking its space, until it is
/// scrolled into view. That is what `animation-fill-mode: both` plus a paused
/// `animation-play-state` gives the React build, and it is why an untriggered
/// effect does not flash its finished state first.
///
/// **A run that has finished stays where it ended.** No snapping back.
///
/// **Reduced motion drops the effect, it does not land it.** The React
/// stylesheet answers `prefers-reduced-motion` with `animation: none`, which
/// puts every element at its own natural state at once: an entrance is there,
/// an exit is still there, and nothing waits for a delay or a trigger. Here
/// [MediaQueryData.disableAnimations] does the same, and a run that is let go
/// again once the setting is off starts from its beginning, as a keyframe the
/// stylesheet gives back does.
///
/// ## What had to be said differently
///
/// **Durations are [Duration]s**, because the framework already has the type.
///
/// **`repeat` is an `int?`, and `null` is what never stops.** There is no
/// `'infinite'` to write; [MPAnimateRepeat] names the convention.
///
/// **`trigger: visible` watches every scrollable above the widget** rather than
/// an `IntersectionObserver`, and counts it as visible only inside all of their
/// viewports and the screen, which is what the observer measures against. With
/// no scrollable above the widget there is nothing to watch, so it runs, as the
/// React build does when the browser has no observer.
///
/// **An endless effect rests off screen through the same watch**, which the
/// React build does only for the light. Flutter goes on drawing an animation
/// nobody can see, so here every endless effect is held while none of it is
/// inside those viewports.
///
/// The public vocabulary at the top of this file reaches the barrel through the
/// `MPAnimate*` component files; everything below it stays inside the package.
library;

import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/gestures.dart' show GestureBinding;
import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/* ---------------------------------------------------------------------------
 * The public vocabulary
 * ------------------------------------------------------------------------- */

/// What makes an `MPAnimate*` widget run.
///
/// - [mount]: as soon as it is built. The default, and the only one that needs
///   nothing from the caller.
/// - [visible]: when it is scrolled into view inside every scrollable above it,
///   and on the screen. Once, unless `once` is off. With no scrollable above it
///   there is nothing to watch, so it runs at once rather than waiting forever.
/// - [hover]: while the pointer is on it, starting again on each entry. Focus
///   inside it counts too, or the effect would be unreachable without a mouse.
/// - [manual]: never on its own. `play` is what runs it.
enum MPAnimateTrigger {
  /// As soon as it is built.
  mount,

  /// When it is scrolled into view.
  visible,

  /// While the pointer or the focus is on it.
  hover,

  /// Only when `play` says so.
  manual,
}

/// Whether an effect brings its content in or takes it away.
///
/// [enter] and [exit] rather than the React package's `'in'` and `'out'`,
/// because `in` is a reserved word in Dart and cannot be an enum value.
///
/// The two are not the same length in Material: an entrance is given room to be
/// read as an arrival, and an exit gets out of the way. That asymmetry is what
/// the default durations carry, so [exit] is quicker than [enter] without
/// anybody having to know the numbers.
enum MPAnimateMode {
  /// The content arrives.
  enter,

  /// The same run backwards, held where it ends.
  exit,
}

/// A Material easing curve, by the specification's own name.
///
/// These are MD3's motion easing set and nothing else, for the reason `color`
/// takes a family rather than a colour: every animation in the library reads
/// its curve from [MPMotion], so the set stays one set.
///
/// Something **arriving** decelerates into place, something **leaving**
/// accelerates away, [standard] is for a change that is neither, and [linear]
/// is for a loop that has no beginning to arrive at.
enum MPEasing {
  /// No easing: the same speed throughout.
  linear(Curves.linear),

  /// MD3's standard curve, for a change that neither arrives nor leaves.
  standard(MPMotion.standard),

  /// The standard curve's arriving half.
  standardDecelerate(MPMotion.standardDecelerate),

  /// The standard curve's leaving half.
  standardAccelerate(MPMotion.standardAccelerate),

  /// MD3's emphasized curve, as the single-curve stand-in the web uses.
  emphasized(MPMotion.emphasized),

  /// The emphasized curve's arriving half, which the entrances take.
  emphasizedDecelerate(MPMotion.emphasizedDecelerate),

  /// The emphasized curve's leaving half.
  emphasizedAccelerate(MPMotion.emphasizedAccelerate);

  const MPEasing(this.curve);

  /// The curve this name stands for, from [MPMotion].
  final Curve curve;
}

/// How many times an animation runs. `null` never stops.
///
/// The React package writes `'infinite'`; Dart has no union of a number and a
/// word, and a sentinel such as `-1` would be one more thing to look up. The
/// same trade a null progress `value` makes for an indeterminate indicator.
typedef MPAnimateRepeat = int?;

/// The seven entrances the `MPAnimate*` widgets are built out of.
///
/// Named after what a reader sees rather than after the property underneath:
/// [zoom] and [grow] are both a change of scale, and they are two words because
/// they are two gestures. Each carries the Material duration and curve the
/// effect takes when nobody says otherwise.
enum MPAnimation {
  /// Opacity alone.
  fade(MPMotion.medium2, MPMotion.short4, MPEasing.emphasizedDecelerate),

  /// A short change of scale from a point.
  grow(MPMotion.medium4, MPMotion.short4, MPEasing.emphasizedDecelerate),

  /// Travel in from an edge.
  slide(MPMotion.medium4, MPMotion.short4, MPEasing.emphasizedDecelerate),

  /// A long change of scale about the middle.
  zoom(MPMotion.medium4, MPMotion.short4, MPEasing.emphasizedDecelerate),

  /// A turn into place. Half a turn reads as rushed under `long2`.
  rotate(MPMotion.long2, MPMotion.medium2, MPEasing.emphasizedDecelerate),

  /// A pulse. Its number is a period, which has no direction, and its curve is
  /// [MPEasing.standard] because a pulse has no destination to decelerate into.
  blink(MPMotion.extraLong4, MPMotion.extraLong4, MPEasing.standard),

  /// A wipe from one edge.
  reveal(MPMotion.medium4, MPMotion.short4, MPEasing.emphasizedDecelerate);

  const MPAnimation(this._enter, this._exit, this.easing);

  final Duration _enter;
  final Duration _exit;

  /// The curve the effect takes when nobody says otherwise.
  final MPEasing easing;

  /// The duration the effect takes in [mode] when nobody says otherwise:
  /// MD3 puts an entrance around 400ms and an exit around 200ms.
  Duration durationFor(MPAnimateMode mode) => mode == MPAnimateMode.exit ? _exit : _enter;
}

/// Lays out the children of a set an effect is spread across.
///
/// The Flutter spelling of what the React build leaves to the caller's own
/// markup and CSS: there, the effect is written onto the children and whatever
/// laid them out goes on laying them out. Here the widget has to place them
/// itself, so this is where a caller says how: a [Row], a [Wrap], a list.
typedef MPAnimateLayoutBuilder = Widget Function(BuildContext context, List<Widget> children);

/* ---------------------------------------------------------------------------
 * Small shared answers
 * ------------------------------------------------------------------------- */

/// The default share of a widget that has to be on screen before
/// [MPAnimateTrigger.visible] counts it as visible.
const double mpVisibleThreshold = 0.2;

/// The set's layout when nobody gave one: the children stacked down the page,
/// each at its own width, as block elements in a `<div>` stack.
///
/// Start-aligned rather than stretched, so a set put inside a [Row] or anything
/// else that hands down an unbounded width still lays out.
Widget mpColumnLayout(BuildContext context, List<Widget> children) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: children,
  );
}

/// Whether the platform has asked for less movement.
///
/// The one signal both packages read, under two names: `prefers-reduced-motion`
/// there, [MediaQueryData.disableAnimations] here.
bool mpReducedMotion(BuildContext context) {
  return MediaQuery.maybeDisableAnimationsOf(context) ?? false;
}

/// [duration] plus [step], never below nothing.
///
/// A negative `durationStep` far enough down a set asks for a negative
/// duration, which the React build clamps with `max(0ms, …)` for the same
/// reason.
Duration mpStepped(Duration duration, Duration step) {
  final Duration total = duration + step;

  return total > Duration.zero ? total : Duration.zero;
}

/// A value at [progress] through keyframes at [stops], eased by [curve] inside
/// each segment.
///
/// A CSS timing function applies between two keyframes rather than across the
/// whole run, so a pulse that goes full, faint, full eases into the floor and
/// out of it again instead of hurrying through one end. The effects with more
/// than two keyframes — the pulse, the drift, the shake — are handed the run's
/// progress unswayed and ease each leg here.
double mpKeyframes(double progress, List<double> stops, List<double> values, Curve curve) {
  assert(stops.length == values.length && stops.length >= 2);

  final double p = progress.clamp(0.0, 1.0);

  for (int index = 0; index < stops.length - 1; index += 1) {
    final double start = stops[index];
    final double end = stops[index + 1];

    if (p <= end || index == stops.length - 2) {
      final double span = end - start;
      final double local = span <= 0 ? 1 : ((p - start) / span).clamp(0.0, 1.0);

      return ui.lerpDouble(values[index], values[index + 1], curve.transform(local))!;
    }
  }

  return values.last;
}

/// Where a slide starts, given the edge it comes from: [distance] logical
/// pixels away, or one whole size of the widget when [distance] is `null`.
///
/// [MPSide] is physical everywhere in the library and stays physical here:
/// something arriving from the top arrives from the top in every writing
/// direction.
({Offset pixels, Offset fraction}) mpSlideOffset(MPSide from, double? distance) {
  final double amount = distance ?? 1;

  switch (from) {
    case MPSide.top:
      return (pixels: Offset(0, -amount), fraction: const Offset(0, -1));
    case MPSide.bottom:
      return (pixels: Offset(0, amount), fraction: const Offset(0, 1));
    case MPSide.left:
      return (pixels: Offset(-amount, 0), fraction: const Offset(-1, 0));
    case MPSide.right:
      return (pixels: Offset(amount, 0), fraction: const Offset(1, 0));
  }
}

/// Moves [child] by [offset] logical pixels, or by [fraction] of its own size
/// when [useFraction] is set.
///
/// Two widgets because a fraction of the widget's own size is only known at
/// paint time, which is what [FractionalTranslation] is for — the counterpart
/// of a percentage `translate`. Both are always in the tree, one of them moving
/// by nothing, so switching between a distance and none changes neither the
/// shape of the tree above [child] nor what Flutter keeps of it. A translation
/// paints no layer of its own.
Widget mpTranslate({
  required Offset offset,
  required Offset fraction,
  required bool useFraction,
  required Widget child,
}) {
  return FractionalTranslation(
    translation: useFraction ? fraction : Offset.zero,
    child: Transform.translate(offset: useFraction ? Offset.zero : offset, child: child),
  );
}

/* ---------------------------------------------------------------------------
 * The clock
 * ------------------------------------------------------------------------- */

/// The time a wait is measured on. Read inside a frame.
///
/// The frame clock, [SchedulerBinding.currentSystemFrameTimeStamp], rather
/// than a [Stopwatch]: a widget test moves time forward on a clock of its own,
/// which the frame clock follows and a stopwatch does not. The frame clock
/// reads zero until the engine has stamped a frame, and an app's first build is
/// drawn on a warm-up frame with no stamp, so until the first stamp the time is
/// counted on the binding's sampling clock, and the frame clock is moved onto
/// that count once a stamp arrives.
Duration mpAnimationNow() {
  final Duration stamp = SchedulerBinding.instance.currentSystemFrameTimeStamp;

  Stopwatch? unstamped = _unstamped;

  if (stamp == Duration.zero) {
    if (unstamped == null) {
      unstamped = GestureBinding.instance.samplingClock.stopwatch()..start();
      _unstamped = unstamped;
    }

    return unstamped.elapsed;
  }

  if (unstamped != null) {
    _unstamped = null;
    _stampShift = unstamped.elapsed - stamp;
  }

  return stamp + _stampShift;
}

/// What [mpAnimationNow] has counted since its first read before the frame
/// clock had a stamp, or `null` when no such read is waiting for one.
Stopwatch? _unstamped;

/// How far [mpAnimationNow] moves the frame clock to line it up with what was
/// counted before it had a stamp.
Duration _stampShift = Duration.zero;

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------- */

/// Everything a caller can say about *when* and *how long*, in one object.
///
/// Passed down rather than spread across ten parameters on every internal
/// widget, because these travel together everywhere and a widget that took
/// them one by one would be ten chances to forget one. Every value here is
/// already resolved: the duration and the curve are the effect's own when the
/// caller gave none.
@immutable
class MPAnimateSettings {
  /// Creates one run's settings.
  const MPAnimateSettings({
    required this.duration,
    this.delay = Duration.zero,
    this.curve = Curves.linear,
    this.repeat = 1,
    this.alternate = false,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = mpVisibleThreshold,
    this.replay,
    bool? endless,
  }) : _endless = endless;

  /// How long one pass takes.
  final Duration duration;

  /// How long before the first pass starts.
  final Duration delay;

  /// The curve each pass is eased on.
  final Curve curve;

  /// How many passes. `null` never stops.
  final int? repeat;

  /// Runs every other pass backwards, so a repeat returns instead of jumping.
  final bool alternate;

  /// Holds the animation where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual].
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much has to be on screen.
  final double threshold;

  /// A value that starts the run again whenever it changes, and never on the
  /// first build.
  ///
  /// How a set tells its parts that it has started over while it was already
  /// running: `play` is already `true` then, and a part only hears a change.
  final Object? replay;

  final bool? _endless;

  /// Whether the run never stops on its own.
  bool get infinite => repeat == null;

  /// Whether the run goes on for ever once it has started, and so **rests
  /// while it is off screen**: whether [repeat] never stops, unless it was said
  /// otherwise — a reel turning on its own timer, or the parts of a set whose
  /// own gate already watches the set.
  bool get endless => _endless ?? infinite;

  /// These settings with [paused] off, and not [endless] while they were
  /// paused, which is already still and has nothing to rest from.
  MPAnimateSettings get withoutPause {
    if (!paused) {
      return this;
    }

    return MPAnimateSettings(
      duration: duration,
      delay: delay,
      curve: curve,
      repeat: repeat,
      alternate: alternate,
      trigger: trigger,
      play: play,
      once: once,
      threshold: threshold,
      replay: replay,
      endless: false,
    );
  }
}

/* ---------------------------------------------------------------------------
 * The gate: is this running?
 * ------------------------------------------------------------------------- */

/// What [MPAnimateGate] hands its builder: whether the effect is running, how
/// many times it has been let go, and whether it is resting off screen.
typedef MPAnimateGateBuilder =
    Widget Function(BuildContext context, bool running, int runs, bool resting, Widget? child);

/// Answers one question — *is this running?* — and nothing else.
///
/// The four triggers, `play`, `paused`, the hover handling and the rest an
/// endless effect takes off screen live here and only here. [MPAnimateRun]
/// builds on it for the effects that are one curve from a start state to the
/// natural one; the ones that write their motion in Dart — a typewriter, a
/// reel, a set of parts — use it directly, because what they need from the
/// trigger is a boolean and not a number.
class MPAnimateGate extends StatefulWidget {
  /// Creates a gate.
  const MPAnimateGate({required this.settings, required this.builder, this.child, super.key});

  /// When to run, and whether it is held.
  final MPAnimateSettings settings;

  /// Called with whether the animation is running right now, with how many
  /// times it has been let go — which is what a restart looks like from the
  /// outside, since "running" is already true when one arrives — and with
  /// whether it is resting off screen.
  final MPAnimateGateBuilder builder;

  /// Passed through to [builder] untouched.
  final Widget? child;

  @override
  State<MPAnimateGate> createState() => MPAnimateGateState();
}

/// The state behind [MPAnimateGate].
class MPAnimateGateState extends State<MPAnimateGate> {
  bool _started = false;

  /// The position of every scrollable above it, while something has to know
  /// whether it is on screen: `visible` waiting, or an endless effect running.
  final List<ScrollPosition> _watching = <ScrollPosition>[];

  /// Whether the scrollables above it have been looked for, or will be once
  /// the frame is over. Set when none were found as well, so a widget with
  /// nothing above it to scroll is not looked up again on every change.
  bool _watched = false;

  /// Whether a measurement of where it is on screen waits for the frame's end.
  bool _checkPending = false;

  /// Whether it rested off screen when the watch was last brought up to date,
  /// so an effect that has just become one is measured at once.
  bool _restWatch = false;

  /// How many times it has been let go.
  int get runs => _runs;
  int _runs = 0;

  /// Whether it has been let go at all.
  bool get started => _started;

  /// Whether an endless effect is resting because it is off screen.
  bool get resting => _resting;
  bool _resting = false;

  /// Whether a `visible` trigger still has to look for it on screen.
  bool get _waitsToBeSeen =>
      widget.settings.trigger == MPAnimateTrigger.visible && !(widget.settings.once && _started);

  /// Whether it rests while it is off screen: an endless effect, and only while
  /// it is running. A `visible` trigger that is not `once` already takes the
  /// effect back when it leaves the view.
  bool get _restsOffScreen =>
      widget.settings.endless &&
      _started &&
      !widget.settings.paused &&
      !(widget.settings.trigger == MPAnimateTrigger.visible && !widget.settings.once);

  @override
  void initState() {
    super.initState();
    _started =
        widget.settings.trigger == MPAnimateTrigger.mount ||
        (widget.settings.trigger == MPAnimateTrigger.manual && widget.settings.play);
    _updateWatch();
  }

  @override
  void didUpdateWidget(MPAnimateGate oldWidget) {
    super.didUpdateWidget(oldWidget);

    final MPAnimateSettings now = widget.settings;
    final MPAnimateSettings before = oldWidget.settings;

    if (now.trigger != before.trigger) {
      _unwatchScroll();
      _set(
        now.trigger == MPAnimateTrigger.mount ||
            (now.trigger == MPAnimateTrigger.manual && now.play),
      );

      return;
    }

    // `play` is a caller pressing go, and each false → true starts it over.
    if (now.trigger == MPAnimateTrigger.manual && now.play != before.play) {
      _set(now.play);
    }

    // Compared against the last build, so the first one is never a change.
    if (now.replay != before.replay && _started) {
      restart();
    }

    _updateWatch();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // The scrollables above can change while it is watched. Every listener is
    // taken off, and the ones above it now are put on.
    if (_watching.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _watchScroll());
    }
  }

  @override
  void dispose() {
    _unwatchScroll();
    super.dispose();
  }

  void _set(bool value) {
    if (!mounted) {
      return;
    }

    setState(() {
      if (value && !_started) {
        _runs += 1;
      }

      _started = value;
    });
    _updateWatch();
  }

  /// Runs it again from the beginning, whatever it was doing.
  void restart() {
    if (!mounted) {
      return;
    }

    setState(() {
      _started = true;
      _runs += 1;
    });
    _updateWatch();
  }

  void _setResting(bool value) {
    if (_resting != value && mounted) {
      setState(() => _resting = value);
    }
  }

  /// Watches the scrollables above it while anything has to know whether it is
  /// on screen, and stops once nothing does.
  void _updateWatch() {
    final bool rests = _restsOffScreen;
    final bool began = rests && !_restWatch;

    _restWatch = rests;

    if (!rests) {
      _setResting(false);
    }

    if (!rests && !_waitsToBeSeen) {
      _unwatchScroll();

      return;
    }

    if (!_watched) {
      // After the frame, because what is measured is the box it is laid out in.
      _watched = true;
      WidgetsBinding.instance.addPostFrameCallback((_) => _watchScroll());
    } else if (began) {
      _scheduleCheck();
    }
  }

  void _watchScroll() {
    if (!mounted) {
      return;
    }

    _unwatchScroll();

    if (!_waitsToBeSeen && !_restsOffScreen) {
      return;
    }

    _watched = true;

    ScrollableState? scrollable = Scrollable.maybeOf(context);

    if (scrollable == null) {
      // Nothing to watch means no way to know: show it rather than hide it
      // forever, which is what the React build does without an observer. For
      // the same reason an endless effect never rests here.
      if (_waitsToBeSeen) {
        _set(true);
      }

      return;
    }

    // Every scrollable above it, not only the nearest: a counter in a row that
    // scrolls sideways is in view along the row long before the page brings
    // the row up. The ones further up are found without `Scrollable.maybeOf`,
    // which would make each depend on the one above it.
    while (scrollable != null) {
      _watching.add(scrollable.position..addListener(_onScroll));
      scrollable = scrollable.context.findAncestorStateOfType<ScrollableState>();
    }

    if (_waitsToBeSeen) {
      _checkVisible();
    }

    _checkRest();
  }

  void _unwatchScroll() {
    for (final ScrollPosition position in _watching) {
      position.removeListener(_onScroll);
    }

    _watching.clear();
    _watched = false;
  }

  void _onScroll() {
    if (_waitsToBeSeen || _restsOffScreen) {
      _scheduleCheck();
    }
  }

  /// Measures where it is once the frame has been laid out. A scroll position
  /// tells its listeners it has moved before the frame lays the content out
  /// where it has moved to, so a measurement taken at once finds the widget
  /// where the step before left it.
  void _scheduleCheck() {
    if (_checkPending) {
      return;
    }

    _checkPending = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkPending = false;

      if (!mounted) {
        return;
      }

      if (_waitsToBeSeen) {
        _checkVisible();
      }

      _checkRest();
    });
  }

  void _checkVisible() {
    if (!mounted) {
      return;
    }

    final RenderObject? object = context.findRenderObject();

    if (object is! RenderBox || !object.hasSize) {
      return;
    }

    final RenderAbstractViewport? viewport = RenderAbstractViewport.maybeOf(object);

    if (viewport == null) {
      _set(true);

      return;
    }

    final double shown = _shareOnScreen(object, viewport).shown;

    // `> 0` as well, as an observer asks of its own entry: zero is the least
    // that counts as seen rather than a reason to start something nowhere near
    // the screen.
    if (shown > 0 && shown >= widget.settings.threshold) {
      if (!_started) {
        restart();
      }
    } else if (!widget.settings.once && _started) {
      _set(false);
    }
  }

  void _checkRest() {
    if (!mounted || !_restsOffScreen) {
      return;
    }

    final RenderObject? object = context.findRenderObject();

    if (object is! RenderBox || !object.hasSize) {
      return;
    }

    final RenderAbstractViewport? viewport = RenderAbstractViewport.maybeOf(object);

    if (viewport == null) {
      _setResting(false);

      return;
    }

    final ({double area, double shown}) share = _shareOnScreen(object, viewport);

    // A box of no size says nothing about where what it holds is drawn, so it
    // never rests on that.
    _setResting(share.area > 0 && share.shown <= 0);
  }

  /// The area of [object], and the share of it the screen and every viewport
  /// above it leave showing, from `0` to `1`.
  ({double area, double shown}) _shareOnScreen(RenderBox object, RenderAbstractViewport viewport) {
    final Rect own = MatrixUtils.transformRect(
      object.getTransformTo(null),
      Offset.zero & object.size,
    );
    final RenderObject? root = object.owner?.rootNode;
    Rect overlap = root is RenderView ? own.intersect(Offset.zero & root.size) : own;
    RenderAbstractViewport? next = viewport;

    while (next != null) {
      overlap = overlap.intersect(
        MatrixUtils.transformRect(next.getTransformTo(null), next.paintBounds),
      );
      next = RenderAbstractViewport.maybeOf(next.parent);
    }

    final double area = own.width * own.height;
    final double shown = area <= 0
        ? 0
        : (math.max(overlap.width, 0) * math.max(overlap.height, 0)) / area;

    return (area: area, shown: shown);
  }

  @override
  Widget build(BuildContext context) {
    final Widget built = widget.builder(
      context,
      _started && !widget.settings.paused && !_resting,
      _runs,
      _resting,
      widget.child,
    );

    if (widget.settings.trigger != MPAnimateTrigger.hover) {
      return built;
    }

    return MouseRegion(
      onEnter: (_) => _onPointer(true),
      onExit: (_) => _onPointer(false),
      // Focus counts, as a focus event bubbling up does in the React build. It
      // is the focus of what is inside that counts: this node takes none
      // itself, so a hover effect on a picture is not a stop in the tab order
      // with nothing for a screen reader to say.
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onFocusChange: _onPointer,
        child: built,
      ),
    );
  }

  void _onPointer(bool on) {
    if (on) {
      restart();

      return;
    }

    // An infinite effect stops when the pointer leaves; a finite one finishes.
    if (widget.settings.infinite) {
      _set(false);
    }
  }
}

/* ---------------------------------------------------------------------------
 * The run: one curve from a start state to the natural one
 * ------------------------------------------------------------------------- */

/// Draws one frame of an effect around [child].
///
/// [t] is the run's eased progress with `1` as the widget's natural state, so a
/// fade is an opacity of `lerpDouble(from, 1, t)` and nothing more, whichever
/// way the run goes. Under reduced motion it is `1` throughout.
typedef MPAnimateFrameBuilder = Widget Function(BuildContext context, double t, Widget child);

/// One animation, from a start state to the widget's natural one.
///
/// [frame] is handed `t`, already eased and already turned round for [mode]:
/// `0` while the run is waiting to be triggered — the held first frame — and
/// wherever the last pass left it once the count runs out.
///
/// An exit is the entrance run backwards, and its curve is turned round with
/// it, as CSS applies the timing function to the reversed progress: an entrance
/// on `emphasizedDecelerate` leaves accelerating, which is the pair the
/// specification asks for.
///
/// Under reduced motion nothing moves at all: [frame] is handed `1` from the
/// first build, an exit included, as the React stylesheet's `animation: none`
/// leaves every element at its own natural state.
class MPAnimateRun extends StatefulWidget {
  /// Creates a run.
  const MPAnimateRun({
    required this.settings,
    required this.frame,
    required this.child,
    this.mode = MPAnimateMode.enter,
    this.held = false,
    super.key,
  });

  /// When to run, how long, how often.
  final MPAnimateSettings settings;

  /// Draws the frame for the current `t`.
  final MPAnimateFrameBuilder frame;

  /// Whether the run goes forwards or backwards.
  final MPAnimateMode mode;

  /// Holds the run where it is, its delay as well, without being a pause, for
  /// a hold the React build makes in its stylesheet rather than through its
  /// trigger, as a marquee under the pointer.
  final bool held;

  /// Passed through to [frame] untouched, so a subtree that does not depend on
  /// `t` is built once rather than on every frame.
  final Widget child;

  @override
  State<MPAnimateRun> createState() => _MPAnimateRunState();
}

class _MPAnimateRunState extends State<MPAnimateRun> with SingleTickerProviderStateMixin {
  // Built in `initState` rather than lazily, so a run the reduced-motion path
  // never touches is still a controller `dispose` can dispose.
  late final AnimationController _controller;

  /// Which pass is running, counting from one.
  int _pass = 1;

  /// The gate's run this controller is playing, or `-1` for none yet.
  int _startedRuns = -1;

  /// The last run whose first frame a build has drawn.
  int _drawnRuns = -1;

  /// The wait before the first pass, held so it can be called off. A
  /// `Future.delayed` would leave a timer running after the widget was gone.
  Timer? _waiting;

  /// What is left of the wait for the run that is on, so a pause during the
  /// wait lets the rest of it go by rather than the whole delay again.
  Duration _delayLeft = Duration.zero;

  /// The moment [_waiting] was started, on [mpAnimationNow].
  Duration _waitingFrom = Duration.zero;

  /// Whether the platform asked for less movement, as of the last build.
  bool _still = false;

  /// Whether the run is putting the controller somewhere itself, which
  /// [_onStatus] leaves alone.
  bool _placing = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.settings.duration)
      ..addStatusListener(_onStatus);
  }

  @override
  void didUpdateWidget(MPAnimateRun oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.settings.duration != widget.settings.duration) {
      _controller.duration = widget.settings.duration;

      // A controller reads its duration when a pass starts, so a pass in
      // flight would finish at the old rate. Going on from where it is starts
      // the pass again the way it was going, over what is left of the new one —
      // which is the marquee's case, measured after its first frame.
      if (_controller.isAnimating) {
        _go();
      }
    }

    if (oldWidget.settings.delay != widget.settings.delay) {
      _redate(oldWidget.settings.delay);
    }

    if (oldWidget.settings.repeat != widget.settings.repeat) {
      _recount(oldWidget.settings.repeat);
    }
  }

  @override
  void dispose() {
    _waiting?.cancel();
    _controller.dispose();
    super.dispose();
  }

  /// How many passes [repeat] comes to, never fewer than one.
  int _passesOf(int repeat) => repeat < 1 ? 1 : repeat;

  void _onStatus(AnimationStatus status) {
    final int? repeat = widget.settings.repeat;

    // A bound the run put the controller on itself is not the end of a pass.
    if (_placing || _still || (repeat != null && _pass >= _passesOf(repeat))) {
      return;
    }

    if (status == AnimationStatus.completed) {
      _pass += 1;

      if (widget.settings.alternate) {
        _controller.reverse();
      } else {
        _controller.forward(from: 0);
      }
    } else if (status == AnimationStatus.dismissed && widget.settings.alternate && _pass > 1) {
      _pass += 1;
      _controller.forward();
    }
  }

  /// Starts, holds or rewinds, from whatever the gate is saying: whether the
  /// trigger has let the run go, how many times it has, and whether an endless
  /// run is resting off screen, which holds it as a pause does.
  void _drive(bool started, int runs, {required bool resting}) {
    if (_still) {
      _halt();

      return;
    }

    if (!started || widget.settings.paused || widget.held || resting) {
      _holdDelay();

      if (_controller.isAnimating) {
        _controller.stop();
      }

      // A run that was never let go sits on its own first frame; one that was
      // only paused, or taken back by its trigger, stays exactly where it is,
      // as a paused keyframe does.
      if (_startedRuns != runs) {
        _startedRuns = -1;
        _setValue(0);
        _delayLeft = Duration.zero;
      }

      return;
    }

    if (_startedRuns == runs) {
      // A wait that is under way is left to run.
      if (_waiting != null) {
        return;
      }

      if (!_controller.isAnimating && !_finished) {
        // Whatever was left of the wait, which is nothing once a pass began;
        // this then goes on with the pass from where it stopped.
        _startAfter(_delayLeft);
      }

      return;
    }

    _startedRuns = runs;
    _pass = 1;
    _setValue(0);
    _startAfter(widget.settings.delay);
  }

  /// Stops everything, for reduced motion: the next run the gate lets go once
  /// movement is back starts from its beginning.
  void _halt() {
    _waiting?.cancel();
    _waiting = null;
    _delayLeft = Duration.zero;

    if (_controller.isAnimating) {
      _controller.stop();
    }

    _startedRuns = -1;
    _drawnRuns = -1;
  }

  /// Starts the pass after [wait], or on this frame when there is none left.
  void _startAfter(Duration wait) {
    final int runs = _startedRuns;

    _waiting?.cancel();
    _waiting = null;
    _delayLeft = wait > Duration.zero ? wait : Duration.zero;

    if (_delayLeft == Duration.zero) {
      _go();

      return;
    }

    _waitingFrom = mpAnimationNow();
    _waiting = Timer(_delayLeft, () {
      _waiting = null;
      _delayLeft = Duration.zero;

      if (mounted && _startedRuns == runs && !_still) {
        _go();
      }
    });
  }

  /// Starts or goes on with the current pass. Every other pass of an
  /// alternating run goes back, so a pass stopped on its way back goes on back,
  /// as a paused keyframe goes on the way it was going.
  ///
  /// A run standing at the end of a pass that has more after it — one given a
  /// higher `repeat` after it finished — goes into the next pass, since a
  /// controller sent to the bound it is already on does nothing.
  void _go() {
    bool backwards = widget.settings.alternate && _pass.isEven;
    final int? repeat = widget.settings.repeat;
    final bool more = repeat == null || _pass < _passesOf(repeat);

    if (!_controller.isAnimating && more && _controller.value == (backwards ? 0 : 1)) {
      _pass += 1;
      backwards = widget.settings.alternate && _pass.isEven;

      if (!backwards) {
        _setValue(0);
      }
    }

    if (backwards) {
      _controller.reverse();
    } else {
      _controller.forward();
    }
  }

  /// Puts the controller on [value] without counting a pass or starting one.
  void _setValue(double value) {
    _placing = true;
    _controller.value = value;
    _placing = false;
  }

  /// Where the controller stops at the end of a run of [repeat] passes: an
  /// alternating run with an even number of passes ends on one that ran back.
  double _endOf(int? repeat) {
    final int passes = repeat == null ? 1 : _passesOf(repeat);

    return widget.settings.alternate && passes.isEven ? 0 : 1;
  }

  /// Whether the run has played every pass its own `repeat` gives it.
  bool get _finished => _finishedAfter(widget.settings.repeat);

  bool _finishedAfter(int? repeat) {
    return repeat != null &&
        _pass >= _passesOf(repeat) &&
        !_controller.isAnimating &&
        _controller.value == _endOf(repeat);
  }

  /// A new `repeat`, which was [before]. A pass in flight goes on and reads the
  /// new count when it ends; a run past the end of a lower count stands where
  /// that count ends; a run that had finished and is given more passes goes on
  /// into them, which `_drive` starts once nothing holds it.
  void _recount(int? before) {
    final int? repeat = widget.settings.repeat;

    if (_still || _startedRuns < 0 || repeat == null) {
      return;
    }

    if (_pass > _passesOf(repeat) || (_pass == _passesOf(repeat) && _finishedAfter(before))) {
      if (_controller.isAnimating) {
        _controller.stop();
      }

      _pass = _passesOf(repeat);
      _setValue(_endOf(repeat));
    }
  }

  /// Measures a wait that is under way against a new `delay`, from when the
  /// wait began, as a keyframe measures a new `animation-delay`.
  void _redate(Duration before) {
    final bool running = _waiting != null;

    if (!running && _delayLeft == Duration.zero) {
      return;
    }

    _holdDelay();

    final Duration left = widget.settings.delay - (before - _delayLeft);

    if (running) {
      _startAfter(left);
    } else {
      _delayLeft = left > Duration.zero ? left : Duration.zero;
    }
  }

  /// Holds a wait that is still running, keeping what is left of it.
  void _holdDelay() {
    final Timer? waiting = _waiting;

    if (waiting == null) {
      return;
    }

    waiting.cancel();
    _waiting = null;

    final Duration gone = mpAnimationNow() - _waitingFrom;

    _delayLeft = _delayLeft > gone ? _delayLeft - gone : Duration.zero;
  }

  @override
  Widget build(BuildContext context) {
    final bool still = mpReducedMotion(context);

    if (still != _still) {
      if (still) {
        _halt();
      } else {
        // Given back: whatever the gate has let go starts from its first
        // frame, which the builder below draws on this very build.
        _startedRuns = -1;
        _drawnRuns = -1;
      }

      _still = still;
    }

    return MPAnimateGate(
      // Told nothing of `paused`, so what it hands over is whether the trigger
      // has let the run go. `_drive` reads the pause itself, because a pause
      // holds the frame the run is on.
      settings: widget.settings.withoutPause,
      child: widget.child,
      builder: (BuildContext context, bool running, int runs, bool resting, Widget? child) {
        final bool started = running || resting;

        // A run the trigger has just let go, or started again, is drawn on its
        // first frame by this build rather than the next, held or not — the
        // rewind the React build makes before the paint.
        if (started && runs != _drawnRuns && !still) {
          _drawnRuns = runs;
          _setValue(0);
        }

        // After the frame rather than during it, because starting a controller
        // inside a build is a build that schedules a build.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _drive(started, runs, resting: resting);
          }
        });

        // Through the same builder whether the platform asks for less movement
        // or not, so the tree above what the effect holds keeps its shape when
        // the setting changes and nothing inside loses its state.
        return AnimatedBuilder(
          animation: _controller,
          child: child,
          builder: (BuildContext context, Widget? inner) {
            if (still) {
              return widget.frame(context, 1, inner!);
            }

            final double value = _controller.value.clamp(0.0, 1.0);
            final double directed = widget.mode == MPAnimateMode.exit ? 1 - value : value;

            return widget.frame(context, widget.settings.curve.transform(directed), inner!);
          },
        );
      },
    );
  }
}

/* ---------------------------------------------------------------------------
 * One effect, on the box or across a set
 * ------------------------------------------------------------------------- */

/// One effect, played on the box or spread across a set.
///
/// The entrances, the pulse and the drift differ only in their defaults and in
/// what one frame draws, so this is where the identical two-thirds of each of
/// them lives.
///
/// ## The box, or each child
///
/// With a [child], or with [children] and no [stagger], the box animates: the
/// children are laid out by [layoutBuilder] and the effect is drawn once around
/// all of them.
///
/// With [children] and a [stagger] the effect moves **off the box and onto each
/// child**, held back by its position, and the box itself animates nothing:
/// eight children fading in under a box that is also fading in is the same
/// content faded twice. The trigger belongs to the set — one gate above every
/// child, rather than one per child each deciding for itself when it is on
/// screen — and `paused` reaches every child at once.
///
/// [spread] makes it per child at any stagger, `0` included, for
/// `MPAnimateAppear`, which has no box animation to fall back to.
class MPAnimateEffect extends StatelessWidget {
  /// Creates an effect.
  const MPAnimateEffect({
    required this.settings,
    required this.frame,
    this.mode = MPAnimateMode.enter,
    this.child,
    this.children,
    this.layoutBuilder,
    this.stagger = Duration.zero,
    this.durationStep = Duration.zero,
    this.reverse = false,
    this.spread = false,
    super.key,
  });

  /// When to run, how long, how often: for the box, or for the first child.
  final MPAnimateSettings settings;

  /// Draws one frame around one subject.
  final MPAnimateFrameBuilder frame;

  /// Whether the effect brings its content in or takes it away.
  final MPAnimateMode mode;

  /// The one subject.
  final Widget? child;

  /// A set of subjects.
  final List<Widget>? children;

  /// Lays out [children]. A column of them when nobody said.
  final MPAnimateLayoutBuilder? layoutBuilder;

  /// How much later each child starts than the one before it.
  final Duration stagger;

  /// How much longer each child runs than the one before it. Negative
  /// shortens, never below nothing.
  final Duration durationStep;

  /// Runs the set from the last child to the first. Only the order turns
  /// round; each child still plays forwards.
  final bool reverse;

  /// Whether the effect is per child at any [stagger].
  final bool spread;

  @override
  Widget build(BuildContext context) {
    final List<Widget>? set = children;
    final MPAnimateLayoutBuilder layout = layoutBuilder ?? mpColumnLayout;

    if (set != null && (spread || stagger > Duration.zero)) {
      return _spreadAcross(set, layout);
    }

    return MPAnimateRun(
      settings: settings,
      mode: mode,
      frame: frame,
      child:
          child ??
          Builder(builder: (BuildContext context) => layout(context, set ?? const <Widget>[])),
    );
  }

  Widget _spreadAcross(List<Widget> set, MPAnimateLayoutBuilder layout) {
    final int count = set.length;

    return MPAnimateGate(
      settings: MPAnimateSettings(
        duration: settings.duration,
        repeat: settings.repeat,
        trigger: settings.trigger,
        play: settings.play,
        once: settings.once,
        threshold: settings.threshold,
        // The set rests off screen as one, measured on the box that holds it,
        // which stays where it is while the children move. Not while it is
        // paused, which already holds every child still.
        endless: settings.infinite && !settings.paused,
      ),
      builder: (BuildContext context, bool running, int runs, bool resting, Widget? _) {
        return layout(context, <Widget>[
          for (int index = 0; index < count; index += 1)
            MPAnimateRun(
              // The child's own key, so a child moved within the set keeps its
              // run as well as its state.
              key: set[index].key == null ? null : ValueKey<Key>(set[index].key!),
              mode: mode,
              settings: MPAnimateSettings(
                duration: mpStepped(settings.duration, durationStep * _step(index, count)),
                delay: settings.delay + stagger * _step(index, count),
                curve: settings.curve,
                repeat: settings.repeat,
                alternate: settings.alternate,
                // Resting holds each child where it is, as a pause does.
                paused: settings.paused || resting,
                // The set has already decided; each child is only told.
                trigger: MPAnimateTrigger.manual,
                play: running || resting,
                replay: runs,
                // The set's gate watches the screen for all of them.
                endless: false,
              ),
              frame: frame,
              child: set[index],
            ),
        ]);
      },
    );
  }

  /// How many steps into the set [index] is: from the start, or from the end
  /// when the set is reversed.
  int _step(int index, int count) => reverse ? count - 1 - index : index;
}

/* ---------------------------------------------------------------------------
 * Opacity without a layer at rest
 * ------------------------------------------------------------------------- */

/// Paints [child] at [opacity], and straight onto the canvas at full strength.
///
/// An [Opacity] adds a layer at an opacity of 1 as well, and an entrance that
/// has arrived sits at 1 for the rest of the page's life — a layer kept for
/// nothing. Taking the wrapper out at rest is worse, because that changes the
/// shape of the tree above what it holds, which Flutter builds again from
/// scratch. This keeps the shape and pays for a layer only while there is
/// something to fade.
///
/// At an opacity of 0 it paints nothing, and what it holds is still laid out,
/// still hit and still read out, as CSS `opacity: 0` leaves an element: an
/// entrance waiting for its trigger is in the semantics from the first frame.
class MPAnimateOpacity extends SingleChildRenderObjectWidget {
  /// Paints [child] at [opacity].
  const MPAnimateOpacity({required this.opacity, super.child, super.key})
    : assert(opacity >= 0 && opacity <= 1);

  /// How opaque [child] is, from 0 to 1.
  final double opacity;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderAnimateOpacity(opacity);

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderAnimateOpacity).opacity = opacity;
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(DoubleProperty('opacity', opacity, defaultValue: 1.0));
  }
}

class _RenderAnimateOpacity extends RenderProxyBox {
  _RenderAnimateOpacity(double opacity) : _alpha = ui.Color.getAlphaFromOpacity(opacity);

  int _alpha;

  set opacity(double value) {
    final int alpha = ui.Color.getAlphaFromOpacity(value);

    if (alpha == _alpha) {
      return;
    }

    final bool composited = alwaysNeedsCompositing;

    _alpha = alpha;

    if (composited != alwaysNeedsCompositing) {
      markNeedsCompositingBitsUpdate();
    }

    markNeedsPaint();
  }

  @override
  bool get alwaysNeedsCompositing => child != null && _alpha != 0 && _alpha != 255;

  @override
  bool paintsChild(RenderBox child) => _alpha != 0;

  @override
  void paint(PaintingContext context, Offset offset) {
    final RenderBox? held = child;

    if (held == null || _alpha == 0) {
      layer = null;

      return;
    }

    if (_alpha == 255) {
      layer = null;
      context.paintChild(held, offset);

      return;
    }

    layer = context.pushOpacity(
      offset,
      _alpha,
      super.paint,
      oldLayer: layer is OpacityLayer ? layer! as OpacityLayer : null,
    );
  }
}
