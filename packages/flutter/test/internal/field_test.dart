import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/types.dart';

import '../support/host.dart';

/// The parts of the field core no component of its own covers yet: the shell
/// round a trigger rather than an editor, and the width sizer a picker uses.
void main() {
  group('MPWidthSizer', () {
    testWidgets('holds a column open at its widest sample, with no height', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const Column(
            key: Key('column'),
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              SizedBox(width: 10, height: 20),
              MPWidthSizer(samples: <String>['May', 'September'], style: TextStyle(fontSize: 10)),
            ],
          ),
        ),
      );

      final Size column = tester.getSize(find.byKey(const Key('column')));

      expect(column.height, 20);
      expect(column.width, greaterThan(10));
      expect(find.text('September'), findsOneWidget);
      expect(semanticsLabels(tester), isNot(contains('September')));

      handle.dispose();
    });

    testWidgets('takes no room with nothing to measure', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPWidthSizer(samples: <String>[])));

      expect(tester.getSize(find.byType(MPWidthSizer)), Size.zero);
    });
  });

  group('MPFieldShell', () {
    testWidgets('keeps the label up while something is pinned, a popup open', (
      WidgetTester tester,
    ) async {
      Widget shell({required bool pinned}) => host(
        MPFieldShell(
          size: MPSize.md,
          label: const Text('Due'),
          pinned: pinned,
          builder: (BuildContext context, MPFieldStatus status) {
            return SizedBox(width: 200, child: Text(status.shrunk ? 'up' : 'resting'));
          },
        ),
      );

      await tester.pumpWidget(shell(pinned: false));
      expect(find.text('resting'), findsOneWidget);

      await tester.pumpWidget(shell(pinned: true));
      expect(find.text('up'), findsOneWidget);
    });

    testWidgets('takes a press on its padding for the control', (WidgetTester tester) async {
      int taps = 0;

      await tester.pumpWidget(
        host(
          MPFieldShell(
            size: MPSize.md,
            onTap: () => taps++,
            builder: (BuildContext context, MPFieldStatus status) => const SizedBox(width: 200),
          ),
        ),
      );

      await tester.tap(find.byType(MPFieldShell));

      expect(taps, 1);
    });

    testWidgets('counts a focus it is told about from outside', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          MPFieldShell(
            size: MPSize.md,
            focused: true,
            builder: (BuildContext context, MPFieldStatus status) {
              return SizedBox(width: 200, child: Text(status.focused ? 'focused' : 'idle'));
            },
          ),
        ),
      );

      expect(find.text('focused'), findsOneWidget);
    });
  });
}
