import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TextFieldMultiline extends StatefulWidget {
  const TextFieldMultiline({super.key});

  @override
  State<TextFieldMultiline> createState() => _TextFieldMultilineState();
}

class _TextFieldMultilineState extends State<TextFieldMultiline> {
  String _bio = '';
  String _note = '';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: <Widget>[
          MPTextField(
            label: const Text('Bio'),
            value: _bio,
            onChanged: (String next) => setState(() => _bio = next),
            rows: 3,
            maxLength: 200,
            fullWidth: true,
          ),
          MPTextField(
            label: const Text('Notes'),
            value: _note,
            onChanged: (String next) => setState(() => _note = next),
            rows: 2,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
