import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The default distance is the widget's own size, so it starts exactly out of
/// frame. Put the slide in a box that clips and the effect is a panel
/// appearing from behind that box's edge.
class AnimateSlideHero extends StatefulWidget {
  const AnimateSlideHero({super.key});

  @override
  State<AnimateSlideHero> createState() => _AnimateSlideHeroState();
}

class _AnimateSlideHeroState extends State<AnimateSlideHero> {
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
          child: ClipRect(
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: MPAnimateSlide(
                trigger: MPAnimateTrigger.manual,
                play: _play,
                from: MPSide.left,
                child: const MPCard(
                  title: Text('From behind the edge'),
                  subtitle: Text('400ms on medium4, travelling its own width'),
                  child: MPTypography(
                    'A slide moves the element and not the layout — nothing on the page '
                    'reflows while it runs.',
                  ),
                ),
              ),
            ),
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
