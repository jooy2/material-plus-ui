import { useState } from 'react';
import {
  ICONS,
  MPBottomNavigation,
  MPBottomNavigationItem,
  MPIcon,
  MPSegmentedButton,
  MPTypography
} from 'material-plus-ui';
import type { MPBottomNavigationLabels } from 'material-plus-ui';

/**
 * The three label behaviours, and what each of them costs.
 *
 * Switch between them: the bar keeps its height in all three, and every
 * destination keeps its name in the accessibility tree in all three. What
 * changes is only how much of the row is words.
 */
export default function BottomNavigationLabels() {
  const [labels, setLabels] = useState<string[]>(['all']);
  const [page, setPage] = useState<string | number>('home');

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 420 }}>
      <MPSegmentedButton
        aria-label="Label behaviour"
        size="sm"
        value={labels}
        onValueChange={setLabels}
        items={[
          { value: 'all', label: 'all' },
          { value: 'selected', label: 'selected' },
          { value: 'none', label: 'none' }
        ]}
      />

      <MPBottomNavigation
        label="Main"
        position="static"
        labels={(labels[0] ?? 'all') as MPBottomNavigationLabels}
        value={page}
        onValueChange={setPage}
        className="rounded-mp-lg"
      >
        <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
          Home
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
          Search
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="saved" icon={<MPIcon icon={ICONS.check} />}>
          Saved
        </MPBottomNavigationItem>
      </MPBottomNavigation>

      <MPTypography level="caption">
        A screen reader hears all three names whichever is chosen.
      </MPTypography>
    </div>
  );
}
