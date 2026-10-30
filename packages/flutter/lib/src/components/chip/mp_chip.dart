/// A compact token: a tag, a filter, a status, an entity plucked out of a list.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/dismiss.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/target.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// A chip's height, and the one ladder in the library that is **not** a step
/// off the control heights.
///
/// MD3 draws a chip at 32dp, and 32 is the control ladder's `xs`, so reusing
/// that ladder would put the specification's chip three rungs below its button
/// and leave `md` at 56px, a button with squarer corners. A chip is a token
/// inside a row of content, not a control the row lines up against, so `md` is
/// 32 and the ladder is centred on it.
const Map<MPSize, double> _height = <MPSize, double>{
  MPSize.xs: 24,
  MPSize.sm: 28,
  MPSize.md: 32,
  MPSize.lg: 40,
  MPSize.xl: 48,
};

/// MD3's chip padding is 16dp at the ends, and the ladder walks out from
/// there, more slowly than a button's: a chip's label is the whole chip, and a
/// wide gutter round a one-word tag reads as a button that lost its verb.
const Map<MPSize, double> _padX = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 12,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

const Map<MPSize, double> _gap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 8,
  MPSize.xl: 10,
};

/// The end padding a chip with a delete affordance keeps: the affordance
/// brings its own room, and the chip's on top would leave the × floating in
/// the middle of a gap.
const double _deletePadEnd = 8;

/// How big the tick a selected chip leads with is, against its label.
const double _tickScale = 1.25;

/// How big the count plate's digits are, against the label.
const double _countScale = 0.85;

/// `labelLarge` at `md`, MD3's own chip label role, and one step down at the
/// two rungs where 14px would fill the whole 24px box.
MPTypeRole _textRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return scale.labelMedium;
    case MPSize.md:
    case MPSize.lg:
      return scale.labelLarge;
    case MPSize.xl:
      return scale.titleMedium;
  }
}

/// The corner, and the one place a chip visibly refuses to be a button.
///
/// MD3 shapes a chip at `small`, 8dp, while every button in the system is
/// `full`. That difference is why a row of chips under a search field does not
/// read as a row of buttons, and why no rung here reaches for `full`.
double _radius(MPShapes shapes, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return shapes.extraSmall;
    case MPSize.sm:
    case MPSize.md:
    case MPSize.lg:
      return shapes.small;
    case MPSize.xl:
      return shapes.medium;
  }
}

/// A compact token: a tag, a filter, a status, an entity plucked out of a list.
///
/// ```dart
/// MPChip(onPressed: toggle, selected: on, child: const Text('Open'))
/// ```
///
/// A chip with no [onPressed] is a label and takes no focus. With one it is a
/// button: one focus stop, activated by pointer, <kbd>Enter</kbd> or
/// <kbd>Space</kbd>. [onDelete] adds a second, separate stop for the ×, and
/// neither is inside the other, which is the same shape the React build takes
/// because a `<button>` inside a `<button>` is invalid HTML.
class MPChip extends StatelessWidget {
  /// Creates a chip.
  const MPChip({
    this.child,
    this.onPressed,
    this.onDelete,
    this.deleteLabel,
    this.locale,
    this.variant = MPVariant.outlined,
    this.size,
    this.color,
    this.startIcon,
    this.endIcon,
    this.count,
    this.selected,
    this.disabled = false,
    this.focusNode,
    this.autofocus = false,
    super.key,
  }) : assert(
         count == null || count is num || count is String || count is Widget,
         'MPChip.count must be a number, a String or a Widget',
       );

  /// The label, usually a [Text]. Cut short with an ellipsis when the chip is
  /// given less room than it needs.
  final Widget? child;

  /// Runs when the chip is pressed. Passing it is what makes the chip a button.
  final VoidCallback? onPressed;

  /// Runs when the chip's delete affordance is pressed. Passing it is what
  /// makes the affordance appear.
  final VoidCallback? onDelete;

  /// The delete affordance's name for a screen reader. Defaults to the word
  /// for "remove" in [locale].
  final String? deleteLabel;

  /// Which language the delete affordance's default name is in. Falls back to
  /// the nearest `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// How much surface the chip paints.
  ///
  /// [MPVariant.outlined] is the default because it is MD3's: an assist,
  /// filter and input chip are all outlined at rest, and the outlined chip is
  /// the one that stays legible in a row of twenty.
  final MPVariant variant;

  /// Which rung of the chip's own ladder, 24 to 48px. [MPSize.md], 32px,
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family it reads. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise.
  final MPColor? color;

  /// Placed before the label: an icon, a status dot, an avatar.
  final Widget? startIcon;

  /// Placed after the label, before any [count].
  final Widget? endIcon;

  /// A number set into the end of the chip, on its own small plate, so
  /// "Errors 12" reads as one token with a count rather than as two words. A
  /// number, a String or a Widget.
  final Object? count;

  /// Marks the chip as chosen, a filter that is on.
  ///
  /// MD3's selected filter chip fills with the container tone of its own
  /// family rather than changing family, which is what this does: a filter that
  /// is on is still the same filter. It also leads with a tick, unless
  /// [startIcon] is set.
  ///
  /// Deliberately **without a default**. Passing it, either way round, is what
  /// says this chip is a toggle, and only then is it announced as selected or
  /// not. A chip that merely has an [onPressed] is an action, and an action
  /// announced as "not selected" is a screen reader describing a state the chip
  /// does not have.
  final bool? selected;

  /// Unavailable. Drops the accent family for the specification's disabled
  /// treatment, as everywhere else in the library.
  final bool disabled;

  /// Drives the pressable chip's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final bool pressable = onPressed != null;
    final bool interactive = pressable && !disabled;

    // The same widgets above the label whether the chip is pressable or not,
    // with the difference in their flags: a chip wrapped only while it could be
    // pressed would be built again from scratch as `onPressed` came or went.
    return MPInteractive(
      onTap: onPressed,
      enabled: interactive,
      interactive: interactive,
      pressable: pressable,
      cursor: interactive
          ? SystemMouseCursors.click
          : pressable
          ? SystemMouseCursors.basic
          : MouseCursor.defer,
      focusNode: focusNode,
      autofocus: autofocus,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: pressable || disabled,
          button: pressable ? true : null,
          selected: pressable ? selected : null,
          enabled: pressable || disabled ? !disabled : null,
          focused: focus.focused,
          onFocus: focus.onFocus,
          expanded: focus.expanded,
          onTap: interactive ? onPressed : null,
          child: _shell(
            context,
            state: state,
            interactive: interactive,
            // The chip's own focus only: the × inside is a stop of its own
            // that draws its own ring.
            focusVisible: state.focusVisible && Focus.of(context).hasPrimaryFocus,
          ),
        );
      },
    );
  }

  Widget _shell(
    BuildContext context, {
    required MPInteraction state,
    required bool interactive,
    required bool focusVisible,
  }) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(color ?? config?.color ?? MPColor.primary);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    final MPTypeRole role = _textRole(theme.typescale, size);
    final double fontSize = role.size;
    final BorderRadius radius = BorderRadius.circular(_radius(theme.shapes, size));
    final _ChipPaint paint = _paintFor(
      colors,
      accent,
      variant,
      selected: selected ?? false,
      disabled: disabled,
    );

    // MD3's selected filter chip leads with a tick, and on a filled or tonal
    // chip it is the only thing that changes, since both already rest on the
    // tones a selected chip takes. A caller's own `startIcon` is never
    // replaced: it may be an avatar, and a chip that draws its own tick when it
    // is on would otherwise draw two.
    final Widget? leading =
        startIcon ??
        ((selected ?? false) ? MPGlyph(MPGlyphShape.check, size: fontSize * _tickScale) : null);

    final Widget? countPlate = count == null
        ? null
        : _CountPlate(
            count: count!,
            fontSize: fontSize,
            fill: variant == MPVariant.filled
                ? accent.onColor.withValues(alpha: 0.2)
                : accent.container,
            ink: variant == MPVariant.filled ? accent.onColor : accent.onContainer,
          );

    Widget body = Row(
      mainAxisSize: MainAxisSize.min,
      spacing: _gap[size]!,
      // Each part keyed, because a filter chip that is chosen gains a tick in
      // front of the label in the same build, and a part found by its place
      // alone would be built again from scratch.
      children: <Widget>[
        if (leading != null) KeyedSubtree(key: const ValueKey<_Slot>(_Slot.start), child: leading),
        if (child != null) Flexible(key: const ValueKey<_Slot>(_Slot.label), child: child!),
        if (endIcon != null) KeyedSubtree(key: const ValueKey<_Slot>(_Slot.end), child: endIcon!),
        if (countPlate != null)
          Padding(
            key: const ValueKey<_Slot>(_Slot.count),
            padding: const EdgeInsetsDirectional.only(start: 2),
            child: countPlate,
          ),
      ],
    );

    Widget? delete;
    double slack = 0;

    if (onDelete != null) {
      final String name =
          deleteLabel ?? mpMessagesOf(context, mpCommonMessages, locale: locale)['remove']!;
      final double glyph = fontSize * dismissScale;
      // React's × sits in a box 1.35 times the label, 2px after the label and
      // 4px into the chip's end padding. The shared affordance's box is the
      // glyph itself, so the difference goes on either side of it: before it,
      // and into the end padding, which is where React's negative margin was.
      slack = (fontSize * 1.35 - glyph) / 2;

      delete = Padding(
        padding: EdgeInsetsDirectional.only(start: 2 + slack),
        child: MPDismissButton(
          label: name,
          onPressed: disabled ? null : onDelete,
          size: glyph,
          color: paint.ink,
          ring: colors.secondary,
        ),
      );
    }

    body = Padding(
      padding: EdgeInsetsDirectional.only(
        start: _padX[size]!,
        end: onDelete != null ? _deletePadEnd - 4 + slack : _padX[size]!,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Flexible(child: body),
          ?delete,
        ],
      ),
    );

    body = DefaultTextStyle.merge(
      style: role.style(paint.ink),
      maxLines: 1,
      softWrap: false,
      overflow: TextOverflow.ellipsis,
      child: IconTheme.merge(
        data: IconThemeData(size: fontSize * _tickScale, color: paint.ink),
        child: body,
      ),
    );

    // Sized outside the animation, as a button is: the colours ease, the
    // height does not.
    Widget chip = SizedBox(
      height: _height[size],
      child: AnimatedContainer(
        duration: duration,
        curve: MPMotion.standard,
        decoration: BoxDecoration(
          color: paint.fill,
          borderRadius: radius,
          border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
          boxShadow: paint.shadows,
        ),
        clipBehavior: Clip.antiAlias,
        child: MPStateLayer(
          color: paint.ink,
          opacity: mpStateLayerOpacity(state, enabled: interactive),
          borderRadius: radius,
          child: Center(widthFactor: 1, child: body),
        ),
      ),
    );

    // The ring is always there, with only the painter coming and going: a ring
    // wrapped round the chip when it is needed would move the chip to a new
    // parent as the focus steps on to the ×, and the × built again would lose
    // the focus it had just been given.
    chip = CustomPaint(
      foregroundPainter: focusVisible
          ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
          : null,
      child: chip,
    );

    // Lets the × be pressed from a 24px square even on the smallest chip.
    return MPTargetScope(child: chip);
  }
}

/// The parts of a chip's row, as keys nobody else's widget can carry.
enum _Slot { start, label, end, count }

/// The count's own small plate. On a filled chip it is a hole punched in the
/// fill; on a bare or outlined one it is the container tone showing through.
class _CountPlate extends StatelessWidget {
  const _CountPlate({
    required this.count,
    required this.fontSize,
    required this.fill,
    required this.ink,
  });

  final Object count;
  final double fontSize;
  final Color fill;
  final Color ink;

  @override
  Widget build(BuildContext context) {
    final Object count = this.count;

    return DecoratedBox(
      decoration: BoxDecoration(color: fill, borderRadius: BorderRadius.circular(fontSize)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        child: DefaultTextStyle.merge(
          style: TextStyle(
            color: ink,
            fontSize: fontSize * _countScale,
            fontWeight: FontWeight.w500,
            height: 1,
            leadingDistribution: TextLeadingDistribution.even,
            fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
          ),
          child: count is Widget ? count : Text('$count'),
        ),
      ),
    );
  }
}

/// What a chip paints in one state.
class _ChipPaint {
  const _ChipPaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

const Color _clear = Color(0x00000000);

/// The surface for [variant] at rest, selected or disabled.
///
/// At rest a chip *is* the thing being coloured, so its surface takes the tint,
/// except that the quiet variants read `onSurfaceVariant`: the label of a
/// filter that is off is not making a claim, and twenty accent-coloured labels
/// in a row is a filter bar that looks all switched on.
///
/// Selected fills with the family's container tone and takes its `on` ink.
/// Filled and tonal already rest on those tones and have nowhere louder to go,
/// so they stay put and let the tick say it.
///
/// Disabled is the specification's: content at 38% and a container at 12%,
/// both of `onSurface`, with the accent gone entirely.
_ChipPaint _paintFor(
  MPColorScheme colors,
  MPAccent accent,
  MPVariant variant, {
  required bool selected,
  required bool disabled,
}) {
  if (disabled) {
    final Color ink = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color container = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);

    switch (variant) {
      case MPVariant.filled:
      case MPVariant.tonal:
      case MPVariant.elevated:
        return _ChipPaint(fill: container, ink: ink);
      case MPVariant.outlined:
        return _ChipPaint(
          fill: _clear,
          ink: ink,
          border: BorderSide(color: container),
        );
      case MPVariant.text:
        return _ChipPaint(fill: _clear, ink: ink);
    }
  }

  switch (variant) {
    case MPVariant.filled:
      return _ChipPaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _ChipPaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _ChipPaint(
        fill: selected ? accent.container : colors.surfaceContainerLow,
        ink: selected ? accent.onContainer : colors.onSurfaceVariant,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _ChipPaint(
        fill: selected ? accent.container : _clear,
        ink: selected ? accent.onContainer : colors.onSurfaceVariant,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return selected
          ? _ChipPaint(fill: accent.container, ink: accent.onContainer)
          : _ChipPaint(fill: _clear, ink: colors.onSurfaceVariant);
  }
}
