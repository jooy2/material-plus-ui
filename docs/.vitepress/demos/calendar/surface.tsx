import { MPCalendar, MPTypography } from 'material-plus-ui';

/**
 * `variant` decides how much surface the calendar paints under itself.
 *
 * The default is `text` — nothing at all — because a standalone calendar
 * usually lands somewhere that is already a surface, and a default that painted
 * a second one would be a box inside a box. The other four are the container
 * ladder every box in this library shares.
 */
export default function CalendarSurface() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {(['text', 'outlined', 'elevated'] as const).map((variant) => (
        <div key={variant} style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
          <MPTypography level="overline">
            {variant === 'text' ? 'text — the default' : variant}
          </MPTypography>
          <MPCalendar variant={variant} size="sm" defaultValue={new Date()} />
        </div>
      ))}
    </div>
  );
}
