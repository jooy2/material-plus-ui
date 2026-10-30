/// Hover, press, focus and where the pointer is.
///
/// Every interactive Material Plus surface answers the same four questions, and answers
/// them the same way: hover comes from a [MouseRegion] rather than from the
/// focus system's highlight mode, the focus ring appears only on what CSS calls
/// `:focus-visible`, the pointer's position is tracked while a finger is down as
/// well as while a mouse is over — which is what makes the interaction light
/// follow a drag on a touch screen — and a tap on an unavailable control is
/// swallowed rather than falling through to whatever is behind it.
///
/// Written once here because those are four chances to be subtly wrong, and a
/// library with fifteen interactive components would otherwise take them fifteen
/// times.
///
/// None of this is exported from `material_plus_ui.dart` — it is the library talking to
/// itself. Semantics deliberately stay out: what a surface *is* to a screen
/// reader differs for every component, and a wrapper that guessed would be a
/// wrapper each component had to work around. The one exception is that the
/// surface can take the focus, which a component asks for with
/// [MPInteractive.focusSemantics].
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

/// What the pointer and the keyboard are currently doing to a surface.
@immutable
class MPInteraction {
  /// Creates a state. Only [MPInteractive] should need to.
  const MPInteraction({
    this.hovered = false,
    this.pressed = false,
    this.focusVisible = false,
    this.pointer,
  });

  /// Whether a mouse is over the surface. Never true for a finger — which is
  /// the right analogue of `@media (hover: hover)`.
  final bool hovered;

  /// Whether it is being held down.
  final bool pressed;

  /// Whether a *keyboard* reached it. A mouse click never sets this.
  final bool focusVisible;

  /// Where the pointer is, in the surface's own coordinates, or `null` if it
  /// has never been over it.
  final Offset? pointer;

  @override
  bool operator ==(Object other) {
    return other is MPInteraction &&
        other.hovered == hovered &&
        other.pressed == pressed &&
        other.focusVisible == focusVisible &&
        other.pointer == pointer;
  }

  @override
  int get hashCode => Object.hash(hovered, pressed, focusVisible, pointer);
}

/// Builds a surface from the state the pointer and the keyboard put it in.
typedef MPInteractionBuilder = Widget Function(BuildContext context, MPInteraction state);

/// What a `Semantics` inside [MPInteractive.builder] says about the focus,
/// read from [context] there: whether the surface holds it, or `null` while
/// the surface cannot take it, and how a screen reader moves it there.
///
/// The same words a [Focus] says, for a component whose node is inside the
/// builder and cannot have them folded in by [MPInteractive.focusSemantics],
/// because they would be said above it. Handed to the node itself, they also
/// hold on a node with `explicitChildNodes`, under which anything said apart
/// would be a node of its own.
///
/// A node that a [MPFocusHolder] round it holds the focus for says it holds
/// it too, and says whether the popup it opens is open as [expanded], which is
/// `null` for any other node. A component that says whether it is expanded
/// for a reason of its own says that instead.
({bool? focused, VoidCallback? onFocus, bool? expanded}) mpFocusSemanticsOf(BuildContext context) {
  final FocusNode node = Focus.of(context);

  if (!node.canRequestFocus) {
    return (focused: null, onFocus: null, expanded: null);
  }

  // Asked every time, so the node is told whenever a holder round it takes
  // the focus or gives it up, and whenever its popup opens or shuts.
  final bool held = MPFocusHolder.holdsFor(context, node);

  return (
    focused: node.hasPrimaryFocus || held,
    // Left off on iOS, as a `Focus` leaves it: flutter/flutter#150030.
    onFocus: defaultTargetPlatform == TargetPlatform.iOS ? null : node.requestFocus,
    expanded: MPFocusHolder.expandedFor(context, node),
  );
}

/// Says that [node], which is round a control, holds the focus on the
/// control's behalf.
///
/// A popup whose rows are painted in an overlay takes its keys on a node of
/// its own round the trigger, above the trigger's own shortcuts, which would
/// otherwise keep <kbd>Enter</kbd> and <kbd>Space</kbd> for the trigger. That
/// node is not a stop and has no name, so it says nothing to a screen reader:
/// the trigger does. While [node] holds the primary focus, the outermost node
/// inside it that can take the focus says it holds it: through
/// [mpFocusSemanticsOf], or through [holdsFor] for a control whose [Focus]
/// speaks for it.
///
/// That node is the trigger, so it also says whether the popup is [open], as
/// a trigger's `aria-expanded` does, open or shut: through
/// [mpFocusSemanticsOf], or through [expandedFor].
class MPFocusHolder extends InheritedWidget {
  /// Wraps the control [node] holds the focus for.
  const MPFocusHolder({
    required this.node,
    required this.holding,
    required this.open,
    required super.child,
    super.key,
  });

  /// The node round the control.
  final FocusNode node;

  /// Whether [node] holds the primary focus.
  final bool holding;

  /// Whether the popup the control opens is open.
  final bool open;

  /// The holder round [context] when [focusNode] is the outermost node inside
  /// it that can take the focus, with no node between the two that can.
  static MPFocusHolder? _standingIn(BuildContext context, FocusNode focusNode) {
    final MPFocusHolder? holder = context.dependOnInheritedWidgetOfExactType<MPFocusHolder>();

    if (holder == null) {
      return null;
    }

    for (final FocusNode ancestor in focusNode.ancestors) {
      if (identical(ancestor, holder.node)) {
        return holder;
      }

      if (ancestor.canRequestFocus) {
        return null;
      }
    }

    return null;
  }

  /// Whether a holder round [context] holds the focus for [focusNode]: it
  /// holds the primary focus, and no node between the two can take the focus.
  ///
  /// Read again whenever the holder takes the focus or gives it up.
  static bool holdsFor(BuildContext context, FocusNode focusNode) {
    return _standingIn(context, focusNode)?.holding ?? false;
  }

  /// Whether the popup opened by the control [focusNode] belongs to is open,
  /// or `null` when no holder round [context] stands for it.
  ///
  /// Read again whenever the popup opens or shuts.
  static bool? expandedFor(BuildContext context, FocusNode focusNode) {
    return _standingIn(context, focusNode)?.open;
  }

  @override
  bool updateShouldNotify(MPFocusHolder oldWidget) {
    return holding != oldWidget.holding ||
        open != oldWidget.open ||
        !identical(node, oldWidget.node);
  }
}

/// Wraps [builder] in the whole interaction apparatus.
///
/// A surface that should stay reachable by pointer but out of the tab order —
/// one option in a set with a roving focus — is wrapped in an [ExcludeFocus] by
/// its parent rather than told so here: the decision belongs to whatever knows
/// which member currently holds the stop.
///
/// [enabled] governs whether the surface can be *reached* — focus, in other
/// words. [interactive] governs whether it *responds*. They are separate because
/// `loading` and `readOnly` stop a control firing without taking it out of the
/// focus order, and `disabled` does both: dropping out of the focus order costs
/// keyboard users their sense of the page, and it should take a real decision to
/// do it.
class MPInteractive extends StatefulWidget {
  /// Creates an interactive surface.
  const MPInteractive({
    required this.builder,
    this.onTap,
    this.onLongPress,
    this.enabled = true,
    this.interactive = true,
    this.pressable = true,
    this.cursor = SystemMouseCursors.click,
    this.focusNode,
    this.autofocus = false,
    this.behavior = HitTestBehavior.opaque,
    this.shortcuts = defaultShortcuts,
    this.onFocusChange,
    this.focusSemantics = false,
    super.key,
  });

  /// Draws the surface from the current state.
  final MPInteractionBuilder builder;

  /// Called when the surface is activated, by pointer or by keyboard.
  final VoidCallback? onTap;

  /// Called on a long press — the touch equivalent of a context menu.
  final VoidCallback? onLongPress;

  /// Whether the surface can take focus, and whether its [shortcuts] do
  /// anything.
  ///
  /// In [NavigationMode.directional] an unavailable surface stays a stop, so
  /// that a reader on a remote can find it; [pressable] is what takes a surface
  /// out there.
  final bool enabled;

  /// Whether it reacts to the pointer and fires its callbacks.
  final bool interactive;

  /// Whether the surface is something to press at all.
  ///
  /// `false` leaves the gesture detector with no recogniser, so a tap goes to
  /// whatever is around the surface, exactly as if it were not wrapped — which
  /// is not the same as an unavailable control, whose recogniser stays to
  /// swallow the tap. It is for a surface that is pressable only some of the
  /// time, such as a card that is handed `onPressed` later: switching this
  /// keeps the same widgets above its content, where leaving the wrapper out
  /// would change the shape of the tree and build the content again from
  /// scratch.
  ///
  /// It takes the surface out of the focus order too, in every navigation
  /// mode. [enabled] alone does that only in [NavigationMode.traditional]: in
  /// [NavigationMode.directional] an unavailable control stays a stop so a
  /// reader on a remote can find it, and a surface with nothing to press is
  /// not a control to find. That holds for a [focusNode] the component was
  /// handed as much as for the node the surface makes for itself.
  final bool pressable;

  /// The cursor over it.
  final MouseCursor cursor;

  /// Drive focus from outside. Left out, the surface owns one of its own.
  ///
  /// While the surface holds the node it decides whether the node can take the
  /// focus, from [enabled], [pressable] and the navigation mode, by setting
  /// its [FocusNode.canRequestFocus]. It gives the node back with the value it
  /// had when the surface took it.
  final FocusNode? focusNode;

  /// Takes focus as it is inserted into the tree.
  final bool autofocus;

  /// How the gesture detector treats hits. [HitTestBehavior.opaque] is what
  /// stops a tap on an unavailable control reaching whatever is behind it.
  final HitTestBehavior behavior;

  /// The keys that activate it.
  ///
  /// Declared rather than inherited, so a component works the same in a bare
  /// [WidgetsApp], inside somebody else's shortcut scope, or with no app widget
  /// above it at all. The scope is this surface, so nothing an app binds
  /// elsewhere is shadowed.
  final Map<ShortcutActivator, Intent> shortcuts;

  /// Called when the surface gains or loses focus, however it was reached.
  final ValueChanged<bool>? onFocusChange;

  /// Whether the surface tells a screen reader that it can take the focus,
  /// whether it holds it, and how to move it there, as a [Focus] does.
  ///
  /// For a component whose `Semantics` is round the surface rather than inside
  /// [builder]: what this says is folded into that node, which a
  /// `MergeSemantics` or a `container` there makes one node with the name, the
  /// state and the tap. A component whose `Semantics` is inside [builder]
  /// leaves it off. Said above that node, it would be folded into whatever is
  /// round the surface, or be a focusable node of its own with the named one
  /// inside it.
  ///
  /// Anything round the surface that leaves its descendants out of the
  /// semantics tree, such as `excludeSemantics`, leaves this out too.
  final bool focusSemantics;

  /// <kbd>Enter</kbd>, the numpad <kbd>Enter</kbd> and <kbd>Space</kbd> — what
  /// activates a button on every platform.
  static const Map<ShortcutActivator, Intent> defaultShortcuts = <ShortcutActivator, Intent>{
    SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.numpadEnter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.space): ActivateIntent(),
  };

  /// The same set with <kbd>Space</kbd> left out.
  ///
  /// For a control inside something that scrolls, where the space bar belongs to
  /// the scroller — and for anything a screen reader drives with <kbd>Enter</kbd>
  /// alone.
  static const Map<ShortcutActivator, Intent> enterOnly = <ShortcutActivator, Intent>{
    SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.numpadEnter): ActivateIntent(),
  };

  @override
  State<MPInteractive> createState() => MPInteractiveState();
}

/// A node a component handed to a surface: what it allowed before a surface
/// took it, and how many surfaces hold it now.
class _Loan {
  _Loan(this.canRequestFocus);

  /// The [FocusNode.canRequestFocus] it is given back with.
  final bool canRequestFocus;

  int holders = 0;
}

/// Every handed node a surface holds.
///
/// Kept for all surfaces rather than by each one, because a node can pass from
/// one surface to the next within a frame: the new surface takes it before the
/// old one lets go, and the old one must neither give the new one's decision
/// back as the caller's nor leave its own behind.
final Expando<_Loan> _loans = Expando<_Loan>('MPInteractive');

/// The state behind a [MPInteractive]. Public so that a component holding a
/// [GlobalKey] to one can ask it to take focus.
///
/// Built on [Focus], [Shortcuts] and [Actions] directly rather than on a
/// [FocusableActionDetector], which decides for itself whether its node can
/// take the focus: it lets any node do so in [NavigationMode.directional], and
/// it would make a surface with nothing to press a stop for a remote whenever
/// the node was handed in from outside.
class MPInteractiveState extends State<MPInteractive> {
  bool _hovered = false;
  bool _pressed = false;
  Offset? _pointer;

  /// Whether the node, or something inside the surface, holds the focus.
  bool _focused = false;

  /// Whether the focus system is in its traditional highlight mode, which a
  /// key puts it in and a touch takes it out of. A ring is drawn only then.
  bool _keyboard = false;

  /// Whether the node can take the focus now.
  bool _takesFocus = false;

  /// The node the surface uses when the component handed it none.
  final FocusNode _ownNode = FocusNode(debugLabel: 'MPInteractive');

  /// The handed node this surface holds, if any.
  FocusNode? _borrowed;

  /// What a keyboard, or a screen reader, does to the surface. Made once: the
  /// callbacks read [widget] when they run.
  late final Map<Type, Action<Intent>> _actions = <Type, Action<Intent>>{
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (ActivateIntent intent) {
        _activate();
        return null;
      },
    ),
    ButtonActivateIntent: CallbackAction<ButtonActivateIntent>(
      onInvoke: (ButtonActivateIntent intent) {
        _activate();
        return null;
      },
    ),
  };

  FocusNode get _node => widget.focusNode ?? _ownNode;

  @override
  void initState() {
    super.initState();
    _keyboard = FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    FocusManager.instance.addHighlightModeListener(_handleHighlightMode);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _decide();
  }

  @override
  void didUpdateWidget(MPInteractive oldWidget) {
    super.didUpdateWidget(oldWidget);
    _decide();
  }

  @override
  void dispose() {
    FocusManager.instance.removeHighlightModeListener(_handleHighlightMode);
    _borrow(null);
    _ownNode.dispose();
    super.dispose();
  }

  /// Decides whether the node can take the focus, and tells the node.
  ///
  /// [MPInteractive.enabled] decides it in [NavigationMode.traditional]. In
  /// [NavigationMode.directional] an unavailable control stays a stop, as a
  /// [FocusableActionDetector] leaves it, so a reader on a remote can find it.
  /// A surface with nothing to press is a stop in neither.
  void _decide() {
    _borrow(widget.focusNode);

    _takesFocus =
        widget.pressable &&
        switch (MediaQuery.maybeNavigationModeOf(context)) {
          NavigationMode.traditional || null => widget.enabled,
          NavigationMode.directional => true,
        };

    // Written here, next to where a handed node is given back, rather than
    // handed to the `Focus` below, which would write it on a node and never
    // give it back. A node that gives up the focus this way hands it to
    // whatever held it before.
    _node.canRequestFocus = _takesFocus;
  }

  /// Takes [node] from the component, and gives back the one held before.
  void _borrow(FocusNode? node) {
    final FocusNode? previous = _borrowed;

    if (identical(node, previous)) {
      return;
    }

    _borrowed = node;

    if (node != null) {
      // `canRequestFocus` reads `false` under a node that keeps its
      // descendants from the focus, such as an `ExcludeFocus`, whatever the
      // node itself says. Taken as the caller's word only where nothing above
      // it says otherwise, which is always the case for a node that is not in
      // the tree yet; left at the default where something does.
      final _Loan loan = _loans[node] ??= _Loan(
        node.ancestors.every((FocusNode ancestor) => ancestor.descendantsAreFocusable)
            ? node.canRequestFocus
            : true,
      );
      loan.holders += 1;
    }

    if (previous != null) {
      final _Loan loan = _loans[previous]!;
      loan.holders -= 1;

      if (loan.holders == 0) {
        _loans[previous] = null;
        previous.canRequestFocus = loan.canRequestFocus;
      }
    }
  }

  void _handleFocusChange(bool focused) {
    if (_focused == focused) {
      return;
    }

    setState(() => _focused = focused);
    widget.onFocusChange?.call(focused);
  }

  void _handleHighlightMode(FocusHighlightMode mode) {
    final keyboard = mode == FocusHighlightMode.traditional;

    if (!mounted || keyboard == _keyboard) {
      return;
    }

    // Every surface on the screen hears this whenever the reader moves
    // between the keyboard and a pointer. Only one that is holding the focus
    // has a ring to draw or take away.
    if (_focused && _takesFocus) {
      setState(() => _keyboard = keyboard);
    } else {
      _keyboard = keyboard;
    }
  }

  void _setPointer(Offset position) {
    // Written on every pointer frame, so it is deliberately not `setState` for
    // its own sake — but a radial gradient has to be rebuilt to move, and the
    // `RepaintBoundary` the light sits behind keeps that repaint off the label.
    //
    // It runs while a finger is down too, which is what makes the light follow a
    // drag on a touch screen: there is no hover there, and the press layer is
    // the one doing the work.
    //
    // Not at all on a surface with nothing to press, which has no light to
    // place and would otherwise build itself again on every frame a mouse
    // spent crossing it.
    if (widget.pressable && _pointer != position) {
      setState(() => _pointer = position);
    }
  }

  void _activate() {
    if (widget.interactive) {
      widget.onTap?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Hover and press only *look* like anything while the surface can be used.
    final state = MPInteraction(
      hovered: widget.interactive && _hovered,
      pressed: widget.interactive && widget.pressable && _pressed,
      // The focus ring only appears on what CSS calls `:focus-visible` — a
      // keyboard reaching the control, never a mouse clicking it. Flutter's
      // name for the same distinction is the highlight mode. Something inside
      // the surface holding the focus counts, as it does for
      // `FocusableActionDetector`; a component whose inner stops draw rings of
      // their own asks `Focus.of` for the primary focus as well.
      focusVisible: _focused && _keyboard && _takesFocus,
      pointer: _pointer,
    );

    // Hover is deliberately *not* taken from the focus system's highlight
    // mode: whether the pointer is over the surface is the whole question, and
    // this `MouseRegion` answers exactly it.
    final Widget surface = MouseRegion(
      cursor: widget.cursor,
      onEnter: (PointerEnterEvent event) {
        _setPointer(event.localPosition);
        setState(() => _hovered = true);
      },
      onExit: (PointerExitEvent event) => setState(() => _hovered = false),
      onHover: (PointerHoverEvent event) => _setPointer(event.localPosition),
      child: Listener(
        onPointerDown: (PointerDownEvent event) => _setPointer(event.localPosition),
        onPointerMove: (PointerMoveEvent event) => _setPointer(event.localPosition),
        child: GestureDetector(
          behavior: widget.pressable ? widget.behavior : HitTestBehavior.deferToChild,
          // Described by whatever `Semantics` the component put around this,
          // which knows about `readOnly` and `loading` and this does not.
          excludeFromSemantics: true,
          // Present whenever the surface is pressable, even when nothing will
          // happen: the recogniser is what stops a tap on an unavailable
          // control reaching whatever is behind it. A row that navigates
          // should not navigate because someone tried the disabled button
          // inside it.
          onTap: widget.pressable ? _activate : null,
          onLongPress: widget.pressable && widget.interactive ? widget.onLongPress : null,
          onTapDown: widget.pressable
              ? (TapDownDetails details) => setState(() => _pressed = true)
              : null,
          onTapUp: widget.pressable
              ? (TapUpDetails details) => setState(() => _pressed = false)
              : null,
          onTapCancel: widget.pressable ? () => setState(() => _pressed = false) : null,
          child: Builder(builder: (BuildContext context) => widget.builder(context, state)),
        ),
      ),
    );

    // The shortcuts and the actions are in the tree whether the surface is
    // enabled or not, with nothing in them while it is not, so that the shape
    // of the tree above the content never changes with it.
    return Shortcuts(
      shortcuts: widget.enabled ? widget.shortcuts : const <ShortcutActivator, Intent>{},
      // The focus node `Shortcuts` makes can never take the focus, so all its
      // semantics could say is "not focusable". Said, it is an annotation of
      // its own above the component's node, which a parent that keeps its
      // children apart makes an empty node round that one.
      includeSemantics: false,
      child: Actions(
        actions: widget.enabled ? _actions : const <Type, Action<Intent>>{},
        // Not told `canRequestFocus`, which `_decide` has written on the node
        // already. Left out, the `Focus` writes back only what it reads off
        // the node.
        child: Focus(
          focusNode: _node,
          autofocus: widget.autofocus,
          // Said below instead, when the component asks for it. A `Focus`
          // reads whether its node can take the focus before it has put the
          // node in the tree, and keeps that until the node changes, so a
          // surface behind an `ExcludeFocus` would say it can.
          includeSemantics: false,
          onFocusChange: _handleFocusChange,
          child: Builder(
            builder: (BuildContext context) {
              // Read here, under the `Focus`, once the node is in the tree,
              // and again whenever the node or the surface changes. Nothing
              // is said unless the component asks: one whose own `Semantics`
              // is inside the builder would have a second node above it.
              final focus = widget.focusSemantics
                  ? mpFocusSemanticsOf(context)
                  : (focused: null, onFocus: null, expanded: null);

              return Semantics(
                focused: focus.focused,
                onFocus: focus.onFocus,
                expanded: focus.expanded,
                child: surface,
              );
            },
          ),
        ),
      ),
    );
  }
}
