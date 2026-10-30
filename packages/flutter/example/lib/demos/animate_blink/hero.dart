import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `min` is a **dimming**, never the only thing carrying the message.
///
/// A reader who has turned animations off sees none of this, so the words have
/// to stand on their own: "Recording" says what is happening whether or not
/// anything pulses beside it.
class AnimateBlinkHero extends StatelessWidget {
  const AnimateBlinkHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 12,
        children: <Widget>[
          MPBox(
            size: MPSize.sm,
            child: Row(
              spacing: 10,
              children: <Widget>[
                MPAnimateBlink(
                  min: 0.15,
                  duration: const Duration(milliseconds: 1200),
                  child: DecoratedBox(
                    decoration: BoxDecoration(color: colors.error, shape: BoxShape.circle),
                    child: const SizedBox.square(dimension: 10),
                  ),
                ),
                const MPTypography('Recording — 04:12'),
              ],
            ),
          ),
          const MPAnimateBlink(
            min: 0.55,
            duration: Duration(milliseconds: 1600),
            child: MPChip(
              variant: MPVariant.tonal,
              color: MPColor.error,
              child: Text('3 checks failing'),
            ),
          ),
        ],
      ),
    );
  }
}
