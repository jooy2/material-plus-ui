import type { MPNamespace } from '../i18n';

/** `MPTour`'s four buttons and its counter — see `MPMessages['tour']`. */
export const TOUR: MPNamespace<'tour'> = {
  name: 'tour',
  en: {
    previous: 'Back',
    next: 'Next',
    done: 'Done',
    skip: 'Skip',
    position: 'Step {index} of {total}'
  }
};
