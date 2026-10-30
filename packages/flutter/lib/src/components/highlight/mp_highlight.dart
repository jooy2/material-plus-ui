/// Marks the words a reader is looking for, inside text they were already
/// reading.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/typography/mp_typography.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much surface an [MPHighlight]'s mark paints: [MPVariant] without
/// `elevated`, because a word lifted off the line on a shadow is a word that
/// no longer sits in its sentence.
enum MPHighlightVariant {
  /// The accent proper under its own ink. Loud, and right for one match on a
  /// screen.
  filled,

  /// The container tone under its `on` ink, and the default: a pale wash under
  /// dark ink is a highlighter pen, a marked word rather than a word replaced by
  /// a block of colour.
  tonal,

  /// Boxes the word in the accent.
  outlined,

  /// Recolours the word and draws nothing behind it.
  text,
}

/// Letters, digits and underscores in any script: what `wholeWord` counts.
final RegExp _wordCharacter = RegExp(r'[\p{L}\p{N}_]', unicode: true);

/// A hair of room either side of the word, painted outside the word's own box
/// so the marked line is exactly as long as it was. A mark must not move the
/// text around it.
const double _bleed = 2;

/// Marks the words a reader is looking for, inside text they were already
/// reading.
///
/// ```dart
/// MPHighlight(passage, query: search.text)
/// ```
///
/// The widget is the search, not just the styling: [query] is what a search
/// box holds, and how the matching is done (case, whole words, a regular
/// expression) is a parameter rather than something a caller pre-computes into
/// a list of offsets. Nothing here is stateful, so it marks again the moment
/// the query changes.
///
/// There is no `size`. A mark sits inside running text and has to be the size
/// of the text it is inside.
class MPHighlight extends StatelessWidget {
  /// Creates highlighted text.
  const MPHighlight(
    this.text, {
    required this.query,
    this.variant = MPHighlightVariant.tonal,
    this.color = MPColor.tertiary,
    this.caseSensitive = false,
    this.wholeWord = false,
    this.underline = false,
    this.weight,
    this.style,
    this.align,
    this.lines,
    super.key,
  }) : assert(
         query is String || query is List<String> || query is RegExp,
         'MPHighlight.query must be a String, a List<String> or a RegExp',
       );

  /// The text to search.
  final String text;

  /// What to find.
  ///
  /// A [String] is one term and a `List<String>` several, tried longest first,
  /// so `['data', 'database']` marks the whole word rather than its first four
  /// letters. Terms are escaped, so a search box's contents are safe to pass
  /// straight through. A [RegExp] is used as written, and [caseSensitive] and
  /// [wholeWord] are ignored for it, because an expression says both itself.
  /// Building one out of text somebody else typed is a denial of service
  /// waiting for the input that backtracks; pass that as a string term instead.
  final Object query;

  /// How much surface the mark paints.
  final MPHighlightVariant variant;

  /// Which accent family the mark reads.
  ///
  /// **[MPColor.tertiary] rather than primary**, the one place in the library
  /// where that is the right default. Primary is what a screen uses for the
  /// thing it wants pressed; a search match is not that, and marked words the
  /// colour of the buttons are two things competing to be the loudest.
  final MPColor color;

  /// Whether `a` and `A` are different letters.
  final bool caseSensitive;

  /// Whether a term has to be a word on its own: `cat` marking "cat" but not
  /// "concatenate".
  ///
  /// A word is a run of letters, digits and underscores in any script, so it
  /// means what it should for `café`. It means very little for Korean or
  /// Japanese, where a phrase is not delimited by spaces, which is why it is
  /// off by default.
  final bool wholeWord;

  /// Underlines the mark as well. Combines with every variant.
  final bool underline;

  /// Sets the mark's weight. Left out, the mark is the weight of the text
  /// around it: the surface already says "this one", and a bolded word inside a
  /// sentence changes the rhythm of the whole line.
  final MPTypographyWeight? weight;

  /// The text's style, merged over the surrounding [DefaultTextStyle].
  final TextStyle? style;

  /// How the text is set against its measure.
  final TextAlign? align;

  /// Cuts the text at this many lines with an ellipsis.
  final int? lines;

  /// [query] as one expression, or `null` when there is nothing to look for:
  /// an empty search box leaves the text exactly as it was.
  RegExp? get _pattern {
    final Object raw = query;

    if (raw is RegExp) {
      return raw;
    }

    final List<String> terms =
        <String>[
            for (final String term in raw is List<String> ? raw : <String>[raw as String])
              term.trim(),
          ]
          ..removeWhere((String term) => term.isEmpty)
          // Longest first, because alternation is first-match-wins.
          ..sort((String a, String b) => b.length.compareTo(a.length));

    if (terms.isEmpty) {
      return null;
    }

    return RegExp(terms.map(RegExp.escape).join('|'), caseSensitive: caseSensitive, unicode: true);
  }

  bool _isWholeWord(int start, int end) {
    final String before = start > 0 ? text[start - 1] : '';
    final String after = end < text.length ? text[end] : '';

    return !_wordCharacter.hasMatch(before) && !_wordCharacter.hasMatch(after);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPAccent accent = theme.colors.accent(color);
    final TextStyle base = DefaultTextStyle.of(context).style.merge(style);
    final RegExp? pattern = _pattern;
    final List<InlineSpan> spans = <InlineSpan>[];
    int cursor = 0;

    if (pattern != null) {
      for (final RegExpMatch match in pattern.allMatches(text)) {
        // A pattern that can match nothing, `x*`, has nothing to mark, and a
        // match inside a run a longer one already took is skipped.
        if (match.end == match.start || match.start < cursor) {
          continue;
        }

        if (query is! RegExp && wholeWord && !_isWholeWord(match.start, match.end)) {
          continue;
        }

        if (match.start > cursor) {
          spans.add(TextSpan(text: text.substring(cursor, match.start)));
        }

        spans.add(_mark(match.group(0)!, base, accent, theme.shapes.extraSmall));
        cursor = match.end;
      }
    }

    if (spans.isEmpty) {
      return Text(
        text,
        style: style,
        textAlign: align,
        maxLines: lines,
        overflow: lines == null ? null : TextOverflow.ellipsis,
      );
    }

    if (cursor < text.length) {
      spans.add(TextSpan(text: text.substring(cursor)));
    }

    return Text.rich(
      TextSpan(style: style, children: spans),
      textAlign: align,
      maxLines: lines,
      overflow: lines == null ? null : TextOverflow.ellipsis,
      // The marks are widgets, so their words would otherwise reach a screen
      // reader as placeholders between the plain runs. The whole string, said
      // once, is what was being read.
      semanticsLabel: text,
    );
  }

  InlineSpan _mark(String matched, TextStyle base, MPAccent accent, double radius) {
    final Color ink = variant == MPHighlightVariant.filled
        ? accent.onColor
        : variant == MPHighlightVariant.tonal
        ? accent.onContainer
        : accent.color;
    final Color fill = variant == MPHighlightVariant.filled
        ? accent.color
        : variant == MPHighlightVariant.tonal
        ? accent.container
        : const Color(0x00000000);

    return WidgetSpan(
      alignment: PlaceholderAlignment.baseline,
      baseline: TextBaseline.alphabetic,
      child: CustomPaint(
        painter: _MarkPainter(
          fill: fill,
          radius: radius,
          border: variant == MPHighlightVariant.outlined ? accent.color : null,
        ),
        child: Text(
          matched,
          // The paragraph already scales the widgets inside it by the reader's
          // text size, so a scale here as well would draw the mark twice over.
          textScaler: TextScaler.noScaling,
          style: base.copyWith(
            color: ink,
            fontWeight: weight == null ? null : _weights[weight],
            decoration: underline ? TextDecoration.underline : null,
            // Under the descenders rather than through them, which is the whole
            // difference between an underline and a strikethrough that missed.
            decorationThickness: underline ? 2 : null,
            decorationColor: underline ? ink : null,
          ),
        ),
      ),
    );
  }
}

const Map<MPTypographyWeight, FontWeight> _weights = <MPTypographyWeight, FontWeight>{
  MPTypographyWeight.regular: FontWeight.w400,
  MPTypographyWeight.medium: FontWeight.w500,
  MPTypographyWeight.semibold: FontWeight.w600,
  MPTypographyWeight.bold: FontWeight.w700,
};

/// The mark's surface: the theme's `extraSmall` corner, painted [_bleed] past the word on
/// either side so the word itself keeps its width.
class _MarkPainter extends CustomPainter {
  const _MarkPainter({required this.fill, required this.radius, this.border});

  final Color fill;
  final double radius;
  final Color? border;

  @override
  void paint(Canvas canvas, Size size) {
    final RRect box = RRect.fromRectAndRadius(
      Rect.fromLTRB(-_bleed, 0, size.width + _bleed, size.height),
      Radius.circular(radius),
    );

    if (fill.a > 0) {
      canvas.drawRRect(box, Paint()..color = fill);
    }

    if (border != null) {
      canvas.drawRRect(
        box.deflate(0.5),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1
          ..color = border!,
      );
    }
  }

  @override
  bool shouldRepaint(_MarkPainter oldDelegate) {
    return oldDelegate.fill != fill || oldDelegate.radius != radius || oldDelegate.border != border;
  }
}
