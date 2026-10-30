import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The plainest effect in the set, and the one to reach for first: nothing
/// moves, so nothing is laid out again and nothing is resampled.
///
/// `MPAnimateTrigger.manual` with a `play` you own is what makes a preview like
/// this replayable — and a `false` → `true` rewinds the run without rebuilding
/// anything inside it, so nothing in the card loses its state.
class AnimateFadeHero extends StatefulWidget {
  const AnimateFadeHero({super.key});

  @override
  State<AnimateFadeHero> createState() => _AnimateFadeHeroState();
}

class _AnimateFadeHeroState extends State<AnimateFadeHero> {
  bool _play = true;

  /// Down for one frame and up again, so the effect sees a rise.
  void _replay() {
    setState(() => _play = false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _play = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: MPAnimateFade(
            trigger: MPAnimateTrigger.manual,
            play: _play,
            child: const MPCard(
              title: Text('Ready when you are'),
              subtitle: Text('300ms on medium2, decelerating into place'),
              child: MPTypography(
                'Nothing moves and nothing is resampled, which is what makes a fade the one '
                'entrance that is safe on a block of text at any size.',
              ),
            ),
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
