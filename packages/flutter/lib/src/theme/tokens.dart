/// The tokens that are not colours: type, shape, elevation, motion and the
/// state layer.
///
/// Every number is the React token sheet's, which is MD3's: a `labelLarge` is
/// 14px at weight 500 on a 20px line in both packages, and a dialog's corner is
/// `extraLarge` in both.
library;

import 'package:flutter/animation.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

/// One role of the type scale.
///
/// The family is deliberately absent. MD3's roles name a size, a line height, a
/// weight and a tracking, and leave the face to the brand; a component
/// inherits whatever family the app's `DefaultTextStyle` carries, which is the
/// Flutter spelling of the React package's `font: inherit`.
@immutable
class MPTypeRole {
  /// Creates a role from its four numbers, all in logical pixels.
  const MPTypeRole({
    required this.size,
    required this.lineHeight,
    required this.tracking,
    required this.weight,
  });

  /// The font size.
  final double size;

  /// The height of a line, absolute rather than as a multiple.
  final double lineHeight;

  /// The letter spacing.
  final double tracking;

  /// The weight. MD3 sets headings at regular weight: Material headings are
  /// not bold.
  final FontWeight weight;

  /// This role as a style a `Text` can merge, in [color] if one is given.
  ///
  /// Only the four numbers and the colour are set, so the family and anything
  /// else an ancestor decided still comes through a merge.
  TextStyle style([Color? color]) {
    return TextStyle(
      fontSize: size,
      height: lineHeight / size,
      letterSpacing: tracking,
      fontWeight: weight,
      color: color,
      leadingDistribution: TextLeadingDistribution.even,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is MPTypeRole &&
        other.size == size &&
        other.lineHeight == lineHeight &&
        other.tracking == tracking &&
        other.weight == weight;
  }

  @override
  int get hashCode => Object.hash(size, lineHeight, tracking, weight);
}

/// The type scale: the fifteen roles MD3 names, minus the two this library has
/// no component for.
///
/// `displayLarge` and `displayMedium` are left out for the reason the React
/// token sheet gives: a token nobody reads is a name somebody has to keep
/// supporting.
@immutable
class MPTypescale {
  /// A scale with every role given.
  const MPTypescale({
    required this.displaySmall,
    required this.headlineLarge,
    required this.headlineMedium,
    required this.headlineSmall,
    required this.titleLarge,
    required this.titleMedium,
    required this.titleSmall,
    required this.bodyLarge,
    required this.bodyMedium,
    required this.bodySmall,
    required this.labelLarge,
    required this.labelMedium,
    required this.labelSmall,
  });

  /// MD3's own scale.
  static const MPTypescale material = MPTypescale(
    displaySmall: MPTypeRole(size: 36, lineHeight: 44, tracking: 0, weight: FontWeight.w400),
    headlineLarge: MPTypeRole(size: 32, lineHeight: 40, tracking: 0, weight: FontWeight.w400),
    headlineMedium: MPTypeRole(size: 28, lineHeight: 36, tracking: 0, weight: FontWeight.w400),
    headlineSmall: MPTypeRole(size: 24, lineHeight: 32, tracking: 0, weight: FontWeight.w400),
    titleLarge: MPTypeRole(size: 22, lineHeight: 28, tracking: 0, weight: FontWeight.w400),
    titleMedium: MPTypeRole(size: 16, lineHeight: 24, tracking: 0.15, weight: FontWeight.w500),
    titleSmall: MPTypeRole(size: 14, lineHeight: 20, tracking: 0.1, weight: FontWeight.w500),
    bodyLarge: MPTypeRole(size: 16, lineHeight: 24, tracking: 0.5, weight: FontWeight.w400),
    bodyMedium: MPTypeRole(size: 14, lineHeight: 20, tracking: 0.25, weight: FontWeight.w400),
    bodySmall: MPTypeRole(size: 12, lineHeight: 16, tracking: 0.4, weight: FontWeight.w400),
    labelLarge: MPTypeRole(size: 14, lineHeight: 20, tracking: 0.1, weight: FontWeight.w500),
    labelMedium: MPTypeRole(size: 12, lineHeight: 16, tracking: 0.5, weight: FontWeight.w500),
    labelSmall: MPTypeRole(size: 11, lineHeight: 16, tracking: 0.5, weight: FontWeight.w500),
  );

  /// 36 on 44: a hero number, a stat.
  final MPTypeRole displaySmall;

  /// 32 on 40.
  final MPTypeRole headlineLarge;

  /// 28 on 36.
  final MPTypeRole headlineMedium;

  /// 24 on 32: a dialog's headline.
  final MPTypeRole headlineSmall;

  /// 22 on 28: a top bar's title.
  final MPTypeRole titleLarge;

  /// 16 on 24 at weight 500: a control's label from `md` up.
  final MPTypeRole titleMedium;

  /// 14 on 20 at weight 500.
  final MPTypeRole titleSmall;

  /// 16 on 24: prose, and a field's value.
  final MPTypeRole bodyLarge;

  /// 14 on 20.
  final MPTypeRole bodyMedium;

  /// 12 on 16: supporting text.
  final MPTypeRole bodySmall;

  /// 14 on 20 at weight 500: a small control's label.
  final MPTypeRole labelLarge;

  /// 12 on 16 at weight 500.
  final MPTypeRole labelMedium;

  /// 11 on 16 at weight 500: a badge's count, the smallest type MD3 has.
  final MPTypeRole labelSmall;

  @override
  bool operator ==(Object other) {
    return other is MPTypescale &&
        other.displaySmall == displaySmall &&
        other.headlineLarge == headlineLarge &&
        other.headlineMedium == headlineMedium &&
        other.headlineSmall == headlineSmall &&
        other.titleLarge == titleLarge &&
        other.titleMedium == titleMedium &&
        other.titleSmall == titleSmall &&
        other.bodyLarge == bodyLarge &&
        other.bodyMedium == bodyMedium &&
        other.bodySmall == bodySmall &&
        other.labelLarge == labelLarge &&
        other.labelMedium == labelMedium &&
        other.labelSmall == labelSmall;
  }

  @override
  int get hashCode => Object.hash(
    displaySmall,
    headlineLarge,
    headlineMedium,
    headlineSmall,
    titleLarge,
    titleMedium,
    titleSmall,
    bodyLarge,
    bodyMedium,
    bodySmall,
    labelLarge,
    labelMedium,
    labelSmall,
  );
}

/// The corner ladder.
///
/// Two presets besides the specification's, on the React package's model:
/// [rounded] and [sharp] move the whole subtree at once. They are presets
/// rather than a multiplier because the ladder is not linear; a dialog whose
/// corner has doubled to 56px is not a rounder dialog, it is a lozenge.
@immutable
class MPShapes {
  /// A ladder with every rung given.
  const MPShapes({
    required this.extraSmall,
    required this.small,
    required this.medium,
    required this.large,
    required this.extraLarge,
    required this.full,
  });

  /// The specification's corners: 4, 8, 12, 16 and 28, and a pill.
  static const MPShapes material = MPShapes(
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 28,
    full: double.infinity,
  );

  /// Rounder by a different amount per rung. [full] stays a pill: there is no
  /// rounder to go.
  static const MPShapes rounded = MPShapes(
    extraSmall: 8,
    small: 12,
    medium: 20,
    large: 24,
    extraLarge: 32,
    full: double.infinity,
  );

  /// Square everywhere, buttons included. Leaving [full] round would make this
  /// a theme where every corner is square except the buttons.
  static const MPShapes sharp = MPShapes(
    extraSmall: 0,
    small: 0,
    medium: 0,
    large: 0,
    extraLarge: 0,
    full: 0,
  );

  /// A chip, a field, a tooltip.
  final double extraSmall;

  /// A menu, a snackbar.
  final double small;

  /// A card.
  final double medium;

  /// A sheet's top corners, a navigation drawer.
  final double large;

  /// A dialog.
  final double extraLarge;

  /// A pill. [double.infinity] means "half the shorter side", whatever that is.
  final double full;

  /// [radius] as a [BorderRadius] for a box [height] tall, so [full] comes out
  /// as half the height rather than as an infinity a painter cannot draw.
  static BorderRadius circular(double radius, {double? height}) {
    if (radius.isInfinite) {
      return BorderRadius.circular(height == null ? 9999 : height / 2);
    }

    return BorderRadius.circular(radius);
  }

  @override
  bool operator ==(Object other) {
    return other is MPShapes &&
        other.extraSmall == extraSmall &&
        other.small == small &&
        other.medium == medium &&
        other.large == large &&
        other.extraLarge == extraLarge &&
        other.full == full;
  }

  @override
  int get hashCode => Object.hash(extraSmall, small, medium, large, extraLarge, full);
}

/// MD3's elevation shadows, by level.
///
/// Two layers each, a key light and an ambient one, in black at 30% and 15%:
/// the same numbers as `--mp-sys-elevation-level*`. The tone a level also
/// names lives on the surface, not here; see `MPElevation`.
abstract final class MPShadows {
  /// The shadow for [level], `0` to `5`. Level `0` casts none.
  static List<BoxShadow> of(int level) => _levels[level.clamp(0, 5)];

  static const Color _key = Color(0x4D000000);
  static const Color _ambient = Color(0x26000000);

  static const List<List<BoxShadow>> _levels = <List<BoxShadow>>[
    <BoxShadow>[],
    <BoxShadow>[
      BoxShadow(color: _key, offset: Offset(0, 1), blurRadius: 2),
      BoxShadow(color: _ambient, offset: Offset(0, 1), blurRadius: 3, spreadRadius: 1),
    ],
    <BoxShadow>[
      BoxShadow(color: _key, offset: Offset(0, 1), blurRadius: 2),
      BoxShadow(color: _ambient, offset: Offset(0, 2), blurRadius: 6, spreadRadius: 2),
    ],
    <BoxShadow>[
      BoxShadow(color: _key, offset: Offset(0, 1), blurRadius: 3),
      BoxShadow(color: _ambient, offset: Offset(0, 4), blurRadius: 8, spreadRadius: 3),
    ],
    <BoxShadow>[
      BoxShadow(color: _key, offset: Offset(0, 2), blurRadius: 3),
      BoxShadow(color: _ambient, offset: Offset(0, 6), blurRadius: 10, spreadRadius: 4),
    ],
    <BoxShadow>[
      BoxShadow(color: _key, offset: Offset(0, 4), blurRadius: 4),
      BoxShadow(color: _ambient, offset: Offset(0, 8), blurRadius: 12, spreadRadius: 6),
    ],
  ];
}

/// MD3's motion tokens: the durations and the easing curves.
abstract final class MPMotion {
  /// 100ms.
  static const Duration short2 = Duration(milliseconds: 100);

  /// 200ms: a state layer, a colour change.
  static const Duration short4 = Duration(milliseconds: 200);

  /// 300ms: a small surface entering.
  static const Duration medium2 = Duration(milliseconds: 300);

  /// 400ms.
  static const Duration medium4 = Duration(milliseconds: 400);

  /// 500ms: a large surface entering.
  static const Duration long2 = Duration(milliseconds: 500);

  /// 1000ms.
  static const Duration extraLong4 = Duration(milliseconds: 1000);

  /// For most transitions.
  static const Cubic standard = Cubic(0.2, 0, 0, 1);

  /// For something entering the screen.
  static const Cubic standardDecelerate = Cubic(0, 0, 0, 1);

  /// For something leaving it.
  static const Cubic standardAccelerate = Cubic(0.3, 0, 1, 1);

  /// For a transition that should be noticed. MD3 draws it as a two-part path;
  /// this is the single curve the React package uses in its place.
  static const Cubic emphasized = Cubic(0.2, 0, 0, 1);

  /// For an emphasised entrance.
  static const Cubic emphasizedDecelerate = Cubic(0.05, 0.7, 0.1, 1);

  /// For an emphasised exit.
  static const Cubic emphasizedAccelerate = Cubic(0.3, 0, 0.8, 0.15);
}

/// The state layer's opacities.
///
/// MD3 does not express hover, focus and press as three more colours. It puts
/// a translucent wash of the *content* colour over the container, so one rule
/// covers a filled button, an outlined one and a bare text one.
abstract final class MPStateOpacity {
  /// A pointer over the surface.
  static const double hover = 0.08;

  /// Keyboard focus on it.
  static const double focus = 0.10;

  /// Held down.
  static const double press = 0.10;

  /// Being dragged.
  static const double drag = 0.16;

  /// A disabled control's content, in `onSurface`.
  static const double disabledContent = 0.38;

  /// A disabled control's container, in `onSurface`.
  static const double disabledContainer = 0.12;
}
