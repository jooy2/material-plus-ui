import { useState } from 'react';
import { ICONS, MPAccordion, MPAccordionItem, MPIcon, MPTypography } from 'material-plus-ui';

/**
 * `multiple`, driven from outside, with the open set shown as it changes.
 *
 * `onValueChange` reports the whole set rather than the section that moved,
 * which is what makes "close everything but this one" a single assignment
 * instead of a diff.
 */
export default function AccordionMultiple() {
  const [open, setOpen] = useState<(string | number)[]>(['network']);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
      <MPAccordion
        multiple
        value={open}
        onValueChange={setOpen}
        variant="text"
        dividers={false}
        size="sm"
      >
        <MPAccordionItem
          value="network"
          title="Network"
          startIcon={<MPIcon icon={ICONS.link} size={18} />}
        >
          Proxy, DNS and the two timeouts nobody has ever changed.
        </MPAccordionItem>
        <MPAccordionItem
          value="storage"
          title="Storage"
          startIcon={<MPIcon icon={ICONS.upload} size={18} />}
        >
          Where uploads land, and how long they stay there.
        </MPAccordionItem>
        <MPAccordionItem
          value="alerts"
          title="Alerts"
          startIcon={<MPIcon icon={ICONS.info} size={18} />}
        >
          Which of these are worth interrupting somebody for.
        </MPAccordionItem>
      </MPAccordion>

      <MPTypography level="caption">Open: {open.length ? open.join(', ') : 'nothing'}</MPTypography>
    </div>
  );
}
