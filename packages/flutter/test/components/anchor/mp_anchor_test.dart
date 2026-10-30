import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/anchor/mp_anchor.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions, asked of a scroll view rather than a document.
///
/// A browser test reads `aria-current` off a link; here the marked row is the
/// one whose semantics node says it is selected, and the one whose words are
/// drawn in the accent.

final MPColorScheme _light = MPColorScheme.fromSource();

/// Three headings, each with 600px of content under it, so a scroll of 600
/// lands the next one at the top of a 400-tall view.
class _Page {
  _Page({this.lead = 0});

  final double lead;
  final ScrollController scroll = ScrollController();
  final GlobalKey install = GlobalKey(debugLabel: 'install');
  final GlobalKey usage = GlobalKey(debugLabel: 'usage');
  final GlobalKey options = GlobalKey(debugLabel: 'options');

  List<MPAnchorItem> get items => <MPAnchorItem>[
    MPAnchorItem(target: install, label: const Text('Install')),
    MPAnchorItem(target: usage, label: const Text('Usage')),
    MPAnchorItem(target: options, label: const Text('Options'), depth: 1),
  ];

  Widget build(
    Widget anchor, {
    TextDirection textDirection = TextDirection.ltr,
    bool attachController = true,
  }) {
    return host(
      width: 600,
      height: 400,
      textDirection: textDirection,
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(width: 160, child: anchor),
          Expanded(
            child: SingleChildScrollView(
              controller: attachController ? scroll : null,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  SizedBox(height: lead),
                  for (final GlobalKey key in <GlobalKey>[install, usage, options])
                    SizedBox(key: key, height: 600, child: Text(key.toString())),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void dispose() => scroll.dispose();
}

/// The words of the row that is marked, or `null` when none is: the row whose
/// node says it is selected, which is where the React build says
/// `aria-current="location"`.
String? _marked(WidgetTester tester) {
  for (final String label in <String>['Install', 'Usage', 'Options']) {
    final Semantics row = tester
        .widgetList<Semantics>(
          find.ancestor(of: find.text(label), matching: find.byType(Semantics)),
        )
        .firstWhere((Semantics node) => node.properties.link ?? false);

    if (row.properties.selected ?? false) {
      return label;
    }
  }

  return null;
}

Future<void> _scrollTo(WidgetTester tester, ScrollController scroll, double to) async {
  scroll.jumpTo(to);
  await tester.pump();
  await tester.pump();
}

void main() {
  group('the list', () {
    testWidgets('is a named list of links', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));

      expect(find.bySemanticsLabel('On this page'), findsOneWidget);
      expect(
        semanticsNodeLabelled(tester, 'Install')!.getSemanticsData().flagsCollection.isLink,
        isTrue,
      );
      expect(find.text('Usage'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('takes the caller’s name for the list', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, semanticLabel: 'Sections')));

      expect(find.bySemanticsLabel('Sections'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('sets a deeper heading in without nesting the list', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));

      final double install = tester.getTopLeft(find.text('Install')).dx;
      final double options = tester.getTopLeft(find.text('Options')).dx;

      expect(options - install, 12);
    });

    testWidgets('sets the indent from the end under RTL', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(
        page.build(MPAnchor(items: page.items), textDirection: TextDirection.rtl),
      );

      final double install = tester.getTopRight(find.text('Install')).dx;
      final double options = tester.getTopRight(find.text('Options')).dx;

      expect(install - options, 12);
    });

    testWidgets('draws the rail unless it is turned off', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      Iterable<ColoredBox> rails() => tester
          .widgetList<ColoredBox>(
            find.descendant(of: find.byType(MPAnchor), matching: find.byType(ColoredBox)),
          )
          .where((ColoredBox box) => box.color == _light.outlineVariant);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      expect(rails(), hasLength(1));

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, rail: false)));
      expect(rails(), isEmpty);
    });

    testWidgets('tightens the rows with density and leaves the type alone', (
      WidgetTester tester,
    ) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, size: MPSize.lg)));
      final double loose = tester.getSize(find.byType(MPAnchor)).height;
      final double type = styleOf(tester, 'Install').fontSize!;

      await tester.pumpWidget(
        page.build(MPAnchor(items: page.items, size: MPSize.lg, density: -2)),
      );

      expect(tester.getSize(find.byType(MPAnchor)).height, lessThan(loose));
      expect(styleOf(tester, 'Install').fontSize, type);
    });
  });

  group('tracking', () {
    testWidgets('marks nothing until the first heading has been reached', (
      WidgetTester tester,
    ) async {
      final _Page page = _Page(lead: 300);
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();

      expect(_marked(tester), isNull);
    });

    testWidgets('marks the row the reader is in, in the accent', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();

      expect(_marked(tester), 'Install');
      await tester.pumpAndSettle();
      expect(styleOf(tester, 'Install').color, _light.primary);
      expect(styleOf(tester, 'Usage').color, _light.onSurfaceVariant);
    });

    testWidgets('follows the scroll down the page and back', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();
      expect(_marked(tester), 'Install');

      await _scrollTo(tester, page.scroll, 600);
      expect(_marked(tester), 'Usage');

      await _scrollTo(tester, page.scroll, 100);
      expect(_marked(tester), 'Install');
    });

    testWidgets('reports every change to the caller', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);
      final List<GlobalKey?> changes = <GlobalKey?>[];

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, onActiveChange: changes.add)));
      await tester.pump();
      await _scrollTo(tester, page.scroll, 600);

      expect(changes, <GlobalKey>[page.install, page.usage]);
    });

    testWidgets('marks the last heading once the page has run out', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();
      await _scrollTo(tester, page.scroll, page.scroll.position.maxScrollExtent);

      expect(_marked(tester), 'Options');
    });

    testWidgets('counts a heading as reached `offset` below the top', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, offset: 64)));
      await tester.pump();
      await _scrollTo(tester, page.scroll, 540);

      expect(_marked(tester), 'Usage');
    });

    testWidgets('stops watching the scroll once it is told what is active', (
      WidgetTester tester,
    ) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, activeTarget: page.options)));
      await tester.pump();
      await _scrollTo(tester, page.scroll, 600);

      expect(_marked(tester), 'Options');
    });

    testWidgets('watches the controller it is given', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, controller: page.scroll)));
      await tester.pump();
      await _scrollTo(tester, page.scroll, 600);

      expect(_marked(tester), 'Usage');
    });

    testWidgets('finds the scroll view on its own', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items), attachController: false));
      await tester.pump();

      final ScrollableState scrollable = tester.state<ScrollableState>(
        find.byType(Scrollable).last,
      );
      scrollable.position.jumpTo(600);
      await tester.pump();
      await tester.pump();

      expect(_marked(tester), 'Usage');
    });
  });

  group('pressing a row', () {
    testWidgets('scrolls the heading to the top', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();
      await tester.tap(find.text('Usage'));
      await tester.pump();
      await tester.pump();

      expect(page.scroll.offset, 600);
      expect(_marked(tester), 'Usage');
    });

    testWidgets('lands the heading `offset` below the top', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items, offset: 40)));
      await tester.pump();
      await tester.tap(find.text('Usage'));
      await tester.pump();

      expect(page.scroll.offset, 560);
    });

    testWidgets('goes from the keyboard too', (WidgetTester tester) async {
      final _Page page = _Page();
      addTearDown(page.dispose);

      await tester.pumpWidget(page.build(MPAnchor(items: page.items)));
      await tester.pump();

      Focus.of(tester.element(find.text('Usage'))).requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(page.scroll.offset, 600);
    });
  });
}
