/// A sequence of steps, in the order they happen in.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How far a step has got.
///
/// Three states rather than two, because "the one you are on" is not the same
/// claim as "done", and a sequence that cannot say which step is current is a
/// list. Each is drawn differently: a filled bullet, a filled bullet with a
/// halo, an empty ring.
enum MPTimelineStatus {
  /// Done. A filled bullet, and the line out of it in the accent.
  complete,

  /// Being worked on now. A filled bullet with a halo in the accent's
  /// container tone, and the title in the accent.
  current,

  /// Still to come. An empty ring in `outline`, and a muted title.
  upcoming,
}

/// How the line from one step to the next is drawn.
enum MPTimelineConnector {
  /// An unbroken line.
  solid,

  /// A dashed line, for a step that has not been reached yet.
  dashed,

  /// A dotted line.
  dotted,

  /// No line: the gap is left open.
  none,
}

/// The bullet's diameter at each rung.
const Map<MPSize, double> _bulletSize = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 30,
};

/// The gap between the bullet and the words beside it.
const Map<MPSize, double> _bulletGap = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// The room under one step before the next, or after it when horizontal.
const Map<MPSize, double> _itemGap = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 24,
  MPSize.md: 28,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// The width of the line between steps.
const double _lineWidth = 2;

/// The halo round the current step's bullet.
const double _halo = 4;

/// A sequence of steps, in the order they happen in.
///
/// ```dart
/// const MPTimeline(
///   active: 1,
///   children: <MPTimelineItem>[
///     MPTimelineItem(title: Text('Ordered'), meta: Text('9 Aug'), child: Text('Payment authorised.')),
///     MPTimelineItem(title: Text('Packed')),
///     MPTimelineItem(title: Text('Delivered')),
///   ],
/// )
/// ```
///
/// A timeline has no selection, no roving focus and no keyboard contract: it
/// is a list whose order is its content. The steps are numbered here as the
/// timeline walks them, never by a parameter on each, so [active] has
/// something to count against and inserting a step in the middle does not mean
/// renumbering the ones after it.
class MPTimeline extends StatelessWidget {
  /// Creates a timeline of [children].
  const MPTimeline({
    required this.children,
    this.active,
    this.size,
    this.color,
    this.orientation = MPOrientation.vertical,
    super.key,
  });

  /// The steps.
  ///
  /// [MPTimelineItem]s rather than any widget, because the timeline numbers
  /// them and draws the line from each to the next itself.
  final List<MPTimelineItem> children;

  /// How far the sequence has got: the index of the step being worked on now.
  /// Everything before it is complete, everything after it still to come.
  ///
  /// Left out, every step is upcoming unless it says otherwise; the step count
  /// marks the whole sequence done.
  final int? active;

  /// The bullet, the gaps and the type scale.
  final MPSize? size;

  /// Which accent family the bullets and the current title read.
  final MPColor? color;

  /// Which way the sequence runs. [MPOrientation.vertical] takes any number of
  /// steps with any amount to say about each; [MPOrientation.horizontal] is
  /// the stepper across the top of a checkout, honest only while every label
  /// is short.
  final MPOrientation orientation;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final MPColor color = this.color ?? config?.color ?? MPColor.primary;
    final bool horizontal = orientation == MPOrientation.horizontal;

    final List<Widget> steps = <Widget>[
      for (int index = 0; index < children.length; index += 1)
        _Step(
          key: children[index].key,
          item: children[index],
          status:
              children[index].status ??
              (active == null
                  ? MPTimelineStatus.upcoming
                  : index < active!
                  ? MPTimelineStatus.complete
                  : index == active!
                  ? MPTimelineStatus.current
                  : MPTimelineStatus.upcoming),
          size: size,
          color: children[index].color ?? color,
          horizontal: horizontal,
          last: index == children.length - 1,
        ),
    ];

    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: horizontal
          ? IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[for (final Widget step in steps) Expanded(child: step)],
              ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: steps,
            ),
    );
  }
}

/// One step of an [MPTimeline].
///
/// Its place in the sequence is not a parameter and cannot be: a step that had
/// to be told where it was would be a step every caller could put in the
/// wrong place. Built on its own, outside a timeline, it is one upcoming step
/// with nothing before or after it.
class MPTimelineItem extends StatelessWidget {
  /// Creates a step.
  const MPTimelineItem({
    this.child,
    this.title,
    this.meta,
    this.bullet,
    this.status,
    this.color,
    this.connector = MPTimelineConnector.solid,
    super.key,
  });

  /// The body of the step, in the prose role, muted.
  final Widget? child;

  /// The heading of the step.
  final Widget? title;

  /// When it happened: a date, a duration, a name. Set beside the title, and
  /// under it once the title fills the line.
  final Widget? meta;

  /// What goes inside the bullet: a number, an icon. Left out, the bullet is a
  /// plain disc, which is what a step with nothing to say about itself is.
  final Widget? bullet;

  /// Overrides what the timeline's `active` would have computed for this
  /// step: a step that failed and stopped the sequence, one that was skipped.
  final MPTimelineStatus? status;

  /// Overrides the timeline's accent family for this step alone.
  final MPColor? color;

  /// How the line to the next step is drawn.
  final MPTimelineConnector connector;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);

    return _Step(
      item: this,
      status: status ?? MPTimelineStatus.upcoming,
      size: config?.size ?? MPSize.md,
      color: color ?? config?.color ?? MPColor.primary,
      horizontal: false,
      last: true,
    );
  }
}

/// One drawn step, with the line that leaves it.
class _Step extends StatelessWidget {
  const _Step({
    required this.item,
    required this.status,
    required this.size,
    required this.color,
    required this.horizontal,
    required this.last,
    super.key,
  });

  final MPTimelineItem item;
  final MPTimelineStatus status;
  final MPSize size;
  final MPColor color;
  final bool horizontal;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final double bullet = _bulletSize[size]!;
    final double gap = last ? 0 : _itemGap[size]!;
    // The last step's line would run off the end of the sequence into nothing.
    final bool drawsConnector = item.connector != MPTimelineConnector.none && !last;

    final Color titleInk = switch (status) {
      MPTimelineStatus.complete => colors.onSurface,
      MPTimelineStatus.current => accent.color,
      MPTimelineStatus.upcoming => colors.onSurfaceVariant,
    };

    final Widget body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 2,
      children: <Widget>[
        if (item.title != null || item.meta != null)
          Wrap(
            spacing: 8,
            crossAxisAlignment: WrapCrossAlignment.end,
            children: <Widget>[
              if (item.title != null)
                AnimatedDefaultTextStyle(
                  duration: duration,
                  curve: MPMotion.standard,
                  style: DefaultTextStyle.of(
                    context,
                  ).style.merge(mpSheetTitle(theme.typescale, size).style(titleInk)),
                  child: item.title!,
                ),
              if (item.meta != null)
                DefaultTextStyle.merge(
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                  child: item.meta!,
                ),
            ],
          ),
        if (item.child != null)
          DefaultTextStyle.merge(
            style: mpProseText(theme.typescale, size).style(colors.onSurfaceVariant),
            child: item.child!,
          ),
      ],
    );

    final Widget mark = _Bullet(
      status: status,
      accent: accent,
      colors: colors,
      size: bullet,
      duration: duration,
      child: item.bullet,
    );

    final Widget line = _Connector(
      style: item.connector,
      color: status == MPTimelineStatus.complete ? accent.color : colors.outlineVariant,
      horizontal: horizontal,
      duration: duration,
    );

    final Widget step = horizontal
        ? Padding(
            padding: EdgeInsetsDirectional.only(end: gap),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                SizedBox(
                  height: bullet,
                  child: Row(
                    children: <Widget>[
                      mark,
                      if (drawsConnector) Expanded(child: line),
                    ],
                  ),
                ),
                Padding(padding: const EdgeInsets.only(top: 8), child: body),
              ],
            ),
          )
        : IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: _bulletGap[size]!,
              children: <Widget>[
                SizedBox(
                  width: bullet,
                  child: Column(
                    children: <Widget>[
                      mark,
                      if (drawsConnector) Expanded(child: line),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: gap),
                    child: Align(alignment: AlignmentDirectional.topStart, child: body),
                  ),
                ),
              ],
            ),
          );

    return Semantics(
      container: true,
      // The web build says `aria-current="step"`; Flutter has no such state, so
      // the current step is the one announced as selected.
      selected: status == MPTimelineStatus.current ? true : null,
      child: step,
    );
  }
}

/// The disc at the head of a step.
class _Bullet extends StatelessWidget {
  const _Bullet({
    required this.status,
    required this.accent,
    required this.colors,
    required this.size,
    required this.duration,
    this.child,
  });

  final MPTimelineStatus status;
  final MPAccent accent;
  final MPColorScheme colors;
  final double size;
  final Duration duration;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final bool filled = status != MPTimelineStatus.upcoming;
    final Color ink = filled ? accent.onColor : colors.onSurfaceVariant;

    // Sized outside the animation: the fill, the ring and the halo ease, the
    // diameter does not, so a timeline given a new size takes it at once.
    return ExcludeSemantics(
      child: SizedBox.square(
        dimension: size,
        child: AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: filled ? accent.color : const Color(0x00000000),
            border: filled ? null : Border.all(color: colors.outline, width: 2),
            // A halo in the accent's container tone says "here" without a
            // second colour or a bigger disc.
            boxShadow: status == MPTimelineStatus.current
                ? <BoxShadow>[BoxShadow(color: accent.container, spreadRadius: _halo)]
                : const <BoxShadow>[],
          ),
          // The label inside is sized off the bullet rather than off the page's
          // text, so a number in an `xs` bullet is not the same size it would be
          // in an `xl` one.
          child: child == null
              ? null
              : DefaultTextStyle(
                  style: TextStyle(
                    color: ink,
                    fontSize: size * 0.5,
                    height: 1,
                    fontWeight: FontWeight.w500,
                    fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
                  ),
                  maxLines: 1,
                  softWrap: false,
                  child: IconTheme.merge(
                    data: IconThemeData(color: ink, size: size * 0.3),
                    child: child!,
                  ),
                ),
        ),
      ),
    );
  }
}

/// The line from one step to the next, centred on the bullet.
class _Connector extends StatelessWidget {
  const _Connector({
    required this.style,
    required this.color,
    required this.horizontal,
    required this.duration,
  });

  final MPTimelineConnector style;
  final Color color;
  final bool horizontal;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<Color?>(
      tween: ColorTween(end: color),
      duration: duration,
      curve: MPMotion.standard,
      builder: (BuildContext context, Color? value, Widget? _) {
        return Center(
          child: SizedBox(
            width: horizontal ? double.infinity : _lineWidth,
            height: horizontal ? _lineWidth : double.infinity,
            child: CustomPaint(
              painter: _LinePainter(style: style, color: value ?? color, horizontal: horizontal),
            ),
          ),
        );
      },
    );
  }
}

class _LinePainter extends CustomPainter {
  const _LinePainter({required this.style, required this.color, required this.horizontal});

  final MPTimelineConnector style;
  final Color color;
  final bool horizontal;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;
    final double length = horizontal ? size.width : size.height;

    Rect segment(double from, double to) {
      return horizontal
          ? Rect.fromLTRB(from, 0, to, size.height)
          : Rect.fromLTRB(0, from, size.width, to);
    }

    switch (style) {
      case MPTimelineConnector.none:
        return;
      case MPTimelineConnector.solid:
        canvas.drawRect(segment(0, length), paint);
      case MPTimelineConnector.dashed:
        // The browser's own dash for a 2px border: three times the width on,
        // the same off.
        for (double at = 0; at < length; at += _lineWidth * 6) {
          canvas.drawRect(segment(at, (at + _lineWidth * 3).clamp(0, length)), paint);
        }
      case MPTimelineConnector.dotted:
        for (double at = 0; at + _lineWidth <= length; at += _lineWidth * 2) {
          final Rect dot = segment(at, at + _lineWidth);

          canvas.drawCircle(dot.center, _lineWidth / 2, paint);
        }
    }
  }

  @override
  bool shouldRepaint(_LinePainter oldDelegate) {
    return oldDelegate.style != style ||
        oldDelegate.color != color ||
        oldDelegate.horizontal != horizontal;
  }
}
