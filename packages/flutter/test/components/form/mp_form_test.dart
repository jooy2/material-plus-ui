import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
import 'package:material_plus_ui/src/components/number_field/mp_number_field.dart';
import 'package:material_plus_ui/src/components/otp_field/mp_otp_field.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPForm`. A submit there is a press on a
/// `type="submit"` button; here it is [MPFormState.submit], or Enter in a
/// single-line field.

/// A text field that keeps its own value, as the React suite's `Field` does.
class _Field extends StatefulWidget {
  const _Field({required this.name, required this.label, this.required = false});

  final String name;
  final String label;
  final bool required;

  @override
  State<_Field> createState() => _FieldState();
}

class _FieldState extends State<_Field> {
  String value = '';

  @override
  Widget build(BuildContext context) {
    return MPTextField(
      name: widget.name,
      label: Text(widget.label),
      required: widget.required,
      value: value,
      fullWidth: true,
      onChanged: (String next) => setState(() => value = next),
    );
  }
}

Finder _editorOf(String label) {
  return find.descendant(
    of: find.ancestor(of: find.text(label), matching: find.byType(MPTextField)),
    matching: find.byType(EditableText),
  );
}

void main() {
  testWidgets('stacks its children with the ladder’s gap', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(children: <Widget>[SizedBox(height: 10), SizedBox(height: 10)]),
      ),
    );

    expect(tester.getSize(find.byType(MPForm)).height, 10 + 12 + 10);

    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          size: MPSize.lg,
          children: <Widget>[SizedBox(height: 10), SizedBox(height: 10)],
        ),
      ),
    );

    expect(tester.getSize(find.byType(MPForm)).height, 10 + 14 + 10);
  });

  testWidgets('hands over the values on a valid submit', (WidgetTester tester) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
    Map<String, Object?>? submitted;

    await tester.pumpWidget(
      host(
        width: 400,
        MPForm(
          key: form,
          onSubmit: (Map<String, Object?> values) => submitted = values,
          children: const <Widget>[
            _Field(name: 'email', label: 'Email'),
            MPNumberField(name: 'guests', label: Text('Guests'), initialValue: 2),
            MPOtpField(name: 'code', label: Text('Code'), initialValue: '123456'),
          ],
        ),
      ),
    );

    await tester.enterText(_editorOf('Email'), 'ada@example.com');
    await tester.pump();

    expect(form.currentState!.submit(), isTrue);
    expect(submitted, <String, Object?>{
      'email': 'ada@example.com',
      'guests': 2.0,
      'code': '123456',
    });
  });

  testWidgets('submits on Enter in a single-line field', (WidgetTester tester) async {
    int submits = 0;

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          onSubmit: (Map<String, Object?> values) => submits++,
          children: const <Widget>[_Field(name: 'email', label: 'Email')],
        ),
      ),
    );

    await tester.tap(_editorOf('Email'));
    await tester.pump();

    expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isTrue);
    expect(submits, 1);
  });

  testWidgets('does not submit while a field is invalid, and focuses it', (
    WidgetTester tester,
  ) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
    int submits = 0;

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          key: form,
          onSubmit: (Map<String, Object?> values) => submits++,
          children: const <Widget>[
            _Field(name: 'name', label: 'Name'),
            _Field(name: 'email', label: 'Email', required: true),
            _Field(name: 'phone', label: 'Phone', required: true),
          ],
        ),
      ),
    );

    expect(form.currentState!.submit(), isFalse);
    await tester.pump();

    expect(submits, 0);
    expect(find.text('Required'), findsNWidgets(2));
    expect(holdsFocus(tester, _editorOf('Email')), isTrue);
  });

  testWidgets('holds the submit back while a required code is incomplete', (
    WidgetTester tester,
  ) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();

    await tester.pumpWidget(
      host(
        width: 400,
        MPForm(
          key: form,
          children: const <Widget>[
            MPOtpField(name: 'code', label: Text('Code'), required: true, initialValue: '12'),
          ],
        ),
      ),
    );

    expect(form.currentState!.submit(), isFalse);
  });

  testWidgets('leaves a disabled field out', (WidgetTester tester) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
    Map<String, Object?>? submitted;

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          key: form,
          onSubmit: (Map<String, Object?> values) => submitted = values,
          children: const <Widget>[
            MPTextField(
              name: 'plan',
              label: Text('Plan'),
              value: '',
              required: true,
              disabled: true,
            ),
            MPTextField(name: 'team', label: Text('Team'), value: 'Core'),
          ],
        ),
      ),
    );

    expect(form.currentState!.submit(), isTrue);
    expect(submitted, <String, Object?>{'team': 'Core'});
  });

  testWidgets('puts an error from somewhere else back on the field it belongs to', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          errors: <String, String>{'email': 'That address is already taken'},
          children: <Widget>[_Field(name: 'email', label: 'Email')],
        ),
      ),
    );

    expect(find.text('That address is already taken'), findsOneWidget);
  });

  testWidgets('clears that error as soon as the field changes', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          errors: <String, String>{'email': 'That address is already taken'},
          children: <Widget>[_Field(name: 'email', label: 'Email')],
        ),
      ),
    );

    await tester.enterText(_editorOf('Email'), 'someone@example.com');
    await tester.pump();

    expect(find.text('That address is already taken'), findsNothing);
  });

  testWidgets('shows a new set of errors again', (WidgetTester tester) async {
    Widget build(Map<String, String> errors) => host(
      width: 300,
      MPForm(
        errors: errors,
        children: const <Widget>[_Field(name: 'email', label: 'Email')],
      ),
    );

    await tester.pumpWidget(build(const <String, String>{'email': 'Taken'}));
    await tester.enterText(_editorOf('Email'), 'b');
    await tester.pump();

    await tester.pumpWidget(build(const <String, String>{'email': 'Still taken'}));

    expect(find.text('Still taken'), findsOneWidget);
  });

  testWidgets('validates on submit rather than while somebody is still typing', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          children: <Widget>[_Field(name: 'email', label: 'Email', required: true)],
        ),
      ),
    );

    await tester.enterText(_editorOf('Email'), 'a');
    await tester.pump();
    await tester.enterText(_editorOf('Email'), '');
    await tester.pump();

    expect(find.text('Required'), findsNothing);
  });

  testWidgets('checks every change once a submit has failed', (WidgetTester tester) async {
    final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          key: form,
          children: const <Widget>[_Field(name: 'email', label: 'Email', required: true)],
        ),
      ),
    );

    form.currentState!.submit();
    await tester.pump();
    expect(find.text('Required'), findsOneWidget);

    await tester.enterText(_editorOf('Email'), 'a');
    await tester.pump();
    expect(find.text('Required'), findsNothing);
  });

  testWidgets('validates as a field is left in onBlur mode', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          validationMode: MPFormValidationMode.onBlur,
          children: <Widget>[
            _Field(name: 'email', label: 'Email', required: true),
            _Field(name: 'name', label: 'Name'),
          ],
        ),
      ),
    );

    await tester.tap(_editorOf('Email'));
    await tester.pump();
    expect(find.text('Required'), findsNothing);

    await tester.tap(_editorOf('Name'));
    await tester.pump();
    expect(find.text('Required'), findsOneWidget);
  });

  testWidgets('validates on every change in onChange mode', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPForm(
          validationMode: MPFormValidationMode.onChange,
          children: <Widget>[_Field(name: 'email', label: 'Email', required: true)],
        ),
      ),
    );

    await tester.enterText(_editorOf('Email'), 'a');
    await tester.pump();
    await tester.enterText(_editorOf('Email'), '');
    await tester.pump();

    expect(find.text('Required'), findsOneWidget);
  });

  testWidgets('is submitted by a complete code with autoSubmit', (WidgetTester tester) async {
    Map<String, Object?>? submitted;

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          onSubmit: (Map<String, Object?> values) => submitted = values,
          children: const <Widget>[
            MPOtpField(name: 'code', label: Text('Code'), length: 4, autoSubmit: true),
          ],
        ),
      ),
    );

    await tester.tap(find.byType(MPOtpField));
    await tester.pump();
    tester.testTextInput.enterText('4321');
    await tester.pump();

    expect(submitted, <String, Object?>{'code': '4321'});
  });

  testWidgets('is found by a button inside it', (WidgetTester tester) async {
    MPFormState? found;

    await tester.pumpWidget(
      host(
        width: 300,
        MPForm(
          children: <Widget>[
            Builder(
              builder: (BuildContext context) {
                found = MPForm.maybeOf(context);

                return const SizedBox();
              },
            ),
          ],
        ),
      ),
    );

    expect(found, isNotNull);
  });
}
