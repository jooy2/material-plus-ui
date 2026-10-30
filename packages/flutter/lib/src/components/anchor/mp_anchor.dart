/// The headings of the screen being read, with the one the reader is in marked.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// One heading in the list.
@immutable
class MPAnchorItem {
  /// Creates an entry for the heading [target] is on.
  const MPAnchorItem({required this.target, required this.label, this.depth = 0});

  /// The heading this entry points at, by a key on the heading's own widget.
  ///
  /// The React build's `href`. A Flutter screen has no fragment to point into:
  /// what the list measures is a render object's position, and a key is the
  /// only handle on one. A heading the key is on nowhere cannot be tracked.
  final GlobalKey target;

  /// What the row says.
  final Widget label;

  /// How deep the heading sits, counted from `0`.
  ///
  /// Only the indent depends on it. The list stays flat, because a list inside
  /// a list is announced as one, and a reader who has just been told there are
  /// twelve headings does not need to be told again that four of them are their
  /// own list.
  final int depth;
}

/// A row's vertical padding, which is the only thing `density` moves here.
///
/// Smaller than a list's, and deliberately: a table of contents is read down
/// rather than pointed at, so the rows sit close enough to be taken in as one
/// block.
const Map<MPSize, double> _padY = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 4,
  MPSize.md: 6,
  MPSize.lg: 8,
  MPSize.xl: 10,
};

/// The same track with the density steps taken out of it, 2px a face.
const Map<MPSize, List<double>> _padYDense = <MPSize, List<double>>{
  MPSize.xs: <double>[2, 2, 2],
  MPSize.sm: <double>[2, 2, 2],
  MPSize.md: <double>[4, 2, 2],
  MPSize.lg: <double>[6, 4, 2],
  MPSize.xl: <double>[8, 6, 4],
};

double _padYOf(MPSize size, MPDensity density) {
  final MPDensity step = mpClampDensity(density);

  return step == 0 ? _padY[size]! : _padYDense[size]![-step - 1];
}

/// How far one level of heading is set in from the last.
const Map<MPSize, double> _indent = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// The rail's hairline, and the lit segment a row draws over it.
const double _hairline = 1;

/// How far a row's words are set in from the rail.
const double _railInset = 12;

const Color _clear = Color(0x00000000);

/// The headings of the screen being read, with the one the reader is in marked.
///
/// ```dart
/// MPAnchor(
///   items: <MPAnchorItem>[
///     MPAnchorItem(target: _install, label: const Text('Install')),
///     MPAnchorItem(target: _usage, label: const Text('Usage')),
///     MPAnchorItem(target: _options, label: const Text('Options'), depth: 1),
///   ],
/// )
/// ```
///
/// ## The headings are given, not scraped
///
/// [items] is a list the caller already has. Whatever built the screen knows
/// its own headings, and a component that went looking for them in the tree
/// would be guessing which were content and which were chrome.
///
/// ## Which row is marked
///
/// The last heading whose top has passed the reading line, which is the only
/// rule that reads correctly while scrolling up as well as down. [offset] is
/// where that line sits below the top of the scroll view. At the end of the
/// scroll the last row is marked whatever the measurement says: a short final
/// section never reaches the line, and would otherwise be the one that can
/// never be marked.
///
/// ## Nothing slides
///
/// The rail's lit segment is a border on the row rather than a marker that
/// travels between rows. A thing moving under a reader who is already moving is
/// the one animation a table of contents should not have.
class MPAnchor extends StatefulWidget {
  /// Creates a table of contents over [items].
  const MPAnchor({
    required this.items,
    this.activeTarget,
    this.onActiveChange,
    this.offset = 0,
    this.controller,
    this.rail = true,
    this.size,
    this.color,
    this.density,
    this.locale,
    this.semanticLabel,
    super.key,
  });

  /// The headings, in the order they appear on the screen.
  final List<MPAnchorItem> items;

  /// Which row is marked, by its [MPAnchorItem.target]. Given, the list stops
  /// watching the scroll and says what it is told.
  final GlobalKey? activeTarget;

  /// Called whenever the row the reader is in changes, with its target, or
  /// `null` above the first heading.
  final ValueChanged<GlobalKey?>? onActiveChange;

  /// How far below the top of the scroll view a heading counts as reached, in
  /// logical pixels.
  ///
  /// Set it to the height of whatever is pinned over the content, or the
  /// heading under the bar is never the one marked: it has scrolled past the
  /// top and is still behind the bar.
  final double offset;

  /// What scrolls. Left out, the list follows the scroll view its first
  /// heading sits in, which is nearly always the right one.
  ///
  /// The React build's `container`.
  final ScrollController? controller;

  /// Draws the rail down the leading edge, with the row the reader is in lit.
  final bool rail;

  /// The size of a row's text, and how far one level of heading is set in.
  /// [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the marked row reads.
  final MPColor? color;

  /// Tightens the rows and nothing else, `0` to `-3`.
  final MPDensity? density;

  /// Which language the list's default name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// The list's name for a screen reader. Defaults to the wording for "On this
  /// page" in [locale].
  final String? semanticLabel;

  @override
  State<MPAnchor> createState() => _MPAnchorState();
}

class _MPAnchorState extends State<MPAnchor> {
  GlobalKey? _tracked;

  /// The scroll the list is listening to: the controller's, or the position of
  /// the scroll view the first heading sits in.
  Listenable? _listening;

  /// Whether a measure waits for the end of the next frame.
  bool _scheduled = false;

  bool get _controlled => widget.activeTarget != null;

  @override
  void initState() {
    super.initState();
    _afterFrame();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Read so a window that changes size measures again, as the React list
    // does on `resize`.
    MediaQuery.maybeSizeOf(context);
    _schedule();
  }

  @override
  void didUpdateWidget(MPAnchor oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.controller != oldWidget.controller ||
        widget.offset != oldWidget.offset ||
        _controlled != (oldWidget.activeTarget != null)) {
      _afterFrame();
    }
  }

  @override
  void dispose() {
    _listening?.removeListener(_schedule);
    super.dispose();
  }

  /// Finds the scroll to follow once the headings have been laid out, and
  /// measures.
  void _afterFrame() {
    SchedulerBinding.instance.addPostFrameCallback((Duration _) {
      if (!mounted) {
        return;
      }

      _attach();
      _measure();
    });
  }

  void _attach() {
    final Listenable? next = _controlled ? null : _scroll();

    if (identical(next, _listening)) {
      return;
    }

    _listening?.removeListener(_schedule);
    _listening = next;
    _listening?.addListener(_schedule);
  }

  /// The controller, or the position of the scroll view a heading sits in.
  Listenable? _scroll() {
    if (widget.controller != null) {
      return widget.controller;
    }

    for (final MPAnchorItem item in widget.items) {
      final BuildContext? target = item.target.currentContext;

      if (target != null) {
        return Scrollable.maybeOf(target)?.position;
      }
    }

    return null;
  }

  /// The position being measured, wherever it came from.
  ScrollPosition? get _position {
    final Listenable? listening = _listening;

    if (listening is ScrollController) {
      return listening.hasClients ? listening.position : null;
    }

    return listening is ScrollPosition ? listening : null;
  }

  /// Coalesces every scroll in a frame into one measure after it.
  ///
  /// A scroll reports faster than anything can change, and a measure taken
  /// during the scroll reads the headings where the last layout left them,
  /// which is where they were before it.
  void _schedule() {
    if (_scheduled) {
      return;
    }

    _scheduled = true;
    SchedulerBinding.instance
      ..addPostFrameCallback((Duration _) {
        _scheduled = false;

        if (mounted) {
          // The headings may have moved into a scroll view built since.
          if (_position == null) {
            _attach();
          }

          _measure();
        }
      })
      ..ensureVisualUpdate();
  }

  /// Which heading the reader is in.
  void _measure() {
    final ScrollPosition? position = _position;

    if (_controlled || position == null || !position.hasPixels) {
      return;
    }

    final RenderObject? viewport =
        (position.context.notificationContext ?? position.context.storageContext)
            .findRenderObject();

    if (viewport == null || !viewport.attached) {
      return;
    }

    GlobalKey? current;

    for (final MPAnchorItem item in widget.items) {
      final RenderObject? heading = item.target.currentContext?.findRenderObject();

      if (heading is! RenderBox || !heading.attached || !heading.hasSize) {
        continue;
      }

      final double top = heading.localToGlobal(Offset.zero, ancestor: viewport).dy;

      if (top <= widget.offset + 1) {
        current = item.target;
      }
    }

    // The end of the scroll marks the last heading, for the reason the class
    // gives. Two pixels of slack, as the React list allows, for a position
    // that rounds short of its own extent.
    final bool atEnd = position.pixels >= position.maxScrollExtent - 2;

    if (atEnd && widget.items.isNotEmpty) {
      current = widget.items.last.target;
    }

    if (current == _tracked) {
      return;
    }

    setState(() => _tracked = current);
    widget.onActiveChange?.call(current);
  }

  /// Brings the heading [item] points at to the reading line.
  ///
  /// A jump and not an animation, which is what a fragment link does in the
  /// React build: it lands at once, and nothing in this component slides.
  void _press(MPAnchorItem item) {
    final BuildContext? target = item.target.currentContext;
    final RenderObject? heading = target?.findRenderObject();
    final ScrollableState? scrollable = target == null ? null : Scrollable.maybeOf(target);

    if (heading == null || scrollable == null) {
      return;
    }

    final RenderAbstractViewport? viewport = RenderAbstractViewport.maybeOf(heading);

    if (viewport == null) {
      return;
    }

    final ScrollPosition position = scrollable.position;

    // Less `offset`: the same line the tracking reads, so a bar pinned over the
    // content does not cover the heading it was pressed for.
    final double to = (viewport.getOffsetToReveal(heading, 0).offset - widget.offset).clamp(
      position.minScrollExtent,
      position.maxScrollExtent,
    );

    position.jumpTo(to);
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPDensity density = widget.density ?? config?.density ?? 0;

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final GlobalKey? active = widget.activeTarget ?? _tracked;
    final String name =
        widget.semanticLabel ??
        mpMessagesOf(context, mpAnchorMessages, locale: widget.locale)['label']!;

    final Widget rows = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (final MPAnchorItem item in widget.items)
          _Row(
            key: ObjectKey(item.target),
            item: item,
            lit: item.target == active,
            rail: widget.rail,
            accent: colors.accent(color).color,
            colors: colors,
            text: mpControlText(theme.typescale, size).style(),
            padY: _padYOf(size, density),
            indent: item.depth * _indent[size]!,
            radius: BorderRadius.circular(theme.shapes.extraSmall),
            onPressed: () => _press(item),
          ),
      ],
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: name,
      child: widget.rail
          ? Stack(
              children: <Widget>[
                // The rail, under the rows. Each row's own border is drawn over
                // it rather than beside it, so a lit row is one hairline wide
                // and the column does not shift as the reader moves.
                PositionedDirectional(
                  start: 0,
                  top: 0,
                  bottom: 0,
                  width: _hairline,
                  child: ColoredBox(color: colors.outlineVariant),
                ),
                rows,
              ],
            )
          : rows,
    );
  }
}

/// One row of the list.
class _Row extends StatelessWidget {
  const _Row({
    required this.item,
    required this.lit,
    required this.rail,
    required this.accent,
    required this.colors,
    required this.text,
    required this.padY,
    required this.indent,
    required this.radius,
    required this.onPressed,
    super.key,
  });

  final MPAnchorItem item;
  final bool lit;
  final bool rail;
  final Color accent;
  final MPColorScheme colors;
  final TextStyle text;
  final double padY;
  final double indent;
  final BorderRadius radius;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    return Padding(
      // The indent is outside the row, as the React row's start margin is, so
      // a deeper heading's lit segment is set in with its words.
      padding: EdgeInsetsDirectional.only(start: indent),
      child: MPInteractive(
        onTap: onPressed,
        shortcuts: MPInteractive.enterOnly,
        builder: (BuildContext context, MPInteraction state) {
          final Color ink = lit
              ? accent
              : state.hovered
              ? colors.onSurface
              : colors.onSurfaceVariant;

          final Widget label = TweenAnimationBuilder<Color?>(
            tween: ColorTween(end: ink),
            duration: duration,
            curve: MPMotion.standard,
            builder: (BuildContext context, Color? value, Widget? child) {
              return DefaultTextStyle.merge(
                style: text.copyWith(
                  color: value,
                  fontWeight: lit ? FontWeight.w500 : text.fontWeight,
                ),
                maxLines: 1,
                softWrap: false,
                overflow: TextOverflow.ellipsis,
                child: child!,
              );
            },
            child: item.label,
          );

          // Only the border eases, as the React row transitions its colour and
          // its border and nothing else: a row given a new density takes its
          // new padding at once.
          final Widget surface = AnimatedContainer(
            duration: duration,
            curve: MPMotion.standard,
            decoration: rail
                ? BoxDecoration(
                    border: BorderDirectional(
                      start: BorderSide(color: lit ? accent : _clear, width: _hairline),
                    ),
                  )
                : const BoxDecoration(),
            child: Padding(
              padding: EdgeInsetsDirectional.only(
                start: rail ? _railInset : 0,
                top: padY,
                bottom: padY,
              ),
              child: label,
            ),
          );

          final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
            context,
          );

          return Semantics(
            container: true,
            link: true,
            // The nearest the framework has to `aria-current="location"`:
            // where the reader is within the set of links.
            selected: lit ? true : null,
            focused: focus.focused,
            onFocus: focus.onFocus,
            onTap: onPressed,
            child: CustomPaint(
              foregroundPainter: state.focusVisible
                  ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                  : null,
              child: surface,
            ),
          );
        },
      ),
    );
  }
}
