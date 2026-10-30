import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

class TextFieldFloatingLabel extends StatefulWidget {
  const TextFieldFloatingLabel({super.key});

  @override
  State<TextFieldFloatingLabel> createState() => _TextFieldFloatingLabelState();
}

class _TextFieldFloatingLabelState extends State<TextFieldFloatingLabel> {
  String _floating = '';
  String _pinned = '';
  String _adorned = '';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: <Widget>[
          MPTextField(
            label: const Text('Email'),
            value: _floating,
            onChanged: (String next) => setState(() => _floating = next),
            fullWidth: true,
          ),
          MPTextField(
            label: const Text('Email'),
            value: _pinned,
            onChanged: (String next) => setState(() => _pinned = next),
            floatingLabel: false,
            fullWidth: true,
          ),
          MPTextField(
            label: const Text('Search'),
            value: _adorned,
            onChanged: (String next) => setState(() => _adorned = next),
            startIcon: const MPIcon(icon: SearchGlyph(), size: 20),
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
