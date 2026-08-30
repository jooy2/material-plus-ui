import { MPToggle, MPToggleGroup } from 'material-plus-ui';
import { useState } from 'react';

/**
 * `multiple` is the difference between a toolbar and a one-of-a-set.
 *
 * Off, turning one on turns the last one off — and that is worth a second
 * thought. If what is being chosen is a *value* rather than a state, the
 * component that says so properly is [SegmentedButton] or [RadioGroup].
 */
export default function ToggleGroupDemo() {
  const [view, setView] = useState<string[]>(['day']);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <MPToggleGroup size="sm" value={view} onValueChange={setView}>
        <MPToggle value="day">Day</MPToggle>
        <MPToggle value="week">Week</MPToggle>
        <MPToggle value="month">Month</MPToggle>
      </MPToggleGroup>

      <MPToggleGroup size="sm" orientation="vertical" variant="text" multiple>
        <MPToggle value="grid">Grid</MPToggle>
        <MPToggle value="snap">Snap</MPToggle>
        <MPToggle value="rulers">Rulers</MPToggle>
      </MPToggleGroup>
    </div>
  );
}
