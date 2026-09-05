import * as React from 'react';
import { MPChip, MPDataTable, MPTypography } from 'material-plus-ui';
import type { MPDataTableColumn } from 'material-plus-ui';

interface Release {
  id: number;
  package: string;
  version: string;
  status: 'live' | 'review' | 'draft';
  downloads: number;
  published: string;
}

/** The order a status goes in, which is not the order its letters go in. */
const STAGE: Record<Release['status'], number> = { draft: 0, review: 1, live: 2 };

const ROWS: Release[] = [
  {
    id: 1,
    package: 'material-plus-ui',
    version: '1.6.0',
    status: 'live',
    downloads: 18240,
    published: '2026-08-02'
  },
  {
    id: 2,
    package: 'material-plus-icons',
    version: '0.9.4',
    status: 'review',
    downloads: 3120,
    published: '2026-08-19'
  },
  {
    id: 3,
    package: 'material-plus-tokens',
    version: '2.1.0',
    status: 'live',
    downloads: 9870,
    published: '2026-07-28'
  },
  {
    id: 4,
    package: 'material-plus-cli',
    version: '0.3.1',
    status: 'draft',
    downloads: 412,
    published: '2026-08-25'
  },
  {
    id: 5,
    package: 'material-plus-codemod',
    version: '0.2.0',
    status: 'draft',
    downloads: 96,
    published: '2026-06-11'
  },
  {
    id: 6,
    package: 'material-plus-themes',
    version: '1.2.2',
    status: 'live',
    downloads: 5410,
    published: '2026-08-14'
  },
  {
    id: 7,
    package: 'material-plus-charts',
    version: '0.1.0',
    status: 'review',
    downloads: 231,
    published: '2026-08-30'
  }
];

const COLOURS: Record<Release['status'], 'primary' | 'secondary' | 'tertiary'> = {
  live: 'primary',
  review: 'tertiary',
  draft: 'secondary'
};

const COLUMNS: MPDataTableColumn<Release>[] = [
  { key: 'package', label: 'Package', width: 210 },
  { key: 'version', label: 'Version', width: 120 },
  {
    key: 'status',
    label: 'Status',
    width: 120,
    // A chip has no order and no text a file can hold, so the column says what
    // to rank it by and what to write out.
    compare: (a, b) => STAGE[a.status] - STAGE[b.status],
    exportValue: (row) => row.status,
    render: (row) => (
      <MPChip size="xs" variant="tonal" color={COLOURS[row.status]}>
        {row.status}
      </MPChip>
    )
  },
  {
    key: 'downloads',
    label: 'Downloads',
    align: 'end',
    width: 140,
    render: (row) => row.downloads.toLocaleString('en-US')
  },
  { key: 'published', label: 'Published', width: 130 }
];

/** Sorted, searched, paged, chosen from and downloadable — all of it at once. */
export default function DataTableHero() {
  const [selected, setSelected] = React.useState<React.Key[]>([2]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MPDataTable
        headers={COLUMNS}
        items={ROWS}
        getRowKey={(row) => row.id}
        caption="Packages published this quarter"
        sortable
        sortMode="multiple"
        searchable
        resizable
        paged
        defaultPageSize={5}
        pageSizeOptions={[5, 10]}
        selectionMode="multiple"
        checkboxes
        selected={selected}
        onSelectedChange={setSelected}
        exportable
        exportFileName="packages.csv"
        striped
        defaultSort={[{ key: 'status', direction: 'desc' }]}
      />

      <MPTypography level="caption">
        Press a heading to sort it, Shift-press a second to add it. Drag the line between two
        headings, or focus it and use the arrow keys.
      </MPTypography>
    </div>
  );
}
