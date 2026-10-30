import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<MPTransferItem> _columns = <MPTransferItem>[
  MPTransferItem(value: 'name', label: Text('Name')),
  MPTransferItem(value: 'email', label: Text('Email')),
  MPTransferItem(value: 'role', label: Text('Role')),
  MPTransferItem(value: 'team', label: Text('Team')),
  MPTransferItem(value: 'joined', label: Text('Joined')),
  MPTransferItem(value: 'last-seen', label: Text('Last seen')),
  MPTransferItem(value: 'id', label: Text('Internal ID'), disabled: true),
];

/// Ticking is not choosing.
///
/// `value` is which side a row is on; a tick is a mark saying it should move
/// the next time an arrow is pressed. So `onChanged` fires on the arrow and
/// never on a tick, and what a caller stores is the answer rather than the
/// working.
class TransferHero extends StatefulWidget {
  const TransferHero({super.key});

  @override
  State<TransferHero> createState() => _TransferHeroState();
}

class _TransferHeroState extends State<TransferHero> {
  List<String> _chosen = <String>['name', 'email'];

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: <Widget>[
        MPTransfer(
          size: MPSize.sm,
          height: 180,
          items: _columns,
          value: _chosen,
          onChanged: (List<String> next) => setState(() => _chosen = next),
          sourceLabel: const Text('All columns'),
          targetLabel: const Text('In the report'),
        ),
        MPTypography(
          'The report shows: ${_chosen.isNotEmpty ? _chosen.join(', ') : 'nothing yet'}.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
