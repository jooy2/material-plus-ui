/// The parts a checkbox, a switch and a radio share: the halo round the small
/// control, the label beside it and the line under the label.
///
/// The React package draws all three out of `MPStateLayer` with a `layer` of
/// its own, `Field.Label` and `MPSupportingText`. They are written once here
/// because the three controls have to agree about them: a column of checkboxes
/// and radios whose labels sit at two different heights, or whose error lines
/// are two different sizes, reads as two forms.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The halo's diameter: 32, 36, 40, 44, 48.
///
/// MD3 draws an 18dp box with a 40dp state layer centred on it, and the ladder
/// keeps that relationship rather than those numbers: every halo comes out a
/// little over twice its box.
const Map<MPSize, double> mpSelectionHalo = <MPSize, double>{
  MPSize.xs: 32,
  MPSize.sm: 36,
  MPSize.md: 40,
  MPSize.lg: 44,
  MPSize.xl: 48,
};

/// The gap between a small control and its label, `gap-3`.
const double mpSelectionGap = 12;

/// The label's line height, as a multiple of its size: the React label's
/// `leading-[1.4]`.
const double _labelLeading = 1.4;

/// MD3's state layer drawn as a circle round a control smaller than it.
///
/// The halo is bigger than the box it surrounds, so it cannot be an inset: it
/// is centred on [child] and overflows it in every direction, painted outside
/// the box's own bounds without taking any room. Nothing round the control is
/// moved by it.
class MPSelectionHalo extends StatelessWidget {
  /// Centres a halo [diameter] wide on [child].
  const MPSelectionHalo({
    required this.diameter,
    required this.color,
    required this.opacity,
    required this.child,
    super.key,
  });

  /// How wide the halo is.
  final double diameter;

  /// The ink: `onSurface` while the control is off, the accent once it is on.
  final Color color;

  /// How much of it, from `mpStateLayerOpacity`.
  final double opacity;

  /// The control the halo is round.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.center,
      children: <Widget>[
        // Under the control rather than over it. Over a ticked box the wash is
        // the accent on the accent and says nothing; what shows is the ring of
        // it outside the box, which is the same either way.
        Positioned.fill(
          child: OverflowBox(
            maxWidth: diameter,
            maxHeight: diameter,
            minWidth: diameter,
            minHeight: diameter,
            child: IgnorePointer(
              child: AnimatedContainer(
                duration: reduceMotion ? Duration.zero : MPMotion.short4,
                curve: MPMotion.standard,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withValues(alpha: opacity),
                ),
              ),
            ),
          ),
        ),
        child,
      ],
    );
  }
}

/// A small control and its words, side by side, the control centred on the
/// words' first line.
///
/// The words take what width is left and wrap inside it when the row has a
/// width to share. Put into something that does not bound it, such as another
/// `Row`, the row hugs its words instead, which a [Flexible] there would turn
/// into a layout error.
class MPSelectionRow extends StatelessWidget {
  /// Lays out [control] and [text].
  const MPSelectionRow({
    required this.control,
    required this.line,
    this.extent = 0,
    this.text,
    this.textFirst = false,
    this.fill = false,
    super.key,
  });

  /// The checkbox's box, the switch's track, the radio's ring.
  final Widget control;

  /// The height of the words' first line, which [control] is centred in.
  final double line;

  /// How tall [control] is, when it can be taller than [line]: a switch's
  /// track is 32px against a 24px line.
  ///
  /// The React build lets such a control overflow its one-line box. Here the
  /// box grows to hold it and the words move down by half the difference, so
  /// the first line is still centred on the control and the whole control can
  /// be pressed, which a part drawn outside its box could not be.
  final double extent;

  /// The words, or `null` for a control with none.
  final Widget? text;

  /// Puts the words before the control rather than after it.
  final bool textFirst;

  /// Stretches the row to its width, so the words take the slack and a
  /// control after them sits against the far edge.
  final bool fill;

  @override
  Widget build(BuildContext context) {
    final double height = extent > line ? extent : line;
    final Widget box = SizedBox(
      height: height,
      child: Center(child: control),
    );

    if (text == null) {
      return box;
    }

    final Widget aligned = height > line
        ? Padding(
            padding: EdgeInsets.only(top: (height - line) / 2),
            child: text,
          )
        : text!;

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final bool bounded = constraints.hasBoundedWidth;
        final Widget words = !bounded
            ? aligned
            : fill
            ? Expanded(child: aligned)
            : Flexible(child: aligned);

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: fill && bounded ? MainAxisSize.max : MainAxisSize.min,
          spacing: mpSelectionGap,
          children: textFirst ? <Widget>[words, box] : <Widget>[box, words],
        );
      },
    );
  }
}

/// The label and the line under it, beside a small control.
///
/// [label] is set in the prose role for [size] at a line height of 1.4, in
/// `onSurface`, or `onSurface` at 38% while [disabled]. [required] adds an
/// asterisk that a screen reader does not read, because the control's own node
/// says it is required.
class MPSelectionText extends StatelessWidget {
  /// Lays out [label] over its supporting line.
  const MPSelectionText({
    required this.size,
    required this.disabled,
    this.label,
    this.description,
    this.errorMessage,
    this.required = false,
    this.excludeLabelSemantics = false,
    super.key,
  });

  /// The rung, which decides the type role.
  final MPSize size;

  /// Whether the control is unavailable, which drains the words with it.
  final bool disabled;

  /// The words beside the control.
  final Widget? label;

  /// The line under the label.
  final Widget? description;

  /// The message under the label, which takes the description's place.
  final Widget? errorMessage;

  /// Adds the asterisk.
  final bool required;

  /// Leaves the label's words out of the semantics tree, for a control whose
  /// `semanticLabel` names it in their place.
  final bool excludeLabelSemantics;

  /// Whether there is anything here to lay out.
  static bool hasContent({Widget? label, Widget? description, Widget? errorMessage}) {
    return label != null || description != null || errorMessage != null;
  }

  /// The style the label is set in, for a caller that needs the line it
  /// occupies: the box a small control is centred in is one of these lines
  /// tall.
  static TextStyle labelStyle(MPThemeData theme, MPSize size) {
    final MPTypeRole role = mpProseText(theme.typescale, size);

    return role.style().copyWith(height: _labelLeading);
  }

  /// How tall one line of the prose role for [size] is: the box a small
  /// control is centred in, so it sits on the label's first line rather than
  /// in the middle of a label that wraps to three.
  static double lineOf(MPThemeData theme, MPSize size) {
    return mpProseText(theme.typescale, size).lineHeight;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 2,
      children: <Widget>[
        if (label != null)
          ExcludeSemantics(
            excluding: excludeLabelSemantics,
            child: DefaultTextStyle.merge(
              style: labelStyle(theme, size).copyWith(color: ink),
              child: required ? _withAsterisk(label!) : label!,
            ),
          ),
        if (description != null || errorMessage != null)
          MPSupportingLine(
            description: description,
            errorMessage: errorMessage,
            disabled: disabled,
          ),
      ],
    );
  }

  /// [label] followed by an asterisk the semantics tree leaves out.
  ///
  /// Inline when the label is plain text, so the mark follows the last word of
  /// a label that wraps rather than standing at the end of its box.
  static Widget _withAsterisk(Widget label) {
    if (label is Text && label.data != null) {
      return Text.rich(
        TextSpan(
          children: <InlineSpan>[
            TextSpan(text: label.data, style: label.style),
            const TextSpan(text: ' *', semanticsLabel: ''),
          ],
        ),
        key: label.key,
        textAlign: label.textAlign,
        maxLines: label.maxLines,
        overflow: label.overflow,
        softWrap: label.softWrap,
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Flexible(child: label),
        const ExcludeSemantics(child: Text(' *')),
      ],
    );
  }
}

/// Which mark a control draws.
enum MPSelectionMarkShape {
  /// The tick: a ticked box, an on switch, a chosen segment.
  check,

  /// The dash: a box some of whose children are ticked.
  dash,

  /// The cross: an off switch that shows its glyphs.
  cross,
}

/// Draws a mark, grown towards its full size by [shown].
///
/// The React package's marks are Lucide's `check`, `minus` and `x`, drawn in a
/// 24-unit box with round caps and joins, at the stroke width the control asks
/// for: 3 on the small controls, where a 2-unit stroke at 16px is a hairline,
/// and Lucide's own 2 elsewhere. The same paths are traced here.
///
/// [shown] runs from `0` to `1` and is what `MARK_MOTION` animates in the
/// React build: the mark grows from 60% of its size and fades in on the same
/// 200ms the box's own colour takes, so a tick is one event rather than a
/// container that eases and a glyph that appears on top of it halfway through.
/// It is painted at that size rather than scaled with a `Transform`, so nothing
/// round the mark is resampled.
class MPSelectionMarkPainter extends CustomPainter {
  /// Paints [shape] in [color].
  const MPSelectionMarkPainter({
    required this.shape,
    required this.color,
    this.shown = 1,
    this.strokeWidth = 3,
    this.from = 0.6,
  });

  /// Which mark.
  final MPSelectionMarkShape shape;

  /// The ink.
  final Color color;

  /// How far it has arrived, from `0` (gone) to `1` (whole).
  final double shown;

  /// The stroke, in the 24-unit box the path is written in.
  final double strokeWidth;

  /// The size it grows from, as a fraction of its own. `0.6` for a stroke,
  /// which has to stay legible as it arrives.
  final double from;

  @override
  void paint(Canvas canvas, Size size) {
    if (shown <= 0) {
      return;
    }

    final Path path = Path();

    switch (shape) {
      case MPSelectionMarkShape.check:
        path
          ..moveTo(20, 6)
          ..lineTo(9, 17)
          ..lineTo(4, 12);
      case MPSelectionMarkShape.dash:
        path
          ..moveTo(5, 12)
          ..lineTo(19, 12);
      case MPSelectionMarkShape.cross:
        path
          ..moveTo(18, 6)
          ..lineTo(6, 18)
          ..moveTo(6, 6)
          ..lineTo(18, 18);
    }

    final double grown = from + (1 - from) * shown.clamp(0.0, 1.0);
    final double unit = size.shortestSide / 24;

    canvas
      ..save()
      ..translate(size.width / 2, size.height / 2)
      ..scale(unit * grown)
      ..translate(-12, -12)
      ..drawPath(
        path,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..strokeWidth = strokeWidth
          ..color = color.withValues(alpha: color.a * shown.clamp(0.0, 1.0)),
      )
      ..restore();
  }

  @override
  bool shouldRepaint(MPSelectionMarkPainter oldDelegate) {
    return oldDelegate.shape != shape ||
        oldDelegate.color != color ||
        oldDelegate.shown != shown ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.from != from;
  }
}

/// The line under a control: its description, or its error in the
/// description's place.
///
/// Material calls it supporting text and gives it one slot rather than two. An
/// error is not more information about a field, it is the field's current
/// problem, and pushing the description down a line to make room for it leaves
/// the reader reading a sentence that has just stopped applying.
///
/// `bodySmall`, in `onSurfaceVariant` for a description and `error` for an
/// error. Both go to `onSurface` at 38% while the control is disabled,
/// including the error, which is still true but no longer something the reader
/// can act on.
class MPSupportingLine extends StatelessWidget {
  /// Shows [errorMessage] if there is one, otherwise [description].
  const MPSupportingLine({required this.disabled, this.description, this.errorMessage, super.key});

  /// Whether the control it belongs to is unavailable.
  final bool disabled;

  /// The description.
  final Widget? description;

  /// The error, which wins.
  final Widget? errorMessage;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Widget? shown = errorMessage ?? description;

    if (shown == null) {
      return const SizedBox.shrink();
    }

    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : errorMessage != null
        ? colors.error
        : colors.onSurfaceVariant;

    return DefaultTextStyle.merge(style: theme.typescale.bodySmall.style(ink), child: shown);
  }
}
