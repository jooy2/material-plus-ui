import { MPBox, MPButton, MPTextLink } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * The five weights, none of which dye the sheet.
 *
 * Each box holds the same link and the same button — content that arrived with
 * its own colours. That is the whole argument for a container's ladder running
 * up the *neutral* surface roles: on an accent fill every one of those would
 * need an on-accent treatment of its own.
 */
const VARIANTS: { variant: MPVariant; note: string }[] = [
  { variant: 'filled', note: "surface-container-highest — MD3's own filled card" },
  { variant: 'tonal', note: 'surface-container, one step quieter' },
  { variant: 'elevated', note: 'surface-container-low under a level-1 shadow' },
  { variant: 'outlined', note: 'the default: a hairline in outline-variant' },
  { variant: 'text', note: 'grouping only — no surface at all' }
];

export default function BoxVariants() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 480 }}>
      {VARIANTS.map(({ variant, note }) => (
        <MPBox key={variant} variant={variant}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: 200 }}>
              <code>{variant}</code> — {note}. <MPTextLink href="#">A link</MPTextLink>
            </span>
            <MPButton size="xs" variant="text">
              Act
            </MPButton>
          </div>
        </MPBox>
      ))}
    </div>
  );
}
