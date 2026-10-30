import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_counter/mp_animate_counter.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

/// What the counting copy shows.
String _shown(WidgetTester tester) {
  return tester
      .widget<Text>(find.descendant(of: find.byType(MPAnimateCounter), matching: find.byType(Text)))
      .data!;
}

void main() {
  testWidgets('arrives at the value', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateCounter(value: 128400)));
    await tester.pumpAndSettle();

    expect(_shown(tester), '128,400');
  });

  testWidgets('counts through the numbers in between', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateCounter(
          value: 100,
          duration: Duration(seconds: 1),
          easing: MPEasing.linear,
          format: _whole,
        ),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    expect(_shown(tester), '50');
  });

  testWidgets('takes medium2 when nobody said', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateCounter(value: 10, format: _whole)));
    await tester.pump();
    await tester.pump(MPMotion.medium2 + const Duration(milliseconds: 10));

    expect(_shown(tester), '10');
  });

  testWidgets('shows `from` while it is waiting, not the answer', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateCounter(
          value: 900,
          from: 100,
          trigger: MPAnimateTrigger.manual,
          format: _whole,
        ),
      ),
    );
    await tester.pump(const Duration(seconds: 1));

    expect(_shown(tester), '100');
  });

  testWidgets('shows the value at once under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateCounter(value: 42, trigger: MPAnimateTrigger.manual, format: _whole),
        disableAnimations: true,
      ),
    );

    expect(_shown(tester), '42');
  });

  testWidgets('gives a screen reader the number rather than the performance', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPAnimateCounter(value: 128400)));

    // Mid-count, the reader still hears the answer and only the answer.
    expect(semanticsLabels(tester), <String>['128,400']);

    await tester.pumpAndSettle();
    handle.dispose();
  });

  testWidgets('writes a number grouped and to three decimals when nobody said', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateCounter(value: 1234567.891234)));
    await tester.pumpAndSettle();

    expect(_shown(tester), '1,234,567.891');

    await tester.pumpWidget(host(const MPAnimateCounter(key: Key('b'), value: 0.5)));
    await tester.pumpAndSettle();

    expect(_shown(tester), '0.5');
  });

  testWidgets('takes a formatter of its own', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        MPAnimateCounter(
          value: 0.9992,
          format: (double value) => '${(value * 100).toStringAsFixed(2)}%',
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(_shown(tester), '99.92%');
  });

  testWidgets('sets the digits on one width, so it does not shiver as it counts', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateCounter(value: 10)));

    final TextStyle style = tester
        .widget<Text>(
          find.descendant(of: find.byType(MPAnimateCounter), matching: find.byType(Text)),
        )
        .style!;

    expect(style.fontFeatures, contains(const FontFeature.tabularFigures()));
  });

  testWidgets('counts again on a replay', (WidgetTester tester) async {
    Widget counter(bool play) {
      return host(
        MPAnimateCounter(value: 50, trigger: MPAnimateTrigger.manual, play: play, format: _whole),
      );
    }

    await tester.pumpWidget(counter(true));
    await tester.pumpAndSettle();

    expect(_shown(tester), '50');

    await tester.pumpWidget(counter(false));
    await tester.pumpWidget(counter(true));

    expect(_shown(tester), '0');

    await tester.pumpAndSettle();

    expect(_shown(tester), '50');
  });
}

String _whole(double value) => value.round().toString();
