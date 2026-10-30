/// A sequence being worked through, with one panel at a time.
library;

import 'dart:math' as math;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How the line from one step to the next is drawn.
enum MPStepConnector {
  /// An unbroken line, and the default.
  solid,

  /// Dashes: a step that may be skipped, or one the sequence has not committed
  /// to yet.
  dashed,

  /// Dots, quieter still.
  dotted,

  /// No line at all.
  none,
}

/// How far a step has got. Where it is in the sequence, which [MPStep.error]
/// does not change: what happened to it is a second question.
enum _StepStatus { complete, current, upcoming }

/// The bullet's diameter: 14, 16, 20, 24, 30.
const Map<MPSize, double> _bulletSize = <MPSize, double>{
  MPSize.xs: 14,
  MPSize.sm: 16,
  MPSize.md: 20,
  MPSize.lg: 24,
  MPSize.xl: 30,
};

/// Between a vertical step's bullet and its words.
const Map<MPSize, double> _bulletGap = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// After a step and before the next, down a vertical rail or across a
/// horizontal one.
const Map<MPSize, double> _itemGap = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 24,
  MPSize.md: 28,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// The connector's stroke, and the upcoming bullet's ring.
const double _stroke = 2;

/// The halo round the current bullet.
const double _halo = 4;

/// Between a horizontal step's bullet and its words.
const double _bodyGapY = 8;

/// Between the rail and the panel under it.
const double _panelGap = 16;

/// Between the title and the lines under it.
const double _lineGap = 2;

const Color _clear = Color(0x00000000);

/// What a step learns from the stepper around it.
class _StepperData {
  const _StepperData({
    required this.size,
    required this.color,
    required this.orientation,
    required this.active,
    required this.onSelect,
    required this.linear,
    required this.count,
    required this.furthest,
    required this.hasPanel,
  });

  final MPSize size;
  final MPColor color;
  final MPOrientation orientation;
  final int active;

  /// `null` on a stepper nobody is driving, which makes every step unpressable.
  final ValueChanged<int>? onSelect;
  final bool linear;

  /// How many steps there are, so the last one knows not to draw a line.
  final int count;

  /// Which steps a linear stepper may jump back to.
  final int furthest;

  /// Whether the active step has a panel for a press to open.
  final bool hasPanel;

  @override
  bool operator ==(Object other) {
    return other is _StepperData &&
        other.size == size &&
        other.color == color &&
        other.orientation == orientation &&
        other.active == active &&
        other.onSelect == onSelect &&
        other.linear == linear &&
        other.count == count &&
        other.furthest == furthest &&
        other.hasPanel == hasPanel;
  }

  @override
  int get hashCode =>
      Object.hash(size, color, orientation, active, onSelect, linear, count, furthest, hasPanel);
}

class _StepScope extends InheritedWidget {
  const _StepScope({required this.stepper, required this.index, required super.child});

  final _StepperData stepper;
  final int index;

  static _StepScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_StepScope>();
  }

  @override
  bool updateShouldNotify(_StepScope oldWidget) {
    return stepper != oldWidget.stepper || index != oldWidget.index;
  }
}

/// A sequence being worked through, with one panel at a time.
///
/// ```dart
/// MPStepper(
///   active: step,
///   onActiveChange: (int next) => setState(() => step = next),
///   children: const <Widget>[
///     MPStep(label: Text('Account'), child: AccountForm()),
///     MPStep(label: Text('Payment'), child: PaymentForm()),
///     MPStep(label: Text('Done')),
///   ],
/// )
/// ```
///
/// ## A controlled stepper with no handler is a progress indicator
///
/// Given [active] and no [onActiveChange], the steps say where the reader is
/// and offer no way to move, which is the right shape for a sequence the app
/// drives with its own Next and Back. An uncontrolled stepper moves itself when
/// a step is pressed, handler or not.
///
/// ## It ships no Next and Back
///
/// On purpose. Those buttons belong to the form: what "next" means is whether
/// the current step validates, and a library that drew them would either have
/// to guess that or ask for a validator per step.
///
/// ## Reachability
///
/// [linear] decides which steps a press may reach. Going back is always
/// allowed; what a linear stepper refuses is jumping forward past the furthest
/// step the reader has got to. An unreachable step stays a focus stop, said to
/// be unavailable, so a reader moving along the rail is told why it will not
/// open instead of finding a gap.
class MPStepper extends StatefulWidget {
  /// Creates a stepper over [children], usually [MPStep]s.
  const MPStepper({
    required this.children,
    this.active,
    this.initialActive = 0,
    this.onActiveChange,
    this.linear = true,
    this.orientation = MPOrientation.horizontal,
    this.size,
    this.color,
    super.key,
  });

  /// The steps. The stepper numbers them as it walks them, so a step is never
  /// told where it is.
  final List<Widget> children;

  /// Which step is being worked on now, counting from zero. Everything before
  /// it is complete and everything after it is still to come. Left `null`, the
  /// stepper keeps its own, starting at [initialActive].
  final int? active;

  /// Where an uncontrolled stepper starts.
  final int initialActive;

  /// Called with the step that was pressed. Left out of a controlled stepper,
  /// the steps cannot be pressed at all.
  final ValueChanged<int>? onActiveChange;

  /// Whether a step can only be reached once the ones before it are done.
  ///
  /// On by default, because that is what a sequence is: a checkout that let
  /// somebody press Payment before Address would be offering a step it cannot
  /// complete. Off, every step is reachable at any time.
  final bool linear;

  /// Which way the sequence runs. Horizontal is a stepper's default, a small
  /// number of short labels across the top of a task; vertical takes a
  /// description per step without the rail becoming a row of columns.
  final MPOrientation orientation;

  /// The bullet and the type scale. [MPSize.md] unless an [MPConfigProvider]
  /// says otherwise.
  final MPSize? size;

  /// Which accent family the rail reads. A step can name its own.
  final MPColor? color;

  @override
  State<MPStepper> createState() => _MPStepperState();
}

class _MPStepperState extends State<MPStepper> {
  late int _own = widget.initialActive;

  /// The furthest step reached, which is not the same as the current one: a
  /// reader who has got to step three and gone back to step one can still
  /// return to three.
  late int _furthest = widget.active ?? widget.initialActive;

  bool get _controlled => widget.active != null;

  void _select(int index) {
    if (!_controlled) {
      setState(() => _own = index);
    }

    widget.onActiveChange?.call(index);
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final int active = widget.active ?? _own;

    // Derived as the stepper is built rather than after, so the rail is never
    // drawn one frame behind the step it is already showing.
    _furthest = math.max(_furthest, active);

    final List<Widget> steps = widget.children;
    final Widget? current = active >= 0 && active < steps.length ? steps[active] : null;
    final MPStep? currentStep = current is MPStep ? current : null;
    final Widget? panel = currentStep?.child;
    final bool horizontal = widget.orientation == MPOrientation.horizontal;

    final _StepperData data = _StepperData(
      size: size,
      color: color,
      orientation: widget.orientation,
      active: active,
      onSelect: widget.onActiveChange != null || !_controlled ? _select : null,
      linear: widget.linear,
      count: steps.length,
      furthest: _furthest,
      hasPanel: panel != null,
    );

    final List<Widget> rail = <Widget>[
      for (int index = 0; index < steps.length; index += 1)
        _StepScope(stepper: data, index: index, child: steps[index]),
    ];

    // The rail is a list, pressable steps or not: a sequence is an ordered set
    // of things either way, and a screen reader saying "3 of 5" is the reason
    // to say so.
    final Widget list = Semantics(
      role: SemanticsRole.list,
      explicitChildNodes: true,
      child: horizontal
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[for (final Widget step in rail) Expanded(child: step)],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: rail,
            ),
    );

    if (panel == null) {
      return list;
    }

    // Named after the step that is open, by the step's own title rather than a
    // second string: a panel that said something other than the step above it
    // would be two names for one thing.
    final String? name = mpTextOf(currentStep!.label);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        list,
        // One panel, under the rail rather than inside its step: a step holding
        // a whole form would make a horizontal rail a row of columns. Keyed by
        // the step, so moving on builds the next panel afresh rather than
        // handing it the last one's state wherever the two have the same shape.
        Padding(
          key: ValueKey<int>(active),
          padding: const EdgeInsets.only(top: _panelGap),
          child: Semantics(container: true, explicitChildNodes: true, label: name, child: panel),
        ),
      ],
    );
  }
}

/// One step in a sequence.
///
/// Its index is not a parameter and cannot be: a step told where it was in
/// the list is a step every caller could put in the wrong place. The stepper
/// numbers its children as it walks them, and a step outside a stepper is one
/// step with nothing before or after it.
class MPStep extends StatelessWidget {
  /// Creates a step.
  const MPStep({
    this.label,
    this.description,
    this.bullet,
    this.error = false,
    this.optional,
    this.disabled = false,
    this.connector = MPStepConnector.solid,
    this.color,
    this.focusNode,
    this.child,
    super.key,
  });

  /// What the step is called, usually a [Text]. Its words also name the panel
  /// the step opens.
  final Widget? label;

  /// A second line under it: what the step is for, or what it is waiting on.
  final Widget? description;

  /// What goes inside the bullet.
  ///
  /// Left out, a complete step draws a tick, a failed one its error glyph and
  /// every other one its number, which is what a stepper's bullet is for and
  /// why this is an override rather than the usual way in.
  final Widget? bullet;

  /// Marks the step as failed. It is drawn in `error` and keeps its place in
  /// the sequence, because a sequence with a hole in it is one the reader
  /// cannot count.
  final bool error;

  /// A note under the label: *Optional*, *Skipped*, *2 of 3 done*.
  ///
  /// A widget rather than a switch: a switch would mean the library shipping
  /// the word *Optional* in every language. The caller has the word already,
  /// in their own copy.
  final Widget? optional;

  /// Refuses the press whatever the reachability rule says.
  final bool disabled;

  /// How the line to the next step is drawn.
  final MPStepConnector connector;

  /// Re-points this step's accent family. [MPStep.error] alone turns it to
  /// [MPColor.error].
  final MPColor? color;

  /// Drives the step's focus from outside.
  final FocusNode? focusNode;

  /// The step's own panel, drawn only while the step is active.
  ///
  /// Which is the half a stepper has that a timeline does not: a wizard is a
  /// rail and one panel, and keeping the other panels built would keep their
  /// state alive behind the reader's back.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final _StepScope? scope = _StepScope.maybeOf(context);
    final _StepperData? stepper = scope?.stepper;
    final int index = scope?.index ?? 0;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);

    final MPSize size = stepper?.size ?? config?.size ?? MPSize.md;
    final MPOrientation orientation = stepper?.orientation ?? MPOrientation.horizontal;
    final int active = stepper?.active ?? 0;
    final int count = stepper?.count ?? 1;
    final int furthest = stepper?.furthest ?? 0;
    final bool linear = stepper?.linear ?? true;

    final _StepStatus status = index < active
        ? _StepStatus.complete
        : index == active
        ? _StepStatus.current
        : _StepStatus.upcoming;

    // A failed step swaps the family rather than adding a fourth state: where
    // it is in the sequence and what happened to it are two questions.
    final MPColor family =
        color ?? (error ? MPColor.error : stepper?.color ?? config?.color ?? MPColor.primary);

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(family);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    final bool horizontal = orientation == MPOrientation.horizontal;
    final bool last = index == count - 1;
    final bool drawsConnector = connector != MPStepConnector.none && !last;

    // Back is always allowed; what `linear` refuses is jumping past the step
    // the reader has actually reached.
    final bool reachable = !disabled && (!linear || index <= furthest);
    // A step is a button whenever somebody drives the stepper, reachable or
    // not, so an unreachable one keeps its place among the stops and can say
    // why it will not open.
    final ValueChanged<int>? onSelect = stepper?.onSelect;
    final bool driven = onSelect != null;
    final bool pressable = driven && reachable;
    final bool hasPanel = stepper?.hasPanel ?? false;

    final double bulletSize = _bulletSize[size]!;

    final Widget mark = _Bullet(
      status: status,
      size: bulletSize,
      accent: accent,
      colors: colors,
      duration: duration,
      child:
          bullet ??
          (status == _StepStatus.complete && !error
              ? MPGlyph(MPGlyphShape.check, size: bulletSize * 0.6)
              : error
              ? _ErrorGlyph(size: bulletSize * 0.6)
              : Text('${index + 1}')),
    );

    final TextStyle meta = theme.typescale.bodySmall.style(colors.onSurfaceVariant);
    final Color title = error
        ? colors.error
        : switch (status) {
            _StepStatus.complete => colors.onSurface,
            _StepStatus.current => accent.color,
            _StepStatus.upcoming => colors.onSurfaceVariant,
          };

    final Widget body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: _lineGap,
      children: <Widget>[
        if (label != null)
          // Eased with the bullet as the sequence reaches or leaves the step,
          // as the React title eases its colour.
          TweenAnimationBuilder<Color?>(
            tween: ColorTween(end: title),
            duration: duration,
            curve: MPMotion.standard,
            builder: (BuildContext context, Color? ink, Widget? child) {
              return DefaultTextStyle.merge(
                style: mpSheetTitle(theme.typescale, size).style(ink),
                child: child!,
              );
            },
            child: label,
          ),
        if (optional != null) DefaultTextStyle.merge(style: meta, child: optional!),
        if (description != null) DefaultTextStyle.merge(style: meta, child: description!),
      ],
    );

    final Widget content = horizontal
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              mark,
              const SizedBox(height: _bodyGapY),
              body,
            ],
          )
        : Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              mark,
              SizedBox(width: _bulletGap[size]!),
              Expanded(child: body),
            ],
          );

    // The line to the next step runs from the bullet's edge to the end of
    // this step's own box, behind nothing; the gap after the step is outside
    // it, as the React connector is positioned inside its step's button.
    final Widget? line = drawsConnector
        ? PositionedDirectional(
            start: horizontal ? bulletSize : bulletSize / 2 - _stroke / 2,
            end: horizontal ? 0 : null,
            top: horizontal ? bulletSize / 2 - _stroke / 2 : bulletSize,
            bottom: horizontal ? null : 0,
            width: horizontal ? null : _stroke,
            height: horizontal ? _stroke : null,
            child: IgnorePointer(
              child: TweenAnimationBuilder<Color?>(
                tween: ColorTween(
                  end: status == _StepStatus.complete ? accent.color : colors.outlineVariant,
                ),
                duration: duration,
                curve: MPMotion.standard,
                builder: (BuildContext context, Color? ink, Widget? _) {
                  return CustomPaint(
                    painter: _ConnectorPainter(
                      style: connector,
                      color: ink ?? colors.outlineVariant,
                      horizontal: horizontal,
                    ),
                  );
                },
              ),
            ),
          )
        : null;

    final Widget drawn = Stack(fit: StackFit.passthrough, children: <Widget>[content, ?line]);

    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    Widget step = drawn;

    if (driven) {
      step = MPInteractive(
        onTap: () => onSelect(index),
        focusNode: focusNode,
        // A stop whether or not it can be pressed, for the reason the class
        // gives; it answers only when it can.
        interactive: pressable,
        cursor: pressable ? SystemMouseCursors.click : SystemMouseCursors.basic,
        builder: (BuildContext context, MPInteraction state) {
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            container: true,
            button: true,
            enabled: reachable,
            // The nearest the framework has to `aria-current="step"`.
            selected: status == _StepStatus.current ? true : null,
            // Said only when there is a panel to open: a stepper of bare steps
            // is a progress indicator, and saying it opens something it does
            // not is a promise the screen does not keep.
            expanded: hasPanel ? status == _StepStatus.current : null,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: pressable ? () => onSelect(index) : null,
            child: CustomPaint(
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                  : null,
              child: drawn,
            ),
          );
        },
      );
    } else {
      step = Semantics(
        container: true,
        selected: status == _StepStatus.current ? true : null,
        child: drawn,
      );
    }

    return Semantics(
      role: stepper == null ? null : SemanticsRole.listItem,
      explicitChildNodes: true,
      child: Padding(
        padding: last
            ? EdgeInsets.zero
            : horizontal
            ? EdgeInsetsDirectional.only(end: _itemGap[size]!)
            : EdgeInsets.only(bottom: _itemGap[size]!),
        child: step,
      ),
    );
  }
}

/// The disc a step's number, tick or error glyph sits in.
class _Bullet extends StatelessWidget {
  const _Bullet({
    required this.status,
    required this.size,
    required this.accent,
    required this.colors,
    required this.duration,
    required this.child,
  });

  final _StepStatus status;
  final double size;
  final MPAccent accent;
  final MPColorScheme colors;
  final Duration duration;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool filled = status != _StepStatus.upcoming;
    final Color ink = filled ? accent.onColor : colors.onSurfaceVariant;

    // Sized outside the animation: the fill, the ring and the halo ease, the
    // diameter does not, so a stepper given a new size takes it at once.
    return ExcludeSemantics(
      child: SizedBox.square(
        dimension: size,
        child: _BulletFace(
          duration: duration,
          status: status,
          accent: accent,
          colors: colors,
          ink: ink,
          size: size,
          child: child,
        ),
      ),
    );
  }
}

/// The bullet's fill, ring and halo, which ease between states.
class _BulletFace extends StatelessWidget {
  const _BulletFace({
    required this.duration,
    required this.status,
    required this.accent,
    required this.colors,
    required this.ink,
    required this.size,
    required this.child,
  });

  final Duration duration;
  final _StepStatus status;
  final MPAccent accent;
  final MPColorScheme colors;
  final Color ink;
  final double size;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool filled = status != _StepStatus.upcoming;

    return AnimatedContainer(
      duration: duration,
      curve: MPMotion.standard,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: filled ? accent.color : _clear,
        border: Border.all(color: filled ? _clear : colors.outline, width: _stroke),
        // The current step's halo: a ring of the family's container, drawn
        // as a spread with no blur so it reads as a second disc and not a
        // shadow.
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: status == _StepStatus.current ? accent.container : _clear,
            spreadRadius: _halo,
          ),
        ],
      ),
      child: DefaultTextStyle(
        style: TextStyle(
          color: ink,
          fontSize: size * 0.5,
          height: 1,
          fontWeight: FontWeight.w500,
          fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
        ),
        maxLines: 1,
        child: IconTheme.merge(
          data: IconThemeData(color: ink, size: size * 0.6),
          child: child,
        ),
      ),
    );
  }
}

/// A circle with an exclamation in it: the React build's error glyph.
class _ErrorGlyph extends StatelessWidget {
  const _ErrorGlyph({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _ErrorPainter(IconTheme.of(context).color ?? const Color(0xFF000000)),
    );
  }
}

class _ErrorPainter extends CustomPainter {
  const _ErrorPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final double unit = size.shortestSide / 24;
    final Paint stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2 * unit
      ..strokeCap = StrokeCap.round;

    // Drawn in the 24-unit box its SVG uses.
    canvas
      ..drawCircle(Offset(12 * unit, 12 * unit), 10 * unit, stroke)
      ..drawLine(Offset(12 * unit, 8 * unit), Offset(12 * unit, 12 * unit), stroke)
      ..drawLine(Offset(12 * unit, 16 * unit), Offset(12.01 * unit, 16 * unit), stroke);
  }

  @override
  bool shouldRepaint(_ErrorPainter oldDelegate) => oldDelegate.color != color;
}

/// The line between two steps, solid, dashed or dotted.
class _ConnectorPainter extends CustomPainter {
  const _ConnectorPainter({required this.style, required this.color, required this.horizontal});

  final MPStepConnector style;
  final Color color;
  final bool horizontal;

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color;
    final double length = horizontal ? size.width : size.height;

    if (length <= 0) {
      return;
    }

    Rect segment(double from, double to) {
      return horizontal
          ? Rect.fromLTRB(from, 0, to, size.height)
          : Rect.fromLTRB(0, from, size.width, to);
    }

    switch (style) {
      case MPStepConnector.solid:
        canvas.drawRect(Offset.zero & size, paint);
      case MPStepConnector.dashed:
        // A browser's dashes: three strokes long, with a stroke's gap.
        const double dash = _stroke * 3;
        const double gap = _stroke * 2;

        for (double at = 0; at < length; at += dash + gap) {
          canvas.drawRect(segment(at, math.min(at + dash, length)), paint);
        }
      case MPStepConnector.dotted:
        final double radius = _stroke / 2;

        for (double at = radius; at < length; at += _stroke * 2) {
          canvas.drawCircle(
            horizontal ? Offset(at, size.height / 2) : Offset(size.width / 2, at),
            radius,
            paint,
          );
        }
      case MPStepConnector.none:
        break;
    }
  }

  @override
  bool shouldRepaint(_ConnectorPainter oldDelegate) {
    return oldDelegate.style != style ||
        oldDelegate.color != color ||
        oldDelegate.horizontal != horizontal;
  }
}
