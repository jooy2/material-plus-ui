import { useState } from 'react';
import { MPButton, MPStep, MPStepper, MPTextField, MPTypography } from 'material-plus-ui';

/**
 * A rail, one panel, and the application's own Next and Back.
 *
 * The stepper ships no navigation buttons on purpose: what *next* means is
 * whether the current step validates, and a library that drew them would either
 * have to guess that or ask for a validator per step.
 *
 * Press a step you have already been to — going back is always allowed, and so
 * is returning to the furthest step you had reached.
 */
export default function StepperHero() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [card, setCard] = useState('');

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <MPStepper active={step} onActiveChange={setStep}>
        <MPStep label="Account">
          <MPTextField label="Email" value={email} onChange={setEmail} fullWidth />
        </MPStep>
        <MPStep label="Payment" description="Card or transfer">
          <MPTextField label="Card number" value={card} onChange={setCard} fullWidth />
        </MPStep>
        <MPStep label="Done">
          <MPTypography level="body">All set — nothing left to fill in.</MPTypography>
        </MPStep>
      </MPStepper>

      <div style={{ display: 'flex', gap: 8 }}>
        <MPButton
          variant="text"
          disabled={step === 0}
          onClick={() => setStep((n) => Math.max(0, n - 1))}
        >
          Back
        </MPButton>
        <MPButton disabled={step === 2} onClick={() => setStep((n) => Math.min(2, n + 1))}>
          Next
        </MPButton>
      </div>
    </div>
  );
}
