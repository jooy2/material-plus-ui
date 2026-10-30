import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_display.dart';

class IconHero extends StatelessWidget {
  const IconHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final TextStyle text = theme.typescale.bodyLarge.style(theme.colors.onSurface);

    return Wrap(
      spacing: 24,
      runSpacing: 24,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        const MPIcon(icon: SuccessGlyph(), size: 28, color: Color(0xFF2E7D32), label: 'Deployed'),
        // A size taken from the sentence, which is what React's `size="1em"`
        // says: the icon tracks the text it sits in.
        Text.rich(
          TextSpan(
            children: <InlineSpan>[
              const TextSpan(text: 'Deploys finish in '),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: MPIcon(icon: const CheckGlyph(), size: text.fontSize),
              ),
              const TextSpan(text: ' under a minute.'),
            ],
          ),
          style: text,
        ),
      ],
    );
  }
}
