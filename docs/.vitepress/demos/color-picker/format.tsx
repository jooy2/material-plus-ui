import { MPColorPicker } from 'material-plus-ui';

/**
 * `format` decides which notation comes back out, and `swatches` puts the
 * handful of colours a product actually uses one click away. `false` draws
 * none.
 */
export default function ColorPickerFormat() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <MPColorPicker label="Hex" defaultValue="#7c3aed" format="hex" />
      <MPColorPicker label="RGB" defaultValue="#7c3aed" format="rgb" alpha />
      <MPColorPicker
        label="Brand only"
        defaultValue="#0f766e"
        format="hsl"
        swatches={['#0f766e', '#7c3aed', '#b91c1c', '#a16207']}
        editable={false}
      />
    </div>
  );
}
