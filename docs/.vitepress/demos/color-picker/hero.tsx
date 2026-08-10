import { useState } from 'react';
import { MPColorPicker } from 'material-plus-ui';

/**
 * A saturation square with a hue rail beside it — the arrangement that puts
 * every colour of a hue within one movement of the pointer.
 */
export default function ColorPickerHero() {
  const [color, setColor] = useState('#00639b');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <MPColorPicker label="Tag colour" value={color} onValueChange={setColor} clearable />
      <span
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color || 'transparent',
          border: '1px solid var(--_mp-color-outline-variant)'
        }}
      />
    </div>
  );
}
