import { MPAnimateMarquee, MPBox, MPTypography } from 'material-plus-ui';

/**
 * Vertical, reversed, and slower.
 *
 * `speed` is pixels per second rather than a duration, so these two strips move
 * at the same pace even though one holds twice as much as the other — which is
 * exactly what a duration could not do.
 */
export default function AnimateMarqueeVertical() {
  const left = ['Seoul', 'Tokyo', 'Taipei', 'Osaka'];
  const right = ['Paris', 'Lisbon', 'Madrid', 'Berlin', 'Vienna', 'Oslo', 'Dublin', 'Prague'];

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        width: '100%',
        maxWidth: 380
      }}
    >
      {[left, right].map((cities, index) => (
        <MPAnimateMarquee
          key={index}
          orientation="vertical"
          reverse={index === 1}
          speed={30}
          gap="0.5rem"
          style={{ height: 160 }}
        >
          {cities.map((city) => (
            <MPBox key={city} size="sm" style={{ width: '100%' }}>
              <MPTypography level="caption">{city}</MPTypography>
            </MPBox>
          ))}
        </MPAnimateMarquee>
      ))}
    </div>
  );
}
