import type { MPNamespace } from '../i18n';

/** `MPRating`'s value, read out — see `MPMessages['rating']`. */
export const RATING: MPNamespace<'rating'> = {
  name: 'rating',
  en: {
    label: 'Rating',
    value: '{value} out of {max}',
    empty: 'Not rated'
  }
};
