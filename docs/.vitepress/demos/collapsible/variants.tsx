import { MPCollapsible } from 'material-plus-ui';
import type { MPVariant } from 'material-plus-ui';

/**
 * The five weights, said the way a *container* says them.
 *
 * The sheet is never dyed — not even on `filled`, which is the neutral
 * `surface-container-highest` rather than the accent. A collapsible is a box
 * holding somebody else's content, and dyeing the box dyes their content's
 * background.
 *
 * `text` is the one to reach for inside a card or in running prose: a bare "Show
 * more" line owes the page no rectangle of its own.
 */
const VARIANTS: { variant: MPVariant; note: string }[] = [
  { variant: 'filled', note: 'surface-container-highest — the loudest a container gets' },
  { variant: 'tonal', note: 'one step quieter, for a fold inside a plain page' },
  { variant: 'elevated', note: 'separated by a shadow instead of a fill' },
  { variant: 'outlined', note: 'the default: a hairline in outline-variant' },
  { variant: 'text', note: 'no rectangle at all' }
];

export default function CollapsibleVariants() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
      {VARIANTS.map(({ variant, note }) => (
        <MPCollapsible key={variant} variant={variant} title={variant}>
          {note}
        </MPCollapsible>
      ))}
    </div>
  );
}
