/// The ways the platform writes into a text field that does not have the focus,
/// sent the way the engine sends them.
///
/// A field that cannot take the focus never holds a connection to the keyboard,
/// which keeps typing, pasting and a screen reader's set-text out of it. These
/// two reach an editor without one, so a field that has to take no text is
/// asked about them as well.
library;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// Sends [method] to the framework's text input as the engine does, and returns
/// what the framework answers.
Future<Object?> sendTextInput(WidgetTester tester, String method, [Object? arguments]) async {
  ByteData? answer;

  await tester.binding.defaultBinaryMessenger.handlePlatformMessage(
    SystemChannels.textInput.name,
    SystemChannels.textInput.codec.encodeMethodCall(MethodCall(method, arguments)),
    (ByteData? data) => answer = data,
  );

  return answer == null ? null : SystemChannels.textInput.codec.decodeEnvelope(answer!);
}

/// Autofills the editors in [values] with their text, as the platform fills the
/// fields of an `AutofillGroup` while one of them has the keyboard: by the
/// autofill id of each, whether or not it has the focus.
Future<void> autofill(WidgetTester tester, Map<Finder, String> values) async {
  await sendTextInput(tester, 'TextInputClient.updateEditingStateWithTag', <Object?>[
    -1,
    <String, Object?>{
      for (final MapEntry<Finder, String> entry in values.entries)
        tester.state<EditableTextState>(entry.key).autofillId: TextEditingValue(
          text: entry.value,
          selection: TextSelection.collapsed(offset: entry.value.length),
        ).toJSON(),
    },
  ]);
  await tester.pump();
}

/// Puts an iPad pen down on [editor], as iOS does: it asks which text inputs are
/// under the pen, and hands the focus to each one it is offered.
///
/// Returns how many it was offered. Only an iOS target offers any.
Future<int> scribble(WidgetTester tester, Finder editor) async {
  final Rect box = tester.getRect(editor);
  final Object? under = await sendTextInput(
    tester,
    'TextInputClient.requestElementsInRect',
    <double>[box.left, box.top, box.width, box.height],
  );
  final List<Object?> offered = under is List<Object?> ? under : const <Object?>[];

  for (final Object? element in offered) {
    await sendTextInput(tester, 'TextInputClient.focusElement', <Object?>[
      (element! as List<Object?>).first,
      box.center.dx,
      box.center.dy,
    ]);
  }

  await tester.pump();

  return offered.length;
}
