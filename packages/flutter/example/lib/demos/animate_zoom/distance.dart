import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `from` is the whole dial.
///
/// Below `1` the content comes forward out of the middle. Above `1` it arrives
/// oversized and settles back, which reads as something being pushed *towards*
/// the reader rather than rising out of the page.
class AnimateZoomDistance extends StatelessWidget {
  const AnimateZoomDistance({super.key});

  static const List<double> _strengths = <double>[0.2, 0.4, 0.8, 1.3];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          // Two columns 12 apart, the grid the React demo draws with CSS.
          final double width = (constraints.maxWidth - 12) / 2;

          return Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              for (final double from in _strengths)
                SizedBox(
                  width: width,
                  child: MPAnimateZoom(
                    from: from,
                    repeat: null,
                    alternate: true,
                    duration: const Duration(milliseconds: 1500),
                    child: MPBox(
                      size: MPSize.sm,
                      child: MPTypography('from: $from', level: MPTypographyLevel.caption),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
