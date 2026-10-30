/// The one action a screen is about, floating over it.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The three containers MD3 gives a floating button, and the reason there are
/// not five of them.
///
/// `outlined` and `text` are absent because a floating button *is* its
/// container. A hairline disc over a scrolling page is a shape with the page
/// moving through it, and a text one is a glyph with nothing to press.
enum MPFloatingActionButtonVariant {
  /// The accent itself, for the one screen where the button has to carry more
  /// weight than the content behind it.
  filled,

  /// The accent's container under its own ink: the specification's default.
  tonal,

  /// MD3's *surface* button: a neutral container with the accent as the glyph,
  /// for a button over something colourful enough that a tonal one has nothing
  /// quiet to sit on.
  elevated,
}

/// One rung: the height, the corner, the glyph and the extended form's room.
class _Rung {
  const _Rung({
    required this.height,
    required this.corner,
    required this.icon,
    required this.extendedMin,
    required this.gap,
    required this.padX,
  });

  final double height;
  final double Function(MPShapes shapes) corner;
  final double icon;
  final double extendedMin;
  final double gap;
  final double padX;
}

/// MD3 names three floating buttons, small at 40dp, the plain one at 56dp and
/// large at 96dp, and all three are on this ladder: `xs`, `md` and `xl`. The
/// rungs between them are the library's.
///
/// **The one component where the corner is on the size ladder**, because the
/// specification puts it there: a small button is `medium`, the plain one is
/// `large` and the large one is `extraLarge`. A 96dp disc and a 40dp one are two
/// different pieces of furniture, not one at two sizes.
final Map<MPSize, _Rung> _rungs = <MPSize, _Rung>{
  MPSize.xs: _Rung(
    height: 40,
    corner: (MPShapes shapes) => shapes.medium,
    icon: 24,
    extendedMin: 64,
    gap: 6,
    padX: 12,
  ),
  MPSize.sm: _Rung(
    height: 48,
    corner: (MPShapes shapes) => shapes.large,
    icon: 24,
    extendedMin: 72,
    gap: 8,
    padX: 16,
  ),
  MPSize.md: _Rung(
    height: 56,
    corner: (MPShapes shapes) => shapes.large,
    icon: 24,
    extendedMin: 80,
    gap: 8,
    padX: 16,
  ),
  MPSize.lg: _Rung(
    height: 72,
    corner: (MPShapes shapes) => shapes.extraLarge,
    icon: 30,
    extendedMin: 96,
    gap: 10,
    padX: 20,
  ),
  MPSize.xl: _Rung(
    height: 96,
    corner: (MPShapes shapes) => shapes.extraLarge,
    icon: 36,
    extendedMin: 112,
    gap: 12,
    padX: 24,
  ),
};

/// The one action a screen is about, floating over it.
///
/// ```dart
/// Stack(
///   children: <Widget>[
///     const Content(),
///     MPFloatingActionButton(icon: const PlusGlyph(), label: 'New message', onPressed: compose),
///   ],
/// )
/// ```
///
/// MD3's floating action button, drawn from the specification's own component
/// tokens: the three containers, the three sizes with the corner each of them
/// takes, level-3 elevation, the state layer, and the extended shape. The
/// default, `tonal` on `primary`, is the specification's default exactly:
/// `primaryContainer` under `onPrimaryContainer`.
///
/// While [floating] it positions itself in a corner of the [Stack] it is put
/// in, which is what a screen's body usually already is once anything floats
/// over it. Turn [floating] off to put the same button somewhere of your own.
///
/// ## Why there is no speed dial
///
/// A floating button that fans out into smaller ones is a Material 2 pattern
/// that MD3 dropped: unlabelled discs in a corner, covering the content the
/// reader was looking at. When there are several actions, they belong in a
/// menu opened from this button.
class MPFloatingActionButton extends StatelessWidget {
  /// Creates a floating action button named [label].
  const MPFloatingActionButton({
    required this.label,
    required this.onPressed,
    this.icon,
    this.extended = false,
    this.variant = MPFloatingActionButtonVariant.tonal,
    this.color,
    this.size,
    this.floating = true,
    this.corner = MPCorner.bottomEnd,
    this.offset = 16,
    this.disabled = false,
    this.onLongPress,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The glyph, drawn at the rung's own glyph size: MD3's 24dp, growing only
  /// on the two large rungs.
  final Widget? icon;

  /// What the button does, in words.
  ///
  /// Required, and the one parameter here that is: a button whose whole label
  /// is a drawing has no name at all. With [extended] it is also the word
  /// written on the button, so the two can never say different things.
  final String label;

  /// Runs when the button is pressed. `null` disables it.
  final VoidCallback? onPressed;

  /// Runs on a long press.
  final VoidCallback? onLongPress;

  /// Writes [label] beside the glyph, which turns the disc into a stadium:
  /// MD3's extended floating button.
  ///
  /// Extending is something a caller *changes*, most often on a scroll, so the
  /// disc travels into the stadium rather than being replaced by one: the
  /// label's room opens over the button's own 200ms.
  final bool extended;

  /// Which container it paints.
  final MPFloatingActionButtonVariant variant;

  /// Which accent family it reads.
  final MPColor? color;

  /// The button's size. `md` is MD3's own 56dp; `xs` and `xl` are the
  /// specification's small and large buttons at 40 and 96dp.
  final MPSize? size;

  /// Whether it positions itself in a corner of the [Stack] around it.
  ///
  /// On by default, because that is the component: everything else in this
  /// library sits in the layout, and this one is defined by not being part of
  /// it.
  final bool floating;

  /// Which corner it is pinned to. Logical, so [MPCorner.bottomEnd] is
  /// bottom-left under right-to-left. No effect while [floating] is off.
  final MPCorner corner;

  /// How far in from both edges, in logical pixels. MD3's own is 16dp.
  ///
  /// The screen's safe area on those two edges is added on top, so the button
  /// clears a home indicator or a navigation bar on an edge-to-edge screen.
  final double offset;

  /// Unavailable. Keeps its place, stops answering, and stops floating: the
  /// shadow goes with the colour.
  final bool disabled;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(color ?? config?.color ?? MPColor.primary);
    final bool unavailable = disabled || onPressed == null || MPFieldsetScope.disabledOf(context);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final _Rung rung = _rungs[size]!;
    final BorderRadius radius = BorderRadius.circular(rung.corner(theme.shapes));

    final Color fill;
    final Color ink;

    if (unavailable) {
      fill = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);
      ink = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    } else {
      (fill, ink) = switch (variant) {
        MPFloatingActionButtonVariant.filled => (accent.color, accent.onColor),
        MPFloatingActionButtonVariant.tonal => (accent.container, accent.onContainer),
        MPFloatingActionButtonVariant.elevated => (colors.surfaceContainerHigh, accent.color),
      };
    }

    void activate() {
      if (!unavailable) {
        onPressed?.call();
      }
    }

    Widget button = MPInteractive(
      onTap: activate,
      onLongPress: unavailable ? null : onLongPress,
      enabled: !unavailable,
      interactive: !unavailable,
      focusNode: focusNode,
      autofocus: autofocus,
      // Folded into the button's node round the surface.
      focusSemantics: true,
      cursor: unavailable ? SystemMouseCursors.basic : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        // One number from 0, a disc, to 1, a stadium, that the padding, the
        // gap, the floor under the width and the label's own room all read,
        // so they arrive together.
        final Widget body = TweenAnimationBuilder<double>(
          tween: Tween<double>(end: extended ? 1 : 0),
          duration: duration,
          curve: MPMotion.standard,
          builder: (BuildContext context, double open, Widget? child) {
            final Widget words = ClipRect(
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                widthFactor: open,
                child: Text(label),
              ),
            );

            return ConstrainedBox(
              constraints: BoxConstraints(
                minWidth: rung.height + (rung.extendedMin - rung.height) * open,
                minHeight: rung.height,
                maxHeight: rung.height,
              ),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: rung.padX * open),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    if (icon != null)
                      SizedBox.square(
                        dimension: rung.icon,
                        child: Center(child: icon),
                      ),
                    if (icon != null) SizedBox(width: rung.gap * open),
                    // The label stays in the tree while the button is a disc,
                    // cropped to nothing, because something that is not there
                    // has no width to travel from.
                    Flexible(child: words),
                  ],
                ),
              ),
            );
          },
        );

        Widget surface = DefaultTextStyle.merge(
          // `labelLarge` rather than a button's `titleMedium` at the same
          // rung, which is what MD3 sets an extended button in: the label does
          // the work of a glyph, and a heading-weight word on a floating pill
          // reads as a banner.
          style:
              (size == MPSize.lg || size == MPSize.xl
                      ? theme.typescale.titleMedium
                      : theme.typescale.labelLarge)
                  .style(ink),
          maxLines: 1,
          softWrap: false,
          overflow: TextOverflow.ellipsis,
          child: IconTheme.merge(
            data: IconThemeData(size: rung.icon, color: ink),
            child: ExcludeSemantics(child: body),
          ),
        );

        surface = MPStateLayer(
          color: ink,
          opacity: mpStateLayerOpacity(state, enabled: !unavailable),
          borderRadius: radius,
          child: surface,
        );

        surface = AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          decoration: BoxDecoration(
            color: fill,
            borderRadius: radius,
            // At level 3 whatever the variant: it is already off the page, and
            // a hover that raised it further would say something the press has
            // not earned. Disabled, the shadow goes with the colour: a button
            // still floating while it cannot be pressed is still claiming to
            // be the thing to do.
            boxShadow: unavailable ? const <BoxShadow>[] : MPShadows.of(3),
          ),
          clipBehavior: Clip.antiAlias,
          child: surface,
        );

        return CustomPaint(
          foregroundPainter: state.focusVisible
              ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
              : null,
          child: surface,
        );
      },
    );

    button = Semantics(
      container: true,
      button: true,
      enabled: !unavailable,
      // The name whether or not the words are drawn.
      label: label,
      onTap: unavailable ? null : activate,
      child: button,
    );

    if (!floating) {
      return button;
    }

    // The safe area goes on top of the offset. The padding is physical and the
    // corner is not, so which of its sides is the start is the direction's
    // question.
    final EdgeInsets safe = MediaQuery.maybePaddingOf(context) ?? EdgeInsets.zero;
    final bool rtl = Directionality.maybeOf(context) == TextDirection.rtl;
    final double safeStart = rtl ? safe.right : safe.left;
    final double safeEnd = rtl ? safe.left : safe.right;
    final bool top = corner == MPCorner.topStart || corner == MPCorner.topEnd;
    final bool start = corner == MPCorner.topStart || corner == MPCorner.bottomStart;

    return PositionedDirectional(
      top: top ? offset + safe.top : null,
      bottom: top ? null : offset + safe.bottom,
      start: start ? offset + safeStart : null,
      end: start ? null : offset + safeEnd,
      child: button,
    );
  }
}
