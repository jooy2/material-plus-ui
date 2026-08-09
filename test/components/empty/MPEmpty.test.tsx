import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPEmpty } from 'material-plus-ui';

describe('MPEmpty', () => {
  describe('the headline', () => {
    it('says something rather than nothing by default', async () => {
      // The version that says nothing useful is the version that gets shipped,
      // so there is a floor.
      const screen = await render(<MPEmpty />);

      expect(screen.getByText('Nothing here').query()).not.toBeNull();
    });

    it('takes a headline of its own', async () => {
      const screen = await render(<MPEmpty title="No results" />);

      expect(screen.getByText('No results').query()).not.toBeNull();
      expect(screen.getByText('Nothing here').query()).toBeNull();
    });

    it('can be dropped entirely', async () => {
      const screen = await render(<MPEmpty title={false}>Try another search.</MPEmpty>);

      expect(screen.getByText('Nothing here').query()).toBeNull();
      expect(screen.getByText('Try another search.').query()).not.toBeNull();
    });
  });

  describe('the glyph', () => {
    it('draws the empty tray by default', async () => {
      const screen = await render(<MPEmpty />);

      expect(screen.getByRole('status').element().querySelector('svg')).not.toBeNull();
    });

    it('can be taken away', async () => {
      const screen = await render(<MPEmpty icon={false} />);

      expect(screen.getByRole('status').element().querySelector('svg')).toBeNull();
    });

    it('takes an illustration of its own', async () => {
      const screen = await render(<MPEmpty icon={<span data-testid="art">🗂</span>} />);

      expect(screen.getByTestId('art').query()).not.toBeNull();
    });
  });

  describe('the body', () => {
    it('is supporting text under a headline', async () => {
      const screen = await render(<MPEmpty>Try another search.</MPEmpty>);

      expect(screen.getByText('Try another search.').element()).toHaveClass(
        'text-mp-on-surface-variant'
      );
    });

    it('is the state itself without one', async () => {
      const screen = await render(<MPEmpty title={false}>Try another search.</MPEmpty>);

      expect(screen.getByText('Try another search.').element()).not.toHaveClass(
        'text-mp-on-surface-variant'
      );
    });
  });

  describe('action', () => {
    it('draws a way out under the text', async () => {
      const screen = await render(
        <MPEmpty action={<button type="button">Clear filters</button>} />
      );

      expect(screen.getByRole('button', { name: 'Clear filters' }).query()).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('announces itself, because nothing was removed from the page', async () => {
      // A list that empties under the reader has to say so: something was added
      // to the page, not taken off it.
      const screen = await render(<MPEmpty />);

      expect(screen.getByRole('status').query()).not.toBeNull();
    });

    it('can be silenced for a state that is simply part of the page', async () => {
      const screen = await render(<MPEmpty role={undefined} data-testid="empty" />);

      expect(screen.getByTestId('empty').element()).not.toHaveAttribute('role');
    });
  });

  describe('variant', () => {
    it('draws no second rectangle by default', async () => {
      // An empty state is nearly always already inside something.
      const screen = await render(<MPEmpty />);
      const element = screen.getByRole('status').element();

      expect(element).toHaveAttribute('data-mp-variant', 'text');
      expect(element).not.toHaveClass('rounded-mp-md');
    });

    it('paints a neutral surface when asked, never the accent', async () => {
      const screen = await render(<MPEmpty variant="tonal" />);
      const element = screen.getByRole('status').element();

      expect(element).toHaveClass('bg-mp-surface-container');
      expect(element).toHaveClass('rounded-mp-md');
    });
  });

  describe('render', () => {
    it('drops into a table cell', async () => {
      const screen = await render(
        <table>
          <tbody>
            <tr>
              <MPEmpty render={<td colSpan={3} />} />
            </tr>
          </tbody>
        </table>
      );

      expect(screen.getByRole('status').element().tagName).toBe('TD');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(<MPEmpty className="my-own-class" />);
      const element = screen.getByRole('status').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-empty');
    });
  });
});
