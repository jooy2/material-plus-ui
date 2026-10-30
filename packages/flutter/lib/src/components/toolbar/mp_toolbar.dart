/// A bar of controls.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which way a toolbar faces, and so which edge its divider is drawn along.
enum MPToolbarSide {
  /// Along the top of what it heads. The divider is drawn under it.
  top,

  /// Along the bottom of what it closes. The divider is drawn over it.
  bottom,
}

/// A bar of controls: an application header, a screen's action row, the strip
/// along the bottom of an editor.
///
/// ```dart
/// MPToolbar(
///   divider: true,
///   start: const AppMark(),
///   end: MPButton(onPressed: deploy, size: MPSize.sm, child: const Text('Deploy')),
///   child: const Text('Voltage'),
/// )
/// ```
///
/// Three slots and a row. [start] and [end] are pinned to their ends and [child]
/// takes what is left, which is the arrangement every toolbar has ever had, so
/// it is laid out here rather than left to a caller and a spacer they have to
/// remember.
///
/// ## It takes no height
///
/// A toolbar is as tall as the controls in it plus its padding, and that
/// padding is the [size] and [density] pair every other surface uses. So
/// `density: -2` gives the dense bar without a second parameter meaning the
/// same thing, and without the type scale moving.
///
/// ## It claims no toolbar semantics
///
/// That role is a promise about keyboard behaviour: one focus stop for the
/// whole bar, arrow keys between the controls in it. A bar that claims it
/// without implementing it is worse for a keyboard reader than one that claimed
/// nothing. A genuine roving-focus set of controls is an `MPButtonGroup`.
///
/// ## It has no `position`
///
/// The React bar can be `sticky`, `fixed` or `absolute`, which are CSS answers
/// to where a box sits in a scrolling page. A Flutter widget goes where its
/// parent puts it, so a bar that has to stay put belongs in the screen's own
/// layout. The one thing the React bar derives from its position, whether it
/// has corners, is [rounded] here.
class MPToolbar extends StatelessWidget {
  /// Creates a bar.
  const MPToolbar({
    this.child,
    this.start,
    this.end,
    this.variant = MPVariant.outlined,
    this.elevation,
    this.size,
    this.density,
    this.side = MPToolbarSide.top,
    this.rounded = true,
    this.divider = false,
    this.semanticLabel,
    super.key,
  });

  /// The middle. Takes whatever width [start] and [end] leave, and sits at the
  /// start of it.
  final Widget? child;

  /// Pinned to the start of the bar: a logo, a title, a back button.
  final Widget? start;

  /// Pinned to the end: the actions.
  final Widget? end;

  /// How much surface the bar paints.
  ///
  /// A container's ladder, so the bar is never dyed: a toolbar holds other
  /// people's controls, and those controls arrive with colours of their own.
  final MPVariant variant;

  /// How far off the page it is lifted, on MD3's five levels.
  ///
  /// Left unset the bar is flat, and that is deliberate: a shadow under a
  /// header says "there is content beneath this", which is only true once the
  /// page has been scrolled. Raise it yourself at that moment, or leave it flat
  /// and turn on [divider].
  final MPElevation? elevation;

  /// The room inside. [MPSize.md] unless an [MPConfigProvider] says otherwise.
  /// It sets padding and neither a height nor a type scale.
  final MPSize? size;

  /// Takes room out of that padding, two pixels a face per step, `0` to `-3`.
  final MPDensity? density;

  /// Which way the bar faces, and the one thing that depends on it: which edge
  /// the [divider] is drawn along.
  final MPToolbarSide side;

  /// Whether the bar is a sheet with corners.
  ///
  /// On for a bar sitting in the layout. Turn it off for one held against an
  /// edge of the screen: a rounded corner against the edge of the screen is a
  /// gap with nothing behind it. The React bar makes the same call from its
  /// `position`.
  final bool rounded;

  /// Draws a hairline along the edge that faces the content: under a
  /// [MPToolbarSide.top] bar, over a [MPToolbarSide.bottom] one.
  final bool divider;

  /// The name a screen reader gives the bar, when it needs one of its own.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPDensity density = mpClampDensity(this.density ?? config?.density ?? 0);

    final MPContainerPaint paint = mpContainerPaint(colors, variant, elevation: elevation);
    final BorderRadius corners = rounded
        ? BorderRadius.circular(theme.shapes.medium)
        : BorderRadius.zero;

    // An outlined bar already has a hairline on every edge, the one facing the
    // content included, so the divider would only draw it twice.
    final bool ruled = divider && paint.border == null;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final double pad = mpSheetPadOf(size, density);

    final Widget row = Row(
      spacing: mpSheetGap[size]!,
      children: <Widget>[
        ?start,
        // Expanded even when empty, so `start` and `end` stay at their own ends
        // rather than collapsing together in the middle of the bar.
        Expanded(
          child: Align(
            alignment: AlignmentDirectional.centerStart,
            heightFactor: 1,
            child: child ?? const SizedBox.shrink(),
          ),
        ),
        ?end,
      ],
    );

    // Containers rather than decorated boxes, because a CSS border takes room
    // and so does a container's: the hairlines here add their pixel to the
    // bar's height, as they do in the React bar, instead of being painted over
    // its padding.
    Widget bar = Container(
      decoration: ruled
          ? BoxDecoration(
              border: side == MPToolbarSide.top ? Border(bottom: rule) : Border(top: rule),
            )
          : null,
      padding: EdgeInsets.all(pad),
      child: DefaultTextStyle.merge(
        style: TextStyle(color: colors.onSurface),
        child: IconTheme.merge(
          data: IconThemeData(color: colors.onSurface),
          child: row,
        ),
      ),
    );

    bar = Container(
      decoration: paint.decoration(corners),
      // The divider is a straight line, and a straight line across a rounded
      // sheet runs past the curve at both corners unless the sheet clips it.
      clipBehavior: ruled && rounded ? Clip.antiAlias : Clip.none,
      child: bar,
    );

    return semanticLabel == null
        ? bar
        : Semantics(container: true, explicitChildNodes: true, label: semanticLabel, child: bar);
  }
}
