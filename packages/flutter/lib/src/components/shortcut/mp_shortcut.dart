/// A keyboard key, or a combination of them.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/shortcut_keys.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which keyboard an [MPShortcut] names the modifiers for.
enum MPShortcutOS {
  /// The platform the app is running on.
  auto,

  /// macOS: modifiers as symbols, written as one run, `⇧⌘P`.
  mac,

  /// Windows: modifiers as words, joined with `+`.
  windows,

  /// Linux, and every other platform: as Windows, with `Super` for the meta
  /// key.
  linux,
}

/// A key cap's height, the same call `MPChip` makes: a token inside a line of
/// text is not a control the line lines up against. `md` is 32px, where a
/// two-character cap has a square of its own without becoming a button. The
/// cap is held at least as wide, so `⌘` and `K` come out the same square.
const Map<MPSize, double> _height = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 24,
  MPSize.md: 32,
  MPSize.lg: 40,
  MPSize.xl: 48,
};

const Map<MPSize, double> _padX = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// The space between two caps, and between a cap and a separator.
const double _gap = 4;

MPTypeRole _textRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.labelSmall;
    case MPSize.sm:
      return scale.labelMedium;
    case MPSize.md:
    case MPSize.lg:
      return scale.labelLarge;
    case MPSize.xl:
      return scale.titleMedium;
  }
}

/// A key cap is `extraSmall` to `medium`, the shape MD3 gives a text field: a
/// shallow well rather than a pill, as far from `full` as the scale goes,
/// because nothing here is pressable.
double _radius(MPShapes shapes, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return shapes.extraSmall;
    case MPSize.md:
    case MPSize.lg:
      return shapes.small;
    case MPSize.xl:
      return shapes.medium;
  }
}

/// A keyboard key, or a combination of them.
///
/// ```dart
/// const MPShortcut(keys: 'Mod+K')
/// ```
///
/// Two things make this more than a styled box, and both are about the label.
///
/// The first is `Mod`. A shortcut written as `Ctrl+K` is wrong for every Mac
/// reader and one written as `⌘K` is wrong for everybody else, so the token
/// that means "the modifier shortcuts are built on" resolves per platform, and
/// [os] is there for the screens that have to name a platform rather than the
/// reader's.
///
/// The second is that `⌘` is not a word. Every key drawn as a glyph is named
/// for a screen reader by what it is called, so what is announced is "Command
/// K".
///
/// It only draws the keys. To answer them, bind the same string with the app's
/// own `Shortcuts` or `CallbackShortcuts`.
class MPShortcut extends StatelessWidget {
  /// Creates a shortcut.
  const MPShortcut({
    required this.keys,
    this.os = MPShortcutOS.auto,
    this.separator,
    this.variant = MPVariant.outlined,
    this.size,
    this.color = MPColor.secondary,
    super.key,
  }) : assert(
         keys is String || keys is List<String>,
         'MPShortcut.keys must be a String or a List<String>',
       );

  /// The keys, as `'Mod+Shift+P'` or as a list.
  ///
  /// A string is split on `+`, which covers everything except a shortcut whose
  /// key *is* a plus. For that one pass the list: `<String>['Ctrl', '+']`.
  final Object keys;

  /// Which keyboard to name the modifiers for.
  final MPShortcutOS os;

  /// What goes between two keys. Left out, the platform's own convention: a
  /// `+` on Windows and Linux, and nothing at all on macOS, where a shortcut is
  /// written as a run of symbols.
  final Widget? separator;

  /// How much surface a key cap paints. [MPVariant.outlined] is the default: a
  /// key cap is a hairline box, and it should be the quietest thing in the
  /// menu row it usually sits at the end of.
  final MPVariant variant;

  /// The cap's own ladder, 20 to 48px. [MPSize.md] unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family a filled or tonal cap reads.
  final MPColor color;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final MPShortcutOS resolved = os == MPShortcutOS.auto ? mpShortcutPlatform() : os;
    final List<MPKeyLabel> labels = mpShortcutTokens(
      keys,
    ).map((String token) => mpKeyLabel(token, resolved)).toList();
    final _CapPaint paint = _paintFor(colors, colors.accent(color), variant);
    final MPTypeRole role = _textRole(theme.typescale, size);
    final double height = _height[size]!;
    final BorderRadius radius = BorderRadius.circular(_radius(theme.shapes, size));

    // macOS writes a shortcut as a run of symbols with nothing between them;
    // the other two join theirs with a `+`. A caller who passes one gets theirs.
    final Widget? joiner = separator ?? (resolved == MPShortcutOS.mac ? null : const Text('+'));

    Widget cap(MPKeyLabel label) {
      return Container(
        constraints: BoxConstraints(minWidth: height, minHeight: height, maxHeight: height),
        padding: EdgeInsets.symmetric(horizontal: _padX[size]!),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: paint.fill,
          borderRadius: radius,
          border: paint.border == null ? null : Border.fromBorderSide(paint.border!),
          boxShadow: paint.shadows,
        ),
        child: Text(
          label.symbol,
          maxLines: 1,
          softWrap: false,
          style: role
              .style(paint.ink)
              .copyWith(
                height: 1,
                fontFamily: 'monospace',
                fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
              ),
        ),
      );
    }

    final Widget row = Row(
      mainAxisSize: MainAxisSize.min,
      spacing: _gap,
      children: <Widget>[
        for (int index = 0; index < labels.length; index += 1) ...<Widget>[
          if (index > 0 && joiner != null)
            ExcludeSemantics(
              child: DefaultTextStyle.merge(
                style: role.style(colors.onSurfaceVariant).copyWith(height: 1),
                child: joiner,
              ),
            ),
          cap(labels[index]),
        ],
      ],
    );

    // One node for the whole combination, read by what each key is called:
    // "Command Shift P" rather than three separate stops, the first of them a
    // "place of interest sign".
    return Semantics(
      container: true,
      label: labels.map((MPKeyLabel label) => label.name).join(' '),
      child: ExcludeSemantics(child: row),
    );
  }
}

/// What a key cap paints.
class _CapPaint {
  const _CapPaint({
    required this.fill,
    required this.ink,
    this.border,
    this.shadows = const <BoxShadow>[],
  });

  final Color fill;
  final Color ink;
  final BorderSide? border;
  final List<BoxShadow> shadows;
}

/// The five weights. The quiet three read `onSurfaceVariant`, and `text` sits
/// on `surfaceContainer` rather than nothing: a key with no box at all is a
/// letter in a sentence.
_CapPaint _paintFor(MPColorScheme colors, MPAccent accent, MPVariant variant) {
  switch (variant) {
    case MPVariant.filled:
      return _CapPaint(fill: accent.color, ink: accent.onColor);
    case MPVariant.tonal:
      return _CapPaint(fill: accent.container, ink: accent.onContainer);
    case MPVariant.elevated:
      return _CapPaint(
        fill: colors.surfaceContainerLow,
        ink: colors.onSurfaceVariant,
        shadows: MPShadows.of(1),
      );
    case MPVariant.outlined:
      return _CapPaint(
        fill: const Color(0x00000000),
        ink: colors.onSurfaceVariant,
        border: BorderSide(color: colors.outlineVariant),
      );
    case MPVariant.text:
      return _CapPaint(fill: colors.surfaceContainer, ink: colors.onSurfaceVariant);
  }
}
