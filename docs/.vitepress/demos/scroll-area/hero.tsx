import { MPFlex, MPList, MPListItem, MPScrollArea, MPTypography } from 'material-plus-ui';

const ROWS = [
  'Inbox',
  'Starred',
  'Snoozed',
  'Important',
  'Sent',
  'Drafts',
  'Scheduled',
  'All mail',
  'Spam',
  'Bin',
  'Categories',
  'Manage labels'
];

/**
 * The same list twice: once in a plain box with the operating system's
 * scrollbar, and once in an MPScrollArea.
 *
 * The difference is the point — one is a different width and colour on every
 * machine, the other is the same everywhere and made of the library's tokens.
 */
export default function ScrollAreaHero() {
  return (
    <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={16} style={{ width: '100%' }}>
      <MPFlex direction="column" gap={8} style={{ flex: 1 }}>
        <MPTypography level="caption">The browser's</MPTypography>
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          <MPList dividers>
            {ROWS.map((row) => (
              <MPListItem key={row}>{row}</MPListItem>
            ))}
          </MPList>
        </div>
      </MPFlex>

      <MPFlex direction="column" gap={8} style={{ flex: 1 }}>
        <MPTypography level="caption">MPScrollArea</MPTypography>
        <MPScrollArea maxHeight={220} persistent>
          <MPList dividers>
            {ROWS.map((row) => (
              <MPListItem key={row}>{row}</MPListItem>
            ))}
          </MPList>
        </MPScrollArea>
      </MPFlex>
    </MPFlex>
  );
}
