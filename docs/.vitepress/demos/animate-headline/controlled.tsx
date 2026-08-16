import { useState } from 'react';
import { MPAnimateHeadline, MPBox, MPButton, MPTypography } from 'material-plus-ui';

/**
 * Hand it an `index` and the reel stops turning on its own — a controlled
 * headline is somebody else's timer, and a second one running underneath it
 * would fight for the same state.
 *
 * Which makes this the way to tie the reel to a step in a form, a tab, or
 * anything else that already knows which line should be showing.
 */
export default function AnimateHeadlineControlled() {
  const steps = ['Choose a plan', 'Enter your details', 'Confirm and pay'];
  const [step, setStep] = useState(0);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 380 }}>
      <MPBox>
        <MPAnimateHeadline index={step}>
          {steps.map((label) => (
            <MPTypography key={label} level="h6" gutter={false}>
              {label}
            </MPTypography>
          ))}
        </MPAnimateHeadline>
      </MPBox>

      <div style={{ display: 'flex', gap: 8 }}>
        <MPButton
          variant="outlined"
          disabled={step === 0}
          onClick={() => setStep((value) => value - 1)}
        >
          Back
        </MPButton>
        <MPButton
          variant="tonal"
          disabled={step === steps.length - 1}
          onClick={() => setStep((value) => value + 1)}
        >
          Next
        </MPButton>
      </div>
    </div>
  );
}
