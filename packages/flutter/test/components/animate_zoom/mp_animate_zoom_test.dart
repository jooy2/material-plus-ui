import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_zoom/mp_animate_zoom.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

Transform _transform(WidgetTester tester) {
  return tester.widget<Transform>(
    find.descendant(of: find.byType(MPAnimateZoom), matching: find.byType(Transform)).first,
  );
}

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateZoom), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

void main() {
  testWidgets('starts at less than half, where a grow starts near its final size', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateZoom(child: Text('Done'))));

    expect(_transform(tester).transform.entry(0, 0), closeTo(0.4, 0.001));

    await tester.pumpAndSettle();

    expect(_transform(tester).transform.entry(0, 0), 1);
  });

  testWidgets('can arrive oversized and settle back', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateZoom(from: 1.3, child: Text('Done'))));

    expect(_transform(tester).transform.entry(0, 0), closeTo(1.3, 0.001));
  });

  testWidgets('is always about the middle, whatever the reading direction', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateZoom(child: Text('Done')), textDirection: TextDirection.rtl),
    );

    expect(_transform(tester).alignment, Alignment.center);
  });

  testWidgets('takes medium4 arriving and short4 leaving', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateZoom(child: Text('In'))));
    await tester.pump();
    await tester.pump(MPMotion.medium4 + const Duration(milliseconds: 10));

    expect(_transform(tester).transform.entry(0, 0), 1);

    await tester.pumpWidget(
      host(const MPAnimateZoom(key: Key('out'), mode: MPAnimateMode.exit, child: Text('Out'))),
    );
    await tester.pump();
    await tester.pump(MPMotion.short4 + const Duration(milliseconds: 10));

    expect(_opacity(tester), 0);
  });

  testWidgets('holds full opacity when the fade is off', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateZoom(fade: false, child: Text('Done'))));

    expect(_opacity(tester), 1);
  });
}
