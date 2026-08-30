import { MPPageLayout, MPSidebar, MPTypography } from 'material-plus-ui';
import { useState } from 'react';

/**
 * `resizable` puts a handle on the inner edge — the one facing the content.
 *
 * The drag writes the width straight onto the element rather than into state,
 * because nothing in the tree depends on the number except one CSS declaration
 * and a `setState` per pointer move would re-render every row in the sidebar.
 * What the caller hears is `onResize` while it moves and `onResizeEnd` when it
 * is let go — which is the number worth storing.
 *
 * The handle is a real `separator` with a tab stop, so the arrow keys move it
 * too.
 */
export default function SidebarResizable() {
  const [width, setWidth] = useState(200);

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <MPPageLayout
        height={200}
        scroll="content"
        collapseBelow="none"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        sidebar={
          <MPSidebar
            size="sm"
            width={200}
            minWidth={120}
            maxWidth={320}
            resizable
            onResizeEnd={setWidth}
          >
            <MPTypography level="caption">Drag the inner edge</MPTypography>
          </MPSidebar>
        }
      >
        <div className="p-4">
          <MPTypography level="body">Settled at {width}px.</MPTypography>
        </div>
      </MPPageLayout>
    </div>
  );
}
