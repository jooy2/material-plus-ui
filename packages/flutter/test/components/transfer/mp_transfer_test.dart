import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/checkbox/mp_checkbox.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/transfer/mp_transfer.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/select_list.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPTransfer`, asked of the render tree.

const List<MPTransferItem> _items = <MPTransferItem>[
  MPTransferItem(value: 'name', label: Text('Name')),
  MPTransferItem(value: 'email', label: Text('Email')),
  MPTransferItem(value: 'role', label: Text('Role')),
  MPTransferItem(value: 'joined', label: Text('Joined'), disabled: true),
];

/// The checkbox a row's label belongs to.
Finder _box(String label) {
  return find.ancestor(of: find.text(label), matching: find.byType(MPCheckbox)).first;
}

MPCheckbox _checkbox(WidgetTester tester, String label) => tester.widget<MPCheckbox>(_box(label));

Finder _arrow(String label) {
  return find.byWidgetPredicate((Widget widget) => widget is MPIconButton && widget.label == label);
}

/// The labels a panel lists, in order, by the panel's heading.
List<String> _rows(WidgetTester tester, {required bool target}) {
  final Finder lists = find.byType(SingleChildScrollView);
  final Finder list = target ? lists.last : lists.first;

  return tester
      .widgetList<MPCheckbox>(find.descendant(of: list, matching: find.byType(MPCheckbox)))
      .map((MPCheckbox box) => (box.label! as Text).data!)
      .toList();
}

/// A screen tall enough for both panels stacked, as a phone held upright
/// scrolls to them.
void _tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1000, 1400);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

Widget _wide(Widget child) {
  return Builder(
    builder: (BuildContext context) => MediaQuery(
      data: MediaQuery.of(context).copyWith(size: const Size(1000, 800)),
      child: child,
    ),
  );
}

void main() {
  group('the two lists', () {
    testWidgets('draw everything not chosen on one side and everything chosen on the other', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(
        host(const MPTransfer(items: _items, initialValue: <String>['email']), width: 400),
      );

      expect(_rows(tester, target: false), <String>['Name', 'Role', 'Joined']);
      expect(_rows(tester, target: true), <String>['Email']);
    });

    testWidgets('name each list, and say it in the language they were told to', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(find.text('Available'), findsOneWidget);
      expect(find.text('Selected'), findsOneWidget);

      await tester.pumpWidget(
        host(
          const MPTransfer(
            items: _items,
            labels: <String, String>{'source': 'Everything', 'target': 'Chosen'},
          ),
          width: 400,
        ),
      );

      expect(find.text('Everything'), findsOneWidget);
      expect(find.text('Chosen'), findsOneWidget);
    });

    testWidgets('take headings of their own', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(
        host(
          const MPTransfer(
            items: _items,
            sourceLabel: Text('All columns'),
            targetLabel: Text('In the report'),
          ),
          width: 400,
        ),
      );

      expect(find.text('All columns'), findsOneWidget);
      expect(find.text('In the report'), findsOneWidget);
    });

    testWidgets('say so when a list has nothing in it', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(find.text('Nothing here'), findsOneWidget);
    });
  });

  group('ticking is not choosing', () {
    testWidgets('reports nothing when a row is ticked', (WidgetTester tester) async {
      _tall(tester);
      final List<List<String>> reported = <List<String>>[];

      await tester.pumpWidget(host(MPTransfer(items: _items, onChanged: reported.add), width: 400));
      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(_checkbox(tester, 'Name').checked, isTrue);
      expect(reported, isEmpty);
    });

    testWidgets('reports on the arrow, in the order items gave', (WidgetTester tester) async {
      _tall(tester);
      final List<List<String>> reported = <List<String>>[];

      await tester.pumpWidget(
        host(
          MPTransfer(items: _items, initialValue: const <String>['role'], onChanged: reported.add),
          width: 400,
        ),
      );
      await tester.tap(find.text('Name'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(reported, <List<String>>[
        <String>['name', 'role'],
      ]);
    });

    testWidgets('brings a row back, and lands it where it started', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(
        host(const MPTransfer(items: _items, initialValue: <String>['email']), width: 400),
      );
      await tester.tap(find.text('Email'));
      await tester.pump();
      await tester.tap(_arrow('Move to available'));
      await tester.pumpAndSettle();

      expect(_rows(tester, target: false), <String>['Name', 'Email', 'Role', 'Joined']);
    });

    testWidgets('drops the ticks on what moved', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));
      await tester.tap(find.text('Name'));
      await tester.tap(find.text('Email'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(_checkbox(tester, 'Name').checked, isFalse);
      expect(_checkbox(tester, 'Email').checked, isFalse);
    });

    testWidgets('settles the rows that crossed, and only those', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(
        host(const MPTransfer(items: _items, initialValue: <String>['joined']), width: 400),
      );

      expect(
        tester
            .widgetList<MPArrivingRow>(find.byType(MPArrivingRow))
            .where((MPArrivingRow row) => row.arriving),
        isEmpty,
      );

      await tester.tap(find.text('Name'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pump();

      final List<MPArrivingRow> arriving = tester
          .widgetList<MPArrivingRow>(find.byType(MPArrivingRow))
          .where((MPArrivingRow row) => row.arriving)
          .toList();

      expect(arriving, hasLength(1));
      expect(arriving.single.key, const ValueKey<String>('name'));

      await tester.pumpAndSettle();
    });
  });

  group('the arrows', () {
    testWidgets('are dead until something on their own side is ticked', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(
        host(const MPTransfer(items: _items, initialValue: <String>['email']), width: 400),
      );

      expect(tester.widget<MPIconButton>(_arrow('Move to selected')).disabled, isTrue);
      expect(tester.widget<MPIconButton>(_arrow('Move to available')).disabled, isTrue);

      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(tester.widget<MPIconButton>(_arrow('Move to selected')).disabled, isFalse);
      expect(tester.widget<MPIconButton>(_arrow('Move to available')).disabled, isTrue);
    });

    testWidgets('leave a row that cannot move where it is', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(_checkbox(tester, 'Joined').disabled, isTrue);
    });

    testWidgets('stand beside the panels from the medium window up', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(_wide(const MPTransfer(items: _items)), width: 900));

      final double source = tester.getCenter(find.text('Available')).dx;
      final double arrows = tester.getCenter(_arrow('Move to selected')).dx;
      final double target = tester.getCenter(find.text('Selected')).dx;

      expect(source, lessThan(arrows));
      expect(arrows, lessThan(target));
    });
  });

  group('the heading strip', () {
    testWidgets('takes the whole column, skipping the rows that cannot move', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));
      await tester.tap(find.text('Available'));
      await tester.pump();

      expect(_checkbox(tester, 'Name').checked, isTrue);
      expect(_checkbox(tester, 'Role').checked, isTrue);
      expect(_checkbox(tester, 'Joined').checked, isFalse);
      expect(_checkbox(tester, 'Available').checked, isTrue);
    });

    testWidgets('counts what is ticked against what is on that side', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(find.text('0/4'), findsOneWidget);

      await tester.tap(find.text('Name'));
      await tester.pump();

      expect(find.text('1/4'), findsOneWidget);
      expect(_checkbox(tester, 'Available').indeterminate, isTrue);
    });
  });

  group('searchable', () {
    testWidgets('draws no filter unless it is asked for', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(find.byType(EditableText), findsNothing);
    });

    testWidgets('narrows one list without touching the other', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(
        host(
          const MPTransfer(items: _items, searchable: true, initialValue: <String>['email']),
          width: 400,
        ),
      );
      await tester.enterText(find.byType(EditableText).first, 'ro');
      await tester.pump();

      expect(_rows(tester, target: false), <String>['Role']);
      expect(_rows(tester, target: true), <String>['Email']);
    });

    testWidgets('moves only what the filter is still showing', (WidgetTester tester) async {
      _tall(tester);
      final List<List<String>> reported = <List<String>>[];

      await tester.pumpWidget(
        host(MPTransfer(items: _items, searchable: true, onChanged: reported.add), width: 400),
      );
      await tester.tap(find.text('Name'));
      await tester.tap(find.text('Role'));
      await tester.pump();
      await tester.enterText(find.byType(EditableText).first, 'ro');
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(reported.single, <String>['role']);
    });
  });

  group('controlled', () {
    testWidgets('shows the value it was given and nothing else', (WidgetTester tester) async {
      _tall(tester);
      await tester.pumpWidget(
        host(
          MPTransfer(
            items: _items,
            value: const <String>['name'],
            onChanged: (List<String> next) {},
          ),
          width: 400,
        ),
      );
      await tester.tap(find.text('Email'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(_rows(tester, target: true), <String>['Name']);
    });
  });

  testWidgets('stops everything at once when it is disabled', (WidgetTester tester) async {
    _tall(tester);
    await tester.pumpWidget(
      host(const MPTransfer(items: _items, disabled: true, searchable: true), width: 400),
    );

    expect(_checkbox(tester, 'Name').disabled, isTrue);
    expect(_checkbox(tester, 'Available').disabled, isTrue);
    expect(tester.widget<MPIconButton>(_arrow('Move to selected')).disabled, isTrue);
  });

  group('when the list underneath changes', () {
    testWidgets('drops the ticks of rows that are no longer in the list', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));
      await tester.tap(find.text('Name'));
      await tester.pump();

      await tester.pumpWidget(
        host(
          const MPTransfer(
            items: <MPTransferItem>[MPTransferItem(value: 'role', label: Text('Role'))],
          ),
          width: 400,
        ),
      );
      await tester.pumpWidget(host(const MPTransfer(items: _items), width: 400));

      expect(_checkbox(tester, 'Name').checked, isFalse);
    });
  });

  group('saying what the press did', () {
    testWidgets('says nothing before anything has moved, then how many crossed and where', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTransfer(items: _items, targetLabel: Text('In the report')), width: 400),
      );

      expect(semanticsLabels(tester).where((String label) => label.startsWith('Moved')), isEmpty);

      await tester.tap(find.text('Name'));
      await tester.tap(find.text('Email'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(semanticsNodeLabelled(tester, 'Moved to In the report: 2'), isNotNull);

      handle.dispose();
    });

    testWidgets('falls back to the locale when the heading has no words', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPTransfer(items: _items, targetLabel: SizedBox(width: 10, height: 10)),
          width: 400,
        ),
      );
      await tester.tap(find.text('Name'));
      await tester.pump();
      await tester.tap(_arrow('Move to selected'));
      await tester.pumpAndSettle();

      expect(semanticsNodeLabelled(tester, 'Moved to Selected: 1'), isNotNull);

      handle.dispose();
    });
  });

  group('telling the two lists apart', () {
    testWidgets('makes each list a group named after its own heading', (WidgetTester tester) async {
      _tall(tester);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPTransfer(
            items: _items,
            sourceLabel: Text('Everyone'),
            targetLabel: Text('On the channel'),
          ),
          width: 400,
        ),
      );

      expect(semanticsNodeLabelled(tester, 'Everyone'), isNotNull);
      expect(semanticsNodeLabelled(tester, 'On the channel'), isNotNull);
      expect(
        semanticsNodeLabelled(tester, 'Name')!.getSemanticsData().flagsCollection.isChecked,
        isNot(Tristate.none),
      );

      handle.dispose();
    });

    testWidgets('names the groups in the locale when the caller named nothing', (
      WidgetTester tester,
    ) async {
      _tall(tester);
      await tester.pumpWidget(
        host(
          const MPLocaleProvider(
            locale: 'en',
            child: MPTransfer(items: _items),
          ),
          width: 400,
        ),
      );

      expect(find.text('Available'), findsOneWidget);
    });
  });
}
