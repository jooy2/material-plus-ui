/// Content that is covered until somebody asks for it.
library;

import 'dart:ui' show ImageFilter;

import 'package:flutter/rendering.dart' show OverflowBoxFit;
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// How much of the page's own `surface` goes over the blur.
///
/// Blur alone is not cover. It takes a paragraph apart but leaves its colour
/// and its rhythm, a photograph blurred at 10 is still recognisably a
/// photograph of a face, and it leaves the button standing on whatever happened
/// to be underneath it. A wash of `surface` settles both: the content goes to a
/// wash of its own colours, and the button gets something to stand on.
const double _scrim = 0.55;

/// The gap between the notice and the button under it.
const double _coverGap = 8;

/// Content that is covered until somebody asks for it.
///
/// ```dart
/// MPSpoiler(
///   reversible: true,
///   child: const Text('She was his sister the whole time.'),
/// )
/// ```
///
/// MD3 does not describe this, and it is the library's own, drawn out of the
/// specification's parts: a container surface, a tonal [MPButton] on the
/// cover and a text one to hide it again.
///
/// The cover is a **blur** rather than a hidden box, which is the whole point:
/// a reader can see that there is something there, roughly how much of it
/// there is, and, with [maxHeight], that it has been clamped. What they cannot
/// do is read it by accident.
///
/// While it is covered the content is out of the focus order, off the
/// semantics tree and out of reach of the pointer. A spoiler somebody can tab
/// into is not a spoiler.
///
/// ## The box holds still
///
/// A [reversible] sheet's way back out is **reserved** rather than built on
/// reveal, so pressing the button does not push the rest of the page down by
/// the height of the row that replaces it. And the cover is laid out with the
/// content rather than over it, so a cover taller than what it covers makes
/// the sheet taller instead of being cut off by it.
class MPSpoiler extends StatefulWidget {
  /// Creates a spoiler.
  const MPSpoiler({
    this.child,
    this.revealed,
    this.initialRevealed = false,
    this.onRevealedChange,
    this.label,
    this.hideLabel,
    this.description,
    this.showDescription = true,
    this.action,
    this.reversible = false,
    this.maxHeight,
    this.blur = 10,
    this.padded = true,
    this.variant = MPVariant.outlined,
    this.size,
    this.color,
    this.locale,
    super.key,
  });

  /// What is being covered.
  final Widget? child;

  /// Whether the content is uncovered. Give it with [onRevealedChange] to
  /// control the spoiler from outside; leave it out and the spoiler keeps its
  /// own state, starting at [initialRevealed].
  final bool? revealed;

  /// Where an uncontrolled spoiler starts.
  final bool initialRevealed;

  /// Called when the reveal or the hide button is pressed, with the state
  /// asked for.
  final ValueChanged<bool>? onRevealedChange;

  /// The reveal button's label. Defaults to the word for "reveal" in
  /// [locale].
  final Widget? label;

  /// The hide button's label, when [reversible] is on. Defaults to the word
  /// for "hide" in [locale].
  final Widget? hideLabel;

  /// The line above the button, saying why the content is covered. Defaults
  /// to [locale]'s wording.
  final Widget? description;

  /// Whether that line is drawn at all, for a cover with nothing written on
  /// it.
  final bool showDescription;

  /// Replaces the default reveal button entirely.
  ///
  /// The replacement is yours to wire up: pass [revealed] and
  /// [onRevealedChange] and drive it from your own control. [label] is the
  /// parameter for the far commoner case of wanting different words on the
  /// button that is already there.
  final Widget? action;

  /// Keeps the content coverable: once revealed, a hide button appears under
  /// it.
  final bool reversible;

  /// Clamps the covered box to this height, in logical pixels. Revealing
  /// releases it and the content takes whatever height it needs: revealing
  /// something and leaving it in a box with a scrollbar is answering the wrong
  /// question.
  ///
  /// Left out, the box is exactly as tall as what it holds. Set it for
  /// something long enough that a page of blurred content would be a page of
  /// nothing.
  final double? maxHeight;

  /// How hard the content is blurred: the blur's standard deviation, in
  /// logical pixels, which is what a CSS `blur()` length is.
  final double blur;

  /// Inner padding around the content. Turn it off for something that should
  /// reach the edges, a picture or a video. The sheet's corners still crop it.
  final bool padded;

  /// How much surface the sheet paints. [MPVariant.text] draws no box at all,
  /// which is what a spoiler sitting inside running prose usually wants.
  final MPVariant variant;

  /// The room inside, and the size of the buttons.
  final MPSize? size;

  /// Which accent family the buttons read. The sheet stays neutral, as every
  /// container in the library does.
  final MPColor? color;

  /// Which language the cover is written in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  @override
  State<MPSpoiler> createState() => _MPSpoilerState();
}

class _MPSpoilerState extends State<MPSpoiler> {
  late bool _uncontrolled = widget.initialRevealed;

  // The node each button's `expanded` is said through: the same holder a
  // trigger that opens a popup stands under, standing here for the content the
  // buttons uncover and cover again.
  final FocusNode _reveal = FocusNode(debugLabel: 'MPSpoiler reveal', skipTraversal: true);
  final FocusNode _hide = FocusNode(debugLabel: 'MPSpoiler hide', skipTraversal: true);

  // Carries the content's state across the one change of parent a reveal
  // makes, out from under the selection guard.
  final GlobalKey _content = GlobalKey(debugLabel: 'MPSpoiler content');

  bool get _open => widget.revealed ?? _uncontrolled;

  @override
  void dispose() {
    _reveal.dispose();
    _hide.dispose();
    super.dispose();
  }

  void _change(bool next) {
    if (widget.revealed == null) {
      setState(() => _uncontrolled = next);
    }

    widget.onRevealedChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpSpoilerMessages,
      locale: widget.locale,
    );
    final bool open = _open;
    final double pad = mpSheetPad[size]!;

    Widget content = Padding(
      padding: EdgeInsets.all(widget.padded ? pad : 0),
      child: widget.child ?? const SizedBox.shrink(),
    );

    // The clamp is only ever on the covered state. Laid out at its own height
    // and cut off, rather than squeezed, so what shows through the blur is the
    // top of the real thing.
    if (widget.maxHeight != null) {
      content = ConstrainedBox(
        constraints: BoxConstraints(maxHeight: open ? double.infinity : widget.maxHeight!),
        child: ClipRect(
          clipBehavior: open ? Clip.none : Clip.hardEdge,
          child: OverflowBox(
            fit: OverflowBoxFit.deferToChild,
            alignment: AlignmentDirectional.topStart,
            minHeight: 0,
            maxHeight: double.infinity,
            child: content,
          ),
        ),
      );
    }

    content = TweenAnimationBuilder<double>(
      tween: Tween<double>(end: open ? 0 : widget.blur),
      duration: still ? Duration.zero : MPMotion.short4,
      curve: MPMotion.standard,
      builder: (BuildContext context, double sigma, Widget? child) {
        return ImageFiltered(
          enabled: sigma > 0,
          imageFilter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
          child: child,
        );
      },
      child: content,
    );

    // Not selectable while covered, inside a `SelectionArea` or a
    // `SelectableRegion`: a spoiler that a select-all copies out is not a
    // spoiler. The guard comes off on reveal, and the key takes the content
    // with it rather than building it again.
    content = KeyedSubtree(key: _content, child: content);

    if (!open) {
      content = SelectionContainer.disabled(child: content);
    }

    // Out of reach entirely while covered: not tabbable, not read, not
    // pressable.
    content = IgnorePointer(
      ignoring: !open,
      child: ExcludeFocus(
        excluding: !open,
        child: ExcludeSemantics(excluding: !open, child: content),
      ),
    );

    final Widget? way = widget.reversible
        // Built from the start and held invisible while the sheet is covered,
        // rather than built when it opens: a control that appears on reveal is
        // a control that was not being paid for before it appeared, and the
        // sheet would jump by its height at the moment a reader pressed the
        // button inside it. Reserving the space costs nothing to look at,
        // because the cover is over it.
        ? ExcludeFocus(
            excluding: !open,
            child: Visibility(
              visible: open,
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: Padding(
                // The row takes the sheet's padding on three sides and gives
                // the top back: padded content already ends with a full track,
                // and two stacked is a hole between the text and the way out.
                padding: EdgeInsetsDirectional.only(start: pad, end: pad, bottom: pad),
                child: Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: _Expands(
                    node: _hide,
                    open: true,
                    child: MPButton(
                      variant: MPVariant.text,
                      size: size,
                      color: color,
                      onPressed: () => _change(false),
                      child: widget.hideLabel ?? Text(messages['hide']!),
                    ),
                  ),
                ),
              ),
            ),
          )
        : null;

    final Widget sheet = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[content, ?way],
    );

    final Widget? notice = !widget.showDescription
        ? null
        : widget.description ?? Text(messages['notice']!);

    final List<Widget> layers = <Widget>[
      sheet,
      if (!open) ...<Widget>[
        Positioned.fill(
          child: ColoredBox(color: colors.surface.withValues(alpha: _scrim)),
        ),
        // An unpositioned child, so it is laid out with the content rather
        // than over it: a cover taller than what it covers makes the sheet
        // taller, where one laid over the top would have its own button cut
        // off by the sheet's edge.
        Padding(
          padding: EdgeInsets.all(pad),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (notice != null) ...<Widget>[
                DefaultTextStyle.merge(
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                  textAlign: TextAlign.center,
                  child: notice,
                ),
                const SizedBox(height: _coverGap),
              ],
              widget.action ??
                  _Expands(
                    node: _reveal,
                    open: false,
                    child: MPButton(
                      variant: MPVariant.tonal,
                      size: size,
                      color: color,
                      onPressed: () => _change(true),
                      child: widget.label ?? Text(messages['reveal']!),
                    ),
                  ),
            ],
          ),
        ),
      ],
    ];

    final MPContainerPaint paint = mpContainerPaint(colors, widget.variant);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);

    return DecoratedBox(
      decoration: paint.decoration(radius),
      child: ClipRRect(
        borderRadius: radius,
        child: DefaultTextStyle.merge(
          style: TextStyle(color: colors.onSurface),
          child: Stack(alignment: Alignment.center, children: layers),
        ),
      ),
    );
  }
}

/// Says whether what [child] uncovers is showing, as a trigger's
/// `aria-expanded` does.
///
/// Through the holder a trigger that opens a popup stands under: the button
/// inside reads its `expanded` from it, so the reveal button says "collapsed"
/// and the hide button says "expanded". [node] takes no focus of its own.
class _Expands extends StatelessWidget {
  const _Expands({required this.node, required this.open, required this.child});

  final FocusNode node;
  final bool open;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Focus(
      focusNode: node,
      canRequestFocus: false,
      skipTraversal: true,
      child: MPFocusHolder(node: node, holding: false, open: open, child: child),
    );
  }
}
