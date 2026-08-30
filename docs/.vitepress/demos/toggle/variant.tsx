import { MPToggle } from 'material-plus-ui';
import type { MPToggleProps } from 'material-plus-ui';

const VARIANTS: MPToggleProps['variant'][] = ['text', 'outlined', 'tonal', 'filled', 'elevated'];

/**
 * The five weights, off and on.
 *
 * `variant` describes the toggle while it is **off**. On is always the accent
 * asserting itself: `filled` takes the accent and its own ink, the middle three
 * light the container tone, and `text` — which has no container to light — puts
 * the accent into the ink, which is MD3's standard toggle icon button exactly.
 */
export default function ToggleVariant() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MPToggle variant={variant} size="sm">
            Off
          </MPToggle>
          <MPToggle variant={variant} size="sm" defaultPressed>
            On
          </MPToggle>
          <span className="text-mp-body-small text-mp-on-surface-variant">{variant}</span>
        </div>
      ))}
    </div>
  );
}
