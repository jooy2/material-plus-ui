/// What the progress indicators and the meter share.
///
/// The Dart half of the React package's `internal/progress.ts`. A bar, a ring
/// and a row of segments are three shapes answering one question, how far
/// along is this and is it moving at all, so everything that is *not* the
/// shape belongs here: the ladders, the arithmetic that turns value/min/max
/// into a fraction, the loops the indeterminate shapes run, and the header and
/// semantics node a bar and a meter both carry.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How thick the linear groove is: 2, 3, 4, 6, 8.
///
/// Its own ladder rather than a step off the control heights: a bar is not a
/// control with a label inside it. `md` is MD3's own 4dp, and the ladder is
/// centred on it the way every other one is centred on its spec value.
const Map<MPSize, double> barThickness = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 3,
  MPSize.md: 4,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// The diameter of the ring: 24, 32, 48, 56, 64.
///
/// `md` is MD3's own 48dp, and every rung sits inside the control height at
/// the same step, a 48px ring inside a 56px field, so a ring dropped into a
/// button, a field or a table row never makes the row taller than it was.
const Map<MPSize, double> ringDiameter = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 32,
  MPSize.md: 48,
  MPSize.lg: 56,
  MPSize.xl: 64,
};

/// The ring's stroke, MD3's 4dp at `md`, thickening so the hole stays in
/// proportion.
const Map<MPSize, double> ringStroke = <MPSize, double>{
  MPSize.xs: 2.5,
  MPSize.sm: 3,
  MPSize.md: 4,
  MPSize.lg: 4.5,
  MPSize.xl: 5,
};

/// One segment of an `MPProgressBox`: 8, 10, 12, 16, 20. An indicator, so its
/// own ladder again.
const Map<MPSize, double> segmentSize = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

/// Between the segments. Tight: they are one object, not a row of squares.
const Map<MPSize, double> segmentGap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 4,
  MPSize.md: 6,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// The corner cut off a segment at [size] under [shapes].
///
/// `extraSmall` from `md` up, which is the spec's smallest corner and the
/// right one for a tile this size, and `small` at `xl`. The two rungs below
/// `md` cap it at 3, because 4px on an 8px box is not a cut corner but a
/// circle. A cap rather than a literal, so the tiles still follow the token in
/// the one direction the cap does not block: under a squarer theme they go
/// square with everything else.
double segmentRadius(MPShapes shapes, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return shapes.extraSmall < 3 ? shapes.extraSmall : 3;
    case MPSize.md:
    case MPSize.lg:
      return shapes.extraSmall;
    case MPSize.xl:
      return shapes.small;
  }
}

/// One cycle of the indeterminate bar: two `extraLong4`s, as the stylesheet
/// writes it, so a page that retunes its motion retunes this with it.
const Duration sweepDuration = Duration(milliseconds: 2000);

/// One turn of the indeterminate ring, and one breath of the arc it draws.
const Duration spinDuration = Duration(milliseconds: 1400);

/// One crossing of the wave along a row of segments.
const Duration waveDuration = Duration(milliseconds: 1200);

/// How far behind its neighbour each segment lights, as a fraction of the
/// cycle: the stylesheet's 120ms of 1200.
const double waveStagger = 0.1;

/// CSS's `ease-in-out`, which the arc and the wave are written on.
const Cubic easeInOut = Cubic(0.42, 0, 0.58, 1);

/// The value of a keyframe track at [t], `0`…`1` through the cycle.
///
/// [stops] are `(offset, value)` pairs in order, and [curve] eases each
/// interval on its own, which is what an `animation-timing-function` does to a
/// `@keyframes` rule: the curve runs from one keyframe to the next, not across
/// the whole cycle.
double keyframe(double t, List<(double, double)> stops, Curve curve) {
  if (t <= stops.first.$1) {
    return stops.first.$2;
  }

  for (int index = 1; index < stops.length; index += 1) {
    final (double offset, double value) = stops[index];

    if (t <= offset) {
      final (double from, double start) = stops[index - 1];
      final double along = offset == from ? 1 : (t - from) / (offset - from);

      return start + (value - start) * curve.transform(along);
    }
  }

  return stops.last.$2;
}

/// Where one of the indeterminate bar's two bars is at [t], as the inset of
/// its start edge and of its end edge, each a fraction of the groove.
///
/// The stylesheet's four keyframe rules, edge for edge. A head leaves first
/// on `standard` and settles; a tail lingers and hurries after it on
/// `standardAccelerate`, so the bar stretches across the groove and gathers
/// itself up at the far end. The trailing bar sets off as the leading one
/// slows, which is what keeps the groove from being empty for most of the
/// cycle.
({double start, double end}) sweepBar(double t, {required bool trail}) {
  if (trail) {
    return (
      start: keyframe(t, const <(double, double)>[
        (0, 0),
        (0.62, 0),
        (1, 1),
      ], MPMotion.standardAccelerate),
      end: keyframe(t, const <(double, double)>[(0, 1), (0.5, 1), (0.8, 0)], MPMotion.standard),
    );
  }

  return (
    start: keyframe(t, const <(double, double)>[
      (0, 0),
      (0.2, 0),
      (0.7, 1),
    ], MPMotion.standardAccelerate),
    end: keyframe(t, const <(double, double)>[(0, 1), (0.5, 0)], MPMotion.standard),
  );
}

/// The arc the indeterminate ring draws at [t], as where it starts and how
/// long it is, both fractions of the circle measured clockwise from twelve
/// o'clock.
///
/// The stylesheet's `stroke-dasharray` and `stroke-dashoffset` in the
/// circle's own 100 units: one unit at rest, 70 at the middle of the cycle,
/// and one again at the end, while the dash slides 70 units round.
({double start, double sweep}) spinArc(double t) {
  final double dash = keyframe(t, const <(double, double)>[(0, 1), (0.5, 70), (1, 1)], easeInOut);
  final double offset = keyframe(t, const <(double, double)>[
    (0, 0),
    (0.5, -8),
    (1, -70),
  ], easeInOut);

  return (start: -offset / 100, sweep: dash / 100);
}

/// A segment's opacity at [phase] through the wave, `0`…`1`.
///
/// The stylesheet's `mp-wave`: dim at 24% at both ends of the cycle and full
/// at 40%, eased in and out on each side.
double waveOpacity(double phase) {
  return keyframe(phase % 1, const <(double, double)>[(0, 0.24), (0.4, 1), (1, 0.24)], easeInOut);
}

/// Runs [loop] while [running] and holds it otherwise.
///
/// An indeterminate shape loops for as long as it is on screen, and only
/// then: a value arriving stops it, and so does `MediaQuery.disableAnimations`,
/// under which each shape draws the frame it rests on instead, as the React
/// build does under `prefers-reduced-motion`.
void syncProgressLoop(AnimationController loop, {required bool running}) {
  if (running) {
    if (!loop.isAnimating) {
      loop.repeat();
    }
  } else if (loop.isAnimating) {
    loop.stop();
  }
}

/// `value` as a fraction of the range, or `null` when there is nothing to say.
///
/// The clamp is not defensive programming for its own sake: `value` usually
/// arrives from a division somewhere, and a bar that renders 140% wide because
/// one request finished twice is a worse bug than a bar that sits full.
double? progressFraction(double? value, double min, double max) {
  if (value == null || value.isNaN) {
    return null;
  }

  if (max <= min) {
    return null;
  }

  return ((value - min) / (max - min)).clamp(0.0, 1.0);
}

/// [value] clamped into the range, or `null` wherever [progressFraction] has
/// nothing to say. It is what a `formatValue` is handed.
///
/// Clamped for the reason the fraction is, and so the words beside the shape
/// are about the shape: `double.infinity` draws a full bar, and a formatter
/// handed the raw value would write a number no formatter was written for.
double? progressValue(double? value, double min, double max) {
  if (value == null || progressFraction(value, min, max) == null) {
    return null;
  }

  return value.clamp(min, max);
}

/// What the value reads as when nobody said what it means: a percentage of
/// `min`…`max` rather than of 100. "3%" for step 3 of 4 is worse than saying
/// nothing.
String? progressText(double? fraction) {
  return fraction == null ? null : '${(fraction * 100).round()}%';
}

/// The words a shape writes beside itself and a screen reader hears, or
/// `null` while there is no value: [format]'s, given [value], or the share of
/// the range.
String? progressLabel(double? fraction, double? value, String Function(double value)? format) {
  if (fraction == null) {
    return null;
  }

  return format != null && value != null ? format(value) : progressText(fraction);
}

/// [value] as the shortest decimal that is still it: `0`, `4`, `2.5`.
String _plain(double value) {
  return value == value.roundToDouble() && value.abs() < 1e15
      ? value.toStringAsFixed(0)
      : value.toString();
}

/// Whether the framework will take [text] as a progress bar's value.
///
/// A node that says it is a progress bar has to carry a number or a
/// percentage, and a debug build throws on anything else. A `formatValue`
/// that writes `2.1 GB` writes neither, so that node says its value without
/// claiming the role rather than taking the app down.
bool _readsAsProgress(String text) {
  final String trimmed = text.endsWith('%') ? text.substring(0, text.length - 1) : text;

  return double.tryParse(trimmed) != null;
}

/// The one semantics node a progress indicator is.
///
/// Merged, so the label and the shape are read as one thing rather than as a
/// name floating beside an unnamed indicator. With no value it is a
/// `loadingSpinner` and carries no value at all, which is what tells the
/// platform to announce indeterminate progress rather than zero: the React
/// build's `progressbar` with no `aria-valuenow`. With one it is a
/// `progressBar` with the range on it, so a browser hears the same three
/// numbers the React build's `aria-value*` attributes say.
Widget progressSemantics({
  required double? fraction,
  required double min,
  required double max,
  required String? text,
  required Widget child,
}) {
  final bool determinate = fraction != null && text != null;
  final SemanticsRole role = !determinate
      ? SemanticsRole.loadingSpinner
      : _readsAsProgress(text)
      ? SemanticsRole.progressBar
      : SemanticsRole.none;

  return MergeSemantics(
    child: Semantics(
      container: true,
      role: role,
      value: determinate ? text : null,
      minValue: role == SemanticsRole.progressBar ? _plain(min) : null,
      maxValue: role == SemanticsRole.progressBar ? _plain(max) : null,
      child: child,
    ),
  );
}

/// A name kept for a screen reader and taken off the screen.
///
/// The React build's visually-hidden label: no room taken, nothing painted,
/// and the words still in the accessibility tree, where the merged node above
/// picks them up as its name.
class ProgressHiddenLabel extends StatelessWidget {
  /// Hides [child] from sight only.
  const ProgressHiddenLabel({required this.child, super.key});

  /// The name.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox.shrink(
      child: OverflowBox(
        alignment: AlignmentDirectional.topStart,
        minWidth: 0,
        maxWidth: double.infinity,
        minHeight: 0,
        maxHeight: double.infinity,
        child: Opacity(opacity: 0, alwaysIncludeSemantics: true, child: child),
      ),
    );
  }
}

/// The line over a bar or a row of segments: the label at the start, the
/// value at the end.
///
/// `bodySmall`, the React build's `META_TEXT`, with the label in `onSurface`
/// and the value a step back in `onSurfaceVariant`. The value is drawn and not
/// read: the same string is already the node's value, and a screen reader
/// should hear it once.
class ProgressHeader extends StatelessWidget {
  /// Creates the line. At least one of [label] and [value] is given.
  const ProgressHeader({required this.label, required this.value, super.key});

  /// The name, truncated rather than wrapped.
  final Widget? label;

  /// The value as text, or `null` for none.
  final String? value;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle meta = theme.typescale.bodySmall.style();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      // Only reached with no label, where the value is on its own and belongs
      // at the end of the run it measures.
      mainAxisAlignment: label == null ? MainAxisAlignment.end : MainAxisAlignment.spaceBetween,
      children: <Widget>[
        if (label != null)
          Flexible(
            child: DefaultTextStyle.merge(
              style: meta.copyWith(color: theme.colors.onSurface),
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              child: label!,
            ),
          ),
        if (value != null) ...<Widget>[
          if (label != null) const SizedBox(width: 8),
          ExcludeSemantics(
            child: Text(
              value!,
              maxLines: 1,
              softWrap: false,
              style: meta.copyWith(
                color: theme.colors.onSurfaceVariant,
                fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// The groove and what sits over it, stacked under an optional header with
/// the stack gap between them, as a bar and a meter both are.
Widget progressStack({
  required MPSize size,
  required Widget? header,
  required Widget? hiddenLabel,
  required Widget groove,
  CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.stretch,
}) {
  return Column(
    crossAxisAlignment: crossAxisAlignment,
    mainAxisSize: MainAxisSize.min,
    children: <Widget>[
      // Out of the flow, so it costs neither a line nor the stack's gap.
      ?hiddenLabel,
      if (header != null) ...<Widget>[header, SizedBox(height: mpStackGap[size])],
      groove,
    ],
  );
}
