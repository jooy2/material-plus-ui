/// Text appearing one character at a time.
library;

import 'dart:async';

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/animate.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// How long the caret takes to blink once.
const Duration _caretPeriod = Duration(seconds: 1);

/// Text appearing one character at a time.
///
/// ```dart
/// const MPAnimateTyping(text: 'anything you can name')
/// ```
///
/// The whole string is in the semantics from the first frame, and a screen
/// reader reads it once rather than sitting through the performance; what
/// types is a copy left out of the semantics. The box is laid out for the
/// finished string from the first frame too, so nothing around it moves as the
/// characters arrive.
///
/// [repeat], [hold] and [erase] are what make it a loop: type, hold, delete,
/// type again. Without [erase] a repeat clears in one frame, which is right for
/// a line that is being replaced rather than rewritten.
///
/// Waiting for its trigger it is empty, not finished: a typewriter that showed
/// its whole string until it was scrolled to and then blanked would be worse
/// than no effect at all. When the platform has animations turned off the text
/// is simply there and the caret holds still.
class MPAnimateTyping extends StatelessWidget {
  /// Creates a line that types out [text].
  const MPAnimateTyping({
    required this.text,
    this.style,
    this.speed = 24,
    this.hold = const Duration(milliseconds: 1400),
    this.erase = false,
    this.eraseSpeed,
    this.caret = true,
    this.caretChar = '|',
    this.duration,
    this.delay = Duration.zero,
    this.repeat = 1,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// The text to type.
  final String text;

  /// The text style, merged over the inherited one.
  final TextStyle? style;

  /// How fast it is typed, in characters per second. [duration] overrides it.
  final double speed;

  /// How long the finished text is held before it repeats.
  final Duration hold;

  /// Deletes the text again before repeating, rather than clearing it in one
  /// frame. Only means anything when [repeat] is more than once.
  final bool erase;

  /// How fast it is deleted, in characters per second. Left out, twice
  /// [speed], which is what a person actually does.
  final double? eraseSpeed;

  /// Whether the caret is drawn after the text.
  final bool caret;

  /// What the caret is drawn as.
  final String caretChar;

  /// How long the whole string takes to type. Left out, [speed] decides, so a
  /// long paragraph and a short one are typed at the same pace rather than in
  /// the same time.
  final Duration? duration;

  /// How long before the first character.
  final Duration delay;

  /// How many times it is typed. `null` never stops.
  final MPAnimateRepeat repeat;

  /// Holds the typing where it is. Letting go goes on from the next character.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` types it again from the start.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it types again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the line has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // The whole string, once. What types is left out below.
      label: text,
      excludeSemantics: true,
      child: MPAnimateGate(
        settings: MPAnimateSettings(
          duration: duration ?? _caretPeriod,
          repeat: repeat,
          trigger: trigger,
          play: play,
          once: once,
          threshold: threshold,
          endless: repeat == null && !paused,
        ),
        builder: (BuildContext context, bool running, int runs, bool resting, Widget? _) {
          return _Typewriter(
            started: running || resting,
            held: paused || resting,
            runs: runs,
            text: text,
            style: style,
            speed: speed,
            hold: hold,
            erase: erase,
            eraseSpeed: eraseSpeed,
            caret: caret,
            caretChar: caretChar,
            duration: duration,
            delay: delay,
            repeat: repeat,
          );
        },
      ),
    );
  }
}

class _Typewriter extends StatefulWidget {
  const _Typewriter({
    required this.started,
    required this.held,
    required this.runs,
    required this.text,
    required this.style,
    required this.speed,
    required this.hold,
    required this.erase,
    required this.eraseSpeed,
    required this.caret,
    required this.caretChar,
    required this.duration,
    required this.delay,
    required this.repeat,
  });

  /// Whether the trigger has let the typing go.
  final bool started;

  /// Whether a pause, or resting off screen, holds it where it is.
  final bool held;

  /// How many times the trigger has let it go. A new number types it again.
  final int runs;

  final String text;
  final TextStyle? style;
  final double speed;
  final Duration hold;
  final bool erase;
  final double? eraseSpeed;
  final bool caret;
  final String caretChar;
  final Duration? duration;
  final Duration delay;
  final int? repeat;

  @override
  State<_Typewriter> createState() => _TypewriterState();
}

class _TypewriterState extends State<_Typewriter> {
  late List<String> _graphemes = widget.text.characters.toList();

  /// How many characters are showing.
  int _shown = 0;

  /// Which pass of the string this is, counting from one.
  int _pass = 1;

  bool _deleting = false;
  bool _holding = false;

  /// The next step, held so a pause or a disposal can call it off.
  Timer? _next;

  /// The run of the gate the typing is on, or `-1` for none.
  int _drivenRun = -1;

  bool _still = false;

  Duration get _typeDelay {
    final Duration? whole = widget.duration;

    if (whole != null && _graphemes.isNotEmpty) {
      return Duration(microseconds: whole.inMicroseconds ~/ _graphemes.length);
    }

    return Duration(microseconds: (1000000 / (widget.speed < 1 ? 1 : widget.speed)).round());
  }

  Duration get _deleteDelay {
    final double rate = widget.eraseSpeed ?? widget.speed * 2;

    return Duration(microseconds: (1000000 / (rate < 1 ? 1 : rate)).round());
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _drive());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final bool still = mpReducedMotion(context);

    if (still != _still) {
      _still = still;
      // Given back, the typing starts again from the beginning, as a run the
      // stylesheet gives back does. After the frame, which this build draws
      // from `_still` alone.
      _drivenRun = -1;
      WidgetsBinding.instance.addPostFrameCallback((_) => _drive());
    }
  }

  @override
  void didUpdateWidget(_Typewriter oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A new string starts a new performance rather than continuing the last.
    if (oldWidget.text != widget.text) {
      _drivenRun = -1;
    }

    _drive();
  }

  @override
  void dispose() {
    _next?.cancel();
    super.dispose();
  }

  void _drive() {
    if (!mounted) {
      return;
    }

    if (_still || !widget.started) {
      _next?.cancel();
      _next = null;
      _drivenRun = -1;

      // Not "nothing happens" under reduced motion: the text is simply there,
      // which the build draws from `_still` alone. Waiting, it is empty.
      if (_still) {
        _shown = 0;
      } else if (_shown != 0) {
        setState(() => _shown = 0);
      }

      return;
    }

    if (widget.held) {
      _next?.cancel();
      _next = null;

      return;
    }

    if (_drivenRun == widget.runs) {
      // Already typing, or going on from where a pause left it.
      if (_next != null || _graphemes.isEmpty) {
        return;
      }

      if (_holding) {
        _wait(widget.hold, _endHold);
      } else if (_shown >= _graphemes.length && !_deleting) {
        _finish();
      } else if (_shown == 0 && _pass == 1) {
        // Held before the first character: the delay is waited out again.
        _wait(widget.delay, _tick);
      } else {
        // Resuming picks up at the next character.
        _wait(_deleting ? _deleteDelay : _typeDelay, _tick);
      }

      return;
    }

    _drivenRun = widget.runs;
    _graphemes = widget.text.characters.toList();
    _pass = 1;
    _deleting = false;
    _holding = false;
    _next?.cancel();
    _next = null;

    if (_shown != 0) {
      setState(() => _shown = 0);
    }

    if (_graphemes.isNotEmpty) {
      _wait(widget.delay, _tick);
    }
  }

  void _wait(Duration wait, VoidCallback next) {
    _next?.cancel();
    _next = Timer(wait, () {
      _next = null;

      if (mounted) {
        next();
      }
    });
  }

  void _tick() {
    if (_deleting) {
      setState(() => _shown -= 1);

      if (_shown <= 0) {
        _deleting = false;
        _pass += 1;
      }

      _wait(_deleting ? _deleteDelay : _typeDelay, _tick);

      return;
    }

    setState(() => _shown += 1);

    if (_shown < _graphemes.length) {
      _wait(_typeDelay, _tick);

      return;
    }

    _finish();
  }

  void _finish() {
    final int? repeat = widget.repeat;

    if (repeat != null && _pass >= repeat) {
      return;
    }

    _holding = true;
    _wait(widget.hold, _endHold);
  }

  void _endHold() {
    _holding = false;

    if (widget.erase) {
      _deleting = true;
      _tick();

      return;
    }

    _pass += 1;
    setState(() => _shown = 0);
    _wait(_typeDelay, _tick);
  }

  @override
  Widget build(BuildContext context) {
    final String typed = _still ? widget.text : _graphemes.take(_shown).join();
    final String caret = widget.caret ? widget.caretChar : '';

    return Stack(
      alignment: AlignmentDirectional.topStart,
      children: <Widget>[
        // The finished string, laid out and never drawn, so the box is its
        // final size from the first frame and nothing around it moves.
        Visibility(
          visible: false,
          maintainSize: true,
          maintainAnimation: true,
          maintainState: true,
          child: Text('${widget.text}$caret', style: widget.style),
        ),
        Text.rich(
          TextSpan(
            children: <InlineSpan>[
              TextSpan(text: typed),
              if (widget.caret)
                WidgetSpan(
                  alignment: PlaceholderAlignment.baseline,
                  baseline: TextBaseline.alphabetic,
                  child: _Caret(char: widget.caretChar, style: widget.style),
                ),
            ],
          ),
          style: widget.style,
        ),
      ],
    );
  }
}

/// The caret, blinking on a hard cut: on for a little over half the period,
/// off for the rest. A caret that eases looks like one being drawn slowly.
class _Caret extends StatelessWidget {
  const _Caret({required this.char, required this.style});

  final String char;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return MPAnimateRun(
      settings: const MPAnimateSettings(duration: _caretPeriod, repeat: null),
      frame: (BuildContext context, double t, Widget inner) {
        // Still under reduced motion: the whole string is already there, and a
        // caret blinking after text nobody is typing says something false.
        final bool on = mpReducedMotion(context) || t < 0.55;

        return MPAnimateOpacity(opacity: on ? 1 : 0, child: inner);
      },
      child: Text(char, style: style),
    );
  }
}
