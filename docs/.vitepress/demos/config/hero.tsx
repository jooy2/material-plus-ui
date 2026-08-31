import { useState } from 'react';
import {
  MPButton,
  MPChip,
  MPConfigProvider,
  MPSegmentedButton,
  MPSwitch,
  MPTextField,
  MPTypography
} from 'material-plus-ui';
import type { MPColor, MPSize } from 'material-plus-ui';

/**
 * One provider, and every control under it moves.
 *
 * Nothing in the form below names a `size` or a `color` — they are reading the
 * two the provider set. Change either and the whole form follows, which is the
 * decision this component exists to make once instead of at every call site.
 */
export default function ConfigHero() {
  const [size, setSize] = useState<MPSize>('md');
  const [color, setColor] = useState<MPColor>('primary');
  const [name, setName] = useState('');
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <MPTypography level="overline">The provider</MPTypography>
        <MPSegmentedButton
          size="sm"
          items={(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((value) => ({
            value,
            label: value
          }))}
          value={[size]}
          onValueChange={([value]) => value && setSize(value as MPSize)}
        />
        <MPSegmentedButton
          size="sm"
          items={(['primary', 'secondary', 'tertiary', 'error'] as const).map((value) => ({
            value,
            label: value
          }))}
          value={[color]}
          onValueChange={([value]) => value && setColor(value as MPColor)}
        />
      </div>

      <MPConfigProvider size={size} color={color}>
        <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
          <MPTextField label="Full name" value={name} onChange={setName} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <MPButton>Save</MPButton>
            <MPChip>Draft</MPChip>
            <MPSwitch checked={on} onCheckedChange={setOn} label="Notify me" />
          </div>
        </div>
      </MPConfigProvider>
    </div>
  );
}
