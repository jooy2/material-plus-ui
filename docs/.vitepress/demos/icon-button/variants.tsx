import { ICONS, MPIcon, MPIconButton } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * The button's five surfaces, on a disc.
 *
 * Nothing here is a second table: the shape falls out of `MPButton` already
 * being a pill and already going square with no children, so an icon button is a
 * circle without this component deciding anything about corners.
 *
 * `text` is the default — MD3's *standard* icon button — because an icon button
 * is usually one of several in a toolbar, and five filled discs in a row is a
 * row with no emphasis left in it.
 */
const VARIANTS: MPVariant[] = ['text', 'tonal', 'filled', 'outlined', 'elevated'];

export default function IconButtonVariants() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {VARIANTS.map((variant) => (
          <MPIconButton
            key={variant}
            variant={variant}
            icon={<MPIcon icon={ICONS.add} />}
            label={`Add (${variant})`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <MPIconButton
            key={size}
            size={size}
            variant="tonal"
            icon={<MPIcon icon={ICONS.check} />}
            label={`Confirm (${size})`}
          />
        ))}
      </div>
    </div>
  );
}
