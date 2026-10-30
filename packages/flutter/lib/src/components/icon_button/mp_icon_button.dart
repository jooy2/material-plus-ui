/// A round button with a glyph in it and nothing else.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/internal/button_group.dart';
import 'package:material_plus_ui/src/types.dart';

/// A round button with a glyph in it and nothing else.
///
/// ```dart
/// MPIconButton(icon: const SearchGlyph(), label: 'Search', onPressed: search)
/// ```
///
/// There is almost nothing here, and that is the point: an [MPButton] with an
/// icon and no label already goes square and is already a pill, which for a
/// square is a circle, so MD3's icon button shape falls out of the button's own
/// `full` corner with no second table to keep in step. What this adds is the
/// *name*, which is the part that cannot be defaulted and the part that is
/// always missing.
///
/// Everything else is the button's, unchanged and on purpose: the five
/// variants, the four families, the size ladder, the state layer, [loading],
/// and what a surrounding `MPButtonGroup` sets.
///
/// ## Why the default variant is `text`
///
/// Because MD3's default icon button is its *standard* one, a glyph with no
/// container at all. A labelled button is usually the one thing on a row worth
/// pressing; an icon button is usually one of several in a toolbar or a card's
/// corner, and five filled discs in a row is a row with no emphasis left in it.
/// Reach for [MPVariant.filled] when the icon button *is* the action on the
/// screen.
///
/// ## No toggle state
///
/// MD3 also describes a *toggle* icon button. This is not that: a toggle needs
/// a pressed state that survives the press and a name that changes with it.
/// That is `MPToggle` with a glyph and no label.
class MPIconButton extends StatelessWidget {
  /// Creates an icon button named [label].
  const MPIconButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    this.variant,
    this.size,
    this.color,
    this.loading = false,
    this.loadingLabel,
    this.locale,
    this.disabled,
    this.onLongPress,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The glyph, laid out exactly as a button's `startIcon` is, which keeps an
  /// icon button and a labelled button with the same glyph drawing it at the
  /// same size.
  final Widget icon;

  /// What the button does, in words.
  ///
  /// Required, and the one parameter here that is. A button whose whole label
  /// is a drawing has no name at all, and "an icon button with no name" is the
  /// single most common accessibility defect a component library ships. A
  /// default would be a name that is right for nobody.
  final String label;

  /// Runs when the button is pressed. `null` disables it.
  final VoidCallback? onPressed;

  /// Runs on a long press.
  final VoidCallback? onLongPress;

  /// How much surface it paints. [MPVariant.text], MD3's standard icon
  /// button, unless a group says otherwise.
  final MPVariant? variant;

  /// Which rung of the size ladder: the button's height and width.
  final MPSize? size;

  /// Which accent family it reads.
  final MPColor? color;

  /// Swaps the glyph for a spinner and stops the button firing, while leaving
  /// it focusable.
  final bool loading;

  /// The spinner's name for a screen reader while [loading].
  final String? loadingLabel;

  /// Which language the spinner's default name is in.
  final String? locale;

  /// Disables the button even though [onPressed] is set.
  final bool? disabled;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    // The group comes before this component's own default, the order the
    // button reads them in. A default written into the call below would be a
    // value the button takes as the caller's, and the group's would never
    // arrive.
    final MPVariant resolved =
        variant ?? MPButtonGroupScope.maybeOf(context)?.variant ?? MPVariant.text;

    return MPButton(
      onPressed: onPressed,
      onLongPress: onLongPress,
      variant: resolved,
      size: size,
      color: color,
      loading: loading,
      loadingLabel: loadingLabel,
      locale: locale,
      disabled: disabled,
      focusNode: focusNode,
      autofocus: autofocus,
      semanticLabel: label,
      // The glyph goes in `startIcon` rather than in `child`, which is what
      // puts the button on its icon-only path: a square footprint, no inline
      // padding, and the spinner taking the glyph's place while loading.
      startIcon: icon,
    );
  }
}
