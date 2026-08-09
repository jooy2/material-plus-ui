import { MPChip, MPTable } from 'material-plus-ui';
import type { MPTableColumn } from 'material-plus-ui';

interface Build {
  id: string;
  branch: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
}

const BUILDS: Build[] = [
  { id: '4821', branch: 'main', status: 'passed', duration: 184 },
  { id: '4820', branch: 'feat/tooltip', status: 'failed', duration: 96 },
  { id: '4819', branch: 'feat/chip', status: 'running', duration: 41 }
];

const COLOURS = { passed: 'tertiary', failed: 'error', running: 'primary' } as const;

const COLUMNS: MPTableColumn<Build>[] = [
  { key: 'id', label: '#', width: 72 },
  { key: 'branch', label: 'Branch' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <MPChip size="xs" variant="tonal" color={COLOURS[row.status]}>
        {row.status}
      </MPChip>
    )
  },
  { key: 'duration', label: 'Duration', align: 'end', render: (row) => `${row.duration}s` }
];

export default function TableHero() {
  return (
    <div style={{ width: '100%' }}>
      <MPTable
        headers={COLUMNS}
        items={BUILDS}
        getRowKey={(row) => row.id}
        size="sm"
        striped
        hoverable
      />
    </div>
  );
}
