import type { MPNamespace } from '../i18n';

/** `MPSpoiler`'s toggle and its notice — see `MPMessages['spoiler']`. */
export const SPOILER: MPNamespace<'spoiler'> = {
  name: 'spoiler',
  en: {
    reveal: 'Reveal',
    hide: 'Hide',
    notice: 'Hidden so it is not read by accident'
  }
};
