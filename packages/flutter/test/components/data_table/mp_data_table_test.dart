import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/checkbox/mp_checkbox.dart';
import 'package:material_plus_ui/src/components/data_table/mp_data_table.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';

typedef _Row = Map<String, Object?>;

const List<_Row> _rows = <_Row>[
  <String, Object?>{'id': 1, 'name': 'Banana', 'qty': 12},
  <String, Object?>{'id': 2, 'name': 'apple', 'qty': 3},
  <String, Object?>{'id': 3, 'name': 'Cherry', 'qty': 120},
  <String, Object?>{'id': 4, 'name': 'Date', 'qty': null},
];

const List<MPDataTableColumn<_Row>> _columns = <MPDataTableColumn<_Row>>[
  MPDataTableColumn<_Row>(key: 'name', label: Text('Name')),
  MPDataTableColumn<_Row>(key: 'qty', label: Text('Qty')),
];

Object _key(_Row row, int index) => row['id']!;

/// The names down the first column, top to bottom.
List<String> _names(WidgetTester tester) {
  final List<Text> texts = tester
      .widgetList<Text>(find.descendant(of: find.byType(Table), matching: find.byType(Text)))
      .toList();

  return <String>[
    for (final Text text in texts)
      if (<String>['Banana', 'apple', 'Cherry', 'Date', 'Elder'].contains(text.data)) text.data!,
  ];
}

Widget _table({
  List<_Row> items = _rows,
  bool sortable = false,
  MPDataTableSortMode sortMode = MPDataTableSortMode.single,
  List<MPDataTableSort>? sort,
  ValueChanged<List<MPDataTableSort>>? onSortChange,
  bool searchable = false,
  bool Function(_Row, int)? filter,
  bool paged = false,
  int initialPageSize = 25,
  MPDataTableSelectionMode selectionMode = MPDataTableSelectionMode.none,
  void Function(List<Object>, List<_Row>)? onSelectedChange,
  bool checkboxes = false,
  bool resizable = false,
  ValueChanged<Map<String, double>>? onColumnWidthsChange,
  bool exportable = false,
  bool exportEscapeFormulas = true,
  ValueChanged<String>? onExport,
  List<MPDataTableColumn<_Row>> headers = _columns,
}) {
  return host(
    width: 640,
    height: 600,
    overlay: true,
    MPDataTable<_Row>(
      headers: headers,
      items: items,
      getRowKey: _key,
      sortable: sortable,
      sortMode: sortMode,
      sort: sort,
      onSortChange: onSortChange,
      searchable: searchable,
      filter: filter,
      paged: paged,
      initialPageSize: initialPageSize,
      pageSizeOptions: const <int>[],
      selectionMode: selectionMode,
      onSelectedChange: onSelectedChange,
      checkboxes: checkboxes,
      resizable: resizable,
      onColumnWidthsChange: onColumnWidthsChange,
      exportable: exportable,
      exportEscapeFormulas: exportEscapeFormulas,
      onExport: onExport,
    ),
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('draws the rows it was given, in the order it was given', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_table());

    expect(_names(tester), <String>['Banana', 'apple', 'Cherry', 'Date']);
  });

  testWidgets('says so when nothing is left', (WidgetTester tester) async {
    await tester.pumpWidget(_table(items: const <_Row>[]));

    expect(find.text('No data'), findsOneWidget);
  });

  group('sorting', () {
    testWidgets('cycles a column through ascending, descending and back to nothing', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_table(sortable: true));

      await tester.tap(find.text('Name'));
      await tester.pump();
      expect(_names(tester), <String>['apple', 'Banana', 'Cherry', 'Date']);

      await tester.tap(find.text('Name'));
      await tester.pump();
      expect(_names(tester), <String>['Date', 'Cherry', 'Banana', 'apple']);

      await tester.tap(find.text('Name'));
      await tester.pump();
      expect(_names(tester), <String>['Banana', 'apple', 'Cherry', 'Date']);
    });

    testWidgets('sorts numbers as numbers, and puts the empty ones last either way', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_table(sortable: true));

      await tester.tap(find.text('Qty'));
      await tester.pump();
      expect(_names(tester), <String>['apple', 'Banana', 'Cherry', 'Date']);

      await tester.tap(find.text('Qty'));
      await tester.pump();
      expect(_names(tester), <String>['Cherry', 'Banana', 'apple', 'Date']);
    });

    testWidgets('draws the sort arrow in the family it was given', (WidgetTester tester) async {
      await tester.pumpWidget(_table(sortable: true));

      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(
        tester
            .widgetList<MPGlyph>(find.byType(MPGlyph))
            .where((MPGlyph glyph) => glyph.color == light.primary),
        hasLength(1),
      );
    });

    testWidgets('takes a comparison of its own for a value that has no order', (
      WidgetTester tester,
    ) async {
      const Map<String, int> stage = <String, int>{'Banana': 2, 'apple': 0, 'Cherry': 1, 'Date': 3};

      await tester.pumpWidget(
        _table(
          sortable: true,
          headers: <MPDataTableColumn<_Row>>[
            MPDataTableColumn<_Row>(
              key: 'name',
              label: const Text('Name'),
              compare: (_Row a, _Row b) => stage[a['name']]! - stage[b['name']]!,
            ),
          ],
        ),
      );

      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(_names(tester), <String>['apple', 'Cherry', 'Banana', 'Date']);
    });

    testWidgets('adds a second key on a Shift-press, and only when it may', (
      WidgetTester tester,
    ) async {
      final List<List<MPDataTableSort>> sorts = <List<MPDataTableSort>>[];

      await tester.pumpWidget(
        _table(sortable: true, sortMode: MPDataTableSortMode.multiple, onSortChange: sorts.add),
      );

      await tester.tap(find.text('Name'));
      await tester.pump();
      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.tap(find.text('Qty'));
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pump();

      expect(sorts.last, const <MPDataTableSort>[
        MPDataTableSort(key: 'name', direction: MPSortDirection.asc),
        MPDataTableSort(key: 'qty', direction: MPSortDirection.asc),
      ]);
      // Each sorted heading carries its place in the order.
      expect(find.text('2'), findsOneWidget);

      sorts.clear();
      await tester.pumpWidget(
        KeyedSubtree(
          key: const Key('single'),
          child: _table(sortable: true, onSortChange: sorts.add),
        ),
      );
      await tester.tap(find.text('Name'));
      await tester.pump();
      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.tap(find.text('Qty'));
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);

      expect(sorts.last, const <MPDataTableSort>[
        MPDataTableSort(key: 'qty', direction: MPSortDirection.asc),
      ]);
    });

    testWidgets('reports the sort rather than keeping it, when it is controlled', (
      WidgetTester tester,
    ) async {
      final List<List<MPDataTableSort>> sorts = <List<MPDataTableSort>>[];

      await tester.pumpWidget(
        _table(sortable: true, sort: const <MPDataTableSort>[], onSortChange: sorts.add),
      );

      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(sorts, hasLength(1));
      expect(_names(tester), <String>['Banana', 'apple', 'Cherry', 'Date']);
    });
  });

  group('the search', () {
    testWidgets('matches every searchable column, folded, and a filter after it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_table(searchable: true));

      await tester.enterText(find.byType(EditableText), 'AN');
      await tester.pump();
      expect(_names(tester), <String>['Banana']);

      await tester.enterText(find.byType(EditableText), '12');
      await tester.pump();
      expect(_names(tester), <String>['Banana', 'Cherry']);

      await tester.pumpWidget(
        _table(searchable: true, filter: (_Row row, int index) => row['id'] != 3),
      );
      await tester.pump();
      expect(_names(tester), <String>['Banana']);
    });

    testWidgets('leaves a column out when it is told to', (WidgetTester tester) async {
      await tester.pumpWidget(
        _table(
          searchable: true,
          headers: const <MPDataTableColumn<_Row>>[
            MPDataTableColumn<_Row>(key: 'name', label: Text('Name')),
            MPDataTableColumn<_Row>(key: 'qty', label: Text('Qty'), searchable: false),
          ],
        ),
      );

      await tester.enterText(find.byType(EditableText), '12');
      await tester.pump();

      expect(_names(tester), isEmpty);
    });
  });

  group('the pages', () {
    testWidgets('hands out one page at a time and counts what is left', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_table(paged: true, initialPageSize: 2));

      expect(_names(tester), <String>['Banana', 'apple']);
      expect(find.text('Rows: 4'), findsOneWidget);
    });

    testWidgets('goes back to the first page when a search cuts the list short', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_table(paged: true, initialPageSize: 2, searchable: true));

      await tester.tap(find.bySemanticsLabel(RegExp('2')).last);
      await tester.pump();

      await tester.enterText(find.byType(EditableText), 'a');
      await tester.pump();

      expect(find.text('Rows: 3'), findsOneWidget);
      expect(_names(tester), <String>['Banana', 'apple']);
    });
  });

  group('choosing rows', () {
    testWidgets('does nothing until it is told it may', (WidgetTester tester) async {
      final List<List<Object>> held = <List<Object>>[];

      await tester.pumpWidget(
        _table(onSelectedChange: (List<Object> keys, List<_Row> rows) => held.add(keys)),
      );

      await tester.tap(find.text('Banana'));

      expect(held, isEmpty);
    });

    testWidgets('holds one row, tints it, and lets it go again', (WidgetTester tester) async {
      final List<List<Object>> held = <List<Object>>[];

      await tester.pumpWidget(
        _table(
          selectionMode: MPDataTableSelectionMode.single,
          onSelectedChange: (List<Object> keys, List<_Row> rows) => held.add(keys),
        ),
      );

      await tester.tap(find.text('Banana'));
      await tester.pump();
      await tester.tap(find.text('apple'));
      await tester.pump();
      await tester.tap(find.text('apple'));
      await tester.pump();

      expect(held, <List<Object>>[
        <Object>[1],
        <Object>[2],
        <Object>[],
      ]);
    });

    testWidgets('extends from the last press with Shift, in the order on screen', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> held = <List<Object>>[];

      await tester.pumpWidget(
        _table(
          selectionMode: MPDataTableSelectionMode.multiple,
          onSelectedChange: (List<Object> keys, List<_Row> rows) => held.add(keys),
        ),
      );

      await tester.tap(find.text('Banana'));
      await tester.pump();
      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.tap(find.text('Cherry'));
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pump();

      expect(held.last, <Object>[1, 2, 3]);
    });

    testWidgets('takes the page with the tick in the heading, and gives it back', (
      WidgetTester tester,
    ) async {
      final List<List<Object>> held = <List<Object>>[];

      await tester.pumpWidget(
        _table(
          selectionMode: MPDataTableSelectionMode.multiple,
          checkboxes: true,
          paged: true,
          initialPageSize: 2,
          onSelectedChange: (List<Object> keys, List<_Row> rows) => held.add(keys),
        ),
      );

      await tester.tap(find.byType(MPCheckbox).first);
      await tester.pump();
      expect(held.last, <Object>[1, 2]);
      expect(find.text('Selected: 2'), findsOneWidget);

      await tester.tap(find.byType(MPCheckbox).first);
      await tester.pump();
      expect(held.last, isEmpty);
    });

    testWidgets('hands back rows the search has hidden, because they are still chosen', (
      WidgetTester tester,
    ) async {
      final List<List<_Row>> rows = <List<_Row>>[];

      await tester.pumpWidget(
        _table(
          selectionMode: MPDataTableSelectionMode.multiple,
          searchable: true,
          onSelectedChange: (List<Object> keys, List<_Row> held) => rows.add(held),
        ),
      );

      await tester.tap(find.text('Banana'));
      await tester.pump();
      await tester.enterText(find.byType(EditableText), 'cherry');
      await tester.pump();
      await tester.tap(find.text('Cherry'));
      await tester.pump();

      expect(rows.last.map((_Row row) => row['name']), <String>['Banana', 'Cherry']);
    });

    testWidgets('gives the keyboard exactly one route into a row', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          width: 640,
          height: 600,
          afterFocusStop(
            before,
            MPDataTable<_Row>(
              headers: _columns,
              items: _rows,
              getRowKey: _key,
              selectionMode: MPDataTableSelectionMode.multiple,
              checkboxes: true,
            ),
          ),
        ),
      );

      before.requestFocus();
      await tester.pump();

      int stops = 0;

      for (int press = 0; press < 12; press += 1) {
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();

        if (identical(FocusManager.instance.primaryFocus, before)) {
          break;
        }

        stops += 1;
      }

      // The heading's tick and one tick per row; no row is a stop of its own.
      expect(stops, 1 + _rows.length);
    });
  });

  group('the widths', () {
    testWidgets('nudges a column with the arrow keys and puts it back with Home', (
      WidgetTester tester,
    ) async {
      final List<Map<String, double>> widths = <Map<String, double>>[];

      await tester.pumpWidget(_table(resizable: true, onColumnWidthsChange: widths.add));

      final Finder handle = find.bySemanticsLabel('Resize column').first;
      Focus.of(tester.element(handle)).requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(widths.last, <String, double>{'name': 168});

      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pump();
      expect(widths.last, <String, double>{'name': 136});

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(widths.last, isEmpty);
    });

    testWidgets('does not fix the columns unless there can be a drag', (WidgetTester tester) async {
      await tester.pumpWidget(_table());

      final Table table = tester.widget<Table>(find.byType(Table));

      expect(table.columnWidths![0], isA<IntrinsicColumnWidth>());

      await tester.pumpWidget(_table(resizable: true));

      expect(
        (tester.widget<Table>(find.byType(Table)).columnWidths![0]! as FixedColumnWidth).value,
        160,
      );
    });
  });

  group('the export', () {
    testWidgets('writes the rows the reader is looking at, not the page they are on', (
      WidgetTester tester,
    ) async {
      final List<String> files = <String>[];

      await tester.pumpWidget(
        _table(paged: true, initialPageSize: 2, exportable: true, onExport: files.add),
      );

      await tester.tap(find.text('Download CSV'));

      expect(files.single.startsWith('﻿'), isTrue);
      expect(files.single.split('\r\n'), hasLength(5));
      expect(files.single.split('\r\n').first, '﻿Name,Qty');
    });

    testWidgets('quotes a separator, doubles a quote, and defuses a formula', (
      WidgetTester tester,
    ) async {
      final List<String> files = <String>[];
      const List<_Row> tricky = <_Row>[
        <String, Object?>{'id': 1, 'name': 'a, b', 'qty': -5},
        <String, Object?>{'id': 2, 'name': 'say "hi"', 'qty': '+82 2 555 0100'},
        <String, Object?>{'id': 3, 'name': '=HYPERLINK("x")', 'qty': '@sum'},
      ];

      await tester.pumpWidget(_table(items: tricky, exportable: true, onExport: files.add));
      await tester.tap(find.text('Download CSV'));

      final List<String> lines = files.single.split('\r\n');

      expect(lines[1], '"a, b",-5');
      expect(lines[2], '"say ""hi""",+82 2 555 0100');
      expect(lines[3], '"\'=HYPERLINK(""x"")",\'@sum');

      files.clear();
      await tester.pumpWidget(
        KeyedSubtree(
          key: const Key('raw'),
          child: _table(
            items: tricky,
            exportable: true,
            exportEscapeFormulas: false,
            onExport: files.add,
          ),
        ),
      );
      await tester.tap(find.text('Download CSV'));

      expect(files.single.split('\r\n')[3], '"=HYPERLINK(""x"")",@sum');
    });

    testWidgets('takes what a column says to export rather than what it draws', (
      WidgetTester tester,
    ) async {
      final List<String> files = <String>[];

      await tester.pumpWidget(
        _table(
          exportable: true,
          onExport: files.add,
          headers: <MPDataTableColumn<_Row>>[
            MPDataTableColumn<_Row>(
              key: 'name',
              label: const Text('Name'),
              render: (_Row row, int index) => const SizedBox.shrink(),
              exportValue: (_Row row) => 'fruit:${row['name']}',
            ),
            const MPDataTableColumn<_Row>(key: 'qty', label: Text('Qty'), exportable: false),
          ],
        ),
      );
      await tester.tap(find.text('Download CSV'));

      expect(files.single.split('\r\n').take(2), <String>['﻿Name', 'fruit:Banana']);
    });
  });
}
