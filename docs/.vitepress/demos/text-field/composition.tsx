import { useState } from 'react';
import { MPTextField } from 'material-plus-ui';

/**
 * The parent that breaks a naively controlled input: it upper-cases everything
 * it is handed, so every keystroke comes back as a different string from the
 * one the browser is holding.
 *
 * Type a Korean word here. The syllable being composed stays intact, and only
 * once it is committed does the parent's rule apply.
 */
export default function TextFieldComposition() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      <MPTextField
        label="이름 / Name"
        value={value}
        onChange={(next) => setValue(next.toUpperCase())}
        placeholder="한글을 입력해 보세요"
        fullWidth
      />
      <small className="text-mp-on-surface-variant">
        Parent state: <code>{value || '(empty)'}</code>
      </small>
    </div>
  );
}
