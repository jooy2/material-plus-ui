import type { MPNamespace } from '../i18n';

/** `MPTransfer`'s two headings, its arrows and its announcement — see `MPMessages['transfer']`. */
export const TRANSFER: MPNamespace<'transfer'> = {
  name: 'transfer',
  en: {
    source: 'Available',
    target: 'Selected',
    toTarget: 'Move to selected',
    toSource: 'Move to available',
    search: 'Search',
    empty: 'Nothing here',
    /*
     * A label rather than a sentence, and deliberately: `fillMessage` puts a
     * string where a placeholder is and knows nothing about number agreement, so
     * a sentence with a verb in it would be a sentence that reads wrongly at one
     * count in half the languages that have it. Every translation of this puts
     * the figure where its own locale already puts one.
     */
    moved: 'Moved to {list}: {count}'
  }
};
