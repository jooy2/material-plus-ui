import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TextFieldStates extends StatefulWidget {
  const TextFieldStates({super.key});

  @override
  State<TextFieldStates> createState() => _TextFieldStatesState();
}

class _TextFieldStatesState extends State<TextFieldStates> {
  String _email = 'not-an-address';

  @override
  Widget build(BuildContext context) {
    final bool invalid = _email.isNotEmpty && !_email.contains('@');

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: <Widget>[
          MPTextField(
            label: const Text('Email'),
            value: _email,
            onChanged: (String next) => setState(() => _email = next),
            errorMessage: invalid ? 'Enter a valid email address.' : null,
            fullWidth: true,
          ),
          const MPTextField(
            label: Text('Account ID'),
            value: 'acc_8f21c4',
            readOnly: true,
            fullWidth: true,
          ),
          const MPTextField(
            label: Text('Plan'),
            value: 'Enterprise',
            disabled: true,
            fullWidth: true,
          ),
          const MPTextField(
            label: Text('Full name'),
            value: '',
            required: true,
            placeholder: 'Required',
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
