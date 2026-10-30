import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The skeleton, drawn as a skeleton.
///
/// The bars and the column here are plain boxes with a surface role on them,
/// which is what the layout actually arranges: it draws nothing itself, and
/// every region on the screen comes from whatever was handed to a slot.
/// `MPHeader`, `MPFooter` and `MPSidebar` are the ones you would reach for,
/// and each of their pages shows the assembled version.
class PageLayoutHero extends StatelessWidget {
  const PageLayoutHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: SizedBox(
        width: double.infinity,
        height: 260,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(border: Border.fromBorderSide(rule), borderRadius: corner),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              header: Container(
                height: 48,
                color: colors.surfaceContainer,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: AlignmentDirectional.centerStart,
                child: Text('Header', style: theme.typescale.titleSmall.style(colors.onSurface)),
              ),
              sidebar: Container(
                width: 128,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: colors.surfaceContainerLow,
                  border: BorderDirectional(end: rule),
                ),
                child: Text(
                  'Sidebar',
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                ),
              ),
              footer: Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: AlignmentDirectional.centerStart,
                decoration: BoxDecoration(
                  color: colors.surfaceContainer,
                  border: Border(top: rule),
                ),
                child: Text(
                  'Footer',
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Text(
                  'The main region. Everything else on this page is a landmark of its own, '
                  'which is the whole reason the layout is a component rather than four boxes.',
                  style: theme.typescale.bodyMedium.style(colors.onSurfaceVariant),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
