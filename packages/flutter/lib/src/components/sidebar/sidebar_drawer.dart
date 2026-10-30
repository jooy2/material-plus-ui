/// The modal drawer a collapsed sidebar becomes.
///
/// The React package hands a collapsed sidebar to its `MPDrawer`. This is the
/// part of that drawer a sidebar needs (a side panel over a scrim, a heading,
/// a close button, a body that scrolls), drawn the way `MPDrawer` draws its
/// modal mode, and kept beside the sidebar because nothing else reads it.
///
/// Not exported from `material_plus_ui.dart`.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How wide the drawer is on each rung, which is the column's width too:
/// `md` is MD3's own 360dp navigation drawer.
const Map<MPSize, double> mpSidebarExtent = <MPSize, double>{
  MPSize.xs: 240,
  MPSize.sm: 288,
  MPSize.md: 360,
  MPSize.lg: 416,
  MPSize.xl: 480,
};

/// A side panel over a scrim, attached to [side].
///
/// `surfaceContainerLow` under a level-1 shadow, MD3's modal navigation
/// drawer: square against the window and cut to `large` on the free side, with
/// a hairline on that side only. It comes in from the edge it belongs to and
/// fades as it does, and a reader who asked for less motion gets the fade
/// alone.
class MPSidebarDrawer extends StatelessWidget {
  /// Creates the drawer.
  const MPSidebarDrawer({
    required this.open,
    required this.onClose,
    required this.side,
    required this.size,
    required this.heading,
    required this.closeLabel,
    this.semanticLabel,
    this.extent,
    this.child,
    super.key,
  });

  /// Whether it is up.
  final bool open;

  /// Asks for it to close: the close button, a press on the scrim, Escape, the
  /// system back.
  final VoidCallback onClose;

  /// The edge of the window it is attached to: [MPSide.left] or
  /// [MPSide.right].
  final MPSide side;

  /// The rung its width, padding and type come from.
  final MPSize size;

  /// The heading at the top.
  final Widget heading;

  /// The close button's name.
  final String closeLabel;

  /// The name the layer is announced by, or `null` to leave it to the heading.
  final String? semanticLabel;

  /// A width of its own, in place of the rung's.
  final double? extent;

  /// The body, which is the part that scrolls.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool left = side == MPSide.left;

    return MPPortal(
      open: open,
      barrierColor: mpScrimColor(colors),
      onDismiss: onClose,
      label: semanticLabel,
      child: Align(
        alignment: left ? Alignment.centerLeft : Alignment.centerRight,
        child: GestureDetector(
          // A press on the panel is not a press outside it.
          behavior: HitTestBehavior.opaque,
          excludeFromSemantics: true,
          onTap: () {},
          child: _Slide(
            open: open,
            from: left ? -1 : 1,
            child: _panel(context, colors, left: left),
          ),
        ),
      ),
    );
  }

  Widget _panel(BuildContext context, MPColorScheme colors, {required bool left}) {
    final MPThemeData theme = MPTheme.of(context);
    final double pad = mpSheetPad[size]!;
    final Radius corner = Radius.circular(theme.shapes.large);
    final BorderRadius corners = left
        ? BorderRadius.horizontal(right: corner)
        : BorderRadius.horizontal(left: corner);

    final Widget header = Padding(
      padding: EdgeInsets.symmetric(horizontal: pad),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 12,
        children: <Widget>[
          Expanded(
            child: Padding(
              // The heading's first line sits level with the middle of the
              // 40px close button beside it.
              padding: const EdgeInsets.only(top: 8),
              child: DefaultTextStyle.merge(
                style: mpSheetTitle(theme.typescale, size).style(colors.onSurface),
                child: Semantics(header: true, child: heading),
              ),
            ),
          ),
          _CloseButton(label: closeLabel, onPressed: onClose),
        ],
      ),
    );

    Widget panel = Padding(
      padding: EdgeInsets.symmetric(vertical: pad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: mpSheetGap[size]!,
        children: <Widget>[
          header,
          if (child != null)
            // The one part that scrolls, so the heading and its close button
            // stay put however long the list under them is.
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: pad),
                child: child,
              ),
            ),
        ],
      ),
    );

    // The panel runs under the system's bars on the three sides it touches the
    // window, and keeps what is on it out from under them.
    panel = SafeArea(left: left, right: !left, child: panel);

    panel = DefaultTextStyle.merge(
      style: mpProseText(theme.typescale, size).style(colors.onSurface),
      child: panel,
    );

    return SizedBox(
      width: extent ?? mpSidebarExtent[size]!,
      height: double.infinity,
      child: CustomPaint(
        foregroundPainter: _FreeEdgePainter(
          color: colors.outlineVariant,
          corner: corner.x,
          left: left,
        ),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: colors.surfaceContainerLow,
            borderRadius: corners,
            boxShadow: MPShadows.of(1),
          ),
          child: ClipRRect(borderRadius: corners, child: panel),
        ),
      ),
    );
  }
}

/// The panel's way in from its edge.
///
/// A whole panel's width rather than a hint of one: the travel is what says
/// which edge the drawer belongs to, and a panel that slid in from twenty
/// pixels away has arrived from nowhere in particular. In on MD3's emphasized
/// decelerate over `medium4`, out on emphasized accelerate over `short4`, the
/// React drawer's own pair. The portal around it fades the whole layer at the
/// same time.
class _Slide extends StatefulWidget {
  const _Slide({required this.open, required this.from, required this.child});

  final bool open;

  /// `-1` for a panel that comes from the left, `1` from the right.
  final double from;

  final Widget child;

  @override
  State<_Slide> createState() => _SlideState();
}

class _SlideState extends State<_Slide> with SingleTickerProviderStateMixin {
  late final AnimationController _travel = AnimationController(
    vsync: this,
    duration: MPMotion.medium4,
    reverseDuration: MPMotion.short4,
  );

  late final CurvedAnimation _eased = CurvedAnimation(
    parent: _travel,
    curve: MPMotion.emphasizedDecelerate,
    reverseCurve: MPMotion.emphasizedAccelerate,
  );

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // The first frame is where the reader's motion preference can be read, so
    // the panel starts moving from here rather than from `initState`.
    if (!_started) {
      _started = true;

      if (_still) {
        _travel.value = widget.open ? 1 : 0;
      } else if (widget.open) {
        _travel.forward();
      }
    }
  }

  bool get _still => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  @override
  void didUpdateWidget(_Slide oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.open == oldWidget.open) {
      return;
    }

    if (_still) {
      _travel.value = widget.open ? 1 : 0;
    } else if (widget.open) {
      _travel.forward();
    } else {
      _travel.reverse();
    }
  }

  @override
  void dispose() {
    _eased.dispose();
    _travel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // No travel at all for a reader who asked for less motion: the fade is the
    // whole of the entrance then, as it is in the React package.
    if (_still) {
      return widget.child;
    }

    return SlideTransition(
      position: Tween<Offset>(begin: Offset(widget.from, 0), end: Offset.zero).animate(_eased),
      child: widget.child,
    );
  }
}

/// The hairline on the free edge only, round the two corners cut on that side.
///
/// A border all round would draw a line along the window's own edge, where
/// there is nothing on the other side of it to be separated from. A
/// one-sided [Border] cannot follow a rounded corner, so the line is drawn.
class _FreeEdgePainter extends CustomPainter {
  const _FreeEdgePainter({required this.color, required this.corner, required this.left});

  final Color color;
  final double corner;
  final bool left;

  @override
  void paint(Canvas canvas, Size size) {
    final double r = corner.clamp(0, size.shortestSide / 2);
    // Half a pixel in, so the one-pixel line lands inside the panel.
    final double x = left ? size.width - 0.5 : 0.5;
    final double inward = left ? -r : r;
    final Path path = Path()
      ..moveTo(x + inward, 0.5)
      ..quadraticBezierTo(x, 0.5, x, r + 0.5)
      ..lineTo(x, size.height - r - 0.5)
      ..quadraticBezierTo(x, size.height - 0.5, x + inward, size.height - 0.5);

    canvas.drawPath(
      path,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..color = color,
    );
  }

  @override
  bool shouldRepaint(_FreeEdgePainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.corner != corner || oldDelegate.left != left;
  }
}

/// The ×: a 40px circle in `onSurfaceVariant`, washed by MD3's state layer.
class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    const BorderRadius round = BorderRadius.all(Radius.circular(20));

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: round)
                : null,
            child: MPStateLayer(
              color: colors.onSurfaceVariant,
              opacity: mpStateLayerOpacity(state),
              shape: BoxShape.circle,
              child: SizedBox.square(
                dimension: 40,
                child: Center(
                  child: MPGlyph(MPGlyphShape.close, size: 20, color: colors.onSurfaceVariant),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
