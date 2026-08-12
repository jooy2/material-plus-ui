import { useState } from 'react';
import { ICONS, MPButton, MPCollapsible, MPIcon, MPSwitch } from 'material-plus-ui';

/**
 * The header's slots, and the one structural rule behind them.
 *
 * `action` sits **outside** the trigger. A header that both folds and holds a
 * switch has two things to press, and a `<button>` inside a `<button>` is markup
 * the browser rewrites on parse — so the switch is a sibling of the trigger and
 * pressing it does not fold the section it sits on.
 *
 * The second fold replaces the header entirely: the element handed to `trigger`
 * *becomes* the trigger, and Base UI gives it the click handler, `aria-expanded`
 * and the `aria-controls` pointing at the panel.
 */
export default function CollapsibleSlots() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
      <MPCollapsible
        title="Notifications"
        subtitle="Four kinds, three of them off"
        startIcon={<MPIcon icon={ICONS.info} size={20} />}
        action={
          <MPSwitch checked={enabled} onCheckedChange={setEnabled} label="Enabled" size="sm" />
        }
      >
        Choose which of these are worth interrupting you for. Everything else waits for the daily
        summary.
      </MPCollapsible>

      <MPCollapsible variant="text" trigger={<MPButton variant="text">Show the details</MPButton>}>
        A trigger of your own, wired up by Base UI. Nothing here had to be told what it controls.
      </MPCollapsible>
    </div>
  );
}
