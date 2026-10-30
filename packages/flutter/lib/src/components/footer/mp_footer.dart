/// The sheet at the end of a page.
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
import 'package:material_plus_ui/src/types.dart';

/// The sheet at the end of a page.
///
/// ```dart
/// MPFooter(
///   maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md),
///   child: Text('© 2026 Acme. All rights reserved.'),
/// )
/// ```
///
/// At the top of a screen's semantics it is the `contentInfo` landmark, the
/// region a screen reader offers as "the site's own information". Inside the
/// main region of an `MPPageLayout`, where it is an article's own footer, it
/// claims no landmark, because Flutter does not allow one landmark inside
/// another.
///
/// ## Why it has no slots, and `MPHeader` does
///
/// A header's three regions are a fixed arrangement worth writing once, and a
/// footer's content is not an arrangement at all: four columns of links on one
/// site, a copyright line on the next. What this decides instead is the
/// **sheet**: the surface, the gutter and the measure. Everything above that is
/// an `MPGrid` or an `MPContainer` the caller puts inside it.
///
/// ## Where it sits
///
/// There is no `position`. A footer that ends the document is the last thing in
/// the scroll view, and one that has to stay in reach (a form's save row) goes
/// below the scrolling part of the screen, which is where `MPPageLayout`'s
/// `footer` slot puts it.
class MPFooter extends StatelessWidget {
  /// Creates a footer holding [child].
  const MPFooter({
    this.child,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.maxWidth,
    this.padded = true,
    this.semanticLabel,
    super.key,
  });

  /// Everything in it. A footer's content is the caller's, which is why it has
  /// slots for nothing and room for anything.
  final Widget? child;

  /// How much surface the sheet paints, on the **container** ladder.
  ///
  /// [MPVariant.outlined] is the default here and [MPVariant.tonal] is
  /// `MPHeader`'s, because the two sit against different things. A header is
  /// over content passing underneath it and needs a tone of its own; a footer
  /// has the end of the document above it and nothing below, so the hairline
  /// along its top edge is the whole of what says the document ended.
  final MPVariant variant;

  /// How far off the page the sheet is lifted, `0` to `5`. It moves the tone as
  /// well as the shadow. A bar's [MPVariant.elevated] is level 2.
  final MPElevation? elevation;

  /// The sheet's scale: its gutter and the air above and below its content. As
  /// on `MPBox`, it sets no height and no type scale.
  final MPSize? size;

  /// Takes room out of the gutter and the air above and below the content. A
  /// footer is mostly padding, and on a dense page it is the first thing that
  /// should give some back.
  final MPDensity? density;

  /// Holds the content to a measure and centres it while the sheet itself still
  /// spans the window. The same parameter `MPContainer`'s `maxWidth` is. `null`
  /// is no limit.
  final MPResponsive<MPMeasure>? maxWidth;

  /// The gutter, and the air above and below.
  final bool padded;

  /// The name the region is announced by. Worth writing when a screen has more
  /// than one footer, an article's own and the site's.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = this.density ?? config?.density ?? 0;
    final MPColorScheme colors = MPTheme.of(context).colors;
    final MPContainerPaint paint = mpBarPaint(colors, variant, elevation);
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final bool outlined = variant == MPVariant.outlined;

    Widget content = Padding(
      padding: EdgeInsets.all(padded ? mpSheetPadOf(size, density) : 0),
      child: child ?? const SizedBox.shrink(),
    );

    final double limit = mpMeasureOf(context, maxWidth);

    content = Align(
      alignment: Alignment.topCenter,
      heightFactor: 1,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: limit),
        child: SizedBox(width: double.infinity, child: content),
      ),
    );

    Widget sheet = DecoratedBox(
      // The top edge, the only one with anything on the other side of it: the
      // same single-edge rule `MPHeader` draws along its bottom. Inside the
      // sheet, as CSS's `border-box` puts it.
      decoration: BoxDecoration(
        color: paint.color,
        border: outlined ? Border(top: rule) : null,
        boxShadow: paint.shadows,
      ),
      child: Padding(
        padding: EdgeInsets.only(top: outlined ? rule.width : 0),
        child: DefaultTextStyle.merge(
          style: TextStyle(color: colors.onSurface),
          child: content,
        ),
      ),
    );

    final bool nested = MPLandmarkScope.within(context);

    if (nested && semanticLabel == null) {
      return sheet;
    }

    sheet = Semantics(
      role: nested ? SemanticsRole.region : SemanticsRole.contentInfo,
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: sheet,
    );

    return sheet;
  }
}
