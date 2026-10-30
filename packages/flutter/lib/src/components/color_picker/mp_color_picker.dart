/// A colour, chosen by eye.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/anchored.dart';
import 'package:material_plus_ui/src/internal/arrows.dart';
import 'package:material_plus_ui/src/internal/color.dart';
import 'package:material_plus_ui/src/internal/editor.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/field_form.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/select_trigger.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/color.dart' show MPColorFormat;

/// How wide the panel is: a ladder of its own rather than a step off the
/// control heights, because a saturation square is a space to aim at rather
/// than a row to read. `w-40` to `w-72`.
const Map<MPSize, double> _panelWidth = <MPSize, double>{
  MPSize.xs: 160,
  MPSize.sm: 176,
  MPSize.md: 208,
  MPSize.lg: 240,
  MPSize.xl: 288,
};

/// The square's height: `h-24` to `h-48`.
const Map<MPSize, double> _areaHeight = <MPSize, double>{
  MPSize.xs: 96,
  MPSize.sm: 112,
  MPSize.md: 128,
  MPSize.lg: 160,
  MPSize.xl: 192,
};

/// A rail's height: `h-2.5` to `h-5`.
const Map<MPSize, double> _railHeight = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 12,
  MPSize.md: 14,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

/// The gap between the panel's parts: `gap-2` to `gap-4`.
const Map<MPSize, double> _panelGap = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 10,
  MPSize.md: 12,
  MPSize.lg: 14,
  MPSize.xl: 16,
};

/// The thumb's diameter.
const Map<MPSize, double> _thumb = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 14,
  MPSize.md: 16,
  MPSize.lg: 18,
  MPSize.xl: 20,
};

/// The popup's padding round the panel: `p-3`.
const double _popupPad = 12;

/// Between two swatches: `gap-1`.
const double _swatchGap = 4;

/// The spectrum, drawn rather than sampled: the six primaries and red again,
/// which is what makes the rail seamless. The wheel is a circle and a gradient
/// is a line, so the only way for 359° to sit beside 0° is to write red down
/// twice.
const List<Color> _hueStops = <Color>[
  Color(0xFFFF0000),
  Color(0xFFFFFF00),
  Color(0xFF00FF00),
  Color(0xFF00FFFF),
  Color(0xFF0000FF),
  Color(0xFFFF00FF),
  Color(0xFFFF0000),
];

/// Where an uncontrolled picker starts, and where the panel stands when its
/// value is not a colour it can read.
const MPHsv _fallback = MPHsv(202, 100, 61);

/// A Material Design colour picker.
///
/// ```dart
/// MPColorPicker(
///   label: const Text('Tag colour'),
///   value: colour,
///   onChanged: (String next) => setState(() => colour = next),
/// )
/// ```
///
/// A saturation square with a hue rail beside it, the arrangement every design
/// tool has settled on, because it puts every colour of a hue within one
/// movement of the pointer. An opacity rail joins them with [alpha], a field
/// the value can be typed into sits under them unless [editable] is off, and a
/// row of [swatches] puts the colours a product actually uses one press away.
///
/// The trigger is the shell every field in the library is drawn on, with the
/// colour as a swatch before its written value. [inline] draws the panel in
/// the page with no trigger at all.
///
/// **The panel's state is HSV, and it never leaves.** That is what keeps the
/// hue rail still while the pointer is in the black corner: through RGB every
/// shade of black is the same colour, and the rail would jump to red the
/// moment the square bottomed out. An incoming [value] re-seeds it only when
/// it says something different, compared as colours rather than as strings.
///
/// Needs an [Overlay] above it unless [inline].
class MPColorPicker extends StatefulWidget {
  /// Creates a colour picker.
  const MPColorPicker({
    this.value,
    this.initialValue = '#00639b',
    this.onChanged,
    this.format = MPColorFormat.hex,
    this.alpha = false,
    this.swatches,
    this.inline = false,
    this.editable = true,
    this.label,
    this.floatingLabel = true,
    this.description,
    this.errorMessage,
    this.required = false,
    this.disabled = false,
    this.readOnly = false,
    this.clearable = false,
    this.name,
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.locale,
    this.labels,
    this.size,
    this.fullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    super.key,
  });

  /// The colour, as a CSS string, `''` for none. Given, the picker is
  /// controlled; left out, it keeps its own, starting at [initialValue].
  final String? value;

  /// Where a picker that keeps its own colour starts. The React build's
  /// `defaultValue`.
  final String initialValue;

  /// Called with the new colour, written in [format]. The React build's
  /// `onValueChange`.
  final ValueChanged<String>? onChanged;

  /// Which notation the value is written in on the way out.
  final MPColorFormat format;

  /// Offers an opacity rail, and lets the value carry a fourth channel.
  final bool alpha;

  /// The ready-made colours under the panel, as CSS strings. Left out, a plain
  /// spectrum and the greys; an empty list draws none. A string the picker
  /// cannot read is left out rather than drawn as a swatch that does nothing.
  final List<String>? swatches;

  /// Draws the panel in the page instead of in a popup, with no trigger.
  final bool inline;

  /// Whether the field under the panel the value can be typed into is there.
  final bool editable;

  /// The label, drawn in the outline's notch, or above the panel when
  /// [inline], which has no notch to draw it in. Usually a [Text].
  final Widget? label;

  /// Whether the label rests on the trigger's line while there is no colour,
  /// and rises on focus or on the first colour. The swatch comes down with it:
  /// it is the value drawn, and with no colour it would be an empty ring.
  /// Ignored when [inline].
  final bool floatingLabel;

  /// The line under the control. Replaced by [errorMessage] when there is one.
  final Widget? description;

  /// The message under the control. Its presence is also what puts the picker
  /// into its error state.
  final Widget? errorMessage;

  /// Marks the picker required, to a screen reader and with an asterisk on
  /// the label. Inside an `MPForm`, a required picker with no colour holds the
  /// submit back.
  final bool required;

  /// Greys the control out and stops it opening.
  final bool disabled;

  /// Shows the colour without allowing it to change, and stays focusable. The
  /// popup does not open.
  final bool readOnly;

  /// Offers the × that empties the control.
  final bool clearable;

  /// The name an `MPForm` files the value under, written in [format].
  final String? name;

  /// Whether the popup is open. Given, the popup is controlled.
  final bool? open;

  /// Whether the popup starts open, for one that is not controlled. The React
  /// build's `defaultOpen`.
  final bool initialOpen;

  /// Called when the picker wants the popup open or shut.
  final ValueChanged<bool>? onOpenChange;

  /// Which language the picker's own names are in: the rails, the square, the
  /// × and the word the trigger shows before a colour has been chosen. Falls
  /// back to the nearest `MPLocaleProvider`, then to the app's locale, then to
  /// English.
  final String? locale;

  /// Overrides for those words, by key: `area`, `hue`, `alpha`, `value`,
  /// `swatches`, `clear`, `empty`. They win over the translation.
  final Map<String, String>? labels;

  /// Which rung: the trigger's height, and the panel's width and the room in
  /// its square. [MPSize.md] unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Fills the width it is given.
  final bool fullWidth;

  /// The picker's name for a screen reader, for one with no visible [label].
  final String? semanticLabel;

  /// Drives the trigger's focus from outside.
  final FocusNode? focusNode;

  /// Takes the focus as it is inserted.
  final bool autofocus;

  @override
  State<MPColorPicker> createState() => _MPColorPickerState();
}

class _MPColorPickerState extends State<MPColorPicker> {
  late String _own = widget.initialValue;
  late MPColorValue _model = parseColor(_current) ?? const MPColorValue(_fallback, 1);
  late final TextEditingController _text = TextEditingController(text: _current);
  final FocusNode _textFocus = FocusNode(debugLabel: 'MPColorPicker value');
  final FocusNode _areaFocus = FocusNode(debugLabel: 'MPColorPicker area');
  FocusNode? _ownFocus;
  late bool _ownOpen = widget.initialOpen;

  late final MPFormFieldBinding _form = MPFormFieldBinding(
    read: () => _empty ? '' : _written,
    validate: () {
      if (widget.readOnly || !widget.required || !_empty) {
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

  FocusNode get _focusNode =>
      widget.focusNode ?? (_ownFocus ??= FocusNode(debugLabel: 'MPColorPicker'));

  String get _current => widget.value ?? _own;

  bool get _empty => _current.isEmpty;

  bool get _open => widget.open ?? _ownOpen;

  String get _written => formatColor(_model.hsv, widget.alpha ? _model.alpha : 1, widget.format);

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  bool get _inert => _disabled || widget.readOnly;

  @override
  void didUpdateWidget(MPColorPicker oldWidget) {
    super.didUpdateWidget(oldWidget);

    final String current = _current;
    final MPColorValue? parsed = parseColor(current);

    if (parsed == null) {
      // Not a colour this understands: `''` after a clear, or something a
      // caller made up. The field shows it and the panel stays where it was.
      if (_text.text != current && !_textFocus.hasFocus) {
        _text.text = current;
      }

      return;
    }

    // Compared as colours rather than as strings: `#FF0000` and `#ff0000` are
    // the same colour written twice, and a string comparison would re-seed the
    // model from a value it had just produced.
    if (formatColor(parsed.hsv, widget.alpha ? parsed.alpha : 1, widget.format) == _written) {
      return;
    }

    _model = parsed;

    if (!_textFocus.hasFocus) {
      _text.text = current;
    }
  }

  @override
  void dispose() {
    _text.dispose();
    _textFocus.dispose();
    _areaFocus.dispose();
    _ownFocus?.dispose();
    _form.dispose();
    super.dispose();
  }

  void _commit(MPColorValue next, {String? typed}) {
    final String output = formatColor(next.hsv, widget.alpha ? next.alpha : 1, widget.format);

    setState(() {
      _model = next;

      if (typed == null) {
        _text.text = output;
      }

      if (widget.value == null) {
        _own = output;
      }
    });

    _form.changed();
    widget.onChanged?.call(output);
  }

  void _clear() {
    setState(() {
      _text.text = '';

      if (widget.value == null) {
        _own = '';
      }
    });

    _form.changed();
    widget.onChanged?.call('');
  }

  void _onTyped(String next) {
    final MPColorValue? parsed = parseColor(next);

    if (parsed == null) {
      // Not a colour yet, which is most of what typing one looks like: the
      // field shows it and the panel stays where it was.
      setState(() {});

      return;
    }

    _commit(parsed, typed: next);
  }

  void _request(bool next) {
    if (next == _open || (next && _inert)) {
      return;
    }

    if (widget.open == null) {
      setState(() => _ownOpen = next);
    }

    widget.onOpenChange?.call(next);

    if (next) {
      // The panel is what the reader came for, so the focus goes into it as
      // it opens, as a popover's does: on its square, once the popup has been
      // built, which is a frame after it is asked for.
      WidgetsBinding.instance.addPostFrameCallback((Duration _) {
        WidgetsBinding.instance.addPostFrameCallback((Duration _) {
          if (mounted && _open) {
            _areaFocus.requestFocus();
          }
        });
      });
    }
  }

  /// Closes the popup, and hands the focus back to the trigger if it was in
  /// the panel, which is going away.
  void _close() {
    final bool inside = _areaFocus.hasFocus || _textFocus.hasFocus || _panelHasFocus;

    _request(false);

    if (inside) {
      _focusNode.requestFocus();
    }
  }

  bool _panelHasFocus = false;

  /// The focus moved within the panel or out of it. Out of it, and not back
  /// to the trigger, the popup closes, as a popover's does when Tab leaves it.
  void _onPanelFocus(bool has) {
    _panelHasFocus = has;

    if (has) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      if (mounted && _open && !_panelHasFocus && !_focusNode.hasFocus) {
        _request(false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = _size;
    final bool disabled = _disabled;
    final Map<String, String> words = mpMessagesOf(
      context,
      mpColorPickerMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );

    _form.bind(context, name: widget.name, disabled: disabled);

    final String? formError = _form.error;
    final Widget? error = widget.errorMessage ?? (formError == null ? null : Text(formError));
    final bool empty = _empty;

    final Widget panel = _ColorPanel(
      model: _model,
      onChanged: _commit,
      controller: _text,
      textFocus: _textFocus,
      areaFocus: _areaFocus,
      onTyped: _onTyped,
      withAlpha: widget.alpha,
      swatches: widget.swatches ?? defaultSwatches,
      editable: widget.editable,
      size: size,
      disabled: disabled,
      readOnly: widget.readOnly,
      words: words,
    );

    if (widget.inline) {
      return _inline(size, panel, error);
    }

    final Color shown = empty
        ? const Color(0x00000000)
        : hsvToColor(_model.hsv, widget.alpha ? _model.alpha : 1);

    return MPSelectTrigger(
      size: size,
      open: _open && !_inert,
      onPressed: () => _open ? _close() : _request(true),
      onDismiss: _close,
      // As wide as the panel, whatever the trigger is.
      anchorWidth: MPAnchorWidth.free,
      // The trigger closes its popup itself, and the × in it clears the value
      // while the popup is up.
      anchorInside: true,
      popup: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onFocusChange: _onPanelFocus,
        child: _popup(panel),
      ),
      display: empty ? null : Text(_written),
      placeholder: Text(words['empty']!),
      samples: <String>[
        _widest(widget.format, widget.alpha),
        words['empty']!,
        if (widget.floatingLabel) mpTextWithin(widget.label),
      ].where((String sample) => sample.isNotEmpty).toList(),
      label: widget.label,
      floatingLabel: widget.floatingLabel,
      description: widget.description,
      errorMessage: error,
      startIcon: _Preview(size: 20, color: shown),
      startIconPins: false,
      onClear: widget.clearable ? _clear : null,
      clearLabel: words['clear'],
      required: widget.required,
      disabled: disabled,
      readOnly: widget.readOnly,
      fullWidth: widget.fullWidth,
      semanticLabel: widget.semanticLabel,
      semanticValue: empty ? null : _written,
      focusNode: _focusNode,
      autofocus: widget.autofocus,
    );
  }

  Widget _popup(Widget panel) {
    final MPThemeData theme = MPTheme.of(context);

    return Container(
      padding: const EdgeInsets.all(_popupPad),
      decoration: BoxDecoration(
        color: theme.colors.surfaceContainer,
        borderRadius: BorderRadius.circular(theme.shapes.medium),
        boxShadow: MPShadows.of(2),
      ),
      child: DefaultTextStyle.merge(
        style: mpProseText(theme.typescale, _size).style(theme.colors.onSurface),
        child: panel,
      ),
    );
  }

  Widget _inline(MPSize size, Widget panel, Widget? error) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool disabled = _disabled;
    final TextStyle meta = theme.typescale.bodySmall.style(
      disabled
          ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
          : colors.onSurfaceVariant,
    );

    // One node over the whole of it, so the label, the description and the
    // error name the group the square and the rails sit in: they are called
    // "Hue" and "Opacity" whatever they are for, and two inline pickers would
    // otherwise be two sets of the same sliders.
    return Semantics(
      container: true,
      label: widget.semanticLabel,
      isRequired: widget.required ? true : null,
      validationResult: error != null
          ? SemanticsValidationResult.invalid
          : SemanticsValidationResult.none,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: mpStackGap[size]!,
        children: <Widget>[
          if (widget.label != null)
            ExcludeSemantics(
              excluding: widget.semanticLabel != null,
              child: DefaultTextStyle.merge(
                style: meta,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Flexible(child: widget.label!),
                    if (widget.required) const ExcludeSemantics(child: Text(' *')),
                  ],
                ),
              ),
            ),
          panel,
          if (error != null)
            DefaultTextStyle.merge(
              style: meta.copyWith(color: colors.error),
              child: error,
            )
          else if (widget.description != null)
            DefaultTextStyle.merge(style: meta, child: widget.description!),
        ],
      ),
    );
  }

  /// The widest string each notation can produce, so the trigger stops
  /// changing width with its value.
  static String _widest(MPColorFormat format, bool withAlpha) {
    switch (format) {
      case MPColorFormat.hex:
        return withAlpha ? '#ffffffff' : '#ffffff';
      case MPColorFormat.rgb:
        return withAlpha ? 'rgba(255, 255, 255, 0.55)' : 'rgb(255, 255, 255)';
      case MPColorFormat.hsl:
        return withAlpha ? 'hsla(360, 100%, 100%, 0.55)' : 'hsl(360, 100%, 100%)';
    }
  }
}

/// The chequerboard behind a translucent colour, in `outlineVariant`.
class _CheckerPainter extends CustomPainter {
  const _CheckerPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    const double tile = 4;
    final Paint paint = Paint()..color = color;

    for (double y = 0; y < size.height; y += tile) {
      for (double x = 0; x < size.width; x += tile) {
        if (((x / tile).floor() + (y / tile).floor()).isOdd) {
          canvas.drawRect(Rect.fromLTWH(x, y, tile, tile), paint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(_CheckerPainter oldDelegate) => oldDelegate.color != color;
}

/// The round sample on the trigger and beside the field: the colour over the
/// chequer, in a hairline.
class _Preview extends StatelessWidget {
  const _Preview({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final Color line = MPTheme.of(context).colors.outlineVariant;

    return ExcludeSemantics(
      child: SizedBox.square(
        dimension: size,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: line),
          ),
          child: ClipOval(
            child: CustomPaint(
              painter: _CheckerPainter(line),
              child: ColoredBox(color: color),
            ),
          ),
        ),
      ),
    );
  }
}

/// The square, the rails, the field and the swatches.
class _ColorPanel extends StatelessWidget {
  const _ColorPanel({
    required this.model,
    required this.onChanged,
    required this.controller,
    required this.textFocus,
    required this.areaFocus,
    required this.onTyped,
    required this.withAlpha,
    required this.swatches,
    required this.editable,
    required this.size,
    required this.disabled,
    required this.readOnly,
    required this.words,
  });

  final MPColorValue model;

  /// One callback for the colour and the opacity together: a swatch changes
  /// both, and two callbacks would build the second from the state the first
  /// had only just replaced.
  final void Function(MPColorValue next, {String? typed}) onChanged;
  final TextEditingController controller;
  final FocusNode textFocus;
  final FocusNode areaFocus;
  final ValueChanged<String> onTyped;
  final bool withAlpha;
  final List<String> swatches;
  final bool editable;
  final MPSize size;
  final bool disabled;
  final bool readOnly;
  final Map<String, String> words;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool inert = disabled || readOnly;
    final double thumb = _thumb[size]!;
    final double rail = _railHeight[size]!;
    final MPHsv hsv = model.hsv;
    final Color pure = hsvToColor(MPHsv(hsv.h, 100, 100));
    final Color solid = hsvToColor(hsv);
    final bool directional = mpArrowsMoveFocus(context);
    final List<(String, MPColorValue)> readable = <(String, MPColorValue)>[
      for (final String swatch in swatches)
        if (parseColor(swatch) case final MPColorValue parsed) (swatch, parsed),
    ];
    final String current = formatColor(hsv, model.alpha, MPColorFormat.hex);

    double clampPercent(double value) => value < 0 ? 0 : (value > 100 ? 100 : value);

    return SizedBox(
      width: _panelWidth[size],
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: _panelGap[size]!,
        children: <Widget>[
          _Track(
            focusNode: areaFocus,
            label: words['area']!,
            valueText: '${hsv.s.round()}%, ${hsv.v.round()}%',
            increasedValue: '${clampPercent(hsv.s + 1).round()}%, ${hsv.v.round()}%',
            decreasedValue: '${clampPercent(hsv.s - 1).round()}%, ${hsv.v.round()}%',
            inert: inert,
            height: _areaHeight[size]!,
            borderRadius: BorderRadius.circular(theme.shapes.small),
            cursor: SystemMouseCursors.precise,
            onFraction: (double x, double y) =>
                onChanged(MPColorValue(MPHsv(hsv.h, x * 100, (1 - y) * 100), model.alpha)),
            onNudge: (int dx, int dy) {
              final double s = clampPercent(hsv.s + dx);
              final double v = clampPercent(hsv.v + dy);
              final bool moved = s != hsv.s || v != hsv.v;

              if (moved) {
                onChanged(MPColorValue(MPHsv(hsv.h, s, v), model.alpha));
              }

              return moved;
            },
            // White across, then black up over it: the brightness ramp has to
            // be on top, or the bottom of the square never reaches black.
            layers: <Widget>[
              Positioned.fill(child: ColoredBox(color: pure)),
              const Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: <Color>[Color(0xFFFFFFFF), Color(0x00FFFFFF)]),
                  ),
                ),
              ),
              const Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: <Color>[Color(0xFF000000), Color(0x00000000)],
                    ),
                  ),
                ),
              ),
            ],
            thumb: _Thumb(size: thumb, color: solid),
            thumbX: hsv.s / 100,
            thumbY: 1 - hsv.v / 100,
          ),
          _Track(
            label: words['hue']!,
            valueText: '${hsv.h.round()}',
            increasedValue: '${((hsv.h + 2) % 360).round()}',
            decreasedValue: '${((hsv.h - 2 + 360) % 360).round()}',
            inert: inert,
            height: rail,
            borderRadius: BorderRadius.circular(rail / 2),
            rail: true,
            onFraction: (double x, double y) =>
                onChanged(MPColorValue(hsv.copyWith(h: x * 360), model.alpha)),
            // The wheel is a circle, so a step past either end goes round,
            // except under directional navigation, where the arrows are how a
            // remote moves on and a rail that went round would never let go.
            onNudge: (int dx, int dy) {
              final double step = hsv.h + (dx + dy) * 2;
              final double hue = directional
                  ? (step < 0 ? 0 : (step > 360 ? 360 : step))
                  : (step % 360 + 360) % 360;

              if (hue != hsv.h) {
                onChanged(MPColorValue(hsv.copyWith(h: hue), model.alpha));
              }

              return hue != hsv.h;
            },
            onJump: (bool end) =>
                onChanged(MPColorValue(hsv.copyWith(h: end ? 360 : 0), model.alpha)),
            layers: const <Widget>[
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(gradient: LinearGradient(colors: _hueStops)),
                ),
              ),
            ],
            thumb: _Thumb(size: thumb, color: pure),
            thumbX: hsv.h / 360,
            thumbY: 0.5,
          ),
          if (withAlpha)
            _Track(
              label: words['alpha']!,
              valueText: '${(model.alpha * 100).round()}',
              increasedValue: '${clampPercent(model.alpha * 100 + 1).round()}',
              decreasedValue: '${clampPercent(model.alpha * 100 - 1).round()}',
              inert: inert,
              height: rail,
              borderRadius: BorderRadius.circular(rail / 2),
              rail: true,
              onFraction: (double x, double y) => onChanged(MPColorValue(hsv, x)),
              onNudge: (int dx, int dy) {
                final double next = clampPercent(model.alpha * 100 + dx + dy) / 100;

                if (next != model.alpha) {
                  onChanged(MPColorValue(hsv, next));
                }

                return next != model.alpha;
              },
              onJump: (bool end) => onChanged(MPColorValue(hsv, end ? 1 : 0)),
              // The ramp is a layer over the chequer rather than one more
              // decoration on the same box, since one would tile the other.
              layers: <Widget>[
                Positioned.fill(
                  child: CustomPaint(painter: _CheckerPainter(colors.outlineVariant)),
                ),
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: <Color>[hsvToColor(hsv, 0), solid]),
                    ),
                  ),
                ),
              ],
              thumb: _Thumb(size: thumb, color: hsvToColor(hsv, model.alpha)),
              thumbX: model.alpha,
              thumbY: 0.5,
            ),
          if (editable)
            Row(
              spacing: _panelGap[size]!,
              children: <Widget>[
                _Preview(size: thumb + 8, color: hsvToColor(hsv, model.alpha)),
                Expanded(
                  child: _ValueField(
                    controller: controller,
                    focusNode: textFocus,
                    onChanged: onTyped,
                    label: words['value']!,
                    disabled: disabled,
                    readOnly: readOnly,
                  ),
                ),
              ],
            ),
          if (readable.isNotEmpty)
            Semantics(
              container: true,
              label: words['swatches'],
              explicitChildNodes: true,
              child: LayoutBuilder(
                builder: (BuildContext context, BoxConstraints constraints) {
                  // Eight to a row, `grid-cols-8 gap-1`.
                  final double side = (constraints.maxWidth - _swatchGap * 7) / 8;

                  return Wrap(
                    spacing: _swatchGap,
                    runSpacing: _swatchGap,
                    children: <Widget>[
                      for (final (String swatch, MPColorValue parsed) in readable)
                        _Swatch(
                          swatch: swatch,
                          parsed: parsed,
                          size: side,
                          chosen:
                              formatColor(parsed.hsv, parsed.alpha, MPColorFormat.hex) == current,
                          inert: inert,
                          onPressed: () => onChanged(parsed),
                        ),
                    ],
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

/// The thumb: a white ring that survives on white and on black.
class _Thumb extends StatelessWidget {
  const _Thumb({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFFFFFFF), width: 2),
        // A dark hairline so the white ring survives on white, and a soft drop
        // so it survives on black. Neither is tinted with the colour under it,
        // which would make the thumb disappear at exactly the moment it
        // matters.
        boxShadow: const <BoxShadow>[
          BoxShadow(color: Color(0x59000000), spreadRadius: 1),
          BoxShadow(color: Color(0x66000000), blurRadius: 3, offset: Offset(0, 1)),
        ],
      ),
    );
  }
}

/// A square or a rail: something a pointer aims at and the arrow keys walk.
///
/// A pointer sets the value where it lands and follows a drag off the edge;
/// the arrows step it by one, ten with Shift; a rail also answers Home and
/// End. It is a slider to a screen reader, with what a step up and a step down
/// would make it.
class _Track extends StatefulWidget {
  const _Track({
    required this.label,
    required this.valueText,
    required this.increasedValue,
    required this.decreasedValue,
    required this.inert,
    required this.height,
    required this.borderRadius,
    required this.onFraction,
    required this.onNudge,
    required this.layers,
    required this.thumb,
    required this.thumbX,
    required this.thumbY,
    this.rail = false,
    this.onJump,
    this.focusNode,
    this.cursor = SystemMouseCursors.click,
  });

  final String label;
  final String valueText;
  final String increasedValue;
  final String decreasedValue;
  final bool inert;
  final double height;
  final BorderRadius borderRadius;
  final void Function(double x, double y) onFraction;

  /// Moves the value by an arrow key's step on each axis, and says whether it
  /// moved.
  final bool Function(int dx, int dy) onNudge;
  final ValueChanged<bool>? onJump;
  final List<Widget> layers;
  final _Thumb thumb;
  final double thumbX;
  final double thumbY;

  /// A rail lies across and has one axis; the square has two.
  final bool rail;
  final FocusNode? focusNode;
  final MouseCursor cursor;

  @override
  State<_Track> createState() => _TrackState();
}

class _TrackState extends State<_Track> {
  final GlobalKey _box = GlobalKey();
  FocusNode? _ownNode;
  bool _focused = false;

  FocusNode get _node =>
      widget.focusNode ?? (_ownNode ??= FocusNode(debugLabel: 'MPColorPicker track'));

  @override
  void dispose() {
    _ownNode?.dispose();
    super.dispose();
  }

  void _at(Offset global) {
    if (widget.inert) {
      return;
    }

    final RenderBox? box = _box.currentContext?.findRenderObject() as RenderBox?;

    if (box == null || box.size.isEmpty) {
      return;
    }

    final Offset local = box.globalToLocal(global);

    widget.onFraction(
      (local.dx / box.size.width).clamp(0, 1).toDouble(),
      (local.dy / box.size.height).clamp(0, 1).toDouble(),
    );
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (widget.inert || (event is! KeyDownEvent && event is! KeyRepeatEvent)) {
      return KeyEventResult.ignored;
    }

    final LogicalKeyboardKey key = event.logicalKey;
    final int step = HardwareKeyboard.instance.isShiftPressed ? 10 : 1;

    if ((key == LogicalKeyboardKey.home || key == LogicalKeyboardKey.end) &&
        widget.onJump != null) {
      widget.onJump!(key == LogicalKeyboardKey.end);

      return KeyEventResult.handled;
    }

    final Axis? axis = mpArrowAxis(key);

    if (axis == null) {
      return KeyEventResult.ignored;
    }

    // Up and down cross a rail, and under directional navigation go on to the
    // focus system there, having moved nothing.
    if (widget.rail && mpArrowAcross(context, axis: Axis.horizontal, arrow: axis)) {
      return KeyEventResult.ignored;
    }

    // The square and the rails are colour spaces rather than sentences, so
    // right is more in either direction, as the React build has it.
    final int dx = key == LogicalKeyboardKey.arrowRight
        ? step
        : key == LogicalKeyboardKey.arrowLeft
        ? -step
        : 0;
    final int dy = key == LogicalKeyboardKey.arrowUp
        ? step
        : key == LogicalKeyboardKey.arrowDown
        ? -step
        : 0;

    return mpArrowResult(context, moved: widget.onNudge(dx, dy));
  }

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool ringed =
        _focused && FocusManager.instance.highlightMode == FocusHighlightMode.traditional;

    Widget track = LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double thumb = widget.thumb.size;

        return Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            ...widget.layers,
            Positioned(
              left: constraints.maxWidth * widget.thumbX - thumb / 2,
              top: constraints.maxHeight * widget.thumbY - thumb / 2,
              child: IgnorePointer(child: widget.thumb),
            ),
          ],
        );
      },
    );

    track = ClipRRect(key: _box, borderRadius: widget.borderRadius, child: track);

    track = Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: widget.borderRadius,
        border: Border.all(color: colors.outlineVariant),
      ),
      child: track,
    );

    track = MouseRegion(
      cursor: widget.inert ? SystemMouseCursors.basic : widget.cursor,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTapDown: (TapDownDetails details) {
          _node.requestFocus();
          _at(details.globalPosition);
        },
        onPanStart: (DragStartDetails details) => _at(details.globalPosition),
        onPanUpdate: (DragUpdateDetails details) => _at(details.globalPosition),
        child: track,
      ),
    );

    track = Focus(
      focusNode: _node,
      canRequestFocus: !widget.inert,
      includeSemantics: false,
      onFocusChange: (bool focused) => setState(() => _focused = focused),
      onKeyEvent: _onKey,
      child: CustomPaint(
        foregroundPainter: ringed
            ? MPFocusRingPainter(color: colors.secondary, borderRadius: widget.borderRadius)
            : null,
        child: track,
      ),
    );

    return Semantics(
      container: true,
      slider: true,
      enabled: !widget.inert,
      focused: widget.inert ? null : _focused,
      onFocus: widget.inert ? null : _node.requestFocus,
      label: widget.label,
      value: widget.valueText,
      increasedValue: widget.increasedValue,
      decreasedValue: widget.decreasedValue,
      onIncrease: widget.inert ? null : () => widget.onNudge(1, 0),
      onDecrease: widget.inert ? null : () => widget.onNudge(-1, 0),
      child: track,
    );
  }
}

/// The field the value can be typed into: a hairline box, `bodySmall` in a
/// monospaced face, `primary` round it while it has the focus.
class _ValueField extends StatefulWidget {
  const _ValueField({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.label,
    required this.disabled,
    required this.readOnly,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final String label;
  final bool disabled;
  final bool readOnly;

  @override
  State<_ValueField> createState() => _ValueFieldState();
}

class _ValueFieldState extends State<_ValueField> {
  final GlobalKey<EditableTextState> _editor = GlobalKey<EditableTextState>();

  @override
  void initState() {
    super.initState();
    widget.focusNode.addListener(_onFocus);
  }

  @override
  void dispose() {
    widget.focusNode.removeListener(_onFocus);
    super.dispose();
  }

  void _onFocus() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final bool disabled = widget.disabled;
    final bool focused = widget.focusNode.hasFocus;
    final TextStyle style = theme.typescale.bodySmall
        .style(MPFieldPaint.value(colors, disabled: disabled))
        .copyWith(fontFamily: 'monospace', fontFamilyFallback: const <String>['Menlo', 'Consolas']);

    Widget editor = EditableText(
      key: _editor,
      controller: widget.controller,
      focusNode: widget.focusNode,
      readOnly: widget.readOnly || disabled,
      onChanged: widget.onChanged,
      maxLines: 1,
      style: style,
      cursorColor: MPFieldPaint.caret(colors),
      backgroundCursorColor: colors.onSurfaceVariant,
      selectionColor: MPFieldPaint.selection(colors),
      showSelectionHandles: false,
      enableInteractiveSelection: !disabled,
      autocorrect: false,
      enableSuggestions: false,
      stylusHandwritingEnabled: !disabled,
      autofillHints: disabled ? null : const <String>[],
    );

    editor = ExcludeFocus(excluding: disabled, child: editor);

    return MouseRegion(
      cursor: disabled ? MouseCursor.defer : SystemMouseCursors.text,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: disabled ? null : () => mpTapEditor(_editor),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(theme.shapes.extraSmall),
            border: Border.all(
              color: focused && !disabled
                  ? colors.primary
                  : disabled
                  ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer)
                  : colors.outline,
            ),
          ),
          child: Semantics(
            container: true,
            enabled: !disabled,
            label: widget.label,
            onTap: disabled || widget.readOnly ? null : () => mpTapEditor(_editor),
            onFocus: disabled ? null : () => mpFocusEditor(_editor),
            child: MPEditorPress(
              onPress: disabled ? null : () => mpTapEditor(_editor),
              child: MPEditorArrows(editor: _editor, child: editor),
            ),
          ),
        ),
      ),
    );
  }
}

/// One ready-made colour: a focus stop and a key to press, named by the
/// colour as the caller wrote it.
class _Swatch extends StatelessWidget {
  const _Swatch({
    required this.swatch,
    required this.parsed,
    required this.size,
    required this.chosen,
    required this.inert,
    required this.onPressed,
  });

  final String swatch;
  final MPColorValue parsed;
  final double size;
  final bool chosen;
  final bool inert;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final Duration duration = reduceMotion ? Duration.zero : MPMotion.short4;
    final BorderRadius round = BorderRadius.circular(size / 2);

    return MPInteractive(
      onTap: onPressed,
      enabled: !inert,
      interactive: !inert,
      cursor: inert ? SystemMouseCursors.basic : SystemMouseCursors.click,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          selected: chosen,
          enabled: !inert,
          label: swatch,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: inert ? null : onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: round)
                : null,
            child: AnimatedContainer(
              duration: duration,
              curve: MPMotion.standard,
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: hsvToColor(parsed.hsv, parsed.alpha),
                shape: BoxShape.circle,
                border: Border.all(color: colors.outlineVariant),
                // A hovered swatch lifts to elevation 1 over the same 200ms.
                boxShadow: state.hovered ? MPShadows.of(1) : const <BoxShadow>[],
              ),
              // The tick fades between swatches rather than jumping: choosing a
              // swatch does not change the swatch, so the mark moving is the
              // whole of the feedback. Black or white, whichever can be read on
              // it; a fixed white tick vanishes on yellow.
              child: Center(
                child: AnimatedOpacity(
                  opacity: chosen ? 1 : 0,
                  duration: duration,
                  curve: MPMotion.standard,
                  child: MPGlyph(MPGlyphShape.check, size: 12, color: readableInk(parsed.hsv)),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
