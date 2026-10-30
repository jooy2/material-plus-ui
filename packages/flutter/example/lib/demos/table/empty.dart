import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TableEmpty extends StatelessWidget {
  const TableEmpty({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPTable<Map<String, Object?>>(
        size: MPSize.sm,
        headers: const <MPTableColumn<Map<String, Object?>>>[
          MPTableColumn<Map<String, Object?>>(key: 'id', label: Text('#'), width: 72),
          MPTableColumn<Map<String, Object?>>(key: 'branch', label: Text('Branch')),
          MPTableColumn<Map<String, Object?>>(key: 'status', label: Text('Status')),
        ],
        items: const <Map<String, Object?>>[],
        empty: MPEmpty(
          size: MPSize.sm,
          title: const Text('No builds yet'),
          action: MPButton(
            size: MPSize.xs,
            variant: MPVariant.tonal,
            onPressed: () {},
            child: const Text('Run one'),
          ),
          child: const Text('Push to any branch and the first build shows up here.'),
        ),
      ),
    );
  }
}
