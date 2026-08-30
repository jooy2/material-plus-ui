import type { MPNamespace } from '../i18n';

/** `MPTransfer`'s two headings and its arrows — see `MPMessages['transfer']`. */
export const TRANSFER: MPNamespace<'transfer'> = {
  name: 'transfer',
  en: {
    source: 'Available',
    target: 'Selected',
    toTarget: 'Move to selected',
    toSource: 'Move to available',
    search: 'Search',
    empty: 'Nothing here'
  }
};
