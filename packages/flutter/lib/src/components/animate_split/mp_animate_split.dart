/// A line arriving a word or a character at a time.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/internal/scramble.dart' show splitParts;
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// What a line is cut into before it is animated.
enum MPAnimateSplitBy {
  /// Each word, with the space after it, is one piece.
  word,

  /// Each character is one piece, kept inside its word.
  character,
}

/// A line arriving a word or a character at a time.
///
/// ```dart
/// const MPAnimateSplit(text: 'What we shipped this quarter')
/// ```
///
/// `MPAnimateAppear` for a string: the same settling and the same stagger, over
/// the pieces of a sentence rather than over children a caller wrote out.
///
/// ## The pieces are cut where a reader would cut them
///
/// A character is a grapheme, so an emoji or a letter with its accent is one
/// piece rather than two broken glyphs. Words are cut at spaces, and a space
/// stays on the word before it, so the line still reads as it was written.
///
/// ## Characters stay inside their words
///
/// By [MPAnimateSplitBy.character], each word is still the thing that does not
/// break: the line wraps between words, never in the middle of one. A script
/// written without spaces — Chinese, Japanese, Thai — wraps between any two of
/// its characters, as its own running text does.
///
/// ## What a screen reader gets
///
/// The whole line, once. Without that, a line cut into characters would be
/// read out as a list of letters, and a reader who cannot see the effect would
/// sit through the performance to find out what the sentence said.
class MPAnimateSplit extends StatelessWidget {
  /// Creates a line that arrives a piece at a time.
  const MPAnimateSplit({
    required this.text,
    this.by = MPAnimateSplitBy.word,
    this.style,
    this.textAlign = TextAlign.start,
    this.stagger = const Duration(milliseconds: 40),
    this.durationStep = Duration.zero,
    this.reverse = false,
    this.from = MPSide.bottom,
    this.distance = 8,
    this.fade = true,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.repeat = 1,
    this.alternate = false,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// The line to split.
  final String text;

  /// Whether each piece is a word or a character.
  final MPAnimateSplitBy by;

  /// The text style, merged over the inherited one.
  final TextStyle? style;

  /// How the lines of a line that wraps sit across the width.
  final TextAlign textAlign;

  /// How much later each piece starts than the one before it. This is the
  /// whole effect.
  ///
  /// The default is right for words. Characters want a good deal less: there
  /// are five or six times as many of them, and the same step turns a sentence
  /// into something that takes four seconds to finish arriving.
  final Duration stagger;

  /// How much longer each piece runs than the one before it. Negative shortens,
  /// never below nothing.
  final Duration durationStep;

  /// Runs the line from the last piece to the first. Each piece still plays
  /// forwards.
  final bool reverse;

  /// Which edge each piece drifts in from. Physical, as [MPSide] is everywhere
  /// in this library.
  final MPSide from;

  /// How far each piece travels, in logical pixels. Short on purpose: a long
  /// travel over forty pieces is a paragraph that is moving rather than a
  /// paragraph arriving.
  final double distance;

  /// Fades each piece in as it settles.
  final bool fade;

  /// How long one piece takes. Left out, MD3's `medium4`, as a slide takes.
  final Duration? duration;

  /// How long before the first piece starts.
  final Duration delay;

  /// Which Material curve each piece runs on. Left out, `emphasizedDecelerate`.
  final MPEasing? easing;

  /// How many times it runs. `null` never stops.
  final MPAnimateRepeat repeat;

  /// Runs every other pass backwards, so a repeat returns instead of jumping.
  final bool alternate;

  /// Holds the whole line where it is.
  final bool paused;

  /// What starts it. The trigger belongs to the line, not to each piece.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` starts it over.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it runs again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the line has to be on screen
  /// before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    final List<List<List<String>>> words = <List<List<String>>>[
      for (final String word in splitParts(text, byCharacter: false))
        by == MPAnimateSplitBy.character
            ? _runsOf(word)
            : <List<String>>[
                <String>[word],
              ],
    ];
    final int count = <int>[
      for (final List<List<String>> word in words)
        for (final List<String> run in word) run.length,
    ].fold(0, (int total, int length) => total + length);
    final WrapAlignment alignment = switch (textAlign) {
      TextAlign.center => WrapAlignment.center,
      TextAlign.right || TextAlign.end => WrapAlignment.end,
      _ => WrapAlignment.start,
    };
    final ({Offset fraction, Offset pixels}) start = mpSlideOffset(from, distance);
    final Duration length = duration ?? MPAnimation.slide.durationFor(MPAnimateMode.enter);
    final Curve curve = (easing ?? MPAnimation.slide.easing).curve;

    return Semantics(
      // The line, once, rather than one announcement per piece.
      label: text,
      excludeSemantics: true,
      child: MPAnimateGate(
        settings: MPAnimateSettings(
          duration: length,
          repeat: repeat,
          trigger: trigger,
          play: play,
          once: once,
          threshold: threshold,
          endless: repeat == null && !paused,
        ),
        builder: (BuildContext context, bool running, int runs, bool resting, Widget? _) {
          // The step counts across the whole line rather than within a word,
          // so the first character of a word follows the last of the one
          // before it.
          int index = 0;

          Widget piece(String part) {
            final int step = reverse ? count - 1 - index : index;

            index += 1;

            return MPAnimateRun(
              settings: MPAnimateSettings(
                duration: mpStepped(length, durationStep * step),
                delay: delay + stagger * step,
                curve: curve,
                repeat: repeat,
                alternate: alternate,
                paused: paused || resting,
                // The line has already decided; each piece is only told.
                trigger: MPAnimateTrigger.manual,
                play: running || resting,
                replay: runs,
                endless: false,
              ),
              frame: (BuildContext context, double t, Widget inner) {
                return MPAnimateOpacity(
                  opacity: fade ? t.clamp(0.0, 1.0) : 1,
                  child: Transform.translate(offset: start.pixels * (1 - t), child: inner),
                );
              },
              child: Text(part, style: style),
            );
          }

          return Wrap(
            alignment: alignment,
            children: <Widget>[
              for (final List<List<String>> word in words)
                for (final List<String> run in word)
                  // A word's characters in a run of their own, which is what
                  // keeps a line from wrapping in the middle of the word. A
                  // `Wrap` rather than a `Row`, so a word wider than the whole
                  // line still wraps, as the `Text` of a whole word does,
                  // instead of overflowing.
                  run.length == 1
                      ? piece(run.single)
                      : Wrap(
                          alignment: alignment,
                          children: <Widget>[for (final String part in run) piece(part)],
                        ),
            ],
          );
        },
      ),
    );
  }
}

/// A character of a script written without spaces between its words, such as
/// Chinese, Japanese or Thai. Running text in one of these may wrap between any
/// two characters, and so may a split line.
final RegExp _unspacedScript = RegExp(
  r'[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}'
  r'\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]',
  unicode: true,
);

/// A word cut by character, as the runs of its characters that stay on one
/// line together.
///
/// A character of a script written without spaces starts a run of its own, so
/// such a line still wraps between its characters. Anything else stays with
/// the character before it, which keeps a Latin or Hangul word whole and a
/// full stop beside the ideograph it closes.
List<List<String>> _runsOf(String word) {
  final List<List<String>> runs = <List<String>>[];

  for (final String character in splitParts(word, byCharacter: true)) {
    if (runs.isEmpty || _unspacedScript.hasMatch(character)) {
      runs.add(<String>[character]);
    } else {
      runs.last.add(character);
    }
  }

  return runs;
}
