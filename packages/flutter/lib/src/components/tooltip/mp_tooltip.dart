/// A short label that appears when the pointer rests on something.
library;

import 'dart:async';

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// How long the pointer rests before a tooltip opens, Base UI's own default.
const Duration _defaultDelay = Duration(milliseconds: 600);

/// How long a group stays warm after its last tooltip closed, Base UI's own
/// default for a provider.
const Duration _defaultTimeout = Duration(milliseconds: 400);

/// How long a tooltip opened by a long press stays up after the finger lifts.
///
/// A pointer leaving is a reader who has stopped looking; a finger lifting is a
/// reader who has just started. Closing on the release would show the plate for
/// exactly as long as the press that asked to read it.
const Duration _touchDwell = Duration(milliseconds: 1500);

/// How wide a plate may get before its text wraps: React's `max-w-64`.
const double _maxWidth = 256;

/// The plate's horizontal padding per rung.
const Map<MPSize, double> _padX = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 8,
  MPSize.md: 8,
  MPSize.lg: 12,
  MPSize.xl: 16,
};

/// The plate's vertical padding per rung. MD3's plain tooltip is 24dp tall
/// with a `bodySmall` label, which is 4 on a 16px line: the `sm` and `md`
/// rungs, which differ only in the arrow.
const Map<MPSize, double> _padY = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 4,
  MPSize.md: 4,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// The wedge per rung, two pixels narrower than a popover's throughout: a
/// tooltip is a strip of text, and a wedge sized for a card reads as a spike.
const Map<MPSize, double> _arrowSize = <MPSize, double>{
  MPSize.xs: 6,
  MPSize.sm: 7,
  MPSize.md: 8,
  MPSize.lg: 9,
  MPSize.xl: 10,
};

/// Shares one delay across a group of tooltips.
///
/// Once any tooltip inside has opened, its neighbours open at once, and the
/// wait comes back after [timeout]. Worth wrapping a toolbar in: without it,
/// moving along a row of icon buttons means waiting out the full delay at every
/// stop, which is what makes tooltips feel like they are fighting the pointer.
///
/// [delay] and [closeDelay] are defaults for the tooltips inside; one that sets
/// its own keeps it.
class MPTooltipProvider extends StatefulWidget {
  /// Creates a group around [child].
  const MPTooltipProvider({
    required this.child,
    this.delay,
    this.closeDelay,
    this.timeout = _defaultTimeout,
    super.key,
  });

  /// What is inside the group.
  final Widget child;

  /// How long the pointer rests before a tooltip in the group opens, for one
  /// that does not say.
  final Duration? delay;

  /// How long a tooltip in the group waits before closing, for one that does
  /// not say.
  final Duration? closeDelay;

  /// How long after the last tooltip closed its neighbours still open at once.
  final Duration timeout;

  @override
  State<MPTooltipProvider> createState() => _MPTooltipProviderState();
}

class _MPTooltipProviderState extends State<MPTooltipProvider> {
  final _TooltipGroup _group = _TooltipGroup();

  @override
  Widget build(BuildContext context) {
    return _TooltipScope(group: _group, provider: widget, child: widget.child);
  }
}

/// What the tooltips in a group share: how many of them are up, and when the
/// last one went.
class _TooltipGroup {
  DateTime? lastClosed;
  int open = 0;
}

class _TooltipScope extends InheritedWidget {
  const _TooltipScope({required this.group, required this.provider, required super.child});

  final _TooltipGroup group;
  final MPTooltipProvider provider;

  static _TooltipScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_TooltipScope>();
  }

  @override
  bool updateShouldNotify(_TooltipScope oldWidget) {
    return group != oldWidget.group ||
        provider.delay != oldWidget.provider.delay ||
        provider.closeDelay != oldWidget.provider.closeDelay ||
        provider.timeout != oldWidget.provider.timeout;
  }
}

/// A short label that appears when the pointer rests on something.
///
/// ```dart
/// MPTooltip(
///   content: const Text('Copy to clipboard'),
///   child: MPButton(semanticLabel: 'Copy', onPressed: copy, startIcon: copyIcon),
/// )
/// ```
///
/// The whole component is a wrapper: it adds no box to the layout and no focus
/// stop, and the child stays whatever it was, a button, a chip or a truncated
/// cell.
///
/// It opens when the pointer rests on the child, when the keyboard focuses it,
/// and on a long press, which is the touch screen's way in. Each holds it up on
/// its own, so a pointer brushing past does not close what the keyboard opened.
/// A focus that arrives with a press does not open it, and a press closes it,
/// as Base UI does on the web. Escape closes it too.
///
/// ## The plate
///
/// MD3's plain tooltip: `inverseSurface` under `inverseOnSurface`, the neutral
/// palette read at the other end of the scheme, so it is dark on a light page
/// and light on a dark one. That is what keeps it legible over content it was
/// never designed against, which is the only content a tooltip appears over.
/// An `extraSmall` corner and no shadow: a plate already that far from its
/// background reads a shadow as a second, softer edge rather than as height.
///
/// ## A tooltip is not a container
///
/// [content] is a short phrase. A tooltip cannot be reached by a finger, it goes
/// the moment attention moves, and nothing inside it can be pressed. Content
/// that needs either belongs in a popover.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator and
/// `MaterialApp` both provide.
class MPTooltip extends StatefulWidget {
  /// Creates a tooltip over [child].
  const MPTooltip({
    required this.content,
    required this.child,
    this.side = MPSide.top,
    this.align = MPAlign.center,
    this.sideOffset = 6,
    this.delay,
    this.closeDelay,
    this.arrow = true,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.disabled = false,
    this.size = MPSize.sm,
    this.color,
    this.semanticLabel,
    super.key,
  });

  /// What the tooltip says, usually a [Text].
  final Widget content;

  /// What it hangs off: the one control, or the text, it describes.
  ///
  /// A screen reader gets the child and the tooltip's words as one node, so a
  /// button under a tooltip is announced with its own name and actions, and the
  /// words with them. The whole child is merged, so a child holding several
  /// controls of its own is announced as one. With no words to say, or while
  /// [disabled], the child is left as it was.
  final Widget child;

  /// Which edge of the child it appears on. It flips to the opposite side when
  /// there is no room.
  final MPSide side;

  /// Where it sits along that edge.
  final MPAlign align;

  /// How far it stands off the child, in logical pixels.
  final double sideOffset;

  /// How long the pointer has to rest before it opens. Falls back to the
  /// nearest [MPTooltipProvider], then to 600 milliseconds.
  final Duration? delay;

  /// How long it waits before closing once the pointer leaves. Falls back to
  /// the nearest [MPTooltipProvider], then to none.
  final Duration? closeDelay;

  /// Draws the little wedge pointing at the child.
  final bool arrow;

  /// Drives the tooltip from outside. `null`, the default, leaves it to the
  /// pointer, the keyboard and a long press. [onOpenChange] reports either way.
  final bool? open;

  /// Whether an uncontrolled tooltip starts open. React's `defaultOpen`.
  final bool initialOpen;

  /// Called whenever the tooltip opens or closes, however it was asked.
  final ValueChanged<bool>? onOpenChange;

  /// Stops the tooltip opening at all, without disabling the child. For the
  /// tooltip that only exists while a label is truncated.
  ///
  /// One that is up when this turns on closes, and [onOpenChange] hears it once
  /// the frame is done. A screen reader is not given the words either, so a
  /// label that fits is not read out twice.
  final bool disabled;

  /// The plate's padding and type. [MPSize.sm] and [MPSize.md] both draw MD3's
  /// plain tooltip, 24dp tall with a `bodySmall` label, and differ only in the
  /// arrow.
  ///
  /// `sm` is this component's own answer, so it does not take the size an
  /// `MPConfigProvider` sets for the rest of the app: a tooltip at a control's
  /// height is a slab.
  final MPSize size;

  /// Which accent family the plate is painted in.
  ///
  /// **No default.** Left `null`, the plate is the inverse surface. Setting it
  /// swaps in the accent fill under its own ink, which is worth doing for a
  /// tooltip that is itself a warning and wrong for the rest: a red tooltip on
  /// a delete button is saying something the tooltip does not know. It does not
  /// take the colour an `MPConfigProvider` sets either.
  final MPColor? color;

  /// What a screen reader says the child's tooltip is.
  ///
  /// A widget cannot be read out, so this is what a tooltip carrying anything
  /// but a plain [Text] needs. With a `Text` in [content] it defaults to that
  /// text.
  final String? semanticLabel;

  @override
  State<MPTooltip> createState() => _MPTooltipState();
}

class _MPTooltipState extends State<MPTooltip> {
  late bool _open = widget.open ?? widget.initialOpen;
  late MPSide _side = widget.side;
  Timer? _timer;

  /// What is holding the tooltip up. Kept apart because each lets go on its
  /// own: a pointer that brushes past a trigger the keyboard is on must not
  /// close what the keyboard opened, and a pointer that moves from the trigger
  /// onto the plate has not left.
  bool _hovered = false;
  bool _focused = false;
  bool _onPlate = false;

  /// Whether a pointer is down on the trigger. A focus that arrives in the
  /// middle of a press came from the press, and a tooltip opens on the
  /// keyboard's focus only.
  bool _pressing = false;

  bool get _held => _hovered || _focused || _onPlate;

  /// Whether this tooltip is counted among its group's open ones.
  bool _holding = false;

  /// Held rather than looked up on demand, because a tooltip hands its place in
  /// the group back on the way out, and an inherited widget cannot be read
  /// from `dispose`.
  _TooltipScope? _group;

  Duration get _delay => widget.delay ?? _group?.provider.delay ?? _defaultDelay;

  Duration get _closeDelay => widget.closeDelay ?? _group?.provider.closeDelay ?? Duration.zero;

  @override
  void initState() {
    super.initState();

    // Asked to be open while switched off: nothing shows, and the caller is
    // answered as it is when the tooltip is switched off while up.
    if (_open && widget.disabled) {
      _open = false;
      _reportDisabledClose();
    }
  }

  @override
  void didUpdateWidget(MPTooltip oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.side != oldWidget.side) {
      _side = widget.side;
    }

    // Whether something asks for the plate before `disabled` has its say: the
    // caller's `open`, or whatever was holding the tooltip up.
    final bool wanted = widget.open ?? _open;
    final bool wantedBefore = oldWidget.open ?? _open;

    if (widget.open != null) {
      _open = widget.open!;
    }

    if (widget.disabled) {
      // A wait that was on its way would open what is now switched off.
      _timer?.cancel();
      _timer = null;
      _open = false;

      // Told once, and not again while it stays switched off and asked for.
      if (wanted && !(oldWidget.disabled && wantedBefore)) {
        _reportDisabledClose();
      }
    }

    _syncGroup();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _group = _TooltipScope.maybeOf(context);
    _syncGroup();
  }

  @override
  void dispose() {
    _timer?.cancel();

    if (_holding) {
      _release();
    }

    super.dispose();
  }

  /// Tells the caller the tooltip closed because it was switched off.
  ///
  /// After the frame, because this is heard while an ancestor is building, and
  /// one that mirrors the state with `setState` cannot be marked to build again
  /// from there.
  void _reportDisabledClose() {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted) {
        widget.onOpenChange?.call(false);
      }
    });
  }

  /// Whether the group has been warm recently enough to skip the wait.
  bool get _warm {
    final _TooltipScope? scope = _group;

    if (scope == null) {
      return false;
    }

    if (scope.group.open > 0) {
      return true;
    }

    final DateTime? closed = scope.group.lastClosed;

    return closed != null && DateTime.now().difference(closed) < scope.provider.timeout;
  }

  void _release() {
    final _TooltipScope? scope = _group;

    if (scope != null && scope.group.open > 0) {
      scope.group.open -= 1;
      scope.group.lastClosed = DateTime.now();
    }
  }

  /// Counts the tooltip in its group while its plate is up, and hands the
  /// place back when it goes.
  ///
  /// Run after whatever changed the plate, because a controlled `open` and
  /// `disabled` both change it without a request. A place left behind would
  /// keep the group warm for good.
  void _syncGroup() {
    final bool up = _open && !widget.disabled;

    if (up == _holding) {
      return;
    }

    _holding = up;

    if (up) {
      _group?.group.open += 1;
    } else {
      _release();
    }
  }

  void _set(bool next) {
    _timer?.cancel();
    _timer = null;

    if (_open == next) {
      return;
    }

    // The tooltip drives itself unless the caller asked to, which is what
    // `open` being nullable means. Either way the change is reported.
    if (widget.open == null) {
      setState(() => _open = next);
      _syncGroup();
    }

    widget.onOpenChange?.call(next);
  }

  void _schedule(bool next, {Duration? after}) {
    if (widget.disabled) {
      return;
    }

    _timer?.cancel();

    final Duration wait = after ?? (next ? (_warm ? Duration.zero : _delay) : _closeDelay);

    if (wait == Duration.zero) {
      _set(next);

      return;
    }

    _timer = Timer(wait, () => _set(next));
  }

  /// Opens or closes after something that holds the tooltip up changed.
  ///
  /// A close waits one microtask when it would otherwise be immediate: the
  /// pointer leaving the trigger and arriving on the plate are two events
  /// delivered together, and the second has to be heard before deciding.
  void _track({bool? hovered, bool? focused, bool? onPlate}) {
    _hovered = hovered ?? _hovered;
    _focused = focused ?? _focused;
    _onPlate = onPlate ?? _onPlate;

    if (_held) {
      if (_open) {
        // Staying up: a close that was on its way is called off.
        _timer?.cancel();
        _timer = null;
      } else if (_timer == null) {
        _schedule(true);
      }

      return;
    }

    if (_closeDelay == Duration.zero) {
      _timer?.cancel();
      _timer = null;
      scheduleMicrotask(() {
        if (mounted && !_held) {
          _schedule(false);
        }
      });

      return;
    }

    _schedule(false);
  }

  /// A press on the trigger closes the tooltip and lets go of everything that
  /// held it up, as Base UI closes one on a press of its trigger. The pointer
  /// has to leave and come back, or the focus go and return, to open it again.
  void _press() {
    _pressing = true;
    _hovered = false;
    _focused = false;
    _set(false);
  }

  /// Lets go of a press once its own handlers have run. A focus a tap asks
  /// for is applied in a microtask after the pointer comes up, and it is still
  /// the press's focus rather than the keyboard's.
  void _endPress() {
    Timer.run(() => _pressing = false);
  }

  void _dismiss() {
    _hovered = false;
    _focused = false;
    _onPlate = false;
    _set(false);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = widget.size;
    final MPColor? color = widget.color;
    final Color fill = color == null ? colors.inverseSurface : colors.accent(color).color;
    final Color ink = color == null ? colors.inverseOnSurface : colors.accent(color).onColor;
    final double corner = theme.shapes.extraSmall;
    final bool large = size == MPSize.lg || size == MPSize.xl;

    Widget plate = ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: _maxWidth),
      child: DecoratedBox(
        decoration: BoxDecoration(color: fill, borderRadius: BorderRadius.circular(corner)),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: _padX[size]!, vertical: _padY[size]!),
          child: DefaultTextStyle.merge(
            // `bodySmall` is MD3's own plain-tooltip label. A tooltip that grew
            // with the control it describes would shout on a large button.
            style: (large ? theme.typescale.bodyMedium : theme.typescale.bodySmall).style(ink),
            child: IconTheme.merge(
              data: IconThemeData(color: ink),
              child: widget.content,
            ),
          ),
        ),
      ),
    );

    if (widget.arrow) {
      plate = MPPopupArrow(
        side: _side,
        align: widget.align,
        size: _arrowSize[size]!,
        color: fill,
        inset: corner,
        child: plate,
      );
    }

    // The pointer is what a tooltip listens to, and `MouseRegion` rather than a
    // gesture because resting is not pressing. A long press is the touch
    // screen's way in, and focus is the keyboard's.
    Widget trigger = MouseRegion(
      onEnter: (_) => _track(hovered: true),
      onExit: (_) => _track(hovered: false),
      child: Listener(
        onPointerDown: (_) => _press(),
        onPointerUp: (_) => _endPress(),
        onPointerCancel: (_) => _endPress(),
        child: GestureDetector(
          behavior: HitTestBehavior.deferToChild,
          // Off the semantics tree. A screen reader has the words already, on
          // the trigger, and a long press offered to it would be one more thing
          // the control says it does, for a plate it has no use for.
          excludeFromSemantics: true,
          // Only while there is a plate to open: a long-press recogniser wins
          // the gesture from the child's own tap, so one left in place while
          // the tooltip is switched off would swallow a slow press on the
          // button under it. The callbacks go rather than the detector, which
          // keeps the tree above the child the same shape and its state with it.
          onLongPress: widget.disabled ? null : () => _schedule(true, after: Duration.zero),
          onLongPressEnd: widget.disabled ? null : (_) => _schedule(false, after: _touchDwell),
          child: widget.child,
        ),
      ),
    );

    trigger = Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (bool has) {
        // A focus a press brought is not the keyboard's.
        if (has && _pressing) {
          return;
        }

        _track(focused: has);
      },
      child: trigger,
    );

    // Nothing while switched off: a plate that never opens is not there to
    // describe the trigger.
    final String? spoken = widget.disabled
        ? null
        : widget.semanticLabel ?? (widget.content is Text ? (widget.content as Text).data : null);

    final Widget anchored = Semantics(
      tooltip: spoken,
      child: MPAnchoredPortal(
        open: _open && !widget.disabled,
        side: widget.side,
        align: widget.align,
        // The standoff is the plate's own margin instead, below.
        offset: 0,
        onEscape: _dismiss,
        onSideResolved: (MPSide side) {
          if (mounted && side != _side) {
            setState(() => _side = side);
          }
        },
        // Excluded from semantics: what the plate says is already on the
        // trigger as its tooltip, and a floating node saying it again is a
        // screen reader reading the phrase twice.
        //
        // The pointer can move from the trigger onto the plate and stay there,
        // as Base UI's tooltip is hoverable, so a long phrase can be read. The
        // standoff is a clear margin on the side facing the trigger rather than
        // the portal's offset, which leaves no gap for the pointer to leave
        // through on the way across.
        popup: ExcludeSemantics(
          child: MouseRegion(
            onEnter: (_) => _track(onPlate: true),
            onExit: (_) => _track(onPlate: false),
            child: Padding(
              padding: switch (_side) {
                MPSide.top => EdgeInsets.only(bottom: widget.sideOffset),
                MPSide.bottom => EdgeInsets.only(top: widget.sideOffset),
                MPSide.left => EdgeInsets.only(right: widget.sideOffset),
                MPSide.right => EdgeInsets.only(left: widget.sideOffset),
              },
              child: plate,
            ),
          ),
        ),
        child: trigger,
      ),
    );

    // The words go on the trigger's own node, which is what `aria-describedby`
    // does on the web. Left as an annotation round a child that is a node of
    // its own, as an `MPButton` is, they would be a second node wrapped round it
    // with no name. Merged, the child's name, its actions and the words are one
    // node.
    return _MergeSemantics(merging: spoken != null, child: anchored);
  }
}

/// A [MergeSemantics] that can be switched off.
///
/// Switched rather than added and removed, so a tooltip that stops having
/// anything to say does not change the shape of the tree above its trigger,
/// which would build the trigger again from scratch and lose its state.
class _MergeSemantics extends SingleChildRenderObjectWidget {
  const _MergeSemantics({required this.merging, required super.child});

  final bool merging;

  @override
  _RenderMergeSemantics createRenderObject(BuildContext context) {
    return _RenderMergeSemantics(merging: merging);
  }

  @override
  void updateRenderObject(BuildContext context, _RenderMergeSemantics renderObject) {
    renderObject.merging = merging;
  }
}

class _RenderMergeSemantics extends RenderProxyBox {
  _RenderMergeSemantics({required bool merging}) : _merging = merging;

  bool _merging;

  set merging(bool value) {
    if (value == _merging) {
      return;
    }

    _merging = value;
    markNeedsSemanticsUpdate();
  }

  @override
  void describeSemanticsConfiguration(SemanticsConfiguration config) {
    super.describeSemanticsConfiguration(config);

    // Left untouched when off: a configuration takes the merge flag only once
    // it is a boundary, and one that is neither adds nothing to the tree.
    if (_merging) {
      config
        ..isSemanticBoundary = true
        ..isMergingSemanticsOfDescendants = true;
    }
  }
}
