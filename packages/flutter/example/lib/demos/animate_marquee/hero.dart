import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `pauseOnHover` is on by default and is not decoration: content moving past a
/// pointer cannot be pressed reliably, and a link inside a marquee that never
/// stops is a link nobody can follow. Point at the strip and it holds still.
class AnimateMarqueeHero extends StatelessWidget {
  const AnimateMarqueeHero({super.key});

  static const List<String> _tools = <String>[
    'TypeScript',
    'React',
    'Base UI',
    'Tailwind CSS',
    'Vite',
    'Vitest',
    'Playwright',
    'VitePress',
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: MPAnimateMarquee(
        speed: 50,
        gap: 16,
        children: <Widget>[
          for (final String tool in _tools) MPChip(variant: MPVariant.tonal, child: Text(tool)),
        ],
      ),
    );
  }
}
