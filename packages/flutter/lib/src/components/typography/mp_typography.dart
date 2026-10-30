/// Text at one of Material's type roles.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The type scale an [MPTypography] is set at.
///
/// Every level is one of MD3's own type roles, at the specification's size,
/// leading, tracking and weight:
///
/// | Level      | Material role    | Size / leading |
/// | ---------- | ---------------- | -------------- |
/// | `h1`       | `displaySmall`   | 36 / 44        |
/// | `h2`       | `headlineLarge`  | 32 / 40        |
/// | `h3`       | `headlineMedium` | 28 / 36        |
/// | `h4`       | `headlineSmall`  | 24 / 32        |
/// | `h5`       | `titleLarge`     | 22 / 28        |
/// | `h6`       | `titleMedium`    | 16 / 24        |
/// | `lead`     | `titleLarge`     | 22 / 28        |
/// | `body`     | `bodyLarge`      | 16 / 24        |
/// | `caption`  | `bodySmall`      | 12 / 16        |
/// | `overline` | `labelSmall`     | 11 / 16        |
///
/// Two rows share a role on purpose: `h5` and `lead` differ in whether they
/// are announced as a heading, which is what matters to a reader moving
/// through the screen by its headings.
enum MPTypographyLevel {
  /// `displaySmall`, announced as a level 1 heading.
  h1,

  /// `headlineLarge`, announced as a level 2 heading.
  h2,

  /// `headlineMedium`, announced as a level 3 heading.
  h3,

  /// `headlineSmall`, announced as a level 4 heading.
  h4,

  /// `titleLarge`, announced as a level 5 heading.
  h5,

  /// `titleMedium`, announced as a level 6 heading.
  h6,

  /// `titleLarge`, as a paragraph: the line under a heading that introduces
  /// what follows.
  lead,

  /// `bodyLarge`, the paragraph. The default.
  body,

  /// `bodySmall`.
  caption,

  /// `labelSmall`, upper-cased and spaced out.
  overline,
}

/// The weights [MPTypography.weight] can set.
enum MPTypographyWeight {
  /// 400.
  regular,

  /// 500.
  medium,

  /// 600.
  semibold,

  /// 700.
  bold,
}

/// Text at one of Material's type roles.
///
/// ```dart
/// const MPTypography('Material Plus 1.0', level: MPTypographyLevel.h2)
/// ```
///
/// The type scale is the one thing in a design system that everything else is
/// measured against, and this is that ladder on its own, so a screen can set a
/// heading in the same `headlineLarge` its components are built out of.
///
/// There is no `size`, the same call `MPIcon` makes. `MPSize` is a control
/// ladder, and a paragraph has no height to pick from a scale; [level] is this
/// widget's scale, and it is the Material one.
class MPTypography extends StatelessWidget {
  /// Creates text from a string.
  const MPTypography(
    String this.data, {
    this.level = MPTypographyLevel.body,
    this.color,
    this.weight,
    this.align,
    this.lines,
    this.gutter = false,
    this.headingLevel,
    this.semanticsLabel,
    super.key,
  }) : assert(
         headingLevel == null || (headingLevel >= 1 && headingLevel <= 6),
         'headingLevel must be between 1 and 6',
       ),
       textSpan = null;

  /// Creates text from a span, for runs of different styles in one paragraph.
  const MPTypography.rich(
    InlineSpan this.textSpan, {
    this.level = MPTypographyLevel.body,
    this.color,
    this.weight,
    this.align,
    this.lines,
    this.gutter = false,
    this.headingLevel,
    this.semanticsLabel,
    super.key,
  }) : assert(
         headingLevel == null || (headingLevel >= 1 && headingLevel <= 6),
         'headingLevel must be between 1 and 6',
       ),
       data = null;

  /// The text, when it is a plain string.
  final String? data;

  /// The text, when it is a span.
  final InlineSpan? textSpan;

  /// The type scale, and whether the text is announced as a heading. See
  /// [MPTypographyLevel].
  final MPTypographyLevel level;

  /// Which accent family the text reads.
  ///
  /// Unlike every control in the library this has **no default**: prose takes
  /// the colour of whatever it sits in unless a role is asked for, because the
  /// common case for a paragraph is to look like the paragraphs around it.
  final MPColor? color;

  /// Overrides the weight the level would otherwise pick.
  ///
  /// Worth knowing before reaching for it: **Material headings are not bold.**
  /// Every display, headline and `titleLarge` role in MD3 is weight 400, and a
  /// heading set in 600 is the fastest way to make a Material screen look like
  /// it belongs to some other system.
  final MPTypographyWeight? weight;

  /// How the text is set against its measure. `null` follows the surrounding
  /// [DefaultTextStyle], which is `start` unless something said otherwise.
  final TextAlign? align;

  /// Cuts the text at this many lines with an ellipsis. Left out, the text
  /// wraps as far as it needs to. The whole string stays in the semantics tree.
  final int? lines;

  /// Adds the space below that a run of prose expects. Off by default: a
  /// component that injects margins is one a layout has to fight.
  final bool gutter;

  /// Announces the text as a heading at this level, 1 to 6, whatever [level]
  /// it is set at: a line at a heading's scale that sits deeper in the outline,
  /// or a heading set small. Left out, `h1` to `h6` announce their own level and
  /// the rest are not headings.
  final int? headingLevel;

  /// What a screen reader says in place of the text.
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPTypeRole role = _roleOf(theme.typescale, level);
    final bool overline = level == MPTypographyLevel.overline;

    final TextStyle style = role
        .style(color == null ? null : theme.colors.accent(color!).color)
        .copyWith(
          fontWeight: _weights[weight ?? _levelWeight(level)],
          // `overline` spaces its letters at 0.08em, in place of the role's own.
          letterSpacing: overline ? role.size * 0.08 : null,
        );

    Widget text = data != null
        ? Text(
            // There is no `text-transform` to reach for, so the case is changed
            // on the characters. A span keeps its own case: the library does
            // not own the characters inside one.
            overline ? data!.toUpperCase() : data!,
            style: style,
            textAlign: align,
            maxLines: lines,
            overflow: lines == null ? null : TextOverflow.ellipsis,
            semanticsLabel: semanticsLabel ?? (overline ? data : null),
          )
        : Text.rich(
            textSpan!,
            style: style,
            textAlign: align,
            maxLines: lines,
            overflow: lines == null ? null : TextOverflow.ellipsis,
            semanticsLabel: semanticsLabel,
          );

    final int? heading = headingLevel ?? _headingLevelOf(level);

    if (heading != null) {
      // What `<h1>` to `<h6>` buy on the web: a screen reader can list the
      // headings on a screen, jump between them, and tell a section from the
      // one inside it by its level.
      text = Semantics(header: true, headingLevel: heading, child: text);
    }

    if (gutter) {
      text = Padding(
        padding: EdgeInsets.only(bottom: _gutter[level]!),
        child: text,
      );
    }

    return text;
  }
}

MPTypeRole _roleOf(MPTypescale scale, MPTypographyLevel level) {
  switch (level) {
    case MPTypographyLevel.h1:
      return scale.displaySmall;
    case MPTypographyLevel.h2:
      return scale.headlineLarge;
    case MPTypographyLevel.h3:
      return scale.headlineMedium;
    case MPTypographyLevel.h4:
      return scale.headlineSmall;
    case MPTypographyLevel.h5:
    case MPTypographyLevel.lead:
      return scale.titleLarge;
    case MPTypographyLevel.h6:
      return scale.titleMedium;
    case MPTypographyLevel.body:
      return scale.bodyLarge;
    case MPTypographyLevel.caption:
      return scale.bodySmall;
    case MPTypographyLevel.overline:
      return scale.labelSmall;
  }
}

/// The specification's weight for each level. The headings being regular is
/// not an oversight; see [MPTypography.weight].
MPTypographyWeight _levelWeight(MPTypographyLevel level) {
  return level == MPTypographyLevel.h6 || level == MPTypographyLevel.overline
      ? MPTypographyWeight.medium
      : MPTypographyWeight.regular;
}

int? _headingLevelOf(MPTypographyLevel level) {
  switch (level) {
    case MPTypographyLevel.h1:
      return 1;
    case MPTypographyLevel.h2:
      return 2;
    case MPTypographyLevel.h3:
      return 3;
    case MPTypographyLevel.h4:
      return 4;
    case MPTypographyLevel.h5:
      return 5;
    case MPTypographyLevel.h6:
      return 6;
    case MPTypographyLevel.lead:
    case MPTypographyLevel.body:
    case MPTypographyLevel.caption:
    case MPTypographyLevel.overline:
      return null;
  }
}

const Map<MPTypographyWeight, FontWeight> _weights = <MPTypographyWeight, FontWeight>{
  MPTypographyWeight.regular: FontWeight.w400,
  MPTypographyWeight.medium: FontWeight.w500,
  MPTypographyWeight.semibold: FontWeight.w600,
  MPTypographyWeight.bold: FontWeight.w700,
};

/// How much room a level leaves under itself when [MPTypography.gutter] is on.
const Map<MPTypographyLevel, double> _gutter = <MPTypographyLevel, double>{
  MPTypographyLevel.h1: 16,
  MPTypographyLevel.h2: 14,
  MPTypographyLevel.h3: 12,
  MPTypographyLevel.h4: 10,
  MPTypographyLevel.h5: 8,
  MPTypographyLevel.h6: 8,
  MPTypographyLevel.lead: 16,
  MPTypographyLevel.body: 12,
  MPTypographyLevel.caption: 8,
  MPTypographyLevel.overline: 8,
};
