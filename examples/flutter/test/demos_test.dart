/// Every demo the documentation shows, on the screens the app runs on.
///
/// The demos were written for a column about 700 wide on the documentation
/// site, and nothing else lays them out at the width of a phone.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui_example/demos/registry.dart';

import 'support/demo_host.dart';

const Map<String, Size> _screens = <String, Size>{
  'small phone': Size(360, 640),
  'phone': Size(402, 874),
  'tablet': Size(834, 1194),
};

void main() {
  setUpAll(prepareHost);

  for (final MapEntry<String, Size>(key: String label, value: Size size) in _screens.entries) {
    group(label, () {
      for (final MapEntry<String, WidgetBuilder>(key: String name, value: WidgetBuilder build)
          in demos.entries) {
        testWidgets(name, (WidgetTester tester) async {
          tester.view.physicalSize = size;
          tester.view.devicePixelRatio = 1;
          addTearDown(tester.view.reset);

          final List<String> errors = await collectErrors(() async {
            await tester.pumpWidget(screen(Builder(builder: build), size: size));
            await tester.pump(const Duration(milliseconds: 400));
            await tester.pump(const Duration(milliseconds: 400));
            await tester.pumpWidget(const SizedBox());
            await tester.pump(const Duration(seconds: 10));
          });

          expect(errors, isEmpty);
        });
      }
    });
  }
}
