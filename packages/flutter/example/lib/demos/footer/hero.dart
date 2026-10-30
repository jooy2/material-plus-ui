import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A footer has slots for nothing and room for anything.
///
/// A header's three regions are a fixed arrangement worth writing once; four
/// columns of links is one site's answer and a single line is the next one's,
/// so the widget decides the sheet and leaves the arrangement to a grid the
/// caller puts inside it.
class FooterHero extends StatelessWidget {
  const FooterHero({super.key});

  static const List<(String, List<String>)> _columns = <(String, List<String>)>[
    ('Product', <String>['Overview', 'Pricing', 'Changelog']),
    ('Company', <String>['About', 'Careers', 'Contact']),
    ('Legal', <String>['Terms', 'Privacy']),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPFooter(
        maxWidth: const MPResponsive<MPMeasure>(MPMeasure.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            MPGrid(
              spacing: const MPResponsive<double>(6),
              children: <Widget>[
                for (final (String title, List<String> links) in _columns)
                  MPGridItem(
                    span: const MPResponsive<MPGridSpan>(MPGridSpan(6), medium: MPGridSpan(4)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      spacing: 8,
                      children: <Widget>[
                        MPTypography(title, level: MPTypographyLevel.overline),
                        for (final String link in links)
                          MPTextLink(onPressed: () {}, child: Text(link)),
                      ],
                    ),
                  ),
              ],
            ),
            const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: MPDivider()),
            const MPTypography(
              '© 2026 Acme. All rights reserved.',
              level: MPTypographyLevel.caption,
            ),
          ],
        ),
      ),
    );
  }
}
