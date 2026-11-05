import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

/// The width the content of a screen stops growing at.
const double contentWidth = 880;

/// The width at which the bottom bar gives way to a sidebar.
const double railBreakpoint = 720;

/// The route every screen is pushed with: the next page slides in from the end.
class ShowcaseRoute<T> extends PageRoute<T> {
  /// Creates the route.
  ShowcaseRoute({required this.builder, super.settings});

  /// Builds the page.
  final WidgetBuilder builder;

  @override
  Color? get barrierColor => null;

  @override
  String? get barrierLabel => null;

  @override
  bool get maintainState => true;

  @override
  Duration get transitionDuration => const Duration(milliseconds: 260);

  @override
  Widget buildPage(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) {
    return builder(context);
  }

  @override
  Widget buildTransitions(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      textDirection: Directionality.of(context),
      position: Tween<Offset>(
        begin: const Offset(1, 0),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
      child: child,
    );
  }
}

/// The surface every screen is drawn on.
class Ground extends StatelessWidget {
  /// Creates the surface.
  const Ground({required this.child, super.key});

  /// What sits on it.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(color: MPTheme.of(context).colors.surface, child: child);
  }
}

/// A screen: a title, what it holds, and room for the system's bars.
class ScreenScroll extends StatelessWidget {
  /// Creates the screen.
  const ScreenScroll({
    required this.title,
    required this.children,
    this.subtitle,
    this.action,
    this.controller,
    super.key,
  });

  /// The heading.
  final String title;

  /// The line under the heading.
  final String? subtitle;

  /// A control at the end of the heading.
  final Widget? action;

  /// What the screen holds, top to bottom.
  final List<Widget> children;

  /// Drives the scroll position.
  final ScrollController? controller;

  @override
  Widget build(BuildContext context) {
    final EdgeInsets safe = MediaQuery.paddingOf(context);

    return ListView(
      controller: controller,
      padding: EdgeInsets.fromLTRB(16, safe.top + 12, 16, safe.bottom + 24),
      children: <Widget>[
        Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: contentWidth),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 16,
              children: <Widget>[
                Row(
                  spacing: 12,
                  children: <Widget>[
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          MPTypography(title, level: MPTypographyLevel.h4),
                          if (subtitle != null)
                            MPTypography(subtitle!, level: MPTypographyLevel.caption),
                        ],
                      ),
                    ),
                    ?action,
                  ],
                ),
                ...children,
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// A pushed screen: a back button and a title over a [Ground].
class PushedScreen extends StatelessWidget {
  /// Creates the screen.
  const PushedScreen({required this.title, required this.child, this.actions, super.key});

  /// The heading in the bar.
  final String title;

  /// Controls at the end of the bar.
  final List<Widget>? actions;

  /// What fills the rest of the screen.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MediaQueryData media = MediaQuery.of(context);
    final EdgeInsets safe = media.padding;

    // Ends where the keyboard begins, as a `Scaffold` does, so a field at the
    // bottom of the screen stays above it.
    return Ground(
      child: Padding(
        padding: EdgeInsets.only(bottom: media.viewInsets.bottom),
        child: MediaQuery(
          data: media.removeViewInsets(removeBottom: true),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(8, safe.top + 4, 8, 4),
                child: Row(
                  spacing: 4,
                  children: <Widget>[
                    MPIconButton(
                      label: 'Back',
                      variant: MPVariant.text,
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Directional(child: MPIcon(icon: ChevronStartGlyph())),
                    ),
                    Expanded(child: MPTypography(title, level: MPTypographyLevel.h6, lines: 1)),
                    ...?actions,
                  ],
                ),
              ),
              Expanded(
                child: MediaQuery.removePadding(context: context, removeTop: true, child: child),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Mirrors [child] in a right-to-left screen.
class Directional extends StatelessWidget {
  /// Creates the mirror.
  const Directional({required this.child, super.key});

  /// The glyph.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool rtl = Directionality.of(context) == TextDirection.rtl;

    return rtl ? Transform.flip(flipX: true, child: child) : child;
  }
}

/// Pushes [screen] over the current one.
void pushScreen(BuildContext context, Widget screen) {
  Navigator.of(context).push(ShowcaseRoute<void>(builder: (BuildContext _) => screen));
}

/// The glyphs of the five destinations.
const Map<String, Widget> destinationGlyphs = <String, Widget>{
  'home': MPIcon(icon: HomeGlyph()),
  'inbox': MPIcon(icon: BellGlyph()),
  'orders': MPIcon(icon: BookmarkGlyph()),
  'request': MPIcon(icon: PlusGlyph()),
  'more': MPIcon(icon: MoreGlyph()),
};
