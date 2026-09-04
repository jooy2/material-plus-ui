import type { MPNamespace } from '../i18n';

/** `MPCodeBlock`'s own words — see `MPMessages['code']`. */
export const CODE: MPNamespace<'code'> = {
  name: 'code',
  en: {
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    raw: 'Plain text',
    label: 'Code'
  }
};
