import { MPCard, MPChip, MPFlex, MPScrollZone, MPTypography } from 'material-plus-ui';

const CATEGORIES = [
  'Espresso',
  'Filter',
  'Cold brew',
  'Decaf',
  'Single origin',
  'Blends',
  'Green tea',
  'Black tea',
  'Herbal',
  'Chocolate',
  'Equipment',
  'Gifts'
];

const SHELF = [
  'Kenya AA',
  'Ethiopia Guji',
  'Colombia Huila',
  'Brazil Cerrado',
  'Guatemala Antigua',
  'Rwanda Nyamasheke',
  'Peru Cajamarca',
  'Honduras Marcala'
];

/**
 * The two shapes a strip takes: a row of chips with the buttons beside it, and a
 * shelf of cards two rows deep with the buttons over it.
 */
export default function ScrollZoneHero() {
  return (
    <MPFlex direction="column" gap={24} style={{ width: '100%' }}>
      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">One line, buttons beside the strip</MPTypography>
        <MPScrollZone label="Categories" size="sm">
          {CATEGORIES.map((category) => (
            <MPChip key={category}>{category}</MPChip>
          ))}
        </MPScrollZone>
      </MPFlex>

      <MPFlex direction="column" gap={8}>
        <MPTypography level="caption">Two lines, buttons over it</MPTypography>
        <MPScrollZone label="Origins" lines={2} buttonPlacement="overlay" snap gap={12}>
          {SHELF.map((origin) => (
            <MPCard key={origin} style={{ width: 180 }}>
              <MPTypography level="h6">{origin}</MPTypography>
              <MPTypography level="caption">Roasted last week</MPTypography>
            </MPCard>
          ))}
        </MPScrollZone>
      </MPFlex>
    </MPFlex>
  );
}
