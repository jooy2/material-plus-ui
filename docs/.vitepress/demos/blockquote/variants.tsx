import { MPBlockquote } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

const VARIANTS: MPVariant[] = ['text', 'outlined', 'elevated', 'tonal', 'filled'];

export default function BlockquoteVariants() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 520 }}>
      {VARIANTS.map((variant) => (
        <MPBlockquote key={variant} variant={variant} size="sm" icon={false}>
          {variant}
        </MPBlockquote>
      ))}
    </div>
  );
}
