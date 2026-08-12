import { MPBox } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * `size` here is the padding, and only the padding.
 *
 * A box is as tall as what it holds, and its children bring their own
 * typography — a container that reset the type scale would make the same
 * paragraph render at two sizes depending on what it was wrapped in.
 *
 * The corner does not move either. In Material a radius is a statement about
 * what kind of object something is rather than a size to taste, and all five of
 * these are the same kind of object: a sheet, at `corner-medium`.
 */
const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export default function BoxSizes() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      {SIZES.map((size) => (
        <MPBox key={size} size={size} variant="tonal">
          <code>{size}</code>
        </MPBox>
      ))}
    </div>
  );
}
