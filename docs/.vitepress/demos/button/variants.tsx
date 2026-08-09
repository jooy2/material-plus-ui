import { MPButton } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * Material's five, in the order they get quieter.
 *
 * They are not five shades of one thing. Each is a different answer to "how does
 * this action separate itself from the page": `filled` paints the accent,
 * `tonal` dilutes it, `elevated` uses a shadow instead of colour, `outlined` a
 * hairline, `text` nothing at all.
 */
const VARIANTS: { variant: MPVariant; note: string }[] = [
  { variant: 'filled', note: 'the one thing this screen is for' },
  { variant: 'tonal', note: 'the second-most-important action' },
  { variant: 'elevated', note: 'over a busy or coloured background' },
  { variant: 'outlined', note: 'an alternative to the filled one' },
  { variant: 'text', note: 'the least of them — a link that acts' }
];

export default function ButtonVariants() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {VARIANTS.map(({ variant, note }) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MPButton variant={variant}>Continue</MPButton>
          <small className="text-mp-on-surface-variant">
            <code>{variant}</code> — {note}
          </small>
        </div>
      ))}
    </div>
  );
}
