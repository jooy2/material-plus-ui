import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The column, in a layout.
///
/// It is the complementary region, and it names itself, because a screen with
/// two of them and no names is a screen a screen reader offers as two regions
/// called the same thing.
///
/// `collapseBelow: MPPageCollapse.none` here so the preview stays a column at
/// the width of a documentation page. In a real layout the class comes from
/// the `MPPageLayout`.
class SidebarHero extends StatefulWidget {
  const SidebarHero({super.key});

  @override
  State<SidebarHero> createState() => _SidebarHeroState();
}

class _SidebarHeroState extends State<SidebarHero> {
  static const List<String> _sections = <String>['Overview', 'Schedule', 'Reports', 'Settings'];

  String _section = 'Overview';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: SizedBox(
        width: double.infinity,
        height: 280,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(
            border: Border.all(color: colors.outlineVariant),
            borderRadius: corner,
          ),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              collapseBelow: MPPageCollapse.none,
              header: const MPHeader(size: MPSize.xs, brand: <Widget>[Text('Acme')]),
              sidebar: MPSidebar(
                width: 180,
                label: 'Sections',
                size: MPSize.sm,
                child: MPList(
                  variant: MPVariant.text,
                  size: MPSize.sm,
                  children: <Widget>[
                    for (final String name in _sections)
                      MPListItem(
                        selected: name == _section,
                        onPressed: () => setState(() => _section = name),
                        child: Text(name),
                      ),
                  ],
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  _section,
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
