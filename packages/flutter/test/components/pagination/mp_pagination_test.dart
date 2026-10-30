import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/pagination/mp_pagination.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// A row whose parent holds the page.
class _Controlled extends StatefulWidget {
  const _Controlled({this.count = 20, this.initial = 1, this.showEdges = false});

  final int count;
  final int initial;
  final bool showEdges;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late int page = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPPagination(
      count: widget.count,
      page: page,
      showEdges: widget.showEdges,
      onChanged: (int next) => setState(() => page = next),
    );
  }
}

int _pageOf(WidgetTester tester) => tester.state<_ControlledState>(find.byType(_Controlled)).page;

/// What the row shows, in order: page numbers and `…` for a gap.
List<String> _slots(WidgetTester tester) {
  return tester
      .widgetList<Text>(find.descendant(of: find.byType(MPPagination), matching: find.byType(Text)))
      .map((Text text) => text.data!)
      .toList();
}

Finder _named(String name) => find.bySemanticsLabel(name);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('renders nothing at all for a single page', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPPagination(count: 1)));

    expect(find.byType(Text), findsNothing);
    expect(tester.getSize(find.byType(MPPagination)), Size.zero);
  });

  testWidgets('is a named region that says where the reader is', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const _Controlled(initial: 3)));

    final SemanticsData data = semanticsNodeLabelled(tester, 'Pagination')!.getSemanticsData();
    expect(data.value, 'Page 3 of 20');
    expect(data.flagsCollection.isLiveRegion, isTrue);
    semantics.dispose();
  });

  testWidgets('marks the page being read, and nothing else', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const _Controlled(initial: 3)));

    expect(
      tester.getSemantics(_named('Page 3')).getSemanticsData().flagsCollection.isSelected,
      Tristate.isTrue,
    );
    expect(
      tester.getSemantics(_named('Page 2')).getSemanticsData().flagsCollection.isSelected,
      Tristate.isFalse,
    );
    semantics.dispose();
  });

  testWidgets('moves when a page is pressed', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Controlled()));
    await tester.tap(find.text('3'));
    await tester.pump();

    expect(_pageOf(tester), 3);
  });

  testWidgets('leaves a controlled row where the caller put it', (WidgetTester tester) async {
    final List<int> changes = <int>[];

    await tester.pumpWidget(host(MPPagination(count: 10, page: 2, onChanged: changes.add)));
    await tester.tap(find.text('4'));
    await tester.pumpAndSettle();

    expect(changes, <int>[4]);
    expect(
      tester
          .widget<AnimatedContainer>(
            find.ancestor(of: find.text('2'), matching: find.byType(AnimatedContainer)).first,
          )
          .decoration,
      isA<BoxDecoration>().having((BoxDecoration d) => d.color, 'color', light.primary),
    );
  });

  testWidgets('steps by one page, and stops at the ends', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const _Controlled(count: 3)));

    await tester.tap(_named('Previous page'));
    await tester.pump();
    expect(_pageOf(tester), 1);

    await tester.tap(_named('Next page'));
    await tester.pump();
    await tester.tap(_named('Next page'));
    await tester.pump();
    await tester.tap(_named('Next page'));
    await tester.pump();
    expect(_pageOf(tester), 3);
    expect(
      tester.getSemantics(_named('Next page')).getSemanticsData().flagsCollection.isEnabled,
      Tristate.isFalse,
    );
    semantics.dispose();
  });

  testWidgets('jumps to an end with the edge steppers', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const _Controlled(showEdges: true)));
    await tester.tap(_named('Last page'));
    await tester.pump();
    expect(_pageOf(tester), 20);

    await tester.tap(_named('First page'));
    await tester.pump();
    expect(_pageOf(tester), 1);
    semantics.dispose();
  });

  testWidgets('presses from the keyboard', (WidgetTester tester) async {
    final FocusNode before = FocusNode();
    addTearDown(before.dispose);

    await tester.pumpWidget(host(afterFocusStop(before, const _Controlled(initial: 2))));
    before.requestFocus();
    await tester.pump();

    // Previous, then page 1.
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();

    expect(_pageOf(tester), 1);
  });

  testWidgets('keeps the number of slots constant as the window slides', (
    WidgetTester tester,
  ) async {
    final Set<int> lengths = <int>{};

    for (final int page in <int>[1, 2, 5, 10, 16, 19, 20]) {
      await tester.pumpWidget(host(MPPagination(count: 20, page: page)));
      lengths.add(_slots(tester).length);
    }

    expect(lengths, <int>{7});
  });

  testWidgets('folds the middle away and shows both ends', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPPagination(count: 20, page: 10)));

    expect(_slots(tester), <String>['1', '…', '9', '10', '11', '…', '20']);
  });

  testWidgets('fills a gap of exactly one page with that page', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPPagination(count: 20, page: 4)));

    expect(_slots(tester), <String>['1', '2', '3', '4', '5', '…', '20']);
  });

  testWidgets('widens the window when asked for more siblings', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPPagination(count: 20, page: 10, siblingCount: 2)));

    expect(_slots(tester), <String>['1', '…', '8', '9', '10', '11', '12', '…', '20']);
  });

  testWidgets('drops the ends when asked for no boundary', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPPagination(count: 20, page: 10, boundaryCount: 0)));

    expect(_slots(tester).first, '…');
    expect(_slots(tester), isNot(contains('1')));
    expect(_slots(tester), isNot(contains('20')));
  });

  testWidgets('says it in the language it was given', (WidgetTester tester) async {
    registerMPMessages(<MPLocale>[ko]);
    addTearDown(resetMPMessages);
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPPagination(count: 5, locale: 'ko')));

    expect(semanticsLabels(tester), isNot(contains('Next page')));
    semantics.dispose();
  });

  testWidgets('takes a caller’s word over the translation', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(const MPPagination(count: 5, labels: <String, String>{'next': 'Onward'})),
    );

    expect(_named('Onward'), findsOneWidget);
    semantics.dispose();
  });

  testWidgets('stops the whole row answering when disabled', (WidgetTester tester) async {
    final List<int> changes = <int>[];

    await tester.pumpWidget(host(MPPagination(count: 5, disabled: true, onChanged: changes.add)));
    await tester.tap(find.text('3'));

    expect(changes, isEmpty);
  });

  testWidgets('draws its cells at the control heights', (WidgetTester tester) async {
    final List<double> heights = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(host(MPPagination(count: 5, size: size)));
      heights.add(tester.getSize(find.byType(MPPagination)).height);
    }

    expect(heights, <double>[32, 40, 56, 64, 72]);
  });

  testWidgets('points the steppers the other way under right-to-left', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(textDirection: TextDirection.rtl, const MPPagination(count: 5, page: 3)),
    );

    expect(
      tester.getCenter(_named('Previous page')).dx,
      greaterThan(tester.getCenter(_named('Next page')).dx),
    );
    semantics.dispose();
  });
}
