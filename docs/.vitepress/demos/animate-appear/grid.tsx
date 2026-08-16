import { MPAnimateAppear, MPBox, MPTypography } from 'material-plus-ui';

/**
 * `render` puts the stagger on a real grid, so the cells stay the grid's own
 * direct children rather than being wrapped one layer deeper.
 *
 * `trigger="visible"` with `once={false}` replays the whole set every time it
 * comes back into view, which is what makes it worth scrolling past twice.
 */
export default function AnimateAppearGrid() {
  const tiles = ['Overview', 'Traffic', 'Revenue', 'Retention', 'Latency', 'Errors'];

  return (
    <MPAnimateAppear
      trigger="visible"
      once={false}
      threshold={0.3}
      stagger={60}
      from="bottom"
      render={
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            width: '100%',
            maxWidth: 480
          }}
        />
      }
    >
      {tiles.map((tile) => (
        <MPBox key={tile} size="sm">
          <MPTypography level="caption">{tile}</MPTypography>
        </MPBox>
      ))}
    </MPAnimateAppear>
  );
}
