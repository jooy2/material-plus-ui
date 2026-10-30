/// A body that animates for as long as it is allowed to.
///
/// A spinner or a looping animation left in a body nobody can see goes on
/// asking for frames that are never drawn. What stops it is a [TickerMode] that
/// is off, which mutes every ticker under it. Counting the frames this widget is
/// handed is how a test asks whether the body it sits in was muted.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// Loops forever, and counts every frame it is handed.
class Ticking extends StatefulWidget {
  /// Creates a looping body.
  const Ticking({super.key});

  @override
  State<Ticking> createState() => TickingState();
}

/// Where the count is kept.
class TickingState extends State<Ticking> with SingleTickerProviderStateMixin {
  late final AnimationController _loop = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  );

  /// How many frames the loop has been handed.
  int ticks = 0;

  @override
  void initState() {
    super.initState();
    _loop
      ..addListener(() => ticks += 1)
      ..repeat();
  }

  @override
  void dispose() {
    _loop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => const SizedBox(width: 10, height: 10);
}

/// How many frames the one [Ticking] in the tree has been handed, whether or
/// not it is on stage.
int ticksOf(WidgetTester tester) =>
    tester.state<TickingState>(find.byType(Ticking, skipOffstage: false)).ticks;
