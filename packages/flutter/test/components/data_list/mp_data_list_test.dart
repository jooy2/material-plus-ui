import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/data_list/mp_data_list.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const List<MPDataListItem> _pairs = <MPDataListItem>[
  MPDataListItem(label: Text('Status'), child: Text('Active')),
  MPDataListItem(label: Text('Last deployed'), child: Text('4 March')),
];

int _rules(WidgetTester tester) {
  final Iterable<BoxDecoration> rows = tester
      .widget<Table>(find.byType(Table))
      .children
      .map((TableRow row) => row.decoration)
      .whereType<BoxDecoration>();

  return rows.where((BoxDecoration decoration) => decoration.border != null).length;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('sets each label muted and small, and each value in the prose role', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 400, const MPDataList(children: _pairs)));

    expect(styleOf(tester, 'Status').color, light.onSurfaceVariant);
    expect(styleOf(tester, 'Status').fontSize, 12);
    expect(styleOf(tester, 'Active').color, light.onSurface);
    expect(styleOf(tester, 'Active').fontSize, 16);
  });

  testWidgets('starts every value at the same place, past the widest label', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 400, const MPDataList(children: _pairs)));

    final double first = tester.getTopLeft(find.text('Active')).dx;
    final double second = tester.getTopLeft(find.text('4 March')).dx;
    final double widest = tester.getTopRight(find.text('Last deployed')).dx;

    expect(first, second);
    // The `md` column gap.
    expect(first - widest, moreOrLessEquals(20, epsilon: 0.5));
  });

  testWidgets('takes a label width when it is given one', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 400, const MPDataList(labelWidth: 160, children: _pairs)));

    final double list = tester.getTopLeft(find.byType(MPDataList)).dx;

    expect(tester.getTopLeft(find.text('Active')).dx - list, 160 + 20);
  });

  testWidgets('lines a label up with its value on one baseline', (WidgetTester tester) async {
    await tester.pumpWidget(host(width: 400, const MPDataList(children: _pairs)));

    // A 12px label beside a 16px value: their bottoms differ, their baselines
    // do not, so the label sits lower than the value's top.
    expect(
      tester.getTopLeft(find.text('Status')).dy,
      greaterThan(tester.getTopLeft(find.text('Active')).dy),
    );
  });

  testWidgets('stacks the label over the value when vertical', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, const MPDataList(orientation: MPOrientation.vertical, children: _pairs)),
    );

    final Rect label = tester.getRect(find.text('Status'));
    final Rect value = tester.getRect(find.text('Active'));

    expect(label.left, value.left);
    // Directly under its own label, with the row gap above the next label.
    expect(value.top, label.bottom);
    expect(tester.getTopLeft(find.text('Last deployed')).dy - value.bottom, 12);
  });

  testWidgets('tightens the gaps with density and leaves the type alone', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPDataList(orientation: MPOrientation.vertical, density: -2, children: _pairs),
      ),
    );

    expect(
      tester.getTopLeft(find.text('Last deployed')).dy -
          tester.getBottomLeft(find.text('Active')).dy,
      4,
    );
    expect(styleOf(tester, 'Active').fontSize, 16);
  });

  testWidgets('stops tightening at the width a gap still means something', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPDataList(
          orientation: MPOrientation.vertical,
          size: MPSize.xs,
          density: -3,
          children: _pairs,
        ),
      ),
    );

    expect(
      tester.getTopLeft(find.text('Last deployed')).dy -
          tester.getBottomLeft(find.text('Active')).dy,
      4,
    );
  });

  testWidgets('draws a hairline between the pairs when asked, across both halves', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(width: 400, const MPDataList(children: _pairs)));
    expect(_rules(tester), 0);

    await tester.pumpWidget(host(width: 400, const MPDataList(dividers: true, children: _pairs)));
    expect(_rules(tester), 1);
  });

  testWidgets('draws no line between a vertical label and its own value', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPDataList(orientation: MPOrientation.vertical, dividers: true, children: _pairs),
      ),
    );

    final Iterable<BoxDecoration> ruled = tester
        .widgetList<DecoratedBox>(find.byType(DecoratedBox))
        .map((DecoratedBox box) => box.decoration)
        .whereType<BoxDecoration>()
        .where((BoxDecoration decoration) => decoration.border != null);

    expect(ruled, hasLength(1));
    // Above the second label, not between it and its value.
    expect(
      tester.getTopLeft(find.text('Last deployed')).dy,
      greaterThan(tester.getBottomLeft(find.text('Active')).dy + 12),
    );
  });

  testWidgets('draws an empty value rather than collapsing the pair', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPDataList(
          children: <MPDataListItem>[
            MPDataListItem(label: Text('Status')),
            MPDataListItem(label: Text('Owner'), child: Text('Priya')),
          ],
        ),
      ),
    );

    expect(find.text('Status'), findsOneWidget);
    expect(tester.widget<Table>(find.byType(Table)).children, hasLength(2));
  });

  testWidgets('mirrors the columns under right-to-left text', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, textDirection: TextDirection.rtl, const MPDataList(children: _pairs)),
    );

    expect(
      tester.getCenter(find.text('Status')).dx,
      greaterThan(tester.getCenter(find.text('Active')).dx),
    );
  });
}
