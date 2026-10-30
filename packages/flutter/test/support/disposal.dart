/// What a widget made and never let go of once it left the tree.
///
/// A `State` that builds a disposable object over its controller and forgets to
/// dispose it leaks nothing a test can see: the controller clears its own
/// listeners as it goes, so the screen looks the same either way. What does
/// notice is Flutter's own record of the objects it makes and disposes, which a
/// debug build reports for every `ChangeNotifier`, `CurvedAnimation` and
/// `AnimationController`. Listening to that record is how a test asks the
/// question directly.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// How many objects of [className] were made while [build] ran, and how many
/// of them were still undisposed once the tree had been emptied after it.
Future<({int made, int kept})> disposalOf(
  WidgetTester tester,
  String className,
  Future<void> Function() build,
) async {
  final Set<Object> live = Set<Object>.identity();
  var made = 0;

  void listen(ObjectEvent event) {
    if (event is ObjectCreated && event.className == className) {
      made += 1;
      live.add(event.object);
    } else if (event is ObjectDisposed) {
      live.remove(event.object);
    }
  }

  FlutterMemoryAllocations.instance.addListener(listen);

  try {
    await build();
    await tester.pumpWidget(const SizedBox());
  } finally {
    FlutterMemoryAllocations.instance.removeListener(listen);
  }

  return (made: made, kept: live.length);
}
