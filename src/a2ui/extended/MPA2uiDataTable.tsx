/**
 * `DataTable` — rows and columns, as `MPDataTable`.
 *
 * ## The keys
 *
 * Selection is a list of keys in the data model, so a row has to have one. With
 * `rowKey` set, it is that column's value; without, it is the row's position —
 * which is honest rather than good: sort the table or let the rows change and
 * position names a different row than it did. The schema says so, and an agent
 * that binds `selectedKeys` should set `rowKey`.
 *
 * ## What the reader picked
 *
 * `onSelectedChange` hands back keys, and those go straight into the data model
 * through the binder's setter. So the agent's next message reads the reader's
 * choice at the path it bound, with no round trip in between — the same shape a
 * `TextField` has, and the reason no row action exists (see `api.ts`).
 *
 * `sortable` defaults to on. A table an agent drew is a table nobody laid out for
 * this particular reader, and sorting is how they make it answer the question
 * they actually have.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { MPDataTable } from '../../components/data-table/MPDataTable';
import type { MPDataTableColumn } from '../../components/data-table/MPDataTable';
import { DataTableApi } from './api';
import { accessibilityAttributes, asText, weightStyle } from '../internal/common';

/** A row, as it arrives: an object of whatever the agent put in the data model. */
type Row = Record<string, unknown>;

/**
 * A cell, as text.
 *
 * Every cell goes through this, and it is not formatting — it is the one thing
 * standing between an agent's data model and *Objects are not valid as a React
 * child*. `rows` bound to a path is resolved rather than validated: the schema
 * approved the binding, and what comes back is whatever is at that path, which
 * may hold an object where the agent meant a number. Drawn through `String` that
 * is `[object Object]`, and handed to React directly it takes the surface down.
 *
 * So a primitive is its own text, nothing is an empty cell, and anything else is
 * written out as JSON — wrong-looking, which is the point: the reader sees that
 * the data is not what the table expected, and the page keeps working.
 */
const cellText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

export const MPA2uiDataTable = createComponentImplementation(DataTableApi, ({ props }) => {
  const rows: Row[] = Array.isArray(props.rows) ? props.rows : [];
  const columns = props.columns ?? [];
  const selection = props.selection ?? 'none';
  const selected: string[] = Array.isArray(props.selectedKeys)
    ? props.selectedKeys.map(String)
    : [];

  const headers: MPDataTableColumn<Row>[] = columns.map((column) => ({
    key: column.key,
    label: asText(column.label) ?? column.key,
    align: column.align,
    sortable: column.sortable,
    searchable: column.searchable,
    width: column.width,
    /* `value` is the raw cell and `render` is what is drawn, which is what keeps
       a column of numbers sorting as numbers while every cell is still text. */
    value: (row) => row[column.key],
    render: (row) => cellText(row[column.key])
  }));

  const keyOf = (row: Row, index: number) => {
    if (!props.rowKey) {
      return index;
    }

    const value = row[props.rowKey];

    return value === undefined || value === null ? index : String(value);
  };

  return (
    <MPDataTable
      headers={headers}
      items={rows}
      getRowKey={keyOf}
      caption={props.caption}
      searchable={props.searchable}
      sortable={props.sortable ?? true}
      paged={props.paged}
      pageSize={props.pageSize}
      selectionMode={selection}
      /*
       * Ticks for several and a press for one. A reader given no checkbox has no
       * way to know a second row can be picked without trying it, and a reader
       * given one for a single choice has a control that unpicks what it picks.
       * `MPDataTable` also reads this as which of the row and the tick is the
       * keyboard's route in, so it is one decision rather than two.
       */
      checkboxes={selection === 'multiple'}
      selected={selection === 'none' ? undefined : selected}
      onSelectedChange={(keys) => props.setSelectedKeys(keys.map(String))}
      striped={props.striped}
      style={weightStyle(props.weight)}
      {...accessibilityAttributes(props.accessibility)}
    />
  );
});
