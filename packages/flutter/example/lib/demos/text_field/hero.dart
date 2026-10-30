import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class TextFieldHero extends StatefulWidget {
  const TextFieldHero({super.key});

  @override
  State<TextFieldHero> createState() => _TextFieldHeroState();
}

class _TextFieldHeroState extends State<TextFieldHero> {
  String _email = '';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: MPTextField(
        label: const Text('Email'),
        name: 'email',
        type: MPTextFieldType.email,
        autofillHints: const <String>[AutofillHints.email],
        placeholder: 'you@example.com',
        value: _email,
        onChanged: (String next) => setState(() => _email = next),
        startIcon: const MPIcon(icon: SearchGlyph(), size: 18),
        fullWidth: true,
      ),
    );
  }
}
