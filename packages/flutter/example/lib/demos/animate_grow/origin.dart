import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same effect anchored four ways.
///
/// `origin` takes any `Alignment`, and the scale is drawn at paint time, so
/// nothing beside the tile is laid out again while it runs.
///
/// `fade: false` is for something already on the screen that is only changing
/// size, where a repeated fade would read as flickering.
class AnimateGrowOrigin extends StatelessWidget {
  const AnimateGrowOrigin({super.key});

  static const List<(Alignment, String)> _corners = <(Alignment, String)>[
    (Alignment.topLeft, 'top left'),
    (Alignment.topRight, 'top right'),
    (Alignment.bottomLeft, 'bottom left'),
    (Alignment.bottomRight, 'bottom right'),
  ];

  @override
  Widget build(BuildContext context) {
    return _TwoColumns(
      children: <Widget>[
        for (final (Alignment origin, String label) in _corners)
          MPAnimateGrow(
            origin: origin,
            from: 0.6,
            repeat: null,
            alternate: true,
            fade: false,
            duration: const Duration(milliseconds: 1400),
            child: MPBox(
              size: MPSize.sm,
              child: MPTypography(label, level: MPTypographyLevel.caption),
            ),
          ),
      ],
    );
  }
}

/// Two columns 12 apart, the grid the React demo draws with CSS.
class _TwoColumns extends StatelessWidget {
  const _TwoColumns({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final double width = (constraints.maxWidth - 12) / 2;

          return Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              for (final Widget child in children) SizedBox(width: width, child: child),
            ],
          );
        },
      ),
    );
  }
}
