import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/show/mp_show.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite resizes the browser and reads `display`. Here the window is
/// the [MediaQuery] the gate is under, and hidden is not built.

/// A window in the middle of each class: 400, 700, 1000, 1400, 1800.
const Map<MPWindowClass, double> _widths = <MPWindowClass, double>{
  MPWindowClass.compact: 400,
  MPWindowClass.medium: 700,
  MPWindowClass.expanded: 1000,
  MPWindowClass.large: 1400,
  MPWindowClass.extraLarge: 1800,
};

Widget _inWindow(double width, Widget child) {
  return host(
    MediaQuery(
      data: MediaQueryData(size: Size(width, 900)),
      child: child,
    ),
  );
}

/// The classes [gate] is open in.
Future<List<MPWindowClass>> _openIn(WidgetTester tester, MPShow gate) async {
  final List<MPWindowClass> open = <MPWindowClass>[];

  for (final MapEntry<MPWindowClass, double> entry in _widths.entries) {
    await tester.pumpWidget(_inWindow(entry.value, gate));

    if (find.text('Here').evaluate().isNotEmpty) {
      open.add(entry.key);
    }
  }

  return open;
}

void main() {
  testWidgets('shows what is at or above from, and hides what is below', (
    WidgetTester tester,
  ) async {
    expect(
      await _openIn(tester, const MPShow(from: MPWindowClass.expanded, child: Text('Here'))),
      <MPWindowClass>[MPWindowClass.expanded, MPWindowClass.large, MPWindowClass.extraLarge],
    );
  });

  testWidgets('hides what is at or above until, and shows what is below', (
    WidgetTester tester,
  ) async {
    expect(
      await _openIn(tester, const MPShow(until: MPWindowClass.expanded, child: Text('Here'))),
      <MPWindowClass>[MPWindowClass.compact, MPWindowClass.medium],
    );
  });

  testWidgets('covers every width exactly once across a from/until pair', (
    WidgetTester tester,
  ) async {
    for (final MPWindowClass boundary in MPWindowClass.values.skip(1)) {
      final List<MPWindowClass> above = await _openIn(
        tester,
        MPShow(from: boundary, child: const Text('Here')),
      );
      final List<MPWindowClass> below = await _openIn(
        tester,
        MPShow(until: boundary, child: const Text('Here')),
      );

      expect(<MPWindowClass>{...above, ...below}, MPWindowClass.values.toSet());
      expect(above.toSet().intersection(below.toSet()), isEmpty);
    }
  });

  testWidgets('is always open with nothing said', (WidgetTester tester) async {
    expect(await _openIn(tester, const MPShow(child: Text('Here'))), MPWindowClass.values);
  });

  group('only', () {
    testWidgets('shows the class it names and no other', (WidgetTester tester) async {
      expect(
        await _openIn(tester, const MPShow(only: MPWindowClass.medium, child: Text('Here'))),
        <MPWindowClass>[MPWindowClass.medium],
      );
    });

    testWidgets('runs to the top of the ladder when it names the top', (WidgetTester tester) async {
      expect(
        await _openIn(tester, const MPShow(only: MPWindowClass.extraLarge, child: Text('Here'))),
        <MPWindowClass>[MPWindowClass.extraLarge],
      );
    });

    testWidgets('lets from and until override their own half', (WidgetTester tester) async {
      expect(
        await _openIn(
          tester,
          const MPShow(only: MPWindowClass.medium, until: MPWindowClass.large, child: Text('Here')),
        ),
        <MPWindowClass>[MPWindowClass.medium, MPWindowClass.expanded],
      );
    });
  });

  testWidgets('moves with a boundary an MPConfigProvider moved', (WidgetTester tester) async {
    await tester.pumpWidget(
      _inWindow(
        650,
        const MPConfigProvider(
          breakpoints: <MPWindowClass, double>{MPWindowClass.medium: 700},
          child: MPShow(from: MPWindowClass.medium, child: Text('Here')),
        ),
      ),
    );

    expect(find.text('Here'), findsNothing);
  });

  testWidgets('builds nothing while closed, and adds nothing while open', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _inWindow(400, const MPShow(from: MPWindowClass.medium, child: Text('Here'))),
    );

    expect(tester.getSize(find.byType(MPShow)), Size.zero);

    await tester.pumpWidget(
      _inWindow(900, const MPShow(from: MPWindowClass.medium, child: Text('Here'))),
    );

    expect(tester.getSize(find.byType(MPShow)), tester.getSize(find.text('Here')));
  });
}
