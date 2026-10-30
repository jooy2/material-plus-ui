import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const String _sentence = 'The migration ran on Tuesday and finished in four minutes.';

/// Four weights, and the default is the one that is a highlighter pen: `tonal`
/// is a container tone, a pale wash under dark ink, rather than a word
/// replaced by a block of colour.
class HighlightVariants extends StatelessWidget {
  const HighlightVariants({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle.merge(
      style: theme.typescale.bodyLarge.style(theme.colors.onSurface).copyWith(height: 1.8),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPHighlight(_sentence, query: 'Tuesday', variant: MPHighlightVariant.tonal),
          MPHighlight(_sentence, query: 'Tuesday', variant: MPHighlightVariant.filled),
          MPHighlight(_sentence, query: 'Tuesday', variant: MPHighlightVariant.outlined),
          MPHighlight(
            _sentence,
            query: 'Tuesday',
            variant: MPHighlightVariant.text,
            underline: true,
          ),
        ],
      ),
    );
  }
}
