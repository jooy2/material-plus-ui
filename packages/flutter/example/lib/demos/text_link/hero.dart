import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TextLinkHero extends StatelessWidget {
  const TextLinkHero({super.key});

  /// A link sitting in the line of a sentence, on its baseline.
  static InlineSpan _inline(Widget link) {
    return WidgetSpan(
      alignment: PlaceholderAlignment.baseline,
      baseline: TextBaseline.alphabetic,
      child: link,
    );
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: DefaultTextStyle.merge(
        style: theme.typescale.bodyLarge.style(theme.colors.onSurface).copyWith(height: 1.7),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: 14,
          children: <Widget>[
            Text.rich(
              TextSpan(
                children: <InlineSpan>[
                  const TextSpan(
                    text: 'The colour roles are derived from a single source colour — see ',
                  ),
                  _inline(MPTextLink(onPressed: () {}, child: const Text('the colour page'))),
                  const TextSpan(text: ' for the whole table.'),
                ],
              ),
            ),
            Text.rich(
              TextSpan(
                children: <InlineSpan>[
                  const TextSpan(text: 'The specification itself is at '),
                  _inline(
                    MPTextLink(
                      href: 'https://m3.material.io',
                      newTab: true,
                      onPressed: () {},
                      child: const Text('m3.material.io'),
                    ),
                  ),
                  const TextSpan(text: '.'),
                ],
              ),
            ),
            MPTextLink(
              color: MPColor.primary,
              underline: MPTextLinkUnderline.hover,
              size: MPSize.sm,
              onPressed: () {},
              child: const Text('A link that stands on its own'),
            ),
          ],
        ),
      ),
    );
  }
}
