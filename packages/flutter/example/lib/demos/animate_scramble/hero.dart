import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The heading and the line under it, to show the thing the widget is for:
/// neither moves while the top one settles, because the box was its finished
/// length from the first frame.
class AnimateScrambleHero extends StatefulWidget {
  const AnimateScrambleHero({super.key});

  @override
  State<AnimateScrambleHero> createState() => _AnimateScrambleHeroState();
}

class _AnimateScrambleHeroState extends State<AnimateScrambleHero> {
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
            MPAnimateScramble(
              text: 'ACCESS GRANTED',
              trigger: MPAnimateTrigger.manual,
              play: _play,
              duration: const Duration(milliseconds: 1400),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
            ),
            const MPTypography('Nothing under it moved.', level: MPTypographyLevel.caption),
          ],
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Resolve again')),
      ],
    );
  }
}
