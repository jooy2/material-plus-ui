import { useState } from 'react';
import { MPSelect, MPIcon, ICONS } from 'material-plus-ui';
import type { MPSelectValue } from 'material-plus-ui';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' }
];

/**
 * The three things a select can be, and the one it cannot.
 *
 * There is no `error` boolean: a message is what puts the control into its error
 * state, so there is no way to render a select that is visibly wrong with no
 * explanation of why. Clear the first one to see it recover.
 */
export default function SelectStates() {
  const [plan, setPlan] = useState<MPSelectValue | null>(null);

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 280 }}>
      <MPSelect
        items={PLANS}
        label="Plan"
        placeholder="Choose a plan"
        value={plan}
        onValueChange={setPlan}
        errorMessage={plan ? undefined : 'Pick a plan to continue.'}
        required
        fullWidth
      />
      <MPSelect
        items={PLANS}
        label="Plan"
        defaultValue="pro"
        description="You can change this at any time."
        startIcon={<MPIcon icon={ICONS.info} size={20} />}
        fullWidth
      />
      <MPSelect items={PLANS} label="Plan" defaultValue="team" disabled fullWidth />
    </div>
  );
}
