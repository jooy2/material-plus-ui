import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class AccordionDividers extends StatelessWidget {
  const AccordionDividers({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          MPAccordion(
            initialValue: <Object>['a'],
            children: <Widget>[
              MPAccordionItem(
                value: 'a',
                title: Text('Ruled'),
                child: Text('The default. A hairline in `outline-variant` between the sections.'),
              ),
              MPAccordionItem(
                value: 'b',
                title: Text('One thing, in parts'),
                child: Text('Nothing here is a card.'),
              ),
            ],
          ),
          MPAccordion(
            dividers: false,
            variant: MPVariant.filled,
            initialValue: <Object>['a'],
            children: <Widget>[
              MPAccordionItem(
                value: 'a',
                title: Text('Tiled'),
                child: Text('Each section is its own rounded row.'),
              ),
              MPAccordionItem(
                value: 'b',
                title: Text('Separate things, stacked'),
                child: Text('Hover the headers to see where each tile ends.'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
