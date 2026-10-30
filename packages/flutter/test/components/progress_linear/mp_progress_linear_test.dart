import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/progress_linear/mp_progress_linear.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/progress.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions, asked of the render tree: `aria-valuenow`
/// becomes the semantics node's value and range, and a class on the sweeping
/// bars becomes the keys this widget puts on them.

final Finder _bar = find.byType(MPProgressLinear);

/// The groove: the clipped box the indicator is drawn in.
Size _groove(WidgetTester tester) {
  return tester.getSize(find.descendant(of: _bar, matching: find.byType(ClipRRect)).first);
}

/// How far across the groove the fill reaches, as a share.
double _filled(WidgetTester tester) {
  final double fill = tester
      .getSize(find.descendant(of: _bar, matching: find.byType(AnimatedFractionallySizedBox)))
      .width;

  return fill / _groove(tester).width;
}

SemanticsData _node(WidgetTester tester) => semanticsOf(tester, _bar).getSemanticsData();

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is a progress bar with the value and the range on it', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPProgressLinear(value: 3, max: 4)));

      final SemanticsData node = _node(tester);

      expect(node.role, SemanticsRole.progressBar);
      expect(node.value, '75%');
      expect(node.minValue, '0');
      expect(node.maxValue, '4');
      semantics.dispose();
    });

    testWidgets('names itself with the label it was given', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 300, const MPProgressLinear(value: 40, label: Text('Uploading'))),
      );

      expect(_node(tester).label, 'Uploading');
      expect(_node(tester).value, '40%');
      semantics.dispose();
    });

    testWidgets('fills in the family’s accent over a neutral groove', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPProgressLinear(value: 40, color: MPColor.error)),
      );

      final Container groove = tester.widget<Container>(
        find.descendant(of: _bar, matching: find.byType(Container)).first,
      );
      final DecoratedBox fill = tester.widget<DecoratedBox>(
        find.descendant(
          of: find.byType(AnimatedFractionallySizedBox),
          matching: find.byType(DecoratedBox),
        ),
      );

      expect(groove.color, light.onSurface.withValues(alpha: 0.12));
      expect((fill.decoration as BoxDecoration).color, light.error);
    });

    testWidgets('fills the groove to the share of the range', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear(value: 30)));

      expect(_filled(tester), closeTo(0.3, 0.001));
    });

    testWidgets('fills from the start under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, textDirection: TextDirection.rtl, const MPProgressLinear(value: 30)),
      );

      final Rect groove = tester.getRect(
        find.descendant(of: _bar, matching: find.byType(ClipRRect)).first,
      );
      final Rect fill = tester.getRect(find.byType(AnimatedFractionallySizedBox));

      expect(fill.right, groove.right);
    });
  });

  group('the indeterminate case', () {
    testWidgets('is the default, and carries no value at all', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPProgressLinear()));

      expect(_node(tester).role, SemanticsRole.loadingSpinner);
      expect(_node(tester).value, isEmpty);
      semantics.dispose();
    });

    testWidgets('draws two sweeping bars rather than a fill', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear()));
      await tester.pump(const Duration(milliseconds: 1100));

      expect(find.byKey(const ValueKey<String>('lead')), findsOneWidget);
      expect(find.byKey(const ValueKey<String>('trail')), findsOneWidget);
      expect(find.byType(AnimatedFractionallySizedBox), findsNothing);
    });

    testWidgets('sweeps: the bars are somewhere else a moment later', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear()));
      await tester.pump(const Duration(milliseconds: 300));

      final Rect before = tester.getRect(find.byKey(const ValueKey<String>('lead')));

      await tester.pump(const Duration(milliseconds: 300));

      expect(tester.getRect(find.byKey(const ValueKey<String>('lead'))), isNot(before));
    });

    testWidgets('goes back to a fill once a value arrives', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear()));
      await tester.pumpWidget(host(width: 300, const MPProgressLinear(value: 40)));

      expect(find.byKey(const ValueKey<String>('lead')), findsNothing);
      // The loop has stopped: nothing asks for a frame once this one is drawn.
      await tester.pump();
      expect(tester.binding.hasScheduledFrame, isFalse);
    });

    testWidgets('treats an empty range as having nothing to say', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear(value: 5, min: 10, max: 10)));

      expect(find.byKey(const ValueKey<String>('lead')), findsOneWidget);
    });

    testWidgets('holds still on a partial bar when animations are off', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, disableAnimations: true, const MPProgressLinear()));

      expect(find.byKey(const ValueKey<String>('trail')), findsNothing);
      expect(tester.getSize(find.byKey(const ValueKey<String>('lead'))).width, closeTo(105, 0.5));
      expect(tester.binding.hasScheduledFrame, isFalse);
    });
  });

  group('the value as text', () {
    testWidgets('is a percentage of the range rather than the raw number', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 300, const MPProgressLinear(value: 3, max: 4, showValue: true)),
      );

      expect(find.text('75%'), findsOneWidget);
    });

    testWidgets('hands the writing over once the caller says what the number means', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 300,
          MPProgressLinear(
            value: 1024,
            max: 4096,
            showValue: true,
            formatValue: (double value) => '${value.round()} MB',
          ),
        ),
      );

      expect(find.text('1024 MB'), findsOneWidget);
      // Said as the value, and not claimed as a progress bar's: the framework
      // takes only a number or a percentage there.
      expect(_node(tester).value, '1024 MB');
      semantics.dispose();
    });

    testWidgets('shows nothing while the value is unknown', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPProgressLinear(showValue: true)));

      expect(find.byType(Text), findsNothing);
    });

    testWidgets('is drawn, not read a second time', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 300,
          const MPProgressLinear(value: 40, label: Text('Uploading'), showValue: true),
        ),
      );

      expect(_node(tester).label, 'Uploading');
      expect(_node(tester).value, '40%');
      semantics.dispose();
    });
  });

  group('the arithmetic', () {
    testWidgets('clamps a value past the end of the range', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPProgressLinear(value: 140, showValue: true)),
      );

      expect(find.text('100%'), findsOneWidget);
      expect(_filled(tester), 1);
    });
  });

  group('the size ladder', () {
    testWidgets('thickens monotonically: 2, 3, 4, 6, 8', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 300, MPProgressLinear(value: 40, size: size)));
        heights.add(_groove(tester).height);
      }

      expect(heights, <double>[2, 3, 4, 6, 8]);
    });

    testWidgets('fills the width it is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 240, const MPProgressLinear(value: 40)));

      expect(_groove(tester).width, 240);
    });
  });

  group('hideLabel', () {
    testWidgets('keeps the name for a screen reader and takes it off the screen', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 300,
          const MPProgressLinear(value: 63, label: Text('Uploading'), hideLabel: true),
        ),
      );

      expect(_node(tester).label, 'Uploading');
      expect(tester.getSize(find.byType(ProgressHiddenLabel)).height, 0);
      semantics.dispose();
    });

    testWidgets('costs the stack no line and no gap', (WidgetTester tester) async {
      Future<double> heightOf(Widget bar) async {
        await tester.pumpWidget(host(width: 300, bar));

        return tester.getSize(_bar).height;
      }

      final double drawn = await heightOf(
        const MPProgressLinear(value: 63, label: Text('Uploading')),
      );
      final double hidden = await heightOf(
        const MPProgressLinear(value: 63, label: Text('Uploading'), hideLabel: true),
      );
      final double bare = await heightOf(const MPProgressLinear(value: 63));

      expect(hidden, bare);
      expect(drawn, greaterThan(hidden));
    });
  });
}
