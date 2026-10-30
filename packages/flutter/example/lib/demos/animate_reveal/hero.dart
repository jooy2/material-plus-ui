import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The claim, drawn: the heading and the rule are where they will be from the
/// first frame, at the colour they will end at, and only how much of them is
/// painted changes.
///
/// A `stagger` on the set rather than separate widgets with a `delay`, so the
/// heading and its rule are one gesture — which is what they are.
class AnimateRevealHero extends StatefulWidget {
  const AnimateRevealHero({super.key});

  @override
  State<AnimateRevealHero> createState() => _AnimateRevealHeroState();
}

class _AnimateRevealHeroState extends State<AnimateRevealHero> {
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
      spacing: 24,
      children: <Widget>[
        MPAnimateReveal(
          trigger: MPAnimateTrigger.manual,
          play: _play,
          stagger: const Duration(milliseconds: 140),
          layoutBuilder: (BuildContext context, List<Widget> children) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: children,
            );
          },
          children: const <Widget>[
            MPTypography('What we shipped this quarter', level: MPTypographyLevel.h3),
            MPDivider(),
            MPTypography(
              'Nothing moved and no colour changed. The title is at its final position on the '
              'first frame, which is the whole reason to reach for this one over a slide.',
            ),
          ],
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
