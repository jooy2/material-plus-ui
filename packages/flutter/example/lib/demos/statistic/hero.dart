import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Four tiles, and two of them are better when they fall.
class StatisticHero extends StatelessWidget {
  const StatisticHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const MPGrid(
      columns: MPResponsive<int>(1, medium: 2, expanded: 4),
      spacing: MPResponsive<double>(16),
      children: <Widget>[
        MPBox(
          child: MPStatistic(
            label: Text('Active installs'),
            value: 128400,
            previousValue: 119200,
            period: Text('vs last month'),
          ),
        ),
        MPBox(
          child: MPStatistic(
            label: Text('Revenue'),
            value: 4234900,
            previousValue: 4610000,
            formatValue: _dollars,
            compact: false,
            delta: MPStatisticDeltaFormat.percent,
            period: Text('vs last month'),
          ),
        ),
        MPBox(
          child: MPStatistic(
            label: Text('Median response'),
            value: 182,
            previousValue: 247,
            unit: Text('ms'),
            betterWhen: MPStatisticBetterWhen.down,
            delta: MPStatisticDeltaFormat.both,
            period: Text('vs last month'),
          ),
        ),
        MPBox(
          child: MPStatistic(
            label: Text('Open incidents'),
            value: 3,
            previousValue: 3,
            betterWhen: MPStatisticBetterWhen.down,
            caption: Text('Two waiting on a release.'),
          ),
        ),
      ],
    );
  }
}

/// `$4,234,900`: whole dollars, grouped.
String _dollars(num value) {
  final String digits = value.round().abs().toString();
  final StringBuffer grouped = StringBuffer();

  for (int index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 == 0) {
      grouped.write(',');
    }

    grouped.write(digits[index]);
  }

  return '${value < 0 ? '-' : ''}\$$grouped';
}
