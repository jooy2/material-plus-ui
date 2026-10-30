/// A card that opens when the pointer rests on something, previewing what is on
/// the other side of it.
library;

import 'dart:async';

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How long the pointer rests before the card opens, Base UI's own default.
const Duration _defaultDelay = Duration(milliseconds: 600);

/// How long the card stays once the pointer has left, Base UI's own default.
const Duration _defaultCloseDelay = Duration(milliseconds: 300);

/// How wide the card may get, per rung: React's `max-w-64` to `max-w-xl`.
///
/// One rung wider than a popover's at every step. This is a preview rather than
/// a note, and a picture with two lines, or a heading with a paragraph, broken
/// to a popover's measure takes too many lines.
const Map<MPSize, double> _maxWidth = <MPSize, double>{
  MPSize.xs: 256,
  MPSize.sm: 288,
  MPSize.md: 384,
  MPSize.lg: 448,
  MPSize.xl: 576,
};

/// A card that opens when the pointer rests on something, holding a preview of
/// what is on the other side of it.
///
/// ```dart
/// MPHoverCard(
///   trigger: profileLink,
///   title: const Text('Priya Raman'),
///   description: const Text('Platform team'),
///   child: const Text('Joined 2023. Owns the deployment pipeline.'),
/// )
/// ```
///
/// ## Where it sits between the other two popups
///
/// A tooltip is a **label**: one line, nothing to reach, and the pointer never
/// gets to it. A popover is a panel that was **asked for** by a press, so it can
/// hold a form. This one is uninvited like a tooltip and reachable like a
/// popover: the pointer can cross into it, and a link inside it can be followed.
///
/// ## Because it is uninvited, it is never the only way to anything
///
/// A touch screen has no pointer to rest, and a screen reader is not taken into
/// the card when it opens. So whatever is in here has to exist on the screen the
/// trigger leads to as well. Treat it as a shortcut, never as the place a fact
/// lives.
///
/// It opens on keyboard focus too, after the same [delay] a pointer waits,
/// which is why tabbing through a paragraph of links does not open a card for
/// each of them. A focus that arrives with a press does not open it.
///
/// ## The surface
///
/// `surfaceContainer` at elevation 2 with a `medium` corner, which is what MD3
/// gives a menu and a rich tooltip, the two things in the specification that
/// are a small sheet anchored to something. No `variant`, `color` or
/// `elevation`, for the popover's reasons.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator and
/// `MaterialApp` both provide.
class MPHoverCard extends StatefulWidget {
  /// Creates a hover card off [trigger].
  const MPHoverCard({
    required this.trigger,
    this.title,
    this.description,
    this.child,
    this.side = MPSide.bottom,
    this.align = MPAlign.center,
    this.sideOffset = 8,
    this.alignOffset = 0,
    this.arrow = false,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.delay,
    this.closeDelay,
    this.width,
    this.size,
    this.density,
    super.key,
  });

  /// What the card hangs off, drawn where it was written.
  ///
  /// Usually a text link or an avatar: the two things a reader wants to know
  /// more about without leaving the sentence they are in.
  final Widget trigger;

  /// The heading, announced as one.
  final Widget? title;

  /// A line under the heading, in the quieter ink.
  final Widget? description;

  /// The body.
  final Widget? child;

  /// Which edge of the trigger it appears on. It flips to the opposite side
  /// when there is no room.
  final MPSide side;

  /// Where it sits along that edge.
  final MPAlign align;

  /// How far it stands off the trigger, in logical pixels.
  final double sideOffset;

  /// How far it is moved along that edge, in logical pixels: towards the end
  /// of the line beside the trigger, and downwards on its left or right.
  final double alignOffset;

  /// Draws the wedge pointing at the trigger.
  ///
  /// Off by default, as on a popover: a sheet eight pixels from what opened it
  /// does not need to say what it belongs to.
  final bool arrow;

  /// Drives the card from outside. `null`, the default, leaves it to the
  /// pointer and the keyboard. [onOpenChange] reports either way.
  final bool? open;

  /// Whether an uncontrolled card starts open. React's `defaultOpen`.
  final bool initialOpen;

  /// Called whenever the card opens or closes, however it was asked.
  final ValueChanged<bool>? onOpenChange;

  /// How long the pointer has to rest on the trigger before the card opens.
  /// 600 milliseconds when left `null`, which is long enough that crossing a
  /// paragraph of links does not open four of them.
  final Duration? delay;

  /// How long the card stays after the pointer has left. 300 milliseconds when
  /// left `null`. This is what makes the gap between the trigger and the card
  /// crossable.
  final Duration? closeDelay;

  /// A hard cap on the card's width, overriding the one [size] implies.
  final double? width;

  /// The type scale and the room inside. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Takes room out of the padding, two pixels a face per step, from `0` to
  /// `-3`.
  final MPDensity? density;

  @override
  State<MPHoverCard> createState() => _MPHoverCardState();
}

class _MPHoverCardState extends State<MPHoverCard> {
  late bool _open = widget.open ?? widget.initialOpen;
  late MPSide _side = widget.side;
  Timer? _timer;

  /// What is holding the card up. The pointer on the trigger and the pointer
  /// on the card are two flags rather than one because the gap between them
  /// has neither, and a card that closed on leaving the trigger could never be
  /// reached. The keyboard's focus, on the trigger or inside the card, is kept
  /// apart from both, so a pointer brushing past does not close what the
  /// keyboard opened.
  bool _onTrigger = false;
  bool _onCard = false;
  bool _focused = false;
  bool _focusInCard = false;

  /// Whether a pointer is down on the trigger, so a focus the press brought is
  /// not taken for the keyboard's.
  bool _pressing = false;

  bool get _held => _onTrigger || _onCard || _focused || _focusInCard;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPDensity get _density => widget.density ?? MPConfigProvider.maybeOf(context)?.density ?? 0;

  @override
  void didUpdateWidget(MPHoverCard oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.side != oldWidget.side) {
      _side = widget.side;
    }

    if (widget.open != null) {
      _open = widget.open!;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _set(bool next) {
    _timer?.cancel();
    _timer = null;

    if (_open == next) {
      return;
    }

    if (widget.open == null) {
      setState(() => _open = next);
    }

    widget.onOpenChange?.call(next);
  }

  void _schedule(bool next) {
    _timer?.cancel();
    _timer = null;

    if (next == _open) {
      return;
    }

    final Duration wait = next
        ? widget.delay ?? _defaultDelay
        : widget.closeDelay ?? _defaultCloseDelay;

    if (wait == Duration.zero) {
      // Once the events delivered with this one have been heard: the pointer
      // leaving the trigger and arriving on the card can come together.
      scheduleMicrotask(() {
        if (mounted && _held == next) {
          _set(next);
        }
      });

      return;
    }

    _timer = Timer(wait, () {
      // Read again on the way out: the pointer may have crossed the gap into
      // the card while the timer ran.
      if (mounted && _held == next) {
        _set(next);
      }
    });
  }

  void _track({bool? trigger, bool? card, bool? focused, bool? focusInCard}) {
    _onTrigger = trigger ?? _onTrigger;
    _onCard = card ?? _onCard;
    _focused = focused ?? _focused;
    _focusInCard = focusInCard ?? _focusInCard;

    _schedule(_held);
  }

  void _dismiss() {
    _onTrigger = false;
    _onCard = false;
    _focused = false;
    _set(false);
  }

  /// Lets go of a press once its own handlers have run. A focus a tap asks
  /// for is applied in a microtask after the pointer comes up, and it is still
  /// the press's focus rather than the keyboard's.
  void _endPress() {
    Timer.run(() => _pressing = false);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final double corner = theme.shapes.medium;
    final bool header = widget.title != null || widget.description != null;

    Widget card = ConstrainedBox(
      constraints: BoxConstraints(maxWidth: widget.width ?? _maxWidth[size]!),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.surfaceContainer,
          borderRadius: BorderRadius.circular(corner),
          boxShadow: MPShadows.of(2),
        ),
        child: Padding(
          padding: EdgeInsets.all(mpSheetPadOf(size, _density)),
          child: DefaultTextStyle.merge(
            style: mpProseText(theme.typescale, size).style(colors.onSurface),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: mpSheetGap[size]!,
              children: <Widget>[
                if (header)
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      if (widget.title != null)
                        Semantics(
                          header: true,
                          child: DefaultTextStyle.merge(
                            style: mpSheetTitle(theme.typescale, size).style(colors.onSurface),
                            child: widget.title!,
                          ),
                        ),
                      if (widget.description != null)
                        DefaultTextStyle.merge(
                          style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                          child: widget.description!,
                        ),
                    ],
                  ),
                ?widget.child,
              ],
            ),
          ),
        ),
      ),
    );

    if (widget.arrow) {
      card = MPPopupArrow(
        side: _side,
        align: widget.align,
        size: mpPopupArrowSize[size]!,
        color: colors.surfaceContainer,
        inset: corner,
        child: card,
      );
    }

    if (widget.alignOffset != 0) {
      final bool vertical = _side == MPSide.top || _side == MPSide.bottom;
      final bool rtl = Directionality.of(context) == TextDirection.rtl;

      card = Transform.translate(
        offset: vertical
            ? Offset(rtl ? -widget.alignOffset : widget.alignOffset, 0)
            : Offset(0, widget.alignOffset),
        child: card,
      );
    }

    // The card is reachable, which is the whole difference from a tooltip: the
    // pointer can cross into it, and the keyboard can move into it, and either
    // holds it up while it is there.
    card = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (bool has) => _track(focusInCard: has),
      child: MouseRegion(
        onEnter: (_) => _track(card: true),
        onExit: (_) => _track(card: false),
        // A card a screen reader lands on is one node holding its heading,
        // its line and its body, rather than three floating pieces.
        child: Semantics(container: true, explicitChildNodes: true, child: card),
      ),
    );

    Widget trigger = MouseRegion(
      onEnter: (_) => _track(trigger: true),
      onExit: (_) => _track(trigger: false),
      child: Listener(
        // A press is not a rest. It leaves whatever was holding the card up,
        // so the trigger can be followed without a card opening on the way.
        onPointerDown: (_) {
          _pressing = true;
          _onTrigger = false;
          _focused = false;
          _schedule(_held);
        },
        onPointerUp: (_) => _endPress(),
        onPointerCancel: (_) => _endPress(),
        child: widget.trigger,
      ),
    );

    // The keyboard's way in: a reader who tabs onto the link gets the preview a
    // pointer would, which is the half a hover-only card loses.
    trigger = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (bool has) {
        if (has && _pressing) {
          return;
        }

        _track(focused: has);
      },
      child: trigger,
    );

    return MPAnchoredPortal(
      open: _open,
      side: widget.side,
      align: widget.align,
      offset: widget.sideOffset,
      onEscape: _dismiss,
      onSideResolved: (MPSide side) {
        if (mounted && side != _side) {
          setState(() => _side = side);
        }
      },
      popup: card,
      child: trigger,
    );
  }
}
