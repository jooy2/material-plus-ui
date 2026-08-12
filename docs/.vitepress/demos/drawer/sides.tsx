import { useState } from 'react';
import { MPButton, MPDrawer } from 'material-plus-ui';
import type { MPSide } from 'material-plus-ui';

/**
 * The four edges, and the two objects behind them.
 *
 * A `left` or `right` panel is a navigation drawer: it takes the width its
 * `size` implies — 360px at `md`, MD3's own — and rounds its free edge at
 * `corner-large`. A `top` or `bottom` one is a sheet: it is as tall as what is
 * in it, capped at 85% of the window, and rounds at `corner-extra-large`.
 *
 * The corners against the window are always square. A corner cut off something
 * that has no visible end is a corner cut off nothing.
 */
const SIDES: MPSide[] = ['left', 'right', 'top', 'bottom'];

export default function DrawerSides() {
  const [side, setSide] = useState<MPSide | null>(null);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {SIDES.map((edge) => (
        <MPButton key={edge} variant="outlined" onClick={() => setSide(edge)}>
          {edge}
        </MPButton>
      ))}

      <MPDrawer
        side={side ?? 'left'}
        open={side !== null}
        onOpenChange={(next) => !next && setSide(null)}
        title={`Attached to the ${side ?? 'left'}`}
        actions={<MPButton onClick={() => setSide(null)}>Done</MPButton>}
      >
        A side panel takes a width; a top or bottom one is as tall as what is in it.
      </MPDrawer>
    </div>
  );
}
