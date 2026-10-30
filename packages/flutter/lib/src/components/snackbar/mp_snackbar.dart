/// A short message about something that has already happened.
library;

import 'dart:async';

import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/sheet_close.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Where a stack of snackbars is pinned.
///
/// One word rather than a side and an alignment, because the two are not
/// independent: a snackbar stack is always pinned to the top or the bottom,
/// never to a side, and offering `left` as a side would invite a column down
/// the middle of the screen that no layout survives. The second half is the
/// reader's start, centre or end, as everywhere else in the library.
enum MPSnackbarPosition {
  /// Pinned to the top, at the start of the line.
  topStart,

  /// Pinned to the top, in the middle.
  topCenter,

  /// Pinned to the top, at the end of the line.
  topEnd,

  /// Pinned to the bottom, at the start of the line. MD3's own placement.
  bottomStart,

  /// Pinned to the bottom, in the middle.
  bottomCenter,

  /// Pinned to the bottom, at the end of the line.
  bottomEnd,
}

/// How urgently a snackbar asks to be read out.
enum MPSnackbarPriority {
  /// Waits for a pause. A save confirmation is not worth interrupting for.
  low,

  /// Interrupts where the platform can. An error is worth it.
  high,
}

/// One message, as a caller describes it.
///
/// A description rather than a widget: what a caller has at the moment a
/// message is warranted is a callback, not a place in the tree, and a widget
/// with an `open` flag would be a piece of state per message kept mounted for
/// good, which is the shape the provider exists to avoid.
///
/// Every field is optional so that the same class describes a change:
/// [MPSnackbarController.update] lays the fields it is given over the ones the
/// snackbar already has and leaves the rest as they were.
@immutable
class MPSnackbarOptions {
  /// Describes a snackbar.
  const MPSnackbarOptions({
    this.id,
    this.message,
    this.timeout,
    this.priority,
    this.actionLabel,
    this.onAction,
    this.onClose,
    this.onRemove,
    this.color,
    this.icon,
    this.position,
  });

  /// Names the snackbar.
  ///
  /// Raising one with an id already on screen updates that snackbar in place
  /// and restarts its clock, which is what "uploading… / uploaded" wants: one
  /// message that changed its mind, not two stacked on each other.
  final String? id;

  /// What it says.
  ///
  /// One slot, not a title and a body: MD3's snackbar has a single run of
  /// supporting text, up to two lines, and nothing else. A message that needs a
  /// heading is not a snackbar; it is a dialog the reader has not been shown
  /// yet.
  final Widget? message;

  /// How long before it dismisses itself. [Duration.zero] keeps it up until it
  /// is closed, which is the right answer for anything the reader has to act
  /// on. Left out, the provider's.
  final Duration? timeout;

  /// How urgently it asks to be read out. [MPSnackbarPriority.low] when left
  /// out.
  final MPSnackbarPriority? priority;

  /// The label of the action. Passing it is what makes the action appear.
  final Widget? actionLabel;

  /// Called when the action is pressed. The snackbar stays up, as it does in
  /// the React build: an action that wants it gone closes it.
  final VoidCallback? onAction;

  /// Called when it closes, however it closed.
  final VoidCallback? onClose;

  /// Called once it has finished going out and has left the tree.
  final VoidCallback? onRemove;

  /// Which family the plate is painted in, overriding the provider's.
  final MPColor? color;

  /// A glyph before the message, drawn in the plate's ink.
  final Widget? icon;

  /// Which stack this one joins, overriding the provider's.
  ///
  /// For the message that has to be somewhere else because of what it is,
  /// such as an error on a screen whose bottom corner is a toolbar. Not for a
  /// preference: an app whose snackbars all appear in the same wrong place
  /// should move the provider.
  final MPSnackbarPosition? position;

  /// These options with [over]'s fields laid on top.
  MPSnackbarOptions _merge(MPSnackbarOptions over) {
    return MPSnackbarOptions(
      id: id,
      message: over.message ?? message,
      timeout: over.timeout ?? timeout,
      priority: over.priority ?? priority,
      actionLabel: over.actionLabel ?? actionLabel,
      onAction: over.onAction ?? onAction,
      onClose: over.onClose ?? onClose,
      onRemove: over.onRemove ?? onRemove,
      color: over.color ?? color,
      icon: over.icon ?? icon,
      position: over.position ?? position,
    );
  }

  /// The same options under [name].
  MPSnackbarOptions _named(String name) {
    return MPSnackbarOptions(
      id: name,
      message: message,
      timeout: timeout,
      priority: priority,
      actionLabel: actionLabel,
      onAction: onAction,
      onClose: onClose,
      onRemove: onRemove,
      color: color,
      icon: icon,
      position: position,
    );
  }
}

/// Raises snackbars from anywhere under an [MPSnackbarProvider].
///
/// The React build's `useMPSnackbar()`, reached here with
/// [MPSnackbarProvider.of].
abstract class MPSnackbarController {
  /// Raises a snackbar and returns its id.
  String add(MPSnackbarOptions options);

  /// Changes a snackbar already on screen. The fields given replace the ones
  /// it has, and a new [MPSnackbarOptions.timeout] restarts its clock.
  void update(String id, MPSnackbarOptions options);

  /// Closes one snackbar, or every one of them when called with nothing.
  void close([String? id]);

  /// One snackbar that follows [future]: [loading] while it runs, then what
  /// [success] or [error] makes of the outcome.
  ///
  /// The waiting message has no clock, so a slow request cannot dismiss its
  /// own message. The answer replaces it in place, and the future's own value
  /// or error is handed on.
  Future<T> promise<T>(
    Future<T> future, {
    required MPSnackbarOptions loading,
    required MPSnackbarOptions Function(T value) success,
    required MPSnackbarOptions Function(Object error) error,
  });

  /// Every snackbar in the stack now, newest first, each with its id filled
  /// in. Read when it is called: it does not rebuild anything as the stack
  /// changes.
  List<MPSnackbarOptions> get snackbars;
}

/// Puts the snackbar stack on the screen and lets anything under it raise a
/// message.
///
/// ```dart
/// WidgetsApp(
///   // …
///   builder: (BuildContext context, Widget? child) => MPSnackbarProvider(child: child!),
/// )
/// ```
///
/// ```dart
/// MPSnackbarProvider.of(context).add(
///   MPSnackbarOptions(
///     message: const Text('Message archived'),
///     actionLabel: const Text('Undo'),
///     onAction: restore,
///   ),
/// );
/// ```
///
/// Wrap the app once. Everything about how a snackbar looks is decided here
/// (where the stack sits, how wide it is, how long a message lasts) so the call
/// site stays the one thing it should be: what happened.
///
/// The stack is a layer over whatever the provider wraps, so it needs no
/// [Overlay]. In a `WidgetsApp`'s `builder` it is above the navigator, and so
/// above every page and every dialog the navigator opens. It goes inside the
/// app rather than around it, because around the app there is no
/// [Directionality] yet.
///
/// ## The plate
///
/// MD3's snackbar: `inverseSurface` under `inverseOnSurface`, the neutral
/// palette read at the other end of the scheme, so the plate is dark on a light
/// screen and light on a dark one. The action is `inversePrimary`, because
/// `primary` is derived to contrast with the page, and on a plate that inverts
/// the page it is the one colour guaranteed not to read. A `color` swaps all
/// three for that family's container, its ink, and the family itself.
///
/// ## Why this is not called Toast
///
/// Material has a name for this component and it is snackbar. A toast is
/// Android's older notification with no action and no way to dismiss it, and it
/// is not part of Material Design 3.
class MPSnackbarProvider extends StatefulWidget {
  /// Creates a provider around [child].
  const MPSnackbarProvider({
    required this.child,
    this.color,
    this.position = MPSnackbarPosition.bottomStart,
    this.timeout = const Duration(seconds: 5),
    this.limit = 3,
    this.width = 600,
    this.size,
    this.showClose = true,
    this.closeLabel,
    this.locale,
    super.key,
  });

  /// The app.
  final Widget child;

  /// Which family every plate is painted in.
  ///
  /// No default, for the reason `MPTooltip` has none: left unset the plate is
  /// the inverse surface, which is what makes it legible over whatever the
  /// reader happened to be looking at. Setting it is worth doing for an app
  /// whose messages are all one kind, and wrong as a way of saying "this one is
  /// an error", because a snackbar is not where an error belongs.
  final MPColor? color;

  /// Where the stack is pinned.
  final MPSnackbarPosition position;

  /// How long a snackbar lasts unless it says otherwise. [Duration.zero] keeps
  /// every one of them up until it is closed.
  final Duration timeout;

  /// How many are shown at once. The rest are kept, and shown as the stack
  /// drains rather than thrown away; the newest are the ones on screen.
  final int limit;

  /// How wide a snackbar is, in logical pixels: this or the width of the
  /// screen, whichever is narrower. 600 is MD3's own maximum.
  final double width;

  /// The type scale and the room on the plate. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Shows the × on every snackbar.
  ///
  /// On by default. A snackbar with no clock and no action would otherwise
  /// have no way out at all, and the stack is what decides that, not the call
  /// site.
  final bool showClose;

  /// The name a screen reader gives every ×. Defaults to the word for "close"
  /// in [locale].
  final String? closeLabel;

  /// Which language the ×'s default name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// The controller of the nearest provider above [context].
  ///
  /// Asserts that there is one. Asking for a snackbar where nothing can show
  /// it is a mistake in the app, not something to answer quietly.
  static MPSnackbarController of(BuildContext context) {
    final MPSnackbarController? controller = maybeOf(context);

    assert(controller != null, 'No MPSnackbarProvider found above this context.');

    return controller!;
  }

  /// The same, or `null` where there is no provider.
  static MPSnackbarController? maybeOf(BuildContext context) {
    return context.getInheritedWidgetOfExactType<_MPSnackbarScope>()?.controller;
  }

  @override
  State<MPSnackbarProvider> createState() => _MPSnackbarProviderState();
}

class _MPSnackbarScope extends InheritedWidget {
  const _MPSnackbarScope({required this.controller, required super.child});

  final MPSnackbarController controller;

  @override
  bool updateShouldNotify(_MPSnackbarScope oldWidget) => controller != oldWidget.controller;
}

/// A snackbar's life, which pauses.
///
/// The React build's timers stop while the stack is hovered or focused and
/// while the window is in the background, and carry on afterwards from where
/// they stopped rather than starting over. A [Timer] cannot be paused, so the
/// time it had left is measured on the way out and a new one is started with
/// that on the way back.
class _Clock {
  _Clock(this.delay, this.onFire) : _remaining = delay;

  final Duration delay;
  final VoidCallback onFire;

  Duration _remaining;
  Timer? _timer;
  final Stopwatch _watch = Stopwatch();

  void start() {
    if (_timer != null) {
      return;
    }

    // A clock that ran out while it was paused has nothing left to run, and
    // is given its whole delay again, as the React build gives it.
    if (_remaining <= Duration.zero) {
      _remaining = delay;
    }

    _watch
      ..reset()
      ..start();
    _timer = Timer(_remaining, () {
      _timer = null;
      onFire();
    });
  }

  void pause() {
    final Timer? timer = _timer;

    if (timer == null) {
      return;
    }

    timer.cancel();
    _timer = null;
    _watch.stop();
    _remaining -= _watch.elapsed;
  }

  void cancel() {
    _timer?.cancel();
    _timer = null;
  }
}

/// One snackbar in the stack, and what it owns: its motion and its clock.
class _Entry {
  _Entry({required this.id, required this.options, required this.motion})
    : curve = CurvedAnimation(parent: motion, curve: MPMotion.standard);

  final String id;
  MPSnackbarOptions options;

  /// Waiting on a future: no clock, whatever its timeout says.
  bool loading = false;

  final AnimationController motion;
  final CurvedAnimation curve;

  _Clock? clock;

  /// On its way out: off the clock, and not to be closed a second time.
  bool closing = false;

  void dispose() {
    clock?.cancel();
    curve.dispose();
    motion.dispose();
  }
}

class _MPSnackbarProviderState extends State<MPSnackbarProvider>
    with TickerProviderStateMixin
    implements MPSnackbarController {
  /// Every snackbar, newest first, which is the order the React build keeps.
  final List<_Entry> _entries = <_Entry>[];
  int _sequence = 0;

  /// The plates the pointer is resting on, which is a reader reading them.
  final Set<String> _hovered = <String>{};

  /// The stacks the keyboard focus is inside, on an action or a ×.
  final Set<MPSnackbarPosition> _focused = <MPSnackbarPosition>{};

  /// The fingers, pens and buttons held down on a plate. A finger resting on a
  /// snackbar is the touch screen's hover.
  final Set<int> _pressed = <int>{};

  /// Whether the app is anywhere but in front of the reader: in the background,
  /// or in a browser tab or window that has lost the focus.
  bool _away = false;

  late final AppLifecycleListener _lifecycle;

  bool get _held => _hovered.isNotEmpty || _focused.isNotEmpty || _pressed.isNotEmpty || _away;

  @override
  void initState() {
    super.initState();

    final AppLifecycleState? state = WidgetsBinding.instance.lifecycleState;
    _away = state != null && state != AppLifecycleState.resumed;
    _lifecycle = AppLifecycleListener(
      onStateChange: (AppLifecycleState state) {
        _hold(() => _away = state != AppLifecycleState.resumed);
      },
    );
  }

  @override
  void dispose() {
    _lifecycle.dispose();

    for (final _Entry entry in _entries) {
      entry.dispose();
    }

    _entries.clear();
    super.dispose();
  }

  Duration get _motionDuration =>
      (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ? Duration.zero : MPMotion.short4;

  /// Applies [change] and builds the stack again: now, or once the frame is
  /// over when a message is raised from inside a build, such as from a
  /// descendant's `initState`, where the provider cannot be marked to build.
  void _rebuild(VoidCallback change) {
    if (SchedulerBinding.instance.schedulerPhase != SchedulerPhase.persistentCallbacks) {
      setState(change);

      return;
    }

    change();
    SchedulerBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  List<MPSnackbarOptions> get snackbars => List<MPSnackbarOptions>.unmodifiable(
    _entries.map((_Entry entry) => entry.options._named(entry.id)),
  );

  @override
  String add(MPSnackbarOptions options) => _add(options);

  String _add(MPSnackbarOptions options, {bool loading = false}) {
    final String? asked = options.id;

    if (asked != null) {
      final _Entry? existing = _find(asked);

      if (existing != null) {
        if (!existing.closing) {
          _change(existing, options, restart: true, loading: loading);

          return asked;
        }

        // Raised again while it was going out: the old one goes at once and a
        // new one takes its place, rather than a message being revived halfway
        // through leaving.
        _remove(existing, report: false);
      }
    }

    final String id = asked ?? 'mp-snackbar-${_sequence++}';
    final _Entry entry = _Entry(
      id: id,
      options: options,
      motion: AnimationController(vsync: this, duration: _motionDuration),
    )..loading = loading;

    _rebuild(() => _entries.insert(0, entry));
    entry.motion.forward();
    _schedule(entry);

    return id;
  }

  @override
  void update(String id, MPSnackbarOptions options) {
    final _Entry? entry = _find(id);

    if (entry == null || entry.closing) {
      return;
    }

    _change(entry, options);
  }

  /// Lays [options] over [entry]'s, and decides whether its clock starts over.
  ///
  /// The rules are the React build's: the clock starts over when the snackbar
  /// was raised again under the same id, when it is given a timeout, and when
  /// it was waiting on a future and now has its answer. Any other change leaves
  /// the clock running, so a message corrected halfway through its life does
  /// not get a second one.
  void _change(
    _Entry entry,
    MPSnackbarOptions options, {
    bool restart = false,
    bool loading = false,
  }) {
    final bool wasLoading = entry.loading;

    _rebuild(() {
      entry
        ..options = entry.options._merge(options)
        ..loading = loading;
    });

    final Duration timeout = entry.options.timeout ?? widget.timeout;
    final bool wanted = !entry.loading && timeout > Duration.zero;

    if (!wanted) {
      entry.clock?.cancel();
      entry.clock = null;

      return;
    }

    if (entry.clock == null || restart || options.timeout != null || wasLoading) {
      _schedule(entry);
    }
  }

  @override
  void close([String? id]) {
    for (final _Entry entry in List<_Entry>.of(_entries)) {
      if (id == null || entry.id == id) {
        _dismiss(entry);
      }
    }
  }

  @override
  Future<T> promise<T>(
    Future<T> future, {
    required MPSnackbarOptions loading,
    required MPSnackbarOptions Function(T value) success,
    required MPSnackbarOptions Function(Object error) error,
  }) async {
    final String id = _add(loading, loading: true);

    try {
      final T value = await future;

      if (mounted) {
        _answer(id, success(value));
      }

      return value;
    } catch (caught) {
      if (mounted) {
        _answer(id, error(caught));
      }

      rethrow;
    }
  }

  /// Turns the waiting message [id] into the answer, with a clock of its own.
  void _answer(String id, MPSnackbarOptions options) {
    final _Entry? entry = _find(id);

    if (entry != null && !entry.closing) {
      _change(entry, options);
    }
  }

  _Entry? _find(String id) {
    for (final _Entry entry in _entries) {
      if (entry.id == id) {
        return entry;
      }
    }

    return null;
  }

  /// Gives [entry] a fresh clock, running unless something holds the stack.
  ///
  /// A snackbar pushed out of sight by the limit keeps its clock, as it does in
  /// the React build: the limit decides what is drawn, not how long a message
  /// lives.
  void _schedule(_Entry entry) {
    entry.clock?.cancel();
    entry.clock = null;

    final Duration timeout = entry.options.timeout ?? widget.timeout;

    if (entry.loading || timeout <= Duration.zero) {
      return;
    }

    final _Clock clock = _Clock(timeout, () => _dismiss(entry));
    entry.clock = clock;

    if (!_held) {
      clock.start();
    }
  }

  void _dismiss(_Entry entry) {
    // One already on its way out is left to go. Closing it again would report
    // the close twice and reverse a motion that may already be gone.
    if (entry.closing || !mounted) {
      return;
    }

    entry
      ..closing = true
      ..clock?.cancel();
    entry.options.onClose?.call();

    entry.motion.duration = _motionDuration;
    entry.motion.reverse().whenComplete(() {
      if (mounted && _entries.contains(entry)) {
        _remove(entry);
      }
    });
  }

  /// Flicked off the screen: it has already gone, so it is not walked out.
  void _swiped(_Entry entry) {
    if (entry.closing) {
      return;
    }

    entry
      ..closing = true
      ..clock?.cancel();
    entry.options.onClose?.call();
    _remove(entry);
  }

  void _remove(_Entry entry, {bool report = true}) {
    _rebuild(() => _entries.remove(entry));
    _hovered.remove(entry.id);

    // The last plate takes the stacks out of the tree, and neither a mouse
    // region nor a focus node reports leaving on its way out. Whatever held
    // the clocks goes with them, or the next message would arrive paused.
    if (_entries.isEmpty) {
      _hovered.clear();
      _focused.clear();
      _pressed.clear();
    }

    final VoidCallback? onRemove = entry.options.onRemove;

    // After the frame, once the plate's widgets are out of the tree, so the
    // controller they listen to is not disposed from under them.
    WidgetsBinding.instance.addPostFrameCallback((Duration _) => entry.dispose());

    if (report) {
      onRemove?.call();
    }

    _resume();
  }

  /// Records a change to what holds the stack, and pauses or resumes every
  /// clock when that changes whether it is held.
  void _hold(VoidCallback change) {
    final bool before = _held;

    change();

    if (before != _held) {
      _held ? _pause() : _resume();
    }
  }

  void _pause() {
    for (final _Entry entry in _entries) {
      entry.clock?.pause();
    }
  }

  void _resume() {
    if (_held) {
      return;
    }

    for (final _Entry entry in _entries) {
      if (!entry.closing) {
        entry.clock?.start();
      }
    }
  }

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  Widget build(BuildContext context) {
    final String closeLabel =
        widget.closeLabel ??
        mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['close']!;
    final Duration motion = _motionDuration;

    for (final _Entry entry in _entries) {
      entry.motion.duration = motion;
    }

    // The newest `limit` are drawn and the rest wait, as the React build
    // limits them: a message pushed out by three newer ones comes back as
    // they leave. Counted among the ones still up, so a plate on its way out
    // does not hold a place.
    final Set<_Entry> drawn = <_Entry>{};
    int up = 0;

    for (final _Entry entry in _entries) {
      if (entry.closing) {
        drawn.add(entry);
      } else if (up < widget.limit) {
        drawn.add(entry);
        up += 1;
      }
    }

    final List<Widget> stacks = <Widget>[];

    for (final MPSnackbarPosition position in MPSnackbarPosition.values) {
      final List<_Entry> here = <_Entry>[
        for (final _Entry entry in _entries)
          if (drawn.contains(entry) && (entry.options.position ?? widget.position) == position)
            entry,
      ];

      if (here.isNotEmpty) {
        stacks.add(_stack(context, position, here, closeLabel));
      }
    }

    return _MPSnackbarScope(
      controller: this,
      child: Stack(children: <Widget>[widget.child, ...stacks]),
    );
  }

  Widget _stack(
    BuildContext context,
    MPSnackbarPosition position,
    List<_Entry> entries,
    String closeLabel,
  ) {
    final bool top = _isTop(position);
    final EdgeInsets safe = MediaQuery.maybePaddingOf(context) ?? EdgeInsets.zero;
    final double keyboard = MediaQuery.maybeViewInsetsOf(context)?.bottom ?? 0;

    final Widget column = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: switch (position) {
        MPSnackbarPosition.topStart || MPSnackbarPosition.bottomStart => CrossAxisAlignment.start,
        MPSnackbarPosition.topCenter ||
        MPSnackbarPosition.bottomCenter => CrossAxisAlignment.center,
        MPSnackbarPosition.topEnd || MPSnackbarPosition.bottomEnd => CrossAxisAlignment.end,
      },
      spacing: 8,
      children: <Widget>[
        // Newest nearest the edge the stack is pinned to, so the message that
        // has just arrived is never the one that moved. The list is newest
        // first, so a top stack reads it as it is and a bottom one backwards.
        for (final _Entry entry in top ? entries : entries.reversed)
          ConstrainedBox(
            // Keyed on the column's own child: the column matches children by
            // position, and a leaving plate's place would otherwise go to the
            // one after it, which would then be built again.
            key: ValueKey<String>(entry.id),
            constraints: BoxConstraints(maxWidth: widget.width),
            child: SizedBox(width: double.infinity, child: _item(entry, top, closeLabel)),
          ),
      ],
    );

    // Not a wall the rest of the app is behind. Nothing here is told to ignore
    // the pointer and nothing has to be: a column hit-tests its children and
    // not the room around them, so a press beside a plate reaches the app.
    return Positioned(
      left: 0,
      right: 0,
      top: top ? 0 : null,
      bottom: top ? null : 0,
      child: Padding(
        // React's `p-4`, clear of the system's bars, the notch and a soft
        // keyboard, so a top stack is not under the status bar and a bottom
        // one is not under the home indicator.
        padding:
            const EdgeInsets.all(16) +
            EdgeInsets.only(
              left: safe.left,
              right: safe.right,
              top: top ? safe.top : 0,
              bottom: top ? 0 : safe.bottom + keyboard,
            ),
        child: Focus(
          canRequestFocus: false,
          skipTraversal: true,
          includeSemantics: false,
          onFocusChange: (bool focused) => _hold(() {
            focused ? _focused.add(position) : _focused.remove(position);
          }),
          child: column,
        ),
      ),
    );
  }

  Widget _item(_Entry entry, bool top, String closeLabel) {
    Widget plate = _Plate(
      options: entry.options,
      color: entry.options.color ?? widget.color,
      size: _size,
      showClose: widget.showClose,
      closeLabel: closeLabel,
      onClose: () => _dismiss(entry),
    );

    plate = MouseRegion(
      onEnter: (_) => _hold(() => _hovered.add(entry.id)),
      onExit: (_) => _hold(() => _hovered.remove(entry.id)),
      child: Listener(
        onPointerDown: (PointerDownEvent event) => _hold(() => _pressed.add(event.pointer)),
        onPointerUp: (PointerUpEvent event) => _hold(() => _pressed.remove(event.pointer)),
        onPointerCancel: (PointerCancelEvent event) {
          _hold(() => _pressed.remove(event.pointer));
        },
        child: plate,
      ),
    );

    // Flicked away sideways. The React build also takes a flick towards the
    // edge the stack is pinned to; a `Dismissible` takes one axis, and across
    // is the one a thumb reaches for.
    plate = Dismissible(
      key: ValueKey<String>('swipe-${entry.id}'),
      direction: entry.closing ? DismissDirection.none : DismissDirection.horizontal,
      resizeDuration: null,
      onDismissed: (DismissDirection _) => _swiped(entry),
      child: plate,
    );

    // In from the edge the stack is pinned to and back out to it, which is
    // what MD3 draws: a message that only faded would have no direction, and a
    // stack at the top and one at the bottom would be the same event. One
    // duration both ways, short4, because a plate that often arrives behind
    // two others and took long to do it would make a queue feel like it was
    // buffering.
    return FadeTransition(
      opacity: entry.curve,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: Offset(0, top ? -1 : 1),
          end: Offset.zero,
        ).animate(entry.curve),
        child: plate,
      ),
    );
  }
}

bool _isTop(MPSnackbarPosition position) {
  return position == MPSnackbarPosition.topStart ||
      position == MPSnackbarPosition.topCenter ||
      position == MPSnackbarPosition.topEnd;
}

/// The plate's height on one line, and the room around what is on it:
/// `min-h`, `gap`, `py`, `ps` and `pe` from React's `PLATE`.
typedef _PlateBox = ({double minHeight, double gap, double y, double start, double end});

const Map<MPSize, _PlateBox> _plate = <MPSize, _PlateBox>{
  MPSize.xs: (minHeight: 36, gap: 6, y: 6, start: 12, end: 6),
  MPSize.sm: (minHeight: 40, gap: 8, y: 8, start: 14, end: 8),
  // MD3's snackbar: 48 tall on one line, with 16 of inline padding.
  MPSize.md: (minHeight: 48, gap: 8, y: 10, start: 16, end: 8),
  MPSize.lg: (minHeight: 56, gap: 12, y: 12, start: 20, end: 10),
  MPSize.xl: (minHeight: 64, gap: 12, y: 14, start: 24, end: 12),
};

/// The × in the corner: 20 at `md`, a step under MD3's 24, in a 32 circle.
const Map<MPSize, double> _closeIcon = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 18,
  MPSize.md: 20,
  MPSize.lg: 22,
  MPSize.xl: 24,
};

/// The message's type: MD3's `bodyMedium` at `md`, on a narrow ladder.
///
/// A snackbar does not grow with the control that raised it. It is a message
/// from the app, not part of a form, and the ladder exists only so a dense app
/// can run one size down throughout.
MPTypeRole _text(MPTypescale scale, MPSize size) {
  return switch (size) {
    MPSize.xs || MPSize.sm => scale.bodySmall,
    MPSize.md || MPSize.lg => scale.bodyMedium,
    MPSize.xl => scale.bodyLarge,
  };
}

/// One snackbar's surface.
class _Plate extends StatelessWidget {
  const _Plate({
    required this.options,
    required this.color,
    required this.size,
    required this.showClose,
    required this.closeLabel,
    required this.onClose,
  });

  final MPSnackbarOptions options;
  final MPColor? color;
  final MPSize size;
  final bool showClose;
  final String closeLabel;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPColor? family = color;
    final MPAccent? accent = family == null ? null : colors.accent(family);

    // One slot, two answers, as the React build has it: the inverse surface,
    // its ink and `inversePrimary` for the action, or the family's container,
    // its ink and the family itself.
    final Color fill = accent?.container ?? colors.inverseSurface;
    final Color ink = accent?.onContainer ?? colors.inverseOnSurface;
    final Color action = accent?.color ?? colors.inversePrimary;

    final _PlateBox box = _plate[size]!;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    final Widget? message = options.message == null
        ? null
        : Semantics(
            // The message is the announcement, and only the message: the
            // action and the × are reached on their own, and a live region
            // round the whole plate would read "Close" after every message
            // that went past. Every snackbar is one, whatever its priority,
            // because Flutter's live region has one politeness.
            container: true,
            liveRegion: true,
            child: options.message,
          );

    final Widget row = Row(
      spacing: box.gap,
      children: <Widget>[
        if (options.icon != null)
          IconTheme.merge(
            data: IconThemeData(color: ink, size: _closeIcon[size]),
            child: options.icon!,
          ),
        Expanded(
          child: Padding(
            padding: const EdgeInsetsDirectional.only(start: 4, top: 2, bottom: 2),
            child: message ?? const SizedBox.shrink(),
          ),
        ),
        if (options.actionLabel != null)
          _Action(label: options.actionLabel!, color: action, onPressed: options.onAction),
        if (showClose)
          MPSheetCloseButton(
            label: closeLabel,
            onPressed: onClose,
            color: ink,
            ring: colors.secondary,
            iconSize: _closeIcon[size]!,
          ),
      ],
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: box.minHeight),
        child: DecoratedBox(
          decoration: BoxDecoration(color: fill, borderRadius: radius, boxShadow: MPShadows.of(3)),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(box.start, box.y, box.end, box.y),
            // No decoration whatever the provider sits under: above a
            // navigator there may be no text style but the framework's
            // fallback, which underlines.
            child: DefaultTextStyle.merge(
              style: _text(
                theme.typescale,
                size,
              ).style(ink).copyWith(decoration: TextDecoration.none),
              child: IconTheme.merge(
                data: IconThemeData(color: ink),
                child: row,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The action: a text button in everything but name, in the plate's accent.
class _Action extends StatelessWidget {
  const _Action({required this.label, required this.color, required this.onPressed});

  final Widget label;
  final Color color;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    const BorderRadius pill = BorderRadius.all(Radius.circular(16));

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: theme.colors.secondary, borderRadius: pill)
                : null,
            child: MPStateLayer(
              color: color,
              opacity: mpStateLayerOpacity(state),
              borderRadius: pill,
              child: SizedBox(
                height: 32,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Center(
                    widthFactor: 1,
                    child: DefaultTextStyle.merge(
                      style: theme.typescale.labelLarge.style(color),
                      maxLines: 1,
                      softWrap: false,
                      child: IconTheme.merge(
                        data: IconThemeData(color: color),
                        child: label,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
