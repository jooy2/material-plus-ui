import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/timeline/mp_timeline.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The bullet of the step whose title is [title].
BoxDecoration _bulletOf(WidgetTester tester, int index) {
  return tester
          .widgetList<AnimatedContainer>(
            find.descendant(of: find.byType(MPTimeline), matching: find.byType(AnimatedContainer)),
          )
          .elementAt(index)
          .decoration!
      as BoxDecoration;
}

Widget _four({int? active, MPOrientation orientation = MPOrientation.vertical}) {
  return MPTimeline(
    active: active,
    orientation: orientation,
    children: const <MPTimelineItem>[
      MPTimelineItem(title: Text('Ordered'), bullet: Text('1')),
      MPTimelineItem(title: Text('Packed'), bullet: Text('2')),
      MPTimelineItem(title: Text('In transit'), bullet: Text('3')),
      MPTimelineItem(title: Text('Delivered'), bullet: Text('4')),
    ],
  );
}

int _connectors(WidgetTester tester) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: find.byType(MPTimeline), matching: find.byType(CustomPaint)),
      )
      .where((CustomPaint paint) => paint.painter != null)
      .length;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the sequence', () {
    testWidgets('runs down by default and across when horizontal', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, _four()));
      expect(
        tester.getTopLeft(find.text('Packed')).dy,
        greaterThan(tester.getTopLeft(find.text('Ordered')).dy),
      );

      await tester.pumpWidget(host(width: 480, _four(orientation: MPOrientation.horizontal)));
      expect(
        tester.getTopLeft(find.text('Packed')).dx,
        greaterThan(tester.getTopLeft(find.text('Ordered')).dx),
      );
      expect(tester.getTopLeft(find.text('Packed')).dy, tester.getTopLeft(find.text('Ordered')).dy);
    });

    testWidgets('leaves everything upcoming when active is not given', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, _four()));

      for (int index = 0; index < 4; index += 1) {
        expect((_bulletOf(tester, index).border! as Border).top.color, light.outline);
      }
    });

    testWidgets('splits the sequence into done, now and to come', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, _four(active: 2)));
      await tester.pumpAndSettle();

      expect(_bulletOf(tester, 0).color, light.primary);
      expect(_bulletOf(tester, 1).color, light.primary);
      expect(_bulletOf(tester, 2).color, light.primary);
      expect(_bulletOf(tester, 2).boxShadow!.single.color, light.primaryContainer);
      expect(_bulletOf(tester, 3).border, isNotNull);

      expect(styleOf(tester, 'Ordered').color, light.onSurface);
      expect(styleOf(tester, 'In transit').color, light.primary);
      expect(styleOf(tester, 'Delivered').color, light.onSurfaceVariant);
    });

    testWidgets('marks the whole sequence done at the item count', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, _four(active: 4)));
      await tester.pumpAndSettle();

      for (int index = 0; index < 4; index += 1) {
        expect(_bulletOf(tester, index).boxShadow, isEmpty);
        expect(_bulletOf(tester, index).color, light.primary);
      }
    });

    testWidgets('announces the current step', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 480, _four(active: 1)));

      expect(
        tester.getSemantics(find.text('Packed')).getSemanticsData().flagsCollection.isSelected,
        Tristate.isTrue,
      );
      expect(
        tester.getSemantics(find.text('Ordered')).getSemanticsData().flagsCollection.isSelected,
        isNot(Tristate.isTrue),
      );
      semantics.dispose();
    });

    testWidgets('eases the bullet to its new state, and jumps under reduced motion', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 480, _four(active: 0)));
      await tester.pumpAndSettle();
      await tester.pumpWidget(host(width: 480, _four(active: 2)));
      await tester.pump(const Duration(milliseconds: 50));

      final Color? midway = _bulletOf(tester, 1).color;

      // An `AnimatedContainer` keeps its target in the widget and eases the
      // painted one; the widget already says where it is going.
      expect(midway, light.primary);
      expect(
        tester.widget<AnimatedContainer>(find.byType(AnimatedContainer).at(1)).duration,
        const Duration(milliseconds: 200),
      );

      await tester.pumpWidget(host(width: 480, disableAnimations: true, _four(active: 2)));
      expect(
        tester.widget<AnimatedContainer>(find.byType(AnimatedContainer).at(1)).duration,
        Duration.zero,
      );
    });
  });

  group('one step', () {
    testWidgets('overrides its computed status', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPTimeline(
            active: 0,
            children: <MPTimelineItem>[
              MPTimelineItem(title: Text('One'), status: MPTimelineStatus.complete),
              MPTimelineItem(title: Text('Two')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_bulletOf(tester, 0).boxShadow, isEmpty);
      expect(_bulletOf(tester, 0).color, light.primary);
    });

    testWidgets('draws no connector after the last step, and none on none', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 480, _four()));
      expect(_connectors(tester), 3);

      await tester.pumpWidget(
        host(
          width: 480,
          const MPTimeline(
            children: <MPTimelineItem>[
              MPTimelineItem(title: Text('One'), connector: MPTimelineConnector.none),
              MPTimelineItem(title: Text('Two')),
            ],
          ),
        ),
      );
      expect(_connectors(tester), 0);
    });

    testWidgets('colours the line out of a finished step in the accent', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 480, _four(active: 1)));
      await tester.pumpAndSettle();

      final List<dynamic> painters = tester
          .widgetList<CustomPaint>(
            find.descendant(of: find.byType(MPTimeline), matching: find.byType(CustomPaint)),
          )
          .where((CustomPaint paint) => paint.painter != null)
          .map((CustomPaint paint) => paint.painter)
          .toList();

      expect(painters.first.color, light.primary);
      expect(painters.last.color, light.outlineVariant);
    });

    testWidgets('shows a title, a time, a body and what goes in the bullet', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPTimeline(
            children: <MPTimelineItem>[
              MPTimelineItem(
                title: Text('Ordered'),
                meta: Text('9 Aug'),
                bullet: Text('1'),
                child: Text('Payment authorised.'),
              ),
            ],
          ),
        ),
      );

      expect(find.text('9 Aug'), findsOneWidget);
      expect(find.text('Payment authorised.'), findsOneWidget);
      expect(styleOf(tester, '1').fontSize, 10);
      expect(
        tester.getTopLeft(find.text('Payment authorised.')).dy,
        greaterThan(tester.getTopLeft(find.text('Ordered')).dy),
      );
    });

    testWidgets('overrides the accent family for one step', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPTimeline(
            active: 2,
            children: <MPTimelineItem>[
              MPTimelineItem(title: Text('One'), color: MPColor.error),
              MPTimelineItem(title: Text('Two')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(_bulletOf(tester, 0).color, light.error);
      expect(_bulletOf(tester, 1).color, light.primary);
    });

    testWidgets('renders on its own, outside a timeline', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, const MPTimelineItem(title: Text('Alone'))));

      expect(find.text('Alone'), findsOneWidget);
    });

    testWidgets('puts the bullet on the start side under right-to-left text', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 480, textDirection: TextDirection.rtl, _four()));

      expect(
        tester.getCenter(find.text('1')).dx,
        greaterThan(tester.getCenter(find.text('Ordered')).dx),
      );
    });

    testWidgets('grows its bullet with the size', (WidgetTester tester) async {
      final List<double> sizes = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(
            width: 480,
            MPTimeline(
              size: size,
              children: const <MPTimelineItem>[MPTimelineItem(title: Text('One'))],
            ),
          ),
        );
        sizes.add(tester.getSize(find.byType(AnimatedContainer)).width);
      }

      expect(sizes, <double>[14, 16, 20, 24, 30]);
    });
  });
}
