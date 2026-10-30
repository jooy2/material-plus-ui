import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class BlockquoteHero extends StatelessWidget {
  const BlockquoteHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 560),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: <Widget>[
          MPBlockquote(
            author: Text('Ada Lovelace'),
            source: Text('Notes on the Analytical Engine'),
            child: Text('The Analytical Engine has no pretensions whatever to originate anything.'),
          ),
          MPBlockquote(
            variant: MPVariant.tonal,
            size: MPSize.sm,
            icon: false,
            author: Text('Design review'),
            child: Text(
              'A heading set in 600 is the fastest way to make a Material page look like it '
              'belongs to some other system.',
            ),
          ),
        ],
      ),
    );
  }
}
