import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// What scrolls, and it is the difference between a document and a workspace.
///
/// The layout is exactly the height it was given and only the region between
/// the bars moves, so the footer is still on screen at the bottom of a list
/// that is not finished. The scrolling is the child's: the layout hands the
/// main region a height, and a scroll view in it does the rest.
class PageLayoutScroll extends StatelessWidget {
  const PageLayoutScroll({super.key});

  static const List<String> _paragraphs = <String>[
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
  ];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: SizedBox(
        width: double.infinity,
        height: 220,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(border: Border.fromBorderSide(rule), borderRadius: corner),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              header: Container(
                height: 44,
                color: colors.surfaceContainer,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: AlignmentDirectional.centerStart,
                child: Text(
                  'Held in place',
                  style: theme.typescale.titleSmall.style(colors.onSurface),
                ),
              ),
              footer: Container(
                height: 36,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: AlignmentDirectional.centerStart,
                decoration: BoxDecoration(
                  color: colors.surfaceContainer,
                  border: Border(top: rule),
                ),
                child: Text(
                  'And so is this',
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                ),
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 12,
                  children: <Widget>[
                    for (final String word in _paragraphs)
                      Text(
                        '$word. Only this column moves.',
                        style: theme.typescale.bodyMedium.style(colors.onSurfaceVariant),
                      ),
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
