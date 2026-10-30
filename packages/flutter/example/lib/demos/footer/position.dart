import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A footer that ends the document is the last thing in the scroll; one that
/// has to stay in reach (a form's save row, a cookie notice) goes below the
/// scrolling part of the screen.
///
/// That is what `MPPageLayout`'s `footer` slot is: the layout hands the region
/// between the bars whatever height is left, so the save row stays on screen
/// while the paragraphs scroll above it.
class FooterPosition extends StatelessWidget {
  const FooterPosition({super.key});

  static const List<String> _words = <String>['One', 'Two', 'Three', 'Four', 'Five', 'Six'];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: SizedBox(
        width: double.infinity,
        height: 220,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(
            border: Border.all(color: theme.colors.outlineVariant),
            borderRadius: corner,
          ),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              footer: MPFooter(
                size: MPSize.sm,
                variant: MPVariant.tonal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  spacing: 12,
                  children: <Widget>[
                    const MPTypography('3 unsaved changes', level: MPTypographyLevel.caption),
                    MPButton(size: MPSize.xs, onPressed: () {}, child: const Text('Save')),
                  ],
                ),
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 12,
                  children: <Widget>[
                    for (final String word in _words)
                      MPTypography('$word. The save row stays in reach while this scrolls.'),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
