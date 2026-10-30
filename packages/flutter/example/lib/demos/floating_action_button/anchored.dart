import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';

/// A floating button pinned to a *region* rather than to the window.
///
/// It positions itself in the `Stack` it is put in, which is what makes it
/// usable anywhere but the corner of the screen: over a card, over a map, over
/// the preview of a phone. The offset is the same 16dp Material puts between
/// the button and the edge.
class FloatingActionButtonAnchored extends StatelessWidget {
  const FloatingActionButtonAnchored({super.key});

  @override
  Widget build(BuildContext context) {
    // The whole width, as the React sheet's `width: 100%`, and the box is
    // given it rather than shrinking to its words.
    return SizedBox(
      width: double.infinity,
      child: Stack(
        fit: StackFit.passthrough,
        children: <Widget>[
          ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 200),
            child: const MPBox(
              variant: MPVariant.filled,
              // Room under the words for the button, so it never covers them.
              child: Padding(
                padding: EdgeInsets.only(bottom: 80),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    MPTypography('Today', level: MPTypographyLevel.h6, gutter: true),
                    MPTypography(
                      'Three notes, none of them urgent. The button belongs to this sheet rather '
                      'than to the window, so it stays where the sheet is.',
                    ),
                  ],
                ),
              ),
            ),
          ),
          MPFloatingActionButton(
            corner: MPCorner.bottomEnd,
            icon: const MPIcon(icon: PlusGlyph()),
            label: 'New note',
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
