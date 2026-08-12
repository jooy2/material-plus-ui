import { useState } from 'react';
import { MPPane, MPPanes } from 'material-plus-ui';

/**
 * A sidebar and a body: the split every application eventually needs.
 *
 * The sidebar's `defaultSize` is written as a length rather than a percentage
 * because that is what a minimum actually needs — "at least 160 pixels" does not
 * survive being written down as a fraction of a width nobody knows yet. The
 * component measures itself once on mount to turn it into one.
 *
 * Drag the handle, or focus it and use the arrow keys.
 */
export default function PanesHero() {
  const [sizes, setSizes] = useState<number[]>([]);

  return (
    <div
      className="border-mp-outline-variant rounded-mp-md overflow-hidden border"
      style={{ height: 220, width: '100%' }}
    >
      <MPPanes onResizeEnd={setSizes}>
        <MPPane defaultSize="200px" minSize="120px" maxSize="60%">
          <div className="text-mp-on-surface-variant text-mp-body-small p-4">
            <strong className="text-mp-on-surface">Sidebar</strong>
            <p style={{ margin: '8px 0 0' }}>
              Between 120px and 60% of the split, whatever the window does.
            </p>
          </div>
        </MPPane>
        <MPPane minSize="30%">
          <div className="text-mp-on-surface-variant text-mp-body-small p-4">
            <strong className="text-mp-on-surface">Body</strong>
            <p style={{ margin: '8px 0 0' }}>
              {sizes.length > 0
                ? `Now at ${sizes.map((size) => `${Math.round(size)}%`).join(' / ')}.`
                : 'Drag the handle between the two, or focus it and press ← →.'}
            </p>
          </div>
        </MPPane>
      </MPPanes>
    </div>
  );
}
