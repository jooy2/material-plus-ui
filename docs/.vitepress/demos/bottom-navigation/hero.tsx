import { useState } from 'react';
import { ICONS, MPBottomNavigation, MPBottomNavigationItem, MPIcon } from 'material-plus-ui';

/**
 * MD3's navigation bar: three to five destinations, with the one the reader is
 * on marked by a 64×32dp `secondary-container` pill behind its glyph.
 *
 * `position="static"` here, because a `fixed` bar in a documentation page would
 * be held against the bottom of the documentation. In an application it is the
 * default and it is the right one.
 */
export default function BottomNavigationHero() {
  const [page, setPage] = useState<string | number>('home');

  return (
    <MPBottomNavigation
      label="Main"
      position="static"
      value={page}
      onValueChange={setPage}
      className="rounded-mp-lg"
      style={{ maxWidth: 420 }}
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
      <MPBottomNavigationItem value="account" icon={<MPIcon icon={ICONS.more} />}>
        Account
      </MPBottomNavigationItem>
    </MPBottomNavigation>
  );
}
