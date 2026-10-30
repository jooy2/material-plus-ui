import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A zoom is for the one thing on a screen that is meant to interrupt — a
/// confirmation, a result, a number that has just landed.
///
/// Use it once. An interruption that happens three times on one screen is a
/// layout, and the effect that belongs to a *set* of things is
/// `MPAnimateAppear`.
class AnimateZoomHero extends StatefulWidget {
  const AnimateZoomHero({super.key});

  @override
  State<AnimateZoomHero> createState() => _AnimateZoomHeroState();
}

class _AnimateZoomHeroState extends State<AnimateZoomHero> {
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
        MPAnimateZoom(
          trigger: MPAnimateTrigger.manual,
          play: _play,
          child: const MPCard(
            title: Text('Payment received'),
            subtitle: Text('₩42,000 · just now'),
            child: MPTypography('Done', level: MPTypographyLevel.h4),
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _replay, child: const Text('Play again')),
      ],
    );
  }
}
