import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `size` here is the padding, and only the padding.
///
/// A box is as tall as what it holds, and its children bring their own
/// typography: a container that reset the type scale would make the same
/// paragraph render at two sizes depending on what it was wrapped in.
///
/// The corner does not move either. In Material a radius is a statement about
/// what kind of object something is rather than a size to taste, and all five
/// of these are the same kind of object: a sheet, at `corner-medium`.
class BoxSizes extends StatelessWidget {
  const BoxSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12,
        children: <Widget>[
          for (final MPSize size in MPSize.values)
            MPBox(size: size, variant: MPVariant.tonal, child: Text(size.name)),
        ],
      ),
    );
  }
}
