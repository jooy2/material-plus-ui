import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The five rungs, and the one that is the specification's.
///
/// Material defines a single size for a text field, the 56px `md`, so that is
/// what you get by saying nothing. The other four are this library's, for the
/// places a design system does not plan for: a filter bar, a table's inline
/// editor, a dense settings page.
const List<(MPSize, String)> _sizes = <(MPSize, String)>[
  (MPSize.xs, '32px'),
  (MPSize.sm, '40px'),
  (MPSize.md, '56px — Material’s own size, and the default'),
  (MPSize.lg, '64px'),
  (MPSize.xl, '72px'),
];

class TextFieldSizes extends StatefulWidget {
  const TextFieldSizes({super.key});

  @override
  State<TextFieldSizes> createState() => _TextFieldSizesState();
}

class _TextFieldSizesState extends State<TextFieldSizes> {
  final Map<MPSize, String> _values = <MPSize, String>{};

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          for (final (MPSize size, String note) in _sizes)
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 6,
              children: <Widget>[
                MPTypography('size: MPSize.${size.name} — $note', level: MPTypographyLevel.caption),
                MPTextField(
                  label: const Text('Search'),
                  size: size,
                  value: _values[size] ?? '',
                  onChanged: (String next) => setState(() => _values[size] = next),
                  fullWidth: true,
                ),
              ],
            ),
        ],
      ),
    );
  }
}
