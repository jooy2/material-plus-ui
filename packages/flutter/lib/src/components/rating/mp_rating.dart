/// A score out of five, as a row of stars.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// One star's height: 16, 20, 24, 30, 36.
///
/// A glyph ladder rather than the control one: a star has no label beside it
/// and no container round it, so the thing being sized *is* the drawing. `md`
/// is 24, which is what every other icon in the library draws at.
const Map<MPSize, double> _star = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 20,
  MPSize.md: 24,
  MPSize.lg: 30,
  MPSize.xl: 36,
};

/// Between the stars. Close enough to read as one row, not as five glyphs.
const Map<MPSize, double> _gap = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 2,
  MPSize.md: 4,
  MPSize.lg: 4,
  MPSize.xl: 6,
};

/// A score out of five, as a row of stars.
///
/// ```dart
/// MPRating(value: score, onChanged: (double next) => setState(() => score = next))
/// ```
///
/// An interactive rating is a set where exactly one score is taken: one focus
/// stop for the row, the arrow keys moving the score within it, and every
/// choosable score a radio of its own to a screen reader, named "3 out of 5".
///
/// The fraction is drawn by laying the filled star over the empty one and
/// cropping it to a share of the width, from the inline start, so a half star
/// is the leading half of exactly the star beside it, and it fills from the
/// right under right-to-left with nothing being told to.
///
/// [readOnly] is a different component in the same clothes: nothing to focus
/// and nothing to press, and one image carrying the score as a sentence.
///
/// ## Why the stars are not amber
///
/// Because there is no amber in this library's colour system. MD3 defines four
/// accent families, and a fifth colour written in here would be one a theme
/// has no way to change. A product whose stars must be gold themes `tertiary`
/// as gold and asks for [MPColor.tertiary].
class MPRating extends StatefulWidget {
  /// Creates a rating.
  const MPRating({
    this.value,
    this.initialValue = 0,
    this.onChanged,
    this.count = 5,
    this.precision = 1,
    this.icon,
    this.emptyIcon,
    this.clearable = true,
    this.readOnly = false,
    this.disabled = false,
    this.required = false,
    this.size,
    this.color,
    this.locale,
    this.labels,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The score. Given, the rating is controlled.
  final double? value;

  /// Where a rating that holds its own score starts.
  final double initialValue;

  /// Called with the new score. `0` is what a cleared rating reports.
  final ValueChanged<double>? onChanged;

  /// How many stars there are, and therefore the highest score.
  final int count;

  /// The smallest step that can be *chosen*, as a fraction of one star: `0.5`
  /// gives half stars, `1` whole ones. Anything outside `0 < precision <= 1`
  /// falls back to `1`.
  ///
  /// It bounds what a reader can pick and nothing else. A [value] of `4.3` is
  /// drawn as four stars and a third at every precision, because an average is
  /// not a choice.
  final double precision;

  /// The glyph a filled star is drawn with.
  final Widget? icon;

  /// The glyph an empty star is drawn with. It has to be the same shape.
  final Widget? emptyIcon;

  /// Choosing the score that is already chosen clears it back to `0`.
  final bool clearable;

  /// Shows the score without letting it be changed: a product's average, a
  /// rating somebody else left.
  ///
  /// The one read-only state in the library that does not drain the colour.
  /// There is nothing being held still here, only a picture of a number, and a
  /// row of grey stars would say the score itself was unavailable.
  final bool readOnly;

  /// Unavailable. Drops the accent for the specification's disabled ink.
  final bool disabled;

  /// Says to a screen reader that a score has to be chosen.
  final bool required;

  /// One star's height, on the glyph ladder. `md` is 24dp.
  final MPSize? size;

  /// Which accent family the filled stars read.
  final MPColor? color;

  /// Which language the spoken names are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Overrides for the words themselves (`label`, `value`, `empty`). They win
  /// over the translation.
  final Map<String, String>? labels;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPRating> createState() => _MPRatingState();
}

class _MPRatingState extends State<MPRating> {
  late double _own = widget.initialValue;

  /// What the pointer is promising, which is not the value until it is
  /// pressed. `null` is "the pointer is not on the row", not "no stars".
  double? _hovered;

  double get _value => widget.value ?? _own;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _interactive => !widget.readOnly && !_disabled;

  int get _stars => widget.count < 1 ? 1 : widget.count;

  double get _step => widget.precision > 0 && widget.precision <= 1 ? widget.precision : 1;

  int get _stepsPerStar => (1 / _step).round();

  @override
  void didUpdateWidget(MPRating oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A row that can no longer be used promises nothing.
    if (!_interactive) {
      _hovered = null;
    }
  }

  /// Rounds a score onto the step ladder, so a keyboard cannot land between
  /// two choices a pointer could never have reached.
  double _snap(double score) {
    final double clamped = score.clamp(0, _stars.toDouble()).toDouble();
    final double steps = (clamped / _step).roundToDouble();

    return double.parse((steps * _step).toStringAsFixed(4));
  }

  void _change(double next) {
    if (widget.value == null) {
      setState(() => _own = next);
    }

    widget.onChanged?.call(next);
  }

  void _choose(double score) {
    if (!_interactive) {
      return;
    }

    if (widget.clearable && score == _value) {
      _change(0);
    } else if (score != _value) {
      _change(score);
    }
  }

  bool _nudge(int steps) {
    if (!_interactive) {
      return false;
    }

    final double next = _snap(_value + steps * _step);

    if (next == _value) {
      return false;
    }

    _change(next);

    return true;
  }

  /// Home and End go to a place on the row rather than choose a score, so
  /// they do not clear: End on a full row stays on the full row.
  bool _jump(double score) {
    if (!_interactive) {
      return false;
    }

    final double next = _snap(score);

    if (next != _value) {
      _change(next);
    }

    return true;
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (!_interactive || (event is! KeyDownEvent && event is! KeyRepeatEvent)) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;

    if (mpArrowAcross(context, axis: Axis.horizontal, arrow: mpArrowAxis(key))) {
      return KeyEventResult.ignored;
    }

    // Left and right follow the writing direction, because the row does. Up
    // is more and down is less in every direction.
    final int forward = Directionality.of(context) == TextDirection.rtl ? -1 : 1;

    return switch (key) {
      LogicalKeyboardKey.arrowRight => mpArrowResult(context, moved: _nudge(forward)),
      LogicalKeyboardKey.arrowLeft => mpArrowResult(context, moved: _nudge(-forward)),
      LogicalKeyboardKey.arrowUp => mpArrowResult(context, moved: _nudge(1)),
      LogicalKeyboardKey.arrowDown => mpArrowResult(context, moved: _nudge(-1)),
      LogicalKeyboardKey.home => _jump(0) ? KeyEventResult.handled : KeyEventResult.ignored,
      LogicalKeyboardKey.end =>
        _jump(_stars.toDouble()) ? KeyEventResult.handled : KeyEventResult.ignored,
      _ => KeyEventResult.ignored,
    };
  }

  /// A score as a sentence: "3 out of 5", or "Not rated" at nought. Written
  /// as a whole number when it is one, so a whole star is not read out with a
  /// trailing ".0".
  String _describe(Map<String, String> messages, double score) {
    if (score <= 0) {
      return messages['empty']!;
    }

    final String written = score == score.roundToDouble()
        ? score.round().toString()
        : score.toString();

    return mpFillMessage(messages['value']!, <String, String>{'value': written, 'max': '$_stars'});
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPAccent accent = colors.accent(widget.color ?? config?.color ?? MPColor.primary);
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpRatingMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );
    final bool disabled = _disabled;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final double box = _star[size]!;
    final Color drained = colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    final Color empty = disabled ? drained : colors.outline;
    final Color full = disabled ? drained : accent.color;
    final double value = _value;
    final double shown = (_hovered ?? value).clamp(0, _stars.toDouble()).toDouble();

    Widget starAt(int index, {required bool ringed}) {
      final double fill = (shown - index).clamp(0.0, 1.0);

      Widget star = SizedBox.square(
        dimension: box,
        child: Stack(
          children: <Widget>[
            Positioned.fill(
              child: IconTheme.merge(
                data: IconThemeData(color: empty, size: box),
                child: widget.emptyIcon ?? MPGlyph(MPGlyphShape.starOutline, size: box),
              ),
            ),
            // The filled copy, cropped to the fraction. The crop travels on
            // `short2`, quick enough to arrive under a pointer sweeping across
            // the row rather than a star behind it.
            Positioned.fill(
              child: TweenAnimationBuilder<double>(
                tween: Tween<double>(end: fill),
                duration: reduceMotion ? Duration.zero : MPMotion.short2,
                curve: MPMotion.standard,
                builder: (BuildContext context, double cropped, Widget? child) {
                  return ClipRect(
                    clipper: _LeadingClipper(
                      fraction: cropped,
                      direction: Directionality.of(context),
                    ),
                    child: child,
                  );
                },
                child: TweenAnimationBuilder<Color?>(
                  tween: ColorTween(end: full),
                  duration: reduceMotion ? Duration.zero : MPMotion.short4,
                  curve: MPMotion.standard,
                  builder: (BuildContext context, Color? ink, Widget? child) {
                    return IconTheme.merge(
                      data: IconThemeData(color: ink, size: box),
                      child: child!,
                    );
                  },
                  child: widget.icon ?? MPGlyph(MPGlyphShape.star, size: box),
                ),
              ),
            ),
            if (!widget.readOnly)
              Positioned.fill(
                child: Row(
                  children: <Widget>[
                    for (int part = 0; part < _stepsPerStar; part += 1)
                      Expanded(child: _region(_snap(index + (part + 1) * _step), messages)),
                  ],
                ),
              ),
          ],
        ),
      );

      if (!widget.readOnly && !disabled) {
        star = CustomPaint(
          foregroundPainter: ringed
              ? MPFocusRingPainter(
                  color: colors.secondary,
                  borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
                )
              : null,
          child: star,
        );
      }

      return star;
    }

    // The star the keyboard is on: the one holding the score, or the first
    // while there is none, as the radio that takes the focus is the checked
    // one, or the first.
    final int current = value <= 0 ? 0 : (value / 1).ceil().clamp(1, _stars) - 1;

    Widget row(bool focusVisible) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        spacing: _gap[size]!,
        children: <Widget>[
          for (int index = 0; index < _stars; index += 1)
            starAt(index, ringed: focusVisible && index == current),
        ],
      );
    }

    if (widget.readOnly) {
      // One image with a sentence for a name, rather than five glyphs and a
      // set of radios. What is left here is a picture of a number.
      return Semantics(
        container: true,
        image: true,
        label: _describe(messages, value.clamp(0, _stars.toDouble()).toDouble()),
        child: ExcludeSemantics(child: row(false)),
      );
    }

    return Semantics(
      container: true,
      role: SemanticsRole.radioGroup,
      label: messages['label'],
      enabled: !disabled,
      isRequired: widget.required ? true : null,
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onKeyEvent: _onKey,
        child: MouseRegion(
          onExit: (_) => setState(() => _hovered = null),
          child: MPInteractive(
            enabled: !disabled,
            interactive: !disabled,
            focusNode: widget.focusNode,
            autofocus: widget.autofocus,
            focusSemantics: true,
            // The stars answer the pointer themselves; the row is only the
            // focus stop and the keys.
            behavior: HitTestBehavior.translucent,
            shortcuts: const <ShortcutActivator, Intent>{},
            cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
            builder: (BuildContext context, MPInteraction state) => row(state.focusVisible),
          ),
        ),
      ),
    );
  }

  /// One choosable fraction of one star: a hit target, a hover preview, and a
  /// radio of its own to a screen reader.
  Widget _region(double score, Map<String, String> messages) {
    final bool interactive = _interactive;

    return MouseRegion(
      onEnter: (_) {
        if (interactive) {
          setState(() => _hovered = score);
        }
      },
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: () => _choose(score),
        child: Semantics(
          container: true,
          inMutuallyExclusiveGroup: true,
          checked: _value == score,
          enabled: interactive,
          label: _describe(messages, score),
          onTap: interactive ? () => _choose(score) : null,
          child: const SizedBox.expand(),
        ),
      ),
    );
  }
}

/// Crops a glyph to a share of its width, from the leading edge.
///
/// A clipper rather than a narrower box, because the glyph has to keep its
/// own full width or it would be squashed into the visible part instead of
/// cropped by it.
class _LeadingClipper extends CustomClipper<Rect> {
  const _LeadingClipper({required this.fraction, required this.direction});

  final double fraction;
  final TextDirection direction;

  @override
  Rect getClip(Size size) {
    final double width = size.width * fraction;

    return direction == TextDirection.rtl
        ? Rect.fromLTWH(size.width - width, 0, width, size.height)
        : Rect.fromLTWH(0, 0, width, size.height);
  }

  @override
  bool shouldReclip(_LeadingClipper oldClipper) {
    return oldClipper.fraction != fraction || oldClipper.direction != direction;
  }
}
