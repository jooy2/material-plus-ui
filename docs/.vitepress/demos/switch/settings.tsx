import { useState } from 'react';
import { MPSwitch } from 'material-plus-ui';

/**
 * What `labelPlacement="start"` is for.
 *
 * With the label on the left and `fullWidth` on the row, the labels form a
 * column and every track lines up on the right — which is what a settings page
 * looks like on every platform that has one, and what a column of `end` labels
 * cannot do, because each track would sit against its own text.
 *
 * `icons` is on here too. Without it the state is carried by the thumb's
 * position and the track's colour, and one of those is a hue.
 */
const SETTINGS = [
  { key: 'wifi', label: 'Wi-Fi', description: 'Connect to known networks.' },
  { key: 'bluetooth', label: 'Bluetooth', description: 'Discoverable while this is open.' },
  { key: 'hotspot', label: 'Personal hotspot', description: 'Shares this connection.' }
];

export default function SwitchSettings() {
  const [on, setOn] = useState<Record<string, boolean>>({ wifi: true });

  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 340 }}>
      {SETTINGS.map(({ key, label, description }) => (
        <MPSwitch
          key={key}
          label={label}
          description={description}
          labelPlacement="start"
          icons
          fullWidth
          checked={on[key] ?? false}
          onCheckedChange={(next) => setOn((all) => ({ ...all, [key]: next }))}
        />
      ))}
    </div>
  );
}
