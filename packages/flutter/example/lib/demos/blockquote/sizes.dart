import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The quote's type scale, and every rung is one of MD3's own roles.
///
/// `md` is `title-large`, 22px at weight 400, the specification's largest role
/// that is not a heading, and exactly what a pull quote is.
class BlockquoteSizes extends StatelessWidget {
  const BlockquoteSizes({super.key});

  static const List<(MPSize, String)> _sizes = <(MPSize, String)>[
    (MPSize.xs, 'body-medium'),
    (MPSize.sm, 'body-large'),
    (MPSize.md, 'title-large — the default'),
    (MPSize.lg, 'headline-small'),
    (MPSize.xl, 'headline-medium'),
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 560),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: <Widget>[
          for (final (MPSize size, String role) in _sizes)
            MPBlockquote(
              size: size,
              icon: false,
              source: Text(role),
              child: const Text('Simplicity is about subtracting the obvious.'),
            ),
        ],
      ),
    );
  }
}
