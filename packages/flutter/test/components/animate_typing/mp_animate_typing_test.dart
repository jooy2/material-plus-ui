import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_typing/mp_animate_typing.dart';
import 'package:material_plus_ui/src/internal/animate.dart';

import '../../support/host.dart';

/// What has been typed so far, without the caret.
String _typed(WidgetTester tester) {
  // The finished string laid out unseen comes first, the typed line second,
  // and the caret, a widget inside that line, after it.
  final RichText rich = tester
      .widgetList<RichText>(
        find.descendant(of: find.byType(MPAnimateTyping), matching: find.byType(RichText)),
      )
      .elementAt(1);

  // A plain reading writes the caret as one replacement character.
  return rich.text.toPlainText().replaceAll('\uFFFC', '');
}

/// Whether the caret is drawn right now.
bool _caretOn(WidgetTester tester) {
  return tester
          .widget<MPAnimateOpacity>(
            find.descendant(
              of: find.byType(MPAnimateTyping),
              matching: find.byType(MPAnimateOpacity),
            ),
          )
          .opacity ==
      1;
}

void main() {
  testWidgets('gives a screen reader the whole string immediately', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hello there')));

    expect(semanticsLabels(tester), <String>['Hello there']);

    await tester.pumpWidget(const SizedBox());
    handle.dispose();
  });

  testWidgets('types the visible copy one character at a time, at its speed', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hello', speed: 10)));

    expect(_typed(tester), '');

    // The first character as soon as the delay is over, which is at once.
    await tester.pump(const Duration(milliseconds: 50));

    expect(_typed(tester), 'H');

    await tester.pump(const Duration(milliseconds: 200));

    expect(_typed(tester), 'Hel');

    await tester.pump(const Duration(seconds: 1));

    expect(_typed(tester), 'Hello');

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('advances by grapheme rather than by code unit', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateTyping(text: '👩‍👩‍👧a', speed: 10)));
    await tester.pump(const Duration(milliseconds: 50));

    expect(_typed(tester), '👩‍👩‍👧');

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('honours a duration as the time for the whole string', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateTyping(text: 'abcd', duration: Duration(milliseconds: 400))),
    );
    await tester.pump(const Duration(milliseconds: 150));

    expect(_typed(tester), 'ab');

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('waits empty rather than finished until it is triggered', (
    WidgetTester tester,
  ) async {
    Widget typing(bool play) {
      return host(
        MPAnimateTyping(text: 'Hi', trigger: MPAnimateTrigger.manual, play: play, speed: 10),
      );
    }

    await tester.pumpWidget(typing(false));
    await tester.pump(const Duration(seconds: 1));

    expect(_typed(tester), '');

    await tester.pumpWidget(typing(true));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 250));

    expect(_typed(tester), 'Hi');

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('holds where it is while paused, and goes on from there', (
    WidgetTester tester,
  ) async {
    Widget typing(bool paused) {
      return host(MPAnimateTyping(text: 'Hello', speed: 10, paused: paused));
    }

    await tester.pumpWidget(typing(false));
    await tester.pump(const Duration(milliseconds: 150));

    expect(_typed(tester), 'He');

    await tester.pumpWidget(typing(true));
    await tester.pump(const Duration(seconds: 1));

    expect(_typed(tester), 'He');

    // Letting go picks up at the next character.
    await tester.pumpWidget(typing(false));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 110));

    expect(_typed(tester), 'Hel');

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('deletes and types again on a repeat with erase', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateTyping(
          text: 'ab',
          speed: 10,
          repeat: 2,
          erase: true,
          hold: Duration(milliseconds: 500),
          // The caret blinks for ever, which would hide whether the typing stopped.
          caret: false,
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 150));

    expect(_typed(tester), 'ab');

    // Held for half a second, then deleted at twice the speed.
    await tester.pump(const Duration(milliseconds: 470));

    expect(_typed(tester), 'a');

    await tester.pump(const Duration(milliseconds: 50));

    expect(_typed(tester), '');

    await tester.pump(const Duration(seconds: 1));

    expect(_typed(tester), 'ab');
    expect(await redrawsIn(tester), isFalse);
  });

  testWidgets('lays the box out for the finished string from the first frame', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hello there', speed: 10)));

    final Size first = tester.getSize(find.byType(MPAnimateTyping));

    await tester.pump(const Duration(seconds: 2));

    expect(tester.getSize(find.byType(MPAnimateTyping)), first);

    await tester.pumpWidget(const SizedBox());
  });

  group('caret', () {
    testWidgets('blinks after the text by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hi')));

      expect(find.text('|'), findsOneWidget);
      expect(_caretOn(tester), isTrue);

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 700));

      expect(_caretOn(tester), isFalse);

      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('can be turned off or redrawn', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hi', caret: false)));

      expect(find.text('|'), findsNothing);

      await tester.pumpWidget(host(const MPAnimateTyping(text: 'Hi', caretChar: '_')));

      expect(find.text('_'), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
    });
  });

  testWidgets('is simply there under reduced motion, its caret still', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const MPAnimateTyping(text: 'Hello', trigger: MPAnimateTrigger.manual),
        disableAnimations: true,
      ),
    );

    expect(_typed(tester), 'Hello');
    expect(_caretOn(tester), isTrue);
    expect(await redrawsIn(tester), isFalse);
  });
}
