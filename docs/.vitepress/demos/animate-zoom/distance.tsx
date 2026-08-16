import { MPAnimateZoom, MPBox, MPTypography } from 'material-plus-ui';

/**
 * `from` is the whole dial.
 *
 * Below `1` the content comes forward out of the middle. Above `1` it arrives
 * oversized and settles back, which reads as something being pushed *towards*
 * the reader rather than rising out of the page.
 */
export default function AnimateZoomDistance() {
  const strengths = [0.2, 0.4, 0.8, 1.3];

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
      {strengths.map((from) => (
        <MPAnimateZoom key={from} from={from} repeat="infinite" alternate duration={1500}>
          <MPBox size="sm">
            <MPTypography level="caption">from={from}</MPTypography>
          </MPBox>
        </MPAnimateZoom>
      ))}
    </div>
  );
}
