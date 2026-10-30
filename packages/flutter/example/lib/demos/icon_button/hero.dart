import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/glyphs_controls.dart';

/// A toolbar, which is where icon buttons actually live.
///
/// Every one of them is required to have a `label`. That is the whole reason
/// this component exists on top of `MPButton`: a button whose entire label is a
/// drawing has no name at all, and making the name required is the only fix
/// that survives review.
class IconButtonHero extends StatelessWidget {
  const IconButtonHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 4,
      children: <Widget>[
        MPIconButton(
          icon: const MPIcon(icon: SearchGlyph()),
          label: 'Search',
          onPressed: () {},
        ),
        MPIconButton(
          icon: const MPIcon(icon: CopyGlyph()),
          label: 'Copy link',
          onPressed: () {},
        ),
        MPIconButton(
          icon: const MPIcon(icon: UploadGlyph()),
          label: 'Upload a file',
          onPressed: () {},
        ),
        MPIconButton(
          icon: const MPIcon(icon: MoreGlyph()),
          label: 'More actions',
          onPressed: () {},
        ),
      ],
    );
  }
}
