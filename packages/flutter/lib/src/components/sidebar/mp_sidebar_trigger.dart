/// The button that brings back a collapsed sidebar.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/types.dart';

/// The button that brings back an `MPSidebar` the layout has become too
/// narrow to hold.
///
/// ```dart
/// MPHeader(brand: Row(children: <Widget>[MPSidebarTrigger(), Text('Acme')]))
/// ```
///
/// It draws nothing while the sidebar is a column, and nothing at all outside
/// an `MPPageLayout`, rather than a button that does nothing: there is no
/// sidebar it could be talking about. Put it in an `MPHeader`'s `brand` slot,
/// ahead of the mark, which is where thirty years of hamburgers have taught
/// readers to look for it.
///
/// It is an icon button, which in this library is an [MPButton] with a glyph
/// and no label: [MPVariant.text] by default, MD3's standard icon button,
/// because it sits on a bar that is already a surface.
class MPSidebarTrigger extends StatelessWidget {
  /// Creates the button that opens a collapsed sidebar.
  const MPSidebarTrigger({
    this.side = MPSidebarSide.start,
    this.collapseBelow,
    this.icon,
    this.label,
    this.locale,
    this.variant,
    this.size,
    this.color,
    this.disabled,
    this.onPressed,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// Which of the layout's two sidebars it opens.
  final MPSidebarSide side;

  /// The class below which the button appears: the same one the sidebar
  /// collapses at, since the button exists exactly while the column does not.
  /// Inherited from the `MPPageLayout`, which is where it should be set.
  final MPPageCollapse? collapseBelow;

  /// The glyph. Three lines, unless something else is given.
  final Widget? icon;

  /// What it does, in words. Defaults to "Open sidebar" or "Close sidebar" in
  /// [locale], and it changes with the state because the button does: a
  /// control called "Open sidebar" that closes one is worse than an unnamed
  /// one.
  final String? label;

  /// Which language that name is in. Inherited from the layout.
  final String? locale;

  /// How much surface the button paints. [MPVariant.text] unless said.
  final MPVariant? variant;

  /// Which rung of the size ladder. Falls back to an `MPConfigProvider`, then
  /// to [MPSize.md].
  final MPSize? size;

  /// Which accent family it reads.
  final MPColor? color;

  /// Disables the button.
  final bool? disabled;

  /// Runs after the sidebar has been asked to open or close.
  final VoidCallback? onPressed;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final MPPageLayoutScope? layout = MPPageLayoutScope.maybeOf(context);

    if (layout == null) {
      return const SizedBox.shrink();
    }

    final bool collapsed = collapseBelow == null
        ? layout.collapsed
        : mpCollapsedAt(collapseBelow!, width: layout.width, minimums: mpWindowMinimumsOf(context));

    // Not drawn while the column is there. The React package hides the button
    // with a media query so it is in the markup a server sends; there is no
    // first paint to hold together here.
    if (!collapsed) {
      return const SizedBox.shrink();
    }

    final bool open = layout.open[side] ?? false;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpLayoutMessages,
      locale: locale ?? layout.locale,
    );

    // Merged, so the one node a screen reader stops on is the button and says
    // whether what it opens is open, as `aria-expanded` does on the web.
    return MergeSemantics(
      child: Semantics(
        expanded: open,
        child: MPButton(
          variant: variant ?? MPVariant.text,
          size: size,
          color: color,
          disabled: disabled,
          focusNode: focusNode,
          autofocus: autofocus,
          semanticLabel: label ?? (open ? messages['closeSidebar']! : messages['openSidebar']!),
          startIcon: icon ?? const _MenuGlyph(),
          onPressed: () {
            layout.setOpen(side, !open);
            onPressed?.call();
          },
        ),
      ),
    );
  }
}

/// Three lines.
///
/// Drawn here rather than in `internal/icons.dart` because this is the only
/// widget that needs it. It is the one glyph in the library that is a picture
/// of a *menu* rather than of what it does, and it is drawn anyway: thirty
/// years of it have made it the one shape a reader recognises without a word
/// beside it, which is the only argument that ever justifies a symbol.
class _MenuGlyph extends StatelessWidget {
  const _MenuGlyph();

  @override
  Widget build(BuildContext context) {
    final IconThemeData theme = IconTheme.of(context);
    final double box = theme.size ?? 24;

    return CustomPaint(
      size: Size.square(box),
      painter: _MenuPainter(theme.color ?? const Color(0xFF000000)),
    );
  }
}

class _MenuPainter extends CustomPainter {
  const _MenuPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = size.shortestSide * (2 / 24)
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    for (final double at in <double>[6 / 24, 12 / 24, 18 / 24]) {
      canvas.drawLine(
        Offset(size.width * (3 / 24), size.height * at),
        Offset(size.width * (21 / 24), size.height * at),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_MenuPainter oldDelegate) => oldDelegate.color != color;
}
