import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// MD3's top app bar with a site's own three regions on it: the mark, the
/// navigation and the actions.
///
/// The slots are parameters rather than children because the arrangement is
/// fixed, and because the middle can only be centred on the bar's own midline
/// if the two ends are the widget's to measure.
class HeaderHero extends StatelessWidget {
  const HeaderHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return DecoratedBox(
      position: DecorationPosition.foreground,
      decoration: BoxDecoration(
        border: Border.all(color: theme.colors.outlineVariant),
        borderRadius: corner,
      ),
      child: ClipRRect(
        borderRadius: corner,
        child: SizedBox(
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              MPHeader(
                brand: const <Widget>[Text('Acme')],
                actions: <Widget>[
                  MPIconButton(
                    icon: const MPIcon(icon: SearchGlyph()),
                    label: 'Search',
                    size: MPSize.sm,
                    onPressed: () {},
                  ),
                  MPButton(size: MPSize.sm, onPressed: () {}, child: const Text('Sign in')),
                ],
                // A wrap rather than a row, so a narrow window folds the links
                // onto a second line instead of running them under the actions.
                child: Wrap(
                  spacing: 16,
                  runSpacing: 4,
                  children: <Widget>[
                    MPTextLink(onPressed: () {}, child: const Text('Docs')),
                    MPTextLink(onPressed: () {}, child: const Text('Pricing')),
                    MPTextLink(onPressed: () {}, child: const Text('Blog')),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'The bar is a header, which a semanticLabel turns into a named landmark region.',
                  style: theme.typescale.bodyMedium.style(theme.colors.onSurfaceVariant),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
