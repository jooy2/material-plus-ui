import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DataTableHero extends StatefulWidget {
  const DataTableHero({super.key});

  @override
  State<DataTableHero> createState() => _DataTableHeroState();
}

class _DataTableHeroState extends State<DataTableHero> {
  List<Object> _selected = <Object>[2];
  String? _exported;

  static const List<_Release> _rows = <_Release>[
    _Release(1, 'material-plus-ui', '1.6.0', _Status.live, 18240, '2026-08-02'),
    _Release(2, 'material-plus-icons', '0.9.4', _Status.review, 3120, '2026-08-19'),
    _Release(3, 'material-plus-tokens', '2.1.0', _Status.live, 9870, '2026-07-28'),
    _Release(4, 'material-plus-cli', '0.3.1', _Status.draft, 412, '2026-08-25'),
    _Release(5, 'material-plus-codemod', '0.2.0', _Status.draft, 96, '2026-06-11'),
    _Release(6, 'material-plus-themes', '1.2.2', _Status.live, 5410, '2026-08-14'),
    _Release(7, 'material-plus-charts', '0.1.0', _Status.review, 231, '2026-08-30'),
  ];

  /// The order a status goes in, which is not the order its letters go in.
  static const Map<_Status, int> _stage = <_Status, int>{
    _Status.draft: 0,
    _Status.review: 1,
    _Status.live: 2,
  };

  static const Map<_Status, MPColor> _colours = <_Status, MPColor>{
    _Status.live: MPColor.primary,
    _Status.review: MPColor.tertiary,
    _Status.draft: MPColor.secondary,
  };

  static String _thousands(int value) {
    return value.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (Match _) => ',');
  }

  static final List<MPDataTableColumn<_Release>> _columns = <MPDataTableColumn<_Release>>[
    MPDataTableColumn<_Release>(
      key: 'package',
      label: const Text('Package'),
      width: 210,
      value: (_Release row) => row.package,
    ),
    MPDataTableColumn<_Release>(
      key: 'version',
      label: const Text('Version'),
      width: 120,
      value: (_Release row) => row.version,
    ),
    MPDataTableColumn<_Release>(
      key: 'status',
      label: const Text('Status'),
      width: 120,
      // A chip has no order and no text a file can hold, so the column says
      // what to rank it by and what to write out.
      compare: (_Release a, _Release b) => _stage[a.status]! - _stage[b.status]!,
      value: (_Release row) => row.status.name,
      exportValue: (_Release row) => row.status.name,
      render: (_Release row, int index) => Align(
        alignment: AlignmentDirectional.centerStart,
        child: MPChip(
          size: MPSize.xs,
          variant: MPVariant.tonal,
          color: _colours[row.status],
          child: Text(row.status.name),
        ),
      ),
    ),
    MPDataTableColumn<_Release>(
      key: 'downloads',
      label: const Text('Downloads'),
      align: MPAlign.end,
      width: 140,
      value: (_Release row) => row.downloads,
      render: (_Release row, int index) => Text(_thousands(row.downloads)),
    ),
    MPDataTableColumn<_Release>(
      key: 'published',
      label: const Text('Published'),
      width: 130,
      value: (_Release row) => row.published,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        MPDataTable<_Release>(
          headers: _columns,
          items: _rows,
          getRowKey: (_Release row, int index) => row.id,
          caption: const Text('Packages published this quarter'),
          sortable: true,
          sortMode: MPDataTableSortMode.multiple,
          searchable: true,
          resizable: true,
          paged: true,
          initialPageSize: 5,
          pageSizeOptions: const <int>[5, 10],
          selectionMode: MPDataTableSelectionMode.multiple,
          checkboxes: true,
          selected: _selected,
          onSelectedChange: (List<Object> keys, List<_Release> rows) =>
              setState(() => _selected = keys),
          exportable: true,
          // Flutter cannot write a file from a widget, so the table hands the
          // CSV over and the app saves it; the demo shows how long it was.
          onExport: (String csv) => setState(() => _exported = csv),
          striped: true,
          initialSort: const <MPDataTableSort>[
            MPDataTableSort(key: 'status', direction: MPSortDirection.desc),
          ],
        ),
        MPTypography(
          _exported == null
              ? 'Press a heading to sort it, Shift-press a second to add it. Drag the line '
                    'between two headings, or focus it and use the arrow keys.'
              : 'Exported ${_exported!.split('\r\n').length - 1} rows as CSV.',
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}

enum _Status { live, review, draft }

class _Release {
  const _Release(this.id, this.package, this.version, this.status, this.downloads, this.published);

  final int id;
  final String package;
  final String version;
  final _Status status;
  final int downloads;
  final String published;
}
