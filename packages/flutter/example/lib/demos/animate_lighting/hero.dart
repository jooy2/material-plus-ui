import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The light is **behind** the content rather than on it, so what a reader sees
/// is a glow escaping from under the edges. Nothing inside is altered, nothing
/// is laid over it, and the card stays exactly as legible as it was.
///
/// Two things it needs from the content: a `size` that agrees with its corner,
/// since the glow follows that corner — and a surface of its own. "Behind" only
/// reads as behind if there is something opaque in front of it, so this card is
/// `elevated` rather than the default `outlined`, which paints no background.
class AnimateLightingHero extends StatelessWidget {
  const AnimateLightingHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: const MPAnimateLighting(
        size: MPSize.md,
        child: MPCard(
          variant: MPVariant.elevated,
          title: Text('Recommended'),
          subtitle: Text('Team · ₩29,000 / month'),
          child: MPTypography(
            'Marking the one thing on a screen that is currently live, with light rather than '
            'by moving anything.',
          ),
        ),
      ),
    );
  }
}
