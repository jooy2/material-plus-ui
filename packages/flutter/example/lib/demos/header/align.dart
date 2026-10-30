import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// `align: MPAlign.center` is MD3's own center-aligned top app bar.
///
/// It is centred on the *bar* and not in the space left over: both ends are
/// given equal shares, so a brand one character longer does not move the
/// headline. That is the difference a reader notices between two pages of the
/// same site.
class HeaderAlign extends StatelessWidget {
  const HeaderAlign({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          for (final MPAlign align in <MPAlign>[MPAlign.start, MPAlign.center])
            DecoratedBox(
              position: DecorationPosition.foreground,
              decoration: BoxDecoration(
                border: Border.all(color: theme.colors.outlineVariant),
                borderRadius: corner,
              ),
              child: ClipRRect(
                borderRadius: corner,
                child: MPHeader(
                  size: MPSize.sm,
                  align: align,
                  brand: <Widget>[
                    MPIconButton(
                      icon: const MPIcon(icon: MoreGlyph()),
                      label: 'Menu',
                      size: MPSize.xs,
                      onPressed: () {},
                    ),
                  ],
                  actions: <Widget>[
                    MPIconButton(
                      icon: const MPIcon(icon: SearchGlyph()),
                      label: 'Search',
                      size: MPSize.xs,
                      onPressed: () {},
                    ),
                  ],
                  child: Text('Inbox', style: theme.typescale.titleMedium.style()),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
