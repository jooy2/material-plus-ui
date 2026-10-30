/// Text settling out of noise.
library;

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

/// What an unsettled character is drawn as when nobody said.
///
/// Latin upper case, digits and a few marks: one width apart in most faces and,
/// more to the point, visibly not words. A noise alphabet with lower case in it
/// would spend half the effect looking like text that had been misspelled
/// rather than like text that has not arrived.
const String _noise = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@\$?!';

/// Text settling out of noise.
///
/// ```dart
/// const MPAnimateScramble(text: 'ACCESS GRANTED')
/// ```
///
/// `MPAnimateTyping`'s sibling, and the difference is what the box does. A
/// typewriter's line grows a character at a time; this one is **its finished
/// length from the first frame** and only the characters inside it change,
/// settling from the first to the last. That is why it is the one to reach for
/// in a heading, a table cell or anything else with something beside it.
///
/// Before it is triggered it shows its own first frame, which for this effect
/// is the line fully scrambled. Not the answer: a heading that has already
/// resolved while it waits to be scrolled to has given away the thing it was
/// about to do. The waiting noise is fixed rather than churning.
///
/// ## What a screen reader gets
///
/// The finished line, once. The settling copy is left out of the semantics:
/// noise read out character by character is not text.
///
/// When the platform has animations turned off the line is simply there,
/// finished, from the first frame — the state rather than the animation,
/// because an effect stopped at the wrong end would leave a heading
/// permanently unreadable.
class MPAnimateScramble extends StatelessWidget {
  /// Creates a line that settles out of noise into [text].
  const MPAnimateScramble({
    required this.text,
    this.style,
    this.duration = const Duration(milliseconds: 1200),
    this.spread = 0.4,
    this.tick = const Duration(milliseconds: 50),
    this.characters = _noise,
    this.delay = Duration.zero,
    this.repeat = 1,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// The line to settle.
  final String text;

  /// The text style, merged over the inherited one. The figures are set on one
  /// width whatever it says, because the noise has digits in it and a
  /// proportional `1` is narrower than the letter it stands in for.
  final TextStyle? style;

  /// How long the whole line takes to settle.
  final Duration duration;

  /// How much of [duration] each character spends unsettled, as a share of the
  /// whole. At `1` the last character is still noise when the first has been
  /// still for the entire run; low values make the line resolve almost at once.
  final double spread;

  /// How often an unsettled character is replaced. Below about 30ms the noise
  /// stops reading as characters and starts reading as flicker.
  final Duration tick;

  /// The alphabet the noise is drawn from.
  final String characters;

  /// How long before it starts.
  final Duration delay;

  /// How many times it settles. `null` never stops.
  final MPAnimateRepeat repeat;

  /// Holds the line where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` scrambles it again.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it runs again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the line has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    // Cut by grapheme, what a reader counts as one character: an emoji, a
    // flag, a letter with its accent. Cut by code unit, an emoji would be two
    // broken glyphs.
    final List<String> graphemes = text.characters.toList();
    final List<String> alphabet = characters.characters.toList();
    final TextStyle figures = const TextStyle(
      fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
    ).merge(style);

    return Semantics(
      // The line, once. What is drawn is left out below.
      label: text,
      excludeSemantics: true,
      child: MPAnimateRun(
        settings: MPAnimateSettings(
          duration: duration,
          delay: delay,
          // The settling is spread over the line by position rather than eased.
          curve: Curves.linear,
          repeat: repeat,
          paused: paused,
          trigger: trigger,
          play: play,
          once: once,
          threshold: threshold,
        ),
        frame: (BuildContext context, double t, Widget inner) {
          final String shown = t >= 1
              ? text
              : _scrambled(graphemes, alphabet, t, duration, tick, spread);

          return Text(shown, style: figures);
        },
        child: const SizedBox.shrink(),
      ),
    );
  }
}

/// The line at [progress] through its settling.
///
/// A character settles once the progress has passed its share of the run:
/// [spread] is how much of the run is spent on the difference between the
/// first character and the last, so at `0` they all settle together.
///
/// The noise is drawn from the position and the beat rather than from a random
/// source, so a line that is held or waiting is stable rather than churning,
/// and a rebuild for any other reason cannot make the characters jump.
String _scrambled(
  List<String> graphemes,
  List<String> alphabet,
  double progress,
  Duration duration,
  Duration tick,
  double spread,
) {
  if (alphabet.isEmpty) {
    return graphemes.join();
  }

  final double share = spread.clamp(0.0, 1.0);
  final int beat = (progress * duration.inMicroseconds / tick.inMicroseconds.clamp(1, 1 << 40))
      .floor();
  final StringBuffer out = StringBuffer();

  for (int index = 0; index < graphemes.length; index += 1) {
    final double place = graphemes.length > 1 ? index / (graphemes.length - 1) : 0;

    if (progress >= place * share + (1 - share)) {
      out.write(graphemes[index]);
    } else {
      out.write(alphabet[(index * 2654435761 + beat * 40503) % alphabet.length]);
    }
  }

  return out.toString();
}
