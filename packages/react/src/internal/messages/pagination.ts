import type { MPNamespace } from '../i18n';

/** `MPPagination`'s steppers and its status — see `MPMessages['pagination']`. */
export const PAGINATION: MPNamespace<'pagination'> = {
  name: 'pagination',
  en: {
    label: 'Pagination',
    page: 'Page {page}',
    status: 'Page {page} of {total}',
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page'
  }
};
