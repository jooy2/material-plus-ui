import { useState } from 'react';
import { MPBox, MPButton, MPFlex, MPPortal, MPTypography } from 'material-plus-ui';

/**
 * The thing a portal is for, shown as the failure beside the fix.
 *
 * Both notices are the same markup inside the same clipping box. The first is
 * rendered in place and the box cuts it off; the second is in a portal, so it is
 * no longer inside the box at all and reaches the bottom of the page.
 */
function Notice({ label }: { label: string }) {
  return (
    <div
      className="bg-mp-error-container text-mp-on-error-container"
      style={{
        position: 'absolute',
        insetInlineStart: 12,
        bottom: -20,
        padding: '4px 10px',
        borderRadius: 8,
        fontSize: 12,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </div>
  );
}

export default function PortalHero() {
  const [shown, setShown] = useState(true);

  return (
    <MPFlex direction="column" gap={20} style={{ width: '100%' }}>
      <MPButton size="sm" variant="tonal" onClick={() => setShown((now) => !now)}>
        {shown ? 'Hide both' : 'Show both'}
      </MPButton>

      <MPBox size="sm" style={{ position: 'relative', overflow: 'hidden' }}>
        <MPTypography level="caption">
          This box clips. Both notices below are drawn from inside it.
        </MPTypography>

        {shown ? <Notice label="in place — cut off by the box" /> : null}

        {shown ? (
          <MPPortal>
            <div
              className="bg-mp-tertiary-container text-mp-on-tertiary-container"
              style={{
                position: 'fixed',
                insetInlineStart: 16,
                bottom: 16,
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12
              }}
            >
              portalled — at the end of &lt;body&gt;, nothing clips it
            </div>
          </MPPortal>
        ) : null}
      </MPBox>
    </MPFlex>
  );
}
