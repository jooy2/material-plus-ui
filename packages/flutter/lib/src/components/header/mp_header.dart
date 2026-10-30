/// The bar across the top of a page: MD3's top app bar, with a site's own
/// three regions on it.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The bar's floor: 48, 56, 64, 80, 96.
///
/// Its own ladder rather than the control heights, because a bar is not a
/// control: it holds controls, and a bar the height of the button in it has no
/// air. [MPSize.md] is MD3's own small top app bar at 64dp.
const Map<MPSize, double> _barHeight = <MPSize, double>{
  MPSize.xs: 48,
  MPSize.sm: 56,
  MPSize.md: 64,
  MPSize.lg: 80,
  MPSize.xl: 96,
};

/// Inside one slot: between a mark and the name beside it, or two buttons.
const Map<MPSize, double> _slotGap = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 12,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

/// Between the brand, the middle and the actions: about twice the gap inside
/// a slot, so each of the three regions reads as one.
const Map<MPSize, double> _barGap = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 16,
  MPSize.md: 24,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// What the brand is set in: `titleLarge` at [MPSize.md], MD3's own top app
/// bar headline.
MPTypeRole _barTitle(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.titleSmall;
    case MPSize.sm:
      return scale.titleMedium;
    case MPSize.md:
      return scale.titleLarge;
    case MPSize.lg:
      return scale.headlineSmall;
    case MPSize.xl:
      return scale.headlineMedium;
  }
}

/// The bar across the top of a page. **MD3's top app bar**, with a site's own
/// three regions on it: [brand], the middle ([child]) and [actions].
///
/// ```dart
/// MPHeader(
///   brand: const <Widget>[Text('Acme')],
///   actions: <Widget>[MPButton(size: MPSize.sm, onPressed: signIn, child: const Text('Sign in'))],
///   child: navigation,
/// )
/// ```
///
/// The slots are parameters rather than children because the arrangement is
/// fixed, brand, middle, actions, and what a caller decides is what goes in
/// each. That the middle can be centred on the bar's own midline is only
/// possible *because* the ends are the widget's to measure.
///
/// ## Why there is no `divider`
///
/// MD3 separates a bar from the content by **tone**, `surfaceContainer` against
/// `surface`, and the case a hairline exists for is the bar that paints the
/// page's own surface. That bar is [MPVariant.outlined], and the rule along its
/// bottom edge is what `outlined` *means* here: a bar has exactly one edge with
/// anything on the other side of it.
///
/// ## Where it sits
///
/// A Flutter screen has no document scroll for a bar to stick to, so there is
/// no `position`: the bar stays wherever it is placed. Put it above the
/// scrolling part of the screen, which is where `MPPageLayout`'s `header` slot
/// puts it, and it stays in reach while the content scrolls under it.
class MPHeader extends StatelessWidget {
  /// Creates a bar.
  const MPHeader({
    this.child,
    this.brand,
    this.actions,
    this.align = MPAlign.start,
    this.variant = MPVariant.tonal,
    this.elevation,
    this.size,
    this.density,
    this.maxWidth,
    this.padded = true,
    this.semanticLabel,
    super.key,
  });

  /// The middle slot: a row of navigation links, a search field, a headline.
  ///
  /// Set in nothing of the bar's own: it is as likely to be a row of links as a
  /// headline, and a type role imposed on it would be one every one of those
  /// had to undo.
  final Widget? child;

  /// The leading slot: the mark, the product's name, the thing that is the same
  /// on every page, and on a narrow window the `MPSidebarTrigger` that goes
  /// ahead of it. Laid out in a row with the slot's own gap, and set in the
  /// bar's headline role.
  final List<Widget>? brand;

  /// The trailing slot: the account menu, the theme switch, the call to
  /// action. Laid out end-aligned in a row with the slot's own gap.
  final List<Widget>? actions;

  /// Where the middle slot sits.
  ///
  /// [MPAlign.center] is MD3's own **center-aligned top app bar**, centred on
  /// the *bar* rather than in the space left over: both ends are given equal
  /// shares, so the middle stays on the bar's midline however long the brand
  /// is, and an empty end still takes its half.
  final MPAlign align;

  /// How much surface the bar paints, on the **container** ladder. The bar is
  /// never dyed, because what sits on it arrives with colours of its own.
  ///
  /// [MPVariant.tonal], the default, is MD3's scrolled top app bar:
  /// `surfaceContainer` against the page's `surface`. [MPVariant.outlined] is
  /// the flat one, the page's own surface with a hairline where it ends, and
  /// [MPVariant.text] paints nothing at all, for a bar over a hero image.
  final MPVariant variant;

  /// How far off the page the bar is lifted, `0` to `5`. It moves the tone as
  /// well as the shadow. A bar's [MPVariant.elevated] is level 2 rather than
  /// 1, because a bar sits over the page's content rather than in it.
  final MPElevation? elevation;

  /// The bar's height floor, its gutter and the air between its slots.
  /// [MPSize.md] is 64, MD3's own small top app bar. A floor rather than a
  /// height, so a middle slot that wrapped onto a second line is not clipped.
  final MPSize? size;

  /// Takes room out of the bar's gutter. The height floor stays where [size]
  /// put it: the bar is the one part of a screen a reader finds by position.
  final MPDensity? density;

  /// Holds the row of slots to a measure and centres it while the sheet itself
  /// still spans the window. The same parameter `MPContainer`'s `maxWidth` is,
  /// so a header and the container under it line up on one edge by being given
  /// the same value. `null` is no limit.
  final MPResponsive<MPMeasure>? maxWidth;

  /// The gutter down each side of the row.
  final bool padded;

  /// The name the bar is announced by, which also makes it a landmark region.
  /// Worth writing when a screen has more than one bar, because two of them
  /// with no name tell a reader nothing about which is which. Flutter has no
  /// `banner` role, so without a name the bar claims none.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPContainerPaint paint = mpBarPaint(colors, variant, elevation);
    final double slotGap = _slotGap[size]!;
    final bool centred = align == MPAlign.center;
    final bool hasBrand = brand?.isNotEmpty ?? false;
    final bool hasActions = actions?.isNotEmpty ?? false;

    Widget slot(List<Widget> children, {required bool start}) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: start ? MainAxisAlignment.start : MainAxisAlignment.end,
        spacing: slotGap,
        children: children,
      );
    }

    final Widget? brandSlot = hasBrand
        ? DefaultTextStyle.merge(
            style: _barTitle(theme.typescale, size).style(),
            child: slot(brand!, start: true),
          )
        : null;
    final Widget? actionsSlot = hasActions ? slot(actions!, start: false) : null;

    // Centred, both ends take an equal share by construction and the middle its
    // own width between them, so it lands on the bar's midline whatever is in
    // the ends. Packed, the ends are as wide as they are and the middle takes
    // the rest, which is the arrangement of an application's bar.
    final List<Widget> regions = centred
        ? <Widget>[
            Expanded(
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                // As tall as what is in it: an `Align` left to itself fills the
                // cross axis.
                heightFactor: 1,
                child: brandSlot,
              ),
            ),
            if (child != null) Flexible(child: child!),
            Expanded(
              child: Align(
                alignment: AlignmentDirectional.centerEnd,
                heightFactor: 1,
                child: actionsSlot,
              ),
            ),
          ]
        : <Widget>[
            ?brandSlot,
            if (child != null)
              Expanded(
                child: Align(
                  alignment: align == MPAlign.end
                      ? AlignmentDirectional.centerEnd
                      : AlignmentDirectional.centerStart,
                  heightFactor: 1,
                  child: child,
                ),
              )
            else if (brandSlot != null && actionsSlot != null)
              // With no middle the actions still sit at the end of the bar.
              const Spacer(),
            ?actionsSlot,
          ];

    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final bool outlined = variant == MPVariant.outlined;

    // Centred, the middle is a loose flex child, so the row hands it a third of
    // the space and lays the part it did not use out after the last end;
    // `center` splits that part evenly across both sides instead, which is
    // what makes the midline exact rather than nearly right.
    Widget bar = Row(
      mainAxisAlignment: centred ? MainAxisAlignment.center : MainAxisAlignment.start,
      spacing: _barGap[size]!,
      children: regions,
    );

    bar = Padding(
      padding: EdgeInsets.symmetric(horizontal: padded ? mpSheetPadOf(size, density) : 0),
      child: bar,
    );

    final double limit = mpMeasureOf(context, maxWidth);

    if (limit.isFinite) {
      bar = Align(
        alignment: Alignment.topCenter,
        heightFactor: 1,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: limit),
          child: bar,
        ),
      );
    }

    bar = ConstrainedBox(
      // The rule is inside the floor, as CSS's `border-box` puts it.
      constraints: BoxConstraints(minHeight: _barHeight[size]!, minWidth: double.infinity),
      child: Padding(
        padding: EdgeInsets.only(bottom: outlined ? rule.width : 0),
        child: Center(heightFactor: 1, widthFactor: 1, child: bar),
      ),
    );

    bar = DecoratedBox(
      // A bar spans an edge of the screen, and a rounded corner against the
      // edge of the screen is a gap with nothing behind it.
      decoration: BoxDecoration(
        color: paint.color,
        border: outlined ? Border(bottom: rule) : null,
        boxShadow: paint.shadows,
      ),
      child: DefaultTextStyle.merge(
        style: TextStyle(color: colors.onSurface),
        child: bar,
      ),
    );

    if (semanticLabel == null) {
      return bar;
    }

    return Semantics(
      role: SemanticsRole.region,
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: bar,
    );
  }
}
