import { MPIcon, MPToggle, MPToggleGroup } from 'material-plus-ui';
import { Bold, Italic, Underline } from 'lucide-react';
import { useState } from 'react';

/**
 * A toolbar of toggles: each one is a state of the thing beside it, and the set
 * owns the value.
 *
 * Off is neutral in every weight, because the axis a reader can judge in
 * isolation is hue rather than saturation — a set where off is a paler accent
 * and on is a stronger one is a set nobody can read without comparing two of
 * them.
 *
 * The glyphs come straight from `lucide-react` rather than from `ICONS`, which
 * is the bring-your-own-icons promise being taken up: `MPIcon` draws any
 * component that takes a size and a colour.
 */
export default function ToggleHero() {
  const [marks, setMarks] = useState<string[]>(['bold']);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <MPToggleGroup multiple value={marks} onValueChange={setMarks}>
        <MPToggle value="bold" aria-label="Bold" startIcon={<MPIcon icon={Bold} size={20} />} />
        <MPToggle
          value="italic"
          aria-label="Italic"
          startIcon={<MPIcon icon={Italic} size={20} />}
        />
        <MPToggle
          value="underline"
          aria-label="Underline"
          startIcon={<MPIcon icon={Underline} size={20} />}
        />
      </MPToggleGroup>

      <p className="text-mp-body-medium text-mp-on-surface-variant m-0">
        {marks.length > 0 ? marks.join(', ') : 'nothing'} is on.
      </p>
    </div>
  );
}
