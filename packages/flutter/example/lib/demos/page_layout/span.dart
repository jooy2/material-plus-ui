import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Which of the header and the sidebars takes the top corner.
///
/// `full` is a website: one bar across the whole width, and the page beneath
/// it. `content` is an application, and MD3's own drawing of a standard
/// navigation drawer: the drawer is the outermost thing on the screen and the
/// app bar belongs to the pane it is over.
class PageLayoutSpan extends StatelessWidget {
  const PageLayoutSpan({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          _Shell(span: MPPageSpan.full, label: 'headerSpan: MPPageSpan.full'),
          _Shell(span: MPPageSpan.content, label: 'headerSpan: MPPageSpan.content'),
        ],
      ),
    );
  }
}

/// One shell, so the two arrangements differ only in where the bar starts.
class _Shell extends StatelessWidget {
  const _Shell({required this.span, required this.label});

  final MPPageSpan span;
  final String label;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return SizedBox(
      height: 180,
      child: DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: BoxDecoration(
          border: Border.all(color: colors.outlineVariant),
          borderRadius: corner,
        ),
        child: ClipRRect(
          borderRadius: corner,
          child: MPPageLayout(
            headerSpan: span,
            // Two layouts side by side are two main regions, and Flutter asks
            // that each has a name of its own.
            mainSemanticLabel: label,
            header: Container(
              height: 36,
              color: colors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: AlignmentDirectional.centerStart,
              child: Text(label, style: theme.typescale.labelLarge.style(colors.onPrimary)),
            ),
            sidebar: Container(
              width: 96,
              color: colors.surfaceContainer,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(
                'Sidebar',
                style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(
                'Content',
                style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
