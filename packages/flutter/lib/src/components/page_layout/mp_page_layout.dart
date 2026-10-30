/// The skeleton a screen is hung on.
library;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/page_layout.dart';
import 'package:material_plus_ui/src/internal/window_class.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

export 'package:material_plus_ui/src/internal/page_layout.dart' show MPPageCollapse, MPSidebarSide;

/// How far across a header or a footer reaches: [MPPageLayoutSpan.full], the
/// whole width with the sidebars beginning underneath, or
/// [MPPageLayoutSpan.content], only the column between them.
///
/// The React package's own name for the same two values.
typedef MPPageSpan = MPPageLayoutSpan;

/// The skeleton a screen is hung on: a header, a footer, one sidebar or two,
/// and the content between them.
///
/// ```dart
/// MPPageLayout(
///   header: const MPHeader(brand: Text('Acme')),
///   sidebar: MPSidebar(child: navigation),
///   footer: const MPFooter(child: Text('© 2026 Acme')),
///   child: page,
/// )
/// ```
///
/// What it is really for is the **regions**. A screen assembled out of
/// anonymous boxes is a screen a screen reader offers as one undifferentiated
/// region; the same screen built out of components that say what they are has
/// a table of contents. Those names come from the components this one arranges.
/// The layout itself draws nothing and claims one thing, [SemanticsRole.main]
/// around [child], and not even that inside another layout, whose screen has
/// its main region already.
///
/// **It fills the space it is given.** It is a [Column] of a header, a band
/// and a footer, with the band taking what the bars leave, so put it under
/// something with a bounded height: a [SizedBox.expand], a route's body, a
/// pane. The content is not wrapped in a scroll view. What scrolls, and which
/// way, belongs to whatever is put in [child], and a [ListView] there needs no
/// help from here.
///
/// It draws no gutter and no measure either. That is `MPContainer`'s job, and
/// a layout that also did it would be a second spelling of one idea. Put a
/// container inside, where one route can hold a wide dashboard and the next a
/// narrow article.
class MPPageLayout extends StatefulWidget {
  /// Creates a screen skeleton.
  const MPPageLayout({
    this.child,
    this.header,
    this.footer,
    this.sidebar,
    this.endSidebar,
    this.headerSpan = MPPageSpan.full,
    this.footerSpan = MPPageSpan.full,
    this.collapseBelow = MPPageCollapse.expanded,
    this.sidebarOpen,
    this.initialSidebarOpen = false,
    this.onSidebarOpenChange,
    this.endSidebarOpen,
    this.initialEndSidebarOpen = false,
    this.onEndSidebarOpenChange,
    this.skipLink = true,
    this.skipLabel,
    this.mainSemanticLabel,
    this.locale,
    super.key,
  });

  /// The screen, in the main region. Given whatever the bars and the columns
  /// leave.
  final Widget? child;

  /// The bar across the top. An `MPHeader`, usually.
  final Widget? header;

  /// The sheet at the end. An `MPFooter`, usually.
  final Widget? footer;

  /// The leading column: the left of an English screen, the right of an Arabic
  /// one. An `MPSidebar` here is told which end it is on and needs no `side`
  /// of its own.
  final Widget? sidebar;

  /// The trailing column, for the layouts that have two: navigation down one
  /// side and a table of contents, an inspector or a filter panel down the
  /// other. Each is a sidebar with its own width, its own drawer and its own
  /// trigger.
  final Widget? endSidebar;

  /// Which of the header and the sidebars takes the top corner.
  ///
  /// [MPPageSpan.full] is a website: one bar across the whole width, and the
  /// screen below it. [MPPageSpan.content] is an application, and MD3's own
  /// drawing of a standard navigation drawer: the drawer is the outermost
  /// thing on the screen and the app bar belongs to the pane it is over.
  final MPPageSpan headerSpan;

  /// The same question for the footer, and worth answering separately: a
  /// dashboard with a full-height navigation drawer still usually wants its
  /// copyright line under the content rather than under the drawer.
  final MPPageSpan footerSpan;

  /// The window size class below which the sidebars stop being columns and
  /// become drawers, opened by an `MPSidebarTrigger`.
  ///
  /// [MPPageCollapse.expanded] is the default because it is MD3's own answer:
  /// the specification gives a standard navigation drawer to an expanded
  /// window and puts the same destinations behind a modal drawer below one.
  /// [MPPageCollapse.none] keeps them columns at every width.
  ///
  /// The width compared is the one **this layout** was given, against the
  /// boundaries an `MPConfigProvider` sets. On a screen that is the window,
  /// which is what a media query measures; an app shell inside a pane
  /// collapses when the pane is narrow, which a media query cannot do.
  final MPPageCollapse collapseBelow;

  /// Whether the leading sidebar's drawer is open.
  ///
  /// Passing it makes the drawer controlled: the layout stops holding the
  /// state and answers with what it is given, which is what a route change
  /// that has to close the drawer behind it needs.
  final bool? sidebarOpen;

  /// Which state the leading drawer starts in, while [sidebarOpen] is `null`.
  final bool initialSidebarOpen;

  /// Called when the leading drawer asks to open or close.
  final ValueChanged<bool>? onSidebarOpenChange;

  /// The same as [sidebarOpen], for the trailing sidebar.
  final bool? endSidebarOpen;

  /// The same as [initialSidebarOpen], for the trailing sidebar.
  final bool initialEndSidebarOpen;

  /// The same as [onSidebarOpenChange], for the trailing sidebar.
  final ValueChanged<bool>? onEndSidebarOpenChange;

  /// Puts a "Skip to content" button first in the focus order, drawn only
  /// while the keyboard holds it.
  ///
  /// On by default, and the one thing here that is not a style decision. A
  /// keyboard reader arriving on a screen whose navigation holds forty links
  /// has to walk past all forty before reaching the content; this is the one
  /// stop that spares them, and it costs a pointer reader nothing because it is
  /// not drawn until it is tabbed to. Pressing it moves the focus to the main
  /// region, so the next Tab lands on the first stop inside it.
  ///
  /// A layout inside another draws none: the screen has one already.
  final bool skipLink;

  /// What the skip button says. Defaults to the words for it in [locale].
  final String? skipLabel;

  /// The name a screen reader gives the main region.
  ///
  /// Worth writing when a screen has more than one region worth naming. Left
  /// out, the region is announced by what is in it. A layout inside another
  /// claims no main region, so it gives this to nothing.
  final String? mainSemanticLabel;

  /// Which language the layout's own words are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English. Every
  /// sidebar and trigger inside speaks it too, so it is written once per
  /// screen.
  final String? locale;

  @override
  State<MPPageLayout> createState() => _MPPageLayoutState();
}

class _MPPageLayoutState extends State<MPPageLayout> {
  late bool _ownStart = widget.initialSidebarOpen;
  late bool _ownEnd = widget.initialEndSidebarOpen;

  /// The main region's node: focusable by script and not by Tab, which is what
  /// lets the skip button actually skip. The React package puts
  /// `tabIndex={-1}` on its `<main>` for the same reason.
  final FocusNode _main = FocusNode(debugLabel: 'MPPageLayout main', skipTraversal: true);

  bool get _startOpen => widget.sidebarOpen ?? _ownStart;

  bool get _endOpen => widget.endSidebarOpen ?? _ownEnd;

  @override
  void dispose() {
    _main.dispose();
    super.dispose();
  }

  void _setOpen(MPSidebarSide side, bool open) {
    if (side == MPSidebarSide.start) {
      if (widget.sidebarOpen == null) {
        setState(() => _ownStart = open);
      }

      widget.onSidebarOpenChange?.call(open);

      return;
    }

    if (widget.endSidebarOpen == null) {
      setState(() => _ownEnd = open);
    }

    widget.onEndSidebarOpenChange?.call(open);
  }

  @override
  Widget build(BuildContext context) {
    final Widget? header = widget.header;
    final Widget? footer = widget.footer;
    final Widget? sidebar = widget.sidebar;
    final Widget? endSidebar = widget.endSidebar;
    final bool headerSpansContent = widget.headerSpan == MPPageSpan.content;
    final bool footerSpansContent = widget.footerSpan == MPPageSpan.content;

    // Inside another layout this one is a region of that screen rather than a
    // screen, and the screen has its main region and its skip button already:
    // a second of either is two for a reader to choose between, and a main
    // region inside another is one Flutter refuses. Looked up without
    // depending on it, because nothing the outer scope carries changes the
    // answer.
    final bool nested =
        context.getInheritedWidgetOfExactType<MPPageLayoutScope>() != null ||
        MPLandmarkScope.within(context);

    Widget main = Focus(
      focusNode: _main,
      // The region is not a control, and a screen reader that heard it was
      // focusable would offer it as one.
      includeSemantics: false,
      child: widget.child ?? const SizedBox.shrink(),
    );

    main = Semantics(
      role: nested ? null : SemanticsRole.main,
      label: nested ? null : widget.mainSemanticLabel,
      explicitChildNodes: true,
      // What is inside knows it is inside the main region, so a sidebar put in
      // the content leaves the complementary role it cannot claim there.
      child: nested ? main : MPLandmarkScope(child: main),
    );

    // The middle column: the content, plus whichever bars belong to the view
    // rather than to the screen.
    final Widget middle = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        if (header != null && headerSpansContent) header,
        Expanded(child: main),
        if (footer != null && footerSpansContent) footer,
      ],
    );

    final Widget band = _Band(
      children: <Widget>[
        if (sidebar != null) MPSidebarSideScope(side: MPSidebarSide.start, child: sidebar),
        Expanded(child: middle),
        if (endSidebar != null) MPSidebarSideScope(side: MPSidebarSide.end, child: endSidebar),
      ],
    );

    final Widget screen = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        if (header != null && !headerSpansContent) header,
        Expanded(child: band),
        if (footer != null && !footerSpansContent) footer,
      ],
    );

    final Map<MPWindowClass, double> minimums = mpWindowMinimumsOf(context);

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double? width = constraints.hasBoundedWidth ? constraints.maxWidth : null;

        Widget layout = MPPageLayoutScope(
          collapsed: mpCollapsedAt(widget.collapseBelow, width: width, minimums: minimums),
          open: <MPSidebarSide, bool>{MPSidebarSide.start: _startOpen, MPSidebarSide.end: _endOpen},
          setOpen: _setOpen,
          width: width,
          collapseBelow: widget.collapseBelow,
          locale: widget.locale,
          child: screen,
        );

        if (widget.skipLink && !nested) {
          layout = _withSkipLink(context, layout);
        }

        return layout;
      },
    );
  }

  /// [layout] with the skip button in front of it, first to be reached and
  /// last to be painted.
  Widget _withSkipLink(BuildContext context, Widget layout) {
    final String label =
        widget.skipLabel ??
        mpMessagesOf(context, mpLayoutMessages, locale: widget.locale)['skipToContent']!;

    // Ordered, so the button is the first stop whatever the app's own policy
    // is. Reading order alone would put it after a header button that happens
    // to sit as high up and as far to the start as it does.
    return FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      child: _SkipStack(
        children: <Widget>[
          PositionedDirectional(
            start: 12,
            top: 12,
            child: FocusTraversalOrder(
              order: const NumericFocusOrder(0),
              child: _SkipLink(label: label, onPressed: _main.requestFocus),
            ),
          ),
          FocusTraversalOrder(
            order: const NumericFocusOrder(1),
            // The screen keeps the policy it would have had without the button,
            // so nothing inside is reached in a different order for it.
            child: FocusTraversalGroup(
              policy: FocusTraversalGroup.maybeOf(context) ?? ReadingOrderTraversalPolicy(),
              child: layout,
            ),
          ),
        ],
      ),
    );
  }
}

/// The skip button: a pill in `primary` once the keyboard reaches it, and a
/// single pixel until then.
///
/// A pixel rather than nothing, for the trade the React package's clipped link
/// makes: a stop with no size is a stop a screen reader can drop, and then
/// there is nothing for a reader to find in the first place.
class _SkipLink extends StatelessWidget {
  const _SkipLink({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        final Widget face = state.focusVisible
            ? DecoratedBox(
                decoration: BoxDecoration(
                  color: colors.primary,
                  borderRadius: MPShapes.circular(theme.shapes.full),
                  boxShadow: MPShadows.of(2),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Text(
                    label,
                    maxLines: 1,
                    softWrap: false,
                    style: theme.typescale.labelLarge.style(colors.onPrimary),
                  ),
                ),
              )
            : const SizedBox.square(dimension: 1);

        return Semantics(
          container: true,
          button: true,
          label: label,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: ExcludeSemantics(child: face),
        );
      },
    );
  }
}

/// A [Stack] that paints its first child last and asks it about a pointer
/// first.
///
/// The skip button has to come first in the tree, because a focus order that
/// falls back on the order of the tree puts it first that way; and it has to
/// be drawn over the screen, which a [Stack] does for its *last* child. Only
/// the order of painting and of hit testing differs from a [Stack].
class _SkipStack extends Stack {
  const _SkipStack({required super.children}) : super(fit: StackFit.passthrough);

  @override
  RenderStack createRenderObject(BuildContext context) {
    return _RenderSkipStack(
      alignment: alignment,
      textDirection: textDirection ?? Directionality.maybeOf(context),
      fit: fit,
      clipBehavior: clipBehavior,
    );
  }
}

class _RenderSkipStack extends RenderStack {
  _RenderSkipStack({
    required super.alignment,
    required super.textDirection,
    required super.fit,
    required super.clipBehavior,
  });

  @override
  void paintStack(PaintingContext context, Offset offset) {
    RenderBox? child = lastChild;

    while (child != null) {
      final StackParentData data = child.parentData! as StackParentData;

      context.paintChild(child, data.offset + offset);
      child = data.previousSibling;
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    RenderBox? child = firstChild;

    while (child != null) {
      final RenderBox box = child;
      final StackParentData data = box.parentData! as StackParentData;
      final bool hit = result.addWithPaintOffset(
        offset: data.offset,
        position: position,
        hitTest: (BoxHitTestResult result, Offset local) => box.hitTest(result, position: local),
      );

      if (hit) {
        return true;
      }

      child = data.nextSibling;
    }

    return false;
  }
}

/// The band between the bars: the sidebars and the content, laid out, read and
/// tabbed through in that order as a [Row] would, but painted and asked about a
/// pointer with the sidebars above the content.
///
/// A sidebar's resize handle straddles its inner edge, so half of it lies over
/// the content. A [Row] paints its children in order and asks the last one
/// about a pointer first, which would put the content over a start sidebar's
/// handle: a fill would cover the outer half, and a scroll view would take a
/// press there before the handle was asked. An `elevated` column's shadow has
/// the same problem. Only the order of painting and of asking differs from a
/// [Row], never the order of the children, because that is the order a screen
/// reader reads them in and the Tab key visits them in.
class _Band extends Row {
  const _Band({required super.children}) : super(crossAxisAlignment: CrossAxisAlignment.stretch);

  @override
  RenderFlex createRenderObject(BuildContext context) {
    return _RenderBand(
      mainAxisAlignment: mainAxisAlignment,
      mainAxisSize: mainAxisSize,
      crossAxisAlignment: crossAxisAlignment,
      textDirection: getEffectiveTextDirection(context),
      verticalDirection: verticalDirection,
      textBaseline: textBaseline,
      clipBehavior: clipBehavior,
      spacing: spacing,
    );
  }
}

class _RenderBand extends RenderFlex {
  _RenderBand({
    required super.mainAxisAlignment,
    required super.mainAxisSize,
    required super.crossAxisAlignment,
    required super.textDirection,
    required super.verticalDirection,
    required super.textBaseline,
    required super.clipBehavior,
    required super.spacing,
  });

  /// Whether [child] is a sidebar: the content is the one child with a flex.
  static bool _isSidebar(RenderBox child) => ((child.parentData! as FlexParentData).flex ?? 0) == 0;

  // `RenderFlex.paint` paints its children through this, clipped or not.
  @override
  void defaultPaint(PaintingContext context, Offset offset) {
    for (final bool sidebars in const <bool>[false, true]) {
      RenderBox? child = firstChild;

      while (child != null) {
        final FlexParentData data = child.parentData! as FlexParentData;

        if (_isSidebar(child) == sidebars) {
          context.paintChild(child, data.offset + offset);
        }

        child = data.nextSibling;
      }
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    for (final bool sidebars in const <bool>[true, false]) {
      RenderBox? child = lastChild;

      while (child != null) {
        final RenderBox box = child;
        final FlexParentData data = box.parentData! as FlexParentData;

        if (_isSidebar(box) == sidebars &&
            result.addWithPaintOffset(
              offset: data.offset,
              position: position,
              hitTest: (BoxHitTestResult result, Offset local) =>
                  box.hitTest(result, position: local),
            )) {
          return true;
        }

        child = data.previousSibling;
      }
    }

    return false;
  }
}
