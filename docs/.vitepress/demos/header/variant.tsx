import { MPHeader } from 'material-plus-ui';
import type { MPHeaderProps } from 'material-plus-ui';

const VARIANTS: MPHeaderProps['variant'][] = ['text', 'outlined', 'tonal', 'filled', 'elevated'];

/**
 * The container ladder, said the way a bar says it.
 *
 * `tonal` — the default — is MD3's scrolled top app bar: `surface-container`
 * against the page's `surface`. `outlined` is the flat one, which is the page's
 * own surface with a hairline where it ends, and it is the only weight that
 * draws a rule at all. There is no `divider` prop, because that rule is what
 * `outlined` means here.
 */
export default function HeaderVariant() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      {VARIANTS.map((variant) => (
        <MPHeader key={variant} position="static" size="sm" variant={variant} brand={variant} />
      ))}
    </div>
  );
}
