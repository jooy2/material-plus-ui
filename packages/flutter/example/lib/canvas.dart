import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The page a demo is drawn on: the scheme's own `surface`, with room around
/// the demo.
///
/// Material draws on its surface rather than in front of a backdrop, so there
/// is nothing more to paint than that, which is also what the React previews
/// sit on.
class MPCanvas extends StatelessWidget {
  /// Draws [child] on the surface, pinned to [align].
  const MPCanvas({required this.child, this.align = Alignment.topLeft, this.lead = 0, super.key});

  /// The demo.
  final Widget child;

  /// Where the demo sits across the frame: the start, or the middle.
  final Alignment align;

  /// Extra room above the demo, for a popup that opens upwards out of it.
  final double lead;

  /// The room around a demo, matching the React previews' padding.
  static const EdgeInsets padding = EdgeInsets.fromLTRB(24, 32, 24, 24);

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;

    return ColoredBox(
      color: colors.surface,
      child: DefaultTextStyle.merge(
        style: TextStyle(color: colors.onSurface),
        // Scrollable rather than clipped: the page sizes the frame from what
        // this reports, and between the first paint and that message arriving
        // the viewport is whatever height the page reserved. Overflowing it
        // should be a scroll, not a broken preview.
        child: SingleChildScrollView(
          child: Padding(
            padding: padding + EdgeInsets.only(top: lead),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: align == Alignment.topCenter
                  ? CrossAxisAlignment.center
                  : CrossAxisAlignment.start,
              children: <Widget>[child],
            ),
          ),
        ),
      ),
    );
  }
}
