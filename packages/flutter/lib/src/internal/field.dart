/// The Material outlined field: the shell every control that holds a typed or
/// chosen value is drawn in.
///
/// `MPTextField` and `MPNumberField` are built on it, and so are the select,
/// the combobox, the date and time pickers, the colour picker, the file picker,
/// the tree select and the transfer list. A form where the quantity box, the
/// dropdown and the date field are a different height, radius or outline weight
/// from the text field beside them is a form that looks assembled rather than
/// designed, so the shell is one widget and the controls differ only in what
/// they put inside it. It is the React package's `FieldOutline.tsx`,
/// `SupportingText.tsx` and the shell geometry its components repeat.
///
/// None of it is exported from `material_plus_ui.dart`.
///
/// ## Building a control on it
///
/// ```dart
/// MPFieldShell(
///   size: size,
///   label: label == null ? null : Text(label),
///   required: required,
///   floating: floatingLabel,        // false pins the label in the notch
///   filled: text.isNotEmpty,        // a filled control keeps its label up
///   pinned: startIcon != null,      // anything standing where it would rest
///   invalid: errorMessage != null,
///   disabled: disabled,
///   onTap: focusTheControl,         // a press on the padding
///   builder: (BuildContext context, MPFieldStatus status) {
///     // `status.shrunk` says whether the label is up, which is when a
///     // placeholder may show; `status.focused` and `status.hovered` are
///     // there for anything else that answers them.
///     return Padding(
///       padding: EdgeInsets.symmetric(horizontal: MPFieldMetrics.of(size).padX),
///       child: Row(children: <Widget>[
///         if (startIcon != null)
///           MPFieldAdornment(size: size, disabled: disabled, child: startIcon),
///         Expanded(child: control),
///       ]),
///     );
///   },
/// )
/// ```
///
/// and under it, in a [Column]:
///
/// ```dart
/// MPSupportingText(
///   description: description,
///   errorMessage: errorMessage,
///   disabled: disabled,
///   padding: EdgeInsetsDirectional.symmetric(horizontal: MPFieldMetrics.of(size).padX),
/// )
/// ```
///
/// The whole field, shell and supporting text, goes in one
/// `Semantics(container: true, ...)` of the control's own: the label and the
/// supporting text merge into that node, so a screen reader reads the name, the
/// value and the message as one stop. What the control puts on the node (a
/// `textField` from an `EditableText`, a `button` for a trigger, `isRequired`,
/// a `validationResult`) is the control's to say.
///
/// ## What is here
///
/// - [MPFieldMetrics]: the geometry of one rung: height, inline padding, the
///   label's inset, the adornment glyph, the gap, the width a field that is
///   not `fullWidth` is laid out at.
/// - [MPFieldPaint]: the colours of the outline, the label, the value, the
///   muted parts (placeholder, adornments), the caret and the selection, per
///   state. Every part of a field reads its ink here, so the states agree.
/// - [MPFieldShell]: the outline, the notch cut for the label, and the label
///   moving between resting on the control's line and sitting in the notch. It
///   tracks hover and focus-within itself and hands both, with whether the
///   label is up, to its builder.
/// - [MPFieldAdornment]: a start or end adornment's ink, glyph size and type.
/// - [MPFieldIconButton]: the round button a field carries at its end: a
///   password toggle, a clear ×, a stepper.
/// - [MPSupportingText]: the line under the control, the description or the
///   error, which opens rather than appearing, and which an `MPConfigProvider`
///   can ask to keep open.
/// - [MPFieldText]: a [TextEditingController] kept in step with a value a
///   parent owns, except while an input method is composing, which is what
///   makes a controlled field safe for Korean, Japanese and Chinese.
/// - [MPWidthSizer]: holds a control open at the width of the widest thing it
///   could ever say, so a picker on the 1st is not narrower than on the 28th.
///
/// `internal/field_form.dart` is the other half: how a field takes part in an
/// `MPForm` (its name, its value, its `required`, the errors the form hands
/// back). It is also what stands in for the React shell's `FieldValue.tsx`: a
/// field whose control is a button registers with the form through the same
/// binding a text field does, so a required picker holds a submit back and its
/// value is handed over with the rest. `internal/editor.dart` has what a press
/// and a screen reader do to an `EditableText` inside a field.
///
/// ## A trigger rather than an editor
///
/// A select or a picker puts a button in the row instead of an editor. Give the
/// shell `cursor: SystemMouseCursors.click`, `pinned: open` so the label stays
/// up while the focus is in the popup, and an `onTap` that opens it. Put the
/// value and an [MPWidthSizer] in a [Column] where the editor would be, an
/// adornment with `apart: false` (it is part of the button's name), and a clear
/// × as an [MPFieldIconButton] 32 square with [MPFieldMetrics.icon] for its
/// glyph. The shell's label is read before the value whatever order the row
/// is in.
library;

import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' show ClipOp, lerpDouble;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// The geometry of a field at one rung of the size ladder.
///
/// The React shell's `SIZES`/`SHELL` tables in numbers. The heights are the
/// library's control ladder, 32 to 72, so a field and a button of the same size
/// sit on one line.
@immutable
class MPFieldMetrics {
  const MPFieldMetrics._({required this.size, required this.padX, required this.multilineRest});

  static const Map<MPSize, MPFieldMetrics> _ladder = <MPSize, MPFieldMetrics>{
    MPSize.xs: MPFieldMetrics._(size: MPSize.xs, padX: 8, multilineRest: 18),
    MPSize.sm: MPFieldMetrics._(size: MPSize.sm, padX: 12, multilineRest: 18),
    MPSize.md: MPFieldMetrics._(size: MPSize.md, padX: 16, multilineRest: 20),
    MPSize.lg: MPFieldMetrics._(size: MPSize.lg, padX: 16, multilineRest: 20),
    MPSize.xl: MPFieldMetrics._(size: MPSize.xl, padX: 20, multilineRest: 20),
  };

  /// The metrics of [size].
  static MPFieldMetrics of(MPSize size) => _ladder[size]!;

  /// The rung these are for.
  final MPSize size;

  /// The control's inline padding: `px-2`, `px-3`, `px-4`, `px-4`, `px-5`.
  final double padX;

  /// Where a resting label's middle sits in a multiline control, measured from
  /// its top edge: the row's 8px of block padding plus half a line. A textarea
  /// has no fixed height, so centring the label in the box would drop it into
  /// the middle of six rows while the caret sat on the first.
  final double multilineRest;

  /// The air either side of the label, which the notch cut includes: `px-1`.
  static const double labelPad = 4;

  /// The gap between the parts of a control's row: an adornment, the value, a
  /// trailing button. `gap-2`.
  static const double gap = 8;

  /// The block padding of a multiline control's row, `py-2`, which is what a
  /// textarea is measured from instead of a fixed height.
  static const double multilinePadY = 8;

  /// The control's height, which a single-line field is drawn at exactly.
  double get height => mpControlHeight[size]!;

  /// Where the label's box starts from the control's start edge: the inline
  /// padding less [labelPad], so the label's first letter lands over the first
  /// letter of the value. The same in both of the label's places: it rises, it
  /// does not also slide.
  double get labelInset => padX - labelPad;

  /// The glyph in an adornment or a trailing button: 16, 18, 20, 22, 24.
  double get icon => mpControlIcon[size]!;

  /// The width the value is laid out at in a field that is not `fullWidth`:
  /// about twenty characters, which is what a browser gives an `<input>` with
  /// no width of its own.
  ///
  /// A fixed width rather than the width of the text, because a field that
  /// grew as it was typed into would move everything beside it on every key.
  double get controlWidth => (size == MPSize.xs || size == MPSize.sm ? 14 : 16) * 11;

  /// The type the value, the placeholder and a resting label are set in:
  /// `bodyMedium` on the two small rungs, `bodyLarge` from `md` up.
  MPTypeRole text(MPTypescale typescale) => mpProseText(typescale, size);
}

/// The colours a field is drawn in, per state.
///
/// MD3's outlined text field tokens, as the React shell spells them: `outline`
/// at rest, `onSurface` under the pointer, `primary` at two pixels on focus,
/// `error` while there is a message, and the specification's disabled
/// opacities. Every control on the shell reads its ink here, so a select and a
/// text field side by side turn the same colour for the same reason.
abstract final class MPFieldPaint {
  /// The outline's colour.
  ///
  /// Disabled wins, then the error, then focus, then the pointer: an invalid
  /// field that has the focus is still invalid, and says so in the colour while
  /// the width says where the keyboard is.
  static Color outline(
    MPColorScheme colors, {
    bool hovered = false,
    bool focused = false,
    bool invalid = false,
    bool disabled = false,
  }) {
    if (disabled) {
      return colors.onSurface.withValues(alpha: MPStateOpacity.disabledContainer);
    }

    if (invalid) {
      return colors.error;
    }

    if (focused) {
      return colors.primary;
    }

    return hovered ? colors.onSurface : colors.outline;
  }

  /// The outline's width: two pixels while the field has the focus, one
  /// otherwise.
  ///
  /// It snaps rather than eases. A 1-to-2 pixel interpolation is rounded to
  /// whole device pixels at paint, so it would draw one pixel for almost the
  /// whole transition and then jump: the ring would seem to arrive a fifth of a
  /// second after the click.
  static double outlineWidth({bool focused = false, bool disabled = false}) {
    return focused && !disabled ? 2 : 1;
  }

  /// The label's colour, in the notch or resting.
  static Color label(
    MPColorScheme colors, {
    bool focused = false,
    bool invalid = false,
    bool disabled = false,
  }) {
    if (disabled) {
      return colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent);
    }

    if (invalid) {
      return colors.error;
    }

    return focused ? colors.primary : colors.onSurfaceVariant;
  }

  /// The value's colour: `onSurface`, or 38% of it while disabled.
  static Color value(MPColorScheme colors, {bool disabled = false}) {
    return disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurface;
  }

  /// The muted parts: a placeholder, an adornment, a trailing glyph.
  static Color muted(MPColorScheme colors, {bool disabled = false}) {
    return disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : colors.onSurfaceVariant;
  }

  /// The caret: `primary`, the React field's `caret-mp-primary`.
  static Color caret(MPColorScheme colors) => colors.primary;

  /// The selection behind chosen text.
  static Color selection(MPColorScheme colors) => colors.primary.withValues(alpha: 0.4);
}

/// What a field's builder is told about the shell around it.
@immutable
class MPFieldStatus {
  /// Creates a status.
  const MPFieldStatus({required this.shrunk, required this.focused, required this.hovered});

  /// Whether the label is up in the notch rather than resting on the
  /// control's line. A placeholder is withheld while it is not: two greyed
  /// strings in one box is not a hint, it is a collision.
  final bool shrunk;

  /// Whether anything inside the shell has the focus: the control, or a button
  /// beside it, which a reader on the keyboard is still in the field for.
  final bool focused;

  /// Whether the pointer is over the shell.
  final bool hovered;
}

/// Builds a control's row from the state of the shell around it.
typedef MPFieldBuilder = Widget Function(BuildContext context, MPFieldStatus status);

/// The notched outline and the floating label around a control's row.
///
/// The label is in one of two places. Up in the notch, *shrunk*, at
/// `bodySmall`, sitting on the outline's top edge with the line cut away behind
/// it. Or resting on the control's own line, at the control's own type size,
/// where it reads as the placeholder. It travels from the second to the first
/// the moment there is something to make room for: focus, content, or anything
/// [pinned] that already stands where it would rest. The colour, the place and
/// the size ease together on `short4`, the outline's colour eases with them, and
/// the outline's width snaps.
///
/// The shell is decorative to a screen reader apart from the label, which
/// merges into whatever node the control puts round the field and is read
/// before anything in the row. The asterisk of [required] is left out of it:
/// the control says it is required on its own node.
///
/// Nothing in the shell takes a press. The label is under the pointer while it
/// rests over the text and a press on it has to reach the control; the outline
/// is a drawing. A press on the row's padding goes to [onTap].
class MPFieldShell extends StatefulWidget {
  /// Creates a shell of [size] round the row [builder] draws.
  const MPFieldShell({
    required this.size,
    required this.builder,
    this.label,
    this.required = false,
    this.floating = true,
    this.filled = false,
    this.pinned = false,
    this.invalid = false,
    this.disabled = false,
    this.multiline = false,
    this.focused,
    this.cursor = MouseCursor.defer,
    this.onTap,
    super.key,
  });

  /// Which rung: the height, the padding the label is inset by, and the size a
  /// resting label is set at.
  final MPSize size;

  /// Draws the control's row: its padding, its adornments and the control.
  ///
  /// Called again as the label moves, the focus arrives or the pointer comes
  /// in, so what it returns has to keep the same shape in every state, or an
  /// `EditableText` inside it is built again from scratch and loses its
  /// connection to the keyboard.
  final MPFieldBuilder builder;

  /// The label, which is what cuts the notch. Usually a [Text]. Without one the
  /// outline is closed.
  final Widget? label;

  /// Adds the asterisk after the label, kept off the semantics tree.
  final bool required;

  /// Whether the label may rest on the control's line. `false` pins it in the
  /// notch.
  final bool floating;

  /// Whether the control holds anything. A filled control keeps its label up.
  final bool filled;

  /// Anything else that holds the label up: a start adornment standing where it
  /// would rest, or a popup the focus has moved into.
  final bool pinned;

  /// Draws the outline and the label in `error`.
  final bool invalid;

  /// Draws the outline and the label at the specification's disabled
  /// opacities.
  final bool disabled;

  /// Whether the row is a multiline control, which rests its label on the
  /// first line rather than in the middle and is not held at the control
  /// height.
  final bool multiline;

  /// Whether the field counts as focused, for a control whose focus lives
  /// outside the shell. Left out, the shell says it is focused whenever
  /// anything inside it has the focus.
  final bool? focused;

  /// The cursor over the shell: [SystemMouseCursors.text] for a field typed
  /// into, [SystemMouseCursors.click] for a trigger. Left to what is under it
  /// by default.
  final MouseCursor cursor;

  /// A press on the shell that nothing inside it took: on the row's padding,
  /// or on a resting label. A text field puts the caret in the control.
  final VoidCallback? onTap;

  @override
  State<MPFieldShell> createState() => _MPFieldShellState();
}

class _MPFieldShellState extends State<MPFieldShell> with SingleTickerProviderStateMixin {
  bool _focusWithin = false;
  bool _hovered = false;

  /// How far the label has risen: `0` resting on the control's line, `1` in
  /// the notch.
  late final AnimationController _rise;

  /// The label's width, written as it is laid out and read as the outline is
  /// painted, which happens after every layout in the same frame. A rebuild
  /// would be a frame late, and the notch would be the wrong width until it
  /// arrived.
  final ValueNotifier<double> _gap = ValueNotifier<double>(0);

  bool get _focused => widget.focused ?? _focusWithin;

  bool get _shrunk =>
      widget.label == null || !widget.floating || widget.filled || widget.pinned || _focused;

  bool get _reduceMotion => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  @override
  void initState() {
    super.initState();
    _rise = AnimationController(vsync: this, value: _shrunk ? 1 : 0);
  }

  @override
  void didUpdateWidget(MPFieldShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    _settle();
  }

  @override
  void dispose() {
    _rise.dispose();
    _gap.dispose();
    super.dispose();
  }

  /// Sends the label where the state says it belongs.
  void _settle() {
    final double target = _shrunk ? 1 : 0;

    if (_rise.value == target && !_rise.isAnimating) {
      return;
    }

    if (_reduceMotion) {
      _rise.value = target;

      return;
    }

    _rise.animateTo(target, duration: MPMotion.short4, curve: MPMotion.standard);
  }

  void _onFocusChange(bool focused) {
    if (_focusWithin == focused) {
      return;
    }

    setState(() => _focusWithin = focused);
    _settle();
  }

  void _setHovered(bool hovered) {
    if (_hovered != hovered) {
      setState(() => _hovered = hovered);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPFieldMetrics metrics = MPFieldMetrics.of(widget.size);
    final bool focused = _focused;
    final Duration duration = _reduceMotion ? Duration.zero : MPMotion.short4;
    final TextDirection direction = Directionality.maybeOf(context) ?? TextDirection.ltr;
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);

    Widget row = widget.builder(
      context,
      MPFieldStatus(shrunk: _shrunk, focused: focused, hovered: _hovered),
    );

    // A single-line control is the rung's height; a multiline one is measured
    // from its rows, which is the whole reason it is not given one.
    if (!widget.multiline) {
      row = ConstrainedBox(
        constraints: BoxConstraints(minHeight: metrics.height),
        child: row,
      );
    }

    final Widget outline = Positioned.fill(
      child: IgnorePointer(
        child: TweenAnimationBuilder<Color?>(
          tween: ColorTween(
            end: MPFieldPaint.outline(
              colors,
              hovered: _hovered,
              focused: focused,
              invalid: widget.invalid,
              disabled: widget.disabled,
            ),
          ),
          duration: duration,
          curve: MPMotion.standard,
          builder: (BuildContext context, Color? color, Widget? child) {
            return CustomPaint(
              painter: _OutlinePainter(
                color: color!,
                width: MPFieldPaint.outlineWidth(focused: focused, disabled: widget.disabled),
                borderRadius: radius,
                gap: widget.label == null ? null : _gap,
                rise: _rise,
                inset: metrics.labelInset,
                textDirection: direction,
              ),
            );
          },
        ),
      ),
    );

    Widget shell = _LabelFirst(
      clipBehavior: Clip.none,
      children: <Widget>[
        row,
        outline,
        if (widget.label != null)
          Positioned.fill(
            child: IgnorePointer(
              child: _label(theme, metrics, duration: duration, focused: focused),
            ),
          ),
      ],
    );

    shell = Focus(
      // Only listens: the shell is not a stop, and has nothing to say.
      canRequestFocus: false,
      skipTraversal: true,
      includeSemantics: false,
      onFocusChange: _onFocusChange,
      child: shell,
    );

    shell = MouseRegion(
      cursor: widget.cursor,
      onEnter: (PointerEnterEvent event) => _setHovered(true),
      onExit: (PointerExitEvent event) => _setHovered(false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: widget.onTap,
        child: shell,
      ),
    );

    // The shell is part of the field for a press, as the editor in it is: a
    // mouse press on the padding, on an adornment or on a trailing button keeps
    // the focus in the field rather than counting as a press outside it, which
    // would take the focus away for the shell's own press to bring it back.
    return TextFieldTapRegion(child: shell);
  }

  Widget _label(
    MPThemeData theme,
    MPFieldMetrics metrics, {
    required Duration duration,
    required bool focused,
  }) {
    final MPColorScheme colors = theme.colors;
    // `leading-none`: the line box is the font size and nothing else, which is
    // what makes half of it the right lift to centre the label on the edge.
    final TextStyle resting = metrics.text(theme.typescale).style().copyWith(height: 1);
    final TextStyle shrunk = theme.typescale.bodySmall.style().copyWith(height: 1);

    Widget content = widget.label!;

    if (widget.required) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Flexible(child: content),
          // The control says it is required on its own node, so a screen
          // reader that read this as well would say "required star".
          const ExcludeSemantics(child: Text(' *')),
        ],
      );
    }

    return TweenAnimationBuilder<Color?>(
      tween: ColorTween(
        end: MPFieldPaint.label(
          colors,
          focused: focused,
          invalid: widget.invalid,
          disabled: widget.disabled,
        ),
      ),
      duration: duration,
      curve: MPMotion.standard,
      child: content,
      builder: (BuildContext context, Color? color, Widget? content) {
        return AnimatedBuilder(
          animation: _rise,
          child: content,
          builder: (BuildContext context, Widget? content) {
            final double t = _rise.value;

            return CustomSingleChildLayout(
              delegate: _LabelLayout(
                rise: t,
                inset: metrics.labelInset,
                rest: widget.multiline ? metrics.multilineRest : null,
                textDirection: Directionality.maybeOf(context) ?? TextDirection.ltr,
              ),
              child: _MeasuredWidth(
                gap: _gap,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: MPFieldMetrics.labelPad),
                  child: DefaultTextStyle.merge(
                    style: TextStyle.lerp(resting, shrunk, t)!.copyWith(color: color),
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.ellipsis,
                    child: content!,
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

/// Where the label goes for a given rise.
///
/// Resting, its middle is on the middle of the control (or of a multiline
/// control's first line), and it is kept clear of the trailing two rem a
/// toggle, a chevron or a stepper stands in. Risen, its middle is on the
/// outline's top edge, and it is kept inside the box.
class _LabelLayout extends SingleChildLayoutDelegate {
  const _LabelLayout({
    required this.rise,
    required this.inset,
    required this.rest,
    required this.textDirection,
  });

  final double rise;
  final double inset;

  /// The resting middle for a multiline control, or `null` for the middle of
  /// the box.
  final double? rest;
  final TextDirection textDirection;

  /// What a resting label leaves free at the end: `calc(100% - 2rem)`.
  static const double _restingReserve = 32;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) {
    final double width = constraints.maxWidth;
    final double resting = width - _restingReserve;
    final double risen = width - inset * 2;

    return BoxConstraints(maxWidth: math.max(0, lerpDouble(resting, risen, rise)!));
  }

  @override
  Offset getPositionForChild(Size size, Size childSize) {
    final double middle = lerpDouble(rest ?? size.height / 2, 0, rise)!;
    final double x = textDirection == TextDirection.rtl
        ? size.width - inset - childSize.width
        : inset;

    return Offset(x, middle - childSize.height / 2);
  }

  @override
  bool shouldRelayout(_LabelLayout oldDelegate) {
    return oldDelegate.rise != rise ||
        oldDelegate.inset != inset ||
        oldDelegate.rest != rest ||
        oldDelegate.textDirection != textDirection;
  }
}

/// The outline, with the label's segment taken out of its top edge.
///
/// A clip rather than a path with a piece missing: a stroke follows the path it
/// is given, and a path with a gap in it is still stroked along the two ends it
/// now has. The web package cuts the same gap with a `<legend>`, which opens
/// with its `max-width`; this opens with the rise, from nothing to the label's
/// full width.
class _OutlinePainter extends CustomPainter {
  _OutlinePainter({
    required this.color,
    required this.width,
    required this.borderRadius,
    required this.gap,
    required this.rise,
    required this.inset,
    required this.textDirection,
  }) : super(repaint: Listenable.merge(<Listenable?>[gap, rise]));

  final Color color;
  final double width;
  final BorderRadius borderRadius;

  /// The label's width with its padding, or `null` for a field with no label,
  /// whose outline is closed.
  final ValueListenable<double>? gap;
  final Animation<double> rise;
  final double inset;
  final TextDirection textDirection;

  @override
  void paint(Canvas canvas, Size size) {
    final double extent = gap == null ? 0 : gap!.value * rise.value;

    canvas.save();

    if (extent > 0) {
      final double start = textDirection == TextDirection.rtl ? size.width - inset - extent : inset;

      // Down to just past the stroke and up past the label, so the whole top
      // line comes out over the label's width and nothing else does.
      canvas.clipRect(
        Rect.fromLTRB(start, -size.height, start + extent, width + 0.5),
        clipOp: ClipOp.difference,
      );
    }

    // Centred on a path half a stroke inside the box, so the line is entirely
    // within the control's bounds, where a CSS border is.
    canvas.drawRRect(
      borderRadius.toRRect((Offset.zero & size).deflate(width / 2)),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = width
        ..color = color,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_OutlinePainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.width != width ||
        oldDelegate.borderRadius != borderRadius ||
        oldDelegate.gap != gap ||
        oldDelegate.rise != rise ||
        oldDelegate.inset != inset ||
        oldDelegate.textDirection != textDirection;
  }
}

/// A [Stack] whose last child, the label, is read before the others.
///
/// Painting and hit testing keep the order the children are given in, so the
/// label is drawn over the outline. Only the semantics walk changes: the label
/// merges into the control's node, and in the stack's own order a trigger's
/// value or anything else the row says would be read ahead of the name.
class _LabelFirst extends Stack {
  const _LabelFirst({super.clipBehavior, super.children});

  @override
  _RenderLabelFirst createRenderObject(BuildContext context) {
    return _RenderLabelFirst(
      alignment: alignment,
      textDirection: textDirection ?? Directionality.maybeOf(context),
      fit: fit,
      clipBehavior: clipBehavior,
    );
  }
}

class _RenderLabelFirst extends RenderStack {
  _RenderLabelFirst({super.alignment, super.textDirection, super.fit, super.clipBehavior});

  @override
  void visitChildrenForSemantics(RenderObjectVisitor visitor) {
    final RenderBox? last = lastChild;

    if (last == null) {
      return;
    }

    visitor(last);

    RenderBox? child = firstChild;

    while (child != null && child != last) {
      visitor(child);
      child = childAfter(child);
    }
  }
}

/// Reports its child's width to [gap] as it is laid out.
///
/// The notch is as wide as the label, and the label is a widget rather than a
/// string: there is nothing to measure it with but a layout. Paint runs once
/// the whole tree is laid out, so the value is there before the line is drawn.
class _MeasuredWidth extends SingleChildRenderObjectWidget {
  const _MeasuredWidth({required this.gap, required Widget super.child});

  final ValueNotifier<double> gap;

  @override
  _RenderMeasuredWidth createRenderObject(BuildContext context) => _RenderMeasuredWidth(gap);

  @override
  void updateRenderObject(BuildContext context, _RenderMeasuredWidth renderObject) {
    renderObject.gap = gap;
  }
}

class _RenderMeasuredWidth extends RenderProxyBox {
  _RenderMeasuredWidth(this.gap);

  ValueNotifier<double> gap;

  @override
  void performLayout() {
    super.performLayout();
    gap.value = size.width;
  }
}

/// A field's start or end adornment: the ink, the glyph size and the type of
/// whatever the caller put there.
///
/// `onSurfaceVariant` whether or not the field holds the focus, and 38% of
/// `onSurface` while it is disabled. A word in it (a currency sign, a unit) is
/// set in the value's type, so it is the size of the value beside it at every
/// rung.
class MPFieldAdornment extends StatelessWidget {
  /// Creates an adornment of a field of [size].
  const MPFieldAdornment({
    required this.size,
    required this.child,
    this.disabled = false,
    this.apart = true,
    super.key,
  });

  /// The field's rung, which decides the glyph size and the type.
  final MPSize size;

  /// Draws the adornment drained.
  final bool disabled;

  /// What a caller put in `startIcon`, or a glyph the control draws there.
  final Widget child;

  /// Whether what [child] says is a node of its own rather than part of the
  /// node round the field.
  ///
  /// A text field sets it: the adornment is text beside the input, not part of
  /// its name. A trigger leaves it off, since an adornment inside a button is
  /// part of the button's name.
  final bool apart;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPFieldMetrics metrics = MPFieldMetrics.of(size);
    final Color ink = MPFieldPaint.muted(theme.colors, disabled: disabled);

    return IconTheme.merge(
      data: IconThemeData(color: ink, size: metrics.icon),
      child: DefaultTextStyle.merge(
        style: metrics.text(theme.typescale).style(ink),
        child: apart ? Semantics(explicitChildNodes: true, child: child) : child,
      ),
    );
  }
}

/// The round button a field carries in its row: a password toggle, a clear ×,
/// a stepper.
///
/// Two looks, because the React shell has two. [wash] lays the MD3 state layer
/// over the button as a stepper and a clear × do; without it the glyph's ink
/// changes instead, `onSurface` under the pointer and `primary` on keyboard
/// focus, as the password toggle's does. Either way the glyph is
/// `onSurfaceVariant` at rest and drained while disabled.
///
/// A mouse press does not take the focus out of the field: the button is
/// inside the shell's tap region and takes no focus on a press, so the caret is
/// still where it was when the press comes back up.
class MPFieldIconButton extends StatelessWidget {
  /// Creates a button [extent] square holding [icon].
  const MPFieldIconButton({
    required this.icon,
    required this.semanticLabel,
    required this.onPressed,
    required this.extent,
    this.iconSize,
    this.wash = true,
    this.focusable = true,
    this.disabled = false,
    super.key,
  });

  /// The glyph, usually an `MPGlyph`. It takes its colour and its size from
  /// the [IconTheme] this sets.
  final Widget icon;

  /// The glyph's size. Left out, the [IconTheme] round the button decides.
  final double? iconSize;

  /// The button's name, which is all a screen reader has of it.
  final String semanticLabel;

  /// Runs on a press, by pointer, keyboard or screen reader. `null` or
  /// [disabled] makes the button unavailable.
  final VoidCallback? onPressed;

  /// The button's side.
  final double extent;

  /// Whether the state layer answers the pointer, rather than the glyph's ink.
  final bool wash;

  /// Whether Tab stops on it. A stepper is not a stop, as the React one is
  /// `tabIndex: -1`: the keys that step the number are the field's, so a stop on
  /// each stepper is two more Tab presses on the way past the field.
  final bool focusable;

  /// Unavailable, drawn drained.
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final bool available = !disabled && onPressed != null;
    final BorderRadius radius = BorderRadius.circular(extent / 2);

    final Widget button = MPInteractive(
      onTap: available ? onPressed : null,
      enabled: available,
      interactive: available,
      cursor: available ? SystemMouseCursors.click : SystemMouseCursors.basic,
      builder: (BuildContext context, MPInteraction state) {
        final Color ink = !available
            ? MPFieldPaint.muted(colors, disabled: true)
            : wash
            ? colors.onSurfaceVariant
            : state.focusVisible
            ? colors.primary
            : state.hovered
            ? colors.onSurface
            : colors.onSurfaceVariant;

        Widget content = IconTheme.merge(
          data: IconThemeData(color: ink, size: iconSize),
          child: SizedBox.square(
            dimension: extent,
            child: Center(child: icon),
          ),
        );

        if (wash) {
          content = MPStateLayer(
            color: colors.onSurfaceVariant,
            opacity: mpStateLayerOpacity(state, enabled: available),
            borderRadius: radius,
            child: content,
          );
        }

        return Semantics(
          container: true,
          button: true,
          enabled: available,
          label: semanticLabel,
          onTap: available ? onPressed : null,
          child: CustomPaint(
            // The library's ring, which a colour change alone is not: under a
            // monochrome theme `onSurfaceVariant` and `primary` are the same ink.
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: colors.secondary, borderRadius: radius, offset: 1)
                : null,
            child: content,
          ),
        );
      },
    );

    // In the tree either way, so a field that becomes focusable keeps its
    // button rather than building it again.
    return ExcludeFocus(excluding: !focusable, child: button);
  }
}

/// Which of the two the supporting line is saying, or neither.
enum _Slot { none, description, error }

/// The line under a control: its description, or its error.
///
/// Material gives supporting text one slot, not two, which is why this shows
/// *either* the description or the error. An error is not more information
/// about a field, it is the field's current problem, and pushing the
/// description down a line to make room leaves the reader reading a sentence
/// that has just stopped applying.
///
/// **The line arrives rather than appearing.** A field that turns invalid grows
/// by a line, and everything under it on the page moves down by that much. So
/// the space opens, on `short4` with the emphasised entrance, and a swap from a
/// description to an error, where the space is already there, is a fade and
/// nothing else. The first build is not a change and does not animate, and a
/// message leaving closes at once: softening that would mean holding on to an
/// error the field no longer has.
///
/// **An `MPConfigProvider` can reserve the line.** With `reserveSupportingText`
/// the line is there before there is anything to say, a line of `bodySmall`
/// high, so a message arriving later fills it rather than opening it.
///
/// Nothing is drawn at all while there is nothing to say and nothing reserved,
/// so a control in a column with a gap does not carry an empty gap under it.
class MPSupportingText extends StatefulWidget {
  /// Creates the line under a control.
  const MPSupportingText({
    this.description,
    this.errorMessage,
    this.disabled = false,
    this.padding = EdgeInsetsDirectional.zero,
    super.key,
  });

  /// The line while there is no error. Usually a [Text].
  final Widget? description;

  /// The error, which takes the description's place. Usually a [Text].
  final Widget? errorMessage;

  /// Drains both, the error included: it is still true, but it is no longer
  /// something the reader can act on.
  final bool disabled;

  /// What lines the text up with the control above it: the control's inline
  /// padding, and for a text field a 4px gap above.
  final EdgeInsetsGeometry padding;

  @override
  State<MPSupportingText> createState() => _MPSupportingTextState();
}

class _MPSupportingTextState extends State<MPSupportingText> with SingleTickerProviderStateMixin {
  late final AnimationController _reveal;

  /// Whether the running reveal opens the line, rather than fading a new
  /// message into a line already open.
  bool _opening = false;

  _Slot get _slot {
    if (widget.errorMessage != null) {
      return _Slot.error;
    }

    return widget.description != null ? _Slot.description : _Slot.none;
  }

  bool get _reserved => MPConfigProvider.maybeOf(context)?.reserveSupportingText ?? false;

  @override
  void initState() {
    super.initState();
    _reveal = AnimationController(vsync: this, duration: MPMotion.short4, value: 1);
  }

  @override
  void didUpdateWidget(MPSupportingText oldWidget) {
    super.didUpdateWidget(oldWidget);

    final _Slot before = oldWidget.errorMessage != null
        ? _Slot.error
        : oldWidget.description != null
        ? _Slot.description
        : _Slot.none;
    final _Slot now = _slot;

    if (before == now || now == _Slot.none) {
      return;
    }

    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _reveal.value = 1;

      return;
    }

    // From nothing the space has to open; between two messages it is already
    // open, and opening it again would collapse the line and re-open it. A
    // reserved line is open from the start, so it only ever swaps.
    _opening = before == _Slot.none && !_reserved;
    _reveal.forward(from: 0);
  }

  @override
  void dispose() {
    _reveal.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPTypeRole role = theme.typescale.bodySmall;
    final _Slot slot = _slot;
    final bool reserved = _reserved;

    if (slot == _Slot.none && !reserved) {
      return const SizedBox.shrink();
    }

    final Color ink = widget.disabled
        ? colors.onSurface.withValues(alpha: MPStateOpacity.disabledContent)
        : slot == _Slot.error
        ? colors.error
        : colors.onSurfaceVariant;

    Widget line = slot == _Slot.none
        ? const SizedBox.shrink()
        : DefaultTextStyle.merge(
            style: role.style(ink),
            child: slot == _Slot.error ? widget.errorMessage! : widget.description!,
          );

    if (slot != _Slot.none) {
      final Animation<double> fade = CurvedAnimation(
        parent: _reveal,
        curve: _opening ? MPMotion.emphasizedDecelerate : MPMotion.standard,
      );

      line = FadeTransition(opacity: fade, child: line);
    }

    line = Padding(padding: widget.padding, child: line);

    if (reserved) {
      final EdgeInsets padding = widget.padding.resolve(Directionality.maybeOf(context));

      return ConstrainedBox(
        constraints: BoxConstraints(minHeight: role.lineHeight + padding.vertical),
        child: Align(alignment: AlignmentDirectional.topStart, heightFactor: 1, child: line),
      );
    }

    // The row the message opens as, from nothing to its own height, so the two
    // ends are the real heights rather than a guess big enough to cover them.
    return AnimatedBuilder(
      animation: _reveal,
      child: line,
      builder: (BuildContext context, Widget? line) {
        if (!_opening || _reveal.isCompleted) {
          return line!;
        }

        return ClipRect(
          child: Align(
            alignment: AlignmentDirectional.topStart,
            heightFactor: MPMotion.emphasizedDecelerate.transform(_reveal.value),
            child: line,
          ),
        );
      },
    );
  }
}

/// A [TextEditingController] kept in step with a value a parent owns, except
/// while an input method is composing.
///
/// A controlled field writes the parent's value into the editor. While an IME
/// is composing (Korean, Japanese, Chinese, and dead-key sequences in several
/// European layouts) the editor is holding a provisional string with a
/// composing range the platform owns, and writing a value over it in that
/// moment ends the composition: the syllable in progress is thrown away and the
/// caret jumps. Anything the parent does to the value it is handed (trimming,
/// upper-casing, validating, or simply building again slowly) is enough.
///
/// So while a composition is running this holds the parent's value back and
/// leaves the editor showing what is being composed. When the composition ends
/// it calls [onCommit], and the parent's value is written again.
///
/// The caller reports every change the editor makes (`EditableText.onChanged`,
/// composing keystrokes included) and then calls [answered] with a way to read
/// the parent's value: after the frame that would carry the parent's answer,
/// that value is written back, so a change the parent turned down does not stay
/// on screen. That is what makes the field controlled, and not merely seeded.
class MPFieldText {
  /// Starts with the parent's [value].
  MPFieldText({required String value, required this.onCommit})
    : _value = value,
      controller = TextEditingController(text: value) {
    _wasComposing = composing;
    controller.addListener(_listen);
  }

  /// The controller the editor is built on. Not for writing into: [value] is
  /// how the parent's text arrives.
  final TextEditingController controller;

  /// Called once each time a composition ends, before the parent's value is
  /// written again. The composed text is in [controller].
  final VoidCallback onCommit;

  String _value;
  late bool _wasComposing;
  bool _waiting = false;
  bool _disposed = false;

  /// Whether an input method is composing in the editor right now.
  bool get composing {
    final TextRange range = controller.value.composing;

    return range.isValid && !range.isCollapsed;
  }

  /// The parent's value, last given.
  String get value => _value;

  /// Takes the parent's value, and shows it unless a composition is running,
  /// in which case it is shown when the composition ends.
  set value(String next) {
    _value = next;

    if (!composing) {
      _show();
    }
  }

  /// Writes the parent's value into the editor if the editor says something
  /// else, keeping the selection where it was as far as the new text allows.
  void _show() {
    final TextEditingValue current = controller.value;

    if (current.text == _value) {
      return;
    }

    final int length = _value.length;
    final TextSelection selection = current.selection;

    controller.value = TextEditingValue(
      text: _value,
      selection: selection.isValid
          ? TextSelection(
              baseOffset: math.min(selection.baseOffset, length),
              extentOffset: math.min(selection.extentOffset, length),
            )
          : TextSelection.collapsed(offset: length),
    );
  }

  void _listen() {
    final bool now = composing;

    if (_wasComposing && !now) {
      _wasComposing = false;
      onCommit();
    }

    _wasComposing = now;
  }

  /// After the frame that builds the parent's answer to a reported change,
  /// writes [latest]'s value into the editor.
  ///
  /// A frame is asked for, so a parent that did not build again at all, having
  /// turned the change down, is still answered.
  void answered(ValueGetter<String> latest) {
    if (_waiting) {
      return;
    }

    _waiting = true;
    WidgetsBinding.instance.addPostFrameCallback((Duration _) {
      _waiting = false;

      if (!_disposed) {
        value = latest();
      }
    });
    WidgetsBinding.instance.ensureVisualUpdate();
  }

  /// Releases the controller.
  void dispose() {
    _disposed = true;
    controller
      ..removeListener(_listen)
      ..dispose();
  }
}

/// Whether [event] is the key that submits a field: <kbd>Enter</kbd> or the
/// numpad's, going down.
bool mpIsEnterDown(KeyEvent event) {
  return event is KeyDownEvent &&
      (event.logicalKey == LogicalKeyboardKey.enter ||
          event.logicalKey == LogicalKeyboardKey.numpadEnter);
}

/// Runs [callback] in a microtask, unless [mounted] says the state has gone by
/// then. For the work a field leaves until the editor has finished the change
/// it is in the middle of.
void mpAfterEdit(bool Function() mounted, VoidCallback callback) {
  scheduleMicrotask(() {
    if (mounted()) {
      callback();
    }
  });
}

/// Holds a control open at the width of the widest thing it could ever say.
///
/// A control that is not `fullWidth` is sized by what it is currently saying,
/// which for anything whose value changes means the box changes with it: a date
/// picker on the 1st is narrower than on the 28th, and `Sep` is wider than
/// `May`. Either way the field moves under the pointer that just used it.
///
/// So the alternatives are laid out too, in [style], and take up width and no
/// height. Put this under the value in a [Column]: the column's width becomes
/// the widest sample's and stops depending on the value. Nothing of it is
/// painted or read out.
class MPWidthSizer extends StatelessWidget {
  /// Reserves the width of the widest of [samples].
  const MPWidthSizer({required this.samples, this.style, super.key});

  /// Every string the control could show.
  final List<String> samples;

  /// The type the control shows them in. Left to the [DefaultTextStyle].
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    if (samples.isEmpty) {
      return const SizedBox.shrink();
    }

    return ExcludeSemantics(
      child: _WidthOnly(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            for (final String sample in samples)
              Text(sample, style: style, maxLines: 1, softWrap: false),
          ],
        ),
      ),
    );
  }
}

/// Lays its child out and takes its width, with no height and no paint.
class _WidthOnly extends SingleChildRenderObjectWidget {
  const _WidthOnly({required Widget super.child});

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderWidthOnly();
}

class _RenderWidthOnly extends RenderProxyBox {
  @override
  void performLayout() {
    final RenderBox? child = this.child;

    if (child == null) {
      size = constraints.smallest;

      return;
    }

    child.layout(BoxConstraints(maxWidth: constraints.maxWidth), parentUsesSize: true);
    size = constraints.constrain(Size(child.size.width, 0));
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final Size? child = this.child?.getDryLayout(BoxConstraints(maxWidth: constraints.maxWidth));

    return constraints.constrain(Size(child?.width ?? 0, 0));
  }

  @override
  double computeMinIntrinsicHeight(double width) => 0;

  @override
  double computeMaxIntrinsicHeight(double width) => 0;

  @override
  void paint(PaintingContext context, Offset offset) {}

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) => false;
}
