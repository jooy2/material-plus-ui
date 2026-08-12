import { MPCollapsible } from 'material-plus-ui';

/**
 * One section that folds, standing on its own.
 *
 * The panel's height is animated from the measurement Base UI publishes, so the
 * page opens onto the content rather than jumping to it — and nothing is
 * transformed, so no text is resampled on the way.
 */
export default function CollapsibleHero() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
      <MPCollapsible title="Delivery options" subtitle="Standard, chosen" defaultOpen>
        Standard delivery arrives in three to five working days and is included in the price.
        Express arrives the next working day.
      </MPCollapsible>

      <MPCollapsible title="Returns">
        Anything unopened can go back within thirty days. We pay the postage.
      </MPCollapsible>
    </div>
  );
}
