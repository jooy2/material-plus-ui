import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Both cuts side by side, because the difference is the whole decision: words
/// are a heading arriving, characters are a heading being performed.
class AnimateSplitHero extends StatefulWidget {
  const AnimateSplitHero({super.key});

  @override
  State<AnimateSplitHero> createState() => _AnimateSplitHeroState();
}

class _AnimateSplitHeroState extends State<AnimateSplitHero> {
  static const TextStyle _heading = TextStyle(fontSize: 24, fontWeight: FontWeight.w500);

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
        Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPAnimateSplit(
              text: 'What we shipped this quarter',
              trigger: MPAnimateTrigger.manual,
              play: _play,
              stagger: const Duration(milliseconds: 60),
              textAlign: TextAlign.center,
              style: _heading,
            ),
            const MPTypography(
              'by: MPAnimateSplitBy.word, 60ms apart',
              level: MPTypographyLevel.caption,
            ),
          ],
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPAnimateSplit(
              text: 'Character by character',
              trigger: MPAnimateTrigger.manual,
              play: _play,
              by: MPAnimateSplitBy.character,
              stagger: const Duration(milliseconds: 18),
              textAlign: TextAlign.center,
              style: _heading,
            ),
            const MPTypography(
              'by: MPAnimateSplitBy.character, 18ms apart',
              level: MPTypographyLevel.caption,
            ),
          ],
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
