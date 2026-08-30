import type { MPNamespace } from '../i18n';

/** `MPCarousel`'s own names — see `MPMessages['carousel']`. */
export const CAROUSEL: MPNamespace<'carousel'> = {
  name: 'carousel',
  en: {
    label: 'Carousel',
    previous: 'Previous slide',
    next: 'Next slide',
    slide: 'Slide {index} of {total}'
  }
};
