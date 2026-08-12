import { MPAlert, MPIcon, ICONS } from 'material-plus-ui';

/**
 * Four families, not a severity ladder.
 *
 * There is no `success` or `warning` here, because the specification's colour
 * system has no way to derive them — offering them would promise roles the token
 * sheet cannot produce. What you get instead is `error`, which Material does
 * name, and an emphasis choice for everything else.
 *
 * A message that means something the palette has no word for says so with a
 * glyph of its own rather than by borrowing a colour, which is what the last two
 * rows do.
 */
export default function AlertColors() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <MPAlert color="primary">A notice: the default, and the informational one.</MPAlert>
      <MPAlert color="error">
        Something failed. This is the one family the specification names.
      </MPAlert>
      <MPAlert color="tertiary" icon={<MPIcon icon={ICONS.success} size={20} />}>
        “It worked” — a family for emphasis, and a glyph for the meaning.
      </MPAlert>
      <MPAlert color="secondary" icon={<MPIcon icon={ICONS.warning} size={20} />}>
        “Proceed carefully” — the same trade, one step quieter.
      </MPAlert>
    </div>
  );
}
