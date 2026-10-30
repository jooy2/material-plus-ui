import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<String> _people = <String>[
  'Ada Lovelace',
  'Alan Turing',
  'Barbara Liskov',
  'Grace Hopper',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Radia Perlman',
];

/// `searchable` puts a filter above each list, and each one narrows its own
/// side.
///
/// A press moves only what the filter is still showing: a row that was ticked
/// and then hidden was never part of that press, which is what keeps a filter
/// from moving things the reader cannot see.
class TransferSearchable extends StatelessWidget {
  const TransferSearchable({super.key});

  @override
  Widget build(BuildContext context) {
    return MPTransfer(
      size: MPSize.sm,
      searchable: true,
      height: 160,
      items: <MPTransferItem>[
        for (final String name in _people) MPTransferItem(value: name, label: Text(name)),
      ],
      initialValue: const <String>['Grace Hopper'],
      sourceLabel: const Text('Everyone'),
      targetLabel: const Text('On the channel'),
    );
  }
}
