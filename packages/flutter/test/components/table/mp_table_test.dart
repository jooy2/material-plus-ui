import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/table/mp_table.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

typedef _Build = Map<String, Object?>;

const List<_Build> _builds = <_Build>[
  <String, Object?>{'id': '4821', 'branch': 'main', 'duration': 184},
  <String, Object?>{'id': '4820', 'branch': 'feat/tooltip', 'duration': 96},
  <String, Object?>{'id': '4819', 'branch': 'feat/chip', 'duration': 41},
];

const List<MPTableColumn<_Build>> _columns = <MPTableColumn<_Build>>[
  MPTableColumn<_Build>(key: 'id', label: Text('#'), width: 120),
  MPTableColumn<_Build>(key: 'branch', label: Text('Branch')),
  MPTableColumn<_Build>(key: 'duration', label: Text('Duration'), align: MPAlign.end),
];

/// The painter behind the rows, which draws their rules, stripes and hover.
CustomPaint _bands(WidgetTester tester) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: find.byType(MPTable<_Build>), matching: find.byType(CustomPaint)),
      )
      .firstWhere((CustomPaint paint) => paint.painter != null);
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('draws a heading per column, in order', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      final double id = tester.getCenter(find.text('#')).dx;
      final double branch = tester.getCenter(find.text('Branch')).dx;
      final double duration = tester.getCenter(find.text('Duration')).dx;

      expect(id, lessThan(branch));
      expect(branch, lessThan(duration));
    });

    testWidgets('announces every heading as a column header', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      expect(
        tester.getSemantics(find.text('Branch')).getSemanticsData().role,
        SemanticsRole.columnHeader,
      );
      semantics.dispose();
    });

    testWidgets('falls back to the key when a column has no label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPTable<_Build>(
            headers: <MPTableColumn<_Build>>[MPTableColumn<_Build>(key: 'branch')],
            items: _builds,
          ),
        ),
      );

      expect(find.text('branch'), findsOneWidget);
    });

    testWidgets('reads each cell off the row by key, numbers included', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      expect(find.text('feat/tooltip'), findsOneWidget);
      expect(find.text('184'), findsOneWidget);
    });

    testWidgets('lets a column render its own cell', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          MPTable<_Build>(
            headers: <MPTableColumn<_Build>>[
              MPTableColumn<_Build>(
                key: 'duration',
                render: (_Build row, int index) => Text('${row['duration']}s #$index'),
              ),
            ],
            items: _builds,
          ),
        ),
      );

      expect(find.text('184s #0'), findsOneWidget);
      expect(find.text('41s #2'), findsOneWidget);
    });

    testWidgets('draws an empty cell rather than a value it cannot draw', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          MPTable<_Build>(
            headers: const <MPTableColumn<_Build>>[
              MPTableColumn<_Build>(key: 'when', label: Text('When')),
            ],
            items: <_Build>[
              <String, Object?>{'when': DateTime(2026)},
            ],
          ),
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.textContaining('2026'), findsNothing);
    });

    testWidgets('names the table from a caption of plain words', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 480,
          const MPTable<_Build>(caption: Text('Builds'), headers: _columns, items: _builds),
        ),
      );

      expect(find.text('Builds'), findsOneWidget);
      expect(find.bySemanticsLabel('Builds'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('puts the header on a neutral band', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      final TableRow header = tester.widget<Table>(find.byType(Table)).children.first;

      expect((header.decoration! as BoxDecoration).color, light.surfaceContainer);
      expect(styleOf(tester, 'Branch').color, light.onSurfaceVariant);
    });
  });

  group('widths and alignment', () {
    testWidgets('holds a fixed width exactly', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      final Table table = tester.widget<Table>(find.byType(Table));

      expect((table.columnWidths![0]! as FixedColumnWidth).value, 120);
    });

    testWidgets('lines a column up against its end', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: _builds)),
      );

      // The numbers end on one line.
      expect(tester.getTopRight(find.text('184')).dx, tester.getTopRight(find.text('96')).dx);
      expect(tester.getTopRight(find.text('96')).dx, tester.getTopRight(find.text('41')).dx);
    });
  });

  group('empty', () {
    testWidgets('says so rather than showing an empty grid', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: <_Build>[])),
      );

      expect(find.text('No data'), findsOneWidget);
    });

    testWidgets('takes wording of its own, or a locale', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPTable<_Build>(headers: _columns, items: <_Build>[], empty: Text('No builds')),
        ),
      );
      expect(find.text('No builds'), findsOneWidget);

      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(headers: _columns, items: <_Build>[], locale: 'ko')),
      );
      expect(find.text('No data'), findsNothing);
    });
  });

  group('rows', () {
    testWidgets('tints every other one when striped', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(striped: true, headers: _columns, items: _builds)),
      );

      final dynamic bands = _bands(tester).painter;
      final Color? Function(int)? tint = bands.tint as Color? Function(int)?;

      expect(tint!(0), isNull);
      expect(tint(1), light.surfaceContainerLow);
    });

    testWidgets('fires with the row and its index, by pointer and by keyboard', (
      WidgetTester tester,
    ) async {
      final List<String> pressed = <String>[];
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          width: 480,
          afterFocusStop(
            before,
            MPTable<_Build>(
              headers: _columns,
              items: _builds,
              onRowPressed: (_Build row, int index) => pressed.add('${row['id']}@$index'),
            ),
          ),
        ),
      );

      await tester.tap(find.text('feat/chip'));
      expect(pressed, <String>['4819@2']);

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(pressed.length, 3);
    });

    testWidgets('stays out of the focus order while there is nothing to press', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          width: 480,
          afterFocusStop(before, const MPTable<_Build>(headers: _columns, items: _builds)),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(MPTable<_Build>)), isFalse);
    });

    testWidgets('lights the row under the pointer once it is hoverable', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 480, const MPTable<_Build>(hoverable: true, headers: _columns, items: _builds)),
      );

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('main')));
      await tester.pump();

      final dynamic bands = _bands(tester).painter;

      expect((bands.hovered as ValueListenable<int?>).value, 0);
      expect(bands.hover, light.surfaceContainer);
    });
  });

  group('density', () {
    testWidgets('takes four pixels out of the row a step, and none out of the text', (
      WidgetTester tester,
    ) async {
      final List<double> heights = <double>[];

      for (final MPDensity density in <MPDensity>[0, -1, -2, -3]) {
        await tester.pumpWidget(
          host(
            width: 480,
            MPTable<_Build>(density: density, headers: _columns, items: _builds.sublist(0, 1)),
          ),
        );

        final RenderTable table = tester.renderObject<RenderTable>(find.byType(Table));

        heights.add(table.getRowBox(1).height);
        expect(styleOf(tester, 'main').fontSize, 14);
      }

      // `bodyMedium` is a 20px line, and the rule above a row is drawn on it.
      expect(heights, <double>[52, 48, 44, 40]);
    });

    testWidgets('takes the configured default when the table says nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          MPConfigProvider(
            density: -1,
            child: MPTable<_Build>(headers: _columns, items: _builds.sublist(0, 1)),
          ),
        ),
      );

      expect(tester.renderObject<RenderTable>(find.byType(Table)).getRowBox(1).height, 48);
    });
  });

  group('scrolling', () {
    testWidgets('scrolls in a box smaller than its rows, and pins the header when asked', (
      WidgetTester tester,
    ) async {
      final List<_Build> many = <_Build>[
        for (int index = 0; index < 30; index += 1)
          <String, Object?>{'id': '$index', 'branch': 'b$index'},
      ];

      await tester.pumpWidget(
        host(
          width: 480,
          height: 240,
          MPTable<_Build>(stickyHeader: true, headers: _columns, items: many),
        ),
      );
      await tester.pump();

      await tester.drag(find.text('b3'), const Offset(0, -300));
      await tester.pumpAndSettle();

      // The pinned copy of the header is still at the top of the sheet.
      final double top = tester.getTopLeft(find.byType(MPTable<_Build>)).dy;
      final Finder branches = find.text('Branch');

      expect(branches, findsNWidgets(2));
      expect(
        <double>[
          for (int index = 0; index < 2; index += 1) tester.getTopLeft(branches.at(index)).dy,
        ].any((double y) => y < top + 30),
        isTrue,
      );
    });
  });
}
