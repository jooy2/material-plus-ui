import { useState } from 'react';
import { MPAvatar, MPBox, MPButton, MPStack, MPTypography } from 'material-plus-ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson'];

/**
 * The three directions, and the point they are here to make: each box is
 * exactly the size of what is drawn in it. Move the items with `translate`
 * instead and the boxes stay the width of all of them laid end to end.
 */
export default function StackHero() {
  const [dealt, setDealt] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 28, justifyItems: 'center', width: '100%' }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MPStack
          ring
          max={3}
          total={12}
          transition="grow"
          trigger="manual"
          play={dealt}
          overflow={(hidden) => <MPAvatar initials={`+${hidden}`} />}
        >
          {PEOPLE.slice(0, 3).map((name) => (
            <MPAvatar key={name} name={name} />
          ))}
        </MPStack>
        <MPTypography level="caption">horizontal, ringed, with a count</MPTypography>
      </div>

      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <MPStack
          direction="diagonal"
          overlap={44}
          drop={12}
          scaleStep={0.96}
          opacityStep={0.92}
          transition="slide"
          trigger="manual"
          play={dealt}
        >
          {[1, 2, 3, 4].map((card) => (
            <MPBox key={card} size="sm" style={{ width: 96 }}>
              <MPTypography level="body">Card {card}</MPTypography>
            </MPBox>
          ))}
        </MPStack>
        <MPTypography level="caption">diagonal, a shallow fan, dealt on a stagger</MPTypography>
      </div>

      <MPButton
        variant="tonal"
        onClick={() => {
          setDealt(false);
          requestAnimationFrame(() => setDealt(true));
        }}
      >
        Deal again
      </MPButton>
    </div>
  );
}
