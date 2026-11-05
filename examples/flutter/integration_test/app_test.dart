/// The flows in `flows.dart`, on a real device, a simulator or an emulator.
///
/// ```bash
/// flutter drive --driver test_driver/integration_test.dart \
///   --target integration_test/app_test.dart --keep-app-running -d <device>
/// ```
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'flows.dart';
import 'support.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  registerMPMessages(mpLocales);

  defineFlows(shot: (WidgetTester tester, String name) => saveShot(tester, 'app-$name'));
}
