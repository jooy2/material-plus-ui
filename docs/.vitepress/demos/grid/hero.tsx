import { MPBox, MPGrid, MPGridItem, MPTypography } from 'material-plus-ui';

/**
 * A twelve-column row, divided.
 *
 * Every cell is a width and nothing else — the sheet inside each one is an
 * MPBox, because wrapping something in a layout must not change how it looks.
 */
function Cell({ label }: { label: string }) {
  return (
    <MPBox variant="filled" size="sm" style={{ textAlign: 'center' }}>
      <MPTypography level="caption">{label}</MPTypography>
    </MPBox>
  );
}

export default function GridHero() {
  return (
    <MPGrid style={{ width: '100%' }}>
      <MPGridItem span={12}>
        <Cell label="span 12" />
      </MPGridItem>

      <MPGridItem span={6}>
        <Cell label="span 6" />
      </MPGridItem>
      <MPGridItem span={6}>
        <Cell label="span 6" />
      </MPGridItem>

      <MPGridItem span={4}>
        <Cell label="span 4" />
      </MPGridItem>
      <MPGridItem span={4}>
        <Cell label="span 4" />
      </MPGridItem>
      <MPGridItem span={4}>
        <Cell label="span 4" />
      </MPGridItem>

      <MPGridItem span={4} offset={4}>
        <Cell label="span 4, offset 4" />
      </MPGridItem>
    </MPGrid>
  );
}
