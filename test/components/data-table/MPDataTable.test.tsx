import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPDataTable } from 'material-plus-ui';
import type { MPDataTableColumn } from 'material-plus-ui';

interface Row {
  id: string;
  name: string;
  city: string;
  score: number | null;
}

const ROWS: Row[] = [
  { id: 'a', name: 'Ada', city: 'Seoul', score: 30 },
  { id: 'b', name: 'Bo', city: 'Lyon', score: 10 },
  { id: 'c', name: 'Cai', city: 'Seoul', score: null },
  { id: 'd', name: 'Dee', city: 'Osaka', score: 20 }
];

const COLUMNS: MPDataTableColumn<Row>[] = [
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'score', label: 'Score', align: 'end' }
];

/**
 * The body's rows, read as the first cell of each — the order is what matters.
 *
 * The line the table draws when nothing is left is one `<td>` across the whole
 * width, so it is left out by its `colspan` rather than counted as a row.
 */
const names = () =>
  Array.from(document.querySelectorAll('tbody tr'))
    .map((row) => Array.from(row.querySelectorAll('td')))
    .filter((cells) => !cells.some((cell) => cell.hasAttribute('colspan')))
    // And the tick, when there is one, is a control rather than a value.
    .map(
      (cells) =>
        cells.find((cell) => !cell.querySelector('[role="checkbox"], input'))?.textContent ?? ''
    );

const header = (label: string) =>
  Array.from(document.querySelectorAll('th')).find((cell) =>
    cell.textContent?.includes(label)
  ) as HTMLElement;

const Table = (props: Record<string, unknown>) => (
  <MPDataTable
    headers={COLUMNS}
    items={ROWS}
    getRowKey={(row: Row) => row.id}
    locale="en-US"
    {...props}
  />
);

describe('MPDataTable', () => {
  it('draws the rows it was given, in the order it was given', async () => {
    await render(<Table />);

    expect(names()).toEqual(['Ada', 'Bo', 'Cai', 'Dee']);
  });

  describe('sorting', () => {
    it('cycles a column through ascending, descending and back to nothing', async () => {
      // Three states rather than two, because the order the rows arrived in is a
      // state a reader cannot get back to by pressing anything if there are only
      // two.
      const screen = await render(<Table sortable />);
      const button = screen.getByRole('button', { name: 'Name' });

      await button.click();
      expect(names()).toEqual(['Ada', 'Bo', 'Cai', 'Dee']);
      expect(header('Name')).toHaveAttribute('aria-sort', 'ascending');

      await button.click();
      expect(names()).toEqual(['Dee', 'Cai', 'Bo', 'Ada']);
      expect(header('Name')).toHaveAttribute('aria-sort', 'descending');

      await button.click();
      expect(header('Name')).toHaveAttribute('aria-sort', 'none');
    });

    it('sorts numbers as numbers', async () => {
      // Through the collator they would go 10, 20, 30 by luck and 100 before 20
      // the moment a third digit turns up.
      const screen = await render(
        <Table
          sortable
          items={[
            { id: 'a', name: 'Ada', city: 'Seoul', score: 100 },
            { id: 'b', name: 'Bo', city: 'Lyon', score: 20 }
          ]}
        />
      );

      await screen.getByRole('button', { name: 'Score' }).click();

      expect(names()).toEqual(['Bo', 'Ada']);
    });

    it('puts the empty ones last whichever way it runs', async () => {
      // A blank is not the smallest value, it is the absence of one, and a
      // descending sort whose first screen is blanks answered the wrong question.
      const screen = await render(<Table sortable />);
      const button = screen.getByRole('button', { name: 'Score' });

      await button.click();
      expect(names().at(-1)).toBe('Cai');

      await button.click();
      expect(names().at(-1)).toBe('Cai');
    });

    it('takes a comparison of its own for a value that has no order', async () => {
      const screen = await render(
        <Table
          headers={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              compare: (a: Row, b: Row) => a.id.length - b.id.length || a.id.localeCompare(b.id)
            },
            ...COLUMNS.slice(1)
          ]}
        />
      );

      await screen.getByRole('button', { name: 'Name' }).click();

      expect(names()).toEqual(['Ada', 'Bo', 'Cai', 'Dee']);
    });

    it('adds a second key on a Shift-press, and only when it may', async () => {
      const screen = await render(<Table sortable sortMode="multiple" />);

      await screen.getByRole('button', { name: 'City' }).click();
      await userEvent.keyboard('{Shift>}');
      await screen.getByRole('button', { name: 'Name' }).click();
      await userEvent.keyboard('{/Shift}');

      // Lyon, Osaka, Seoul — and Ada before Cai inside Seoul.
      expect(names()).toEqual(['Bo', 'Dee', 'Ada', 'Cai']);
      expect(header('City')).toHaveAttribute('aria-sort', 'ascending');
      expect(header('Name')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('replaces the sort on a Shift-press when only one key is allowed', async () => {
      const screen = await render(<Table sortable />);

      await screen.getByRole('button', { name: 'City' }).click();
      await userEvent.keyboard('{Shift>}');
      await screen.getByRole('button', { name: 'Name' }).click();
      await userEvent.keyboard('{/Shift}');

      expect(header('City')).toHaveAttribute('aria-sort', 'none');
      expect(header('Name')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('reports the sort rather than keeping it, when it is controlled', async () => {
      const onSortChange = vi.fn();
      const screen = await render(
        <Table sortable sort={[{ key: 'name', direction: 'desc' }]} onSortChange={onSortChange} />
      );

      expect(names()).toEqual(['Dee', 'Cai', 'Bo', 'Ada']);

      await screen.getByRole('button', { name: 'Name' }).click();

      expect(onSortChange).toHaveBeenCalledWith([]);
      expect(names()).toEqual(['Dee', 'Cai', 'Bo', 'Ada']);
    });
  });

  describe('the search', () => {
    it('matches every searchable column, folded', async () => {
      const screen = await render(<Table searchable />);

      await userEvent.fill(screen.getByRole('textbox').element(), 'SEOUL');

      await vi.waitFor(() => expect(names()).toEqual(['Ada', 'Cai']));
    });

    it('cannot match across the seam between two cells', async () => {
      // The values are joined on a character no keyboard produces, so a query
      // cannot find a row on text that is not next to itself.
      const screen = await render(<Table searchable />);

      await userEvent.fill(screen.getByRole('textbox').element(), 'adaseoul');

      await vi.waitFor(() => expect(names()).toEqual([]));
    });

    it('leaves a column out when it is told to', async () => {
      const screen = await render(
        <Table
          searchable
          headers={[COLUMNS[0], { ...COLUMNS[1], searchable: false }, COLUMNS[2]]}
        />
      );

      await userEvent.fill(screen.getByRole('textbox').element(), 'seoul');

      await vi.waitFor(() => expect(names()).toEqual([]));
    });

    it('applies a filter of its own after it', async () => {
      const screen = await render(<Table searchable filter={(row: Row) => row.score !== null} />);

      await userEvent.fill(screen.getByRole('textbox').element(), 'seoul');

      await vi.waitFor(() => expect(names()).toEqual(['Ada']));
    });
  });

  describe('the pages', () => {
    it('hands out one page at a time and steps between them', async () => {
      const screen = await render(<Table paged defaultPageSize={2} />);

      expect(names()).toEqual(['Ada', 'Bo']);

      await screen.getByRole('button', { name: 'Page 2' }).click();

      await vi.waitFor(() => expect(names()).toEqual(['Cai', 'Dee']));
    });

    it('goes back to the first page when a search cuts the list short', async () => {
      // Left where it was, the reader would be looking at an empty screen and
      // reading it as "nothing matched".
      const screen = await render(<Table paged searchable defaultPageSize={2} />);

      await screen.getByRole('button', { name: 'Page 2' }).click();
      await vi.waitFor(() => expect(names()).toEqual(['Cai', 'Dee']));

      await userEvent.fill(screen.getByRole('textbox').element(), 'seoul');

      await vi.waitFor(() => expect(names()).toEqual(['Ada', 'Cai']));
    });

    it('counts what the search left rather than what it was given', async () => {
      const screen = await render(<Table paged searchable />);

      await userEvent.fill(screen.getByRole('textbox').element(), 'seoul');

      await vi.waitFor(() =>
        expect(document.querySelector('.mp-data-table__count')?.textContent).toBe('Rows: 2')
      );
    });

    it('counts what is held separately from what is on screen', async () => {
      // Said as one sentence the two numbers are counted over different sets: a
      // row the search has hidden is still chosen, so "1 of 1 selected" was what
      // a table of seven said the moment a search left one row.
      const screen = await render(
        <Table searchable selectionMode="multiple" defaultSelected={['b']} />
      );

      await userEvent.fill(screen.getByRole('textbox').element(), 'osaka');

      await vi.waitFor(() =>
        expect(document.querySelector('.mp-data-table__count')?.textContent).toBe('Rows: 1')
      );
      expect(document.querySelector('.mp-data-table__selected')?.textContent).toBe('Selected: 1');
    });
  });

  describe('choosing rows', () => {
    it('does nothing until it is told it may', async () => {
      const onSelectedChange = vi.fn();
      const screen = await render(<Table onSelectedChange={onSelectedChange} />);

      await screen.getByText('Ada').click();

      expect(onSelectedChange).not.toHaveBeenCalled();
    });

    it('holds one row, and lets it go again', async () => {
      // Unlike MPTreeView's single select: an action bar above the table keys
      // off "nothing chosen", so it has to be reachable.
      const onSelectedChange = vi.fn();
      const screen = await render(
        <Table selectionMode="single" onSelectedChange={onSelectedChange} />
      );

      await screen.getByText('Ada').click();
      expect(onSelectedChange).toHaveBeenLastCalledWith(['a'], [ROWS[0]]);

      await screen.getByText('Bo').click();
      expect(onSelectedChange).toHaveBeenLastCalledWith(['b'], [ROWS[1]]);

      await screen.getByText('Bo').click();
      expect(onSelectedChange).toHaveBeenLastCalledWith([], []);
    });

    it('extends from the last press with Shift, in the order on screen', async () => {
      const onSelectedChange = vi.fn();
      const screen = await render(
        <Table selectionMode="multiple" sortable onSelectedChange={onSelectedChange} />
      );

      // Sorted the other way, so the range is not the range in `items`.
      await screen.getByRole('button', { name: 'Name' }).click();
      await screen.getByRole('button', { name: 'Name' }).click();
      await vi.waitFor(() => expect(names()).toEqual(['Dee', 'Cai', 'Bo', 'Ada']));

      await screen.getByText('Dee').click();
      await userEvent.keyboard('{Shift>}');
      await screen.getByText('Bo').click();
      await userEvent.keyboard('{/Shift}');

      expect(onSelectedChange).toHaveBeenLastCalledWith(
        ['b', 'c', 'd'],
        [ROWS[1], ROWS[2], ROWS[3]]
      );
    });

    it('takes the page with the tick in the heading, and gives it back', async () => {
      // The page rather than the whole set: the tick sits in the header of what
      // is on screen, and a control that quietly took rows nobody can see did
      // something else.
      const onSelectedChange = vi.fn();
      const screen = await render(
        <Table
          selectionMode="multiple"
          checkboxes
          paged
          defaultPageSize={2}
          onSelectedChange={onSelectedChange}
        />
      );

      await screen.getByRole('checkbox', { name: 'Select all rows' }).click();

      expect(onSelectedChange).toHaveBeenLastCalledWith(['a', 'b'], [ROWS[0], ROWS[1]]);

      await screen.getByRole('checkbox', { name: 'Select all rows' }).click();

      expect(onSelectedChange).toHaveBeenLastCalledWith([], []);
    });

    it('hands back rows the search has hidden, because they are still chosen', async () => {
      const onSelectedChange = vi.fn();
      const screen = await render(
        <Table
          selectionMode="multiple"
          checkboxes
          searchable
          defaultSelected={['b']}
          onSelectedChange={onSelectedChange}
        />
      );

      await userEvent.fill(screen.getByRole('textbox').element(), 'seoul');
      await vi.waitFor(() => expect(names()).toEqual(['Ada', 'Cai']));

      await screen.getByRole('checkbox', { name: 'Select all rows' }).click();

      expect(onSelectedChange).toHaveBeenLastCalledWith(
        ['a', 'b', 'c'],
        [ROWS[0], ROWS[1], ROWS[2]]
      );
    });

    it('gives the keyboard exactly one route into a row', async () => {
      // A row that answers a press has to answer a keyboard, and two hundred
      // rows that each did would be two hundred tab stops. The ticks are the
      // route when there are ticks.
      const withTicks = await render(<Table selectionMode="multiple" checkboxes />);

      expect(document.querySelector('tbody tr')).not.toHaveAttribute('tabindex');

      await withTicks.rerender(<Table selectionMode="multiple" />);

      expect(document.querySelector('tbody tr')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('the widths', () => {
    it('nudges a column with the arrow keys and puts it back with Home', async () => {
      // A resize is a real preference — reading a long value — and there is no
      // other way to get it, so the handle is a control rather than a target.
      const onColumnWidthsChange = vi.fn();
      const screen = await render(<Table resizable onColumnWidthsChange={onColumnWidthsChange} />);

      const handles = screen.container.querySelectorAll('.mp-data-table__resize');

      (handles[0] as HTMLElement).focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(onColumnWidthsChange).toHaveBeenLastCalledWith({ name: 168 });

      await userEvent.keyboard('{Home}');

      expect(onColumnWidthsChange).toHaveBeenLastCalledWith({});
    });

    it('does not lay the columns out for a drag unless there can be one', async () => {
      // The balanced layout is what makes a plain table read well, and a width
      // in it is a hint that springs back — so it is only given up when a drag
      // has to stick.
      const screen = await render(<Table />);

      expect(screen.container.querySelector('table')?.style.tableLayout).toBe('');

      await screen.rerender(<Table resizable />);

      expect(screen.container.querySelector('table')?.style.tableLayout).toBe('fixed');
    });
  });

  describe('the download', () => {
    it('writes the rows the reader is looking at, not the page they are on', async () => {
      const onExport = vi.fn();
      const screen = await render(
        <Table exportable searchable paged defaultPageSize={1} onExport={onExport} />
      );

      await screen.getByRole('button', { name: 'Download CSV' }).click();

      const csv = onExport.mock.calls[0][0] as string;

      expect(csv.split('\r\n')).toHaveLength(5);
      expect(csv).toContain('Name,City,Score');
    });

    it('quotes a field that holds the separator, and doubles a quote inside one', async () => {
      const onExport = vi.fn();
      const screen = await render(
        <Table
          exportable
          onExport={onExport}
          items={[{ id: 'a', name: 'Lee, Ada', city: 'She said "hi"', score: 1 }]}
        />
      );

      await screen.getByRole('button', { name: 'Download CSV' }).click();

      expect(onExport.mock.calls[0][0]).toContain('"Lee, Ada","She said ""hi""",1');
    });

    it('takes what a column says to export rather than what it draws', async () => {
      const onExport = vi.fn();
      const screen = await render(
        <Table
          exportable
          onExport={onExport}
          headers={[
            {
              key: 'name',
              label: 'Name',
              render: (row: Row) => <strong>{row.name}</strong>,
              exportValue: (row: Row) => row.name.toUpperCase()
            },
            { ...COLUMNS[1], exportable: false }
          ]}
        />
      );

      await screen.getByRole('button', { name: 'Download CSV' }).click();

      const csv = onExport.mock.calls[0][0] as string;

      expect(csv).toContain('ADA');
      expect(csv).not.toContain('Seoul');
    });
  });

  it('says so when nothing is left', async () => {
    const screen = await render(<Table searchable />);

    await userEvent.fill(screen.getByRole('textbox').element(), 'atlantis');

    await vi.waitFor(() => expect(names()).toEqual([]));
    expect(screen.container.textContent).toContain('No data');
  });
});
