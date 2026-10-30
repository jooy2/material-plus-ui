import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/progress_box/mp_progress_box.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite counts the track's `<span>`s and reads each one's inner
/// width; this counts the segment boxes and reads each one's fill.

final Finder _row = find.byType(MPProgressBox);

/// The segments, in order: the square boxes of the track.
List<Size> _segments(WidgetTester tester) {
  return tester
      .widgetList<SizedBox>(find.descendant(of: _row, matching: find.byType(SizedBox)))
      .where((SizedBox box) => box.width != null && box.width == box.height && box.width! > 0)
      .map((SizedBox box) => Size(box.width!, box.height!))
      .toList();
}

/// How full each segment is drawn, as a share.
List<double> _fills(WidgetTester tester) {
  return tester
      .widgetList<AnimatedFractionallySizedBox>(
        find.descendant(of: _row, matching: find.byType(AnimatedFractionallySizedBox)),
      )
      .map((AnimatedFractionallySizedBox box) => box.widthFactor!)
      .toList();
}

/// The opacity each segment is lit at, in order.
List<double> _lights(WidgetTester tester) {
  return tester
      .widgetList<Opacity>(find.descendant(of: _row, matching: find.byType(Opacity)))
      .map((Opacity opacity) => opacity.opacity)
      .toList();
}

SemanticsData _node(WidgetTester tester) => semanticsOf(tester, _row).getSemanticsData();

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a progress bar', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPProgressBox(value: 50)));

      expect(_node(tester).role, SemanticsRole.progressBar);
      expect(_node(tester).value, '50%');
      semantics.dispose();
    });

    testWidgets('draws four segments by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 50)));

      expect(_segments(tester), hasLength(4));
    });

    testWidgets('draws as many segments as it was asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 50, count: 6)));

      expect(_segments(tester), hasLength(6));
    });

    testWidgets('lands on one segment rather than none', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 50, count: 0)));

      expect(_segments(tester), hasLength(1));
    });

    testWidgets('cuts each segment’s corner off the shape scale', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 50)));

      final ClipRRect clip = tester.widget<ClipRRect>(
        find.descendant(of: _row, matching: find.byType(ClipRRect)).first,
      );

      expect(clip.borderRadius, BorderRadius.circular(4));
    });
  });

  group('a value across the row', () {
    testWidgets('fills the leading segment partially rather than rounding it away', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 30)));

      final List<double> fills = _fills(tester);

      expect(fills[0], 1);
      expect(fills[1], closeTo(0.2, 1e-9));
      expect(fills.sublist(2), <double>[0, 0]);
    });

    testWidgets('fills every segment at the end of the range', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 100)));

      expect(_fills(tester), <double>[1, 1, 1, 1]);
    });

    testWidgets('fills nothing at the start of it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 0)));

      expect(_fills(tester), <double>[0, 0, 0, 0]);
    });

    testWidgets('fills from the start under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, const MPProgressBox(value: 30)),
      );

      final List<Rect> segments = tester
          .widgetList<ClipRRect>(find.descendant(of: _row, matching: find.byType(ClipRRect)))
          .map((ClipRRect clip) => tester.getRect(find.byWidget(clip)))
          .toList();

      // The first segment, the full one, is the rightmost.
      expect(segments.first.left, greaterThan(segments.last.left));
    });
  });

  group('the indeterminate case', () {
    testWidgets('is the default, carries no value, and lights in the accent', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPProgressBox()));

      expect(_node(tester).role, SemanticsRole.loadingSpinner);
      expect(_node(tester).value, isEmpty);
      expect(_fills(tester), isEmpty);

      final Iterable<Color?> fills = tester
          .widgetList<DecoratedBox>(find.descendant(of: _row, matching: find.byType(DecoratedBox)))
          .map((DecoratedBox box) => (box.decoration as BoxDecoration).color);

      expect(fills.toSet(), <Color>{light.primary});
      semantics.dispose();
    });

    testWidgets('holds each segment back by its own index', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(count: 3)));
      await tester.pump(const Duration(milliseconds: 300));

      final List<double> lights = _lights(tester);

      expect(lights, hasLength(3));
      expect(lights.toSet(), hasLength(3));
      // A wave: the leading segment is brightest as it peaks.
      expect(lights[0], greaterThan(lights[1]));
      expect(lights[1], greaterThan(lights[2]));
    });

    testWidgets('stops cycling once a value arrives', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox()));
      await tester.pumpWidget(host(const MPProgressBox(value: 50)));
      await tester.pumpAndSettle();

      expect(_lights(tester), isEmpty);
      expect(tester.binding.hasScheduledFrame, isFalse);
    });

    testWidgets('holds still at a steady light when animations are off', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(disableAnimations: true, const MPProgressBox()));

      expect(_lights(tester), <double>[0.6, 0.6, 0.6, 0.6]);
      expect(tester.binding.hasScheduledFrame, isFalse);
    });
  });

  group('the value as text', () {
    testWidgets('reads as a percentage of the range', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressBox(value: 3, max: 4, showValue: true)));

      expect(find.text('75%'), findsOneWidget);
    });

    testWidgets('sits beside the label when there is one', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPProgressBox(value: 50, label: Text('Deploying'), showValue: true)),
      );

      final Offset label = tester.getCenter(find.text('Deploying'));
      final Offset value = tester.getCenter(find.text('50%'));

      expect(value.dy, closeTo(label.dy, 1));
      expect(value.dx, greaterThan(label.dx));
    });

    testWidgets('keeps a hidden label for a screen reader', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPProgressBox(value: 50, label: Text('Deploying'), hideLabel: true)),
      );

      expect(_node(tester).label, 'Deploying');
      semantics.dispose();
    });
  });

  group('the size ladder', () {
    testWidgets('grows monotonically: 8, 10, 12, 16, 20', (WidgetTester tester) async {
      final List<double> sides = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPProgressBox(value: 50, size: size)));
        sides.add(_segments(tester).first.width);
      }

      expect(sides, <double>[8, 10, 12, 16, 20]);
    });
  });
}
