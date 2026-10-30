/// An icon at a known size, in a known colour.
library;

import 'package:flutter/widgets.dart';

/// An icon at a known size, in a known colour.
///
/// Material Plus draws no icons of its own. Which set an application uses is
/// its decision, and one it has usually already made, so this takes whatever
/// that set hands back and gives it the size and colour axes the rest of the
/// library has.
///
/// ```dart
/// MPIcon(icon: mySet.search, size: 20)       // an IconData from a font
/// const MPIcon(icon: MyLogo(), size: 20)     // a widget of your own
/// ```
///
/// The glyph is told its size and colour three ways at once: through
/// [IconTheme], through [DefaultTextStyle], and by the box it is laid into. So
/// an [Icon], a drawing that reads `IconTheme.of(context)` and a bare character
/// all come out the same size, the way React's box sets both the length and
/// the `font-size` so that an SVG drawn in pixels and one drawn in `em` agree.
class MPIcon extends StatelessWidget {
  /// Creates an icon from [icon], an [IconData] or a [Widget].
  const MPIcon({required this.icon, this.size, this.color, this.label, super.key})
    : assert(icon is IconData || icon is Widget, 'MPIcon.icon must be an IconData or a Widget');

  /// The glyph to draw: an [IconData] from an icon font, or a widget of your
  /// own.
  ///
  /// It is a parameter rather than a `child` because the two things you always
  /// want to decide about an icon, how big it is and what colour it is, are the
  /// two you cannot reach once it is a child of something. As a parameter it is
  /// content this widget *sizes*, not content it merely wraps.
  ///
  /// Typed [Object] because Dart has no union type. Anything other than an
  /// [IconData] or a [Widget] fails an assertion in debug and draws nothing in
  /// release.
  final Object icon;

  /// The box the glyph is drawn in, in logical pixels.
  ///
  /// Left unset the glyph draws at whatever size the surrounding [IconTheme]
  /// says, 24 for a bare one. That default is deliberate: an icon inside a
  /// button is already sized by the button, and a wrapper that overrode it
  /// would be a second opinion nobody asked for.
  final double? size;

  /// The glyph's colour. Left unset the icon takes the colour of whatever it
  /// sits in, a button's label, a muted caption, an error message, which is
  /// right far more often than a colour of its own.
  final Color? color;

  /// What the icon says, for a reader who cannot see it.
  ///
  /// Without it the icon is left out of the semantics tree, which is the right
  /// default: most icons sit beside a word that already says the same thing,
  /// and reading both aloud is worse than reading one. Pass this only when the
  /// glyph carries the meaning on its own.
  final String? label;

  @override
  Widget build(BuildContext context) {
    final Object icon = this.icon;
    Widget glyph;

    if (icon is IconData) {
      // `Icon` already reads the theme for whatever is left `null`, so passing
      // the two straight through is the whole job.
      glyph = Icon(icon, size: size, color: color);
    } else if (icon is Widget) {
      glyph = IconTheme.merge(
        data: IconThemeData(size: size, color: color),
        child: DefaultTextStyle.merge(
          // The box's own font size *is* the box, so a glyph that is a
          // character comes out the same size as one that is a drawing.
          style: TextStyle(fontSize: size, color: color, height: size == null ? null : 1),
          child: icon,
        ),
      );

      // Only with a size: without one the box is sized by what is in it, and
      // laying the glyph into a box of its own size would say nothing.
      if (size != null) {
        glyph = SizedBox.square(
          dimension: size,
          child: Center(child: glyph),
        );
      }
    } else {
      glyph = const SizedBox.shrink();
    }

    // An icon with something to say is an image with a name; one without is
    // furniture. There is no third case, and a name on a decorative glyph is
    // the most common way a screen reader ends up saying "graphic".
    if (label == null) {
      return ExcludeSemantics(child: glyph);
    }

    return Semantics(
      container: true,
      image: true,
      label: label,
      child: ExcludeSemantics(child: glyph),
    );
  }
}
