import { MPAlert } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * The five surfaces, in the order they get quieter.
 *
 * An alert takes the accent onto its *own* surface rather than staying neutral,
 * which is the whole difference between it and a card: a card is a box holding
 * somebody else's content, and an alert is the message.
 *
 * `tonal` is the default here rather than `filled` — a container tone separates
 * itself from the page without competing with the primary action usually sitting
 * beside it.
 */
const VARIANTS: { variant: MPVariant; note: string }[] = [
  { variant: 'filled', note: 'the loudest — one per screen at most' },
  { variant: 'tonal', note: 'the default: MD3’s answer for a message in a page' },
  { variant: 'elevated', note: 'neutral, separated by a shadow instead of colour' },
  { variant: 'outlined', note: 'a hairline and the accent on the glyph' },
  { variant: 'text', note: 'no surface at all — for a form that is already busy' }
];

export default function AlertVariants() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      {VARIANTS.map(({ variant, note }) => (
        <MPAlert key={variant} variant={variant} title={variant}>
          {note}
        </MPAlert>
      ))}
    </div>
  );
}
