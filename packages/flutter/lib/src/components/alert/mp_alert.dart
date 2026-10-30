/// A message about something that happened, set into the page it is about.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart' show OverflowBoxFit;
import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/target.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How loudly an alert announces itself.
enum MPAlertLive {
  /// Interrupts whatever a screen reader is in the middle of saying.
  assertive,

  /// Waits for a pause.
  polite,

  /// Announces nothing, and is read only by somebody who walks into it.
  ///
  /// The one worth knowing about. A live region is for content that
  /// *arrives*, and an alert that was on the screen when it was built did not
  /// arrive: interrupting to read it is interrupting to say something the
  /// reader was going to reach anyway.
  off,
}

/// The diameter of the dismiss button, the React build's `size-8`.
const double _closeSize = 32;

/// What the dismiss button takes from the row: its 32px less the 4px margin
/// it gives back on every side, so it lines up with the glyphs while its
/// state layer still has room to show.
const double _closeFootprint = 24;

/// A message about something that happened, set into the page it is about.
///
/// ```dart
/// MPAlert(
///   color: MPColor.error,
///   title: const Text('We could not charge your card'),
///   onClose: dismiss,
///   child: const Text('The bank declined the payment. Nothing has been billed.'),
/// )
/// ```
///
/// The three shapes people mean by "an alert" are one widget with different
/// slots filled rather than three widgets: a bare line (`showIcon: false`), a
/// line with a glyph (the default), and a glyph with a headline and the detail
/// under it ([title] plus [child]). Nothing about the surface changes between
/// them, only how much of it is used.
///
/// Unlike a card, an alert takes the accent onto its *own* surface. A card is
/// a box holding somebody else's content, so dyeing it would dye their
/// content's background; an alert *is* the message, and which family it reads
/// is the message's main claim.
///
/// ## Why this is not a snackbar
///
/// An alert belongs to the flow of the page it interrupts; a snackbar floats
/// over it and leaves on a timer. A message the reader has to act on must not
/// be able to disappear before it has been read, and a message about the
/// page's *current* state has to still be there when they look back at it.
class MPAlert extends StatefulWidget {
  /// Creates an alert.
  const MPAlert({
    this.child,
    this.title,
    this.variant = MPVariant.tonal,
    this.color,
    this.size,
    this.density,
    this.icon,
    this.showIcon = true,
    this.action,
    this.live,
    this.onClose,
    this.closeLabel,
    this.locale,
    super.key,
  });

  /// The message.
  final Widget? child;

  /// The heading line. With it the alert is two-part, a headline and the
  /// detail under it; without it the whole thing is one line.
  final Widget? title;

  /// How much surface the alert paints.
  ///
  /// [MPVariant.tonal] rather than [MPVariant.filled], which is the one place
  /// this component's default differs from a button's. A container tone is
  /// MD3's own answer for a message set into a page: it separates itself from
  /// the surface without competing with the primary action that is usually
  /// sitting right beside it.
  final MPVariant variant;

  /// Which accent family it reads.
  ///
  /// Four roles, not a severity ladder: there is no `info`, `success` or
  /// `warning`, because the specification's colour system has no way to
  /// derive them. [MPColor.error] is the one severity Material does name.
  final MPColor? color;

  /// The room inside, and the type scale of the text in it.
  final MPSize? size;

  /// Takes room out of the message without shrinking it, `0` to `-3`.
  ///
  /// The step that matters on an alert is the first one. A form reporting
  /// four invalid fields stacks a lot of padding, and `-1` gives most of it
  /// back while leaving the text at the size a message has to be read at.
  final MPDensity? density;

  /// The glyph at the start. Left out, the one that goes with [color]: the
  /// error family gets the error mark and everything else the informational
  /// one. An alert that means "this worked" says so with an icon of its own
  /// rather than by having the library guess from a colour.
  final Widget? icon;

  /// Whether a glyph is drawn at all.
  ///
  /// The pair says what React says with one three-way prop: Dart has no value
  /// that is neither `null` nor a widget, so "take it away" gets its own name.
  final bool showIcon;

  /// Content pinned to the end of the row: a "Retry" button, a link. Kept out
  /// of [child] so it stays on the first line while the message wraps.
  final Widget? action;

  /// How loudly it announces itself.
  ///
  /// Left out, [MPAlertLive.assertive] for the error family and
  /// [MPAlertLive.polite] for the other three, which is the right split for a
  /// message that *appeared*. Reach for [MPAlertLive.off] when the alert was
  /// on the screen before the reader was.
  final MPAlertLive? live;

  /// Passing it is what makes the dismiss button appear.
  ///
  /// **It fires when the alert has finished leaving, not when the × is
  /// pressed.** An alert is in the flow of the page, so taking one out moves
  /// everything under it, and the caller owns whether it is built. So the
  /// press starts the exit, the alert folds its own height away, and this is
  /// the end of it, roughly 200ms later: the moment `if (open) MPAlert(...)`
  /// wants to hear about.
  final VoidCallback? onClose;

  /// The dismiss button's name for a screen reader. Defaults to the word for
  /// "dismiss" in [locale].
  final String? closeLabel;

  /// Which language the dismiss button's default name is in. Falls back to
  /// the nearest `MPLocaleProvider`, then to the app's locale, then to
  /// English.
  final String? locale;

  @override
  State<MPAlert> createState() => _MPAlertState();
}

class _MPAlertState extends State<MPAlert> with SingleTickerProviderStateMixin {
  late final AnimationController _exit = AnimationController(
    vsync: this,
    duration: MPMotion.short4,
  );

  // Accelerating, which is what everything else in the library takes on its
  // way out: something leaving has already said what it had to say.
  late final Animation<double> _left = CurvedAnimation(
    parent: _exit,
    curve: MPMotion.emphasizedAccelerate,
  );

  bool _leaving = false;

  @override
  void dispose() {
    _exit.dispose();
    super.dispose();
  }

  Future<void> _close() async {
    // Once. A second press during the exit would call back twice for one
    // dismissal.
    if (_leaving) {
      return;
    }

    setState(() => _leaving = true);

    // An alert with no exit to wait for still has to say it is gone: a
    // reader who asked for less motion would otherwise be left with a
    // dismissed alert still on the screen.
    if (!(MediaQuery.maybeDisableAnimationsOf(context) ?? false)) {
      // `orCancel` so an alert taken out mid-exit does not leave this
      // waiting for a ticker that will never finish.
      await _exit.forward().orCancel.catchError((Object _) {});
    }

    if (mounted) {
      widget.onClose?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPDensity density = widget.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);
    final MPVariant variant = widget.variant;

    final _AlertPaint paint = _paintFor(colors, accent, variant);
    final MPTypeRole prose = mpProseText(theme.typescale, size);
    final double line = prose.lineHeight;
    final double icon = mpControlIcon[size]!;
    final bool titled = widget.title != null;

    // The glyph, the action and the × centre on the *first line* of text
    // whatever the type scale turns out to be, so a one-line alert looks
    // centred and a three-line one still has its glyph at the top. A slot
    // taller than the line, a button in `action`, overhangs it into the
    // padding rather than pushing the message down.
    Widget onFirstLine(Widget slot) {
      return SizedBox(
        height: line,
        child: OverflowBox(
          fit: OverflowBoxFit.deferToChild,
          minHeight: 0,
          maxHeight: double.infinity,
          child: slot,
        ),
      );
    }

    final Widget content = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (widget.showIcon) ...<Widget>[
          onFirstLine(
            IconTheme.merge(
              data: IconThemeData(color: paint.accent, size: icon),
              child: widget.icon ?? MPGlyph(severityGlyph(color)),
            ),
          ),
          SizedBox(width: mpSheetGap[size]),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (titled)
                DefaultTextStyle.merge(
                  style: mpSheetTitle(theme.typescale, size).style(paint.accent),
                  child: IconTheme.merge(
                    data: IconThemeData(color: paint.accent),
                    child: widget.title!,
                  ),
                ),
              if (titled && widget.child != null) SizedBox(height: mpStackGap[size]),
              if (widget.child != null)
                // Under a heading the message is supporting detail and steps
                // back to the muted ink. On its own it *is* the alert, and
                // stays reading text.
                DefaultTextStyle.merge(
                  style: TextStyle(color: titled ? paint.detail : null),
                  child: widget.child!,
                ),
            ],
          ),
        ),
        if (widget.action != null) ...<Widget>[
          SizedBox(width: mpSheetGap[size]),
          onFirstLine(MPTarget(child: widget.action!)),
        ],
        if (widget.onClose != null) ...<Widget>[
          SizedBox(width: mpSheetGap[size]),
          SizedBox(
            width: _closeFootprint,
            child: onFirstLine(
              _CloseButton(
                label:
                    widget.closeLabel ??
                    mpMessagesOf(context, mpAlertMessages, locale: widget.locale)['dismiss']!,
                ink: paint.ink,
                ring: colors.secondary,
                icon: icon,
                onPressed: _leaving ? null : _close,
              ),
            ),
          ),
        ],
      ],
    );

    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);

    final Widget box = Container(
      width: double.infinity,
      padding: EdgeInsets.all(mpSheetPadOf(size, density)),
      decoration: BoxDecoration(
        color: paint.fill,
        borderRadius: radius,
        border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
        boxShadow: paint.shadows,
      ),
      child: DefaultTextStyle.merge(
        style: prose.style(paint.ink),
        child: IconTheme.merge(
          data: IconThemeData(color: paint.ink),
          child: MPTargetScope(child: content),
        ),
      ),
    );

    final MPAlertLive live =
        widget.live ?? (color == MPColor.error ? MPAlertLive.assertive : MPAlertLive.polite);

    // Flutter's live region has one politeness level, and it is polite. The
    // web engine also reads a node's role, so there an assertive alert is
    // `role="alert"`, as the React build's is; a role and a live region
    // cannot be on one node, and elsewhere the role announces nothing, so
    // there the alert is the one live region the platform has.
    final bool announcesByRole = kIsWeb && live == MPAlertLive.assertive;

    final Widget announced = Semantics(
      container: true,
      role: announcesByRole ? SemanticsRole.alert : null,
      liveRegion: live != MPAlertLive.off && !announcesByRole ? true : null,
      child: box,
    );

    // The collapse, and why the alert runs it itself: it sits in the flow of
    // the page, the caller owns whether it is built, and a callback that
    // fired on the press would have taken it away before there was anything
    // to animate. The space goes with it, so nothing under it jumps.
    //
    // The tree is the same shape whether it is leaving or not. Clipping is the
    // animation's, not the alert's: one that went on clipping would cut the
    // focus ring off its own dismiss button.
    return AnimatedBuilder(
      animation: _left,
      builder: (BuildContext context, Widget? child) {
        return ClipRect(
          clipBehavior: _leaving ? Clip.hardEdge : Clip.none,
          child: Align(
            alignment: AlignmentDirectional.topStart,
            heightFactor: 1 - _left.value,
            child: Opacity(opacity: 1 - _left.value, child: child),
          ),
        );
      },
      // Unreachable the moment it starts leaving, rather than when it is
      // gone: a caller that ignores `onClose` leaves a dismissed alert on the
      // screen at no height, and nothing should be able to walk into it.
      child: IgnorePointer(
        ignoring: _leaving,
        child: ExcludeFocus(
          excluding: _leaving,
          child: ExcludeSemantics(excluding: _leaving, child: announced),
        ),
      ),
    );
  }
}

/// What an alert paints for one variant.
class _AlertPaint {
  const _AlertPaint({
    required this.fill,
    required this.ink,
    required this.accent,
    required this.detail,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  /// The surface.
  final Color fill;

  /// The message's ink.
  final Color ink;

  /// The glyph's and the heading's.
  final Color accent;

  /// The detail line's, under a heading.
  final Color detail;

  final BorderSide? border;
  final List<BoxShadow> shadows;
}

const Color _clear = Color(0x00000000);

/// The surface for [variant], and where the family shows up on it.
///
/// On `filled` and `tonal` the container *is* the accent, so the glyph, the
/// heading and the detail ride on it as one ink: colouring them again would
/// be painting the accent onto itself, and the neutral grey a detail line
/// takes elsewhere reads as damaged on a saturated fill. On the three neutral
/// surfaces the accent has nowhere else to go, so it is spent on exactly the
/// two things that say which kind of alert this is, and the message stays
/// ordinary reading text.
_AlertPaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _AlertPaint(
        fill: accent.color,
        ink: accent.onColor,
        accent: accent.onColor,
        detail: accent.onColor,
      );
    case MPVariant.tonal:
      return _AlertPaint(
        fill: accent.container,
        ink: accent.onContainer,
        accent: accent.onContainer,
        detail: accent.onContainer,
      );
    case MPVariant.elevated:
      return _AlertPaint(
        fill: colors.surfaceContainerLow,
        ink: colors.onSurface,
        accent: accent.color,
        detail: colors.onSurfaceVariant,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _AlertPaint(
        fill: _clear,
        ink: colors.onSurface,
        accent: accent.color,
        detail: colors.onSurfaceVariant,
        border: BorderSide(color: colors.outline),
      );
    case MPVariant.text:
      return _AlertPaint(
        fill: _clear,
        ink: colors.onSurface,
        accent: accent.color,
        detail: colors.onSurfaceVariant,
      );
  }
}

/// The ×: a round 32px button in the message's own ink, washed by the state
/// layer under a pointer and ringed in `secondary` on keyboard focus.
///
/// Its own hover rather than the alert's: a state layer that lit whenever the
/// pointer was anywhere in the message would say the whole alert is a button.
class _CloseButton extends StatelessWidget {
  const _CloseButton({
    required this.label,
    required this.ink,
    required this.ring,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final Color ink;
  final Color ring;
  final double icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final BorderRadius radius = BorderRadius.circular(_closeSize / 2);

    return MPTarget(
      child: MPInteractive(
        onTap: onPressed,
        enabled: onPressed != null,
        interactive: onPressed != null,
        cursor: onPressed != null ? SystemMouseCursors.click : SystemMouseCursors.basic,
        builder: (BuildContext context, MPInteraction state) {
          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            // A node of its own rather than an annotation folded into the
            // message, so a screen reader reaches the way out separately from
            // what it dismisses, and after it.
            container: true,
            button: true,
            enabled: onPressed != null,
            label: label,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: onPressed,
            child: CustomPaint(
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(color: ring, borderRadius: radius)
                  : null,
              child: MPStateLayer(
                color: ink,
                opacity: mpStateLayerOpacity(state, enabled: onPressed != null),
                borderRadius: radius,
                shape: BoxShape.circle,
                child: SizedBox.square(
                  dimension: _closeSize,
                  child: Center(
                    child: MPGlyph(MPGlyphShape.close, size: icon, color: ink),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
