import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/highlight/mp_highlight.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The words that were marked, in order.
List<String> _marks(WidgetTester tester) {
  return tester
      .widgetList<Text>(find.descendant(of: find.byType(CustomPaint), matching: find.byType(Text)))
      .map((Text text) => text.data!)
      .toList();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('matching', () {
    testWidgets('marks every match and keeps the text around it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat and a cat', query: 'cat')));

      expect(_marks(tester), <String>['cat', 'cat']);
      expect(find.textContaining('A ', findRichText: true), findsOneWidget);
    });

    testWidgets('leaves the text alone when the query is empty', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat', query: '  ')));

      expect(_marks(tester), isEmpty);
      expect(find.text('A cat'), findsOneWidget);
    });

    testWidgets('tries the longest term first', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPHighlight('A database', query: <String>['data', 'database'])),
      );

      expect(_marks(tester), <String>['database']);
    });

    testWidgets('ignores case by default, and respects it when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat, a Cat', query: 'cat')));
      expect(_marks(tester), <String>['cat', 'Cat']);

      await tester.pumpWidget(
        host(const MPHighlight('A cat, a Cat', query: 'cat', caseSensitive: true)),
      );
      expect(_marks(tester), <String>['cat']);
    });

    testWidgets('requires a whole word only when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('cat concatenate', query: 'cat')));
      expect(_marks(tester), <String>['cat', 'cat']);

      await tester.pumpWidget(
        host(const MPHighlight('cat concatenate', query: 'cat', wholeWord: true)),
      );
      expect(_marks(tester), <String>['cat']);
    });

    testWidgets('escapes a term, so its punctuation is literal', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('a.b axb', query: 'a.b')));

      expect(_marks(tester), <String>['a.b']);
    });

    testWidgets('takes a regular expression as written', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPHighlight(
            'Released 2026-08-10, superseded 2026-09-01.',
            query: RegExp(r'\d{4}-\d{2}-\d{2}'),
          ),
        ),
      );

      expect(_marks(tester), <String>['2026-08-10', '2026-09-01']);
    });

    testWidgets('marks again when the query changes', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('red and blue', query: 'red')));
      expect(_marks(tester), <String>['red']);

      await tester.pumpWidget(host(const MPHighlight('red and blue', query: 'blue')));
      expect(_marks(tester), <String>['blue']);
    });
  });

  group('the mark', () {
    testWidgets('paints the tertiary container tone by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat', query: 'cat')));

      expect(styleOf(tester, 'cat').color, light.onTertiaryContainer);
    });

    testWidgets('reads the family it is given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPHighlight(
            'A cat',
            query: 'cat',
            variant: MPHighlightVariant.filled,
            color: MPColor.primary,
          ),
        ),
      );

      expect(styleOf(tester, 'cat').color, light.onPrimary);
    });

    testWidgets('recolours the word and nothing else for text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPHighlight('A cat', query: 'cat', variant: MPHighlightVariant.text)),
      );

      expect(styleOf(tester, 'cat').color, light.tertiary);
    });

    testWidgets('underlines only when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat', query: 'cat')));
      expect(styleOf(tester, 'cat').decoration, isNot(TextDecoration.underline));

      await tester.pumpWidget(host(const MPHighlight('A cat', query: 'cat', underline: true)));
      expect(styleOf(tester, 'cat').decoration, TextDecoration.underline);
    });

    testWidgets('does not move the text around it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPHighlight('A cat', query: 'cat')));
      final double marked = tester.getSize(find.byType(MPHighlight)).width;

      await tester.pumpWidget(host(const MPHighlight('A cat', query: '')));

      expect(tester.getSize(find.byType(MPHighlight)).width, closeTo(marked, 0.5));
    });

    testWidgets('reads the whole sentence once', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPHighlight('A cat sat', query: 'cat')));

      expect(find.bySemanticsLabel('A cat sat'), findsOneWidget);
      semantics.dispose();
    });
  });
}
