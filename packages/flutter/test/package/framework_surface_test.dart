import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// The package is built on `package:flutter/widgets.dart` alone. A file that
/// imports Material or Cupertino would bring a second design system into every
/// app that uses this one, and would break the day those libraries leave the
/// framework.
void main() {
  test('nothing in lib, test or the gallery imports Material or Cupertino', () {
    final RegExp forbidden = RegExp(
      r'''^import\s+['"]package:(flutter/(material|cupertino)\.dart|material_ui/|cupertino_ui/)''',
      multiLine: true,
    );
    final List<String> offenders = <String>[];

    for (final String folder in <String>['lib', 'test', 'example/lib', 'tool']) {
      final Directory directory = Directory(folder);

      if (!directory.existsSync()) {
        continue;
      }

      for (final FileSystemEntity file in directory.listSync(recursive: true)) {
        if (file is File &&
            file.path.endsWith('.dart') &&
            forbidden.hasMatch(file.readAsStringSync())) {
          offenders.add(file.path);
        }
      }
    }

    expect(offenders, isEmpty);
  });

  test('the package depends on nothing but Flutter', () {
    final String pubspec = File('pubspec.yaml').readAsStringSync();
    final String dependencies = RegExp(
      r'^dependencies:\n((?:  .*\n)+)',
      multiLine: true,
    ).firstMatch(pubspec)![1]!;

    expect(dependencies.trim(), 'flutter:\n    sdk: flutter');
  });
}
