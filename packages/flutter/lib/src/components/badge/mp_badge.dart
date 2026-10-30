/// A small mark in the corner of something else.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The shape of the thing under an [MPBadge], which is what decides how far
/// the marker tucks in.
enum MPBadgeOverlap {
  /// A rectangle. The marker hangs half outside the corner.
  square,

  /// A circle. Its corner is further from its centre than a square's, so a
  /// badge that looks right on an avatar hangs off an icon button. This pulls
  /// the marker back in.
  circle,
}

/// A badge is smaller than anything else in the library, so it has a ladder of
/// its own rather than a step off the control heights.
///
/// A control's height is the number a row lines up on; a badge lines up on
/// nothing, it hangs off the corner of something else. `md` is 16px, which is
/// MD3's large badge to the pixel, and the two rungs below it are for a badge
/// on something already small.
const Map<MPSize, double> _height = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// The dot: the same ladder with the digits taken out, so it goes square. `md`
/// is 6px, which is MD3's small badge.
const Map<MPSize, double> _dot = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 6,
  MPSize.lg: 8,
  MPSize.xl: 10,
};

/// Horizontal breathing room around the digits.
const Map<MPSize, double> _padX = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 4,
  MPSize.md: 6,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// How far the marker is pulled out of the corner: half its own height, so the
/// vertical overhang is exactly half, and a wide `99+` tucks in a little
/// further than half horizontally, which is what you want anyway.
const Map<MPSize, double> _cornerOffset = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// The same, for a dot.
const Map<MPSize, double> _dotCornerOffset = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 2,
  MPSize.md: 4,
  MPSize.lg: 4,
  MPSize.xl: 6,
};

/// The extra inset a round anchor needs, as a fraction of its width.
///
/// A circle's corner is `r(1 - 1/sqrt 2)`, about 15% of its diameter, inside
/// the box the badge is positioned against, so without this the marker floats
/// off an avatar with a gap under it.
const double _circleInset = 0.07;

/// `labelSmall` is the smallest role in the Material type scale, and MD3 sets
/// a badge's count in it. Two of the five rungs go up from there; none goes
/// below, because there is nothing below.
MPTypeRole _textRole(MPTypescale scale, MPSize size) {
  return size == MPSize.lg || size == MPSize.xl ? scale.labelMedium : scale.labelSmall;
}

/// A small mark in the corner of something else: unread mail on an inbox icon,
/// a status dot on an avatar, a count on a tab.
///
/// ```dart
/// MPBadge(content: 3, label: '3 unread messages', child: inbox)
/// ```
///
/// With no [child] the marker lays out on its own, which is what a status pill
/// in a table cell is.
///
/// A badge has no interaction, no state and no keyboard contract. It is a
/// mark. What it does owe a screen reader is a sentence rather than a number,
/// which is what [label] is for: a `3` beside a bell reads out as "3".
///
/// Its corner is `full` at every size. MD3 shapes a badge as a circle or a
/// stadium because it is a mark laid on a surface rather than a surface of its
/// own, and a mark has no edge to cut.
class MPBadge extends StatelessWidget {
  /// Creates a badge.
  const MPBadge({
    this.content,
    this.max = 99,
    this.dot = false,
    this.showZero = false,
    this.invisible = false,
    this.placement = MPCorner.topEnd,
    this.overlap = MPBadgeOverlap.square,
    this.variant = MPVariant.filled,
    this.size,
    this.color = MPColor.error,
    this.label,
    this.child,
    super.key,
  }) : assert(
         content == null || content is num || content is String || content is Widget,
         'MPBadge.content must be a number, a String or a Widget',
       );

  /// What the badge says: a number, a word, or a widget. This is MD3's large
  /// badge; [dot] is its small one, and they are the only two it has.
  ///
  /// Leave it out and the badge is hidden, as a count of zero is: a badge with
  /// nothing to say is not news. Pass [dot] for the honest middle, something to
  /// report and nothing to count.
  ///
  /// Typed [Object] because Dart has no union type, and because [max] and
  /// [showZero] only mean anything for a number.
  final Object? content;

  /// Caps a numeric [content] and adds a `+`. Only applies when the content is
  /// a number: a badge cannot know how to truncate a word.
  final int max;

  /// Draws MD3's small badge, a dot. With [content] as well, the content is
  /// kept for screen readers only, for the corner that has to stay quiet.
  final bool dot;

  /// Whether a [content] of `0` is shown. Off by default: zero unread messages
  /// is not news, and a badge that never goes away stops meaning anything.
  final bool showZero;

  /// Hides the marker without taking it out of the layout, so showing it again
  /// does not move what it sits on.
  final bool invisible;

  /// Which corner of the anchor it sits on. Read with the text direction, so
  /// `topEnd` is the top right in English and the top left in Arabic.
  final MPCorner placement;

  /// The shape of the thing underneath. See [MPBadgeOverlap].
  final MPBadgeOverlap overlap;

  /// How much surface the marker paints. The marker is the thing being
  /// coloured, so it takes the tint. [MPVariant.tonal] is the one to reach for
  /// on a busy surface, a soft mark that reports without shouting.
  final MPVariant variant;

  /// The marker's own ladder, 12 to 24px. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the marker reads.
  ///
  /// **[MPColor.error], not primary**, the one component in the library that
  /// defaults there and that an [MPConfigProvider]'s colour does not reach.
  /// MD3 gives the badge exactly one colour pair, `error` under `onError`,
  /// because a badge exists to be noticed, and the error palette is the one
  /// guaranteed to be loud whatever the source colour is.
  final MPColor color;

  /// What a screen reader hears instead of the raw content: `content: 3` on a
  /// bell is "3" to a reader and means nothing, `label: '3 unread
  /// notifications'` is the sentence.
  final String? label;

  /// What the badge is pinned to. Without it the badge lays out on its own.
  final Widget? child;

  /// `99+`, but only for a value a `+` means anything on.
  Object? get _capped {
    final Object? content = this.content;

    return content is num && content > max ? '$max+' : content;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    // A count of nothing is not news, which is the one place the library asks
    // a second question about whether a slot is filled.
    final bool empty =
        content == null ||
        (content is String && (content! as String).isEmpty) ||
        (content == 0 && !showZero);
    final bool asDot = dot || empty;
    final bool hidden = invisible || (empty && !dot);

    final _BadgePaint paint = _paintFor(theme.colors, theme.colors.accent(color), variant);

    Widget marker = _marker(theme, size, paint, asDot: asDot, hidden: hidden, empty: empty);

    // The marker grows in and shrinks back out, which is MD3's own arrival for
    // one: a count that appeared would be a count nobody saw change. It keeps
    // its box all the while, so nothing around it moves.
    marker = AnimatedScale(
      scale: hidden ? 0 : 1,
      duration: duration,
      curve: MPMotion.standard,
      child: AnimatedOpacity(
        opacity: hidden ? 0 : 1,
        duration: duration,
        curve: MPMotion.standard,
        child: marker,
      ),
    );

    // A hidden badge says nothing, and a marker is never pressed: a tap on it
    // belongs to whatever it is pinned to.
    marker = IgnorePointer(
      child: ExcludeSemantics(excluding: hidden, child: marker),
    );

    if (child == null) {
      return marker;
    }

    // The shell is exactly as wide and as tall as what it wraps, or a badged
    // icon button stops lining up with the bare one beside it.
    return Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        child!,
        Positioned.fill(
          child: _Corner(
            placement: placement,
            offset: asDot ? _dotCornerOffset[size]! : _cornerOffset[size]!,
            inset: overlap == MPBadgeOverlap.circle ? _circleInset : 0,
            child: marker,
          ),
        ),
      ],
    );
  }

  Widget _marker(
    MPThemeData theme,
    MPSize size,
    _BadgePaint paint, {
    required bool asDot,
    required bool hidden,
    required bool empty,
  }) {
    final Object? capped = _capped;
    final String? spoken = label ?? (capped is Widget ? mpTextOf(capped) : capped?.toString());

    BoxDecoration decoration(double height) {
      return BoxDecoration(
        color: paint.fill,
        borderRadius: BorderRadius.circular(height / 2),
        border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
        boxShadow: paint.shadows,
      );
    }

    if (asDot) {
      final double diameter = _dot[size]!;

      // A dot shows nothing and reads whichever of the two it was given, so a
      // quiet corner is not a silent one. A marker with nothing to say holds
      // nothing: that is not a badge being hidden, it is one that was never
      // there.
      final String? said = empty && !dot ? null : spoken;

      return Semantics(
        container: said != null,
        label: said,
        child: Container(width: diameter, height: diameter, decoration: decoration(diameter)),
      );
    }

    final double height = _height[size]!;

    Widget body = capped is Widget ? capped : Text(capped.toString());

    body = DefaultTextStyle.merge(
      style: _textRole(theme.typescale, size)
          .style(paint.ink)
          .copyWith(height: 1, fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
      maxLines: 1,
      softWrap: false,
      child: IconTheme.merge(
        data: IconThemeData(color: paint.ink),
        child: body,
      ),
    );

    // The count is still drawn; it is the sentence that is read.
    if (label != null) {
      body = Semantics(
        container: true,
        label: label,
        child: ExcludeSemantics(child: body),
      );
    }

    return Container(
      constraints: BoxConstraints(minWidth: height, minHeight: height, maxHeight: height),
      padding: EdgeInsets.symmetric(horizontal: _padX[size]!),
      decoration: decoration(height),
      child: Center(widthFactor: 1, heightFactor: 1, child: body),
    );
  }
}

/// What a badge's marker paints.
class _BadgePaint {
  const _BadgePaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

/// The five weights, said the way a control says them: the marker is the
/// thing being coloured, so it takes the tint. [MPVariant.filled] is the
/// Material badge.
_BadgePaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _BadgePaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _BadgePaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _BadgePaint(
        fill: colors.surfaceContainerLow,
        ink: accent.color,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _BadgePaint(
        fill: colors.surfaceContainer,
        ink: accent.color,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _BadgePaint(fill: const Color(0x00000000), ink: accent.color);
  }
}

/// Pins the marker to one corner of the anchor, pulled [offset] logical pixels
/// out of it and [inset] of the anchor's width back in.
///
/// A directional position rather than a translation, so the corner flips with
/// the writing direction and the digits are never resampled at a fractional
/// offset, which is what makes a badge's `9` look softer than the text around
/// it.
class _Corner extends StatelessWidget {
  const _Corner({
    required this.placement,
    required this.offset,
    required this.inset,
    required this.child,
  });

  final MPCorner placement;
  final double offset;
  final double inset;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool top = placement == MPCorner.topStart || placement == MPCorner.topEnd;
    final bool start = placement == MPCorner.topStart || placement == MPCorner.bottomStart;

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double pull = offset - constraints.maxWidth * inset;

        return Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            PositionedDirectional(
              top: top ? -pull : null,
              bottom: top ? null : -pull,
              start: start ? -pull : null,
              end: start ? null : -pull,
              child: child,
            ),
          ],
        );
      },
    );
  }
}
