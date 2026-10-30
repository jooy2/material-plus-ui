import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/stepper/mp_stepper.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about the rail and the panel.
///
/// A browser test counts `<button>`s and reads `aria-disabled`; here a step
/// that can be driven is a button node, and whether it answers is its enabled
/// flag and whether a tap reaches the handler.

final MPColorScheme _light = MPColorScheme.fromSource();

Widget _three({
  int? active,
  int initialActive = 0,
  ValueChanged<int>? onActiveChange,
  bool linear = true,
  MPOrientation orientation = MPOrientation.horizontal,
  MPSize? size,
  MPColor? color,
}) {
  return MPStepper(
    active: active,
    initialActive: initialActive,
    onActiveChange: onActiveChange,
    linear: linear,
    orientation: orientation,
    size: size,
    color: color,
    children: const <Widget>[
      MPStep(label: Text('Account'), child: Text('Account panel')),
      MPStep(label: Text('Payment'), child: Text('Payment panel')),
      MPStep(label: Text('Done'), child: Text('Done panel')),
    ],
  );
}

/// A stepper driven by its own Next, as an app drives one.
class _Driven extends StatefulWidget {
  const _Driven();

  @override
  State<_Driven> createState() => _DrivenState();
}

class _DrivenState extends State<_Driven> {
  int step = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        _three(active: step, onActiveChange: (int next) => setState(() => step = next)),
        GestureDetector(onTap: () => setState(() => step = step + 1), child: const Text('next')),
        Text('active $step'),
      ],
    );
  }
}

SemanticsData? _stepData(WidgetTester tester, String label) {
  return semanticsNodeLabelled(tester, label)?.getSemanticsData();
}

Color? _bulletFill(WidgetTester tester, int index) {
  final Finder step = find.byType(MPStep).at(index);
  final AnimatedContainer bullet = tester.widget<AnimatedContainer>(
    find.descendant(of: step, matching: find.byType(AnimatedContainer)).first,
  );

  return (bullet.decoration! as BoxDecoration).color;
}

void main() {
  group('the rail', () {
    testWidgets('numbers the steps as it walks them', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three()));

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
    });

    testWidgets('marks the active step as the one selected', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 600, _three(active: 1)));

      expect(_stepData(tester, 'Payment')!.flagsCollection.isSelected, Tristate.isTrue);
      expect(_stepData(tester, 'Account')!.flagsCollection.isSelected, isNot(Tristate.isTrue));
      semantics.dispose();
    });

    testWidgets('draws a tick on a completed step instead of its number', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 600, _three(active: 1)));

      expect(find.text('1'), findsNothing);
      expect(
        find.byWidgetPredicate(
          (Widget widget) => widget is MPGlyph && widget.shape == MPGlyphShape.check,
        ),
        findsOneWidget,
      );
    });

    testWidgets('draws no connector after the last step', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three()));

      expect(
        find.descendant(of: find.byType(MPStep).at(0), matching: find.byType(Positioned)),
        findsOneWidget,
      );
      expect(
        find.descendant(of: find.byType(MPStep).at(2), matching: find.byType(Positioned)),
        findsNothing,
      );
    });

    testWidgets('fills the reached bullets and rings the rest', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three(active: 1)));
      await tester.pumpAndSettle();

      expect(_bulletFill(tester, 0), _light.primary);
      expect(_bulletFill(tester, 1), _light.primary);
      expect(_bulletFill(tester, 2), const Color(0x00000000));
    });

    testWidgets('lays the steps across, or down when vertical', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three()));
      expect(
        tester.getTopLeft(find.text('Done')).dx,
        greaterThan(tester.getTopLeft(find.text('Account')).dx),
      );

      await tester.pumpWidget(host(width: 600, _three(orientation: MPOrientation.vertical)));
      expect(
        tester.getTopLeft(find.text('Done')).dy,
        greaterThan(tester.getTopLeft(find.text('Account')).dy),
      );
    });

    testWidgets('runs from the end under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, textDirection: TextDirection.rtl, _three()));

      expect(
        tester.getTopLeft(find.text('Account')).dx,
        greaterThan(tester.getTopLeft(find.text('Done')).dx),
      );
    });

    testWidgets('grows its bullet with the size ladder', (WidgetTester tester) async {
      final List<double> bullets = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 900, _three(size: size)));
        bullets.add(
          tester
              .getSize(
                find
                    .descendant(
                      of: find.byType(MPStep).first,
                      matching: find.byType(AnimatedContainer),
                    )
                    .first,
              )
              .width,
        );
      }

      expect(bullets, <double>[14, 16, 20, 24, 30]);
    });
  });

  group('the panel', () {
    testWidgets('draws only the active step', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three(active: 1)));

      expect(find.text('Payment panel'), findsOneWidget);
      expect(find.text('Account panel'), findsNothing);
      expect(find.text('Done panel'), findsNothing);
    });

    testWidgets('follows the active step', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three(active: 0)));
      await tester.pumpWidget(host(width: 600, _three(active: 2)));

      expect(find.text('Done panel'), findsOneWidget);
      expect(find.text('Account panel'), findsNothing);
    });

    testWidgets('is named after the step that is open', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 600, _three(active: 1)));

      final List<String> labels = semanticsLabels(tester);
      expect(labels.where((String label) => label == 'Payment'), hasLength(2));
      semantics.dispose();
    });

    testWidgets('says a driven step opens a panel, and promises none without one', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 600, _three(active: 0, onActiveChange: (_) {})));
      expect(_stepData(tester, 'Account')!.flagsCollection.isExpanded, Tristate.isTrue);

      await tester.pumpWidget(
        host(
          width: 600,
          MPStepper(
            active: 0,
            onActiveChange: (_) {},
            children: const <Widget>[
              MPStep(label: Text('One')),
              MPStep(label: Text('Two')),
            ],
          ),
        ),
      );
      expect(_stepData(tester, 'One')!.flagsCollection.isExpanded, Tristate.none);
      semantics.dispose();
    });
  });

  group('pressing', () {
    testWidgets('does not make the steps pressable without a handler', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 600, _three(active: 1)));

      expect(_stepData(tester, 'Account')!.flagsCollection.isButton, isFalse);
      await tester.tap(find.text('Account'));
      await tester.pump();
      expect(find.text('Payment panel'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('makes reached steps pressable once there is a handler', (
      WidgetTester tester,
    ) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(host(width: 600, _three(active: 1, onActiveChange: changes.add)));
      await tester.tap(find.text('Account'));

      expect(changes, <int>[0]);
    });

    testWidgets('works uncontrolled', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three(initialActive: 1)));
      await tester.tap(find.text('Account'));
      await tester.pump();

      expect(find.text('Account panel'), findsOneWidget);
    });

    testWidgets('is pressed from the keyboard', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(host(width: 600, _three(active: 1, onActiveChange: changes.add)));

      Focus.of(tester.element(find.text('Account'))).requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(changes, <int>[0]);
    });
  });

  group('reachability', () {
    testWidgets('refuses a step ahead of the one the reader has reached', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final List<int> changes = <int>[];

      await tester.pumpWidget(host(width: 600, _three(active: 0, onActiveChange: changes.add)));

      final SemanticsData done = _stepData(tester, 'Done')!;
      // Still a button, and still a stop, said to be unavailable.
      expect(done.flagsCollection.isButton, isTrue);
      expect(done.flagsCollection.isEnabled, Tristate.isFalse);
      expect(done.flagsCollection.isFocused, isNot(Tristate.none));

      await tester.tap(find.text('Done'));
      expect(changes, isEmpty);
      semantics.dispose();
    });

    testWidgets('always allows going back', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, const _Driven()));

      await tester.tap(find.text('next'));
      await tester.pump();
      await tester.tap(find.text('next'));
      await tester.pump();
      expect(find.text('active 2'), findsOneWidget);

      await tester.tap(find.text('Account'));
      await tester.pump();
      expect(find.text('active 0'), findsOneWidget);
    });

    testWidgets('lets the reader return to the furthest step they had reached', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 600, const _Driven()));

      await tester.tap(find.text('next'));
      await tester.pump();
      await tester.tap(find.text('next'));
      await tester.pump();
      await tester.tap(find.text('Account'));
      await tester.pump();
      await tester.tap(find.text('Done'));
      await tester.pump();

      expect(find.text('active 2'), findsOneWidget);
    });

    testWidgets('reaches anything at all when linear is off', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(width: 600, _three(active: 0, linear: false, onActiveChange: changes.add)),
      );
      await tester.tap(find.text('Done'));

      expect(changes, <int>[2]);
    });

    testWidgets('refuses a disabled step even when it is reachable', (WidgetTester tester) async {
      final List<int> changes = <int>[];

      await tester.pumpWidget(
        host(
          width: 600,
          MPStepper(
            active: 1,
            linear: false,
            onActiveChange: changes.add,
            children: const <Widget>[
              MPStep(label: Text('One')),
              MPStep(label: Text('Two')),
              MPStep(label: Text('Three'), disabled: true),
            ],
          ),
        ),
      );
      await tester.tap(find.text('Three'));

      expect(changes, isEmpty);
    });
  });

  group('a failed step', () {
    testWidgets('keeps its place and swaps the accent family', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 600,
          const MPStepper(
            active: 1,
            children: <Widget>[
              MPStep(label: Text('One')),
              MPStep(label: Text('Two'), error: true),
              MPStep(label: Text('Three')),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(MPStep), findsNWidgets(3));
      expect(_bulletFill(tester, 1), _light.error);
      expect(styleOf(tester, 'Two').color, _light.error);
    });
  });

  group('the title', () {
    testWidgets('reads the accent on the current step', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 600, _three(active: 1)));
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Account').color, _light.onSurface);
      expect(styleOf(tester, 'Payment').color, _light.primary);
      expect(styleOf(tester, 'Done').color, _light.onSurfaceVariant);
    });

    testWidgets('takes the accent and the size from the configuration', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 900,
          MPConfigProvider(color: MPColor.tertiary, size: MPSize.xl, child: _three(active: 1)),
        ),
      );
      await tester.pumpAndSettle();

      expect(styleOf(tester, 'Payment').color, _light.tertiary);
      expect(
        tester
            .getSize(
              find
                  .descendant(
                    of: find.byType(MPStep).first,
                    matching: find.byType(AnimatedContainer),
                  )
                  .first,
            )
            .width,
        30,
      );
    });
  });
}
