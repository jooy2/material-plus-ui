import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPThreshold> _load = <MPThreshold>[
  MPThreshold(from: 70, color: MPColor.tertiary),
  MPThreshold(from: 90, color: MPColor.error),
];

class GaugeChartHero extends StatelessWidget {
  const GaugeChartHero({super.key});

  @override
  Widget build(BuildContext context) {
    const List<Widget> gauges = <Widget>[
      MPBox(
        child: MPGaugeChart(
          value: 72,
          label: Text('CPU'),
          size: MPSize.sm,
          bands: true,
          thresholds: _load,
        ),
      ),
      MPBox(
        child: MPGaugeChart(
          value: 94,
          label: Text('Memory'),
          size: MPSize.sm,
          bands: true,
          thresholds: _load,
        ),
      ),
      MPBox(
        child: MPGaugeChart(value: 41, label: Text('Disk'), size: MPSize.sm),
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
                children: gauges,
              );
            }

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 16,
              children: <Widget>[for (final Widget gauge in gauges) Expanded(child: gauge)],
            );
          },
        ),
        const SizedBox(height: 24),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            const MPTypography(
              'A half dial, standing on its base, with the reading written its own way.',
              level: MPTypographyLevel.caption,
            ),
            MPBox(
              child: MPGaugeChart(
                value: 0.883,
                min: 0,
                max: 1,
                sweep: 180,
                label: const Text('Uptime this quarter'),
                format: (double value) => '${(value * 100).toStringAsFixed(1)}%',
                thresholds: const <MPThreshold>[MPThreshold(from: 0.95, color: MPColor.tertiary)],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
