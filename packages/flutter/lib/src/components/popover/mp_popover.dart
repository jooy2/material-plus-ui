/// A sheet that opens beside the thing that opened it.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/back.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/sheet_close.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Builds the widget a popover hangs off, handed the call that opens and
/// closes it.
typedef MPPopoverTriggerBuilder = Widget Function(BuildContext context, VoidCallback toggle);

/// Builds something inside a popover that closes it, handed the call that does.
typedef MPPopoverCloseBuilder = Widget Function(BuildContext context, VoidCallback close);

/// How much of the page an open popover takes away.
///
/// React's `modal` is `false`, `'trap-focus'` or `true`. Dart has no union of
/// a boolean and a string, so the three answers are three values.
enum MPPopoverModal {
  /// React's `false`: the page stays scrollable and pressable, and Tab past the
  /// last control in the popup leaves it and closes it.
  off,

  /// React's `'trap-focus'`: Tab goes round the popup and never leaves it, and
  /// the page still scrolls and takes presses.
  trapFocus,

  /// React's `true`: the focus is held, a press outside reaches nothing on the
  /// page, and a screen reader cannot reach the page either.
  on,
}

/// How wide the popup is allowed to get, per [MPSize].
///
/// The same axis a dialog folds its width into, one rung narrower at every
/// step: a popover is a detail beside a control rather than a sheet in the
/// middle of the page, and a 560px popup hanging off a 40px button is a dialog
/// that forgot to take the page.
const Map<MPSize, double> _maxWidth = <MPSize, double>{
  MPSize.xs: 224,
  MPSize.sm: 256,
  MPSize.md: 320,
  MPSize.lg: 384,
  MPSize.xl: 512,
};

/// Between the header's words and the × at its end, React's `gap-3`.
const double _headerGap = 12;

/// The × is a 32px circle with an 18px glyph, pulled 4px into the padding on
/// every side (React's `-m-1`), so it lines up with the title's first line
/// rather than pushing the header taller than the title.
const double _closeDiameter = 32;
const double _closeIcon = 18;
const double _closeBleed = 4;

/// A sheet that opens beside the thing that opened it.
///
/// ```dart
/// MPPopover(
///   trigger: (BuildContext context, VoidCallback toggle) => MPButton(
///     variant: MPVariant.outlined,
///     onPressed: toggle,
///     child: const Text('Rename'),
///   ),
///   title: const Text('Rename this view'),
///   child: const Text('Only you will see it.'),
/// )
/// ```
///
/// The difference from a tooltip is that this one can be *reached*: it stays
/// up until it is dismissed, the focus moves into it, and what is inside it can
/// be pressed and typed into. The difference from a dialog is that it does not
/// take the page: it is anchored to a control, and the page behind goes on
/// working.
///
/// Controlled with [open] and [onOpenChange], or left to itself with
/// [initialOpen], a [trigger] and an [MPPopoverClose] inside.
///
/// ## The surface
///
/// `surfaceContainer` at elevation 2 and the `medium` corner, which is what
/// MD3 gives a menu and a rich tooltip, the two things in the specification
/// that are this: a small sheet anchored to a control. Deliberately not the
/// dialog's `surfaceContainerHigh` at elevation 3, because a popover has not
/// taken the page and should not sit above the menus that did not either.
///
/// There is no `variant` and no `color`. The five weights answer "how much
/// does this surface assert itself against the page", and a popup that had to
/// be asked for has already answered; a popover that could be dyed would dye
/// the form somebody put in it.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator and
/// `MaterialApp` both provide.
class MPPopover extends StatefulWidget {
  /// Creates a popover.
  const MPPopover({
    this.trigger,
    this.title,
    this.description,
    this.side = MPSide.bottom,
    this.align = MPAlign.center,
    this.sideOffset = 8,
    this.alignOffset = 0,
    this.arrow = false,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.modal = MPPopoverModal.off,
    this.dismissible = true,
    this.showClose = false,
    this.closeLabel,
    this.locale,
    this.width,
    this.size,
    this.child,
    super.key,
  });

  /// Builds the widget the popup hangs off and that opens it, handed the call
  /// that toggles it.
  ///
  /// The React build merges its handler onto the element it is given; a
  /// widget cannot be reached into, so this hands the handler over instead.
  /// An `MPButton` or an `MPIconButton` built here is also told whether its
  /// popup is open, which a screen reader announces as expanded or collapsed.
  ///
  /// Optional: a controlled popover opened from elsewhere needs none, though
  /// it then hangs off the place the [MPPopover] was written.
  final MPPopoverTriggerBuilder? trigger;

  /// The heading, announced as one and as the popup's name.
  final Widget? title;

  /// A line under the title, in the quieter ink.
  final Widget? description;

  /// Which edge of the trigger the popup appears on.
  ///
  /// A preference rather than an instruction: it flips to the opposite edge
  /// when there is no room. It never slides along the edge it is on.
  final MPSide side;

  /// Where it sits along that edge. Logical, so `start` is the right under
  /// right-to-left along a top or a bottom edge.
  final MPAlign align;

  /// The gap between the trigger and the popup, in logical pixels.
  final double sideOffset;

  /// A shift along that edge, in logical pixels: towards the end of the line
  /// for `start` and `center`, back towards its start for `end`, and down a
  /// side edge.
  final double alignOffset;

  /// Draws the little wedge pointing at the trigger.
  ///
  /// Off by default, which is what MD3 does with the menu and the rich
  /// tooltip: a popup eight pixels from the control that opened it does not
  /// need to say what it belongs to.
  final bool arrow;

  /// Whether the popup is open. Left `null`, the popover keeps its own state,
  /// starting from [initialOpen].
  final bool? open;

  /// Whether the popup starts open, for a popover that keeps its own state.
  final bool initialOpen;

  /// Called with what the open state should become: `true` from the
  /// [trigger], `false` from the ×, an [MPPopoverClose], a press outside,
  /// <kbd>Escape</kbd>, the system back, or Tab leaving the popup.
  final ValueChanged<bool>? onOpenChange;

  /// How much of the page an open popup takes away. [MPPopoverModal.off], the
  /// default, is what separates a popover from a dialog.
  final MPPopoverModal modal;

  /// Whether a press outside, <kbd>Escape</kbd>, the system back and Tab
  /// leaving the popup close it.
  ///
  /// Turn it off only for a popup with its own way out, because there will be
  /// no other. The ×, an [MPPopoverClose], the trigger and a controlled [open]
  /// still close it, which is what keeps a refusal from being a trap.
  final bool dismissible;

  /// Shows the × at the end of the header.
  final bool showClose;

  /// The name a screen reader gives the ×. Defaults to the word for "close" in
  /// [locale].
  final String? closeLabel;

  /// Which language the ×'s default name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// A hard cap on the popup's width in logical pixels, overriding the one
  /// [size] implies. For the popover whose content decides its width, a form
  /// or a single line of help, rather than for tuning the scale.
  final double? width;

  /// The room inside the popup, the type in it, and how wide it may get.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// The body.
  final Widget? child;

  @override
  State<MPPopover> createState() => _MPPopoverState();
}

/// Closes the popover it is inside.
///
/// An uncontrolled popover has no state of the caller's for its Cancel button
/// to set, and making every popover controlled is a piece of state per popover
/// that exists only to answer a button.
///
/// ```dart
/// MPPopoverClose(
///   builder: (BuildContext context, VoidCallback close) =>
///       MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
/// )
/// ```
///
/// It closes the popover whether or not it is [MPPopover.dismissible]: that
/// refuses the ways out a reader did not mean, and this one is meant.
class MPPopoverClose extends StatelessWidget {
  /// Creates a close for the popover round it.
  const MPPopoverClose({required this.builder, super.key});

  /// Builds what closes the popover, usually an `MPButton`, handed the call
  /// that closes it.
  final MPPopoverCloseBuilder builder;

  @override
  Widget build(BuildContext context) {
    final _MPPopoverScope? scope = context.dependOnInheritedWidgetOfExactType<_MPPopoverScope>();

    assert(scope != null, 'MPPopoverClose was used outside an MPPopover.');

    return builder(context, scope?.close ?? () {});
  }
}

/// What an [MPPopoverClose] inside the popup calls.
class _MPPopoverScope extends InheritedWidget {
  const _MPPopoverScope({required this.close, required super.child});

  final VoidCallback close;

  @override
  bool updateShouldNotify(_MPPopoverScope oldWidget) => close != oldWidget.close;
}

class _MPPopoverState extends State<MPPopover> {
  /// The focus inside the popup. A scope, so Tab is bounded by it: closed in a
  /// loop when the focus is held, and stopped at the edges otherwise, where
  /// [_traverse] takes over.
  ///
  /// Out of traversal itself, so a Tab on the page never lands on the scope
  /// rather than on something in it.
  final FocusScopeNode _scope = FocusScopeNode(debugLabel: 'MPPopover', skipTraversal: true);

  /// Round the trigger, never focused itself: it is how the popover finds the
  /// control to hand the focus back to, and how it tells that control whether
  /// its popup is open.
  final FocusNode _triggerArea = FocusNode(
    debugLabel: 'MPPopover trigger',
    canRequestFocus: false,
    skipTraversal: true,
  );

  /// The invisible layer under a [MPPopoverModal.on] popup that keeps the
  /// page from being pressed or read.
  final OverlayPortalController _barrier = OverlayPortalController();

  late bool _uncontrolled = widget.initialOpen;

  /// The open state the focus and the barrier were last brought in line with.
  bool _settled = false;

  /// The side the popup ended up on after any flip, for the wedge.
  late MPSide _side = widget.side;

  bool get _open => widget.open ?? _uncontrolled;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  void initState() {
    super.initState();
    _syncEdges();
    _scope.descendantsAreFocusable = false;
    _settle();
  }

  @override
  void didUpdateWidget(MPPopover oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.side != oldWidget.side) {
      _side = widget.side;
    }

    if (widget.modal != oldWidget.modal) {
      _syncEdges();
      _syncBarrier();
    }

    _settle();
  }

  @override
  void dispose() {
    _scope.dispose();
    _triggerArea.dispose();
    super.dispose();
  }

  /// Tab goes round a popup that holds the focus and stops at the edges of one
  /// that does not, where [_traverse] hands the focus on to the page.
  void _syncEdges() {
    _scope.traversalEdgeBehavior = widget.modal == MPPopoverModal.off
        ? TraversalEdgeBehavior.stop
        : TraversalEdgeBehavior.closedLoop;
  }

  /// Everything a popup does to itself is out of bounds during a build, and a
  /// build is where the change nearly always arrives from.
  void _afterFrame(VoidCallback callback) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => callback());
  }

  /// Brings the focus and the barrier in line with the open state, once per
  /// change, however the change arrived: the caller's [MPPopover.open], or a
  /// request this popover granted itself.
  void _settle() {
    final bool open = _open;

    if (open == _settled) {
      return;
    }

    _settled = open;
    open ? _opened() : _closed();
  }

  void _opened() {
    _scope.descendantsAreFocusable = true;
    _syncBarrier();

    // Two frames on: the anchored portal lifts the popup at the end of the
    // first, and it is in the tree to be focused only after the second has
    // built it. Asked rather than autofocused, because Flutter applies an
    // autofocus only when nothing in the scope holds the focus, and something
    // nearly always does: whatever opened the popup.
    _afterFrame(() => _afterFrame(_focusIn));
  }

  void _closed() {
    // Back to the trigger, the half of moving the focus that is easy to
    // forget: a popup that leaves the focus behind drops the reader at the top
    // of the page. Only when the focus is in the popup, though. A press
    // outside that landed on a field has put it where the reader wanted it.
    if (_scope.hasFocus) {
      _triggerFocus()?.requestFocus();
    }

    // Out of reach while it fades, so Tab on the page cannot land in a popup
    // that is going. Set after the focus is handed back: a scope that loses
    // its focusable descendants while one holds the focus gives it to the
    // last thing focused outside, which is the trigger just asked for.
    _scope.descendantsAreFocusable = false;
    _syncBarrier();
  }

  /// Puts the focus on the first thing in the popup that takes it, or on the
  /// popup itself when nothing does, as Base UI does.
  void _focusIn() {
    if (!mounted || !_open || _scope.context == null) {
      return;
    }

    final FocusTraversalPolicy policy =
        FocusTraversalGroup.maybeOfNode(_scope) ?? ReadingOrderTraversalPolicy();
    final FocusNode? first = policy.findFirstFocus(_scope, ignoreCurrentFocus: true);

    (first ?? _scope).requestFocus();
  }

  /// The control the trigger builds, which is the first thing inside it that
  /// takes the focus.
  FocusNode? _triggerFocus() {
    for (final FocusNode node in _triggerArea.traversalDescendants) {
      return node;
    }

    return null;
  }

  /// Shows the barrier under a [MPPopoverModal.on] popup while it is open.
  ///
  /// After the frame, and asked for before the anchored portal asks for the
  /// popup, so the barrier is painted under the popup rather than over it.
  void _syncBarrier() {
    _afterFrame(() {
      if (!mounted) {
        return;
      }

      final bool wanted = _open && widget.modal == MPPopoverModal.on;

      if (wanted && !_barrier.isShowing) {
        _barrier.show();
      } else if (!wanted && _barrier.isShowing) {
        _barrier.hide();
      }
    });
  }

  void _setOpen(bool next) {
    if (next == _open) {
      return;
    }

    if (widget.open == null) {
      setState(() => _uncontrolled = next);
    }

    widget.onOpenChange?.call(next);
    _settle();
  }

  void _toggle() => _setOpen(!_open);

  void _close() => _setOpen(false);

  /// A way out the reader may not have meant: a press outside, Escape, the
  /// system back, Tab leaving the popup.
  void _dismiss() {
    if (widget.dismissible) {
      _close();
    }
  }

  /// Tab inside a popup that does not hold the focus.
  ///
  /// The scope stops at its edges, so a move that goes nowhere is a move off
  /// the end of the popup. Off the end, the focus goes to whatever follows the
  /// trigger and the popup closes, as a focus leaving a Base UI popover closes
  /// it; off the start, it goes back to the trigger and the popup stays.
  Object? _traverse({required bool forward}) {
    final FocusNode? current = FocusManager.instance.primaryFocus;
    final bool moved = current != null && (forward ? current.nextFocus() : current.previousFocus());

    if (moved) {
      return null;
    }

    final FocusNode? trigger = _triggerFocus();

    if (!forward) {
      trigger?.requestFocus();

      return null;
    }

    if (widget.dismissible) {
      // Out of reach before the focus moves on, or a popup that hangs below
      // its trigger would be the next thing after it in reading order. A
      // controlled popover closes only once its parent has built it closed,
      // so this does not wait for that, and puts it back if the parent said
      // no.
      _scope.descendantsAreFocusable = false;
      _close();
      _afterFrame(() {
        if (mounted && _open) {
          _scope.descendantsAreFocusable = true;
        }
      });
    }

    if (trigger != null) {
      trigger.requestFocus();
      trigger.nextFocus();
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final bool open = _open;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);

    Widget popup = _Sheet(
      size: size,
      radius: radius,
      maxWidth: widget.width ?? _maxWidth[size]!,
      title: widget.title,
      description: widget.description,
      close: widget.showClose
          ? MPSheetCloseButton(
              label:
                  widget.closeLabel ??
                  mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['close']!,
              onPressed: _close,
              color: colors.onSurfaceVariant,
              ring: colors.secondary,
              diameter: _closeDiameter,
              iconSize: _closeIcon,
            )
          : null,
      child: widget.child,
    );

    if (widget.arrow) {
      popup = MPPopupArrow(
        side: _side,
        align: widget.align,
        size: mpPopupArrowSize[size]!,
        color: colors.surfaceContainer,
        inset: theme.shapes.medium,
        child: popup,
      );
    }

    if (widget.alignOffset != 0) {
      popup = Transform.translate(offset: _shift(), child: popup);
    }

    popup = _MPPopoverScope(
      close: _close,
      child: FocusScope(
        node: _scope,
        child: Actions(
          // Mapped only for a popup that lets the focus go. One that holds it
          // leaves Tab to the scope, which goes round.
          actions: <Type, Action<Intent>>{
            if (widget.modal == MPPopoverModal.off) ...<Type, Action<Intent>>{
              NextFocusIntent: CallbackAction<NextFocusIntent>(
                onInvoke: (NextFocusIntent intent) => _traverse(forward: true),
              ),
              PreviousFocusIntent: CallbackAction<PreviousFocusIntent>(
                onInvoke: (PreviousFocusIntent intent) => _traverse(forward: false),
              ),
            },
          },
          child: popup,
        ),
      ),
    );

    final MPPopoverTriggerBuilder? trigger = widget.trigger;

    // The trigger is told whether its popup is open through the holder, which
    // an `MPButton` reads as `expanded`. It never holds the focus itself.
    final Widget anchor = Focus(
      focusNode: _triggerArea,
      includeSemantics: false,
      child: MPFocusHolder(
        node: _triggerArea,
        holding: false,
        open: open,
        child: trigger == null
            ? const SizedBox.shrink()
            : Builder(builder: (BuildContext context) => trigger(context, _toggle)),
      ),
    );

    Widget anchored = MPAnchoredPortal(
      open: open,
      side: widget.side,
      align: widget.align,
      offset: widget.sideOffset,
      onDismiss: widget.dismissible ? _dismiss : null,
      onSideResolved: (MPSide side) {
        if (mounted && side != _side) {
          setState(() => _side = side);
        }
      },
      popup: popup,
      child: anchor,
    );

    anchored = OverlayPortal(
      controller: _barrier,
      overlayChildBuilder: _buildBarrier,
      child: anchored,
    );

    // A modal popup that refuses to be dismissed takes the back and does
    // nothing with it, as a modal layer does: the page under it has been taken
    // away. One that can be dismissed has the anchored portal answer the back.
    return MPBackGuard(
      active: open && widget.modal == MPPopoverModal.on && !widget.dismissible,
      child: anchored,
    );
  }

  /// [MPPopover.alignOffset] as a move on the screen, the way Floating UI
  /// reads it: towards the end of the line for `start` and `center`, back
  /// from the end for `end`, and down a side edge.
  Offset _shift() {
    final double along = widget.align == MPAlign.end ? -widget.alignOffset : widget.alignOffset;

    if (_side == MPSide.left || _side == MPSide.right) {
      return Offset(0, along);
    }

    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    return Offset(rtl ? -along : along, 0);
  }

  /// Takes the page away from the pointer and from a screen reader, under a
  /// [MPPopoverModal.on] popup.
  ///
  /// Painted nothing: a popover does not dim the page, it only stops it. A
  /// press on it still closes a dismissible popup, which the anchored portal
  /// hears before the press reaches this.
  Widget _buildBarrier(BuildContext context) {
    return const BlockSemantics(child: AbsorbPointer(child: SizedBox.expand()));
  }
}

/// The popup's sheet: the surface, the header and the body.
class _Sheet extends StatelessWidget {
  const _Sheet({
    required this.size,
    required this.radius,
    required this.maxWidth,
    required this.title,
    required this.description,
    required this.close,
    required this.child,
  });

  final MPSize size;
  final BorderRadius radius;
  final double maxWidth;
  final Widget? title;
  final Widget? description;
  final Widget? close;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool hasHeader = title != null || description != null || close != null;

    final List<Widget> sections = <Widget>[if (hasHeader) _header(theme, colors), ?child];

    Widget sheet = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: mpSheetGap[size]!,
      children: sections,
    );

    sheet = DecoratedBox(
      decoration: BoxDecoration(
        color: colors.surfaceContainer,
        borderRadius: radius,
        boxShadow: MPShadows.of(2),
      ),
      child: Padding(
        padding: EdgeInsets.all(mpSheetPad[size]!),
        child: DefaultTextStyle.merge(
          style: mpProseText(theme.typescale, size).style(colors.onSurface),
          child: IconTheme.merge(
            data: IconThemeData(color: colors.onSurface),
            child: sheet,
          ),
        ),
      ),
    );

    // A dialog anchored to its trigger, as Base UI's popup is: a route of its
    // own to a screen reader, named by the title inside it.
    return Semantics(
      container: true,
      explicitChildNodes: true,
      scopesRoute: true,
      role: SemanticsRole.dialog,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: sheet,
      ),
    );
  }

  Widget _header(MPThemeData theme, MPColorScheme colors) {
    final Widget words = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (title != null)
          // The heading names the popup, so it is announced as one rather than
          // read as the first line of the body.
          Semantics(
            container: true,
            header: true,
            namesRoute: true,
            child: DefaultTextStyle.merge(
              style: mpSheetTitle(theme.typescale, size).style(colors.onSurface),
              child: title!,
            ),
          ),
        if (description != null)
          DefaultTextStyle.merge(
            style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
            child: description!,
          ),
      ],
    );

    if (close == null) {
      return words;
    }

    // Last rather than first, so a reader hears what the popup is about
    // before the way out of it.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _headerGap,
      children: <Widget>[
        Expanded(child: words),
        SizedBox.square(
          dimension: _closeDiameter - 2 * _closeBleed,
          child: OverflowBox(maxWidth: _closeDiameter, maxHeight: _closeDiameter, child: close),
        ),
      ],
    );
  }
}
