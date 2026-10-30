/// A row of destinations held against the bottom edge of the screen.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/bottom_navigation.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/bottom_navigation.dart'
    show MPBottomNavigationLabels, MPBottomNavigationValue;

/// The bar's height.
///
/// `md` is MD3's own 80dp: tall enough for a glyph in its indicator with a
/// word under it, and short enough not to compete with the screen it is at the
/// bottom of. The rest of the ladder keeps that proportion.
const Map<MPSize, double> _barHeight = <MPSize, double>{
  MPSize.xs: 56,
  MPSize.sm: 64,
  MPSize.md: 80,
  MPSize.lg: 88,
  MPSize.xl: 96,
};

/// The slot the glyph sits in, which is MD3's 64×32dp active indicator at
/// `md`.
///
/// The slot never changes size: it is what holds the destination in place, so a
/// row of five would shuffle every time the reader moved between them if it
/// did. The pill is a layer inside it that travels between the slot's full
/// width and a circle as wide as the slot is tall.
const Map<MPSize, Size> _indicator = <MPSize, Size>{
  MPSize.xs: Size(48, 24),
  MPSize.sm: Size(56, 28),
  MPSize.md: Size(64, 32),
  MPSize.lg: Size(72, 36),
  MPSize.xl: Size(80, 40),
};

/// The glyph. MD3's is 24dp.
const Map<MPSize, double> _itemIcon = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 22,
  MPSize.md: 24,
  MPSize.lg: 26,
  MPSize.xl: 28,
};

/// Between the indicator and the name under it.
const Map<MPSize, double> _itemGap = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 2,
  MPSize.md: 4,
  MPSize.lg: 4,
  MPSize.xl: 6,
};

/// The inline padding on either side of a destination, React's `px-1`.
const double _itemPadX = 4;

/// A destination's name: `labelMedium` at `md`, which is MD3's own. A
/// destination is named rather than described, and the label scale is the one
/// Material sets names in.
MPTypeRole _itemText(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return scale.labelSmall;
    case MPSize.md:
    case MPSize.lg:
      return scale.labelMedium;
    case MPSize.xl:
      return scale.labelLarge;
  }
}

/// A row of destinations held against the bottom edge of the screen.
///
/// **MD3 calls this the navigation bar**; the name here is the one the pattern
/// is still known by, and the two are the same component. What is drawn is the
/// specification's: a `surfaceContainer` bar 80dp tall, with the destination
/// the reader is on marked by a 64×32dp `secondaryContainer` pill behind its
/// glyph.
///
/// ```dart
/// MPBottomNavigation(
///   label: 'Main',
///   value: page,
///   onChanged: (Object next) => setState(() => page = next),
///   children: const <Widget>[
///     MPBottomNavigationItem(value: 'home', label: 'Home', icon: HomeGlyph()),
///     MPBottomNavigationItem(value: 'search', label: 'Search', icon: SearchGlyph()),
///   ],
/// )
/// ```
///
/// Controlled with [value] and [onChanged], or left to hold its own place from
/// [initialValue].
///
/// ## Why it is navigation and not a tab bar
///
/// A tab bar owes a keyboard reader one focus stop for the whole set and arrow
/// keys within it, and owes a screen reader a panel per tab; a navigation bar
/// switches what the *screen* is, not which panel of one is showing. Claiming
/// the role without the behaviour is worse than never claiming it. So the bar
/// is a navigation landmark and every destination is an ordinary button, its
/// own focus stop, with the one the reader is on marked selected.
///
/// ## Why it takes no `color`
///
/// The active indicator is `secondaryContainer` because MD3 says it is: a mark
/// saying *where you are* is not an accent statement, and `primary` is what a
/// screen keeps for the action it is about.
///
/// ## Where it sits
///
/// Wherever the layout puts it. React's `position` is a CSS idea; here the bar
/// is the last child of the screen's `Column`, and [safeArea] keeps the row
/// clear of the home indicator while the surface runs under it.
class MPBottomNavigation extends StatefulWidget {
  /// Creates a bar of [children], which are [MPBottomNavigationItem]s.
  const MPBottomNavigation({
    required this.children,
    this.value,
    this.initialValue,
    this.onChanged,
    this.labels = MPBottomNavigationLabels.all,
    this.size,
    this.divider = false,
    this.safeArea = true,
    this.disabled = false,
    this.label,
    super.key,
  });

  /// The destinations: three to five [MPBottomNavigationItem]s.
  final List<Widget> children;

  /// The destination the reader is on. Given, the bar is controlled.
  ///
  /// `null` cannot also mean "controlled, on none of them", so a controlled
  /// bar with nothing current holds its own place until the first press,
  /// reports it through [onChanged], and is controlled from then on.
  final MPBottomNavigationValue? value;

  /// The destination that starts current, for a bar that holds its own place.
  final MPBottomNavigationValue? initialValue;

  /// Called with the value of the destination that was pressed.
  final ValueChanged<MPBottomNavigationValue>? onChanged;

  /// Which names are drawn. An undrawn name is still announced.
  final MPBottomNavigationLabels labels;

  /// The bar's height and type scale. [MPSize.md], MD3's own 80dp, unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// A hairline along the top edge.
  ///
  /// Off by default, because MD3 separates the bar from the screen by *tone*:
  /// the container is `surfaceContainer` against the screen's `surface`. Turn
  /// it on when the screen behind it is the same tone.
  final bool divider;

  /// Keeps the destinations clear of a phone's home indicator by adding the
  /// window's bottom inset under them. The surface still reaches the bottom of
  /// the screen; only the row moves up.
  final bool safeArea;

  /// Every destination stops answering.
  final bool disabled;

  /// The name the bar is announced by: "Main", "Sections". A navigation
  /// landmark with no name is listed as "navigation", and two of them without
  /// names are two a reader cannot tell apart.
  final String? label;

  @override
  State<MPBottomNavigation> createState() => _MPBottomNavigationState();
}

class _MPBottomNavigationState extends State<MPBottomNavigation> {
  late MPBottomNavigationValue? _own = widget.initialValue;

  MPBottomNavigationValue? get _value => widget.value ?? _own;

  void _select(MPBottomNavigationValue next) {
    if (widget.value == null) {
      setState(() => _own = next);
    }

    widget.onChanged?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPSize size = widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double inset = widget.safeArea ? MediaQuery.maybePaddingOf(context)?.bottom ?? 0 : 0;

    final Widget row = SizedBox(
      height: _barHeight[size],
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        // A full-width bar divides its own width between its destinations.
        children: <Widget>[for (final Widget child in widget.children) Expanded(child: child)],
      ),
    );

    final Widget bar = DecoratedBox(
      decoration: BoxDecoration(
        color: colors.surfaceContainer,
        border: widget.divider ? Border(top: BorderSide(color: colors.outlineVariant)) : null,
      ),
      // The inset goes under the row and inside the surface, which is what keeps
      // the container running to the bottom of the screen rather than stopping
      // in a stripe above the home indicator.
      child: Padding(
        padding: EdgeInsets.only(bottom: inset),
        child: MPBottomNavigationScope(
          value: _value,
          onSelect: _select,
          size: size,
          labels: widget.labels,
          disabled: widget.disabled,
          floating: false,
          child: row,
        ),
      ),
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      role: SemanticsRole.navigation,
      label: widget.label,
      child: bar,
    );
  }
}

/// One destination, in an [MPBottomNavigation] or an
/// `MPFloatingBottomNavigation`.
///
/// It has no `size` and no colour of its own: both belong to the bar, which is
/// the only place they can be set once and mean the same thing for every
/// destination. A bar whose third destination is a rung out is not a bar.
class MPBottomNavigationItem extends StatelessWidget {
  /// Creates a destination worth [value], named [label].
  const MPBottomNavigationItem({
    required this.value,
    required this.label,
    this.icon,
    this.activeIcon,
    this.disabled = false,
    this.onPressed,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// Identifies the destination. What the bar's `onChanged` reports.
  final MPBottomNavigationValue value;

  /// The destination's name.
  ///
  /// A `String` rather than a widget, and required. It is drawn when the bar's
  /// `labels` says so, and it is **always** what a screen reader announces: a
  /// glyph on its own has no accessible name at all, and a name that could be
  /// any widget could not also be the semantics label of one left undrawn.
  final String label;

  /// The glyph, drawn inside the active indicator.
  final Widget? icon;

  /// A second glyph for while this is the destination the reader is on. MD3
  /// fills the selected icon and outlines the rest, which is a signal that
  /// survives being seen out of the corner of an eye. Falls back to [icon].
  final Widget? activeIcon;

  /// Unavailable, but still part of the set.
  final bool disabled;

  /// Called after the bar has been told, for a destination that does more than
  /// move the bar: the place a router is called.
  final VoidCallback? onPressed;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPBottomNavigationScope? bar = MPBottomNavigationScope.maybeOf(context);
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = bar?.size ?? MPSize.md;
    final MPBottomNavigationLabels labels = bar?.labels ?? MPBottomNavigationLabels.all;
    final bool unavailable = disabled || (bar?.disabled ?? false);
    final bool current = bar?.value != null && bar!.value == value;
    final bool named =
        labels == MPBottomNavigationLabels.all ||
        (labels == MPBottomNavigationLabels.selected && current);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    final Color drained = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color labelInk = unavailable
        ? drained
        : current
        ? colors.onSurface
        : colors.onSurfaceVariant;
    // The glyph sits on the pill when it is current, so it takes the pill's
    // own ink; otherwise it reads as the label does.
    final Color glyphInk = unavailable
        ? drained
        : current
        ? colors.onSecondaryContainer
        : colors.onSurfaceVariant;

    void select() {
      if (unavailable) {
        return;
      }

      bar?.onSelect(value);
      onPressed?.call();
    }

    return MPInteractive(
      onTap: select,
      enabled: !unavailable,
      interactive: !unavailable,
      focusNode: focusNode,
      autofocus: autofocus,
      cursor: unavailable ? SystemMouseCursors.basic : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        final Widget? glyph = current ? (activeIcon ?? icon) : icon;
        final bool hasGlyph = icon != null || activeIcon != null;

        final List<Widget> parts = <Widget>[
          if (hasGlyph)
            _Indicator(
              size: size,
              current: current,
              unavailable: unavailable,
              ink: glyphInk,
              wash: mpStateLayerOpacity(state, enabled: !unavailable),
              duration: duration,
              glyph: glyph,
            ),
          if (hasGlyph && named) SizedBox(height: _itemGap[size]),
          // Undrawn is not unsaid: the name is the destination's semantics
          // label whatever `labels` says, and only the drawing goes.
          if (named)
            Text(
              label,
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: _itemText(theme.typescale, size).style(labelInk),
            ),
        ];

        final Widget content = Padding(
          padding: const EdgeInsets.symmetric(horizontal: _itemPadX),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: parts),
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          enabled: !unavailable,
          // The one destination the reader is on, and only that one: the
          // others claim no selected state at all, as the React item claims
          // `aria-current` on one alone.
          selected: current ? true : null,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          expanded: focus.expanded,
          onTap: unavailable ? null : select,
          child: ExcludeSemantics(
            child: CustomPaint(
              // Inward, as React's `-outline-offset-2`: the destination sits
              // inside a bar, and a floating bar clips to its own stadium.
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(
                      color: colors.secondary,
                      borderRadius: BorderRadius.zero,
                      offset: -focusRingWidth,
                    )
                  : null,
              child: content,
            ),
          ),
        );
      },
    );
  }
}

/// The glyph's slot, with MD3's active indicator and the state layer in it.
class _Indicator extends StatelessWidget {
  const _Indicator({
    required this.size,
    required this.current,
    required this.unavailable,
    required this.ink,
    required this.wash,
    required this.duration,
    required this.glyph,
  });

  final MPSize size;
  final bool current;
  final bool unavailable;
  final Color ink;
  final double wash;
  final Duration duration;
  final Widget? glyph;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final Size box = _indicator[size]!;
    final double icon = _itemIcon[size]!;
    final BorderRadius pill = MPShapes.circular(theme.shapes.full, height: box.height);

    return SizedBox(
      width: box.width,
      height: box.height,
      child: Stack(
        alignment: Alignment.center,
        children: <Widget>[
          // MD3's active indicator, and the whole of the selected treatment: it
          // is why a navigation bar needs no underline, no bold and no second
          // colour to say where you are.
          //
          // It widens out of a circle the size of the slot's height, which is
          // the motion the specification draws: a fill that only faded would say
          // *that* the destination changed without saying the pill went there.
          // A width rather than a scale, because a pill stretched sideways is an
          // ellipse and a pill that widens is a pill at every frame. The opacity
          // goes with the width, so a destination being left closes rather
          // than blinking out.
          if (!unavailable)
            AnimatedOpacity(
              opacity: current ? 1 : 0,
              duration: duration,
              curve: MPMotion.standard,
              child: AnimatedContainer(
                duration: duration,
                curve: MPMotion.standard,
                width: current ? box.width : box.height,
                height: box.height,
                decoration: BoxDecoration(
                  color: theme.colors.secondaryContainer,
                  borderRadius: pill,
                ),
              ),
            ),
          // The state layer covers the whole slot, so a hover anywhere on the
          // destination lights the place its pill would be.
          if (!unavailable)
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedContainer(
                  duration: duration,
                  curve: MPMotion.standard,
                  decoration: BoxDecoration(
                    color: ink.withValues(alpha: wash),
                    borderRadius: pill,
                  ),
                ),
              ),
            ),
          SizedBox.square(
            dimension: icon,
            child: TweenAnimationBuilder<Color?>(
              tween: ColorTween(end: ink),
              duration: duration,
              curve: MPMotion.standard,
              builder: (BuildContext context, Color? value, Widget? child) {
                return IconTheme.merge(
                  data: IconThemeData(size: icon, color: value),
                  child: DefaultTextStyle.merge(
                    style: TextStyle(color: value),
                    child: child!,
                  ),
                );
              },
              child: Center(child: glyph ?? const SizedBox.shrink()),
            ),
          ),
        ],
      ),
    );
  }
}
