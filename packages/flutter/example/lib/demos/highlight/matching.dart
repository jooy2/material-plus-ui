import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// How the matching is done is a parameter, not something a caller
/// pre-computes into a list of offsets.
class HighlightMatching extends StatelessWidget {
  const HighlightMatching({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle.merge(
      style: theme.typescale.bodyLarge.style(theme.colors.onSurface).copyWith(height: 1.8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: <Widget>[
          const MPHighlight('A cat, a Cat and concatenate', query: 'cat'),
          const MPHighlight('A cat, a Cat and concatenate', query: 'cat', caseSensitive: true),
          const MPHighlight('A cat, a Cat and concatenate', query: 'cat', wholeWord: true),
          MPHighlight(
            'Released 2026-08-10, superseded 2026-09-01.',
            query: RegExp(r'\d{4}-\d{2}-\d{2}'),
            color: MPColor.primary,
          ),
        ],
      ),
    );
  }
}
