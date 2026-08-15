import { useState } from 'react';
import { MPRating, MPTypography } from 'material-plus-ui';

/**
 * A score out of five.
 *
 * Underneath is a radio group of real inputs, one per choosable score — so the
 * row is one tab stop, the arrow keys move within it, and the value goes into a
 * form submission without anything being wired up.
 */
export default function RatingHero() {
  const [score, setScore] = useState(4);

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <MPRating value={score} onValueChange={setScore} size="lg" />

      <MPTypography level="caption">
        {score === 0 ? 'Nothing chosen — press a star.' : `You gave it ${score} out of 5.`}
      </MPTypography>
    </div>
  );
}
