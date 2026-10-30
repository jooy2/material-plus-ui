/// A canvas that keeps the paints a painter filled its paths with.
///
/// `flutter_test`'s own `paints` matcher asserts a *sequence of named calls*,
/// which is the wrong shape for "nothing on this plot is faded": that is a
/// question about every paint at once, and about an alpha whose colour comes
/// out of the theme rather than out of the test. Recording the calls and
/// reading the alphas back answers it without naming a palette colour.
///
/// [drawPath] is recorded with the layers it was drawn into, and [drawLine],
/// [drawCircle], [drawRRect] and [drawParagraph] on their own, for the rules
/// of a chart's grid and axes, the dots of its markers, its cells and spans,
/// and its labels. Everything else a painter asks for, such as the clips, is
/// accepted and dropped, which is what [noSuchMethod] is doing here.
library;

import 'dart:ui';

class RecordingCanvas implements Canvas {
  /// Every paint a path was filled or stroked with, in the order it was drawn.
  final List<Paint> paints = <Paint>[];

  /// The paths themselves, in the same order — for a question about the *shape*
  /// rather than the ink, such as whether a line was cut into dashes.
  final List<Path> paths = <Path>[];

  /// The opacity each path lands at, in the same order: its paint's alpha
  /// times that of every layer it was drawn into. What a reader sees faded is
  /// this, whether the paint or a layer around it did the fading.
  final List<double> opacities = <double>[];

  /// The alpha of every layer a painter opened, in the order it opened them.
  final List<double> layers = <double>[];

  /// The opacity whatever is drawn now lands at, one entry for each `save` or
  /// layer still open.
  final List<double> _open = <double>[1];

  /// Every straight line drawn, its two ends and its paint, in the order drawn.
  final List<(Offset, Offset, Paint)> lines = <(Offset, Offset, Paint)>[];

  /// Only the fills, which is what a mark's colour and its alpha are on.
  List<Paint> get fills =>
      paints.where((Paint paint) => paint.style == PaintingStyle.fill).toList();

  /// How many separate contours a drawn path is made of, by the order drawn.
  ///
  /// One for a line, one per dash for a dashed one.
  List<int> get contours => paths.map((Path path) => path.computeMetrics().length).toList();

  @override
  void save() => _open.add(_open.last);

  @override
  void saveLayer(Rect? bounds, Paint paint) {
    layers.add(paint.color.a);
    _open.add(_open.last * paint.color.a);
  }

  @override
  void restore() {
    if (_open.length > 1) {
      _open.removeLast();
    }
  }

  @override
  void drawPath(Path path, Paint paint) {
    paints.add(paint);
    paths.add(path);
    opacities.add(paint.color.a * _open.last);
  }

  @override
  void drawLine(Offset p1, Offset p2, Paint paint) => lines.add((p1, p2, paint));

  /// The opacity each run of text lands at, in the order drawn: that of every
  /// layer it was drawn into.
  final List<double> texts = <double>[];

  @override
  void drawParagraph(Paragraph paragraph, Offset offset) => texts.add(_open.last);

  /// Every circle drawn, its centre, its radius and its paint, in order.
  final List<(Offset, double, Paint)> circles = <(Offset, double, Paint)>[];

  @override
  void drawCircle(Offset c, double radius, Paint paint) => circles.add((c, radius, paint));

  /// The paint of every rounded rectangle drawn, in order.
  final List<Paint> rrects = <Paint>[];

  @override
  void drawRRect(RRect rrect, Paint paint) => rrects.add(paint);

  @override
  void noSuchMethod(Invocation invocation) {}
}
