import * as React from 'react';
import {
  ICONS,
  MPBottomNavigationItem,
  MPFloatingBottomNavigation,
  MPIcon,
  MPTypography
} from 'material-plus-ui';

/**
 * The bar inside a box of its own rather than against the window, which is what
 * `position="absolute"` is for — a screen, a card, a preview.
 */
export default function FloatingBottomNavigationHero() {
  const [value, setValue] = React.useState('map');

  return (
    <div
      className="rounded-mp-lg border-mp-outline-variant bg-mp-surface-container-low relative overflow-hidden border"
      style={{ height: 280 }}
    >
      <div className="flex h-full flex-col gap-2 overflow-auto p-4">
        {Array.from({ length: 12 }, (_, index) => (
          <MPTypography key={index} level="caption">
            The content keeps going underneath, which is the whole reason the bar floats.
          </MPTypography>
        ))}
      </div>

      <MPFloatingBottomNavigation
        position="absolute"
        label="Main"
        value={value}
        onValueChange={(next) => setValue(String(next))}
      >
        <MPBottomNavigationItem value="map" icon={<MPIcon icon={ICONS.search} />}>
          Explore
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="saved" icon={<MPIcon icon={ICONS.star} />}>
          Saved
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="upload" icon={<MPIcon icon={ICONS.upload} />}>
          Upload
        </MPBottomNavigationItem>
      </MPFloatingBottomNavigation>
    </div>
  );
}
