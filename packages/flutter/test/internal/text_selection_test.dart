import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/number_field/mp_number_field.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/text_selection.dart';

import '../support/host.dart';

/// The selection handles and the menu a touch platform puts round a selection,
/// on a field inside an `Overlay`, which is where an app's fields always are.

/// A field that keeps what is typed, as a parent would.
class _Field extends StatefulWidget {
  const _Field({this.initial = '', this.disabled = false});

  final String initial;
  final bool disabled;

  @override
  State<_Field> createState() => _FieldState();
}

class _FieldState extends State<_Field> {
  late String _value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPTextField(
      label: const Text('Name'),
      value: _value,
      disabled: widget.disabled,
      onChanged: (String next) => setState(() => _value = next),
    );
  }
}

EditableTextState _editor(WidgetTester tester) {
  return tester.state<EditableTextState>(find.byType(EditableText));
}

/// Where the second letter of the field's text is on screen: inside the first
/// word, which is what a long press selects.
Offset _onText(WidgetTester tester) {
  final RenderEditable editable = _editor(tester).renderEditable;

  return editable.localToGlobal(
    editable.getLocalRectForCaret(const TextPosition(offset: 1)).center,
  );
}

/// Answers the clipboard channel with [text], and records what is copied.
void _mockClipboard(WidgetTester tester, {String text = '', List<String>? copied}) {
  tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (
    MethodCall call,
  ) async {
    switch (call.method) {
      case 'Clipboard.getData':
        return <String, dynamic>{'text': text};
      case 'Clipboard.hasStrings':
        return <String, dynamic>{'value': text.isNotEmpty};
      case 'Clipboard.setData':
        copied?.add((call.arguments as Map<Object?, Object?>)['text']! as String);
        return null;
    }

    return null;
  });
  addTearDown(() {
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, null);
  });
}

void main() {
  const TargetPlatformVariant mobile = TargetPlatformVariant(<TargetPlatform>{
    TargetPlatform.android,
    TargetPlatform.iOS,
  });

  group('on a phone', () {
    testWidgets('a tap focuses the field and typing reaches the parent', variant: mobile, (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(overlay: true, width: 300, const _Field()));

      await tester.tap(find.byType(EditableText));
      await tester.pump();
      expect(_editor(tester).widget.focusNode.hasFocus, isTrue);

      await tester.enterText(find.byType(EditableText), 'Ada');
      await tester.pump();
      expect(_editor(tester).widget.controller.text, 'Ada');
    });

    testWidgets('a long press selects the word, with handles and a menu', variant: mobile, (
      WidgetTester tester,
    ) async {
      _mockClipboard(tester, text: 'pasted');
      await tester.pumpWidget(
        host(overlay: true, width: 300, const _Field(initial: 'Ada Lovelace')),
      );

      await tester.longPressAt(_onText(tester));
      await tester.pumpAndSettle();

      final EditableTextState editor = _editor(tester);

      expect(
        editor.widget.controller.selection,
        const TextSelection(baseOffset: 0, extentOffset: 3),
      );
      expect(editor.selectionOverlay?.handlesAreVisible, isTrue);
      expect(find.byType(MPTextSelectionToolbar), findsOneWidget);
      expect(find.text('Copy'), findsOneWidget);
      expect(find.text('Paste'), findsOneWidget);
    });

    testWidgets('the menu pastes what the clipboard holds', variant: mobile, (
      WidgetTester tester,
    ) async {
      _mockClipboard(tester, text: 'Lovelace');
      await tester.pumpWidget(host(overlay: true, width: 300, const _Field(initial: 'Ada')));

      await tester.longPressAt(_onText(tester));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Paste'));
      await tester.pumpAndSettle();

      expect(_editor(tester).widget.controller.text, 'Lovelace');
      expect(find.byType(MPTextSelectionToolbar), findsNothing);
    });

    testWidgets('the menu copies the selection', variant: mobile, (WidgetTester tester) async {
      final List<String> copied = <String>[];
      _mockClipboard(tester, copied: copied);
      await tester.pumpWidget(host(overlay: true, width: 300, const _Field(initial: 'Ada')));

      await tester.longPressAt(_onText(tester));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Copy'));
      await tester.pumpAndSettle();

      expect(copied, <String>['Ada']);
    });
  });

  group('on android', () {
    testWidgets(
      'the menu speaks the field’s language',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        registerMPMessages(<MPLocale>[ko]);
        addTearDown(resetMPMessages);
        _mockClipboard(tester, text: 'x');

        await tester.pumpWidget(
          host(
            overlay: true,
            width: 300,
            const MPLocaleProvider(
              locale: 'ko',
              child: _Field(initial: 'Ada'),
            ),
          ),
        );

        await tester.longPressAt(_onText(tester));
        await tester.pumpAndSettle();

        expect(find.text('붙여넣기'), findsOneWidget);
        expect(find.text('잘라내기'), findsOneWidget);
        expect(find.text('공유'), findsOneWidget);
      },
    );

    testWidgets(
      'a disabled field shows neither handles nor a menu',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        await tester.pumpWidget(
          host(overlay: true, width: 300, const _Field(initial: 'Ada', disabled: true)),
        );

        await tester.longPress(find.byType(EditableText), warnIfMissed: false);
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsNothing);
        expect(_editor(tester).selectionOverlay?.handlesAreVisible ?? false, isFalse);
      },
    );

    testWidgets(
      'the handles are Material’s drop, in primary',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _mockClipboard(tester);
        await tester.pumpWidget(host(overlay: true, width: 300, const _Field(initial: 'Ada')));

        await tester.longPressAt(_onText(tester));
        await tester.pumpAndSettle();

        final TextSelectionControls? controls = _editor(tester).widget.selectionControls;

        expect(controls, isA<MPTextSelectionControls>());
        expect(controls!.getHandleSize(20), const Size(22, 22));
      },
    );
    testWidgets(
      'the other fields that take text get the same menu',
      variant: TargetPlatformVariant.only(TargetPlatform.android),
      (WidgetTester tester) async {
        _mockClipboard(tester, text: '7');
        await tester.pumpWidget(
          host(
            overlay: true,
            width: 300,
            const MPNumberField(label: Text('Quantity'), initialValue: 1234),
          ),
        );

        await tester.longPressAt(_onText(tester));
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsOneWidget);
        expect(_editor(tester).selectionOverlay?.handlesAreVisible, isTrue);
      },
    );
  });

  group('on macos', () {
    testWidgets(
      'a right click opens the menu and no handles are drawn',
      variant: TargetPlatformVariant.only(TargetPlatform.macOS),
      (WidgetTester tester) async {
        _mockClipboard(tester, text: 'x');
        await tester.pumpWidget(host(overlay: true, width: 300, const _Field(initial: 'Ada')));

        await tester.tap(find.byType(EditableText));
        await tester.pump();
        await tester.tap(find.byType(EditableText), buttons: kSecondaryMouseButton);
        await tester.pumpAndSettle();

        expect(find.byType(MPTextSelectionToolbar), findsOneWidget);
        expect(_editor(tester).widget.selectionControls?.getHandleSize(20), Size.zero);
      },
    );
  });
}
