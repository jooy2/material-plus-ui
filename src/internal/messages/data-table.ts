import type { MPNamespace } from '../i18n';

/** `MPDataTable`'s ticks, its count and its two controls — see `MPMessages['dataTable']`. */
export const DATA_TABLE: MPNamespace<'dataTable'> = {
  name: 'dataTable',
  en: {
    selectAll: 'Select all rows',
    selectRow: 'Select row',
    total: 'Rows: {total}',
    selected: 'Selected: {count}',
    download: 'Download CSV',
    perPage: 'Rows per page',
    resize: 'Resize column'
  }
};
