import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_scramble/mp_animate_scramble.dart';

import '../../support/host.dart';

String _shown(WidgetTester tester) {
  return tester
      .widget<Text>(
        find.descendant(of: find.byType(MPAnimateScramble), matching: find.byType(Text)),
      )
      .data!;
}

void main() {
  testWidgets('settles on the text it was given', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateScramble(text: 'ACCESS GRANTED')));
    await tester.pumpAndSettle();

    expect(_shown(tester), 'ACCESS GRANTED');
  });

  testWidgets('is its finished length from the first frame', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateScramble(text: 'ACCESS GRANTED')));

    expect(_shown(tester).characters.length, 'ACCESS GRANTED'.length);

    await tester.pump(const Duration(milliseconds: 300));

    expect(_shown(tester).characters.length, 'ACCESS GRANTED'.length);

    await tester.pumpAndSettle();
  });

  testWidgets('waits as noise rather than as the answer', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateScramble(text: 'hello', trigger: MPAnimateTrigger.manual)),
    );

    // Lower case is never noise, so none of the line has settled yet.
    expect(_shown(tester), isNot(contains(RegExp('[a-z]'))));
  });

  testWidgets('holds that noise still rather than churning before it has been triggered', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateScramble(text: 'hello world', trigger: MPAnimateTrigger.manual)),
    );

    final String first = _shown(tester);

    await tester.pump(const Duration(seconds: 1));

    expect(_shown(tester), first);
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('settles from the first character to the last', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateScramble(text: 'abcdefghij', duration: Duration(seconds: 1))),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 700));

    final String shown = _shown(tester);

    // Settling starts at 60% of the run with the default spread, from the left.
    expect(shown.startsWith('a'), isTrue);
    expect(shown.endsWith('j'), isFalse);

    await tester.pumpAndSettle();
  });

  testWidgets('draws its noise from the alphabet it was given', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateScramble(text: 'abc', characters: '#', trigger: MPAnimateTrigger.manual)),
    );

    expect(_shown(tester), '###');
  });

  testWidgets('gives a screen reader the words rather than the noise', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPAnimateScramble(text: 'ACCESS GRANTED')));

    expect(semanticsLabels(tester), <String>['ACCESS GRANTED']);

    await tester.pumpAndSettle();
    handle.dispose();
  });

  testWidgets('counts characters rather than code units', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateScramble(text: '👩‍👩‍👧 ok', trigger: MPAnimateTrigger.manual)),
    );

    expect(_shown(tester).characters.length, 4);
  });

  testWidgets('is simply there under reduced motion', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateScramble(text: 'ACCESS GRANTED', trigger: MPAnimateTrigger.manual),
        disableAnimations: true,
      ),
    );

    expect(_shown(tester), 'ACCESS GRANTED');
  });
}
