/// A light travelling around the outside of something.
library;

import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/animate.dart'
    show
        MPAnimateLayoutBuilder,
        MPAnimateMode,
        MPAnimateRepeat,
        MPAnimateTrigger,
        MPAnimation,
        MPEasing;

/// A light travelling around the outside of something.
///
/// ```dart
/// const MPAnimateLighting(child: card)
/// ```
///
/// The light is **behind** the content rather than on it, so what a reader
/// sees is a glow escaping from under the edges — which is why it works around
/// a card or a button without touching anything about how they are drawn.
/// Nothing inside is altered, nothing is laid over it, and the content stays
/// exactly as legible as it was.
///
/// Use it to mark the one thing on a screen that is currently live: the row
/// that is processing, the field being checked, the plan being recommended. It
/// draws attention with light rather than by moving anything.
///
/// ## Two things it needs from the caller
///
/// [size] has to agree with the corner of what is inside it. The glow follows
/// that corner, so an `xl` card in an `md` light shows light poking out of four
/// corners the card has already rounded away. And "behind" only reads as
/// behind if what is inside paints a surface of its own.
///
/// The arc is decoration. When the platform has animations turned off it stops
/// travelling and becomes an even glow — still a mark, no longer a motion — so
/// whatever it was pointing at has to be sayable without it.
class MPAnimateLighting extends StatelessWidget {
  /// Creates a light around [child].
  const MPAnimateLighting({
    required this.child,
    this.color,
    this.size,
    this.spread = 3,
    this.arc = 50,
    this.blur = 4,
    this.reverse = false,
    this.duration = const Duration(milliseconds: 3000),
    this.delay = Duration.zero,
    this.repeat,
    this.alternate = false,
    this.paused = false,
    this.trigger = MPAnimateTrigger.mount,
    this.play = false,
    this.once = true,
    this.threshold = 0.2,
    super.key,
  });

  /// What is lit.
  final Widget child;

  /// Which accent family the light is drawn in. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise. Not an arbitrary colour: to change
  /// what `primary` is, set the theme's source colour.
  final MPColor? color;

  /// The corner the light follows, on the shared corner ladder. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// How far past the content the light reaches, in logical pixels.
  final double spread;

  /// How much of the outline is lit at once, in degrees. Small is a travelling
  /// spark; large is a sweep.
  final double arc;

  /// How soft the light is, in logical pixels. At `0` it is a hard-edged wedge,
  /// which reads as a graphic rather than as light.
  final double blur;

  /// Runs the light the other way round.
  final bool reverse;

  /// How long one revolution takes.
  final Duration duration;

  /// How long before it starts.
  final Duration delay;

  /// How many revolutions. `null`, the default, never stops.
  final MPAnimateRepeat repeat;

  /// Runs every other revolution the other way, so the light swings back.
  final bool alternate;

  /// Holds the light where it is.
  final bool paused;

  /// What starts it.
  final MPAnimateTrigger trigger;

  /// Runs it, when [trigger] is [MPAnimateTrigger.manual]. Each `false` →
  /// `true` starts it over.
  final bool play;

  /// With [MPAnimateTrigger.visible], whether it runs only the first time. Off,
  /// it runs again every time it comes back into view.
  final bool once;

  /// With [MPAnimateTrigger.visible], how much of the widget has to be on
  /// screen before it counts as visible, from `0` to `1`.
  final double threshold;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = this.size ?? config?.size ?? MPSize.md;
    final Color light = theme.colors.accent(color ?? config?.color ?? MPColor.primary).color;
    final double corner = _corner(theme.shapes, size);
    final BorderRadius radius = MPShapes.circular(corner);

    return MPAnimateRun(
      // Backwards is the other way round, as `animation-direction: reverse`.
      mode: reverse ? MPAnimateMode.exit : MPAnimateMode.enter,
      settings: MPAnimateSettings(
        duration: duration,
        delay: delay,
        // Linear, and not something a caller can change: a loop with no
        // beginning has nothing to decelerate into, and an eased revolution
        // reads as the light hesitating at an arbitrary point on a circle.
        curve: Curves.linear,
        repeat: repeat,
        alternate: alternate,
        paused: paused,
        trigger: trigger,
        play: play,
        once: once,
        threshold: threshold,
      ),
      frame: (BuildContext context, double t, Widget inner) {
        final Decoration glow = mpReducedMotion(context)
            // The arc stops travelling and becomes an even glow: the same trade
            // a skeleton makes, where the decoration survives and the motion
            // does not.
            ? BoxDecoration(borderRadius: radius, color: light)
            : BoxDecoration(
                borderRadius: radius,
                gradient: SweepGradient(
                  // A sweep starts at three o'clock and the React build's
                  // conic gradient at twelve, hence the quarter turn back.
                  transform: GradientRotation(t * 2 * math.pi - math.pi / 2),
                  colors: <Color>[
                    light.withValues(alpha: 0),
                    light,
                    light.withValues(alpha: 0),
                    light.withValues(alpha: 0),
                  ],
                  stops: <double>[0, _stop(arc), _stop(arc * 2), 1],
                ),
              );

        // The whole box is the run's, so a hover over the content or a scroll
        // that brings it into view is measured on what a reader sees.
        return Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            Positioned(
              left: -spread,
              top: -spread,
              right: -spread,
              bottom: -spread,
              child: IgnorePointer(
                child: ImageFiltered(
                  imageFilter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
                  child: DecoratedBox(decoration: glow),
                ),
              ),
            ),
            inner,
          ],
        );
      },
      child: child,
    );
  }
}

/// [degrees] of a turn as a gradient stop.
double _stop(double degrees) => (degrees / 360).clamp(0.0, 1.0);

/// The corner the ladder gives [size].
double _corner(MPShapes shapes, MPSize size) {
  return switch (size) {
    MPSize.xs => shapes.extraSmall,
    MPSize.sm => shapes.small,
    MPSize.md => shapes.medium,
    MPSize.lg => shapes.large,
    MPSize.xl => shapes.extraLarge,
  };
}
