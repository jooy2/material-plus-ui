import type { MPNamespace } from '../i18n';

/** `MPScrollZone`'s own names — see `MPMessages['scroll']`. */
export const SCROLL: MPNamespace<'scroll'> = {
  name: 'scroll',
  en: {
    label: 'Scrollable content',
    previous: 'Scroll back',
    next: 'Scroll forward'
  }
};
