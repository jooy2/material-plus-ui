import type { MPNamespace } from '../i18n';

/** The words that are not any one component's — see `MPMessages['common']`. */
export const COMMON: MPNamespace<'common'> = {
  name: 'common',
  en: {
    close: 'Close',
    clear: 'Clear',
    open: 'Open',
    remove: 'Remove',
    removeNamed: 'Remove {label}',
    loading: 'Loading'
  }
};
