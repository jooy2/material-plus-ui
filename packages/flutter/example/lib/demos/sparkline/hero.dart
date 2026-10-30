import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A week of something, with a dip in the middle and a gap where nothing ran.
const List<double> _week = <double>[1240, 1310, 1180, 1420, 1390, 1610, 1880];
const List<double?> _gappy = <double?>[40, 44, 39, null, null, 51, 58, 62];

class SparklineHero extends StatelessWidget {
  const SparklineHero({super.key});

  @override
  Widget build(BuildContext context) {
    const List<Widget> tiles = <Widget>[
      MPBox(
        child: MPStatistic(
          label: Text('Weekly signups'),
          value: 1880,
          previousValue: 1240,
          period: Text('vs last week'),
          trend: MPSparkline(data: _week, shape: MPSparklineShape.area, curve: MPChartCurve.smooth),
        ),
      ),
      MPBox(
        child: MPStatistic(
          label: Text('Build minutes'),
          value: 62,
          previousValue: 40,
          betterWhen: MPStatisticBetterWhen.down,
          period: Text('vs last week'),
          trend: MPSparkline(data: _gappy, shape: MPSparklineShape.bar, color: MPColor.tertiary),
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
                children: tiles,
              );
            }

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 16,
              children: <Widget>[for (final Widget tile in tiles) Expanded(child: tile)],
            );
          },
        ),
        const SizedBox(height: 20),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            MPTypography(
              'The three shapes, and a gap the line refuses to draw through.',
              level: MPTypographyLevel.caption,
            ),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: <Widget>[
                MPSparkline(data: _week, width: 140),
                MPSparkline(
                  data: _week,
                  shape: MPSparklineShape.area,
                  curve: MPChartCurve.smooth,
                  width: 140,
                  color: MPColor.secondary,
                ),
                MPSparkline(data: _gappy, width: 140, color: MPColor.tertiary),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
