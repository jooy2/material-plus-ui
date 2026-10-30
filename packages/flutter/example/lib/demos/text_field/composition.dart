import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The parent that breaks a naively controlled field: it upper-cases
/// everything it is handed, so every keystroke comes back as a different string
/// from the one the input method is holding.
///
/// Type a Korean word here. The syllable being composed stays intact, and only
/// once it is committed does the parent's rule apply.
class TextFieldComposition extends StatefulWidget {
  const TextFieldComposition({super.key});

  @override
  State<TextFieldComposition> createState() => _TextFieldCompositionState();
}

class _TextFieldCompositionState extends State<TextFieldComposition> {
  String _value = '';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          MPTextField(
            label: const Text('이름 / Name'),
            value: _value,
            onChanged: (String next) => setState(() => _value = next.toUpperCase()),
            placeholder: '한글을 입력해 보세요',
            fullWidth: true,
          ),
          MPTypography(
            'Parent state: ${_value.isEmpty ? '(empty)' : _value}',
            level: MPTypographyLevel.caption,
          ),
        ],
      ),
    );
  }
}
