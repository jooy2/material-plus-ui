/// One message in a conversation.
library;

import 'package:flutter/foundation.dart';
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

/// Whose message this is.
///
/// `start` and `end` rather than "them" and "me" or left and right: a thread
/// runs the way the language does.
enum MPChatBubbleSide {
  /// Somebody else's: the row runs from the start, the default.
  start,

  /// The reader's own: the row runs from the end.
  end,
}

/// How far a message has got.
///
/// The first four are a ladder and the fifth is not on it: [failed] is the
/// message that did not go, which is why it is the only one drawn in another
/// colour family.
enum MPChatBubbleStatus {
  /// On its way out.
  sending,

  /// It left.
  sent,

  /// It arrived.
  delivered,

  /// It was read.
  read,

  /// It did not go.
  failed,
}

/// What a link inside a message unfurls to.
@immutable
class MPChatBubblePreview {
  /// Creates a card.
  const MPChatBubblePreview({this.onPressed, this.title, this.description, this.image, this.site});

  /// Called when the card is pressed.
  ///
  /// There is no `url`. The React card is a link, and checks the address it
  /// came with before rendering it, because a preview's contents come from
  /// somebody else. Flutter has no navigation of its own, so where the card
  /// goes is the app's to decide, here, with whatever checks the app makes on
  /// an address a stranger sent. Left out, the card is not pressable.
  final VoidCallback? onPressed;

  /// The page's title, on up to two lines.
  final Widget? title;

  /// Its summary, clamped to two lines.
  final Widget? description;

  /// The share image, drawn across the top of the card. Decorative: what it
  /// says is written underneath it.
  final ImageProvider<Object>? image;

  /// Who published it: a domain, a site name.
  final Widget? site;
}

/// A bubble's padding at each rung, both axes: a bubble is a sentence with a
/// surface behind it, and 16px round eight words is a card rather than a
/// message.
const Map<MPSize, EdgeInsets> _bubblePad = <MPSize, EdgeInsets>{
  MPSize.xs: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  MPSize.sm: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
  MPSize.md: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
  MPSize.lg: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
  MPSize.xl: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
};

/// The widest a message column gets, the React build's `32rem`.
const double _maxWidth = 512;

/// One message in a conversation.
///
/// ```dart
/// MPChatBubble(
///   side: MPChatBubbleSide.end,
///   variant: MPVariant.filled,
///   status: MPChatBubbleStatus.read,
///   child: const Text('On my way.'),
/// )
/// ```
///
/// MD3 does not describe a chat bubble; this is the library's own shape, drawn
/// out of the specification's roles so a thread of them sits in a Material
/// screen without announcing that it is extra. Everything round the bubble is
/// optional and drawn only when given something. What [side] decides is which
/// way the row runs and which corner of the bubble is cut short.
///
/// ## Why `variant` is not tied to `side`
///
/// Filling the reader's own messages is a convention, not a law, and it is a
/// decision about the product: some threads fill neither end, and a support
/// inbox may fill the agent's. So [side] decides the geometry and [variant]
/// the emphasis.
class MPChatBubble extends StatefulWidget {
  /// Creates a message.
  const MPChatBubble({
    this.child,
    this.side = MPChatBubbleSide.start,
    this.name,
    this.time,
    this.avatar,
    this.status,
    this.statusLabel,
    this.typing = false,
    this.media,
    this.preview,
    this.actions,
    this.locale,
    this.variant = MPVariant.tonal,
    this.size,
    this.color,
    super.key,
  });

  /// The message. Line breaks in it are kept.
  final Widget? child;

  /// Whose message this is. [MPChatBubbleSide.start] by default.
  final MPChatBubbleSide side;

  /// Who sent it, above the bubble.
  final Widget? name;

  /// When it was sent, beside the name.
  final Widget? time;

  /// The sender's picture, usually an `MPAvatar` at the size the thread uses.
  /// Left out, the bubble takes the whole row.
  final Widget? avatar;

  /// How far the message has got, drawn as a mark under the bubble. Left out,
  /// nothing is drawn: a received message has no delivery state worth showing.
  final MPChatBubbleStatus? status;

  /// Overrides the word the mark is read out as.
  final String? statusLabel;

  /// Draws three dots instead of the message, announced as typing. Whatever is
  /// in [child] is left alone, so the same bubble can go back to it when the
  /// message arrives.
  final bool typing;

  /// A picture, a video, a map, drawn edge to edge above the text so the
  /// bubble's own corners crop it.
  final Widget? media;

  /// A link in the message, unfurled into a card under the text.
  final MPChatBubblePreview? preview;

  /// The message's own actions, usually a menu trigger. Sits beside the bubble
  /// and stays out of the way until the row is hovered or something in it
  /// takes focus. On a touch platform, which has nothing to hover, it is
  /// always there.
  final Widget? actions;

  /// Which language the marks and the dots are read out in. Falls back to the
  /// nearest `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// How much surface the bubble paints.
  ///
  /// A bubble *is* the thing being coloured, unlike a card, so this is the
  /// control ladder: [MPVariant.filled] floods it with the accent,
  /// [MPVariant.tonal] (the default) takes the container tone, and
  /// [MPVariant.text] is not "no surface", because a bubble with no surface is
  /// not a bubble, but the quietest neutral container.
  final MPVariant variant;

  /// The type scale of the message, and the room inside the bubble.
  final MPSize? size;

  /// Which accent family a filled or tonal bubble and a read mark take.
  final MPColor? color;

  @override
  State<MPChatBubble> createState() => _MPChatBubbleState();
}

class _MPChatBubbleState extends State<MPChatBubble> {
  bool _hovered = false;
  bool _focusWithin = false;

  /// A pointer that cannot hover has nothing to reveal the actions with, so
  /// on a touch platform they are always shown, as the React build's
  /// `(hover: none)` query shows them.
  bool get _touch {
    return switch (defaultTargetPlatform) {
      TargetPlatform.android || TargetPlatform.iOS || TargetPlatform.fuchsia => true,
      TargetPlatform.linux || TargetPlatform.macOS || TargetPlatform.windows => false,
    };
  }

  /// The direction a row runs for the reader's own message: reversed rather
  /// than reordered, so it mirrors for a thread in Arabic without being told.
  TextDirection _flip(TextDirection direction) {
    return direction == TextDirection.ltr ? TextDirection.rtl : TextDirection.ltr;
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPColor color = widget.color ?? config?.color ?? MPColor.primary;
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPAccent accent = colors.accent(color);
    final TextDirection direction = Directionality.of(context);
    final bool end = widget.side == MPChatBubbleSide.end;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpChatMessages,
      locale: widget.locale,
    );
    final TextStyle meta = theme.typescale.bodySmall.style();

    final (
      Color fill,
      Color ink,
      Border? border,
      List<BoxShadow> shadows,
    ) = switch (widget.variant) {
      MPVariant.filled => (accent.color, accent.onColor, null, const <BoxShadow>[]),
      MPVariant.tonal => (accent.container, accent.onContainer, null, const <BoxShadow>[]),
      MPVariant.elevated => (colors.surfaceContainerLow, colors.onSurface, null, MPShadows.of(1)),
      MPVariant.outlined => (
        const Color(0x00000000),
        colors.onSurface,
        Border.all(color: colors.outlineVariant),
        const <BoxShadow>[],
      ),
      MPVariant.text => (colors.surfaceContainerLow, colors.onSurface, null, const <BoxShadow>[]),
    };

    // The corner nearest the speaker, cut short: the job a drawn tail does
    // elsewhere, without hanging a triangle off a surface cut with a straight
    // edge. Logical, so a thread in Arabic squares the other one unasked.
    final Radius round = Radius.circular(theme.shapes.extraLarge);
    final Radius cut = Radius.circular(theme.shapes.extraSmall);
    final BorderRadius corners = BorderRadiusDirectional.only(
      topStart: end ? round : cut,
      topEnd: end ? cut : round,
      bottomStart: round,
      bottomEnd: round,
    ).resolve(direction);
    final double hairline = border == null ? 0 : 1;

    final bool hasBody = widget.typing || widget.child != null || widget.preview != null;

    Widget bubble = DecoratedBox(
      decoration: BoxDecoration(
        color: fill,
        border: border,
        borderRadius: corners,
        boxShadow: shadows,
      ),
      child: Padding(
        padding: EdgeInsets.all(hairline),
        child: ClipRRect(
          borderRadius: corners - BorderRadius.circular(hairline),
          child: DefaultTextStyle.merge(
            style: mpProseText(theme.typescale, size).style(ink),
            child: IconTheme.merge(
              data: IconThemeData(color: ink),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  ?widget.media,
                  if (hasBody)
                    Padding(
                      padding: _bubblePad[size]!,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        spacing: 8,
                        children: <Widget>[
                          if (widget.typing)
                            _TypingDots(label: messages['typing']!)
                          else
                            ?widget.child,
                          if (widget.preview != null)
                            _Preview(preview: widget.preview!, ring: colors.secondary),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    // As wide as its message and no wider. The sheet stretches its sections,
    // because the media has to reach both edges, so the shrinking happens here.
    bubble = IntrinsicWidth(child: bubble);

    Widget? actions = widget.actions;

    if (actions != null) {
      final bool shown = _touch || _hovered || _focusWithin;

      actions = AnimatedOpacity(
        opacity: shown ? 1 : 0,
        duration: reduceMotion ? Duration.zero : MPMotion.short4,
        curve: MPMotion.standard,
        child: actions,
      );
    }

    final Widget column = Column(
      crossAxisAlignment: end ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 4,
      children: <Widget>[
        if (widget.name != null || widget.time != null)
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            spacing: 8,
            children: <Widget>[
              if (widget.name != null)
                DefaultTextStyle.merge(
                  style: meta.copyWith(color: colors.onSurface, fontWeight: FontWeight.w500),
                  child: widget.name!,
                ),
              if (widget.time != null)
                DefaultTextStyle.merge(
                  style: meta.copyWith(color: colors.onSurfaceVariant),
                  child: widget.time!,
                ),
            ],
          ),
        Row(
          mainAxisSize: MainAxisSize.min,
          textDirection: end ? _flip(direction) : direction,
          spacing: 4,
          children: <Widget>[
            // Back the right way up inside: the row runs backwards to put the
            // actions on the far side, and the message must not run with it.
            Flexible(
              child: Directionality(textDirection: direction, child: bubble),
            ),
            if (actions != null) Directionality(textDirection: direction, child: actions),
          ],
        ),
        if (widget.status != null) _mark(colors, accent, meta, messages),
      ],
    );

    final Widget row = Row(
      textDirection: end ? _flip(direction) : direction,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 8,
      children: <Widget>[
        if (widget.avatar != null) Directionality(textDirection: direction, child: widget.avatar!),
        Flexible(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: _maxWidth),
            child: Directionality(textDirection: direction, child: column),
          ),
        ),
      ],
    );

    if (widget.actions == null) {
      return row;
    }

    // Told when a pointer is over the row and when anything in it holds the
    // focus, which is when the actions show.
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onFocusChange: (bool focused) => setState(() => _focusWithin = focused),
        child: row,
      ),
    );
  }

  /// The delivery mark, and the word behind it.
  ///
  /// Only two of the five carry a colour: the one that arrived and the one
  /// that did not. A thread where every message is marked in colour is a
  /// thread where the colour has stopped meaning anything.
  Widget _mark(
    MPColorScheme colors,
    MPAccent accent,
    TextStyle meta,
    Map<String, String> messages,
  ) {
    final MPChatBubbleStatus status = widget.status!;
    final MPGlyphShape shape = switch (status) {
      MPChatBubbleStatus.sending => MPGlyphShape.clock,
      MPChatBubbleStatus.sent => MPGlyphShape.check,
      MPChatBubbleStatus.delivered || MPChatBubbleStatus.read => MPGlyphShape.doubleCheck,
      MPChatBubbleStatus.failed => MPGlyphShape.dangerMark,
    };
    final Color tone = switch (status) {
      MPChatBubbleStatus.read => accent.color,
      MPChatBubbleStatus.failed => colors.error,
      _ => colors.onSurfaceVariant,
    };

    // The mark is the whole of what is drawn; the word behind it is for the
    // readers the mark says nothing to.
    return Semantics(
      container: true,
      label: widget.statusLabel ?? messages[status.name]!,
      child: MPGlyph(shape, size: meta.fontSize! * 1.15, color: tone),
    );
  }
}

/// Three dots that light in sequence.
///
/// Colour only, like every indeterminate indicator in the library: the dots
/// never move, so a bubble being typed into does not bounce in a thread
/// somebody is reading. The React build's `mp-wave`: a second a cycle, each
/// dot 160ms behind the last, from 24% to full at 40% of the way and back.
/// Under reduced motion they rest at 60%.
class _TypingDots extends StatefulWidget {
  const _TypingDots({required this.label});

  final String label;

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots> with SingleTickerProviderStateMixin {
  late final AnimationController _wave = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _wave.stop();
    } else if (!_wave.isAnimating) {
      _wave.repeat();
    }
  }

  @override
  void dispose() {
    _wave.dispose();
    super.dispose();
  }

  /// How lit a dot is at [phase] of its own cycle.
  static double _opacityAt(double phase) {
    const double low = 0.24;
    final double rise = phase < 0.4 ? phase / 0.4 : (1 - phase) / 0.6;

    return low + (1 - low) * Curves.easeInOut.transform(rise.clamp(0, 1));
  }

  @override
  Widget build(BuildContext context) {
    final TextStyle style = DefaultTextStyle.of(context).style;
    final double em = style.fontSize ?? 16;
    final Color ink = style.color ?? const Color(0xFF000000);
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return Semantics(
      container: true,
      liveRegion: true,
      label: widget.label,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: em * 0.35),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: <Widget>[
            for (int index = 0; index < 3; index += 1)
              AnimatedBuilder(
                animation: _wave,
                builder: (BuildContext context, Widget? _) {
                  final double phase = (_wave.value - index * 0.16) % 1;

                  return DecoratedBox(
                    decoration: BoxDecoration(
                      color: ink.withValues(alpha: ink.a * (still ? 0.6 : _opacityAt(phase))),
                      shape: BoxShape.circle,
                    ),
                    child: SizedBox.square(dimension: em * 0.45),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}

/// The unfurled link: a picture, who published it, a title and two lines of
/// summary.
///
/// Its surface is mixed out of the ink rather than pointed at a role, because
/// it has to work on an accent fill and a neutral one alike: on `filled` the
/// ink is `onPrimary` and the card is a pale wash of it, on `outlined` it is
/// `onSurface` and the card is grey. A fixed role would vanish against one.
class _Preview extends StatelessWidget {
  const _Preview({required this.preview, required this.ring});

  final MPChatBubblePreview preview;
  final Color ring;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.small);
    final Color ink = DefaultTextStyle.of(context).style.color ?? theme.colors.onSurface;
    final double em = DefaultTextStyle.of(context).style.fontSize ?? 16;
    final bool still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final bool pressable = preview.onPressed != null;

    return MPInteractive(
      onTap: preview.onPressed,
      enabled: pressable,
      interactive: pressable,
      pressable: pressable,
      cursor: pressable ? SystemMouseCursors.click : MouseCursor.defer,
      builder: (BuildContext context, MPInteraction state) {
        Widget card = TweenAnimationBuilder<double>(
          tween: Tween<double>(end: state.hovered ? 0.12 : 0.07),
          duration: still ? Duration.zero : MPMotion.short4,
          curve: MPMotion.standard,
          builder: (BuildContext context, double wash, Widget? child) => DecoratedBox(
            decoration: BoxDecoration(
              color: ink.withValues(alpha: ink.a * wash),
              border: Border.all(color: ink.withValues(alpha: ink.a * 0.18)),
              borderRadius: radius,
            ),
            child: child,
          ),
          child: ClipRRect(
            borderRadius: radius,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (preview.image != null)
                  SizedBox(
                    height: 112,
                    child: Image(
                      image: preview.image!,
                      fit: BoxFit.cover,
                      excludeFromSemantics: true,
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    spacing: 2,
                    children: <Widget>[
                      if (preview.site != null)
                        DefaultTextStyle.merge(
                          style: TextStyle(
                            color: ink.withValues(alpha: ink.a * 0.7),
                            fontSize: em * 0.85,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            spacing: 4,
                            children: <Widget>[
                              MPGlyph(
                                MPGlyphShape.link,
                                size: em * 0.85,
                                color: ink.withValues(alpha: ink.a * 0.7),
                              ),
                              Flexible(child: preview.site!),
                            ],
                          ),
                        ),
                      if (preview.title != null)
                        DefaultTextStyle.merge(
                          style: const TextStyle(fontWeight: FontWeight.w500),
                          child: preview.title!,
                        ),
                      if (preview.description != null)
                        DefaultTextStyle.merge(
                          style: TextStyle(
                            color: ink.withValues(alpha: ink.a * 0.8),
                            fontSize: em * 0.9,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          child: preview.description!,
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );

        card = CustomPaint(
          foregroundPainter: state.focusVisible
              ? MPFocusRingPainter(color: ring, borderRadius: radius)
              : null,
          child: card,
        );

        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          link: pressable ? true : null,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: preview.onPressed,
          child: card,
        );
      },
    );
  }
}
