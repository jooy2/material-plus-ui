/// Every demo the documentation shows, on a real device, a simulator or an
/// emulator.
///
/// ```bash
/// flutter drive --driver test_driver/integration_test.dart \
///   --target integration_test/demos_test.dart --keep-app-running -d <device>
/// ```
///
/// `--keep-app-running` keeps the app, and so the screenshots it saved, for
/// `tool/pull_screenshots.sh`. `--dart-define=MP_THEME=dark` runs the dark
/// theme, `--dart-define=MP_DEMOS=button,text-field` runs some of the
/// components, and `--dart-define=MP_OFFLINE=true` stops a picture the network
/// turned away from counting as a failure.
///
/// `test/demos_test.dart` runs the same check on the host at three widths; this
/// one is what shows how the device's own renderer draws a demo.
library;

import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/canvas.dart';
import 'package:material_plus_ui_example/demos/registry.dart';

import 'support.dart';

const String _theme = String.fromEnvironment('MP_THEME', defaultValue: 'light');
const String _only = String.fromEnvironment('MP_DEMOS');
const bool _offline = bool.fromEnvironment('MP_OFFLINE');

/// How long a demo gets to settle before its picture is taken. A picture off
/// the network needs longer on a slow line: `--dart-define=MP_SETTLE_MS=2000`.
const int _settleMs = int.fromEnvironment('MP_SETTLE_MS', defaultValue: 600);

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  registerMPMessages(mpLocales);

  testWidgets('every demo', (WidgetTester tester) async {
    final Brightness brightness = _theme == 'dark' ? Brightness.dark : Brightness.light;
    final Set<String>? wanted = _only.isEmpty ? null : _only.split(',').toSet();
    final Map<String, List<String>> failures = <String, List<String>>{};

    for (final MapEntry<String, WidgetBuilder>(key: String name, value: WidgetBuilder build)
        in demos.entries) {
      if (wanted != null && !wanted.contains(name.split('/').first)) {
        continue;
      }

      final List<String> errors = await collectErrors(() async {
        await tester.pumpWidget(
          Directionality(
            textDirection: TextDirection.ltr,
            child: DefaultTextStyle(
              style: const TextStyle(fontFamily: 'Roboto', package: 'material_plus_ui_example'),
              child: MPTheme(
                brightness: brightness,
                child: Overlay.wrap(
                  child: SafeArea(
                    child: MPCanvas(
                      key: ValueKey<String>(name),
                      child: Builder(builder: build),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
        // Real time rather than a pump, which holds back what a picture off the
        // network is waiting for.
        await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: _settleMs)));
        await tester.pump(const Duration(milliseconds: 16));
        // A picture that arrived in the wait fades in from the frame it is
        // first drawn in, so it gets the time to finish before the shot.
        await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 350)));
        await tester.pump(const Duration(milliseconds: 16));
        await saveShot(tester, '$_theme-$name');
        await tester.pumpWidget(const SizedBox());
      }, ignoreImages: _offline);

      if (errors.isNotEmpty) {
        failures[name] = errors;
      }
    }

    final String report = failures.entries
        .map((MapEntry<String, List<String>> one) => '${one.key}: ${one.value.join(' | ')}')
        .join('\n');

    await File('${shotDirectory.path}/$_theme-errors.txt').writeAsString('$report\n');
    expect(failures, isEmpty, reason: report);
  }, timeout: Timeout.none);
}
