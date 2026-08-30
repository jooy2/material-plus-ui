import type { MPNamespace } from '../i18n';

/** `MPCommandPalette`'s three strings — see `MPMessages['command']`. */
export const COMMAND: MPNamespace<'command'> = {
  name: 'command',
  en: {
    label: 'Command palette',
    search: 'Type a command or search…',
    empty: 'No commands found'
  }
};
