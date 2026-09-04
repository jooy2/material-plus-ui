import { MPBox, MPFlex, MPTypography } from 'material-plus-ui';

/**
 * The layout decision this component exists for: a column on a phone and a row
 * from 600dp up, said once and resolved by the browser.
 *
 * Narrow the window past 600px and the first group turns. Nothing re-renders —
 * the direction is a custom property a media query changes.
 */
function Cell({ label }: { label: string }) {
  return (
    <MPBox variant="filled" size="sm" style={{ textAlign: 'center', flex: 1 }}>
      <MPTypography level="caption">{label}</MPTypography>
    </MPBox>
  );
}

export default function FlexHero() {
  return (
    <MPFlex direction="column" gap={24} style={{ width: '100%' }}>
      <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={8}>
        <Cell label="column on a phone" />
        <Cell label="row from 600dp" />
        <Cell label="and up" />
      </MPFlex>

      <MPFlex justify="space-between" align="center" gap={8}>
        <Cell label="space-between" />
        <Cell label="centred across" />
      </MPFlex>

      <MPFlex wrap gap={8}>
        <MPBox variant="outlined" size="sm" style={{ width: 160 }}>
          <MPTypography level="caption">wrap</MPTypography>
        </MPBox>
        <MPBox variant="outlined" size="sm" style={{ width: 160 }}>
          <MPTypography level="caption">onto</MPTypography>
        </MPBox>
        <MPBox variant="outlined" size="sm" style={{ width: 160 }}>
          <MPTypography level="caption">another line</MPTypography>
        </MPBox>
      </MPFlex>
    </MPFlex>
  );
}
