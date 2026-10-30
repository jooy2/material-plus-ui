import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _sources = <String>['Search', 'Direct', 'Social', 'Referral', 'Email'];
const List<num> _sessions = <num>[5240, 2810, 1470, 890, 610];

class PieChartHero extends StatelessWidget {
  const PieChartHero({super.key});

  @override
  Widget build(BuildContext context) {
    const List<Widget> pies = <Widget>[
      MPBox(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPTypography('Sessions by source', level: MPTypographyLevel.h6),
            MPPieChart(
              label: 'Sessions by source',
              categories: _sources,
              data: _sessions,
              valueLabels: MPChartValueLabels.all,
            ),
          ],
        ),
      ),
      MPBox(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPTypography('The same, as a ring', level: MPTypographyLevel.h6),
            MPPieChart(
              label: 'Sessions by source, as a ring',
              categories: _sources,
              data: _sessions,
              shape: MPPieChartShape.donut,
              center: MPStatistic(
                align: MPAlign.center,
                size: MPSize.sm,
                label: Text('Sessions'),
                value: 11020,
                compact: false,
              ),
            ),
          ],
        ),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        // A column on a compact window and a row from medium up, as the React
        // demo's `direction={{ compact: 'column', medium: 'row' }}`.
        LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            if (constraints.maxWidth < 600) {
              return const Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                spacing: 16,
                children: pies,
              );
            }

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 16,
              children: <Widget>[for (final Widget pie in pies) Expanded(child: pie)],
            );
          },
        ),
        const SizedBox(height: 24),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'Half a ring, for a tile wider than it is tall.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPPieChart(
                label: 'Storage by kind',
                categories: <String>['Databases', 'Object store', 'Backups'],
                data: <num>[342, 228, 118],
                shape: MPPieChartShape.semi,
                size: MPSize.sm,
                center: MPTypography('688 GB', level: MPTypographyLevel.h4),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
