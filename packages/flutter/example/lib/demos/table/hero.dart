import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class TableHero extends StatelessWidget {
  const TableHero({super.key});

  static const List<_Build> _builds = <_Build>[
    _Build(id: '4821', branch: 'main', status: _Status.passed, duration: 184),
    _Build(id: '4820', branch: 'feat/tooltip', status: _Status.failed, duration: 96),
    _Build(id: '4819', branch: 'feat/chip', status: _Status.running, duration: 41),
  ];

  static const Map<_Status, MPColor> _colours = <_Status, MPColor>{
    _Status.passed: MPColor.tertiary,
    _Status.failed: MPColor.error,
    _Status.running: MPColor.primary,
  };

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: MPTable<_Build>(
        headers: <MPTableColumn<_Build>>[
          MPTableColumn<_Build>(
            key: 'id',
            label: const Text('#'),
            width: 72,
            render: (_Build row, int index) => Text(row.id),
          ),
          MPTableColumn<_Build>(
            key: 'branch',
            label: const Text('Branch'),
            render: (_Build row, int index) => Text(row.branch),
          ),
          MPTableColumn<_Build>(
            key: 'status',
            label: const Text('Status'),
            render: (_Build row, int index) => MPChip(
              size: MPSize.xs,
              variant: MPVariant.tonal,
              color: _colours[row.status],
              child: Text(row.status.name),
            ),
          ),
          MPTableColumn<_Build>(
            key: 'duration',
            label: const Text('Duration'),
            align: MPAlign.end,
            render: (_Build row, int index) => Text('${row.duration}s'),
          ),
        ],
        items: _builds,
        getRowKey: (_Build row, int index) => row.id,
        size: MPSize.sm,
        striped: true,
        hoverable: true,
      ),
    );
  }
}

enum _Status { passed, failed, running }

class _Build {
  const _Build({
    required this.id,
    required this.branch,
    required this.status,
    required this.duration,
  });

  final String id;
  final String branch;
  final _Status status;
  final int duration;
}
