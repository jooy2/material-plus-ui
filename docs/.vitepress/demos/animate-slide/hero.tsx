import { useState } from 'react';
import { MPAnimateSlide, MPButton, MPCard, MPTypography } from 'material-plus-ui';

/**
 * The default distance is the element's own size, so it starts exactly out of
 * frame. Put the slide in a box with `overflow: hidden` and the effect is a
 * panel appearing from behind that box's edge.
 */
export default function AnimateSlideHero() {
  const [play, setPlay] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <div style={{ overflow: 'hidden', width: '100%', maxWidth: 420, padding: 4 }}>
        <MPAnimateSlide trigger="manual" play={play} from="left">
          <MPCard
            title="From behind the edge"
            subtitle="400ms on medium4, travelling its own width"
          >
            <MPTypography level="body">
              A slide moves the element and not the layout — nothing on the page reflows while it
              runs.
            </MPTypography>
          </MPCard>
        </MPAnimateSlide>
      </div>

      <MPButton
        variant="tonal"
        onClick={() => {
          setPlay(false);
          requestAnimationFrame(() => setPlay(true));
        }}
      >
        Play again
      </MPButton>
    </div>
  );
}
