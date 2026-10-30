/// A panel attached to one edge of the window.
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

/// How the panel relates to the page, in MD3's own two words for it.
enum MPDrawerMode {
  /// It is opened, it floats over the page on a scrim, it holds the focus, and
  /// it is dismissed. The navigation drawer behind a menu button, the filter
  /// panel beside a table, the bottom sheet a phone raises.
  modal,

  /// It is part of the layout and the page is laid out around it. No scrim, no
  /// lift into the overlay, no focus trap, nothing to dismiss. The sidebar that
  /// is simply there.
  standard,
}

/// Builds the control that opens a modal [MPDrawer], handed the callback that
/// opens it.
typedef MPDrawerTriggerBuilder = Widget Function(BuildContext context, VoidCallback open);

/// Builds the control an [MPDrawerClose] makes dismiss, handed the callback
/// that closes the drawer round it.
typedef MPDrawerCloseBuilder = Widget Function(BuildContext context, VoidCallback close);

/// How wide a left or right panel is when nothing says otherwise.
///
/// `md` is 360, MD3's own navigation drawer width. Its own ladder rather than a
/// dialog's, and narrower at every step: a dialog is measured by how long a
/// line is comfortable inside it, a drawer by how much of the window it is
/// willing to take from what it is a drawer *for*. A top or bottom panel has
/// no entry here: its height is its content's.
const Map<MPSize, double> _extent = <MPSize, double>{
  MPSize.xs: 240,
  MPSize.sm: 288,
  MPSize.md: 360,
  MPSize.lg: 416,
  MPSize.xl: 480,
};

/// How much of the window a top or bottom panel may take when it has not been
/// given an extent. A bottom sheet holding three rows is three rows tall; this
/// is only the ceiling.
const double _crossCeiling = 0.85;

/// The gap between the header and the × beside it, React's `gap-3`.
const double _closeGap = 12;

/// The × button's circle and glyph, React's `size-10` round a 20px icon: a
/// size up from a popover's, because a drawer's title is a size up too.
const double _closeDiameter = 40;
const double _closeIcon = 20;

/// The gap between two buttons in the actions row, React's `gap-2`.
const double _actionsGap = 8;

/// The room a focus ring needs outside its control, which a scroll view would
/// otherwise clip: its offset plus its width.
const double _ringRoom = focusRingOffset + focusRingWidth;

/// A panel attached to one edge of the window.
///
/// ```dart
/// MPDrawer(
///   side: MPSide.right,
///   trigger: (BuildContext context, VoidCallback open) =>
///       MPButton(onPressed: open, child: const Text('Filters')),
///   title: const Text('Filters'),
///   child: const FilterForm(),
/// )
/// ```
///
/// Two things in one widget, because they are the same panel:
/// [MPDrawerMode.modal] is the drawer you open, a scrim, a focus trap and
/// <kbd>Escape</kbd>, and [MPDrawerMode.standard] is the drawer that is simply
/// part of the page. A sidebar becoming a menu button at a breakpoint is then
/// one parameter rather than a swap.
///
/// The sections are parameters rather than sub-widgets: the arrangement is
/// fixed (heading, description, body, actions) and the body is the only part
/// that scrolls, so the heading and the actions stay put.
///
/// ## The surface
///
/// `surfaceContainerLow` at elevation 1 for the modal panel and `surface` flat
/// for the standard one, which are MD3's own two answers. Square against the
/// window and rounded on the free edge: `large` on a side panel, MD3's
/// navigation drawer corner, and `extraLarge` on a top or bottom one, the
/// bottom sheet's. A hairline in `outlineVariant` runs along the free edge
/// only.
///
/// There is no `variant`, because a panel that has taken an edge of the window
/// has answered how much it asserts itself, and no `color`: what carries an
/// accent inside a drawer is the selected row of whatever list is put in it.
///
/// ## Why this one slides
///
/// Every other floating surface in the library fades, because a box full of
/// text should not travel while the reader is reading it. A drawer arrives at
/// an edge, the one part of the window nobody is reading, because somebody
/// pressed a button and is waiting for it, and a fade has no direction: a left
/// drawer and a right one would be the same event until both had finished. So
/// the modal panel comes in from its edge on MD3's emphasized pair, `medium4`
/// in and `short4` out, and simply appears for a reader who asked for less
/// motion.
///
/// The modal panel is lifted into the nearest [Overlay], which `WidgetsApp`
/// with a navigator provides.
class MPDrawer extends StatefulWidget {
  /// Creates a drawer.
  const MPDrawer({
    this.side = MPSide.left,
    this.mode = MPDrawerMode.modal,
    this.open,
    this.initialOpen,
    this.onOpenChange,
    this.trigger,
    this.title,
    this.description,
    this.actions,
    this.dividers = false,
    this.showClose,
    this.closeLabel,
    this.locale,
    this.extent,
    this.rounded = true,
    this.dismissible = true,
    this.size,
    this.semanticLabel,
    this.child,
    super.key,
  });

  /// Which edge the panel is attached to.
  ///
  /// Physical rather than logical, the way [MPSide] is everywhere in the
  /// library: a drawer along the left of the window is along the left in
  /// either writing direction.
  final MPSide side;

  /// Whether the panel is opened over the page or is part of it.
  final MPDrawerMode mode;

  /// Whether the drawer is shown. Use with [onOpenChange] for a controlled
  /// drawer; `null` leaves it to [initialOpen] and to the drawer itself.
  ///
  /// A closed standard drawer is not in the layout at all: the page around it
  /// is what moves, and moving the page is not this widget's to do.
  final bool? open;

  /// Whether an uncontrolled drawer starts open. React's `defaultOpen`.
  ///
  /// `null` is `false` in [MPDrawerMode.modal] and `true` in
  /// [MPDrawerMode.standard], because a fixed sidebar that had to be opened
  /// before it appeared would not be a fixed sidebar.
  final bool? initialOpen;

  /// Called with what the open state should become: `true` from [trigger],
  /// `false` from the ×, an [MPDrawerClose], <kbd>Escape</kbd>, the system
  /// back or a press on the scrim.
  final ValueChanged<bool>? onOpenChange;

  /// Builds the control that opens the drawer, handed the callback that opens
  /// it.
  ///
  /// ```dart
  /// trigger: (BuildContext context, VoidCallback open) =>
  ///     MPButton(onPressed: open, child: const Text('Open the menu')),
  /// ```
  ///
  /// [MPDrawerMode.modal] only. A standard drawer is not opened, it is in the
  /// layout, so a trigger there would have nothing to do and is not built.
  final MPDrawerTriggerBuilder? trigger;

  /// The heading, announced as one, and the modal drawer's name when it is a
  /// [Text].
  final Widget? title;

  /// A line under the title, in the quieter ink.
  final Widget? description;

  /// The bottom row, held against the foot of the panel while the body scrolls.
  /// Laid out at the end of the line, so a pair of buttons needs no wrapper of
  /// its own, and an [MPDrawerClose] is what makes one of them dismiss.
  final List<Widget>? actions;

  /// Draws a hairline between the header, the body and the actions instead of
  /// separating them with space. Worth turning on the moment the body scrolls:
  /// the lines are what say the header stayed put.
  final bool dividers;

  /// Shows the × in the corner.
  ///
  /// `null` is on in [MPDrawerMode.modal], where the panel has taken the page
  /// and the way out should not have to be remembered, and off in
  /// [MPDrawerMode.standard], where a × that closes a fixed sidebar with
  /// nothing to reopen it is a one-way door.
  final bool? showClose;

  /// The ×'s name for a screen reader. Defaults to the word for "close" in
  /// [locale].
  final String? closeLabel;

  /// Which language the ×'s default name is in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// How far the panel reaches in from its edge: a **width** for
  /// [MPSide.left] and [MPSide.right], a **height** for [MPSide.top] and
  /// [MPSide.bottom], in logical pixels.
  ///
  /// Left out, a side panel takes the width its [size] implies and a top or
  /// bottom panel is as tall as what is in it, up to 85% of the room it has.
  final double? extent;

  /// Rounds the corners on the edge that faces the page. The corners against
  /// the window are always square: a corner cut off something with no visible
  /// end is a corner cut off nothing.
  final bool rounded;

  /// Whether <kbd>Escape</kbd>, the system back or a press on the scrim closes
  /// the drawer.
  ///
  /// Turn it off for the drawer that has to be answered, and then give it
  /// actions that answer it, because there will be no other way out. The
  /// system back is then refused rather than let through to the page under
  /// the drawer. [MPDrawerMode.modal] only.
  final bool dismissible;

  /// How far the panel reaches in by default, and the type and room inside
  /// it. [MPSize.md], MD3's own 360 navigation drawer, unless an
  /// [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// The modal drawer's name for a screen reader, in place of [title]'s text.
  ///
  /// A widget has no text to hand over unless it is a [Text], so a drawer
  /// whose title is anything else is announced with no name unless this gives
  /// it one.
  final String? semanticLabel;

  /// The body, and the only part that scrolls.
  final Widget? child;

  @override
  State<MPDrawer> createState() => _MPDrawerState();
}

/// Closes the drawer it is inside.
///
/// For the button in [MPDrawer.actions] that should dismiss: an uncontrolled
/// drawer has no state of the caller's for its Cancel button to set, and
/// making every drawer controlled is a piece of state per drawer that exists
/// only to answer a button.
///
/// ```dart
/// MPDrawerClose(
///   builder: (BuildContext context, VoidCallback close) =>
///       MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Close')),
/// )
/// ```
class MPDrawerClose extends StatelessWidget {
  /// Creates a close action from [builder].
  const MPDrawerClose({required this.builder, super.key});

  /// Builds the control, handed the callback that closes the drawer.
  final MPDrawerCloseBuilder builder;

  @override
  Widget build(BuildContext context) {
    final _DrawerScope? scope = context.dependOnInheritedWidgetOfExactType<_DrawerScope>();

    assert(scope != null, 'MPDrawerClose has to be inside an MPDrawer.');

    return builder(context, scope?.close ?? () {});
  }
}

/// What an [MPDrawerClose] inside a drawer reaches.
class _DrawerScope extends InheritedWidget {
  const _DrawerScope({required this.close, required super.child});

  final VoidCallback close;

  @override
  bool updateShouldNotify(_DrawerScope oldWidget) => close != oldWidget.close;
}

class _MPDrawerState extends State<MPDrawer> with SingleTickerProviderStateMixin {
  /// A modal drawer's open state while nobody else owns it.
  late bool _modalOpen = widget.initialOpen ?? false;

  /// A standard drawer's, kept apart because the two start from different
  /// answers.
  late bool _standardOpen = widget.initialOpen ?? true;

  /// How far in the modal panel is: `0` off its edge, `1` home. No duration
  /// here; `_syncMotion` gives it the theme's before the first frame.
  late final AnimationController _slide = AnimationController(vsync: this);

  /// The travel as it is drawn: decelerating in, accelerating out.
  late final CurvedAnimation _travel = CurvedAnimation(
    parent: _slide,
    curve: MPMotion.emphasizedDecelerate,
    reverseCurve: MPMotion.emphasizedAccelerate,
  );

  bool get _modal => widget.mode == MPDrawerMode.modal;

  bool get _open => widget.open ?? (_modal ? _modalOpen : _standardOpen);

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  bool get _along => widget.side == MPSide.left || widget.side == MPSide.right;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
    _syncSlide();
  }

  @override
  void didUpdateWidget(MPDrawer oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A drawer that becomes modal at a breakpoint is a new dialog in React,
    // which starts from its own default rather than from the sidebar's state.
    if (_modal && oldWidget.mode != MPDrawerMode.modal) {
      _modalOpen = widget.initialOpen ?? false;
    }

    _syncSlide();
  }

  @override
  void dispose() {
    _travel.dispose();
    _slide.dispose();
    super.dispose();
  }

  /// The sheet's timings, or none at all for a reader who asked for less
  /// motion, for whom the panel is simply there.
  void _syncMotion() {
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    _slide
      ..duration = reduceMotion ? Duration.zero : MPMotion.medium4
      ..reverseDuration = reduceMotion ? Duration.zero : MPMotion.short4;
  }

  /// Sends the panel in or out to match whether the modal drawer is open.
  void _syncSlide() {
    final bool showing = _modal && _open;

    if (showing && !_slide.isForwardOrCompleted) {
      _slide.forward();
    } else if (!showing && _slide.isForwardOrCompleted) {
      _slide.reverse();
    }
  }

  void _setOpen(bool next) {
    if (next == _open) {
      return;
    }

    if (widget.open == null) {
      setState(() {
        if (_modal) {
          _modalOpen = next;
        } else {
          _standardOpen = next;
        }
      });
      _syncSlide();
    }

    widget.onOpenChange?.call(next);
  }

  void _show() => _setOpen(true);

  void _close() => _setOpen(false);

  /// The modal drawer's name: [MPDrawer.semanticLabel], or its title's words.
  String? get _name {
    if (widget.semanticLabel != null) {
      return widget.semanticLabel;
    }

    final Widget? title = widget.title;

    if (title is Text) {
      return title.data ?? title.textSpan?.toPlainText();
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    if (!_modal) {
      // In the flow, so "closed" is "not in the layout". There is nothing to
      // animate on the way out: what moves is the page around it.
      return _open ? _panel(context, floating: false) : const SizedBox.shrink();
    }

    final Widget portal = MPPortal(
      open: _open,
      label: _name,
      // A dialog, as React's popup is: what tells a screen reader the page has
      // been taken away, and the title is what names it.
      role: SemanticsRole.dialog,
      barrierColor: mpScrimColor(MPTheme.of(context).colors),
      // The scrim's 2px, the same a dialog's and an overlay's backdrop take,
      // so a drawer opened over either shows no seam.
      barrierBlur: 2,
      onDismiss: widget.dismissible ? _close : null,
      // A soft keyboard takes the bottom of the window away, so the panel ends
      // above it: a bottom sheet rises with it, and a side panel's actions stay
      // where they can be reached.
      child: Builder(
        builder: (BuildContext context) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
          child: MediaQuery.removeViewInsets(
            context: context,
            removeBottom: true,
            child: Align(
              alignment: switch (widget.side) {
                MPSide.left => Alignment.centerLeft,
                MPSide.right => Alignment.centerRight,
                MPSide.top => Alignment.topCenter,
                MPSide.bottom => Alignment.bottomCenter,
              },
              child: SlideTransition(
                position: Tween<Offset>(
                  // A whole panel's length, not a hint of one: the travel is
                  // what says which edge the drawer belongs to.
                  begin: switch (widget.side) {
                    MPSide.left => const Offset(-1, 0),
                    MPSide.right => const Offset(1, 0),
                    MPSide.top => const Offset(0, -1),
                    MPSide.bottom => const Offset(0, 1),
                  },
                  end: Offset.zero,
                ).animate(_travel),
                child: Builder(builder: (BuildContext context) => _panel(context, floating: true)),
              ),
            ),
          ),
        ),
      ),
    );

    final MPDrawerTriggerBuilder? trigger = widget.trigger;

    if (trigger == null) {
      return portal;
    }

    // The trigger is laid out where the drawer was written, and the portal
    // beside it takes no room.
    return Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        Builder(builder: (BuildContext context) => trigger(context, _show)),
        Positioned(left: 0, top: 0, child: portal),
      ],
    );
  }

  Widget _panel(BuildContext context, {required bool floating}) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = _size;
    final MPSide side = widget.side;

    final double pad = mpSheetPad[size]!;
    final double gap = mpSheetGap[size]!;
    final bool dividers = widget.dividers;
    final bool drawClose = widget.showClose ?? floating;
    final bool hasHeader = widget.title != null || widget.description != null;
    final bool hasActions = widget.actions != null && widget.actions!.isNotEmpty;
    final BorderSide rule = BorderSide(color: colors.outlineVariant);

    // With dividers the lines have to reach both edges, so the panel gives up
    // its vertical room and every section takes it on instead.
    final EdgeInsets section = EdgeInsets.symmetric(horizontal: pad, vertical: dividers ? pad : 0);

    final List<_Section> sections = <_Section>[
      if (hasHeader || drawClose)
        _Section(
          padding: section,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    if (widget.title != null)
                      DefaultTextStyle.merge(
                        style: mpSheetTitle(theme.typescale, size).style(colors.onSurface),
                        // The heading names the drawer, so it is announced as
                        // one rather than read as the first line of the body:
                        // React's `<h2>`.
                        child: Semantics(header: true, headingLevel: 2, child: widget.title),
                      ),
                    if (widget.description != null)
                      DefaultTextStyle.merge(
                        style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                        child: widget.description!,
                      ),
                  ],
                ),
              ),
              if (drawClose) ...<Widget>[
                const SizedBox(width: _closeGap),
                MPSheetCloseButton(
                  label:
                      widget.closeLabel ??
                      mpMessagesOf(context, mpCommonMessages, locale: widget.locale)['close']!,
                  onPressed: _close,
                  color: colors.onSurfaceVariant,
                  ring: colors.secondary,
                  diameter: _closeDiameter,
                  iconSize: _closeIcon,
                ),
              ],
            ],
          ),
        ),
      if (widget.child != null)
        _Section(
          body: true,
          rule: dividers && (hasHeader || drawClose) ? rule : null,
          // A scroll view clips at its edge and a focus ring is drawn outside
          // the control that owns it, so a field at the top or the bottom of an
          // unruled body would lose half its ring. The padding is room for the
          // ring, and the gaps either side hand the same room back, so nothing
          // on the panel moves.
          padding: dividers ? section : section.copyWith(top: _ringRoom, bottom: _ringRoom),
          bleeds: !dividers,
          child: widget.child!,
        ),
      if (hasActions)
        _Section(
          rule: dividers ? rule : null,
          padding: section,
          child: Wrap(
            alignment: WrapAlignment.end,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: _actionsGap,
            runSpacing: _actionsGap,
            children: widget.actions!,
          ),
        ),
    ];

    final BorderRadius corners = !widget.rounded
        ? BorderRadius.zero
        : switch (side) {
            MPSide.left => BorderRadius.horizontal(right: Radius.circular(theme.shapes.large)),
            MPSide.right => BorderRadius.horizontal(left: Radius.circular(theme.shapes.large)),
            MPSide.top => BorderRadius.vertical(bottom: Radius.circular(theme.shapes.extraLarge)),
            MPSide.bottom => BorderRadius.vertical(top: Radius.circular(theme.shapes.extraLarge)),
          };

    // The hairline on the free edge only. A border all round would draw a line
    // along the window's own edge, where there is nothing on the other side of
    // it to be separated from.
    final BorderSide edge = BorderSide(color: colors.outlineVariant);
    final Border border = switch (side) {
      MPSide.left => Border(right: edge),
      MPSide.right => Border(left: edge),
      MPSide.top => Border(bottom: edge),
      MPSide.bottom => Border(top: edge),
    };

    final Widget panel = _DrawerScope(
      close: _close,
      child: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final bool bounded = constraints.hasBoundedHeight;

          // A side panel is as tall as the room it is given; a top or bottom
          // one is as tall as its extent, or as its content up to a ceiling.
          // Only a panel with a height of its own pins the actions to its foot.
          final double? height = _along ? (bounded ? constraints.maxHeight : null) : widget.extent;
          final double? ceiling = !_along && widget.extent == null && bounded
              ? constraints.maxHeight * _crossCeiling
              : null;
          final bool fill = height != null;
          final double? width = _along
              ? widget.extent ?? _extent[size]!
              : (constraints.hasBoundedWidth ? constraints.maxWidth : null);

          Widget content = _layOut(
            sections,
            pad: dividers ? 0 : pad,
            gap: dividers ? 0 : gap,
            fill: fill,
            flexible: fill || ceiling != null,
          );

          if (floating) {
            // The panel runs under the system's bars on the three sides it
            // touches the window, and keeps what is in it out from under them.
            content = SafeArea(
              left: side != MPSide.right,
              top: side != MPSide.bottom,
              right: side != MPSide.left,
              bottom: side != MPSide.top,
              child: content,
            );
          }

          // The width is held to the room there is, as React's `max-w-full`
          // holds it, by the constraints the panel was handed.
          return ConstrainedBox(
            constraints: BoxConstraints(maxHeight: ceiling ?? double.infinity),
            child: Container(
              width: width,
              height: height,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: floating ? colors.surfaceContainerLow : colors.surface,
                border: border,
                borderRadius: corners,
                boxShadow: floating ? MPShadows.of(1) : null,
              ),
              child: DefaultTextStyle.merge(
                style: mpProseText(theme.typescale, size).style(colors.onSurface),
                child: content,
              ),
            ),
          );
        },
      ),
    );

    return panel;
  }

  /// The sections stacked with the panel's room round them.
  ///
  /// Spaced by hand rather than with the column's `spacing`, because the body
  /// carries the room for a focus ring inside its scroll view and the gaps
  /// either side of it hand that room back.
  Widget _layOut(
    List<_Section> sections, {
    required double pad,
    required double gap,
    required bool fill,
    required bool flexible,
  }) {
    final List<Widget> children = <Widget>[];

    for (int index = 0; index < sections.length; index += 1) {
      final _Section current = sections[index];
      final bool bleeds = current.bleeds;
      final bool previousBleeds = index > 0 && sections[index - 1].bleeds;
      final double before = (index == 0 ? pad : gap) - (bleeds || previousBleeds ? _ringRoom : 0);

      if (before > 0) {
        children.add(SizedBox(height: before));
      }

      final Widget band = current.build(scrolls: flexible);

      children.add(
        current.body && flexible ? (fill ? Expanded(child: band) : Flexible(child: band)) : band,
      );
    }

    if (sections.isNotEmpty) {
      final double after = pad - (sections.last.bleeds ? _ringRoom : 0);

      if (after > 0) {
        children.add(SizedBox(height: after));
      }
    } else if (pad > 0) {
      children.add(SizedBox(height: pad * 2));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: fill ? MainAxisSize.max : MainAxisSize.min,
      children: children,
    );
  }
}

/// One band of the panel, with the hairline above it when the panel is ruled.
class _Section {
  const _Section({
    required this.padding,
    required this.child,
    this.body = false,
    this.bleeds = false,
    this.rule,
  });

  final EdgeInsets padding;
  final Widget child;

  /// Whether this is the body, the one band that scrolls.
  final bool body;

  /// The hairline above it, or `null` for none.
  final BorderSide? rule;

  /// Whether the band carries the room for a focus ring past its own edges,
  /// which the gaps either side of it give back.
  final bool bleeds;

  /// The band, scrolling when it is the body and the panel has a height to
  /// scroll in.
  Widget build({required bool scrolls}) {
    Widget band = Padding(padding: padding, child: child);

    if (body) {
      band = SingleChildScrollView(
        physics: scrolls ? null : const NeverScrollableScrollPhysics(),
        child: band,
      );
    }

    return rule == null
        ? band
        : DecoratedBox(
            decoration: BoxDecoration(border: Border(top: rule!)),
            child: band,
          );
  }
}
