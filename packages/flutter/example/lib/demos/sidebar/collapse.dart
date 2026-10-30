import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same sidebar, below the window size class it collapses at.
///
/// `collapseBelow: MPPageCollapse.extraLarge` is set so the preview is always
/// on the narrow side of the line. In a real screen the default is
/// `expanded`, which is MD3's own answer: a standard navigation drawer is what
/// an expanded window gets, and a compact one gets the same destinations
/// behind a modal drawer.
///
/// Nothing here is conditional. The trigger draws itself exactly while the
/// column does not, and the sidebar is one widget in both shapes, so the
/// children exist once either way.
class SidebarCollapse extends StatelessWidget {
  const SidebarCollapse({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: SizedBox(
        width: double.infinity,
        height: 220,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(
            border: Border.all(color: colors.outlineVariant),
            borderRadius: corner,
          ),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              collapseBelow: MPPageCollapse.extraLarge,
              header: const MPHeader(
                size: MPSize.xs,
                brand: <Widget>[
                  MPSidebarTrigger(size: MPSize.xs),
                  Text('Acme'),
                ],
              ),
              sidebar: MPSidebar(
                title: const Text('Sections'),
                size: MPSize.sm,
                child: MPList(
                  variant: MPVariant.text,
                  size: MPSize.sm,
                  children: <Widget>[
                    MPListItem(onPressed: () {}, child: const Text('Overview')),
                    MPListItem(onPressed: () {}, child: const Text('Schedule')),
                    MPListItem(onPressed: () {}, child: const Text('Reports')),
                  ],
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Press the hamburger. The column is a drawer at this width, and the trigger '
                  'exists exactly while the column does not.',
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
