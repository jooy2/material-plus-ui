import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The three directions, and the point they are here to make: each box is
/// exactly the size of what is drawn in it. Move the items with a `Transform`
/// instead and the boxes stay the width of all of them laid end to end.
class StackHero extends StatefulWidget {
  const StackHero({super.key});

  @override
  State<StackHero> createState() => _StackHeroState();
}

class _StackHeroState extends State<StackHero> {
  static const List<(String, String)> _people = <(String, String)>[
    ('Anya Sol', '/samples/people/anya-sol.webp'),
    ('Lucas Adebayo', '/samples/people/lucas-adebayo.webp'),
    ('Noa Marin', '/samples/people/noa-marin.webp'),
    ('Helen Voss', '/samples/people/helen-voss.webp'),
  ];

  bool _dealt = true;

  void _dealAgain() {
    setState(() => _dealt = false);
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted) {
        setState(() => _dealt = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        spacing: 28,
        children: <Widget>[
          Column(
            spacing: 8,
            children: <Widget>[
              MPStack(
                ring: true,
                max: 3,
                total: 12,
                transition: MPAnimation.grow,
                trigger: MPAnimateTrigger.manual,
                play: _dealt,
                overflow: (int hidden) => MPAvatar(initials: '+$hidden'),
                children: <Widget>[
                  for (final (String name, String src) in _people.take(3))
                    MPAvatar(key: ValueKey<String>(name), name: name, image: NetworkImage(src)),
                ],
              ),
              const MPTypography(
                'horizontal, ringed, with a count',
                level: MPTypographyLevel.caption,
              ),
            ],
          ),
          Column(
            spacing: 8,
            children: <Widget>[
              MPStack(
                direction: MPStackDirection.diagonal,
                overlap: 44,
                drop: 12,
                scaleStep: 0.96,
                opacityStep: 0.92,
                transition: MPAnimation.slide,
                trigger: MPAnimateTrigger.manual,
                play: _dealt,
                children: <Widget>[
                  for (int card = 1; card <= 4; card += 1)
                    SizedBox(
                      key: ValueKey<int>(card),
                      width: 96,
                      child: MPBox(size: MPSize.sm, child: MPTypography('Card $card')),
                    ),
                ],
              ),
              const MPTypography(
                'diagonal, a shallow fan, dealt on a stagger',
                level: MPTypographyLevel.caption,
              ),
            ],
          ),
          MPButton(
            variant: MPVariant.tonal,
            onPressed: _dealAgain,
            child: const Text('Deal again'),
          ),
        ],
      ),
    );
  }
}
