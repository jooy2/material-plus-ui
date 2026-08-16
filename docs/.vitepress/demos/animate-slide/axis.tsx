import { MPAnimateSlide, MPBox, MPTypography } from 'material-plus-ui';
import type { MPSide } from 'material-plus-ui';

/**
 * The four edges, and a short travel rather than the default.
 *
 * `distance` is what turns a slide from an entrance out of frame into a
 * settling in place. Short is the right choice for something that is already
 * roughly where it belongs — a shared-axis step between two views, rather than
 * a panel arriving from off screen.
 */
export default function AnimateSlideAxis() {
  const sides: MPSide[] = ['top', 'right', 'bottom', 'left'];

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
      {sides.map((side) => (
        <MPAnimateSlide
          key={side}
          from={side}
          distance="1.5rem"
          repeat="infinite"
          alternate
          duration={1400}
        >
          <MPBox size="sm">
            <MPTypography level="caption">from=&quot;{side}&quot;</MPTypography>
          </MPBox>
        </MPAnimateSlide>
      ))}
    </div>
  );
}
