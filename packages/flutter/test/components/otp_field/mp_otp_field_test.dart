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
