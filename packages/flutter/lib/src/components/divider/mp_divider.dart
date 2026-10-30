/// A rule between two things.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The label's type scale.
///
/// The label roles rather than the body ones: a word set into a rule is a
/// caption on a piece of structure, not a sentence. MD3's divider has no label
/// at all, so this is the library's, built out of the specification's roles.
MPTypeRole _labelRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return scale.labelSmall;
    case MPSize.md:
      return scale.labelMedium;
    case MPSize.lg:
    case MPSize.xl:
      return scale.labelLarge;
  }
}

/// Space between the label and the line on either side of it.
const Map<MPSize, double> _labelGap = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// The short side of the line around an off-centre label. A fixed stub rather
/// than a small flex ratio, so the label sits the same distance from the edge
/// whatever the divider's length turns out to be.
const double _stub = 16;

/// A rule between two things.
///
/// ```dart
/// const MPDivider()
/// const MPDivider(child: Text('OR'))
/// ```
///
/// There is no `variant` and no elevation. A divider is not a surface: it has
/// no container to paint, so four of the five variants would have nothing to
/// say and the fifth would be the line it already is.
class MPDivider extends StatelessWidget {
  /// Creates a divider.
  const MPDivider({
    this.orientation = MPOrientation.horizontal,
    this.color,
    this.size,
    this.length,
    this.thickness = 1,
    this.textAlign = MPAlign.center,
    this.semanticLabel,
    this.child,
    super.key,
  });

  /// Which way the line runs.
  ///
  /// A vertical divider has no height of its own: it stretches to the height
  /// it is given, the way a rule between two toolbar groups should. Inside a
  /// [Row] with no height of its own, give it a [length] or wrap the row in an
  /// [IntrinsicHeight].
  final MPOrientation orientation;

  /// Which accent family the rule is drawn in.
  ///
  /// **The one component in the library whose `color` has no default**, and
  /// the reason is the specification: MD3 gives a divider exactly one colour,
  /// `outlineVariant`, and it is not an accent at all. It is the quietest line
  /// in the scheme, because a divider's job is to separate two things without
  /// becoming a third. Setting it tints the rule with an accent, for the case
  /// a divider is carrying meaning rather than structure.
  final MPColor? color;

  /// Type scale of the label. Nothing else on a divider has a size.
  final MPSize? size;

  /// How far the rule runs: the width of a horizontal divider, the height of a
  /// vertical one.
  ///
  /// `length` rather than `width`, because a divider is the one component
  /// whose long axis turns with [orientation]. Left out, it runs the length of
  /// what it is given.
  final double? length;

  /// How thick the rule is. MD3's divider is 1dp and there is no second
  /// thickness in the specification; this exists for the hairline that has to
  /// survive a display where 1 logical pixel is half a device pixel.
  final double thickness;

  /// Where the label sits. [MPAlign.center] splits the line in half; `start`
  /// and `end` leave a short stub on the near side, so the label still reads as
  /// set *into* the rule.
  final MPAlign textAlign;

  /// The divider's name for a screen reader. Defaults to the label when the
  /// label is a [Text]; a divider with neither is left out of the semantics
  /// tree, which is what an unnamed rule is: decoration.
  final String? semanticLabel;

  /// A label set into the line, "OR" between two sign-in options.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final bool vertical = orientation == MPOrientation.vertical;
    final Color rule = color == null
        ? theme.colors.outlineVariant
        : theme.colors.accent(color!).color;

    Widget divider = child == null
        ? _line(rule, vertical: vertical)
        : _labelled(context, theme, rule, vertical: vertical);

    if (length != null) {
      // Inside an `Align`, which passes loose constraints down: a divider very
      // often sits in a `Column` that stretches its children, and there a bare
      // `SizedBox` would be handed a tight width and lose.
      divider = Align(
        alignment: AlignmentDirectional.centerStart,
        widthFactor: vertical ? 1 : null,
        heightFactor: vertical ? null : 1,
        child: SizedBox(
          width: vertical ? null : length,
          height: vertical ? length : null,
          child: divider,
        ),
      );
    }

    final String? label = semanticLabel ?? mpTextOf(child);

    // Flutter has no separator role. A named divider says its name once, as the
    // React build's does through `aria-label`, rather than the name and then
    // the words set into the line.
    if (label == null) {
      return ExcludeSemantics(child: divider);
    }

    return Semantics(container: true, label: label, excludeSemantics: true, child: divider);
  }

  Widget _line(Color rule, {required bool vertical}) {
    return SizedBox(
      width: vertical ? thickness : double.infinity,
      height: vertical ? double.infinity : thickness,
      child: ColoredBox(color: rule),
    );
  }

  Widget _labelled(BuildContext context, MPThemeData theme, Color rule, {required bool vertical}) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

    Widget stub({required bool fixed}) {
      final Widget edge = _line(rule, vertical: vertical);

      return fixed
          ? SizedBox(width: vertical ? null : _stub, height: vertical ? _stub : null, child: edge)
          : Expanded(child: edge);
    }

    final Widget label = DefaultTextStyle.merge(
      style: _labelRole(theme.typescale, size).style(theme.colors.onSurfaceVariant),
      maxLines: 1,
      softWrap: false,
      child: child!,
    );

    final List<Widget> parts = <Widget>[
      stub(fixed: textAlign == MPAlign.start),
      // A vertical rule's label turns with it, or the line grows to the width
      // of the word and stops being a hairline.
      if (vertical) RotatedBox(quarterTurns: 1, child: label) else label,
      stub(fixed: textAlign == MPAlign.end),
    ];

    return vertical
        ? Column(spacing: _labelGap[size]!, children: parts)
        : Row(spacing: _labelGap[size]!, children: parts);
  }
}
