import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/progress_circular/mp_progress_circular.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads the SVG's dash attributes; this reads the arcs the
/// painter asks the canvas for, which are the same two numbers: where the arc
/// starts and how far round it goes.

final Finder _ring = find.byType(MPProgressCircular);

/// Records every arc a painter draws.
class _ArcCanvas implements Canvas {
  final List<({double start, double sweep, Paint paint})> arcs =
      <({double start, double sweep, Paint paint})>[];

  @override
  void drawArc(Rect rect, double startAngle, double sweepAngle, bool useCenter, Paint paint) {
    arcs.add((start: startAngle, sweep: sweepAngle, paint: paint));
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

CustomPaint _painted(WidgetTester tester) {
  return tester.widget<CustomPaint>(
    find.descendant(of: _ring, matching: find.byType(CustomPaint)).first,
  );
}

/// The arcs the ring draws: the groove first, then the indicator if any.
List<({double start, double sweep, Paint paint})> _arcs(WidgetTester tester) {
  final CustomPaint paint = _painted(tester);
  final _ArcCanvas canvas = _ArcCanvas();

  paint.painter!.paint(canvas, paint.size);

  return canvas.arcs;
}

SemanticsData _node(WidgetTester tester) => semanticsOf(tester, _ring).getSemanticsData();

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a progress bar with the value on it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPProgressCircular(value: 25)));

      expect(_node(tester).role, SemanticsRole.progressBar);
      expect(_node(tester).value, '25%');
      semantics.dispose();
    });

    testWidgets('names itself with the label it was given', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPProgressCircular(value: 25, label: Text('Syncing'))));

      expect(_node(tester).label, 'Syncing');
      semantics.dispose();
    });

    testWidgets('draws a neutral groove and an arc in the family', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 25, color: MPColor.tertiary)));

      final List<({double start, double sweep, Paint paint})> arcs = _arcs(tester);

      expect(arcs.first.paint.color, isSameColorAs(light.onSurface.withValues(alpha: 0.12)));
      expect(arcs.last.paint.color, isSameColorAs(light.tertiary));
      expect(arcs.last.paint.strokeCap, StrokeCap.round);
    });
  });

  group('the arc', () {
    testWidgets('closes the gap as the value rises', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 25)));

      expect(_arcs(tester).last.sweep, closeTo(math.pi / 2, 1e-9));

      await tester.pumpWidget(host(const MPProgressCircular(value: 80)));
      await tester.pumpAndSettle();

      expect(_arcs(tester).last.sweep, closeTo(math.pi * 2 * 0.8, 1e-9));
    });

    testWidgets('travels to a new value rather than jumping', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 20)));
      await tester.pumpWidget(host(const MPProgressCircular(value: 80)));
      await tester.pump(const Duration(milliseconds: 50));

      final double sweep = _arcs(tester).last.sweep;

      expect(sweep, greaterThan(math.pi * 2 * 0.2));
      expect(sweep, lessThan(math.pi * 2 * 0.8));
    });

    testWidgets('starts at twelve o’clock rather than at three', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 25)));

      expect(_arcs(tester).last.start, closeTo(-math.pi / 2, 1e-9));
    });
  });

  group('the indeterminate case', () {
    testWidgets('is the default, carries no value, and turns', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPProgressCircular()));
      await tester.pump(const Duration(milliseconds: 200));

      expect(_node(tester).role, SemanticsRole.loadingSpinner);
      expect(_node(tester).value, isEmpty);

      final double before = _arcs(tester).last.start;

      await tester.pump(const Duration(milliseconds: 200));

      expect(_arcs(tester).last.start, isNot(before));
      semantics.dispose();
    });

    testWidgets('breathes: the arc grows and shrinks across the cycle', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPProgressCircular()));
      await tester.pump(const Duration(milliseconds: 10));

      final double resting = _arcs(tester).last.sweep;

      await tester.pump(const Duration(milliseconds: 690));

      expect(_arcs(tester).last.sweep, greaterThan(resting * 10));
    });

    testWidgets('holds still once a value arrives', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPProgressCircular()));
      await tester.pumpWidget(host(const MPProgressCircular(value: 50)));
      await tester.pumpAndSettle();

      expect(_arcs(tester).last.sweep, closeTo(math.pi, 1e-9));
      expect(tester.binding.hasScheduledFrame, isFalse);
    });

    testWidgets('rests on a quarter of the circle when animations are off', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(disableAnimations: true, const MPProgressCircular()));

      expect(_arcs(tester).last.sweep, closeTo(math.pi / 2, 1e-9));
      expect(_arcs(tester).last.start, closeTo(-math.pi / 2, 1e-9));
      expect(tester.binding.hasScheduledFrame, isFalse);
    });
  });

  group('the value as text', () {
    testWidgets('is a percentage of the range rather than the raw number', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 1, max: 4, showValue: true)));

      expect(find.text('25%'), findsOneWidget);
    });

    testWidgets('sits beside the ring, after it in the reading direction', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          textDirection: TextDirection.rtl,
          const MPProgressCircular(value: 25, label: Text('Syncing')),
        ),
      );

      expect(
        tester.getCenter(find.text('Syncing')).dx,
        lessThan(tester.getCenter(find.byType(CustomPaint).first).dx),
      );
    });
  });

  group('the size ladder', () {
    testWidgets('grows monotonically: 24, 32, 48, 56, 64', (WidgetTester tester) async {
      final List<double> diameters = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPProgressCircular(value: 50, size: size)));
        diameters.add(_painted(tester).size.width);
      }

      expect(diameters, <double>[24, 32, 48, 56, 64]);
      expect(
        diameters.map((double diameter) => ringDiameter.containsValue(diameter)),
        everyElement(isTrue),
      );
    });

    testWidgets('draws md at the specification’s own 48dp with a 4dp stroke', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPProgressCircular(value: 50)));

      expect(_painted(tester).size, const Size.square(48));
      expect(_arcs(tester).first.paint.strokeWidth, 4);
    });
  });

  group('hideLabel', () {
    testWidgets('keeps the name for a screen reader and takes it off the screen', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPProgressCircular(value: 63, label: Text('Uploading'), hideLabel: true)),
      );

      expect(_node(tester).label, 'Uploading');
      semantics.dispose();
    });

    testWidgets('costs the row no room and no gap', (WidgetTester tester) async {
      Future<double> widthOf(Widget ring) async {
        await tester.pumpWidget(host(ring));

        return tester.getSize(_ring).width;
      }

      final double drawn = await widthOf(
        const MPProgressCircular(value: 63, label: Text('Uploading')),
      );
      final double hidden = await widthOf(
        const MPProgressCircular(value: 63, label: Text('Uploading'), hideLabel: true),
      );
      final double bare = await widthOf(const MPProgressCircular(value: 63));

      expect(hidden, bare);
      expect(drawn, greaterThan(hidden));
    });
  });
}
