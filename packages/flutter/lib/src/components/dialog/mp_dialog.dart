/// A sheet that takes the page away until it is answered.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/portal.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/internal/sheet_close.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Builds the widget that opens a dialog, handed the call that opens it.
typedef MPDialogTriggerBuilder = Widget Function(BuildContext context, VoidCallback open);

/// Builds a widget that closes the dialog it is inside, handed the call that
/// closes it.
typedef MPDialogCloseBuilder = Widget Function(BuildContext context, VoidCallback close);

/// How wide the sheet is allowed to get, per [MPSize].
///
/// `md` is MD3's own 560dp maximum. The size and the width are one axis: a
/// second five-value scale spelled `maxWidth` would be a second spelling of an
/// idea the library already has a word for, and the case it would exist for,
/// small type on a wide sheet, is what [MPDialog.width] is.
const Map<MPSize, double> _maxWidth = <MPSize, double>{
  MPSize.xs: 320,
  MPSize.sm: 400,
  MPSize.md: 560,
  MPSize.lg: 720,
  MPSize.xl: 960,
};

/// The room inside the sheet, and deliberately not `mpSheetPad`.
///
/// That ladder is centred on MD3's 16dp card padding; a dialog's is 24dp,
/// because a card sits in a column of other cards and a dialog is alone on the
/// screen with the scrim as its margin.
const Map<MPSize, double> _pad = <MPSize, double>{
  MPSize.xs: 12,
  MPSize.sm: 16,
  MPSize.md: 24,
  MPSize.lg: 28,
  MPSize.xl: 32,
};

/// The glyph in the hero slot, and the × beside the header. MD3 draws it at
/// 24dp.
const Map<MPSize, double> _iconSize = <MPSize, double>{
  MPSize.xs: 20,
  MPSize.sm: 22,
  MPSize.md: 24,
  MPSize.lg: 28,
  MPSize.xl: 32,
};

/// The room a dialog keeps between its sheet and the edge of the screen,
/// React's `p-4` on the viewport.
const double _screenInset = 16;

/// The gap between the header's parts: the icon, the text and the ×.
const double _headerGap = 12;

/// The gap between two buttons in the actions row.
const double _actionsGap = 8;

/// The × is a 40px circle, React's `size-10`.
const double _closeDiameter = 40;

/// How small the sheet starts, and ends, as it grows in and out.
///
/// 95% rather than the specification's 80%. Growing is the one transition in
/// the library that resamples text while it plays, and 80% of a 560px sheet
/// starts it 56px narrower than it ends, far enough that the words visibly
/// travel. At 95% the box moves 14px, which reads as the sheet settling.
const double _growFrom = 0.95;

/// How blurred the page under the scrim is, as React's `blur(2px)`.
const double _scrimBlur = 2;

/// The headline: `titleMedium`, `titleLarge`, `headlineSmall`,
/// `headlineMedium`, `headlineLarge`.
///
/// A headline rather than a title role, which is the opposite of what a card
/// takes. A card's first line names one thing among many; a dialog's names the
/// only thing on the screen.
MPTypeRole _titleRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
      return scale.titleMedium;
    case MPSize.sm:
      return scale.titleLarge;
    case MPSize.md:
      return scale.headlineSmall;
    case MPSize.lg:
      return scale.headlineMedium;
    case MPSize.xl:
      return scale.headlineLarge;
  }
}

/// Supporting text and the body: MD3's `bodyMedium` at `md`.
MPTypeRole _bodyRole(MPTypescale scale, MPSize size) {
  switch (size) {
    case MPSize.xs:
    case MPSize.sm:
      return scale.bodySmall;
    case MPSize.md:
      return scale.bodyMedium;
    case MPSize.lg:
    case MPSize.xl:
      return scale.bodyLarge;
  }
}

/// A sheet that takes the page away until it is answered.
///
/// ```dart
/// MPDialog(
///   trigger: (BuildContext context, VoidCallback open) =>
///       MPButton(variant: MPVariant.tonal, onPressed: open, child: const Text('Delete project')),
///   title: const Text('Delete “Aurora”?'),
///   description: const Text('Everything in it goes too.'),
///   actions: <Widget>[
///     MPDialogClose(
///       builder: (BuildContext context, VoidCallback close) =>
///           MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
///     ),
///     MPDialogClose(
///       builder: (BuildContext context, VoidCallback close) =>
///           MPButton(color: MPColor.error, onPressed: close, child: const Text('Delete')),
///     ),
///   ],
/// )
/// ```
///
/// The sections are parameters rather than sub-widgets: the arrangement of a
/// dialog is fixed (icon, headline, supporting text, body, actions) and what a
/// caller decides is what goes in each slot, not what order they come in.
///
/// Controlled with [open] and [onOpenChange], or left to itself with
/// [initialOpen], a [trigger] and an [MPDialogClose] in the actions.
///
/// ## The sheet
///
/// `surfaceContainerHigh` at the `extraLarge` corner, elevation 3: MD3's own
/// three choices for a dialog, and the only surface in the library at the third
/// level. There is no `elevation` and no `variant`: a dialog that could be told
/// to sit flat on the page would be a dialog that could be told to stop being
/// one.
///
/// It grows as it fades in, 400ms on `emphasizedDecelerate`, and shrinks back
/// out in 200ms on `emphasizedAccelerate`. A menu or a popover does not move,
/// because it opens *at* something the pointer is travelling towards; a dialog
/// opens at nothing, and the grow gives its arrival a direction. A full-screen
/// dialog only fades, having no middle to grow out of, and so does every
/// dialog for a reader who asked for less motion.
///
/// Only the body scrolls. The header and the actions stay put, which is why
/// [dividers] matters more here than on a card.
///
/// Needs an [Overlay] above it, which `WidgetsApp` with a navigator provides.
class MPDialog extends StatefulWidget {
  /// Creates a dialog.
  const MPDialog({
    this.open,
    this.initialOpen = false,
    this.onOpenChange,
    this.trigger,
    this.icon,
    this.title,
    this.description,
    this.actions,
    this.child,
    this.dividers = false,
    this.showClose,
    this.closeLabel,
    this.locale,
    this.width,
    this.fullWidth = true,
    this.fullScreen = false,
    this.modal = true,
    this.dismissible = true,
    this.size,
    this.color = MPColor.secondary,
    this.semanticLabel,
    super.key,
  });

  /// Whether the dialog is open. Left `null`, the dialog keeps its own state,
  /// starting from [initialOpen].
  final bool? open;

  /// Whether the dialog starts open, for one that keeps its own state.
  final bool initialOpen;

  /// Called with what the open state should become: `true` from the
  /// [trigger], `false` from the ×, an [MPDialogClose], <kbd>Escape</kbd>, the
  /// system back or a press on the scrim.
  final ValueChanged<bool>? onOpenChange;

  /// Builds the widget that opens the dialog, handed the call that opens it.
  ///
  /// Optional: a controlled dialog opened from elsewhere needs no trigger. The
  /// React build merges its handler onto the element it is given; a widget
  /// cannot be reached into, so this hands the handler over instead.
  final MPDialogTriggerBuilder? trigger;

  /// A glyph above the headline, in the [color] family.
  ///
  /// MD3's hero icon, and passing one centres the header: a dialog with an icon
  /// is announcing something, and a dialog without one is asking something.
  final Widget? icon;

  /// The headline, announced as a heading.
  final Widget? title;

  /// The supporting text under it.
  final Widget? description;

  /// The bottom row, end-aligned and wrapping, so a pair of buttons needs no
  /// row of its own. An [MPDialogClose] is what makes one of them close the
  /// dialog.
  final List<Widget>? actions;

  /// The body, and the only part that scrolls.
  final Widget? child;

  /// Draws a hairline between the header, the body and the actions instead of
  /// separating them with space.
  ///
  /// Worth turning on the moment the body scrolls: the lines are what say the
  /// header stayed put.
  final bool dividers;

  /// Shows the × at the end of the header.
  ///
  /// `null` follows [fullScreen], which is MD3's own split: a basic dialog is
  /// answered by its actions and has no ×, while a full-screen dialog carries
  /// one because there is no scrim left to press.
  final bool? showClose;

  /// The name a screen reader gives the ×. Defaults to the word for "close" in
  /// [locale].
  final String? closeLabel;

  /// Which language the ×'s default name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// A hard cap on the sheet's width in logical pixels, overriding the one
  /// [size] implies.
  ///
  /// For the dialog whose content decides its width, a wide table or a narrow
  /// confirmation, rather than for tuning the scale, which is [size].
  final double? width;

  /// The sheet takes the full width its [size] allows.
  ///
  /// On by default, which is the other way round from every other component.
  /// Elsewhere `fullWidth` means "fill the container"; a dialog's container is
  /// the screen, and a dialog that shrank to fit two words would be a tooltip.
  final bool fullWidth;

  /// Fills the screen edge to edge. For a phone-sized screen, or an editor.
  final bool fullScreen;

  /// Whether the page behind is taken away from the pointer as well as from
  /// the keyboard.
  ///
  /// `false` leaves the page clickable and scrollable while the focus is still
  /// held inside the sheet, which is the React build's `'trap-focus'`.
  final bool modal;

  /// Whether <kbd>Escape</kbd>, the system back or a press on the scrim closes
  /// the dialog.
  ///
  /// Turn it off for the dialog that has to be answered, and then give it
  /// actions that answer it, because there will be no other way out. The ×
  /// and an [MPDialogClose] still close it.
  final bool dismissible;

  /// The type scale the sheet is drawn at, and how wide it may get.
  /// [MPSize.md], 560px, unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the hero [icon] reads.
  ///
  /// The sheet itself stays neutral, as MD3's does: a dialog is already the
  /// only thing on the screen. `secondary` is the specification's own choice
  /// for the icon.
  final MPColor color;

  /// The name a screen reader gives the dialog as it opens.
  ///
  /// Defaults to the text of [title] when that is a plain [Text]. A title
  /// built from anything else has no text to hand over, and needs this.
  final String? semanticLabel;

  @override
  State<MPDialog> createState() => _MPDialogState();
}

class _MPDialogState extends State<MPDialog> with SingleTickerProviderStateMixin {
  late bool _uncontrolledOpen = widget.initialOpen;

  bool get _open => widget.open ?? _uncontrolledOpen;

  /// The sheet's own arrival and departure, on top of the layer's fade: the
  /// grow, and the faster fade out the React sheet leaves on.
  ///
  /// The durations are set from the theme in `_syncMotion`, for the reason
  /// `MPPortal` gives: a reader who asks for less motion gets none.
  late final AnimationController _grow = AnimationController(vsync: this);

  late final CurvedAnimation _growCurve = CurvedAnimation(
    parent: _grow,
    curve: MPMotion.emphasizedDecelerate,
    reverseCurve: MPMotion.emphasizedAccelerate,
  );

  late final Animation<double> _scale = Tween<double>(begin: _growFrom, end: 1).animate(_growCurve);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();

    // A dialog open on its first frame still arrives rather than appearing,
    // once there is a duration to arrive in, which is only from here.
    if (_open && _grow.isDismissed) {
      _grow.forward();
    }
  }

  @override
  void didUpdateWidget(MPDialog oldWidget) {
    super.didUpdateWidget(oldWidget);

    final bool was = oldWidget.open ?? _uncontrolledOpen;

    if (was != _open) {
      _move(_open);
    }
  }

  @override
  void dispose() {
    _growCurve.dispose();
    _grow.dispose();
    super.dispose();
  }

  void _syncMotion() {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    _grow
      ..duration = reduceMotion ? Duration.zero : MPMotion.medium4
      ..reverseDuration = reduceMotion ? Duration.zero : MPMotion.short4;
  }

  void _move(bool open) {
    _syncMotion();
    open ? _grow.forward() : _grow.reverse();
  }

  /// Asks for [next]: kept here for a dialog that keeps its own state, and
  /// reported either way.
  void _setOpen(bool next) {
    if (next == _open) {
      return;
    }

    if (widget.open == null) {
      setState(() => _uncontrolledOpen = next);
      _move(next);
    }

    widget.onOpenChange?.call(next);
  }

  void _show() => _setOpen(true);

  void _close() => _setOpen(false);

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  @override
  Widget build(BuildContext context) {
    final MPColorScheme colors = MPTheme.of(context).colors;
    final Widget? title = widget.title;
    final String? label = widget.semanticLabel ?? (title is Text ? title.data : null);

    final Widget portal = _MPDialogScope(
      close: _close,
      child: MPPortal(
        open: _open,
        modal: widget.modal,
        label: label,
        // A dialog says it is one. The question `MPConfirmProvider` asks in a
        // dialog is an alert dialog, and says so from above through the layer
        // role, so the role is not a thing every dialog has to offer.
        role: MPLayerRole.maybeOf(context) ?? SemanticsRole.dialog,
        barrierColor: mpScrimColor(colors),
        barrierBlur: _scrimBlur,
        onDismiss: widget.dismissible ? _close : null,
        child: _viewport(context),
      ),
    );

    final MPDialogTriggerBuilder? trigger = widget.trigger;

    if (trigger == null) {
      return portal;
    }

    // The trigger is drawn where the dialog was written, and the portal beside
    // it at no size at all: it only marks where the layer inherits from.
    return Stack(
      fit: StackFit.passthrough,
      clipBehavior: Clip.none,
      children: <Widget>[
        Builder(builder: (BuildContext context) => trigger(context, _show)),
        Positioned(left: 0, top: 0, child: portal),
      ],
    );
  }

  /// The sheet, placed on the screen: centred inside a margin, clear of the
  /// system's bars and a soft keyboard, or filling the screen.
  Widget _viewport(BuildContext context) {
    // `paddingOf` is what the bars take, already less what the keyboard covers,
    // so the keyboard is added back at the bottom. A full-screen sheet runs
    // under the bars and keeps its content out from under them instead.
    final EdgeInsets keyboard = EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom);
    final EdgeInsets clear = widget.fullScreen
        ? keyboard
        : const EdgeInsets.all(_screenInset) + MediaQuery.paddingOf(context) + keyboard;

    Widget sheet = Builder(builder: _sheet);

    if (!widget.fullScreen) {
      // The sheet is clear of the bars already, so what is inside it is not
      // told about them a second time.
      sheet = MediaQuery.removePadding(
        context: context,
        removeLeft: true,
        removeTop: true,
        removeRight: true,
        removeBottom: true,
        child: sheet,
      );

      sheet = ScaleTransition(scale: _scale, child: sheet);
    }

    sheet = FadeTransition(opacity: _growCurve, child: sheet);

    return Padding(
      padding: clear,
      child: MediaQuery.removeViewInsets(
        context: context,
        removeBottom: true,
        child: widget.fullScreen
            ? sheet
            : Align(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: widget.width ?? _maxWidth[_size]!),
                  child: sheet,
                ),
              ),
      ),
    );
  }

  Widget _sheet(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final bool withClose = widget.showClose ?? widget.fullScreen;
    final bool hasIcon = widget.icon != null;
    final bool hasHeader = widget.title != null || widget.description != null || hasIcon;
    final List<Widget> actions = widget.actions ?? const <Widget>[];
    final double pad = _pad[size]!;
    final double gap = mpSheetGap[size]!;
    final MPTypeRole body = _bodyRole(theme.typescale, size);

    // With dividers the lines have to reach both edges, so the sheet gives up
    // its vertical padding and every section takes it on instead.
    final EdgeInsets section = widget.dividers
        ? EdgeInsets.all(pad)
        : EdgeInsets.symmetric(horizontal: pad);

    final List<Widget> sections = <Widget>[
      if (hasHeader || withClose)
        _Section(
          padding: section,
          child: _header(context, size: size, withClose: withClose, body: body),
        ),
      if (widget.child != null)
        // The one part that scrolls, and the only one allowed to give way when
        // the sheet runs out of screen: a header that scrolled away would take
        // the dialog's name with it.
        Flexible(
          // Full screen, the body takes what the header and the actions leave,
          // so the actions sit at the bottom of the screen and not under the
          // last line.
          fit: widget.fullScreen ? FlexFit.tight : FlexFit.loose,
          child: _Section(
            padding: section,
            rule: widget.dividers && (hasHeader || withClose) ? colors.outlineVariant : null,
            child: SingleChildScrollView(
              child: DefaultTextStyle.merge(style: body.style(), child: widget.child!),
            ),
          ),
        ),
      if (actions.isNotEmpty)
        _Section(
          padding: section,
          rule: widget.dividers ? colors.outlineVariant : null,
          child: Wrap(
            alignment: WrapAlignment.end,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: _actionsGap,
            runSpacing: _actionsGap,
            children: actions,
          ),
        ),
    ];

    final MPContainerPaint paint = mpElevationPaint(colors, 3);
    final BorderRadius radius = widget.fullScreen
        ? BorderRadius.zero
        : BorderRadius.circular(theme.shapes.extraLarge);

    Widget sheet = Padding(
      padding: EdgeInsets.symmetric(vertical: widget.dividers ? 0 : pad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: widget.fullScreen ? MainAxisSize.max : MainAxisSize.min,
        spacing: widget.dividers ? 0 : gap,
        children: sections,
      ),
    );

    if (widget.fullScreen) {
      sheet = SafeArea(child: sheet);
    }

    // No decoration, whatever the sheet is laid over. Above a `MaterialApp`'s
    // navigator, where `MPConfirmProvider` asks its questions, the style in
    // scope is the one that app marks text outside a `Material` with, a yellow
    // double underline.
    sheet = DefaultTextStyle.merge(
      style: body.style(colors.onSurface).copyWith(decoration: TextDecoration.none),
      child: sheet,
    );

    // The decoration takes a press anywhere on the sheet, so a press on its
    // padding is not a press on the scrim behind it.
    sheet = DecoratedBox(
      decoration: paint.decoration(radius),
      child: ClipRRect(borderRadius: radius, child: sheet),
    );

    return widget.fullScreen || widget.fullWidth
        ? SizedBox(
            width: double.infinity,
            height: widget.fullScreen ? double.infinity : null,
            child: sheet,
          )
        : IntrinsicWidth(child: sheet);
  }

  Widget _header(
    BuildContext context, {
    required MPSize size,
    required bool withClose,
    required MPTypeRole body,
  }) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    // A hero icon centres the header, which is MD3's own rule: the icon, the
    // headline and the supporting text stack on one axis, and the whole block
    // is announcing rather than asking. A header with a × keeps its row.
    final bool centred = widget.icon != null && !withClose;
    final TextAlign align = centred ? TextAlign.center : TextAlign.start;

    final Widget text = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: centred ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      spacing: mpSheetGap[size]!,
      children: <Widget>[
        if (widget.title != null)
          DefaultTextStyle.merge(
            style: _titleRole(theme.typescale, size).style(colors.onSurface),
            textAlign: align,
            // The headline names the dialog, so it is announced as a heading
            // rather than read as the first line of the body.
            child: Semantics(header: true, child: widget.title!),
          ),
        if (widget.description != null)
          DefaultTextStyle.merge(
            style: body.style(colors.onSurfaceVariant),
            textAlign: align,
            child: widget.description!,
          ),
      ],
    );

    final Widget? icon = widget.icon == null
        ? null
        : IconTheme.merge(
            data: IconThemeData(size: _iconSize[size], color: colors.accent(widget.color).color),
            child: DefaultTextStyle.merge(
              style: TextStyle(color: colors.accent(widget.color).color),
              child: widget.icon!,
            ),
          );

    if (centred) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        spacing: _headerGap,
        children: <Widget>[icon!, text],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _headerGap,
      children: <Widget>[
        ?icon,
        Expanded(child: text),
        if (withClose)
          MPSheetCloseButton(
            label:
                widget.closeLabel ??
                mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['close']!,
            onPressed: _close,
            color: colors.onSurfaceVariant,
            ring: colors.secondary,
            diameter: _closeDiameter,
            iconSize: _iconSize[size]!,
          ),
      ],
    );
  }
}

/// One band of the sheet, with the hairline above it when the sheet is ruled.
///
/// A `Flexible` band has to stay the column's direct child, so the rule goes
/// round the padding inside it rather than round the band.
class _Section extends StatelessWidget {
  const _Section({required this.padding, required this.child, this.rule});

  final EdgeInsets padding;
  final Color? rule;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final Widget padded = Padding(padding: padding, child: child);

    if (rule == null) {
      return padded;
    }

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: rule!)),
      ),
      child: padded,
    );
  }
}

/// What an [MPDialogClose] reaches for.
class _MPDialogScope extends InheritedWidget {
  const _MPDialogScope({required this.close, required super.child});

  final VoidCallback close;

  static _MPDialogScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_MPDialogScope>();

  @override
  bool updateShouldNotify(_MPDialogScope oldWidget) => close != oldWidget.close;
}

/// Closes the dialog it is inside.
///
/// ```dart
/// MPDialogClose(
///   builder: (BuildContext context, VoidCallback close) =>
///       MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
/// )
/// ```
///
/// A dialog that keeps its own state has no setter for its Cancel button to
/// call, and the alternative, making every dialog controlled, is a piece of
/// state per dialog that exists only to answer a button. A controlled dialog
/// hears the close through its `onOpenChange`, as it hears the ×.
///
/// It closes whether or not the dialog is `dismissible`: that switch is about
/// the ways out a reader stumbles into, and this is one the dialog offers.
class MPDialogClose extends StatelessWidget {
  /// Creates a close for the dialog round it.
  const MPDialogClose({required this.builder, super.key});

  /// Builds what closes the dialog, usually an `MPButton`, handed the call
  /// that closes it.
  final MPDialogCloseBuilder builder;

  @override
  Widget build(BuildContext context) {
    final _MPDialogScope? scope = _MPDialogScope.maybeOf(context);

    assert(scope != null, 'MPDialogClose was used outside an MPDialog.');

    return builder(context, scope?.close ?? () {});
  }
}
