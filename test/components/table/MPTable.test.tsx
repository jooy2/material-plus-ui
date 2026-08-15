import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTable } from 'material-plus-ui';
import type { MPTableColumn } from 'material-plus-ui';

interface Row {
  name: string;
  qty: number;
}

const COLUMNS: MPTableColumn<Row>[] = [
  { key: 'name', label: 'Name' },
  { key: 'qty', label: 'Quantity', align: 'end' }
];

const ROWS: Row[] = [
  { name: 'Bolt', qty: 12 },
  { name: 'Nut', qty: 40 }
];

describe('MPTable', () => {
  describe('rendering', () => {
    it('draws a heading per column, in order', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} />);
      const headings = screen.getByRole('columnheader').elements();

      expect(headings.map((heading) => heading.textContent)).toEqual(['Name', 'Quantity']);
    });

    it('scopes every heading to its column', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} />);

      for (const heading of screen.getByRole('columnheader').elements()) {
        expect(heading).toHaveAttribute('scope', 'col');
      }
    });

    it('falls back to the key when a column has no label', async () => {
      const screen = await render(<MPTable headers={[{ key: 'name' }]} items={ROWS} />);

      expect(screen.getByRole('columnheader').element().textContent).toBe('name');
    });

    it('reads each cell off the row by key', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} />);

      expect(screen.getByText('Bolt').query()).not.toBeNull();
      expect(screen.getByText('40').query()).not.toBeNull();
    });

    it('lets a column render its own cell', async () => {
      const screen = await render(
        <MPTable
          headers={[{ key: 'qty', label: 'Quantity', render: (row) => `${row.qty} pcs` }]}
          items={ROWS}
        />
      );

      expect(screen.getByText('12 pcs').query()).not.toBeNull();
    });

    it('names the table from its caption', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} caption="Stock" />);

      expect(screen.getByRole('table', { name: 'Stock' }).query()).not.toBeNull();
    });
  });

  describe('widths', () => {
    it('states a width once, on the column element', async () => {
      // A width set on a `<th>` is a width the browser renegotiates against
      // every other row.
      const screen = await render(
        <MPTable headers={[{ key: 'name', label: 'Name', width: 200 }]} items={ROWS} />
      );
      const col = screen.getByRole('table').element().querySelector('col') as HTMLElement;

      expect(col.style.width).toBe('200px');
    });

    it('takes any CSS length', async () => {
      const screen = await render(
        <MPTable headers={[{ key: 'name', label: 'Name', width: '30%' }]} items={ROWS} />
      );
      const col = screen.getByRole('table').element().querySelector('col') as HTMLElement;

      expect(col.style.width).toBe('30%');
    });
  });

  describe('alignment', () => {
    it('writes it inline, where a host stylesheet cannot reach it', async () => {
      // `.vp-doc td` and `.prose td` are two-class selectors a one-class
      // utility cannot outrank.
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} />);
      const cell = screen.getByText('12').element() as HTMLElement;

      expect(cell.style.textAlign).toBe('end');
      expect(cell.style.padding).not.toBe('');
    });
  });

  describe('empty', () => {
    it('says so rather than showing an empty grid', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={[]} />);

      expect(screen.getByText('No data').query()).not.toBeNull();
    });

    it('takes wording of its own', async () => {
      const screen = await render(
        <MPTable headers={COLUMNS} items={[]} empty="Nothing in stock" />
      );

      expect(screen.getByText('Nothing in stock').query()).not.toBeNull();
    });

    it('spans the whole width', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={[]} />);

      expect(screen.getByText('No data').element()).toHaveAttribute('colspan', '2');
    });
  });

  describe('rows', () => {
    it('tints every other one when striped', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} striped />);
      const rows = screen.getByRole('row').elements().slice(1);

      expect(rows[0]).not.toHaveClass('[--_mp-row:var(--_mp-color-surface-container-low)]');
      expect(rows[1]).toHaveClass('[--_mp-row:var(--_mp-color-surface-container-low)]');
    });

    it('fires with the row and its index', async () => {
      const onRowClick = vi.fn();
      const screen = await render(
        <MPTable headers={COLUMNS} items={ROWS} onRowClick={onRowClick} />
      );

      await screen.getByText('Nut').click();

      expect(onRowClick).toHaveBeenCalledWith(ROWS[1], 1);
    });

    it('lights under the pointer once it is clickable', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} onRowClick={() => {}} />);
      const row = screen.getByRole('row').elements()[1];

      expect(row).toHaveClass('cursor-pointer');
      expect(row).toHaveClass('hover:[--_mp-row:var(--_mp-color-surface-container)]');
    });

    it('stays out of the tab order while there is nothing to activate', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} />);

      expect(screen.getByRole('row').elements()[1]).not.toHaveAttribute('tabindex');
    });

    it('joins the tab order once it is clickable', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} onRowClick={() => {}} />);

      expect(screen.getByRole('row').elements()[1]).toHaveAttribute('tabindex', '0');
    });

    it('fires on Enter and on Space', async () => {
      const onRowClick = vi.fn();
      const screen = await render(
        <MPTable headers={COLUMNS} items={ROWS} onRowClick={onRowClick} />
      );
      // The first element is the header's row; the body starts at 1.
      const row = screen.getByRole('row').elements()[1];

      for (const key of ['Enter', ' ']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

        row.dispatchEvent(event);
        // Space scrolls the page otherwise, and a row that fired *and* scrolled
        // would answer twice.
        expect(event.defaultPrevented).toBe(true);
      }

      expect(onRowClick).toHaveBeenCalledTimes(2);
      expect(onRowClick).toHaveBeenCalledWith(ROWS[0], 0);
    });

    it('leaves a key pressed inside a cell to whatever is in that cell', async () => {
      const onRowClick = vi.fn();
      const columns = [
        ...COLUMNS,
        { key: 'action', label: 'Action', render: () => <button type="button">Edit</button> }
      ];
      const screen = await render(
        <MPTable headers={columns} items={ROWS} onRowClick={onRowClick} />
      );

      screen
        .getByRole('button', { name: 'Edit' })
        .elements()[0]
        .dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));

      expect(onRowClick).not.toHaveBeenCalled();
    });

    it('keys rows by a caller’s key when one is given', async () => {
      const screen = await render(
        <MPTable headers={COLUMNS} items={ROWS} getRowKey={(row) => row.name} />
      );

      expect(screen.getByRole('row').elements()).toHaveLength(3);
    });
  });

  describe('stickyHeader', () => {
    it('pins the header when asked', async () => {
      const screen = await render(<MPTable headers={COLUMNS} items={ROWS} stickyHeader />);

      expect(screen.getByRole('columnheader').elements()[0]).toHaveClass('sticky');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPTable headers={COLUMNS} items={ROWS} className="my-own-class" data-testid="table" />
      );
      const element = screen.getByTestId('table').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-table');
    });

    it('publishes the size on the shell', async () => {
      const screen = await render(
        <MPTable headers={COLUMNS} items={ROWS} size="sm" data-testid="table" />
      );

      expect(screen.getByTestId('table').element()).toHaveAttribute('data-mp-size', 'sm');
    });
  });
});
