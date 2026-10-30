/// A box files are chosen into.
library;

import 'dart:async';
import 'dart:ui' show FontFeature, PathMetric;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The box's padding: its own ladder, because a drop target is sized by the
/// gesture it has to catch rather than by what is written in it. `p-4` to
/// `p-10`.
const Map<MPSize, double> _zonePadding = <MPSize, double>{
  MPSize.xs: 16,
  MPSize.sm: 20,
  MPSize.md: 24,
  MPSize.lg: 32,
  MPSize.xl: 40,
};

/// The dashed edge's width: `border-2`.
const double _edgeWidth = 2;

/// Why a file was turned away. One reason per file, in the order they are
/// checked.
enum MPFileRejectionReason {
  /// It is not one of the kinds `accept` names.
  type,

  /// It is larger than `maxSize`.
  size,

  /// There is no room left under `maxFiles`, or a single picker already holds
  /// the one it takes from this batch.
  count,
}

/// One file that was turned away, and why.
@immutable
class MPFileRejection {
  /// Creates a rejection.
  const MPFileRejection({required this.file, required this.reason});

  /// The file.
  final MPFile file;

  /// Why it was not kept.
  final MPFileRejectionReason reason;
}

/// A file, as the picker needs to know it.
///
/// Deliberately **not** a `dart:io` `File`, and not an abstraction over one:
/// this package has no dependencies and no business opening anything. What
/// the picker draws is a name and a size, and what its rules read is a name, a
/// size and a kind, so that is what it asks for. [source] is whatever the
/// app's own picker handed over, carried through untouched so the caller gets
/// its own object back on the other side.
@immutable
class MPFile {
  /// Creates a file.
  const MPFile({required this.name, required this.size, this.mimeType, this.source});

  /// What it is called, extension and all.
  final String name;

  /// How many bytes it is.
  final int size;

  /// Its media type, `image/png`. Left out, only the extension is checked
  /// against `accept`.
  final String? mimeType;

  /// Whatever the app's own picker handed over. The picker never looks at it.
  final Object? source;

  /// Whether this file matches an `accept` string: the three forms the HTML
  /// attribute takes, `.ext`, `type/subtype` and `type/*`, which is the
  /// grammar every file picking plugin already speaks.
  bool matches(String accept) {
    final String lowerName = name.toLowerCase();
    final String lowerType = (mimeType ?? '').toLowerCase();

    return accept
        .split(',')
        .map((String entry) => entry.trim().toLowerCase())
        .where((String entry) => entry.isNotEmpty)
        .any((String entry) {
          if (entry.startsWith('.')) {
            return lowerName.endsWith(entry);
          }

          if (entry.endsWith('/*')) {
            return lowerType.startsWith(entry.substring(0, entry.length - 1));
          }

          return lowerType == entry;
        });
  }
}

/// `1.4 MB`, in the units a person reading a file list expects.
///
/// Base 1000 rather than 1024, and `MB` rather than `MiB`: it is the number
/// every operating system's file browser shows, and a picker that disagreed
/// with the file browser about how big the file is would have picked a fight
/// it cannot win.
String formatFileSize(int bytes) {
  if (bytes < 1000) {
    return '$bytes B';
  }

  const List<String> units = <String>['kB', 'MB', 'GB', 'TB'];
  double value = bytes / 1000;
  int unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  return '${value < 10 ? value.toStringAsFixed(1) : value.round()} ${units[unit]}';
}

/// A box files are chosen into, and the list of what was chosen.
///
/// ```dart
/// MPFilePicker(
///   label: const Text('Attachments'),
///   multiple: true,
///   maxSize: 10000000,
///   value: files,
///   onBrowse: () async => myFilePickingPlugin.pick(),
///   onFilesChanged: (List<MPFile> next) => setState(() => files = next),
/// )
/// ```
///
/// **The picker does not open the platform's file dialog.** This package is
/// built on the widgets layer alone and has no dependencies, and reaching the
/// file system is a plugin's job in every Flutter app that does it. So
/// [onBrowse] is where the app's own picking runs, and a drop the app detects
/// with a plugin of its own arrives through [MPFilePickerState.add]. What the
/// component owns is everything after that: the rules, the list, the removal,
/// and the box itself.
///
/// The rules are worth having in one place. [accept] is checked against what
/// arrived rather than trusted to whatever offered it, and [maxFiles] against
/// what is **already held** rather than against one batch, which is the
/// difference between "you may add five files" and "you may end up with five
/// files"; only the second is what the number means. Wire [onReject] first:
/// without it, a file that is turned away disappears in silence.
class MPFilePicker extends StatefulWidget {
  /// Creates a file picker.
  const MPFilePicker({
    this.accept,
    this.multiple = false,
    this.maxSize,
    this.maxFiles,
    this.value,
    this.initialValue = const <MPFile>[],
    this.onFilesChanged,
    this.onReject,
    this.onBrowse,
    this.dragging = false,
    this.label,
    this.description,
    this.errorMessage,
    this.title,
    this.hint,
    this.icon,
    this.showIcon = true,
    this.showList = true,
    this.removeLabel,
    this.locale,
    this.size,
    this.fullWidth = true,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.name,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// Which files are kept, in the `accept` grammar: `'image/*,.pdf'`.
  final String? accept;

  /// Whether more than one file may be held. Off, a new file replaces the one
  /// held.
  final bool multiple;

  /// The largest a single file may be, in bytes.
  final int? maxSize;

  /// How many files may be held at once, with [multiple]. Counted against what
  /// is already held.
  final int? maxFiles;

  /// The files held. Given, the picker is controlled; left out, it keeps its
  /// own, starting at [initialValue].
  final List<MPFile>? value;

  /// The files a picker that keeps its own starts with. The React build's
  /// `defaultValue`.
  final List<MPFile> initialValue;

  /// Called with the list that should be held next: files added, or one
  /// removed. The React build's `onFilesChange`.
  final ValueChanged<List<MPFile>>? onFilesChanged;

  /// Called with everything a batch turned away, and why.
  final ValueChanged<List<MPFileRejection>>? onReject;

  /// Runs the app's own file picking and hands back what it found, which is
  /// checked against the rules like a drop. Left out, a press on the box does
  /// nothing: files arrive only through [MPFilePickerState.add].
  final Future<List<MPFile>> Function()? onBrowse;

  /// Whether a file is being dragged over the box.
  ///
  /// Flutter has no file drag from the operating system without a plugin, so
  /// the picker cannot know this by itself. An app with one says so here, and
  /// the box lights the way it should: the look of the state is the
  /// component's, the detection the app's.
  final bool dragging;

  /// The name of what the box collects, above it. Usually a [Text].
  final Widget? label;

  /// The line under the box. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the box. Its presence is also what puts the picker
  /// into its error state.
  final Widget? errorMessage;

  /// The line inside the box. Defaults to the wording in [locale].
  final Widget? title;

  /// The line under it: what is accepted, how big, how many.
  final Widget? hint;

  /// The picture above the title. Defaults to an arrow rising out of a tray.
  final Widget? icon;

  /// Whether a picture is drawn above the title at all. The React build's
  /// `icon={null}`.
  final bool showIcon;

  /// Lists the files held under the box, each with a way to remove it.
  final bool showList;

  /// The name of a row's remove button, given the file's name. Left out, it is
  /// "Remove report.pdf" in [locale]'s own word order.
  final String Function(String name)? removeLabel;

  /// Which language the picker's own words are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Which rung: the box's padding, its type and its picture. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given. On by default: a drop target is easier to
  /// hit the bigger it is.
  final bool fullWidth;

  /// Marks the picker required. Inside an `MPForm`, a required picker holding
  /// nothing holds the submit back.
  final bool required;

  /// Greys the picker out and stops it taking files.
  final bool disabled;

  /// Shows what is held without letting it change, and stays focusable.
  final bool readOnly;

  /// The name an `MPForm` files the list under.
  final String? name;

  /// The box's name for a screen reader, in [label]'s place.
  final String? semanticLabel;

  /// Drives the box's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPFilePicker> createState() => MPFilePickerState();
}

/// The state of an [MPFilePicker], which is how files the app found by other
/// means, a drop above all, are handed to it.
///
/// ```dart
/// final GlobalKey<MPFilePickerState> picker = GlobalKey<MPFilePickerState>();
///
/// // In the app's own drop handler:
/// picker.currentState?.add(dropped);
/// ```
class MPFilePickerState extends State<MPFilePicker> {
  late List<MPFile> _own = List<MPFile>.of(widget.initialValue);

  /// The files the last batch added, which settle into the list as they
  /// arrive.
  Set<MPFile> _arrived = const <MPFile>{};

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => List<MPFile>.of(_files),
    validate: () {
      if (widget.readOnly || !widget.required || _files.isNotEmpty) {
        return null;
      }

      return mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['required'];
    },
    focus: () => _focusNode.requestFocus(),
    onUpdate: () {
      if (mounted) {
        setState(() {});
      }
    },
  );

  FocusNode? _ownFocus;

  FocusNode get _focusNode =>
      widget.focusNode ?? (_ownFocus ??= FocusNode(debugLabel: 'MPFilePicker'));

  List<MPFile> get _files => widget.value ?? _own;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _inert => _disabled || widget.readOnly;

  @override
  void dispose() {
    _ownFocus?.dispose();
    _form.dispose();
    super.dispose();
  }

  /// Checks [incoming] against the rules, keeps what passes, and reports what
  /// does not through `onReject`, exactly as a pick through `onBrowse` is.
  ///
  /// For files the app found by other means: a drop it detected with a plugin
  /// of its own, a paste, a share. Nothing happens while the picker is
  /// disabled or read-only.
  void add(List<MPFile> incoming) {
    if (_inert || incoming.isEmpty) {
      return;
    }

    final List<MPFile> kept = <MPFile>[];
    final List<MPFileRejection> rejections = <MPFileRejection>[];
    final int room = widget.multiple ? (widget.maxFiles ?? 1 << 30) : 1;
    final int held = widget.multiple ? _files.length : 0;

    for (final MPFile file in incoming) {
      if (widget.accept != null && !file.matches(widget.accept!)) {
        rejections.add(MPFileRejection(file: file, reason: MPFileRejectionReason.type));
      } else if (widget.maxSize != null && file.size > widget.maxSize!) {
        rejections.add(MPFileRejection(file: file, reason: MPFileRejectionReason.size));
      } else if (held + kept.length >= room) {
        rejections.add(MPFileRejection(file: file, reason: MPFileRejectionReason.count));
      } else {
        kept.add(file);
      }
    }

    if (rejections.isNotEmpty) {
      widget.onReject?.call(rejections);
    }

    if (kept.isNotEmpty) {
      setState(() => _arrived = kept.toSet());
      _commit(widget.multiple ? <MPFile>[..._files, ...kept] : kept);
    }
  }

  void _commit(List<MPFile> next) {
    if (widget.value == null) {
      setState(() => _own = next);
    }

    _form.changed();
    widget.onFilesChanged?.call(next);
  }

  Future<void> _browse() async {
    final Future<List<MPFile>> Function()? browse = widget.onBrowse;

    if (_inert || browse == null) {
      return;
    }

    final List<MPFile> found = await browse();

    if (mounted) {
      add(found);
    }
  }

  void _remove(int index) {
    final List<MPFile> files = _files;

    _commit(<MPFile>[
      for (int at = 0; at < files.length; at += 1)
        if (at != index) files[at],
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final bool disabled = _disabled;
    final Map<String, String> words = mpMessagesOf(
      context,
      mpFilePickerMessages,
      locale: widget.locale,
    );
    final Map<String, String> common = mpMessagesOf(
      context,
      mpCommonMessages,
      locale: widget.locale,
    );

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final bool invalid = error != null;
    final Color muted = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurfaceVariant;
    final TextStyle meta = theme.typescale.bodySmall.style(muted);
    final List<MPFile> files = _files;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: widget.fullWidth ? CrossAxisAlignment.stretch : CrossAxisAlignment.start,
      spacing: mpStackGap[size]!,
      children: <Widget>[
        if (widget.label != null)
          ExcludeSemantics(
            // The box says it as its name, so a screen reader does not read it
            // twice; a `semanticLabel` names the box instead and the label is
            // only drawn.
            child: DefaultTextStyle.merge(
              style: meta.copyWith(color: invalid && !disabled ? colors.error : null),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Flexible(child: widget.label!),
                  if (widget.required) const Text(' *'),
                ],
              ),
            ),
          ),
        _zone(theme, size, words: words, invalid: invalid),
        if (widget.showList && files.isNotEmpty)
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: mpStackGap[size]!,
            children: <Widget>[
              for (int index = 0; index < files.length; index += 1)
                MPArrivingRow(
                  key: ObjectKey(files[index]),
                  arriving: _arrived.contains(files[index]),
                  child: _row(theme, size, files[index], index, common: common),
                ),
            ],
          ),
        if (error != null)
          DefaultTextStyle.merge(
            style: meta.copyWith(color: colors.error),
            child: error,
          )
        else if (widget.description != null)
          DefaultTextStyle.merge(style: meta, child: widget.description!),
      ],
    );
  }

  Widget _zone(
    MPThemeData theme,
    MPSize size, {
    required Map<String, String> words,
    required bool invalid,
  }) {
    final MPColorScheme colors = theme.colors;
    final bool disabled = _disabled;
    final bool usable = !_inert && widget.onBrowse != null;
    final bool lit = widget.dragging && !_inert;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;
    final Color edge = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer)
        : lit
        ? colors.primary
        : invalid
        ? colors.error
        : colors.outlineVariant;
    final String within = mpTextWithin(widget.label);
    final String? name = widget.semanticLabel ?? (within.isEmpty ? null : within);

    return MPInteractive(
      onTap: _browse,
      enabled: !disabled,
      interactive: usable,
      focusNode: _focusNode,
      autofocus: widget.autofocus,
      cursor: usable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        Widget content = Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: <Widget>[
            if (widget.showIcon)
              IconTheme.merge(
                data: IconThemeData(
                  color: disabled ? ink : colors.primary,
                  size: mpControlIcon[size]! * 1.6,
                ),
                child: widget.icon ?? const MPGlyph(MPGlyphShape.upload),
              ),
            DefaultTextStyle.merge(
              style: mpProseText(
                theme.typescale,
                size,
              ).style(ink).copyWith(fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
              child: widget.title ?? Text(words['prompt']!),
            ),
            if (widget.hint != null)
              DefaultTextStyle.merge(
                style: theme.typescale.bodySmall.style(disabled ? ink : colors.onSurfaceVariant),
                textAlign: TextAlign.center,
                child: widget.hint!,
              ),
          ],
        );

        content = Padding(
          padding: EdgeInsets.all(_zonePadding[size]!),
          child: Center(heightFactor: 1, widthFactor: widget.fullWidth ? null : 1, child: content),
        );

        // The state layer in `primary`, the colour a drop lights the box in,
        // so a pointer over the box and a file over it say the same thing.
        content = MPStateLayer(
          color: colors.primary,
          opacity: mpStateLayerOpacity(state, enabled: usable),
          borderRadius: radius,
          child: content,
        );

        content = AnimatedContainer(
          duration: duration,
          curve: MPMotion.standard,
          decoration: BoxDecoration(
            borderRadius: radius,
            color: lit
                ? colors.primary.withValues(alpha: MPStateOpacity.hover)
                : colors.primary.withValues(alpha: 0),
          ),
          child: content,
        );

        // A dashed edge, the one place the library draws a line that is not
        // solid: a dashed rectangle is the established sign for "this area
        // takes a drop".
        content = TweenAnimationBuilder<Color?>(
          tween: ColorTween(end: edge),
          duration: duration,
          curve: MPMotion.standard,
          child: content,
          builder: (BuildContext context, Color? color, Widget? child) {
            return CustomPaint(
              foregroundPainter: _DashedEdge(color: color!, radius: radius),
              child: child,
            );
          },
        );

        return Semantics(
          container: true,
          button: true,
          enabled: !disabled,
          readOnly: widget.readOnly ? true : null,
          label: name,
          isRequired: widget.required ? true : null,
          validationResult: invalid
              ? SemanticsValidationResult.invalid
              : SemanticsValidationResult.none,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: usable ? _browse : null,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius)
                : null,
            child: content,
          ),
        );
      },
    );
  }

  Widget _row(
    MPThemeData theme,
    MPSize size,
    MPFile file,
    int index, {
    required Map<String, String> common,
  }) {
    final MPColorScheme colors = theme.colors;
    final bool disabled = _disabled;
    final Color ink = disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;
    final Color muted = disabled ? ink : colors.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
      ),
      child: Row(
        spacing: 12,
        children: <Widget>[
          Expanded(
            child: Text(
              file.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: mpProseText(theme.typescale, size).style(ink),
            ),
          ),
          Text(
            formatFileSize(file.size),
            style: theme.typescale.bodySmall
                .style(muted)
                .copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
          ),
          if (!_inert)
            MPFieldIconButton(
              icon: const MPGlyph(MPGlyphShape.close),
              iconSize: 18,
              semanticLabel:
                  widget.removeLabel?.call(file.name) ??
                  mpFillMessage(common['removeNamed']!, <String, String>{'label': file.name}),
              onPressed: () => _remove(index),
              extent: 32,
            ),
        ],
      ),
    );
  }
}

/// The box's dashed edge, drawn inside its bounds as a CSS border is.
class _DashedEdge extends CustomPainter {
  const _DashedEdge({required this.color, required this.radius});

  final Color color;
  final BorderRadius radius;

  /// A 2px CSS dash: three widths long, with three widths between.
  static const double _dash = 6;
  static const double _gap = 6;

  @override
  void paint(Canvas canvas, Size size) {
    final Path outline = Path()
      ..addRRect(radius.toRRect(Offset.zero & size).deflate(_edgeWidth / 2));
    final Path dashed = Path();

    for (final PathMetric metric in outline.computeMetrics()) {
      double at = 0;

      while (at < metric.length) {
        final double end = at + _dash < metric.length ? at + _dash : metric.length;

        dashed.addPath(metric.extractPath(at, end), Offset.zero);
        at += _dash + _gap;
      }
    }

    canvas.drawPath(
      dashed,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = _edgeWidth
        ..color = color,
    );
  }

  @override
  bool shouldRepaint(_DashedEdge oldDelegate) {
    return oldDelegate.color != color || oldDelegate.radius != radius;
  }
}
