import { MPCard, MPSegmentedButton, MPTypography, useMPColorScheme } from 'material-plus-ui';
import type { MPColorScheme } from 'material-plus-ui';

/**
 * Three states rather than two, and the third one is the point.
 *
 * `system` is the absence of a choice: a reader who has never touched this
 * follows their operating system *as it changes*, including at sunset. `scheme`
 * is what was chosen and `resolved` is what is painted — bind a settings control
 * to the first and draw with the second.
 *
 * This documentation site drives its own theme, so the switch below is scoped to
 * the card rather than to the page. In an application it writes
 * `data-mp-scheme` on `<html>` and the whole page follows.
 */
export default function ColorSchemeDemo() {
  const { scheme, resolved, isSystem, setScheme } = useMPColorScheme({
    storageKey: 'mp-docs-demo-scheme'
  });

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <MPSegmentedButton
        size="sm"
        items={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]}
        value={[scheme]}
        onValueChange={([value]) => value && setScheme(value as MPColorScheme)}
      />

      <div data-mp-scheme={resolved} style={{ width: '100%' }}>
        <MPCard variant="outlined">
          <MPTypography level="h6">Painted {resolved}</MPTypography>
          <MPTypography level="body">
            Chosen: <strong>{scheme}</strong>
            {isSystem
              ? ' — following the operating system, and still following it if it changes.'
              : ' — pinned, whatever the system does.'}
          </MPTypography>
        </MPCard>
      </div>
    </div>
  );
}
