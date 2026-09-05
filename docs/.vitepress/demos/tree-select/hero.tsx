import * as React from 'react';
import { MPFlex, MPTreeSelect, MPTypography } from 'material-plus-ui';
import type { MPTreeSelectItem } from 'material-plus-ui';

/**
 * A taxonomy three levels deep, which is the shape a flat list flattens away:
 * "Seoul" and "Kyoto" mean different things under different parents.
 */
const REGIONS: MPTreeSelectItem[] = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' }
        ]
      },
      { value: 'spain', label: 'Spain' },
      { value: 'portugal', label: 'Portugal' }
    ]
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [
      {
        value: 'korea',
        label: 'Korea',
        children: [
          { value: 'seoul', label: 'Seoul' },
          { value: 'busan', label: 'Busan' }
        ]
      },
      {
        value: 'japan',
        label: 'Japan',
        children: [
          { value: 'tokyo', label: 'Tokyo' },
          { value: 'kyoto', label: 'Kyoto' }
        ]
      }
    ]
  },
  {
    value: 'americas',
    label: 'Americas',
    children: [
      { value: 'canada', label: 'Canada' },
      { value: 'brazil', label: 'Brazil', disabled: true }
    ]
  }
];

/** The same tree twice: one answer out of the leaves, and several out of anywhere. */
export default function TreeSelectHero() {
  const [one, setOne] = React.useState<(string | number)[]>(['seoul']);
  const [many, setMany] = React.useState<(string | number)[]>(['europe', 'tokyo']);

  return (
    <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={24} align="start">
      <MPFlex direction="column" gap={8} style={{ flex: 1, minWidth: 0 }}>
        <MPTypography level="caption">searchable</MPTypography>
        <MPTreeSelect
          label="Region"
          items={REGIONS}
          searchable
          clearable
          fullWidth
          value={one}
          onValueChange={setOne}
          description="The branches are the taxonomy; the leaves are the answers."
        />
      </MPFlex>

      <MPFlex direction="column" gap={8} style={{ flex: 1, minWidth: 0 }}>
        <MPTypography level="caption">multiple, selectableBranches</MPTypography>
        <MPTreeSelect
          label="Covers"
          items={REGIONS}
          multiple
          selectableBranches
          clearable
          fullWidth
          color="tertiary"
          value={many}
          onValueChange={setMany}
          format={(chosen) => `${chosen.length} region${chosen.length === 1 ? '' : 's'}`}
          description="A whole continent counts, so the trigger says how many rather than which."
        />
      </MPFlex>
    </MPFlex>
  );
}
