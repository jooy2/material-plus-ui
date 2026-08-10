import { MPButton, MPDialog, MPDialogClose } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * One axis rather than two: `size` sets the type scale *and* how wide the sheet
 * is allowed to get. `md` is MD3's own 560dp maximum.
 *
 * `width` is the escape hatch for the dialog whose content decides its width —
 * the last trigger here — and it overrides whatever cap the rung implies.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '320px' },
  { size: 'sm', note: '400px' },
  { size: 'md', note: '560px — MD3’s own maximum, and the default' },
  { size: 'lg', note: '720px' },
  { size: 'xl', note: '960px' }
];

export default function DialogSizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {SIZES.map(({ size, note }) => (
        <MPDialog
          key={size}
          size={size}
          trigger={<MPButton variant="outlined" size="sm">{`size="${size}"`}</MPButton>}
          title={`The ${size} rung`}
          description={`The sheet is drawn at the ${size} type scale and gets no wider than ${note}.`}
          actions={<MPDialogClose render={<MPButton variant="text">Close</MPButton>} />}
        />
      ))}
      <MPDialog
        width={880}
        trigger={
          <MPButton variant="tonal" size="sm">
            width=&#123;880&#125;
          </MPButton>
        }
        title="A dialog its content sized"
        description="A hard cap in pixels, for the sheet holding a wide table — it overrides the one the rung implies."
        actions={<MPDialogClose render={<MPButton variant="text">Close</MPButton>} />}
      />
    </div>
  );
}
