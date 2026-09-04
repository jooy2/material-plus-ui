import { MPCard, MPChip, MPDataList, MPDataListItem, MPFlex, MPTextLink } from 'material-plus-ui';

/** The same record twice: beside its labels, and under them. */
export default function DataListHero() {
  return (
    <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={24} align="start">
      <MPCard title="Beside" style={{ flex: 1, minWidth: 0 }}>
        <MPDataList dividers>
          <MPDataListItem label="Status">
            <MPChip color="tertiary">Active</MPChip>
          </MPDataListItem>
          <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
          <MPDataListItem label="Repository">
            <MPTextLink href="#">acme/voltage</MPTextLink>
          </MPDataListItem>
          <MPDataListItem label="Last deployed">4 March 2026, 09:12</MPDataListItem>
        </MPDataList>
      </MPCard>

      <MPCard title="Under" style={{ flex: 1, minWidth: 0 }}>
        <MPDataList orientation="vertical">
          <MPDataListItem label="Status">
            <MPChip color="tertiary">Active</MPChip>
          </MPDataListItem>
          <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
          <MPDataListItem label="Repository">
            <MPTextLink href="#">acme/voltage</MPTextLink>
          </MPDataListItem>
          <MPDataListItem label="Last deployed">4 March 2026, 09:12</MPDataListItem>
        </MPDataList>
      </MPCard>
    </MPFlex>
  );
}
