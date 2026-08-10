import { useState } from 'react';
import { MPCombobox } from 'material-plus-ui';
import type { MPComboboxValue } from 'material-plus-ui';

const LANGUAGES = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'js', label: 'JavaScript' },
  { value: 'rs', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'py', label: 'Python' },
  { value: 'ex', label: 'Elixir' }
];

/**
 * Type to filter, and — unless `allowCustom` is off — the typed text is offered
 * as the last row rather than committed silently on blur.
 */
export default function ComboboxHero() {
  const [value, setValue] = useState<MPComboboxValue | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 300 }}>
      <MPCombobox
        items={LANGUAGES}
        label="Language"
        placeholder="Search or add"
        value={value}
        onValueChange={setValue}
        fullWidth
      />
    </div>
  );
}
