import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A grow starts close to its final size, so the content inside is legible for
/// most of the run — which is what makes it the effect for something opening
/// out of the place it belongs to.
class AnimateGrowHero extends StatefulWidget {
  const AnimateGrowHero({super.key});

  @override
  State<AnimateGrowHero> createState() => _AnimateGrowHeroState();
}

class _AnimateGrowHeroState extends State<AnimateGrowHero> {
  bool _play = true;

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
          child: MPAnimateGrow(
            trigger: MPAnimateTrigger.manual,
            play: _play,
            origin: Alignment.topCenter,
            child: const MPCard(
              title: Text('Out of the toolbar'),
              subtitle: Text('400ms on medium4, anchored to its top edge'),
              child: MPTypography(
                '`origin` is what anchors the unfold to a place — a panel out of a toolbar, a '
                'sheet out of the button that summoned it.',
              ),
            ),
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
