import { MPChip, MPTypography, useMPWindowClass } from 'material-plus-ui';

/**
 * Resize the window — or this page's own frame — and the answer moves with it.
 *
 * The five are Material's window size classes, the same ladder `MPGrid` reflows
 * along and `MPResponsive` is written in terms of. The hook reads them off the
 * media queries rather than off `innerWidth`, so it cannot disagree with the
 * stylesheet at the one width a scrollbar makes the difference.
 */
export default function WindowClassDemo() {
  const size = useMPWindowClass();

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(['compact', 'medium', 'expanded', 'large', 'extra-large'] as const).map((name) => (
          <MPChip key={name} variant={name === size ? 'filled' : 'outlined'} size="sm">
            {name}
          </MPChip>
        ))}
      </div>
      <MPTypography level="caption">
        This window is <strong>{size}</strong>.
      </MPTypography>
    </div>
  );
}
