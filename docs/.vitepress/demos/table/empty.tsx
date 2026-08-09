import { MPButton, MPEmpty, MPTable } from 'material-plus-ui';

export default function TableEmpty() {
  return (
    <div style={{ width: '100%' }}>
      <MPTable
        size="sm"
        headers={[
          { key: 'id', label: '#', width: 72 },
          { key: 'branch', label: 'Branch' },
          { key: 'status', label: 'Status' }
        ]}
        items={[]}
        empty={
          <MPEmpty
            size="sm"
            title="No builds yet"
            action={
              <MPButton size="xs" variant="tonal">
                Run one
              </MPButton>
            }
          >
            Push to any branch and the first build shows up here.
          </MPEmpty>
        }
      />
    </div>
  );
}
