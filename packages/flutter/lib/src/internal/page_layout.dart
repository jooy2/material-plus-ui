/// The vocabulary a screen's structure is written in, and what the components
/// that build one share.
///
/// The Dart half of the React package's `internal/page-layout.ts`, and it is
/// here for the same reason: several components read it — [MPPageLayout],
/// [MPHeader], [MPFooter], [MPSidebar] and [MPSidebarTrigger] — and every one
/// of them is also usable on its own. Keeping the scope in the layout's file
/// would make a header import a layout it may never be inside.
///
/// What the React version also has and this does not is the **measurement**.
/// There, a sidebar that holds its place has to be told how tall the header is,
/// because a `sticky` bar sits across the top of the window without taking
/// anything out of the flow. Here a [Column] has already done that arithmetic:
/// the band below the header is exactly what the header left, so there is
/// nothing to measure and nothing to write anywhere.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which end of the band a sidebar takes. Logical, so it flips under RTL.
enum MPSidebarSide {
  /// The leading end — the left of an English screen, the right of an Arabic one.
  start,

  /// The trailing end.
  end,
}

/// How far across a header or a footer reaches.
///
/// - [full] — the whole width, with the sidebars beginning underneath it. The
///   arrangement of a website: one bar across the top, and the screen below it.
/// - [content] — only the column between the sidebars, which run the full
///   height beside it. The arrangement of an application: the navigation is the
///   outermost thing on the screen and the bar belongs to the view.
///
/// There is no third value, because there is no third arrangement: what is
/// being decided is which of the two takes the corner.
enum MPPageLayoutSpan {
  /// The whole width.
  full,

  /// Only the column between the sidebars.
  content,
}

/// The window size class below which a sidebar stops being a column.
///
/// [MPWindowClass]'s five and [none], the React package's
/// `MPWindowClass | 'none'` as one enum, because a nullable [MPWindowClass]
/// would spend `null` on "nobody said" and leave nothing to say "never".
///
/// [compact] is accepted and means the same as [none]: its floor is nought, so
/// there is no width below it and a sidebar that collapsed there would never
/// collapse.
enum MPPageCollapse {
  /// Columns at every width.
  none,

  /// The same as [none].
  compact,

  /// Below 600dp, unless the breakpoints were moved.
  medium,

  /// Below 840dp. A page layout's default, and MD3's own answer.
  expanded,

  /// Below 1200dp.
  large,

  /// Below 1600dp.
  extraLarge;

  /// The class this names, or `null` for [none].
  MPWindowClass? get windowClass {
    switch (this) {
      case MPPageCollapse.none:
        return null;
      case MPPageCollapse.compact:
        return MPWindowClass.compact;
      case MPPageCollapse.medium:
        return MPWindowClass.medium;
      case MPPageCollapse.expanded:
        return MPWindowClass.expanded;
      case MPPageCollapse.large:
        return MPWindowClass.large;
      case MPPageCollapse.extraLarge:
        return MPWindowClass.extraLarge;
    }
  }
}

/// What a sidebar and a trigger read off the layout around them.
class MPPageLayoutScope extends InheritedWidget {
  /// Wraps the band a layout arranges.
  const MPPageLayoutScope({
    required this.collapsed,
    required this.open,
    required this.setOpen,
    required super.child,
    this.width,
    this.collapseBelow = MPPageCollapse.none,
    this.locale,
    super.key,
  });

  /// Whether the layout is narrow enough that its sidebars are drawers.
  ///
  /// Measured with a [LayoutBuilder] against the space the layout was actually
  /// given rather than against the window, which is the one thing this can do
  /// better than a media query: an app shell inside a pane collapses when *the
  /// pane* is narrow, not when the window is.
  final bool collapsed;

  /// Whether each side's drawer is open. Only meaningful while [collapsed].
  final Map<MPSidebarSide, bool> open;

  /// Opens or closes one of them.
  final void Function(MPSidebarSide side, bool open) setOpen;

  /// The width the layout was given, which [collapsed] was measured against,
  /// or `null` while it had none to speak of. A sidebar or a trigger with a
  /// `collapseBelow` of its own measures the same width against its own class.
  final double? width;

  /// The class [collapsed] was answered for.
  final MPPageCollapse collapseBelow;

  /// The language the layout's own words are in, which its sidebars and
  /// triggers speak unless told otherwise.
  final String? locale;

  /// The layout above, or `null` when there is not one.
  ///
  /// A sidebar, a header and a footer all build perfectly well without one —
  /// they are a panel, a bar and a bar. What they cannot do on their own is
  /// agree with each other about where they sit, which is the whole of what a
  /// layout adds and the reason a component has to be able to tell.
  static MPPageLayoutScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPPageLayoutScope>();
  }

  @override
  bool updateShouldNotify(MPPageLayoutScope oldWidget) {
    return collapsed != oldWidget.collapsed ||
        open[MPSidebarSide.start] != oldWidget.open[MPSidebarSide.start] ||
        open[MPSidebarSide.end] != oldWidget.open[MPSidebarSide.end] ||
        width != oldWidget.width ||
        collapseBelow != oldWidget.collapseBelow ||
        locale != oldWidget.locale;
  }
}

/// Which end of the band the sidebar being built right now takes.
///
/// A second, one-value scope rather than a field on the one above, because it
/// is the one fact that differs *between* two sidebars in the same layout: the
/// layout wraps each slot in its own scope, so a sidebar handed to the trailing
/// slot needs no `side` of its own to know where it is. Absent is "nobody
/// said", which a standalone sidebar reads as [MPSidebarSide.start].
class MPSidebarSideScope extends InheritedWidget {
  /// Wraps one sidebar.
  const MPSidebarSideScope({required this.side, required super.child, super.key});

  /// The end this sidebar takes.
  final MPSidebarSide side;

  /// The side named for this subtree, or `null` when nobody said.
  static MPSidebarSide? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPSidebarSideScope>()?.side;
  }

  @override
  bool updateShouldNotify(MPSidebarSideScope oldWidget) => side != oldWidget.side;
}

/// Marks a subtree as inside a page layout's main region.
///
/// Flutter refuses, in a debug build with semantics on, a complementary or a
/// main region inside another landmark. A sidebar inside the content of a page
/// and a layout inside another layout's content are both ordinary, so each
/// asks this before it claims a role, and keeps its name without the role when
/// the answer is yes.
class MPLandmarkScope extends InheritedWidget {
  /// Wraps a main region.
  const MPLandmarkScope({required super.child, super.key});

  /// Whether [context] is inside a main region a page layout claimed.
  ///
  /// Looked up without depending on it: the answer is where the widget is, and
  /// a widget that moved has been built again anyway.
  static bool within(BuildContext context) {
    return context.getInheritedWidgetOfExactType<MPLandmarkScope>() != null;
  }

  @override
  bool updateShouldNotify(MPLandmarkScope oldWidget) => false;
}

/// [MPSidebarSide.start] and [MPSidebarSide.end] as the two sides a
/// [MPDrawer] speaks.
///
/// A sidebar says which end of the band it takes, because that is a layout
/// question and a layout flips under RTL on its own. A drawer is attached to an
/// edge of the screen, which [MPSide] names physically for the same reason a
/// tooltip above a button is above it in every writing direction — so the two
/// have to be translated, and the ambient [TextDirection] is what translates
/// them.
MPSide drawerSide(MPSidebarSide side, TextDirection direction) {
  final bool rtl = direction == TextDirection.rtl;

  if (side == MPSidebarSide.start) {
    return rtl ? MPSide.right : MPSide.left;
  }

  return rtl ? MPSide.left : MPSide.right;
}

/// Whether a space [width] wide is narrower than [collapseBelow], with the
/// classes beginning where [minimums] says.
///
/// A width that is not finite is not a narrow one: a layout with no width to
/// speak of yet, the frame before a pane is measured, would otherwise open as
/// a drawer once and snap back.
bool mpCollapsedAt(
  MPPageCollapse collapseBelow, {
  required double? width,
  required Map<MPWindowClass, double> minimums,
}) {
  final MPWindowClass? windowClass = collapseBelow.windowClass;

  if (windowClass == null || width == null || !width.isFinite) {
    return false;
  }

  return width < (minimums[windowClass] ?? 0);
}

/// What a bar paints, from whichever of `variant` and `elevation` answered:
/// the React package's `barSurface`, shared by `MPHeader`, `MPFooter` and
/// `MPSidebar`.
///
/// A box's ladder, with the one difference a bar has: a box's `outlined` is a
/// hairline all the way round, and a bar has only one edge with anything on
/// the other side of it. So `outlined` here paints the page's own `surface` and
/// leaves the rule to the widget, which knows which edge faces the content.
/// That is also MD3's flat top app bar exactly; `tonal`, the specification's
/// scrolled one, is `surfaceContainer` against the page's `surface`.
///
/// A bar's `elevated` is level 2 rather than 1, because a bar sits over the
/// page's content rather than in it. A level replaces the surface outright,
/// whatever the variant.
MPContainerPaint mpBarPaint(MPColorScheme colors, MPVariant variant, MPElevation? elevation) {
  if (elevation != null) {
    return mpElevationPaint(colors, elevation);
  }

  switch (variant) {
    case MPVariant.filled:
      return MPContainerPaint(color: colors.surfaceContainerHighest);
    case MPVariant.tonal:
      return MPContainerPaint(color: colors.surfaceContainer);
    case MPVariant.elevated:
      return MPContainerPaint(color: colors.surfaceContainerLow, shadows: MPShadows.of(2));
    case MPVariant.outlined:
      return MPContainerPaint(color: colors.surface);
    case MPVariant.text:
      return const MPContainerPaint(color: Color(0x00000000));
  }
}
