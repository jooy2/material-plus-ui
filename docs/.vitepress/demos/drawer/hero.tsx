import {
  ICONS,
  MPButton,
  MPDrawer,
  MPDrawerClose,
  MPIcon,
  MPList,
  MPListItem
} from 'material-plus-ui';

/**
 * A modal navigation drawer: opened, on a scrim, holding the focus.
 *
 * Base UI's dialog owns everything hard about it — the focus trap, the scroll
 * lock, restoring focus to the trigger, and the inert page behind. What is here
 * is the surface, and the fact that it is attached to an edge.
 */
export default function DrawerHero() {
  return (
    <MPDrawer
      trigger={<MPButton startIcon={<MPIcon icon={ICONS.more} />}>Open the menu</MPButton>}
      title="Material Plus"
      description="Every component, grouped"
      actions={<MPDrawerClose render={<MPButton variant="text">Close</MPButton>} />}
    >
      <MPList variant="text" size="sm">
        <MPListItem
          selected
          startIcon={<MPIcon icon={ICONS.search} size={18} />}
          onClick={() => {}}
        >
          Overview
        </MPListItem>
        <MPListItem startIcon={<MPIcon icon={ICONS.calendar} size={18} />} onClick={() => {}}>
          Schedule
        </MPListItem>
        <MPListItem startIcon={<MPIcon icon={ICONS.upload} size={18} />} onClick={() => {}}>
          Uploads
        </MPListItem>
      </MPList>
    </MPDrawer>
  );
}
