import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/skeleton/mp_skeleton.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads `h-4`, `w-full` and `rounded-mp-md` off the element;
/// this measures the box and reads the decoration it was painted with.

final Finder _skeleton = find.byType(MPSkeleton);

/// Every bar the skeleton painted: one for a single shape, one per line for a
/// stack.
List<Container> _bars(WidgetTester tester) {
  return tester
      .widgetList<Container>(find.descendant(of: _skeleton, matching: find.byType(Container)))
      .toList();
}

BoxDecoration _decoration(WidgetTester tester) => _bars(tester).first.decoration! as BoxDecoration;

Size _barSize(WidgetTester tester, [int index = 0]) {
  return tester.getSize(find.descendant(of: _skeleton, matching: find.byType(Container)).at(index));
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('shape', () {
    testWidgets('is a run of text by default: the full width, 16 tall', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton()));

      expect(_barSize(tester), const Size(300, 16));
      expect(_decoration(tester).borderRadius, BorderRadius.circular(4));
    });

    testWidgets('draws a block with a medium corner', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(shape: MPSkeletonShape.rect)));

      expect(_barSize(tester), const Size(300, 80));
      expect(_decoration(tester).borderRadius, BorderRadius.circular(12));
    });

    testWidgets('draws a circle the size of a control at the same rung', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPSkeleton(shape: MPSkeletonShape.circle)));

      expect(_barSize(tester), const Size(56, 56));
      expect(_decoration(tester).borderRadius, BorderRadius.circular(28));
    });

    testWidgets('drops the default block height once one is given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPSkeleton(shape: MPSkeletonShape.rect, height: 300)),
      );

      expect(_barSize(tester).height, 300);
    });

    testWidgets('sizes a line off the type scale: 12, 14, 16, 16, 22', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 300, MPSkeleton(size: size)));
        heights.add(_barSize(tester).height);
      }

      expect(heights, <double>[12, 14, 16, 16, 22]);
    });
  });

  group('lines', () {
    testWidgets('stacks bars rather than striping one box', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(lines: 3)));

      expect(_bars(tester), hasLength(3));
      // The gaps are real gaps: 16 tall bars with 8 between them.
      expect(tester.getSize(_skeleton).height, 16 * 3 + 8 * 2);
    });

    testWidgets('draws the last line short, the way a paragraph ends', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(lines: 3)));

      expect(_barSize(tester).width, 300);
      expect(_barSize(tester, 2).width, closeTo(180, 0.001));
    });

    testWidgets('stays one bar at a count of one', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton()));

      expect(_bars(tester), hasLength(1));
      expect(_barSize(tester).width, 300);
    });
  });

  group('colour', () {
    testWidgets('is an empty container unless a family is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton()));

      expect(_decoration(tester).color, light.surfaceContainerHighest);
    });

    testWidgets('takes the family’s container tone when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(color: MPColor.tertiary)));

      expect(_decoration(tester).color, light.tertiaryContainer);
    });

    testWidgets('is flat: no shadow and no edge', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(shape: MPSkeletonShape.rect)));

      expect(_decoration(tester).boxShadow, isNull);
      expect(_decoration(tester).border, isNull);
    });
  });

  group('animated', () {
    testWidgets('pulses by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton()));
      await tester.pump(const Duration(milliseconds: 1000));

      final FadeTransition fade = tester.widget<FadeTransition>(
        find.descendant(of: _skeleton, matching: find.byType(FadeTransition)),
      );

      expect(fade.opacity.value, closeTo(0.5, 0.01));
    });

    testWidgets('breathes every bar of a stack in step', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(lines: 3)));
      await tester.pump(const Duration(milliseconds: 700));

      final Set<double> opacities = tester
          .widgetList<FadeTransition>(
            find.descendant(of: _skeleton, matching: find.byType(FadeTransition)),
          )
          .map((FadeTransition fade) => fade.opacity.value)
          .toSet();

      expect(opacities, hasLength(1));
    });

    testWidgets('goes still when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(animated: false)));

      expect(find.byType(FadeTransition), findsNothing);
      expect(tester.binding.hasScheduledFrame, isFalse);
    });

    testWidgets('goes still when animations are off, at the same size', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, disableAnimations: true, const MPSkeleton()));

      expect(find.byType(FadeTransition), findsNothing);
      expect(tester.binding.hasScheduledFrame, isFalse);
      expect(_barSize(tester), const Size(300, 16));
    });
  });

  group('label', () {
    testWidgets('is scenery with nothing to say by default', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPSkeleton()));

      // No node of its own: nothing between the root and the next widget up
      // says anything.
      expect(
        find.semantics.byPredicate((SemanticsNode node) {
          return node.getSemanticsData().role == SemanticsRole.status;
        }),
        findsNothing,
      );
      semantics.dispose();
    });

    testWidgets('reports the wait when it is the one that speaks for the region', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPSkeleton(label: 'Loading results')));

      final SemanticsData node = semanticsOf(tester, _skeleton).getSemanticsData();

      expect(node.role, SemanticsRole.status);
      expect(node.label, 'Loading results');
      semantics.dispose();
    });
  });

  group('sizing', () {
    testWidgets('takes a width in logical pixels', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(width: 240)));

      expect(_barSize(tester).width, 240);
    });

    testWidgets('takes a share of the width from a FractionallySizedBox', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const FractionallySizedBox(
            widthFactor: 0.5,
            alignment: AlignmentDirectional.centerStart,
            child: MPSkeleton(),
          ),
        ),
      );

      expect(_barSize(tester).width, 150);
    });

    testWidgets('leaves a stack of lines to the type scale rather than squeezing it', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, const MPSkeleton(lines: 3, height: 20)));

      expect(_bars(tester), hasLength(3));
      expect(tester.getSize(_skeleton).height, greaterThan(20));
    });

    testWidgets('still takes a height on a single shape', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPSkeleton(shape: MPSkeletonShape.rect, height: 120)),
      );

      expect(_barSize(tester).height, 120);
    });
  });
}
