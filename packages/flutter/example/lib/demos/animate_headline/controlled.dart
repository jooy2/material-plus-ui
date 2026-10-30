import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Hand it an `index` and the reel stops turning on its own — a controlled
/// headline is somebody else's timer, and a second one running underneath it
/// would fight for the same state.
///
/// Which makes this the way to tie the reel to a step in a form, a tab, or
/// anything else that already knows which line should be showing.
class AnimateHeadlineControlled extends StatefulWidget {
  const AnimateHeadlineControlled({super.key});

  @override
  State<AnimateHeadlineControlled> createState() => _AnimateHeadlineControlledState();
}

class _AnimateHeadlineControlledState extends State<AnimateHeadlineControlled> {
  static const List<String> _steps = <String>[
    'Choose a plan',
    'Enter your details',
    'Confirm and pay',
  ];

  int _step = 0;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          MPBox(
            child: MPAnimateHeadline(
              index: _step,
              children: <Widget>[
                for (final String label in _steps) MPTypography(label, level: MPTypographyLevel.h6),
              ],
            ),
          ),
          Row(
            spacing: 8,
            children: <Widget>[
              MPButton(
                variant: MPVariant.outlined,
                onPressed: _step == 0 ? null : () => setState(() => _step -= 1),
                child: const Text('Back'),
              ),
              MPButton(
                variant: MPVariant.tonal,
                onPressed: _step == _steps.length - 1 ? null : () => setState(() => _step += 1),
                child: const Text('Next'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
