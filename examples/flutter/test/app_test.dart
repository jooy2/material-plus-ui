/// The app's flows on the host, at the size of a phone and of a tablet.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import '../integration_test/flows.dart';
import 'support/demo_host.dart';

void main() {
  setUpAll(prepareHost);

  for (final (String label, Size size, FakeViewPadding padding)
      in const <(String, Size, FakeViewPadding)>[
        ('phone', Size(402, 874), FakeViewPadding(top: 62, bottom: 34)),
        ('tablet', Size(834, 1194), FakeViewPadding(top: 24, bottom: 20)),
      ]) {
    group(label, () {
      setUp(() {
        final TestFlutterView view =
            TestWidgetsFlutterBinding.instance.platformDispatcher.views.first;

        view.physicalSize = size;
        view.devicePixelRatio = 1;
        view.padding = padding;
        view.viewPadding = padding;
        addTearDown(view.reset);
      });

      defineFlows(shot: (WidgetTester tester, String name) async {});
    });
  }
}
