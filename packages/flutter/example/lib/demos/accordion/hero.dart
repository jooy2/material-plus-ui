import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class AccordionHero extends StatelessWidget {
  const AccordionHero({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: const MPAccordion(
        initialValue: <Object>['delivery'],
        children: <Widget>[
          MPAccordionItem(
            value: 'delivery',
            title: Text('Delivery'),
            subtitle: Text('Three to five working days'),
            child: Text(
              'Standard delivery is included in the price. Express arrives the next working day '
              'and is charged at checkout.',
            ),
          ),
          MPAccordionItem(
            value: 'returns',
            title: Text('Returns'),
            subtitle: Text('Thirty days'),
            child: Text(
              'Anything unopened can go back within thirty days. We pay the postage, and the '
              'refund lands on the card that paid.',
            ),
          ),
          MPAccordionItem(
            value: 'warranty',
            title: Text('Warranty'),
            subtitle: Text('Two years on parts'),
            child: Text(
              'Parts and labour for the first year, parts only for the second. Wear items are '
              'not covered.',
            ),
          ),
        ],
      ),
    );
  }
}
