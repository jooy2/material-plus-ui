import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const String _passage =
    'A database is a structured set of data. The word data is the plural of datum, and a data '
    'set that nobody can query is a file.';

/// The component is the search, not just the styling: `query` is whatever the
/// field holds, and the marking runs again on its own as it changes.
class HighlightHero extends StatefulWidget {
  const HighlightHero({super.key});

  @override
  State<HighlightHero> createState() => _HighlightHeroState();
}

class _HighlightHeroState extends State<HighlightHero> {
  String _query = 'data';

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 460),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: <Widget>[
          MPTextField(
            label: const Text('Find in page'),
            value: _query,
            onChanged: (String next) => setState(() => _query = next),
            size: MPSize.sm,
            fullWidth: true,
          ),
          DefaultTextStyle.merge(
            style: theme.typescale.bodyLarge.style(theme.colors.onSurface).copyWith(height: 1.7),
            child: MPHighlight(_passage, query: _query),
          ),
        ],
      ),
    );
  }
}
