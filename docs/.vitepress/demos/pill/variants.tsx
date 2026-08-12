import { ICONS, MPIcon, MPPill } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * The five weights, said the way a *control* says them: a pill is the thing
 * being coloured, so `filled` takes the accent under its own ink.
 *
 * Every one of them carries a shadow. That is not the `elevated` rung leaking —
 * a lozenge floating flat on the content it is floating over reads as a mistake,
 * so height is part of what this shape *is*, and what `elevated` adds is the
 * neutral surface rather than the lift.
 */
const VARIANTS: MPVariant[] = ['filled', 'tonal', 'elevated', 'outlined', 'text'];

export default function PillVariants() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {VARIANTS.map((variant) => (
        <MPPill
          key={variant}
          variant={variant}
          size="sm"
          title={variant}
          startIcon={<MPIcon icon={ICONS.info} />}
        />
      ))}
    </div>
  );
}
