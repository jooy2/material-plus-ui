import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/panes/mp_panes.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite measures panes in a browser and reads `aria-valuenow` off
/// each separator. Here the panes are measured where they landed, and a handle
/// is the slider node its semantics make it.

Widget _region(String name) => SizedBox.expand(key: Key(name));

double _widthOf(WidgetTester tester, String name) => tester.getSize(find.byKey(Key(name))).width;

/// A split 408 wide: 400 to divide once the default 8px handle has taken its
/// track.
Widget _split({
  List<MPPane>? panes,
  MPOrientation orientation = MPOrientation.horizontal,
  bool resizable = true,
  ValueChanged<List<double>>? onResize,
  ValueChanged<List<double>>? onResizeEnd,
  TextDirection textDirection = TextDirection.ltr,
}) {
  return host(
    width: 408,
    height: 408,
    textDirection: textDirection,
    MPPanes(
      orientation: orientation,
      resizable: resizable,
      onResize: onResize,
      onResizeEnd: onResizeEnd,
      children: panes ?? <MPPane>[MPPane(child: _region('a')), MPPane(child: _region('b'))],
    ),
  );
}

Finder _handle() => find.byType(FocusableActionDetector).first;

/// [panes] in a split 408 wide, after a focus stop of its own, with the focus
/// moved onto the first handle the way a keyboard brings it: a Tab from that
/// stop.
Future<void> _focusedSplit(
  WidgetTester tester, {
  List<MPPane>? panes,
  ValueChanged<List<double>>? onResizeEnd,
}) async {
  final FocusNode before = FocusNode();
  addTearDown(before.dispose);

  await tester.pumpWidget(
    host(
      afterFocusStop(
        before,
        SizedBox(
          width: 408,
          height: 400,
          child: MPPanes(
            onResizeEnd: onResizeEnd,
            children: panes ?? <MPPane>[MPPane(child: _region('a')), MPPane(child: _region('b'))],
          ),
        ),
      ),
    ),
  );
  before.requestFocus();
  await tester.pump();
  await tester.sendKeyEvent(LogicalKeyboardKey.tab);
  await tester.pump();
}

void main() {
  group('the split', () {
    testWidgets('gives every pane an even share when nobody asked for one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_split());

      expect(_widthOf(tester, 'a'), 200);
      expect(_widthOf(tester, 'b'), 200);
    });

    testWidgets('turns an absolute default into a share of what is there', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _split(
          panes: <MPPane>[
            MPPane(defaultSize: const MPPaneSize.pixels(100), child: _region('a')),
            MPPane(child: _region('b')),
          ],
        ),
      );

      expect(_widthOf(tester, 'a'), 100);
      expect(_widthOf(tester, 'b'), 300);
    });

    testWidgets('reads a percentage against what is left after the handles', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        _split(
          panes: <MPPane>[
            MPPane(defaultSize: const MPPaneSize.percent(25), child: _region('a')),
            MPPane(child: _region('b')),
          ],
        ),
      );

      expect(_widthOf(tester, 'a'), 100);
    });

    testWidgets('interleaves one handle fewer than there are panes', (WidgetTester tester) async {
      await tester.pumpWidget(
        _split(
          panes: <MPPane>[
            MPPane(child: _region('a')),
            MPPane(child: _region('b')),
            MPPane(child: _region('c')),
          ],
        ),
      );

      expect(find.byType(FocusableActionDetector), findsNWidgets(2));
    });

    testWidgets('stacks the panes when vertical', (WidgetTester tester) async {
      await tester.pumpWidget(_split(orientation: MPOrientation.vertical));

      expect(tester.getSize(find.byKey(const Key('a'))).height, 200);
      expect(
        tester.getTopLeft(find.byKey(const Key('b'))).dy -
            tester.getTopLeft(find.byKey(const Key('a'))).dy,
        208,
      );
    });

    testWidgets('draws a hairline in outlineVariant down the handle', (WidgetTester tester) async {
      await tester.pumpWidget(_split());

      final Iterable<Color?> colours = tester
          .widgetList<AnimatedContainer>(find.byType(AnimatedContainer))
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(colours, contains(MPColorScheme.fromSource().outlineVariant));
    });
  });

  group('the handle', () {
    testWidgets('is a control that says where it currently sits', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _split(
          panes: <MPPane>[
            MPPane(defaultSize: const MPPaneSize.percent(30), child: _region('a')),
            MPPane(child: _region('b')),
          ],
        ),
      );

      final SemanticsData data = tester
          .getSemantics(find.byType(Semantics).last)
          .getSemanticsData();

      expect(data.flagsCollection.isSlider, isTrue);
      expect(data.value, '30%');
      handle.dispose();
    });

    testWidgets('moves when dragged, and reports while and after', (WidgetTester tester) async {
      final List<List<double>> during = <List<double>>[];
      final List<List<double>> after = <List<double>>[];

      await tester.pumpWidget(_split(onResize: during.add, onResizeEnd: after.add));
      await tester.drag(_handle(), const Offset(40, 0));
      await tester.pumpAndSettle();

      expect(_widthOf(tester, 'a'), closeTo(240, 0.5));
      expect(during, isNotEmpty);
      expect(after.single.first, closeTo(60, 0.2));
    });

    testWidgets('follows the pointer under right-to-left text', (WidgetTester tester) async {
      await tester.pumpWidget(_split(textDirection: TextDirection.rtl));
      await tester.drag(_handle(), const Offset(-40, 0));
      await tester.pumpAndSettle();

      expect(_widthOf(tester, 'a'), closeTo(240, 0.5));
    });

    testWidgets('moves on an arrow key, which is a whole gesture on its own', (
      WidgetTester tester,
    ) async {
      final List<List<double>> after = <List<double>>[];

      await _focusedSplit(tester, onResizeEnd: after.add);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(_widthOf(tester, 'a'), 216);
      expect(after, hasLength(1));

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pump();
      expect(_widthOf(tester, 'a'), 200);
    });

    testWidgets('ignores the arrows across its travel', (WidgetTester tester) async {
      await _focusedSplit(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();

      expect(_widthOf(tester, 'a'), 200);
    });

    testWidgets('will not cross the floor a pane was given', (WidgetTester tester) async {
      await tester.pumpWidget(
        _split(
          panes: <MPPane>[
            MPPane(minSize: const MPPaneSize.pixels(190), child: _region('a')),
            MPPane(child: _region('b')),
          ],
        ),
      );
      await tester.drag(_handle(), const Offset(-100, 0));
      await tester.pumpAndSettle();

      expect(_widthOf(tester, 'a'), 190);
    });

    testWidgets('goes to the ends of its travel on Home and End', (WidgetTester tester) async {
      await _focusedSplit(
        tester,
        panes: <MPPane>[
          MPPane(minSize: const MPPaneSize.pixels(100), child: _region('a')),
          MPPane(minSize: const MPPaneSize.percent(25), child: _region('b')),
        ],
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(_widthOf(tester, 'a'), 100);

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(_widthOf(tester, 'b'), 100);
    });

    testWidgets('lights up in the accent under the pointer', (WidgetTester tester) async {
      await tester.pumpWidget(_split());

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(_handle()));
      await tester.pumpAndSettle();

      final Iterable<Color?> colours = tester
          .widgetList<AnimatedContainer>(find.byType(AnimatedContainer))
          .map((AnimatedContainer box) => (box.decoration as BoxDecoration?)?.color);

      expect(colours, contains(MPColorScheme.fromSource().primary));
    });

    testWidgets('leaves the focus order and stops responding when not resizable', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(_split(resizable: false));
      await tester.drag(_handle(), const Offset(40, 0));
      await tester.pumpAndSettle();

      expect(_widthOf(tester, 'a'), 200);
      expect(tester.widget<FocusableActionDetector>(_handle()).enabled, isFalse);
    });
  });

  testWidgets('draws no surface for a pane', (WidgetTester tester) async {
    await tester.pumpWidget(_split());

    expect(
      find.descendant(of: find.byType(MPPane).first, matching: find.byType(DecoratedBox)),
      findsNothing,
    );
  });
}
