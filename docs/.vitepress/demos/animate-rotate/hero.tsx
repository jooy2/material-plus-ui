import { ICONS, MPAnimateRotate, MPBox, MPIcon, MPTypography } from 'material-plus-ui';

/**
 * Two angles rather than one, which is what lets this be both effects a
 * rotation is ever used for.
 *
 * `from` alone is an arrival — something swinging into place and stopping.
 * `from` and `to` together with an infinite repeat and a linear curve is a spin
 * that never lands.
 */
export default function AnimateRotateHero() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        width: '100%',
        maxWidth: 420
      }}
    >
      <MPBox size="sm">
        <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <MPAnimateRotate repeat="infinite" alternate duration={1800}>
            <MPIcon icon={ICONS['chevron-down']} size={28} />
          </MPAnimateRotate>
          <MPTypography level="caption">An arrival</MPTypography>
        </div>
      </MPBox>

      <MPBox size="sm">
        <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <MPAnimateRotate
            from={0}
            to={360}
            repeat="infinite"
            easing="linear"
            fade={false}
            duration={2400}
          >
            <MPIcon icon={ICONS.spinner} size={28} />
          </MPAnimateRotate>
          <MPTypography level="caption">A spin</MPTypography>
        </div>
      </MPBox>
    </div>
  );
}
