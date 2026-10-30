/// A guided walk over a screen that already exists.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/back.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/sheet_close.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/tour.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How wide the card is allowed to get, so the prose keeps a measure.
const Map<MPSize, double> _maxWidth = <MPSize, double>{
  MPSize.xs: 224,
  MPSize.sm: 256,
  MPSize.md: 320,
  MPSize.lg: 384,
  MPSize.xl: 448,
};

/// What the card's buttons are drawn at: one rung under the card itself.
///
/// A `md` card's footer at the control ladder's 56 would be taller than the
/// sentence above it.
const Map<MPSize, MPSize> _buttonSize = <MPSize, MPSize>{
  MPSize.xs: MPSize.xs,
  MPSize.sm: MPSize.xs,
  MPSize.md: MPSize.sm,
  MPSize.lg: MPSize.sm,
  MPSize.xl: MPSize.md,
};

/// How far the card stands off the target. A step with no target hangs its
/// card from the middle of the screen, with no gap.
const double _gap = 10;

/// How close to the edge of the screen the card may get.
const double _margin = 12;

/// How long the hole takes to travel from one step's target to the next:
/// MD3's `medium1`.
const Duration _travel = Duration(milliseconds: 250);

/// One stop on the tour.
@immutable
class MPTourStep {
  /// Creates a stop.
  const MPTourStep({
    this.target,
    this.title,
    this.content,
    this.side = MPSide.bottom,
    this.align = MPAlign.center,
    this.padding = 6,
  });

  /// What this step is about, as a [GlobalKey] on the widget itself.
  ///
  /// The React build takes a CSS selector, because a web page can hold
  /// elements the code that runs the tour did not render. Every widget on a
  /// Flutter screen was written by somebody who can put a key on it, and a key
  /// is checked by the compiler.
  ///
  /// Left out, or pointing at nothing that is laid out, the card hangs from
  /// the middle of the screen with nothing cut out of the dimming, which is
  /// what a welcome step and a closing step are.
  final GlobalKey? target;

  /// The step's heading.
  final Widget? title;

  /// What it says.
  final Widget? content;

  /// Which edge of the target the card sits on. It goes to the opposite edge
  /// when there is no room on this one.
  final MPSide side;

  /// Where along that edge.
  final MPAlign align;

  /// How far the hole is grown past the target, in logical pixels. A control
  /// with a focus ring wants a couple; a whole panel wants none.
  final double padding;
}

/// A guided walk over a screen that already exists.
///
/// ```dart
/// MPTour(
///   open: _running,
///   onOpenChange: (bool next) => setState(() => _running = next),
///   steps: <MPTourStep>[
///     const MPTourStep(title: Text('Welcome'), content: Text('Three things worth knowing.')),
///     MPTourStep(target: _search, title: const Text('Search')),
///   ],
/// )
/// ```
///
/// It is `MPStepper` turned inside out. That widget puts the instructions in
/// the screen and the reader follows them; this one leaves the screen as it is
/// and stands over it. So a step says what it is about rather than describing
/// it: what a tour points at is already on screen.
///
/// ## The dimming never takes the pointer
///
/// A reader can use the control being pointed at while the card is up, and
/// that is the difference between a tour and a sequence of dialogs. Nothing
/// outside the card is blocked, no focus is trapped, and neither a press
/// outside nor the focus leaving ends the tour. Only <kbd>Escape</kbd>, the
/// system back, the ×, and the card's own buttons do.
///
/// The dimming is MD3's scrim at 32% with the target cut out of it, one path
/// rather than four rectangles round the target, whose corners would show as
/// hairlines at anything short of opaque. It does not blur: a blur says "you
/// cannot use this right now", and a tour is saying the opposite.
///
/// ## How the hole keeps up
///
/// Nothing reports that a widget has moved. A banner loading above the target
/// or a panel opening beside it moves the target and says nothing. So while the
/// tour is up it reads the target's place after every frame, and builds again
/// only when the place has changed. A screen holding still draws no frames,
/// and so costs nothing.
///
/// The widget draws nothing where it is written, so it can go anywhere under
/// an [Overlay]; `WidgetsApp` with a navigator provides one.
class MPTour extends StatefulWidget {
  /// Creates a tour.
  const MPTour({
    required this.steps,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.step,
    this.initialStep = 0,
    this.onStepChange,
    this.onFinish,
    this.scrim = true,
    this.skippable = true,
    this.dismissible = true,
    this.scrollIntoView = true,
    this.locale,
    this.labels,
    this.size,
    this.color,
    super.key,
  });

  /// The stops, in order. With none, the tour draws nothing at all.
  final List<MPTourStep> steps;

  /// Whether the tour is running. Pass it with [onOpenChange] to control one;
  /// left `null`, the tour keeps it itself, starting from [initialOpen].
  final bool? open;

  /// Whether it starts running, for a tour that keeps [open] itself.
  final bool initialOpen;

  /// Called with what [open] should become: a press on Skip, Done or the ×,
  /// <kbd>Escape</kbd>, or the system back.
  final ValueChanged<bool>? onOpenChange;

  /// Which stop, from `0`. Pass it with [onStepChange] to control one; left
  /// `null`, the tour keeps it itself, starting from [initialStep]. A step past
  /// the end is the last one.
  final int? step;

  /// Which one it starts on, for a tour that keeps [step] itself.
  final int initialStep;

  /// Called with the stop a Next or Back press asks for.
  final ValueChanged<int>? onStepChange;

  /// Called when the last step's button is pressed, before the tour closes.
  ///
  /// Skip, <kbd>Escape</kbd> and the × close it without this. Skipping is not
  /// finishing, and an onboarding flow that marked itself seen on a skip would
  /// never show again to somebody who left it.
  final VoidCallback? onFinish;

  /// Dims the screen and cuts the target out of the dimming. Off, the card is
  /// the only thing the tour draws.
  final bool scrim;

  /// Offers the Skip button beside the counter. It does not appear on the last
  /// step, where it would be a second word for Done.
  final bool skippable;

  /// Whether <kbd>Escape</kbd>, the system back and the × end the tour. `false`
  /// draws no ×: one that did nothing would be worse than none.
  final bool dismissible;

  /// Scrolls each target into view as the tour reaches it.
  final bool scrollIntoView;

  /// Which language the buttons and the counter are in. Falls back to the
  /// nearest `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Overrides for the five words the tour says on its own behalf, by key:
  /// `previous`, `next`, `done`, `skip` and `position` (with `{index}` and
  /// `{total}` in it). Whatever is not given comes from [locale].
  final Map<String, String>? labels;

  /// The card's room, type and width. [MPSize.md] unless an [MPConfigProvider]
  /// says otherwise.
  final MPSize? size;

  /// Which accent family the card's buttons read. [MPColor.primary] unless an
  /// [MPConfigProvider] says otherwise.
  final MPColor? color;

  @override
  State<MPTour> createState() => _MPTourState();
}

class _MPTourState extends State<MPTour> with SingleTickerProviderStateMixin {
  final OverlayPortalController _portal = OverlayPortalController();

  /// The card, which takes the focus when the tour opens so <kbd>Escape</kbd>
  /// reaches it. Not a stop of its own: Tab goes on to its buttons.
  final FocusNode _cardFocus = FocusNode(debugLabel: 'MPTour', skipTraversal: true);

  // No duration here: `_syncMotion` gives it the theme's before the first
  // frame, and again whenever the reader's motion preference changes.
  late final AnimationController _fade = AnimationController(vsync: this);
  late final CurvedAnimation _opacity = CurvedAnimation(parent: _fade, curve: MPMotion.standard);

  late bool _open = widget.initialOpen;
  late int _step = widget.initialStep;

  /// Where the focus was when the tour opened, handed back when it closes.
  FocusNode? _restore;

  /// Where the target is on the overlay, tagged with the step it was measured
  /// for. Tagged, because the step changes a frame before the measure catches
  /// up, and an untagged rectangle would put the last step's hole round the
  /// next step's card for a frame.
  Rect? _target;
  int _targetAt = -1;

  /// What a screen reader is told when the step changes under it.
  ///
  /// Empty until the step actually moves. The card is read as the focus
  /// arrives in it on open, and a live region that arrived already full would
  /// read it a second time.
  String _spoken = '';
  int _announced = -1;

  /// Whether a look at the target waits for the end of the next frame.
  bool _watching = false;

  bool get _running => widget.open ?? _open;

  int get _index {
    final int asked = widget.step ?? _step;

    return widget.steps.isEmpty ? 0 : asked.clamp(0, widget.steps.length - 1);
  }

  MPTourStep? get _current => widget.steps.isEmpty ? null : widget.steps[_index];

  @override
  void initState() {
    super.initState();
    _fade.addStatusListener(_onFade);
    _announced = _index;

    if (_running && widget.steps.isNotEmpty) {
      _show();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fade.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : MPMotion.short4;
  }

  @override
  void didUpdateWidget(MPTour oldWidget) {
    super.didUpdateWidget(oldWidget);

    final bool was = (oldWidget.open ?? _open) && oldWidget.steps.isNotEmpty;
    final bool now = _running && widget.steps.isNotEmpty;

    if (was != now) {
      now ? _show() : _hide();
    }

    if (now && widget.step != oldWidget.step) {
      // No `setState`: the tour is being built again already.
      _arrived(rebuild: false);
    }
  }

  @override
  void dispose() {
    _fade.removeStatusListener(_onFade);
    _opacity.dispose();
    _fade.dispose();
    _cardFocus.dispose();
    super.dispose();
  }

  /// Runs [callback] once the frame that asked for it is over.
  ///
  /// Everything a layer does to itself is out of bounds during a build, and a
  /// build is nearly always where the change arrives from.
  void _afterFrame(VoidCallback callback) {
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => callback());
  }

  void _show() {
    _restore ??= FocusManager.instance.primaryFocus;

    // A tour that opens again starts with nothing said: the step it opens on
    // is read as the focus arrives in the card.
    _announced = _index;
    _spoken = '';

    _afterFrame(() {
      if (!mounted || !_running || widget.steps.isEmpty) {
        return;
      }

      if (!_portal.isShowing) {
        // Built again with it, so the guard takes the system back now the
        // layer is up.
        setState(_portal.show);
      }

      _fade.forward();
      _reveal();
      _watch();

      // One more frame: the card has to be in the tree before it can be asked
      // for the focus.
      _afterFrame(() {
        if (mounted && _running && _portal.isShowing) {
          _cardFocus.requestFocus();
        }
      });
    });
  }

  void _hide() {
    _fade.reverse();

    // Back where it came from, unless the reader has since moved the focus
    // somewhere of their own on the page.
    final FocusNode? back = _restore;
    _restore = null;

    if (_cardFocus.hasFocus && back != null && back.context != null) {
      back.requestFocus();
    }
  }

  void _onFade(AnimationStatus status) {
    if (status != AnimationStatus.dismissed || !_portal.isShowing) {
      return;
    }

    // Under reduced motion the fade is over inside the build that closed the
    // tour, where a layer cannot be taken down, so it goes after that frame.
    if (SchedulerBinding.instance.schedulerPhase == SchedulerPhase.persistentCallbacks) {
      _afterFrame(_takeDown);
    } else {
      _takeDown();
    }
  }

  void _takeDown() {
    if (mounted && !_running && _fade.isDismissed && _portal.isShowing) {
      setState(_portal.hide);
    }
  }

  /// Looks at the target after every frame for as long as the tour is up, and
  /// builds again when it has moved.
  ///
  /// A look at the end of a frame rather than a listener on the screen, the
  /// scroll and the target: nothing else hears a relayout that moves the
  /// target. It costs nothing while no frame is drawn.
  void _watch() {
    if (_watching) {
      return;
    }

    _watching = true;
    _afterFrame(() {
      _watching = false;

      if (!mounted || !_running || !_portal.isShowing) {
        return;
      }

      _measure();
      _watch();
    });
  }

  /// Reads where the current step's target is on the overlay.
  void _measure() {
    if (!mounted) {
      return;
    }

    final RenderObject? box = _current?.target?.currentContext?.findRenderObject();
    final RenderObject? room = Overlay.maybeOf(context)?.context.findRenderObject();

    Rect? next;

    if (box is RenderBox && room is RenderBox && box.attached && box.hasSize && room.hasSize) {
      next = box.localToGlobal(Offset.zero, ancestor: room) & box.size;
    }

    if (next != _target || _targetAt != _index) {
      setState(() {
        _target = next;
        _targetAt = _index;
      });
    }
  }

  /// Brings the step's target on screen. The watch reads where it lands.
  void _reveal() {
    final BuildContext? target = _current?.target?.currentContext;

    if (target != null && widget.scrollIntoView) {
      final bool reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

      Scrollable.ensureVisible(
        target,
        alignment: 0.5,
        duration: reduce ? Duration.zero : MPMotion.medium4,
        curve: MPMotion.standard,
      );
    }

    _measure();
  }

  /// The step has moved: say where the reader has arrived, and bring the new
  /// target into view.
  void _arrived({bool rebuild = true}) {
    final int index = _index;

    if (_announced != index) {
      _announced = index;

      final String position = mpFillMessage(_messages()['position']!, <String, String>{
        'index': '${index + 1}',
        'total': '${widget.steps.length}',
      });
      final Widget? title = widget.steps[index].title;
      final String? words = title is Text ? title.data : null;

      // The position and the title, not the whole card: the body is two
      // sentences the reader can walk into, and the position goes first
      // because "Step 3 of 7" is what a tour is asked for most.
      final String spoken = words == null || words.isEmpty ? position : '$position. $words';

      if (rebuild) {
        setState(() => _spoken = spoken);
      } else {
        _spoken = spoken;
      }
    }

    _afterFrame(() {
      if (mounted && _running) {
        _reveal();
      }
    });
  }

  Map<String, String> _messages() {
    return mpMessagesOf(context, mpTourMessages, locale: widget.locale, overrides: widget.labels);
  }

  void _setOpen(bool next) {
    final bool was = _running;

    if (widget.open == null) {
      setState(() => _open = next);
    }

    widget.onOpenChange?.call(next);

    if (widget.open == null && was != next) {
      next ? _show() : _hide();
    }
  }

  void _goTo(int next) {
    final bool held = _cardFocus.hasFocus;

    if (widget.step == null) {
      setState(() => _step = next);
    }

    widget.onStepChange?.call(next);

    if (widget.step == null) {
      _arrived();
    }

    // Back is not drawn on the first step, so a reader who pressed it to get
    // there is left on a button that has gone. The focus stays in the card.
    if (held) {
      _afterFrame(() {
        if (mounted && _running && !_cardFocus.hasFocus) {
          _cardFocus.requestFocus();
        }
      });
    }
  }

  void _finish() {
    widget.onFinish?.call();
    _setOpen(false);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.steps.isEmpty) {
      return const SizedBox.shrink();
    }

    // Taken while the layer is up and the tour can be dismissed, and answered
    // as Escape is. A tour that cannot be dismissed lets the back go on to the
    // page, which the tour never took away.
    return MPBackGuard(
      active: _running && _portal.isShowing && widget.dismissible,
      onBack: () => _setOpen(false),
      child: OverlayPortal(
        controller: _portal,
        overlayChildBuilder: _buildLayer,
        child: const SizedBox.shrink(),
      ),
    );
  }

  Widget _buildLayer(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPTourStep step = _current!;
    final Rect? target = _targetAt == _index ? _target : null;
    final TextDirection direction = Directionality.of(context);

    Widget card = _card(theme, size: size, color: color, step: step);

    card = Shortcuts(
      shortcuts: const <ShortcutActivator, Intent>{
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (DismissIntent intent) {
              if (widget.dismissible) {
                _setOpen(false);
              }

              return null;
            },
          ),
        },
        child: Focus(focusNode: _cardFocus, includeSemantics: false, child: card),
      ),
    );

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        // Drawn only while the tour is running, and gone the moment it stops:
        // the card fades out, and a scrim that lingered round it would say the
        // tour was still on.
        if (widget.scrim && _running)
          IgnorePointer(
            child: ExcludeSemantics(
              child: _Scrim(
                hole: target == null ? null : inflate(target, step.padding),
                radius: theme.shapes.extraSmall,
                color: mpScrimColor(colors),
              ),
            ),
          ),
        CustomSingleChildLayout(
          delegate: _CardLayout(
            target: target,
            side: step.side,
            align: step.align,
            direction: direction,
            maxWidth: _maxWidth[size]!,
          ),
          child: FadeTransition(opacity: _opacity, child: card),
        ),
      ],
    );
  }

  Widget _card(
    MPThemeData theme, {
    required MPSize size,
    required MPColor color,
    required MPTourStep step,
  }) {
    final MPColorScheme colors = theme.colors;
    final Map<String, String> messages = _messages();
    final bool first = _index == 0;
    final bool last = _index == widget.steps.length - 1;
    final MPSize buttons = _buttonSize[size]!;
    final bool titled = step.title != null || step.content != null;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final String position = mpFillMessage(messages['position']!, <String, String>{
      'index': '${_index + 1}',
      'total': '${widget.steps.length}',
    });

    final Widget header = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: <Widget>[
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            spacing: 4,
            children: <Widget>[
              if (step.title != null)
                DefaultTextStyle.merge(
                  style: mpSheetTitle(
                    theme.typescale,
                    size,
                  ).style(colors.onSurface).copyWith(fontWeight: FontWeight.w500),
                  // A node of its own, or the heading takes the content and the
                  // count into its name.
                  child: Semantics(container: true, header: true, child: step.title),
                ),
              if (step.content != null)
                DefaultTextStyle.merge(
                  style: TextStyle(color: colors.onSurfaceVariant),
                  child: Semantics(container: true, child: step.content),
                ),
            ],
          ),
        ),
        if (widget.dismissible)
          // React's `-me-1 -mt-1`: the circle reaches into the card's corner
          // padding, so the × lines up with the title rather than sitting a
          // step inside it.
          Transform.translate(
            offset: Offset(rtl ? -4 : 4, -4),
            child: MPSheetCloseButton(
              label: mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['close']!,
              onPressed: () => _setOpen(false),
              color: colors.onSurfaceVariant,
              ring: colors.secondary,
              iconSize: mpControlIcon[size]!,
            ),
          ),
      ],
    );

    final Widget footer = Row(
      spacing: 8,
      children: <Widget>[
        // Where the reader is, drawn rather than only announced: a tour is an
        // interruption, and the first thing anybody wants to know about one is
        // how long it goes on for.
        Text(
          position,
          style: theme.typescale.bodySmall
              .style(colors.onSurfaceVariant)
              .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
        ),
        // A wrap rather than a row: three buttons in a language whose words
        // are longer than English's go to a second line instead of off the
        // edge of the card.
        Expanded(
          child: Wrap(
            alignment: WrapAlignment.end,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 4,
            runSpacing: 4,
            children: <Widget>[
              if (widget.skippable && !last)
                MPButton(
                  size: buttons,
                  variant: MPVariant.text,
                  color: MPColor.secondary,
                  onPressed: () => _setOpen(false),
                  child: Text(messages['skip']!),
                ),
              if (!first)
                MPButton(
                  size: buttons,
                  variant: MPVariant.outlined,
                  color: color,
                  onPressed: () => _goTo(_index - 1),
                  child: Text(messages['previous']!),
                ),
              MPButton(
                size: buttons,
                color: color,
                onPressed: () => last ? _finish() : _goTo(_index + 1),
                child: Text(last ? messages['done']! : messages['next']!),
              ),
            ],
          ),
        ),
      ],
    );

    final double pad = mpSheetPad[size]!;

    return Semantics(
      // Announced as a dialog of its own, and deliberately not a route: a tour
      // that took the route would be a modal, and the reader could not reach
      // the control it is telling them about.
      container: true,
      explicitChildNodes: true,
      role: SemanticsRole.dialog,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.surfaceContainer,
          borderRadius: BorderRadius.circular(theme.shapes.medium),
          boxShadow: MPShadows.of(3),
        ),
        child: Padding(
          padding: EdgeInsets.all(pad),
          child: DefaultTextStyle.merge(
            style: mpProseText(theme.typescale, size).style(colors.onSurface),
            child: IntrinsicWidth(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                spacing: mpSheetGap[size]!,
                children: <Widget>[
                  if (titled) header,
                  Stack(
                    children: <Widget>[
                      footer,
                      // Said when the step moves while the focus stays on Next,
                      // which would otherwise leave a screen reader on the
                      // button with nothing to say the card now says something
                      // else. Laid over the footer, so it takes no room in the
                      // card.
                      PositionedDirectional(
                        start: 0,
                        top: 0,
                        child: Semantics(
                          container: true,
                          liveRegion: true,
                          label: _spoken,
                          // A pixel rather than nothing: a node with no area
                          // is left off the semantics tree, as React's live
                          // region is visually hidden at a pixel.
                          child: const SizedBox.square(dimension: 1),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The screen with the hole cut out of it, travelling between targets.
///
/// One path, and the pointer goes straight through it: it is drawn under an
/// [IgnorePointer], because a tour that blocked the page would be a dialog
/// wearing a cut-out.
class _Scrim extends StatefulWidget {
  const _Scrim({required this.hole, required this.radius, required this.color});

  final Rect? hole;
  final double radius;
  final Color color;

  @override
  State<_Scrim> createState() => _ScrimState();
}

class _ScrimState extends State<_Scrim> with SingleTickerProviderStateMixin {
  late final AnimationController _move = AnimationController(vsync: this, value: 1);

  Rect? _from;
  Rect? _to;

  @override
  void initState() {
    super.initState();
    _from = widget.hole;
    _to = widget.hole;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _move.duration = (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
        ? Duration.zero
        : _travel;
  }

  @override
  void didUpdateWidget(_Scrim oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.hole == oldWidget.hole) {
      return;
    }

    // Travels from wherever it is now, which is mid-flight when the target
    // moves again before the last move has finished. From no hole, or to
    // none, it is not a move but a different dimming, and it is drawn at once.
    if (_current == null || widget.hole == null) {
      _from = widget.hole;
      _to = widget.hole;
      _move.value = 1;

      return;
    }

    _from = _current;
    _to = widget.hole;
    _move.forward(from: 0);
  }

  Rect? get _current {
    final Rect? from = _from;
    final Rect? to = _to;

    if (from == null || to == null) {
      return to;
    }

    return Rect.lerp(from, to, MPMotion.standard.transform(_move.value));
  }

  @override
  void dispose() {
    _move.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _move,
      builder: (BuildContext context, Widget? child) {
        return CustomPaint(
          size: Size.infinite,
          painter: _ScrimPainter(hole: _current, radius: widget.radius, color: widget.color),
        );
      },
    );
  }
}

class _ScrimPainter extends CustomPainter {
  const _ScrimPainter({required this.hole, required this.radius, required this.color});

  final Rect? hole;
  final double radius;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawPath(spotlightPath(size, hole, radius), Paint()..color = color);
  }

  /// Whether [position] is somewhere the scrim is painted, which is everywhere
  /// but the hole. Never asked by the framework, since the scrim is under an
  /// [IgnorePointer]; it says where the hole is to whoever asks.
  @override
  bool? hitTest(Offset position) {
    final Rect? cut = hole;

    return cut == null || !cut.contains(position);
  }

  @override
  bool shouldRepaint(_ScrimPainter oldDelegate) {
    return oldDelegate.hole != hole || oldDelegate.radius != radius || oldDelegate.color != color;
  }
}

/// Puts the card beside the target, or hangs it from the middle of the screen
/// when there is no target, as the React build hangs it from a point there.
class _CardLayout extends SingleChildLayoutDelegate {
  const _CardLayout({
    required this.target,
    required this.side,
    required this.align,
    required this.direction,
    required this.maxWidth,
  });

  final Rect? target;
  final MPSide side;
  final MPAlign align;
  final TextDirection direction;
  final double maxWidth;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) {
    final double room = (constraints.maxWidth - _margin * 2).clamp(0.0, double.infinity);
    final double tall = (constraints.maxHeight - _margin * 2).clamp(0.0, double.infinity);

    return BoxConstraints(maxWidth: maxWidth < room ? maxWidth : room, maxHeight: tall);
  }

  @override
  Offset getPositionForChild(Size size, Size childSize) {
    final Rect? spot = target;

    // Along a top or a bottom edge, start and end are the reader's; the
    // geometry works in left and right, so they are turned round under RTL.
    final bool vertical = side == MPSide.top || side == MPSide.bottom;
    final MPAlign along = vertical && direction == TextDirection.rtl
        ? switch (align) {
            MPAlign.start => MPAlign.end,
            MPAlign.center => MPAlign.center,
            MPAlign.end => MPAlign.start,
          }
        : align;

    return cardOffset(
      view: size,
      spot: spot ?? Rect.fromCenter(center: size.center(Offset.zero), width: 0, height: 0),
      card: childSize,
      side: side,
      align: along,
      gap: spot == null ? 0 : _gap,
      margin: _margin,
    );
  }

  @override
  bool shouldRelayout(_CardLayout oldDelegate) {
    return oldDelegate.target != target ||
        oldDelegate.side != side ||
        oldDelegate.align != align ||
        oldDelegate.direction != direction ||
        oldDelegate.maxWidth != maxWidth;
  }
}
