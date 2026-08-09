import { MPChip } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

const VARIANTS: MPVariant[] = ['outlined', 'elevated', 'tonal', 'filled', 'text'];

export default function ChipVariants() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {VARIANTS.map((variant) => (
          <MPChip key={variant} variant={variant}>
            {variant}
          </MPChip>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {VARIANTS.map((variant) => (
          <MPChip key={variant} variant={variant} selected>
            {variant}
          </MPChip>
        ))}
      </div>
    </div>
  );
}
