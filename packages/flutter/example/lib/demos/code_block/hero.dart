import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/code_tokens.dart';

class CodeBlockHero extends StatelessWidget {
  const CodeBlockHero({super.key});

  static const String _source = '''import { MPButton } from 'material-plus-ui';

export function Toolbar({ onSave }: { onSave: () => void }) {
  return (
    <MPButton variant="filled" onClick={onSave}>
      Save
    </MPButton>
  );
}''';

  static const String _shell = '''npm install material-plus-ui @base-ui/react
npm run dev''';

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          MPCodeBlock(
            code: _source,
            language: 'tsx',
            title: Text('src/Toolbar.tsx'),
            lineNumbers: true,
            markLines: '5-9',
            rawToggle: true,
            highlighter: demoHighlighter,
          ),
          MPCodeBlock(
            code: _shell,
            language: 'bash',
            prompt: r'$',
            theme: MPCodeBlockTheme.dark,
            showLanguage: false,
            highlighter: demoHighlighter,
          ),
        ],
      ),
    );
  }
}
