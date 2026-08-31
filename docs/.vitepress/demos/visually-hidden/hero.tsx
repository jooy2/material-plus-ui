import { ICONS, MPIcon, MPIconButton, MPTypography, MPVisuallyHidden } from 'material-plus-ui';

/**
 * Two buttons that look identical and are not the same control.
 *
 * Both draw a glyph and nothing else. The second carries a sentence a screen
 * reader can read and a sighted reader never sees — which is the difference
 * between a button called "×" and a button called "Close this dialog".
 *
 * Turn on a screen reader, or read the accessible names in the browser's
 * accessibility panel.
 */
export default function VisuallyHiddenHero() {
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 8, cursor: 'pointer' }}
        >
          <MPIcon icon={ICONS.close} size={20} />
        </button>
        <MPTypography level="caption">Named nothing at all</MPTypography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 8, cursor: 'pointer' }}
        >
          <MPIcon icon={ICONS.close} size={20} />
          <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
        </button>
        <MPTypography level="caption">Named “Close this dialog”</MPTypography>
      </div>

      <MPTypography level="caption">
        And the row is the same height either way — the sentence takes no space.
      </MPTypography>

      <MPIconButton icon={<MPIcon icon={ICONS.close} />} label="Or let a component do it for you" />
    </div>
  );
}
