import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';

const MPResponsive<MPGridSpan> _tile = MPResponsive<MPGridSpan>(
  MPGridSpan(6),
  expanded: MPGridSpan(3),
);

const MPResponsive<MPGridSpan> _half = MPResponsive<MPGridSpan>(
  MPGridSpan(12),
  expanded: MPGridSpan(6),
);

/// What each period shows: the revenue, the figures under it, and the chart.
class _Period {
  const _Period({
    required this.revenue,
    required this.previous,
    required this.orders,
    required this.categories,
    required this.sales,
    required this.returns,
  });

  final int revenue;
  final int previous;
  final int orders;
  final List<String> categories;
  final List<num> sales;
  final List<num> returns;
}

const Map<String, _Period> _periods = <String, _Period>{
  'week': _Period(
    revenue: 12840,
    previous: 11920,
    orders: 86,
    categories: <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sales: <num>[1620, 1980, 1740, 2210, 2480, 1490, 1320],
    returns: <num>[120, 90, 160, 80, 140, 60, 40],
  ),
  'month': _Period(
    revenue: 48120,
    previous: 51200,
    orders: 342,
    categories: <String>['W1', 'W2', 'W3', 'W4'],
    sales: <num>[11200, 12840, 11630, 12450],
    returns: <num>[820, 610, 740, 560],
  ),
  'year': _Period(
    revenue: 562300,
    previous: 498400,
    orders: 4120,
    categories: <String>['Q1', 'Q2', 'Q3', 'Q4'],
    sales: <num>[128400, 136900, 142300, 154700],
    returns: <num>[8200, 7400, 9100, 6800],
  ),
};

const List<MPSegment> _periodSegments = <MPSegment>[
  MPSegment(value: 'week', label: Text('Week')),
  MPSegment(value: 'month', label: Text('Month')),
  MPSegment(value: 'year', label: Text('Year')),
];

/// The first screen: the figures, the charts, and what happened lately.
class HomeScreen extends StatefulWidget {
  /// Creates the screen.
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _period = 'month';
  bool _announcement = true;

  @override
  Widget build(BuildContext context) {
    final _Period period = _periods[_period]!;
    final int unread = conversations.fold(0, (int sum, Conversation one) => sum + one.unread);

    return ScreenScroll(
      title: 'Good morning',
      subtitle: 'Here is how the shop is doing.',
      action: MPBadge(
        content: unread,
        label: '$unread unread messages',
        overlap: MPBadgeOverlap.circle,
        child: MPIconButton(
          label: 'Notifications',
          icon: const MPIcon(icon: BellGlyph()),
          onPressed: () {
            MPSnackbarProvider.of(context).add(
              MPSnackbarOptions(
                message: Text('$unread new messages'),
                actionLabel: const Text('Open'),
                onAction: () {},
              ),
            );
          },
        ),
      ),
      children: <Widget>[
        if (_announcement)
          MPAlert(
            title: const Text('Prices change on 1 December'),
            onClose: () => setState(() => _announcement = false),
            child: const Text('Customers on a yearly plan keep their price until renewal.'),
          ),
        MPSegmentedButton(
          items: _periodSegments,
          value: <String>[_period],
          fullWidth: true,
          semanticLabel: 'Period',
          onChanged: (List<String> next) => setState(() => _period = next.first),
        ),
        MPGrid(
          children: <Widget>[
            MPGridItem(
              span: _tile,
              child: MPBox(
                child: MPStatistic(
                  label: const Text('Revenue'),
                  value: period.revenue,
                  previousValue: period.previous,
                  formatValue: pounds,
                  compact: false,
                  period: const Text('vs the one before'),
                ),
              ),
            ),
            MPGridItem(
              span: _tile,
              child: MPBox(
                child: MPStatistic(
                  label: const Text('Orders'),
                  value: period.orders,
                  trend: MPSparkline(
                    data: <double>[for (final num one in period.sales) one.toDouble()],
                    label: 'Sales in this period',
                  ),
                ),
              ),
            ),
            const MPGridItem(
              span: _tile,
              child: MPBox(
                child: MPStatistic(
                  label: Text('Median reply'),
                  value: 42,
                  previousValue: 57,
                  unit: Text('min'),
                  betterWhen: MPStatisticBetterWhen.down,
                ),
              ),
            ),
            const MPGridItem(
              span: _tile,
              child: MPBox(
                child: MPStatistic(
                  label: Text('Refund rate'),
                  value: 1.8,
                  unit: Text('%'),
                  previousValue: 2.4,
                  betterWhen: MPStatisticBetterWhen.down,
                ),
              ),
            ),
          ],
        ),
        MPCard(
          title: const Text('Sales'),
          subtitle: const Text('Sold and returned, in pounds'),
          child: MPAreaChart(
            label: 'Sales and returns',
            categories: period.categories,
            series: <MPChartSeries>[
              MPChartSeries(name: 'Sold', data: period.sales),
              MPChartSeries(name: 'Returned', data: period.returns),
            ],
            curve: MPChartCurve.smooth,
            height: 220,
          ),
        ),
        const MPGrid(
          children: <Widget>[
            MPGridItem(
              span: _half,
              child: MPCard(
                title: Text('Where customers come from'),
                child: MPPieChart(
                  label: 'Visits by source',
                  shape: MPPieChartShape.donut,
                  categories: <String>['Search', 'Direct', 'Social', 'Email'],
                  data: <num>[5240, 2810, 1470, 610],
                  height: 220,
                ),
              ),
            ),
            MPGridItem(
              span: _half,
              child: MPCard(
                title: Text('Monthly goal'),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisSize: MainAxisSize.min,
                  spacing: 16,
                  children: <Widget>[
                    MPGaugeChart(value: 72, label: Text('Of the monthly goal'), height: 160),
                    MPProgressLinear(value: 72, label: Text('£48,120 of £66,000'), showValue: true),
                    MPMeter(value: 38, label: Text('Storage used'), showValue: true),
                  ],
                ),
              ),
            ),
          ],
        ),
        MPCard(
          title: const Text('Best sellers'),
          child: MPBarChart(
            label: 'Units sold by product',
            categories: const <String>['Mugs', 'Prints', 'Tote bags', 'Notebooks', 'Pins'],
            series: const <MPChartSeries>[
              MPChartSeries(name: 'Units', data: <num>[420, 380, 260, 190, 140]),
            ],
            horizontal: true,
            valueLabels: MPChartValueLabels.all,
            height: 220,
          ),
        ),
        MPCard(
          title: const Text('Lately'),
          headerAction: MPStack(
            max: 3,
            total: people.length,
            overflow: (int hidden) => MPAvatar(initials: '+$hidden', size: MPSize.sm),
            children: <Widget>[
              for (final Person person in people.take(3))
                MPAvatar(
                  key: ValueKey<String>(person.name),
                  name: person.name,
                  image: person.image,
                  size: MPSize.sm,
                ),
            ],
          ),
          child: const MPTimeline(
            children: <MPTimelineItem>[
              MPTimelineItem(
                title: Text('Order INV-0123 paid'),
                meta: Text('09:41'),
                status: MPTimelineStatus.complete,
                child: Text('Juniper Hotels paid £1,240.'),
              ),
              MPTimelineItem(
                title: Text('Stock running low'),
                meta: Text('08:15'),
                status: MPTimelineStatus.current,
                child: Text('Twelve notebooks left.'),
              ),
              MPTimelineItem(
                title: Text('Newsletter goes out'),
                meta: Text('Tomorrow'),
                status: MPTimelineStatus.upcoming,
                child: Text('Scheduled for 10:00.'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
