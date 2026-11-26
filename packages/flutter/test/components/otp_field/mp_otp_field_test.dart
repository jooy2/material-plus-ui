import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/otp_field/mp_otp_field.dart';
import 'package:material_plus_ui/src/internal/text_selection.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPOtpField`. A slot is a box drawn over
/// one hidden editor, so the boxes are read off their decorations and the code
/// off the editor's controller.

class _Parent extends StatefulWidget {
  const _Parent({this.charset = MPOtpFieldCharset.numeric, this.onInvalid});

  final MPOtpFieldCharset charset;
  final ValueChanged<String>? onInvalid;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  String code = '';

  @override
  Widget build(BuildContext context) {
    return MPOtpField(
      label: const Text('Code'),
      length: 4,
      charset: widget.charset,
      value: code,
      onValueInvalid: widget.onInvalid,
      onChanged: (String next) => setState(() => code = next),
    );
  }
}

/// Every slot's box, in order.
List<AnimatedContainer> _slots(WidgetTester tester) {
  return tester
      .widgetList<AnimatedContainer>(
        find.descendant(of: find.byType(MPOtpField), matching: find.byType(AnimatedContainer)),
      )
      .toList();
}

Border _edgeOf(AnimatedContainer slot) => (slot.decoration! as BoxDecoration).border! as Border;

/// Answers the clipboard channel with [text], or refuses to read it, as a
/// browser does before the reader has allowed it.
void _clipboard(WidgetTester tester, String text, {bool refused = false}) {
  tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (
    MethodCall call,
  ) async {
    if (refused && call.method.startsWith('Clipboard.')) {
      throw PlatformException(code: 'NotAllowedError');
    }

    return switch (call.method) {
      'Clipboard.getData' => <String, dynamic>{'text': text},
      'Clipboard.hasStrings' => <String, dynamic>{'value': text.isNotEmpty},
      _ => null,
    };
  });
  addTearDown(() {
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, null);
  });
}

String _code(WidgetTester tester) {
  return tester.state<EditableTextState>(find.byType(EditableText)).widget.controller.text;
}

Future<void> _type(WidgetTester tester, String text) async {
  await tester.tap(find.byType(MPOtpField));
  await tester.pump();
  tester.testTextInput.enterText(text);
  await tester.pump();
}

/// What an input method has written while a composition is open: the whole
/// code, with the caret at the end of the part still being composed.
TextEditingValue _composing(String text, int start, int end) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: end),
    composing: TextRange(start: start, end: end),
  );
}

/// What it has written once nothing is being composed.
TextEditingValue _committed(String text) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: text.length),
  );
}

/// What the Windows engine sends as a composition starts: the code as it was,
/// with an empty composition at the caret.
TextEditingValue _compositionStarts(String text) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: text.length),
    composing: TextRange.collapsed(text.length),
  );
}

TextEditingValue _editing(WidgetTester tester) {
  return tester.state<EditableTextState>(find.byType(EditableText)).widget.controller.value;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('draws six slots by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'))));

      expect(_slots(tester), hasLength(6));
    });

    testWidgets('draws as many slots as it is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), length: 4)));

      expect(_slots(tester), hasLength(4));
    });

    testWidgets('clamps the length to something worth splitting', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), length: 1)));
      expect(_slots(tester), hasLength(2));

      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), length: 40)));
      expect(_slots(tester), hasLength(12));
    });

    testWidgets('puts the label above the row rather than in a notch', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'))));

      expect(
        tester.getBottomLeft(find.text('Code')).dy,
        lessThanOrEqualTo(tester.getTopLeft(find.byType(AnimatedContainer).first).dy),
      );
    });

    testWidgets('draws a separator every groupSize slots and no more', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), groupSize: 3)));

      expect(find.text('–'), findsOneWidget);

      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), groupSize: 2)));

      expect(find.text('–'), findsNWidgets(2));
    });

    testWidgets('draws the outlined field’s hairline in `outline`', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'))));

      expect(_edgeOf(_slots(tester).first).top.color, light.outline);
      expect(_edgeOf(_slots(tester).first).top.width, 1);
    });
  });

  group('typing', () {
    testWidgets('reports the value as it is typed', (WidgetTester tester) async {
      String? received;

      await tester.pumpWidget(
        host(
          MPOtpField(
            label: const Text('Code'),
            length: 4,
            onChanged: (String next) => received = next,
          ),
        ),
      );
      await _type(tester, '12');

      expect(received, '12');
      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
    });

    testWidgets('drives a controlled parent end to end', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent()));
      await _type(tester, '1234');

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, '1234');
    });

    testWidgets('fires once the last slot is filled', (WidgetTester tester) async {
      final List<String> completed = <String>[];

      await tester.pumpWidget(
        host(MPOtpField(label: const Text('Code'), length: 4, onComplete: completed.add)),
      );

      await _type(tester, '123');
      expect(completed, isEmpty);

      tester.testTextInput.enterText('1234');
      await tester.pump();
      expect(completed, <String>['1234']);
    });

    testWidgets('drops characters the charset rejects, and says so', (WidgetTester tester) async {
      final List<String> rejected = <String>[];

      await tester.pumpWidget(host(_Parent(onInvalid: rejected.add)));
      await _type(tester, '12ab');

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, '12');
      expect(rejected, isNotEmpty);
    });

    testWidgets('accepts letters once the charset allows them', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(charset: MPOtpFieldCharset.alphanumeric)));
      await _type(tester, 'a1b2');

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, 'a1b2');
    });

    testWidgets('takes no more characters than it has slots', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent()));
      await _type(tester, '123456');

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, '1234');
    });
  });

  // In the order the Windows engine sends them: an empty composition as one
  // starts, and a syllable the Korean input method finishes arriving with the
  // one it starts next.
  group('while an input method composes', () {
    testWidgets('with charset any, takes a reading longer than the slots left until it ends', (
      WidgetTester tester,
    ) async {
      // Held to the slots, the row would turn zho away while the input method
      // went on composing it.
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        final List<String> changes = <String>[];

        await tester.pumpWidget(
          host(
            MPOtpField(
              label: const Text('Code'),
              length: 4,
              charset: MPOtpFieldCharset.any,
              onChanged: changes.add,
            ),
          ),
        );
        await _type(tester, '12');

        const String reading = 'zhongguo';

        for (final TextEditingValue value in <TextEditingValue>[
          _compositionStarts('12'),
          for (int typed = 1; typed <= reading.length; typed++)
            _composing('12${reading.substring(0, typed)}', 2, 2 + typed),
          _composing('12中国', 2, 4),
        ]) {
          tester.testTextInput.updateEditingValue(value);
          await tester.pump();

          expect(_editing(tester), value, reason: 'the input method holds "${value.text}"');
        }

        tester.testTextInput.updateEditingValue(_committed('12中国'));
        await tester.pumpAndSettle();

        expect(_editing(tester), _committed('12中国'));
        expect(changes.last, '12中国');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('with digits, drops a syllable and leaves nothing being composed', (
      WidgetTester tester,
    ) async {
      // Why the other charsets keep the platform's own limit: what an input
      // method composes never gets past the charset, and the row is sent back
      // with no composition for the next syllable to land on.
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        final List<String> rejected = <String>[];

        await tester.pumpWidget(host(_Parent(onInvalid: rejected.add)));
        await _type(tester, '12');
        tester.testTextInput.log.clear();

        tester.testTextInput.updateEditingValue(_composing('12ㅁ', 2, 3));
        await tester.pump();

        expect(_editing(tester), _committed('12'));
        expect(rejected, <String>['12ㅁ']);

        final MethodCall sent = tester.testTextInput.log.lastWhere(
          (MethodCall call) => call.method == 'TextInput.setEditingState',
        );

        expect(
          sent.arguments,
          allOf(
            containsPair('text', '12'),
            containsPair('composingBase', -1),
            containsPair('composingExtent', -1),
          ),
        );
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  group('a full row', () {
    testWidgets('puts a key pressed in it in the last slot, and completes again', (
      WidgetTester tester,
    ) async {
      final List<String> completed = <String>[];

      await tester.pumpWidget(
        host(MPOtpField(label: const Text('Code'), length: 4, onComplete: completed.add)),
      );
      await _type(tester, '1234');

      tester.testTextInput.enterText('12345');
      await tester.pump();

      expect(_code(tester), '1235');
      expect(completed, <String>['1234', '1235']);
    });

    testWidgets('puts the first character of a paste in the last slot', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Parent()));
      await _type(tester, '1234');

      tester.testTextInput.enterText('123456');
      await tester.pump();

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, '1235');
    });

    testWidgets('keeps its last slot when the charset refuses the key', (
      WidgetTester tester,
    ) async {
      final List<String> rejected = <String>[];

      await tester.pumpWidget(host(_Parent(onInvalid: rejected.add)));
      await _type(tester, '1234');

      tester.testTextInput.enterText('1234a');
      await tester.pump();

      expect(tester.state<_ParentState>(find.byType(_Parent)).code, '1234');
      expect(rejected, <String>['1234a']);
    });

    for (final (TargetPlatform platform, String name) in <(TargetPlatform, String)>[
      (TargetPlatform.windows, 'Windows'),
      (TargetPlatform.macOS, 'macOS'),
    ]) {
      testWidgets('on $name, composes a syllable started in it in the last slot', (
        WidgetTester tester,
      ) async {
        // The engine is told the composition now covers the last slot, so the
        // next key the input method sends is written there, as it is in the
        // React build. Windows finishes 글 and starts ㅁ in one update; macOS
        // finishes 글 on its own first.
        debugDefaultTargetPlatformOverride = platform;

        try {
          final bool windows = platform == TargetPlatform.windows;

          await tester.pumpWidget(
            host(MPOtpField(label: const Text('Code'), length: 2, charset: MPOtpFieldCharset.any)),
          );
          await tester.showKeyboard(find.byType(EditableText));
          await tester.pump();

          for (final TextEditingValue value in <TextEditingValue>[
            if (windows) _compositionStarts(''),
            _composing('한', 0, 1),
            if (!windows) _committed('한'),
            _composing('한글', 1, 2),
            if (!windows) _committed('한글'),
          ]) {
            tester.testTextInput.updateEditingValue(value);
            await tester.pump();
          }

          tester.testTextInput.log.clear();
          tester.testTextInput.updateEditingValue(_composing('한글ㅁ', 2, 3));
          await tester.pump();

          expect(_editing(tester), _composing('한ㅁ', 1, 2));

          final MethodCall sent = tester.testTextInput.log.lastWhere(
            (MethodCall call) => call.method == 'TextInput.setEditingState',
          );

          expect(
            sent.arguments,
            allOf(
              containsPair('text', '한ㅁ'),
              containsPair('composingBase', 1),
              containsPair('composingExtent', 2),
            ),
          );

          tester.testTextInput.updateEditingValue(_composing('한마', 1, 2));
          await tester.pump();

          expect(_editing(tester), _composing('한마', 1, 2));

          tester.testTextInput.updateEditingValue(_committed('한마'));
          await tester.pumpAndSettle();

          expect(_editing(tester), _committed('한마'));
          expect(find.text('마'), findsOneWidget);
        } finally {
          debugDefaultTargetPlatformOverride = null;
        }
      });
    }
  });

  // A code is not complete while the input method can still change its last
  // character, except on Android, where Base UI makes the same exception.
  group('completing while an input method composes', () {
    Future<List<String>> pumpRow(WidgetTester tester, {required MPOtpFieldCharset charset}) async {
      final List<String> completed = <String>[];

      await tester.pumpWidget(
        host(
          MPOtpField(
            label: const Text('Code'),
            length: 2,
            charset: charset,
            onComplete: completed.add,
          ),
        ),
      );
      await tester.showKeyboard(find.byType(EditableText));
      await tester.pump();

      return completed;
    }

    Future<void> send(WidgetTester tester, List<TextEditingValue> values) async {
      for (final TextEditingValue value in values) {
        tester.testTextInput.updateEditingValue(value);
        await tester.pump();
      }
    }

    testWidgets('on Windows, waits for the last syllable to be finished', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        final List<String> completed = await pumpRow(tester, charset: MPOtpFieldCharset.any);

        await send(tester, <TextEditingValue>[
          _compositionStarts(''),
          _composing('ㅎ', 0, 1),
          _composing('하', 0, 1),
          _composing('한', 0, 1),
          _composing('한ㄱ', 1, 2),
          _composing('한그', 1, 2),
          _composing('한글', 1, 2),
        ]);

        expect(completed, isEmpty);

        await send(tester, <TextEditingValue>[_committed('한글')]);

        expect(completed, <String>['한글']);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('on macOS, waits for the last syllable to be finished', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.macOS;

      try {
        final List<String> completed = await pumpRow(tester, charset: MPOtpFieldCharset.any);

        await send(tester, <TextEditingValue>[
          _composing('ㅎ', 0, 1),
          _composing('하', 0, 1),
          _composing('한', 0, 1),
          _committed('한'),
          _composing('한ㄱ', 1, 2),
          _composing('한그', 1, 2),
          _composing('한글', 1, 2),
        ]);

        expect(completed, isEmpty);

        await send(tester, <TextEditingValue>[_committed('한글')]);

        expect(completed, <String>['한글']);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('on Android, completes as it is composed, and only once', (
      WidgetTester tester,
    ) async {
      // A keyboard that composes every word would otherwise hold the code back
      // until the field loses the focus.
      debugDefaultTargetPlatformOverride = TargetPlatform.android;

      try {
        final List<String> completed = await pumpRow(tester, charset: MPOtpFieldCharset.alpha);

        await send(tester, <TextEditingValue>[_composing('a', 0, 1), _composing('ab', 0, 2)]);

        expect(completed, <String>['ab']);

        await send(tester, <TextEditingValue>[_committed('ab')]);

        expect(completed, <String>['ab']);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('shows a parent that turned the composition down once it ends', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.macOS;

      try {
        final List<String> changes = <String>[];

        await tester.pumpWidget(
          host(
            MPOtpField(
              label: const Text('Code'),
              length: 2,
              charset: MPOtpFieldCharset.any,
              value: '',
              onChanged: changes.add,
            ),
          ),
        );
        await tester.showKeyboard(find.byType(EditableText));
        await tester.pump();

        await send(tester, <TextEditingValue>[_composing('한', 0, 1)]);

        expect(_editing(tester).text, '한');

        tester.testTextInput.updateEditingValue(_committed('한'));
        await tester.pumpAndSettle();

        expect(changes, <String>['한', '한']);
        expect(_editing(tester).text, '');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  group('states', () {
    testWidgets('shows an error message and turns every slot over', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPOtpField(label: Text('Code'), errorMessage: Text('That code expired.'))),
      );

      expect(styleOf(tester, 'That code expired.').color, light.error);
      expect(_edgeOf(_slots(tester).first).top.color, light.error);
    });

    testWidgets('lets the error replace the description', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPOtpField(
            label: Text('Code'),
            description: Text('Six digits.'),
            errorMessage: Text('That code expired.'),
          ),
        ),
      );

      expect(find.text('That code expired.'), findsOneWidget);
      expect(find.text('Six digits.'), findsNothing);
    });

    testWidgets('disables every slot', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), disabled: true)));

      await tester.tap(find.byType(MPOtpField));
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
    });

    testWidgets('masks the characters when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), mask: true)));
      await _type(tester, '12');

      expect(find.text('1'), findsNothing);
      expect(find.text('•'), findsNWidgets(2));
    });

    testWidgets('rings the slot the next character goes into without moving any', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), length: 4)));

      final Rect before = tester.getRect(find.byType(AnimatedContainer).at(1));

      await _type(tester, '1');
      await tester.pumpAndSettle();

      expect(_edgeOf(_slots(tester)[1]).top.color, light.primary);
      expect(_edgeOf(_slots(tester)[1]).top.width, 2);
      expect(_edgeOf(_slots(tester)[0]).top.width, 1);
      expect(tester.getRect(find.byType(AnimatedContainer).at(1)), before);
    });
  });

  group('the size ladder', () {
    testWidgets('grows on the control heights a field is drawn at', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPOtpField(label: const Text('Code'), size: size)));
        heights.add(tester.getSize(find.byType(AnimatedContainer).first).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('narrows its slots to fit a row too small for them, and keeps them level', (
      WidgetTester tester,
    ) async {
      // Six medium slots and their gaps are 328 wide: more than a 360 phone
      // leaves inside 24px margins.
      await tester.pumpWidget(
        host(const SizedBox(width: 312, child: MPOtpField(label: Text('Code'), groupSize: 3))),
      );

      expect(tester.takeException(), isNull);

      final Rect field = tester.getRect(find.byType(MPOtpField));
      final List<Rect> slots = <Rect>[
        for (final Element slot in find.byType(AnimatedContainer).evaluate())
          tester.getRect(find.byWidget(slot.widget)),
      ];

      expect(slots.last.right, lessThanOrEqualTo(field.right));
      expect(slots.first.width, lessThan(48));
      for (final Rect slot in slots) {
        expect(slot.width, moreOrLessEquals(slots.first.width));
      }

      expect(slots.first.height, 56);
    });

    testWidgets('keeps its slots at their rung where there is room', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const SizedBox(width: 600, child: MPOtpField(label: Text('Code')))),
      );

      expect(tester.getSize(find.byType(AnimatedContainer).first), const Size(48, 56));
    });

    testWidgets('draws a slot narrower than it is tall', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'))));

      final Size slot = tester.getSize(find.byType(AnimatedContainer).first);

      expect(slot.width, lessThan(slot.height));
    });
  });

  group('semantics', () {
    testWidgets('is one text field holding the code, named by its label', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPOtpField(label: Text('Code'), length: 4)));
      await _type(tester, '12');

      expect(semanticsTextFields(tester), hasLength(1));
      expect(
        semanticsOf(tester, find.byType(MPOtpField)),
        isSemantics(isTextField: true, label: 'Code', value: '12', isFocused: true),
      );

      handle.dispose();
    });
  });

  group('the paste menu', () {
    const TargetPlatformVariant touch = TargetPlatformVariant(<TargetPlatform>{
      TargetPlatform.android,
      TargetPlatform.iOS,
    });

    testWidgets('a long press offers Paste, which fills the slots', variant: touch, (
      WidgetTester tester,
    ) async {
      _clipboard(tester, '4821');
      await tester.pumpWidget(host(overlay: true, const _Parent()));

      await tester.longPress(find.byType(MPOtpField));
      await tester.pumpAndSettle();

      expect(find.byType(MPTextSelectionToolbar), findsOneWidget);

      // Over the row, not over the slots it is pasting into.
      final Rect menu = tester.getRect(
        find
            .descendant(
              of: find.byType(MPTextSelectionToolbar),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );

      expect(
        menu.bottom,
        lessThanOrEqualTo(tester.getRect(find.byType(AnimatedContainer).first).top),
      );

      await tester.tap(find.text('Paste'));
      await tester.pumpAndSettle();

      expect(_code(tester), '4821');
      expect(find.byType(MPTextSelectionToolbar), findsNothing);
    });

    testWidgets(
      'a paste goes through the charset and the length',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        final List<String> rejected = <String>[];
        _clipboard(tester, '48-21 99');
        await tester.pumpWidget(host(overlay: true, _Parent(onInvalid: rejected.add)));

        await tester.longPress(find.byType(MPOtpField));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Paste'));
        await tester.pumpAndSettle();

        expect(_code(tester), '4821');
        expect(rejected, isNotEmpty);
      },
    );

    testWidgets(
      'an empty clipboard opens no menu',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _clipboard(tester, '');
        await tester.pumpWidget(host(overlay: true, const _Parent()));

        await tester.longPress(find.byType(MPOtpField));
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsNothing);
      },
    );

    testWidgets(
      'a clipboard the platform will not read still offers Paste, which then does nothing',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _clipboard(tester, '4821', refused: true);
        await tester.pumpWidget(host(overlay: true, const _Parent()));
        // The editor's own clipboard check, which the framework reports as the
        // editor is built, for every text field. What follows is the menu's.
        expect(tester.takeException(), isA<PlatformException>());

        await tester.longPress(find.byType(MPOtpField));
        await tester.pumpAndSettle();
        expect(find.byType(MPTextSelectionToolbar), findsOneWidget);

        await tester.tap(find.text('Paste'));
        await tester.pumpAndSettle();

        expect(_code(tester), '');
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'a disabled or read-only field opens no menu',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _clipboard(tester, '4821');

        for (final MPOtpField field in <MPOtpField>[
          const MPOtpField(label: Text('Code'), length: 4, disabled: true),
          const MPOtpField(label: Text('Code'), length: 4, readOnly: true),
        ]) {
          await tester.pumpWidget(host(overlay: true, field));
          await tester.longPress(find.byType(MPOtpField), warnIfMissed: false);
          await tester.pumpAndSettle();

          expect(find.byType(MPTextSelectionToolbar), findsNothing);
        }
      },
    );

    testWidgets(
      'a press outside the menu closes it',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _clipboard(tester, '4821');
        // The surface a `WidgetsApp` puts round every app, which is what tells a
        // tap region where a press landed, over a page that takes the press.
        await tester.pumpWidget(
          TapRegionSurface(
            child: ColoredBox(
              color: const Color(0xFFFFFFFF),
              child: host(overlay: true, const _Parent()),
            ),
          ),
        );

        await tester.longPress(find.byType(MPOtpField));
        await tester.pumpAndSettle();
        await tester.tapAt(const Offset(4, 4));
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsNothing);
        expect(_code(tester), '');
      },
    );

    testWidgets(
      'a right click opens it with a mouse, and Paste still lands',
      variant: TargetPlatformVariant.only(TargetPlatform.macOS),
      (WidgetTester tester) async {
        _clipboard(tester, '4821');
        await tester.pumpWidget(host(overlay: true, const _Parent()));

        await tester.tap(find.byType(MPOtpField), buttons: kSecondaryMouseButton);
        await tester.pumpAndSettle();
        expect(find.byType(MPTextSelectionToolbar), findsOneWidget);

        await tester.tap(find.text('Paste'), kind: PointerDeviceKind.mouse);
        await tester.pumpAndSettle();

        expect(_code(tester), '4821');
      },
    );

    testWidgets(
      'a screen reader\'s long press opens it too',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        final SemanticsHandle handle = tester.ensureSemantics();
        _clipboard(tester, '4821');
        await tester.pumpWidget(host(overlay: true, const _Parent()));

        final SemanticsNode field = semanticsOf(tester, find.byType(MPOtpField));

        expect(field.getSemanticsData().hasAction(SemanticsAction.longPress), isTrue);

        tester
            .renderObject(find.byType(MPOtpField))
            .owner!
            .semanticsOwner!
            .performAction(field.id, SemanticsAction.longPress);
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsOneWidget);

        handle.dispose();
      },
    );
  });
}
