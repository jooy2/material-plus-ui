import { MPButton, MPIcon, MPMenu, MPMenuItem, MPMenuSeparator, ICONS } from 'material-plus-ui';

/**
 * The rows are composed rather than passed as data — the opposite of
 * `MPSelect`, and deliberately: a menu's rows are code, each one a different
 * handler.
 */
export default function MenuHero() {
  return (
    <MPMenu trigger={<MPButton variant="tonal">Actions</MPButton>}>
      <MPMenuItem startIcon={<MPIcon icon={ICONS.copy} size={20} />} shortcut="⌘C">
        Copy
      </MPMenuItem>
      <MPMenuItem startIcon={<MPIcon icon={ICONS.link} size={20} />} shortcut="⌘L">
        Copy link
      </MPMenuItem>
      <MPMenuItem startIcon={<MPIcon icon={ICONS.upload} size={20} />}>Export…</MPMenuItem>
      <MPMenuSeparator />
      <MPMenuItem color="error" startIcon={<MPIcon icon={ICONS.close} size={20} />}>
        Delete
      </MPMenuItem>
    </MPMenu>
  );
}
