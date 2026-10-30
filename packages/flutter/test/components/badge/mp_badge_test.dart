import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/badge/mp_badge.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The marker's own box: the one decorated container inside the badge.
Finder _marker() {
  return find.descendant(of: find.byType(MPBadge), matching: find.byType(Container)).first;
}

BoxDecoration _markerPaint(WidgetTester tester) {
  return tester.widget<Container>(_marker()).decoration! as BoxDecoration;
}

double _opacityOf(WidgetTester tester) {
  return tester
      .widget<AnimatedOpacity>(
        find.descendant(of: find.byType(MPBadge), matching: find.byType(AnimatedOpacity)),
      )
      .opacity;
}

const Widget _anchor = SizedBox(key: Key('anchor'), width: 40, height: 40);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('content', () {
    testWidgets('shows a count', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3)));

      expect(find.text('3'), findsOneWidget);
    });

    testWidgets('caps a number past max', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 120)));

      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('takes a max of its own', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 12, max: 9)));

      expect(find.text('9+'), findsOneWidget);
    });

    testWidgets('leaves a word alone', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 'NEW', max: 1)));

      expect(find.text('NEW'), findsOneWidget);
    });

    testWidgets('hides itself at zero', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 0)));
      await tester.pumpAndSettle();

      expect(find.text('0'), findsNothing);
      expect(_opacityOf(tester), 0);
    });

    testWidgets('shows a zero when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 0, showZero: true)));

      expect(find.text('0'), findsOneWidget);
      expect(_opacityOf(tester), 1);
    });
  });

  group('the size ladder', () {
    testWidgets('is its own: 12, 14, 16, 20, 24', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPBadge(content: 3, size: size)));
        heights.add(tester.getSize(_marker()).height);
      }

      expect(heights, <double>[12, 14, 16, 20, 24]);
    });

    testWidgets('draws MD3’s 6px dot at md', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(dot: true)));

      expect(tester.getSize(_marker()), const Size(6, 6));
    });

    testWidgets('is a stadium at every size', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3)));

      expect(_markerPaint(tester).borderRadius, BorderRadius.circular(8));
    });
  });

  group('the dot', () {
    testWidgets('keeps the count for a screen reader', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPBadge(content: 5, dot: true)));

      expect(find.text('5'), findsNothing);
      expect(find.bySemanticsLabel('5'), findsOneWidget);
      semantics.dispose();
    });
  });

  group('invisible', () {
    testWidgets('keeps its box so nothing moves when it comes back', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3)));
      final Size shown = tester.getSize(_marker());

      await tester.pumpWidget(host(const MPBadge(content: 3, invisible: true)));
      await tester.pumpAndSettle();

      expect(tester.getSize(_marker()), shown);
      expect(_opacityOf(tester), 0);
    });

    testWidgets('says nothing while it is away', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPBadge(content: 3, invisible: true)));

      expect(semanticsLabels(tester), isEmpty);
      semantics.dispose();
    });

    testWidgets('grows in rather than appearing', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3, invisible: true)));
      await tester.pumpWidget(host(const MPBadge(content: 3)));
      await tester.pump(const Duration(milliseconds: 50));

      expect(_opacityOf(tester), 1);
      final double scale = tester
          .widget<AnimatedScale>(
            find.descendant(of: find.byType(MPBadge), matching: find.byType(AnimatedScale)),
          )
          .scale;
      expect(scale, 1);
    });
  });

  group('label', () {
    testWidgets('reads the sentence instead of the number', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPBadge(content: 3, label: '3 unread messages')));

      expect(find.text('3'), findsOneWidget);
      expect(semanticsLabels(tester), <String>['3 unread messages']);
      semantics.dispose();
    });
  });

  group('anchoring', () {
    testWidgets('is exactly as big as what it wraps', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3, child: _anchor)));

      expect(tester.getSize(find.byType(MPBadge)), const Size(40, 40));
    });

    testWidgets('pins itself half out of the top end corner', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3, child: _anchor)));

      final Rect anchor = tester.getRect(find.byKey(const Key('anchor')));
      final Rect marker = tester.getRect(_marker());

      expect(marker.top, anchor.top - 8);
      expect(marker.right, anchor.right + 8);
    });

    testWidgets('moves to the corner asked for', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPBadge(content: 3, placement: MPCorner.bottomStart, child: _anchor)),
      );

      final Rect anchor = tester.getRect(find.byKey(const Key('anchor')));
      final Rect marker = tester.getRect(_marker());

      expect(marker.bottom, anchor.bottom + 8);
      expect(marker.left, anchor.left - 8);
    });

    testWidgets('flips the end corner under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, const MPBadge(content: 3, child: _anchor)),
      );

      final Rect anchor = tester.getRect(find.byKey(const Key('anchor')));

      expect(tester.getRect(_marker()).left, anchor.left - 8);
    });

    testWidgets('tucks further in over a round anchor', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3, child: _anchor)));
      final double square = tester.getRect(_marker()).top;

      await tester.pumpWidget(
        host(const MPBadge(content: 3, overlap: MPBadgeOverlap.circle, child: _anchor)),
      );

      expect(tester.getRect(_marker()).top, greaterThan(square));
    });
  });

  group('colour', () {
    testWidgets('is the error family, which is Material’s badge', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPBadge(content: 3)));

      expect(_markerPaint(tester).color, light.error);
      expect(styleOf(tester, '3').color, light.onError);
    });

    testWidgets('takes another family when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPBadge(content: 'NEW', variant: MPVariant.tonal, color: MPColor.primary)),
      );

      expect(_markerPaint(tester).color, light.primaryContainer);
    });
  });
}
