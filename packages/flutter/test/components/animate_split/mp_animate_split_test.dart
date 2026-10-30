import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_split/mp_animate_split.dart';
import 'package:material_plus_ui/src/internal/animate.dart';

import '../../support/host.dart';

/// Every piece, as written, in order.
List<String> _pieces(WidgetTester tester) {
  return tester
      .widgetList<Text>(
        find.descendant(of: find.byType(MPAnimateSplit), matching: find.byType(Text)),
      )
      .map((Text text) => text.data!)
      .toList();
}

List<double> _opacities(WidgetTester tester) {
  return tester
      .widgetList<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateSplit), matching: find.byType(MPAnimateOpacity)),
      )
      .map((MPAnimateOpacity widget) => widget.opacity)
      .toList();
}

Future<void> _advance(WidgetTester tester, Duration time) async {
  const Duration frame = Duration(milliseconds: 10);

  for (Duration gone = Duration.zero; gone < time; gone += frame) {
    await tester.pump(frame);
  }
}

void main() {
  testWidgets('cuts a line into words, each with the space after it', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateSplit(text: 'What we shipped')));

    expect(_pieces(tester), <String>['What ', 'we ', 'shipped']);

    await tester.pumpAndSettle();
  });

  testWidgets('joins back to the string it was given, spaces and all', (WidgetTester tester) async {
    const String line = 'Two  spaces and\ta tab';

    await tester.pumpWidget(host(const MPAnimateSplit(text: line)));

    expect(_pieces(tester).join(), line);

    await tester.pumpWidget(
      host(const MPAnimateSplit(key: Key('c'), text: line, by: MPAnimateSplitBy.character)),
    );

    expect(_pieces(tester).join(), line);

    await tester.pumpAndSettle();
  });

  testWidgets('gives each piece its own delay, 40ms apart by default', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateSplit(
          text: 'one two three',
          duration: Duration(milliseconds: 40),
          easing: MPEasing.linear,
        ),
      ),
    );
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 60));

    final List<double> opacities = _opacities(tester);

    expect(opacities[0], 1);
    expect(opacities[1], allOf(greaterThan(0), lessThan(1)));
    expect(opacities[2], 0);

    await tester.pumpAndSettle();
  });

  testWidgets('cuts by grapheme rather than by code unit', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateSplit(text: 'é👩‍👩‍👧', by: MPAnimateSplitBy.character)),
    );

    expect(_pieces(tester), <String>['é', '👩‍👩‍👧']);

    await tester.pumpAndSettle();
  });

  testWidgets('keeps characters inside their words, so a line cannot wrap mid-word', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        const MPAnimateSplit(text: 'Character by character', by: MPAnimateSplitBy.character),
        width: 200,
      ),
    );
    await tester.pumpAndSettle();

    // The line breaks between the words: 'Character by ' does not fit in 200
    // and 'character' goes down whole, its first letter on the line its last
    // letter is on.
    final double first = tester.getTopLeft(find.text('C')).dy;
    final double second = tester.getTopLeft(find.text('c').at(1)).dy;

    expect(second, greaterThan(first));
    expect(tester.getTopLeft(find.text('r').last).dy, second);
  });

  testWidgets('lets a script without spaces wrap between its characters', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateSplit(text: '今日は良い天気', by: MPAnimateSplitBy.character)),
    );

    // One piece and one run per character.
    expect(_pieces(tester), hasLength(7));
    expect(
      find.descendant(of: find.byType(MPAnimateSplit), matching: find.byType(Wrap)),
      findsOneWidget,
    );

    await tester.pumpAndSettle();
  });

  testWidgets('runs the line from the end when reversed, each piece still forwards', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        const MPAnimateSplit(
          text: 'one two three',
          reverse: true,
          duration: Duration(milliseconds: 40),
        ),
      ),
    );
    await tester.pump();
    await _advance(tester, const Duration(milliseconds: 50));

    final List<double> opacities = _opacities(tester);

    expect(opacities[0], 0);
    expect(opacities[2], 1);

    await tester.pumpAndSettle();
  });

  testWidgets('gives a screen reader the sentence rather than a list of letters', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(
      host(const MPAnimateSplit(text: 'Character by character', by: MPAnimateSplitBy.character)),
    );

    expect(semanticsLabels(tester), <String>['Character by character']);

    await tester.pumpAndSettle();
    handle.dispose();
  });

  testWidgets('is simply there under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateSplit(text: 'one two'), disableAnimations: true));

    expect(_opacities(tester), <double>[1, 1]);
  });
}
