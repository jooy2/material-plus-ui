import { useState } from 'react';
import { MPAnimateAppear, MPButton, MPList, MPListItem } from 'material-plus-ui';

/**
 * The effect belongs to the **set** rather than to any one item, which is what
 * walks a reader's eye down the list in the order it should be read.
 *
 * The animation is written onto the children themselves — these stay real
 * `MPListItem`s inside a real `MPList`, and nothing about the layout changes
 * because the list is being animated.
 */
export default function AnimateAppearHero() {
  const [play, setPlay] = useState(true);

  const people = [
    { name: 'Ada Lovelace', role: 'Engineering' },
    { name: 'Grace Hopper', role: 'Engineering' },
    { name: 'Jane Doe', role: 'Design' },
    { name: 'Alan Turing', role: 'Research' }
  ];

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <MPList dividers>
          <MPAnimateAppear trigger="manual" play={play} render={<div />}>
            {people.map((person) => (
              <MPListItem key={person.name} description={person.role}>
                {person.name}
              </MPListItem>
            ))}
          </MPAnimateAppear>
        </MPList>
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
