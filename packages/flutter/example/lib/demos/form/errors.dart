import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `errors` is the seam a server's answer comes back through.
///
/// It is keyed by the `name` of the field each message belongs to, so the
/// message lands on the field rather than in a banner at the top of the screen,
/// and it is cleared the moment that field changes, because an error about a
/// value nobody has any more is an error about nothing.
class FormErrors extends StatefulWidget {
  const FormErrors({super.key});

  @override
  State<FormErrors> createState() => _FormErrorsState();
}

class _FormErrorsState extends State<FormErrors> {
  final GlobalKey<MPFormState> _form = GlobalKey<MPFormState>();
  String _handle = 'ada';
  Map<String, String> _errors = const <String, String>{};

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: MPForm(
        key: _form,
        errors: _errors,
        onSubmit: (Map<String, Object?> values) => setState(() {
          _errors = values['handle'] == 'ada'
              ? const <String, String>{'handle': 'That handle is already taken'}
              : const <String, String>{};
        }),
        children: <Widget>[
          MPTextField(
            name: 'handle',
            label: const Text('Handle'),
            required: true,
            value: _handle,
            onChanged: (String next) => setState(() => _handle = next),
            fullWidth: true,
          ),
          MPButton(
            onPressed: () => _form.currentState!.submit(),
            fullWidth: true,
            child: const Text('Claim it'),
          ),
        ],
      ),
    );
  }
}
