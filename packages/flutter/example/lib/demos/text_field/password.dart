import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TextFieldPassword extends StatefulWidget {
  const TextFieldPassword({super.key});

  @override
  State<TextFieldPassword> createState() => _TextFieldPasswordState();
}

class _TextFieldPasswordState extends State<TextFieldPassword> {
  String _password = 'correct horse battery staple';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: MPTextField(
        label: const Text('Password'),
        name: 'password',
        type: MPTextFieldType.password,
        autofillHints: const <String>[AutofillHints.password],
        value: _password,
        onChanged: (String next) => setState(() => _password = next),
        fullWidth: true,
      ),
    );
  }
}
