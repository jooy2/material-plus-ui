import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/pill/mp_pill.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

BoxDecoration _surfaceOf(WidgetTester tester) {
  return tester
          .widget<AnimatedContainer>(
            find
                .descendant(of: find.byType(MPPill), matching: find.byType(AnimatedContainer))
                .first,
          )
          .decoration!
      as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('renders the headline and the line under it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPPill(title: Text('On a call'), description: Text('04:12'))),
      );

      expect(find.text('On a call'), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('04:12')).dy,
        greaterThan(tester.getTopLeft(find.text('On a call')).dy),
      );
    });

    testWidgets('renders both slots and whatever else the middle was given', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const MPPill(
            title: Text('Uploading'),
            startIcon: SizedBox(key: Key('start'), width: 8, height: 8),
            endIcon: SizedBox(key: Key('end'), width: 8, height: 8),
            child: Text('extra'),
          ),
        ),
      );

      expect(find.text('extra'), findsOneWidget);
      expect(
        tester.getCenter(find.byKey(const Key('start'))).dx,
        lessThan(tester.getCenter(find.text('Uploading')).dx),
      );
      expect(
        tester.getCenter(find.byKey(const Key('end'))).dx,
        greaterThan(tester.getCenter(find.text('Uploading')).dx),
      );
    });

    testWidgets('lines up with a button of the same size', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPPill(size: size, title: const Text('Pill'))));
        heights.add(tester.getSize(find.byType(MPPill)).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('paints the secondary accent and lifts itself by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPPill(title: Text('Pill'))));

      expect(_surfaceOf(tester).color, light.secondary);
      expect(_surfaceOf(tester).boxShadow, MPShadows.of(2));
    });
  });

  group('the corner', () {
    testWidgets('is a stadium while it is collapsed', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPPill(title: Text('Pill'))));

      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));
    });

    testWidgets('moves to extraLarge once it has grown', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPPill(title: Text('Pill'), expanded: true, details: Text('More'))),
      );

      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));

      await tester.pumpWidget(
        host(
          const MPPill(size: MPSize.xl, title: Text('Pill'), expanded: true, details: Text('More')),
        ),
      );
      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));

      await tester.pumpWidget(
        host(const MPPill(size: MPSize.xl, title: Text('Pill'), details: Text('More'))),
      );
      await tester.pumpAndSettle();
      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(36));
    });
  });

  group('details', () {
    testWidgets('are folded to nothing and out of reach while collapsed', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPPill(title: Text('Pill'), details: Text('More'))));

      expect(tester.getSize(find.byType(MPPill)).height, 56);
      expect(find.bySemanticsLabel('More'), findsNothing);
      semantics.dispose();
    });

    testWidgets('open to their own height', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPPill(title: Text('Pill'), details: Text('More'))));
      await tester.pumpWidget(
        host(const MPPill(title: Text('Pill'), expanded: true, details: Text('More'))),
      );
      await tester.pumpAndSettle();

      expect(tester.getSize(find.byType(MPPill)).height, greaterThan(56));
    });

    testWidgets('open at once when animations are off', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(disableAnimations: true, const MPPill(title: Text('Pill'), details: Text('More'))),
      );
      await tester.pumpWidget(
        host(
          disableAnimations: true,
          const MPPill(title: Text('Pill'), expanded: true, details: Text('More')),
        ),
      );
      await tester.pump();

      expect(tester.getSize(find.byType(MPPill)).height, greaterThan(56));
    });
  });

  group('pressable', () {
    testWidgets('is not a button until there is something to call', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPPill(title: Text('Pill'))));

      expect(tester.getSemantics(find.text('Pill')), isNot(matchesSemantics(isButton: true)));
      semantics.dispose();
    });

    testWidgets('makes the middle a button, by pointer and by keyboard', (
      WidgetTester tester,
    ) async {
      int presses = 0;
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPPill(focusNode: focus, title: const Text('Pill'), onPressed: () => presses++)),
      );

      await tester.tap(find.text('Pill'));
      expect(presses, 1);

      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(presses, 2);
    });

    testWidgets('says whether the details are showing', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPPill(title: const Text('Pill'), details: const Text('More'), onPressed: () {})),
      );

      expect(
        tester.getSemantics(find.text('Pill')),
        matchesSemantics(
          label: 'Pill',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasExpandedState: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('keeps endIcon outside the button', (WidgetTester tester) async {
      int presses = 0;

      await tester.pumpWidget(
        host(
          MPPill(
            title: const Text('Pill'),
            endIcon: const SizedBox(key: Key('end'), width: 24, height: 24),
            onPressed: () => presses++,
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('end')), warnIfMissed: false);
      expect(presses, 0);
    });
  });
}
