/// The trail of pages above the one being read.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// What is drawn between two steps of the trail.
///
/// Four named marks rather than a free-for-all, because a separator is read
/// hundreds of times a day and the difference between them is meaning, not
/// decoration: a [chevron] and an [arrow] say "and then", a [slash] says
/// "path", a [dot] says "these are peers of one thing". Anything else can still
/// be passed as a widget.
enum MPBreadcrumbSeparator {
  /// A wedge pointing the way the trail reads, and the default.
  chevron,

  /// An arrow, which says "and then" out loud.
  arrow,

  /// `/`, which says "path".
  slash,

  /// `·`, which says "peers of one thing".
  dot,
}

/// Between the steps, in both directions once the trail wraps.
const Map<MPSize, double> _trailGap = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// How far the focus ring stands off a step: one pixel, against the two a
/// button takes, because a step is a line of text in a row of them and two
/// would reach the next one.
const double _ringOffset = 1;

const Color _clear = Color(0x00000000);

/// The trail of pages above the one being read.
///
/// ```dart
/// MPBreadcrumb(
///   children: <Widget>[
///     MPBreadcrumbItem(onPressed: goHome, child: const Text('Home')),
///     MPBreadcrumbItem(onPressed: goSettings, child: const Text('Settings')),
///     const MPBreadcrumbItem(child: Text('Billing')),
///   ],
/// )
/// ```
///
/// Two things make this more than a row of links. The first is that the last
/// step is where the reader already is, so it is not something to press, and
/// the trail works that out rather than asking every caller to remember it. The
/// second is the fold: a trail seven levels deep is a trail nobody reads, so
/// past [maxItems] the middle collapses to a `…` that puts it back when
/// pressed.
///
/// The separators are drawn by the trail rather than by the steps. A step does
/// not know whether anything follows it, and a mark that belonged to a step
/// would have to be taken off the last one by hand.
class MPBreadcrumb extends StatefulWidget {
  /// Creates a trail of [children], usually [MPBreadcrumbItem]s.
  const MPBreadcrumb({
    required this.children,
    this.size,
    this.color,
    this.separator = MPBreadcrumbSeparator.chevron,
    this.maxItems,
    this.itemsBeforeCollapse = 1,
    this.itemsAfterCollapse = 1,
    this.expandable = true,
    this.semanticLabel,
    this.expandLabel,
    this.locale,
    super.key,
  }) : assert(
         separator is MPBreadcrumbSeparator || separator is Widget,
         'MPBreadcrumb.separator must be an MPBreadcrumbSeparator or a Widget',
       );

  /// The steps, in order. An [MPBreadcrumbItem] learns from the trail whether
  /// it is the last one; anything else is drawn where it is put.
  final List<Widget> children;

  /// The type scale. [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// The accent family a step picks up when it is hovered.
  final MPColor? color;

  /// The mark between two steps: an [MPBreadcrumbSeparator], or any widget.
  ///
  /// Typed [Object] because Dart has no union type, as `MPIcon.icon` is.
  /// Anything else fails an assertion in debug and draws nothing in release.
  final Object separator;

  /// How many steps to show before the middle is folded away behind a `…`.
  /// Left out, the whole trail is shown however long it gets.
  final int? maxItems;

  /// How many steps stay at the front of a folded trail.
  final int itemsBeforeCollapse;

  /// How many stay at the end.
  final int itemsAfterCollapse;

  /// Whether pressing the `…` unfolds the trail in place. Turn it off to leave
  /// the fold as a plain mark.
  final bool expandable;

  /// The name the trail is announced by. Defaults to the word for it in
  /// [locale]. Never drawn.
  final String? semanticLabel;

  /// What the `…` is announced as. Defaults to the wording in [locale].
  final String? expandLabel;

  /// Which language those two are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  ///
  /// Neither is ever drawn, since the steps are the caller's own words, so
  /// without it a Korean screen announces its trail in English.
  final String? locale;

  @override
  State<MPBreadcrumb> createState() => _MPBreadcrumbState();
}

class _MPBreadcrumbState extends State<MPBreadcrumb> {
  bool _unfolded = false;

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpBreadcrumbMessages,
      locale: widget.locale,
    );

    final List<Widget> steps = widget.children;
    final int total = steps.length;

    // The last step is the page you are on, unless a step says it is. Exactly
    // one step in a trail may be the current page, so a caller who marks an
    // earlier one takes the mark off the last without writing `current: false`
    // on a step that never asked for it.
    final bool claimed = steps.any(
      (Widget step) => step is MPBreadcrumbItem && (step.current ?? false),
    );

    final int? maxItems = widget.maxItems;
    final bool folding =
        !_unfolded &&
        maxItems != null &&
        total > (maxItems < 1 ? 1 : maxItems) &&
        // A fold has to actually remove something. With one before and one
        // after on a three-step trail the `…` would stand in for exactly one
        // step, which is longer than the step it replaced.
        total - widget.itemsBeforeCollapse - widget.itemsAfterCollapse > 1;

    final int before = widget.itemsBeforeCollapse < 0 ? 0 : widget.itemsBeforeCollapse;
    final int after = widget.itemsAfterCollapse < 0 ? 0 : widget.itemsAfterCollapse;

    // `null` is the fold. The steps behind it are not built at all: nothing
    // reads a Flutter screen for its links, so there is no crawler to keep
    // them for, and pressing the `…` builds them.
    final List<Widget?> shown = folding
        ? <Widget?>[...steps.take(before), null, ...steps.skip(total - after)]
        : <Widget?>[...steps];

    final TextStyle prose = mpProseText(theme.typescale, size).style(colors.onSurfaceVariant);
    final Widget mark = ExcludeSemantics(child: _mark(context, prose, colors));
    final List<Widget> trail = <Widget>[];

    for (int index = 0; index < shown.length; index += 1) {
      if (index > 0) {
        trail.add(mark);
      }

      final Widget? step = shown[index];

      trail.add(
        step == null
            ? _Fold(
                expandable: widget.expandable,
                label: widget.expandLabel ?? messages['expand']!,
                glyph: prose.fontSize! * 1.1,
                accent: colors.accent(color),
                colors: colors,
                radius: BorderRadius.circular(theme.shapes.extraSmall),
                onPressed: () => setState(() => _unfolded = true),
              )
            : _BreadcrumbScope(
                size: size,
                color: color,
                last: !claimed && index == shown.length - 1,
                child: step,
              ),
      );
    }

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel ?? messages['label']!,
      child: DefaultTextStyle.merge(
        style: prose,
        child: Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: _trailGap[size]!,
          runSpacing: _trailGap[size]!,
          children: trail,
        ),
      ),
    );
  }

  /// The four marks, or the caller's own.
  ///
  /// The two that point turn round under RTL, because a trail runs the way the
  /// language does.
  Widget _mark(BuildContext context, TextStyle prose, MPColorScheme colors) {
    final Object separator = widget.separator;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final double em = prose.fontSize!;

    if (separator is Widget) {
      return IconTheme.merge(
        data: IconThemeData(color: colors.onSurfaceVariant, size: em),
        child: separator,
      );
    }

    switch (separator as MPBreadcrumbSeparator) {
      case MPBreadcrumbSeparator.chevron:
        return MPGlyph(
          MPGlyphShape.chevron,
          size: em * 1.1,
          color: colors.onSurfaceVariant,
          quarterTurns: rtl ? 1 : -1,
        );
      case MPBreadcrumbSeparator.arrow:
        return MPGlyph(
          MPGlyphShape.arrowRight,
          size: em,
          color: colors.onSurfaceVariant,
          quarterTurns: rtl ? 2 : 0,
        );
      case MPBreadcrumbSeparator.slash:
        return const Text('/');
      case MPBreadcrumbSeparator.dot:
        return const Text('·');
    }
  }
}

/// What a step learns from the trail around it.
class _BreadcrumbScope extends InheritedWidget {
  const _BreadcrumbScope({
    required this.size,
    required this.color,
    required this.last,
    required super.child,
  });

  final MPSize size;
  final MPColor color;

  /// Whether this is the step the trail ends on.
  final bool last;

  static _BreadcrumbScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_BreadcrumbScope>();
  }

  @override
  bool updateShouldNotify(_BreadcrumbScope oldWidget) {
    return size != oldWidget.size || color != oldWidget.color || last != oldWidget.last;
  }
}

/// One step of the trail.
///
/// A step with [onPressed] goes somewhere; a step without one is plain text,
/// which is what the last step is, because the page you are already on is not
/// somewhere to go. The trail tells the step whether it is the last, so the
/// caller does not.
class MPBreadcrumbItem extends StatelessWidget {
  /// Creates a step.
  const MPBreadcrumbItem({
    this.child,
    this.onPressed,
    this.startIcon,
    this.endIcon,
    this.current,
    this.disabled = false,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The step's label, usually a [Text].
  final Widget? child;

  /// Called when the step is followed: where the app's router is called.
  /// Left out, the step is plain text.
  final VoidCallback? onPressed;

  /// Content before the label: a home glyph, a repository avatar.
  final Widget? startIcon;

  /// Content after the label.
  final Widget? endIcon;

  /// Marks this step as the page the reader is on, which stops it answering.
  ///
  /// The last step is the current one on its own, so this is only needed for a
  /// trail that ends somewhere the reader is not, and setting it anywhere takes
  /// the mark off the last step, because only one step in a trail can be it.
  final bool? current;

  /// Unavailable. Stops answering, keeps its place in the trail.
  final bool disabled;

  /// Drives the focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final _BreadcrumbScope? scope = _BreadcrumbScope.maybeOf(context);
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = scope?.size ?? config?.size ?? MPSize.md;
    final MPColor color = scope?.color ?? config?.color ?? MPColor.primary;

    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);

    final bool isCurrent = current ?? (scope?.last ?? false);
    // A step that goes somewhere, whether or not it can be followed now.
    final bool linked = onPressed != null && !isCurrent;
    final bool interactive = linked && !disabled;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    // `extraSmall` at the bottom of the ladder, because what the hover wash
    // needs is a rectangle with the corners taken off. A step is not a chip,
    // and a trail of pills is a row of filter chips.
    final BorderRadius radius = BorderRadius.circular(
      size == MPSize.lg || size == MPSize.xl ? theme.shapes.small : theme.shapes.extraSmall,
    );

    final TextStyle prose = mpProseText(theme.typescale, size).style();
    final double line = prose.fontSize! * (prose.height ?? 1.4);

    Widget slot(Widget content) {
      return SizedBox(
        height: line,
        child: Center(child: content),
      );
    }

    // The same widgets above the step whether it can be followed or not, with
    // the difference in their flags: a step wrapped only while it could be
    // followed would be built again from scratch as it became the current page.
    // A step that cannot be followed takes no focus and claims no tap.
    return MPInteractive(
      onTap: onPressed,
      enabled: interactive,
      interactive: interactive,
      pressable: interactive,
      focusNode: focusNode,
      autofocus: autofocus,
      cursor: interactive ? SystemMouseCursors.click : MouseCursor.defer,
      shortcuts: MPInteractive.enterOnly,
      builder: (BuildContext context, MPInteraction state) {
        final bool washed = interactive && state.hovered;

        // An if/else rather than layered rules, so only one of them exists.
        final Color ink = disabled
            ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
            : isCurrent
            // The page you are on is the one step in the full ink, one weight
            // up. Everything behind it is supporting text, which is what a
            // trail of places you are not is.
            ? colors.onSurface
            : washed
            ? accent.onContainer
            : colors.onSurfaceVariant;

        final Widget body = TweenAnimationBuilder<Color?>(
          tween: ColorTween(end: ink),
          duration: duration,
          curve: MPMotion.standard,
          builder: (BuildContext context, Color? value, Widget? content) {
            return DefaultTextStyle.merge(
              style: TextStyle(
                color: value,
                fontWeight: isCurrent && !disabled ? FontWeight.w500 : null,
              ),
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.ellipsis,
              child: IconTheme.merge(
                data: IconThemeData(color: value, size: mpControlIcon[size]),
                child: content!,
              ),
            );
          },
          child: Row(
            mainAxisSize: MainAxisSize.min,
            spacing: mpControlGap[size]!,
            children: <Widget>[
              if (startIcon != null) slot(startIcon!),
              if (child != null) Flexible(child: child!),
              if (endIcon != null) slot(endIcon!),
            ],
          ),
        );

        final Widget surface = AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          padding: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: washed ? accent.container : _clear,
            borderRadius: radius,
          ),
          child: body,
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          // A step that goes somewhere is a link, and a disabled one is still
          // announced as a link, one that is unavailable.
          link: linked ? true : null,
          enabled: linked ? interactive : null,
          // The nearest the framework has to `aria-current="page"`.
          selected: isCurrent ? true : null,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: interactive ? onPressed : null,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(
                    color: colors.secondary,
                    borderRadius: radius,
                    offset: _ringOffset,
                  )
                : null,
            child: surface,
          ),
        );
      },
    );
  }
}

/// The `…` that stands in for the middle of a folded trail.
class _Fold extends StatelessWidget {
  const _Fold({
    required this.expandable,
    required this.label,
    required this.glyph,
    required this.accent,
    required this.colors,
    required this.radius,
    required this.onPressed,
  });

  final bool expandable;
  final String label;
  final double glyph;
  final MPAccent accent;
  final MPColorScheme colors;
  final BorderRadius radius;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    if (!expandable) {
      return ExcludeSemantics(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2),
          child: MPGlyph(MPGlyphShape.ellipsis, size: glyph, color: colors.onSurfaceVariant),
        ),
      );
    }

    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;

    return MPInteractive(
      onTap: onPressed,
      shortcuts: MPInteractive.enterOnly,
      builder: (BuildContext context, MPInteraction state) {
        final Widget mark = AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          padding: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: state.hovered ? accent.container : _clear,
            borderRadius: radius,
          ),
          child: TweenAnimationBuilder<Color?>(
            tween: ColorTween(end: state.hovered ? accent.onContainer : colors.onSurfaceVariant),
            duration: duration,
            curve: MPMotion.standard,
            builder: (BuildContext context, Color? value, Widget? _) {
              return MPGlyph(MPGlyphShape.ellipsis, size: glyph, color: value);
            },
          ),
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(
                    color: colors.secondary,
                    borderRadius: radius,
                    offset: _ringOffset,
                  )
                : null,
            child: mark,
          ),
        );
      },
    );
  }
}
