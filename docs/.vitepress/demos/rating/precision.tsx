import { useState } from 'react';
import { MPRating, MPTypography } from 'material-plus-ui';

/**
 * `precision` bounds what can be *chosen*, and nothing else.
 *
 * The read-only row at the bottom is an average of 4.3, and it is drawn as four
 * stars and a third at every precision — because an average is not a choice, and
 * rounding it to the nearest half would be reporting a different number from the
 * one the component was handed.
 */
export default function RatingPrecision() {
  const [half, setHalf] = useState(3.5);

  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <MPTypography level="caption">precision={'{0.5}'} — half stars</MPTypography>
        <MPRating precision={0.5} value={half} onValueChange={setHalf} />
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        <MPTypography level="caption">readOnly — an average of 4.3</MPTypography>
        <MPRating value={4.3} readOnly />
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        <MPTypography level="caption">
          color=&quot;tertiary&quot;, if gold is what you want
        </MPTypography>
        <MPRating value={4} readOnly color="tertiary" />
      </div>
    </div>
  );
}
