import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The shape the widget is for: a `play` the screen owns, set back to `false`
/// and then to `true` so the second wrong answer moves as much as the first.
///
/// The words are in `errorMessage` rather than in the movement, because a
/// reader who has turned animations off — or who cannot see it — still has to
/// be told what happened. A shake is not a message.
class AnimateShakeHero extends StatefulWidget {
  const AnimateShakeHero({super.key});

  @override
  State<AnimateShakeHero> createState() => _AnimateShakeHeroState();
}

class _AnimateShakeHeroState extends State<AnimateShakeHero> {
  String _code = '';
  bool _wrong = false;

  void _submit() {
    if (_code == '2718') {
      setState(() => _wrong = false);

      return;
    }

    // Down for one frame and up again, so the shake sees a rise every time.
    setState(() => _wrong = false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _wrong = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      spacing: 16,
      children: <Widget>[
        MPAnimateShake(
          play: _wrong,
          child: MPTextField(
            label: const Text('Access code'),
            value: _code,
            onChanged: (String next) => setState(() => _code = next),
            errorMessage: _wrong ? 'That code was not recognised' : null,
          ),
        ),
        MPButton(variant: MPVariant.tonal, onPressed: _submit, child: const Text('Submit')),
        const MPTypography(
          'Nothing shakes until something is refused.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
