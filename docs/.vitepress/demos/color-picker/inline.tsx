import { useState } from 'react';
import { MPColorPicker, MPTypography } from 'material-plus-ui';

/**
 * `inline` draws the panel in the page with no trigger at all — for a sidebar
 * or a settings pane, where the picker is the content rather than a field in a
 * form.
 */
export default function ColorPickerInline() {
  const [color, setColor] = useState('rgba(0, 99, 155, 0.75)');

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <MPColorPicker
        label="Brand"
        inline
        alpha
        format="rgb"
        value={color}
        onValueChange={setColor}
      />
      <MPTypography level="caption">{color}</MPTypography>
    </div>
  );
}
