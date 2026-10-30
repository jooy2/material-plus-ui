import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/slider/mp_slider.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// A slider whose parent holds the value.
class _Controlled extends StatefulWidget {
  const _Controlled({
    this.initial = const <double>[40],
    this.step = 1,
    this.focusNode,
    this.onCommitted,
  });

  final List<double> initial;
  final double step;
  final FocusNode? focusNode;
  final ValueChanged<List<double>>? onCommitted;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late List<double> value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPSlider(
      label: const Text('Volume'),
      value: value,
      step: widget.step,
      focusNode: widget.focusNode,
      onValueCommitted: widget.onCommitted,
      onChanged: (List<double> next) => setState(() => value = next),
    );
  }
}

List<double> _valueOf(WidgetTester tester) {
  return tester.state<_ControlledState>(find.byType(_Controlled)).value;
}

/// The handles, in order.
Finder _handles() {
  return find.descendant(of: find.byType(MPSlider), matching: find.byType(MPSelectionHalo));
}

Rect _strip(WidgetTester tester) {
  return tester.getRect(
    find.descendant(of: find.byType(MPSlider), matching: find.byType(GestureDetector)).first,
  );
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is announced as a slider with its value', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const _Controlled()));

      expect(
        tester.getSemantics(_handles().first),
        matchesSemantics(
          label: 'Volume',
          value: '40',
          increasedValue: '41',
          decreasedValue: '39',
          isSlider: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasIncreaseAction: true,
          hasDecreaseAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('takes a name with no visible label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 300, const MPSlider(semanticLabel: 'Zoom')));

      expect(find.bySemanticsLabel('Zoom'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('grows one handle per value, which is what makes it a range', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, const MPSlider(initialValue: <double>[20, 80])));

      expect(_handles(), findsNWidgets(2));
    });

    testWidgets('shows the value only when asked, the way it is asked to', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 300, const MPSlider(initialValue: <double>[40])));
      expect(find.text('40'), findsNothing);

      await tester.pumpWidget(
        host(
          width: 300,
          MPSlider(
            key: const ValueKey<String>('range'),
            showValue: true,
            initialValue: const <double>[20, 80],
            format: (double value) => '£${value.round()}',
          ),
        ),
      );
      expect(find.text('£20 – £80'), findsOneWidget);
    });

    testWidgets('fills the active track with the accent', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSlider(initialValue: <double>[50])));

      final Iterable<Color?> fills = tester
          .widgetList<DecoratedBox>(
            find.descendant(of: find.byType(MPSlider), matching: find.byType(DecoratedBox)),
          )
          .map((DecoratedBox box) => (box.decoration as BoxDecoration).color);

      expect(fills, containsAll(<Color>[light.surfaceContainerHighest, light.primary]));
    });

    testWidgets('puts the handle at its share of the track', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSlider(initialValue: <double>[25])));

      final Rect strip = _strip(tester);
      expect(tester.getCenter(_handles().first).dx - strip.left, 75);
    });

    testWidgets('runs from the right under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          textDirection: TextDirection.rtl,
          const MPSlider(initialValue: <double>[25]),
        ),
      );

      final Rect strip = _strip(tester);
      expect(strip.right - tester.getCenter(_handles().first).dx, 75);
    });
  });

  group('moving', () {
    testWidgets('steps with the arrow keys and stops at the ends', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(width: 300, _Controlled(initial: const <double>[99], focusNode: focus)),
      );
      focus.requestFocus();
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(_valueOf(tester), <double>[100]);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      expect(_valueOf(tester), <double>[100]);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(_valueOf(tester), <double>[0]);
    });

    testWidgets('steps by the step it is given', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(width: 300, _Controlled(initial: const <double>[40], step: 5, focusNode: focus)),
      );
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();

      expect(_valueOf(tester), <double>[45]);
    });

    testWidgets('moves to where the track is pressed', (WidgetTester tester) async {
      final List<List<double>> commits = <List<double>>[];

      await tester.pumpWidget(host(width: 300, _Controlled(onCommitted: commits.add)));

      final Rect strip = _strip(tester);
      await tester.tapAt(Offset(strip.left + 270, strip.center.dy));
      await tester.pump();

      expect(_valueOf(tester), <double>[90]);
      expect(commits, <List<double>>[
        <double>[90],
      ]);
    });

    testWidgets('reports the drag as it happens and once it settles', (WidgetTester tester) async {
      final List<List<double>> commits = <List<double>>[];

      await tester.pumpWidget(host(width: 300, _Controlled(onCommitted: commits.add)));

      final Offset from = tester.getCenter(_handles().first);
      final TestGesture drag = await tester.startGesture(from);
      await drag.moveBy(const Offset(30, 0));
      await tester.pump();
      await drag.moveBy(const Offset(30, 0));
      await tester.pump();

      expect(_valueOf(tester), <double>[60]);
      expect(commits, isEmpty);

      await drag.up();
      await tester.pump();
      expect(commits, <List<double>>[
        <double>[60],
      ]);
    });

    testWidgets('keeps the handles of a range from crossing', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(width: 300, _Controlled(initial: const <double>[50, 51], focusNode: focus)),
      );
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(_valueOf(tester), <double>[51, 51]);
    });

    testWidgets('travels to a value it was not dragged to', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(host(width: 300, _Controlled(focusNode: focus)));
      focus.requestFocus();
      await tester.pump();

      final double before = tester.getCenter(_handles().first).dx;
      await tester.sendKeyEvent(LogicalKeyboardKey.pageUp);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      final double midway = tester.getCenter(_handles().first).dx;
      await tester.pumpAndSettle();
      final double after = tester.getCenter(_handles().first).dx;

      expect(midway, greaterThan(before));
      expect(midway, lessThan(after));
      expect(after - before, 30);
    });
  });

  group('states', () {
    testWidgets('does not move when disabled', (WidgetTester tester) async {
      final List<List<double>> changes = <List<double>>[];

      await tester.pumpWidget(
        host(
          width: 300,
          MPSlider(disabled: true, initialValue: const <double>[30], onChanged: changes.add),
        ),
      );
      final Rect strip = _strip(tester);
      await tester.tapAt(Offset(strip.left + 270, strip.center.dy));

      expect(changes, isEmpty);
    });
  });

  group('the size ladder', () {
    testWidgets('grows the handle monotonically', (WidgetTester tester) async {
      final List<double> handles = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(width: 300, MPSlider(size: size)));
        handles.add(tester.getSize(_handles().first).width);
      }

      expect(handles, <double>[14, 16, 20, 24, 28]);
    });

    testWidgets('keeps the pressable strip much taller than the rail', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSlider()));

      expect(_strip(tester).height, 40);
    });
  });

  group('the description', () {
    testWidgets('is read on the handle', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 300,
          const MPSlider(label: Text('Brightness'), description: Text('Preview only.')),
        ),
      );

      expect(tester.getSemantics(_handles().first).hint, 'Preview only.');
      semantics.dispose();
    });
  });

  group('marks', () {
    int ticksIn(WidgetTester tester) {
      return tester
              .widgetList<DecoratedBox>(
                find.descendant(of: find.byType(MPSlider), matching: find.byType(DecoratedBox)),
              )
              .where(
                (DecoratedBox box) => (box.decoration as BoxDecoration).shape == BoxShape.circle,
              )
              .length -
          // The handle and its halo are the other two.
          2;
    }

    testWidgets('draws nothing without them', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 300, const MPSlider(max: 10)));

      expect(ticksIn(tester), 0);
    });

    testWidgets('puts one at every step', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPSlider(max: 10, marks: MPSliderMarks.everyStep())),
      );

      expect(ticksIn(tester), 11);
    });

    testWidgets('refuses to draw a dotted line', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 300, const MPSlider(max: 1000, marks: MPSliderMarks.everyStep())),
      );

      expect(ticksIn(tester), 0);
    });

    testWidgets('drops a mark that is off the range and writes the labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPSlider(
            min: 1990,
            max: 2020,
            marks: MPSliderMarks(<MPSliderMark>[
              MPSliderMark(value: 1990, label: Text('1990')),
              MPSliderMark(value: 2005, label: Text('2005')),
              MPSliderMark(value: 2030, label: Text('2030')),
            ]),
          ),
        ),
      );

      expect(find.text('2030'), findsNothing);
      expect(tester.getCenter(find.text('2005')).dx - _strip(tester).left, moreOrLessEquals(150));
    });
  });
}
