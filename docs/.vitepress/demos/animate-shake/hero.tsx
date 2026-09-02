import { useState } from 'react';
import { MPAnimateShake, MPButton, MPTextField, MPTypography } from 'material-plus-ui';

/**
 * The shape the component is for: a `play` the page owns, set back to `false`
 * and then to `true` so the second wrong answer moves as much as the first.
 *
 * The words are in `errorMessage` rather than in the movement, because a reader
 * who has asked for less motion — or who cannot see it — still has to be told
 * what happened. A shake is not a message.
 */
export default function AnimateShakeHero() {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (code === '2718') {
      setWrong(false);

      return;
    }

    setWrong(false);
    requestAnimationFrame(() => setWrong(true));
  };

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
      <MPAnimateShake play={wrong}>
        <MPTextField
          label="Access code"
          value={code}
          onChange={(next) => setCode(next)}
          errorMessage={wrong ? 'That code was not recognised' : ''}
        />
      </MPAnimateShake>

      <MPButton variant="tonal" onClick={submit}>
        Submit
      </MPButton>

      <MPTypography level="caption">Nothing shakes until something is refused.</MPTypography>
    </div>
  );
}
