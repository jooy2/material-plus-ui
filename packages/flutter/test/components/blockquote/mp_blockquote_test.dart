import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:material_plus_ui/src/components/blockquote/mp_blockquote.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _sheetOf(WidgetTester tester) {
  return tester
          .widget<DecoratedBox>(
            find
                .descendant(of: find.byType(MPBlockquote), matching: find.byType(DecoratedBox))
                .first,
          )
          .decoration
      as BoxDecoration;
}

const Widget _words = Text('No pretensions whatever.');

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('attribution', () {
    testWidgets('puts the author after an em dash, under the quote', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(author: Text('Ada Lovelace'), child: _words)),
      );

      expect(find.text('— '), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('Ada Lovelace')).dy,
        greaterThan(tester.getBottomLeft(find.text('No pretensions whatever.')).dy),
      );
    });

    testWidgets('does not read the dash aloud', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(author: Text('Ada Lovelace'), child: _words)),
      );

      expect(semanticsLabels(tester).join(' '), isNot(contains('—')));
      semantics.dispose();
    });

    testWidgets('sets the source in the supporting role', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(source: Text('Notes'), child: _words)),
      );

      expect(styleOf(tester, 'Notes').color, light.onSurfaceVariant);
      expect(styleOf(tester, 'Notes').fontSize, 12);
    });
  });

  group('the mark', () {
    testWidgets('draws the house quotation mark by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPBlockquote(child: _words)));

      expect(find.byType(Opacity), findsOneWidget);
      expect(tester.widget<Opacity>(find.byType(Opacity)).opacity, MPStateOpacity.disabledContent);
    });

    testWidgets('takes it away when told to', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPBlockquote(icon: false, child: _words)));

      expect(find.byType(Opacity), findsNothing);
    });

    testWidgets('takes a mark of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPBlockquote(
            icon: SizedBox(key: Key('mark'), width: 8, height: 8),
            child: _words,
          ),
        ),
      );

      expect(find.byKey(const Key('mark')), findsOneWidget);
    });
  });

  group('the sheet', () {
    testWidgets('is a margin rule and nothing else by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPBlockquote(icon: false, child: _words)));

      final Rect box = tester.getRect(find.byType(MPBlockquote));
      final Rect words = tester.getRect(find.text('No pretensions whatever.'));

      expect(_sheetOf(tester).color, isNull);
      expect(_sheetOf(tester).boxShadow, isEmpty);
      expect(
        find.byType(MPBlockquote),
        paints..rect(rect: Rect.fromLTWH(0, 0, 2, box.height), color: light.primary),
      );
      expect(words.left - box.left, 18);
    });

    testWidgets('puts the rule on the right under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          textDirection: TextDirection.rtl,
          const MPBlockquote(icon: false, child: _words),
        ),
      );

      final Rect box = tester.getRect(find.byType(MPBlockquote));
      final Rect words = tester.getRect(find.text('No pretensions whatever.'));
      expect(box.right - words.right, 18);
    });

    testWidgets('keeps a painted quote’s ruled edge square', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(variant: MPVariant.tonal, child: _words)),
      );

      final BorderRadius radius = _sheetOf(tester).borderRadius! as BorderRadius;
      expect(radius.topLeft, Radius.zero);
      expect(radius.topRight, const Radius.circular(12));
      expect(_sheetOf(tester).color, light.primaryContainer);
    });

    testWidgets('leaves the sheet neutral on outlined', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(variant: MPVariant.outlined, child: _words)),
      );

      expect(_sheetOf(tester).color, isNull);
      expect(
        find.byType(MPBlockquote),
        paints
          ..rrect(color: light.outlineVariant)
          ..rect(color: light.primary),
      );
    });

    testWidgets('puts the accent family in the rule', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPBlockquote(color: MPColor.tertiary, child: _words)),
      );

      expect(find.byType(MPBlockquote), paints..rect(color: light.tertiary));
    });
  });

  group('the size ladder', () {
    testWidgets('sets the quote in title-large at md, and walks the roles', (
      WidgetTester tester,
    ) async {
      final List<double> sizes = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 400, MPBlockquote(size: size, child: _words)));
        sizes.add(styleOf(tester, 'No pretensions whatever.').fontSize!);
      }

      expect(sizes, <double>[14, 16, 22, 24, 28]);
    });
  });
}
