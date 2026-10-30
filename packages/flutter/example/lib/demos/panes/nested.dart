import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A split inside a split, which is how an editor layout is built.
///
/// The inner `MPPanes` is simply what one pane holds. It measures itself the
/// same way, so its own `defaultSize` is a share of whatever the outer split
/// currently gives it: resizing the outer handle does not need the inner one to
/// be told.
///
/// A pane draws no surface of its own on purpose: the moment it did, it would
/// stop being usable as the thing a table, a card or an editor is put inside.
class PanesNested extends StatelessWidget {
  const PanesNested({super.key});

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
        child: const SizedBox(
          width: double.infinity,
          height: 240,
          child: MPPanes(
            children: <MPPane>[
              MPPane(
                defaultSize: MPPaneSize.percent(30),
                minSize: MPPaneSize.percent(15),
                child: _Region(title: 'Files'),
              ),
              MPPane(
                child: MPPanes(
                  orientation: MPOrientation.vertical,
                  color: MPColor.tertiary,
                  children: <MPPane>[
                    MPPane(
                      defaultSize: MPPaneSize.percent(65),
                      minSize: MPPaneSize.percent(20),
                      child: _Region(title: 'Editor'),
                    ),
                    MPPane(
                      minSize: MPPaneSize.percent(20),
                      child: _Region(title: 'Terminal'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A pane's content: its title in the corner.
class _Region extends StatelessWidget {
  const _Region({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Text(
        title,
        style: theme.typescale.bodySmall
            .style(theme.colors.onSurface)
            .copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}
