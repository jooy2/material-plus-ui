import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// The barrel and the demo registry are written by `tool/generate.dart`, and a
/// component or a demo that was added without running it again is a component
/// nobody can import or a preview the documentation site cannot find.
void main() {
  test('the generated files are up to date', () async {
    final ProcessResult result = await Process.run('dart', <String>[
      'run',
      'tool/generate.dart',
      '--check',
    ]);

    expect(result.exitCode, 0, reason: '${result.stderr}');
  });
}
