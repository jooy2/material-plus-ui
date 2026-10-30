import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Four lines typed in sequence, each held back by a `delay`.
///
/// The text is in the semantics from the first frame — a screen reader reads
/// it once rather than sitting through the performance — and each line is laid
/// out for its finished length, so nothing here moves as the characters arrive
/// and nobody is kept waiting on the effect.
class AnimateTypingTerminal extends StatelessWidget {
  const AnimateTypingTerminal({super.key});

  static const List<(String, Duration)> _lines = <(String, Duration)>[
    (r'$ npm install material-plus-ui', Duration.zero),
    ('added 3 packages in 1.4s', Duration(milliseconds: 1600)),
    (r'$ npm run dev', Duration(milliseconds: 2600)),
    ('ready — http://localhost:5173', Duration(milliseconds: 4000)),
  ];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 440),
      child: MPBox(
        variant: MPVariant.filled,
        child: DefaultTextStyle.merge(
          style: const TextStyle(fontFamily: 'monospace'),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 4,
            children: <Widget>[
              for (final (int index, (String text, Duration delay)) in _lines.indexed)
                MPAnimateTyping(
                  text: text,
                  speed: 40,
                  delay: delay,
                  caret: index == _lines.length - 1,
                  style: const TextStyle(fontSize: 13.6),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
