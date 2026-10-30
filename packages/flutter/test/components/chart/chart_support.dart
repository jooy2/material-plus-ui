/// What the chart suites share: a canvas that records what a plot painted, and
/// the few gestures every chart is read with.
///
/// A browser test reads a chart's `<path>` and `<text>` elements off the DOM;
/// a widget test asks the plot's painter to paint into a canvas that keeps a
/// list of what it was asked to draw.
library;

import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/canvas.dart';
import '../../support/host.dart';

/// A [RecordingCanvas] that also keeps the rectangles it was handed, which is
/// how a reference band and a heatmap's cells are drawn.
class ChartCanvas extends RecordingCanvas {
  /// Every rectangle, with the paint it was drawn in.
  final List<(Rect, Paint)> rects = <(Rect, Paint)>[];

  @override
  void drawRect(Rect rect, Paint paint) => rects.add((rect, paint));

  /// The stroked paths, in the order they were drawn.
  List<(Path, Paint)> get strokes => <(Path, Paint)>[
    for (int i = 0; i < paths.length; i += 1)
      if (this.paints[i].style == PaintingStyle.stroke) (paths[i], this.paints[i]),
  ];

  /// The filled paths, in the order they were drawn.
  List<(Path, Paint)> get filled => <(Path, Paint)>[
    for (int i = 0; i < paths.length; i += 1)
      if (this.paints[i].style == PaintingStyle.fill) (paths[i], this.paints[i]),
  ];
}

/// The plot's own [CustomPaint] under [chart]: the one with a painter behind
/// its child rather than a focus ring in front of it.
Finder plotOf(Finder chart) {
  return find.descendant(
    of: chart,
    matching: find.byWidgetPredicate(
      // A legend swatch has a painter too, and is ten pixels square.
      (Widget widget) =>
          widget is CustomPaint && widget.painter != null && widget.size.height >= 40,
    ),
  );
}

/// Paints the plot under [chart] into a [ChartCanvas] and hands it back.
ChartCanvas paintPlot(WidgetTester tester, Finder chart) {
  final Finder plot = plotOf(chart).first;
  final CustomPaint paint = tester.widget<CustomPaint>(plot);
  final ChartCanvas canvas = ChartCanvas();

  paint.painter!.paint(canvas, tester.getSize(plot));

  return canvas;
}

/// Moves a mouse onto [at] and leaves it there.
Future<TestGesture> hoverAt(WidgetTester tester, Offset at) async {
  final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
  addTearDown(mouse.removePointer);
  await mouse.addPointer(location: Offset.zero);
  await mouse.moveTo(at);
  await tester.pump();

  return mouse;
}

/// A point [dx] across and [dy] down the plot under [chart], as fractions of
/// its box.
Offset plotPoint(WidgetTester tester, Finder chart, double dx, double dy) {
  final Rect box = tester.getRect(plotOf(chart).first);

  return Offset(box.left + box.width * dx, box.top + box.height * dy);
}

/// The plot's semantics node, by the name it was given.
SemanticsNode chartNode(WidgetTester tester, String name) {
  final SemanticsNode? node = semanticsNodeLabelled(tester, name);

  expect(node, isNotNull, reason: 'no node is named "$name"');

  return node!;
}

/// What the live region beside the plot currently says, or `null` when it
/// says nothing.
String? readoutOf(WidgetTester tester) {
  String? said;

  bool visit(SemanticsNode node) {
    final SemanticsData data = node.getSemanticsData();

    if (data.flagsCollection.isLiveRegion) {
      said = data.label.isEmpty ? null : data.label;

      return false;
    }

    node.visitChildren(visit);

    return true;
  }

  tester.binding.renderViews.first.debugSemantics?.visitChildren(visit);

  return said;
}

/// Whether [node] is a stop the focus can land on.
bool isTabStop(SemanticsNode node) {
  return node.getSemanticsData().flagsCollection.isFocused != Tristate.none;
}

/// Whether two colours are the same once a [Paint] has had them: a paint keeps
/// eight bits a channel, so a colour built from floating-point channels comes
/// back as its nearest 32-bit neighbour.
bool sameColor(Color a, Color b) => a.toARGB32() == b.toARGB32();
