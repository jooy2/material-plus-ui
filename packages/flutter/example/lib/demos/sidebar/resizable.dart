import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `resizable` puts a handle on the inner edge, the one facing the content.
///
/// The drag writes the width into a notifier rather than into state, because
/// nothing in the tree depends on the number except one box and a `setState`
/// per pointer move would rebuild every row in the sidebar. What the caller
/// hears is `onResize` while it moves and `onResizeEnd` when it is let go,
/// which is the number worth storing.
///
/// The handle takes the focus, so the arrow keys move it too.
class SidebarResizable extends StatefulWidget {
  const SidebarResizable({super.key});

  @override
  State<SidebarResizable> createState() => _SidebarResizableState();
}

class _SidebarResizableState extends State<SidebarResizable> {
  double _width = 200;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 480),
      child: SizedBox(
        width: double.infinity,
        height: 200,
        child: DecoratedBox(
          position: DecorationPosition.foreground,
          decoration: BoxDecoration(
            border: Border.all(color: theme.colors.outlineVariant),
            borderRadius: corner,
          ),
          child: ClipRRect(
            borderRadius: corner,
            child: MPPageLayout(
              collapseBelow: MPPageCollapse.none,
              sidebar: MPSidebar(
                size: MPSize.sm,
                width: 200,
                minWidth: 120,
                maxWidth: 320,
                resizable: true,
                onResizeEnd: (double width) => setState(() => _width = width),
                child: const MPTypography('Drag the inner edge', level: MPTypographyLevel.caption),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: MPTypography('Settled at ${_width.round()}px.'),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
