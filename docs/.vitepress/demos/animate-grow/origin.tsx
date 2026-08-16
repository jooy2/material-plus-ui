import { MPAnimateGrow, MPBox, MPTypography } from 'material-plus-ui';

/**
 * The same effect anchored four ways.
 *
 * `origin` takes any CSS `transform-origin`, and it governs the standalone
 * `scale` property as well as the shorthand — which is what lets this effect
 * stay off `transform` entirely, so a caller's own transform survives it.
 *
 * `fade={false}` is for something already on the page that is only changing
 * size, where a repeated fade would read as flickering.
 */
export default function AnimateGrowOrigin() {
  const corners = ['top left', 'top right', 'bottom left', 'bottom right'];

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        width: '100%',
        maxWidth: 460
      }}
    >
      {corners.map((origin) => (
        <MPAnimateGrow
          key={origin}
          origin={origin}
          from={0.6}
          repeat="infinite"
          alternate
          fade={false}
          duration={1400}
        >
          <MPBox size="sm">
            <MPTypography level="caption">{origin}</MPTypography>
          </MPBox>
        </MPAnimateGrow>
      ))}
    </div>
  );
}
