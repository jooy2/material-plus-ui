/// Things laid over each other in a pile.
library;

import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show MPAnimateTrigger, MPAnimation, MPEasing;

/// Which way the pile grows.
enum MPStackDirection {
  /// Along the reader's inline axis.
  horizontal,

  /// Down the page.
  vertical,

  /// Along the inline axis, with a step down the page per item.
  ///
  /// A **fan** rather than a true 45°, and it cannot be anything else: the
  /// horizontal advance is the item's width less the overlap, and a pile that
  /// takes arbitrary children does not know how wide they are. The vertical
  /// step is [MPStack.drop], said separately.
  diagonal,
}

/// Which end of the pile is nearest the reader.
enum MPStackFront {
  /// The first item paints over the rest: a deck, whose top card is the one
  /// read first.
  first,

  /// The last item paints over the rest: a row of faces with the newest
  /// arrival in front.
  last,
}

/// How far one item sits under the last, per rung.
///
/// Roughly a third of a control of the same rung: enough that the pile reads as
/// a pile, and not so much that an item is hidden behind the next one. The
/// React package's own ladder, `0.625rem` to `1.5rem`.
const Map<MPSize, double> _overlap = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 12,
  MPSize.md: 18,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// How wide the line of page drawn round each item is, as `ring-2`.
const double _ringWidth = 2;

/// Things laid over each other in a pile.
///
/// ```dart
/// MPStack(
///   max: 3,
///   total: 12,
///   ring: true,
///   overflow: (int hidden) => MPAvatar(initials: '+$hidden'),
///   children: <Widget>[
///     MPAvatar(name: 'Anya Sol'),
///     MPAvatar(name: 'Lucas Adebayo'),
///     MPAvatar(name: 'Noa Marin'),
///   ],
/// )
/// ```
///
/// A stack of avatars, a deck of cards, a heap of documents, a run of
/// overlapped thumbnails: one widget, because "several of these, overlapping"
/// is one idea and the things being overlapped are not this widget's business.
///
/// ## The box measures exactly what it draws
///
/// The overlap is real layout rather than a [Transform]. A translated pile is
/// laid out one item wide plus the full width of all the others, paints outside
/// its own box, and everything after it is placed against a size the reader
/// never sees. At 32px items with a 10px overlap, five of them come to 120×32
/// across, 32×120 down and 120×72 on the diagonal. The overlap is logical, so a
/// horizontal pile overlaps the other way under right-to-left text.
///
/// ## What it does not do
///
/// It does not know what the items **are**, which is the price of being
/// general. There is no `variant`, no `color` and no `shape` to set once for
/// the pile; [size] picks the default overlap and is not passed on. Set the
/// axes the items share on an [MPConfigProvider], and the rest per item.
///
/// ## Depth, and the entrance
///
/// [scaleStep] and [opacityStep] change what is drawn and not what is measured,
/// so a receding card does not pull the ones behind it closer. They sit on a
/// layer of their own under the entrance, so an entrance that scales an item
/// does not overwrite the depth it rests at.
class MPStack extends StatelessWidget {
  /// Creates a pile of [children].
  const MPStack({
    required this.children,
    this.direction = MPStackDirection.horizontal,
    this.overlap,
    this.drop,
    this.size,
    this.max,
    this.total,
    this.overflow,
    this.front = MPStackFront.first,
    this.scaleStep = 1,
    this.opacityStep = 1,
    this.ring = false,
    this.ringRadius,
    this.transition,
    this.duration,
    this.delay = Duration.zero,
    this.easing,
    this.stagger = const Duration(milliseconds: 60),
    this.durationStep = Duration.zero,
    this.reverse = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    this.paused = false,
    this.semanticLabel,
    super.key,
  }) : assert(max == null || max >= 0, 'max cannot be negative');

  /// The things in the pile.
  final List<Widget> children;

  /// Which way the pile grows.
  final MPStackDirection direction;

  /// How far each item sits under the one before it, in logical pixels, along
  /// the axis the pile flows on. Left out, it comes off [size]'s rung: 10, 12,
  /// 18, 20, 24.
  final double? overlap;

  /// How far each item sits below the one before it on
  /// [MPStackDirection.diagonal], the axis the flow is **not** on. Defaults to
  /// [overlap], a shallow fan.
  ///
  /// A distance rather than an angle because a true 45° would need the items'
  /// own width, and the pile does not have it.
  final double? drop;

  /// Sets the default [overlap], and nothing else. It is not passed to the
  /// items: a pile does not know what they are.
  final MPSize? size;

  /// How many items are drawn before the rest become an [overflow].
  final int? max;

  /// How many there are altogether, when the pile was handed only the first
  /// few. Without it the count is worked out from [children], which is right
  /// only when all of them were passed.
  final int? total;

  /// The last item in the pile, built from the number that did not fit.
  ///
  /// A builder rather than a widget, because the count is the whole of what
  /// that item has to say: `(hidden) => MPAvatar(initials: '+$hidden')`. Left
  /// out, nothing is drawn for the remainder.
  final Widget Function(int hidden)? overflow;

  /// Which end of the pile is nearest the reader.
  final MPStackFront front;

  /// What each item is scaled by relative to the one in front of it. `1` is no
  /// change; `0.94` puts the fifth card at about three quarters.
  final double scaleStep;

  /// The same, for opacity. `0.85` fades a deck into the page behind it.
  final double opacityStep;

  /// Draws a line of the page's own `surface` round each item, so two shapes of
  /// similar tone have an edge between them.
  ///
  /// It reads as the hole the near item is cut out of rather than as a line
  /// round anything, and it is painted as a spread shadow, so it takes no part
  /// in the layout and the overlap is still about the item.
  final bool ring;

  /// The corners of the [ring]. Fully round when left out, which is what a
  /// pile of avatars wants.
  ///
  /// The React package needs no such prop: there the ring is a box shadow on
  /// the item, and CSS hands it the item's own `border-radius`. Nothing here
  /// can read a child's shape, so a pile of rounded rectangles says what their
  /// corners are.
  final BorderRadius? ringRadius;

  /// An entrance for each item, from the same seven the `MPAnimate*` widgets
  /// run. Left out, nothing is animated.
  final MPAnimation? transition;

  /// How long one item's entrance takes. Unset takes the effect's own token.
  final Duration? duration;

  /// How long before the first one starts.
  final Duration delay;

  /// Which Material easing curve the entrance runs on. Unset takes the
  /// effect's own.
  final MPEasing? easing;

  /// How long after one item the next one starts.
  final Duration stagger;

  /// How much longer each item takes than the one before it.
  final Duration durationStep;

  /// Deals the pile from the back.
  final bool reverse;

  /// What starts the entrance.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` to
  /// `true` deals the pile again.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much has to be on screen to count,
  /// from `0` to `1`.
  final double threshold;

  /// Holds the entrance where it is.
  final bool paused;

  /// What the pile is a pile *of*, for a screen reader. A row of faces is a
  /// picture of a set; name it when nothing beside it says what the set is.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final double step = overlap ?? _overlap[size]!;
    final double fall = drop ?? step;
    final Color surface = MPTheme.of(context).colors.surface;

    final List<Widget> shown = max == null
        ? children
        : children.sublist(0, math.min(max!, children.length));
    final int hidden = math.max(0, (total ?? children.length) - shown.length);

    final List<Widget> piled = <Widget>[
      ...shown,
      if (overflow != null && hidden > 0) overflow!(hidden),
    ];

    final List<Widget> dressed = <Widget>[
      for (int index = 0; index < piled.length; index += 1)
        KeyedSubtree(
          key: piled[index].key == null ? null : ValueKey<Key>(piled[index].key!),
          child: _dress(piled[index], surface: surface, depth: _depthOf(index, piled.length)),
        ),
    ];

    Widget layout(BuildContext context, List<Widget> items) {
      return _StackFlow(
        direction: direction,
        overlap: step,
        drop: fall,
        front: front,
        textDirection: Directionality.maybeOf(context) ?? TextDirection.ltr,
        children: items,
      );
    }

    final Widget pile = transition == null
        ? layout(context, dressed)
        : _entrance(transition!, dressed, layout);

    return Semantics(
      label: semanticLabel,
      container: semanticLabel != null,
      // The items keep their own nodes, so a named pile is read as its name
      // and then as what is in it rather than as one run-on sentence.
      explicitChildNodes: semanticLabel != null,
      child: pile,
    );
  }

  /// How many steps back from the front an item at [index] sits. The item
  /// nearest the reader is never scaled or faded, whichever end the front is.
  int _depthOf(int index, int count) {
    return front == MPStackFront.first ? index : count - 1 - index;
  }

  /// The ring and the depth, in the order they have to be applied.
  Widget _dress(Widget item, {required Color surface, required int depth}) {
    Widget dressed = item;

    if (ring) {
      dressed = DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: ringRadius ?? BorderRadius.circular(9999),
          boxShadow: <BoxShadow>[BoxShadow(color: surface, spreadRadius: _ringWidth)],
        ),
        child: dressed,
      );
    }

    if (opacityStep != 1) {
      // An item faded to nothing is still read out, as CSS `opacity` leaves it
      // on the accessibility tree.
      dressed = MPAnimateOpacity(
        opacity: math.pow(opacityStep, depth).toDouble().clamp(0.0, 1.0),
        child: dressed,
      );
    }

    if (scaleStep != 1) {
      // A paint-time scale, so an item that recedes does not also take less
      // room and pull the pile in behind it.
      dressed = Transform.scale(scale: math.pow(scaleStep, depth).toDouble(), child: dressed);
    }

    return dressed;
  }

  /// [items] dealt one after another by [effect].
  Widget _entrance(
    MPAnimation effect,
    List<Widget> items,
    Widget Function(BuildContext context, List<Widget> items) layout,
  ) {
    return MPAnimateEffect(
      settings: MPAnimateSettings(
        duration: duration ?? effect.durationFor(MPAnimateMode.enter),
        delay: delay,
        curve: (easing ?? effect.easing).curve,
        paused: paused,
        trigger: trigger,
        play: play,
        once: once,
        threshold: threshold,
      ),
      // Per item at any stagger: the items are inside wrappers this pile
      // builds, and nothing outside it can reach them.
      spread: true,
      stagger: stagger,
      durationStep: durationStep,
      reverse: reverse,
      layoutBuilder: layout,
      frame: (BuildContext context, double t, Widget inner) => _frame(effect, t, inner),
      children: items,
    );
  }

  /// One frame of [effect] at [t], with `1` the item's resting state.
  ///
  /// The React pile writes none of an effect's own numbers onto an item, so
  /// each runs from the stylesheet's fallback: a scale from 0.8 for both
  /// `grow` and `zoom`, a turn from -180°, a wipe from the start edge, and a
  /// `slide` with no distance, which arrives as a fade. These are the same.
  static Widget _frame(MPAnimation effect, double t, Widget inner) {
    final double opacity = t.clamp(0.0, 1.0);

    switch (effect) {
      case MPAnimation.fade:
      case MPAnimation.slide:
        return MPAnimateOpacity(opacity: opacity, child: inner);
      case MPAnimation.grow:
      case MPAnimation.zoom:
        return MPAnimateOpacity(
          opacity: opacity,
          child: Transform.scale(scale: lerpDouble(0.8, 1, t)!, child: inner),
        );
      case MPAnimation.rotate:
        return MPAnimateOpacity(
          opacity: opacity,
          child: Transform.rotate(angle: lerpDouble(-math.pi, 0, t)!, child: inner),
        );
      case MPAnimation.blink:
        return MPAnimateOpacity(
          opacity: mpKeyframes(
            t,
            const <double>[0, 0.5, 1],
            const <double>[1, 0.2, 1],
            Curves.linear,
          ),
          child: inner,
        );
      case MPAnimation.reveal:
        return MPAnimateOpacity(
          opacity: opacity,
          child: ClipRect(clipper: _Wipe(opacity), child: inner),
        );
    }
  }
}

/// The part of an item a `reveal` has uncovered: [progress] of its width,
/// from the start edge.
class _Wipe extends CustomClipper<Rect> {
  const _Wipe(this.progress);

  final double progress;

  @override
  Rect getClip(Size size) => Rect.fromLTWH(0, 0, size.width * progress, size.height);

  @override
  bool shouldReclip(_Wipe oldClipper) => oldClipper.progress != progress;
}

/* ---------------------------------------------------------------------------
 * The layout
 * ------------------------------------------------------------------------- */

/// Lays the items out overlapping and reports the size of what it drew.
class _StackFlow extends MultiChildRenderObjectWidget {
  const _StackFlow({
    required this.direction,
    required this.overlap,
    required this.drop,
    required this.front,
    required this.textDirection,
    required super.children,
  });

  final MPStackDirection direction;
  final double overlap;
  final double drop;
  final MPStackFront front;
  final TextDirection textDirection;

  @override
  _RenderStackFlow createRenderObject(BuildContext context) => _RenderStackFlow()..configure(this);

  @override
  void updateRenderObject(BuildContext context, _RenderStackFlow renderObject) {
    renderObject.configure(this);
  }
}

class _StackFlowParentData extends ContainerBoxParentData<RenderBox> {}

/// Flutter has no negative margin: `EdgeInsets` and a flex's `spacing` both
/// refuse one. So the pile is laid out by a render object of its own, which is
/// the one place the items' sizes are known.
class _RenderStackFlow extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _StackFlowParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _StackFlowParentData> {
  MPStackDirection _direction = MPStackDirection.horizontal;
  double _overlap = 0;
  double _drop = 0;
  MPStackFront _front = MPStackFront.first;
  TextDirection _textDirection = TextDirection.ltr;

  void configure(_StackFlow widget) {
    if (widget.direction != _direction ||
        widget.overlap != _overlap ||
        widget.drop != _drop ||
        widget.textDirection != _textDirection) {
      markNeedsLayout();
    }

    // Only the order things are painted and hit in, so there is nothing to lay
    // out again.
    if (widget.front != _front) {
      markNeedsPaint();
    }

    _direction = widget.direction;
    _overlap = widget.overlap;
    _drop = widget.drop;
    _front = widget.front;
    _textDirection = widget.textDirection;
  }

  bool get _flowsAcross => _direction != MPStackDirection.vertical;

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _StackFlowParentData) {
      child.parentData = _StackFlowParentData();
    }
  }

  /// The pile's size and, unless [dry], where each item goes.
  ///
  /// One walk for both, because the two must not be able to disagree: a dry
  /// layout that answered a different size from the real one is a parent laid
  /// out against a box that never existed.
  Size _run(BoxConstraints constraints, {required bool dry}) {
    final BoxConstraints loose = constraints.loosen();
    final List<Size> sizes = <Size>[];
    final List<Offset> origins = <Offset>[];

    double cursor = 0;
    double width = 0;
    double height = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      final Size childSize = dry
          ? child.getDryLayout(loose)
          : (child..layout(loose, parentUsesSize: true)).size;
      final int index = sizes.length;

      final Offset origin = switch (_direction) {
        MPStackDirection.horizontal => Offset(cursor, 0),
        MPStackDirection.vertical => Offset(0, cursor),
        MPStackDirection.diagonal => Offset(cursor, _drop * index),
      };

      cursor += (_flowsAcross ? childSize.width : childSize.height) - _overlap;
      width = math.max(width, origin.dx + childSize.width);
      height = math.max(height, origin.dy + childSize.height);
      sizes.add(childSize);
      origins.add(origin);
    }

    final Size size = constraints.constrain(Size(width, height));

    if (dry) {
      return size;
    }

    int index = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      final Size childSize = sizes[index];
      Offset origin = origins[index];

      // A straight pile sits its items in the middle of the box the largest one
      // decides; a fanned one hangs them from the top, at different heights.
      origin = switch (_direction) {
        MPStackDirection.horizontal => Offset(origin.dx, (size.height - childSize.height) / 2),
        MPStackDirection.vertical => Offset((size.width - childSize.width) / 2, origin.dy),
        MPStackDirection.diagonal => origin,
      };

      // The pile grows from the reader's start, so under right-to-left text
      // every item is mirrored about the finished box. Here rather than in
      // `paint`, because a hit test and a semantics rectangle read it too.
      if (_flowsAcross && _textDirection == TextDirection.rtl) {
        origin = Offset(size.width - origin.dx - childSize.width, origin.dy);
      }

      (child.parentData! as _StackFlowParentData).offset = origin;
      index += 1;
    }

    return size;
  }

  @override
  void performLayout() {
    size = _run(constraints, dry: false);
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) => _run(constraints, dry: true);

  /// The pile's extent along one axis, given each item's.
  double _intrinsic(double Function(RenderBox child) extentOf, {required bool along}) {
    double total = 0;
    double largest = 0;
    int count = 0;

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      final double extent = extentOf(child);

      total += extent;
      largest = math.max(
        largest,
        extent + (_direction == MPStackDirection.diagonal && !along ? _drop * count : 0),
      );
      count += 1;
    }

    return along ? math.max(0, total - _overlap * math.max(0, count - 1)) : largest;
  }

  @override
  double computeMinIntrinsicWidth(double height) =>
      _intrinsic((RenderBox child) => child.getMinIntrinsicWidth(height), along: _flowsAcross);

  @override
  double computeMaxIntrinsicWidth(double height) =>
      _intrinsic((RenderBox child) => child.getMaxIntrinsicWidth(height), along: _flowsAcross);

  @override
  double computeMinIntrinsicHeight(double width) =>
      _intrinsic((RenderBox child) => child.getMinIntrinsicHeight(width), along: !_flowsAcross);

  @override
  double computeMaxIntrinsicHeight(double width) =>
      _intrinsic((RenderBox child) => child.getMaxIntrinsicHeight(width), along: !_flowsAcross);

  /// The items in the order they are painted, back to front.
  List<RenderBox> get _painted {
    final List<RenderBox> order = <RenderBox>[];

    for (RenderBox? child = firstChild; child != null; child = childAfter(child)) {
      order.add(child);
    }

    // Said rather than left to the list, which paints later items on top. A
    // pile read from the start has to be the other way round.
    return _front == MPStackFront.first ? order.reversed.toList() : order;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    for (final RenderBox child in _painted) {
      context.paintChild(child, offset + (child.parentData! as _StackFlowParentData).offset);
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    // Front to back, the reverse of the paint order: the item a reader can see
    // is the one their finger lands on.
    for (final RenderBox child in _painted.reversed) {
      final bool hit = result.addWithPaintOffset(
        offset: (child.parentData! as _StackFlowParentData).offset,
        position: position,
        hitTest: (BoxHitTestResult result, Offset transformed) {
          return child.hitTest(result, position: transformed);
        },
      );

      if (hit) {
        return true;
      }
    }

    return false;
  }

  @override
  void visitChildrenForSemantics(RenderObjectVisitor visitor) {
    // In list order, whatever is painted on top, so a screen reader reads the
    // pile the way it was written.
    visitChildren(visitor);
  }
}
