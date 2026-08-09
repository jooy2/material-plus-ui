import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPSegmentedButton } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const VIEWS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

function ControlledSet({
  initial = ['week'],
  ...props
}: {
  initial?: string[];
  [key: string]: unknown;
}) {
  const [value, setValue] = useState<string[]>(initial);

  return (
    <>
      <MPSegmentedButton
        items={VIEWS}
        value={value}
        onValueChange={setValue}
        aria-label="View"
        {...props}
      />
      <output data-testid="model">{value.join(',')}</output>
    </>
  );
}

describe('MPSegmentedButton', () => {
  describe('rendering', () => {
    it('is a named group of toggles rather than a row of buttons', async () => {
      // Built out of plain buttons, a four-way switch announces itself as four
      // unrelated actions.
      const screen = await render(<ControlledSet />);

      await expect.element(screen.getByRole('group', { name: 'View' })).toBeInTheDocument();
      expect(screen.getByRole('button').all()).toHaveLength(3);
    });

    it('says which segment is on', async () => {
      const screen = await render(<ControlledSet initial={['week']} />);

      expect(screen.getByRole('button', { name: 'Week' }).element()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByRole('button', { name: 'Day' }).element()).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('reserves the tick slot whether or not anything is chosen', async () => {
      // A tick that appears from nothing pushes the label sideways at the exact
      // moment the reader is looking at it.
      const screen = await render(<ControlledSet initial={[]} />);
      const empty = screen
        .getByRole('button', { name: 'Day' })
        .element()
        .getBoundingClientRect().width;

      await screen.rerender(<ControlledSet initial={['day']} />);

      expect(
        screen.getByRole('button', { name: 'Day' }).element().getBoundingClientRect().width
      ).toBeCloseTo(empty, 0);
    });

    it('shows the tick on the chosen segment only', async () => {
      /*
       * Measured rather than read off a class. Both `hidden` and the glyph's own
       * `inline-flex` are display utilities, so which one wins is decided by
       * their order in the generated stylesheet — and it is `inline-flex`, which
       * would put a tick on every segment including the unchosen ones.
       */
      await render(<ControlledSet initial={['week']} />);

      const shown = [...document.querySelectorAll('.mp-segmented-button .mp-icon')].filter(
        (glyph) => glyph.getBoundingClientRect().width > 0
      );

      expect(shown).toHaveLength(1);
    });

    it('drops the tick when asked', async () => {
      await render(<ControlledSet showCheck={false} />);

      expect(document.querySelectorAll('.mp-segmented-button .mp-icon')).toHaveLength(0);
    });

    it('renders an icon per segment', async () => {
      await render(
        <MPSegmentedButton
          aria-label="View"
          items={[{ value: 'day', label: 'Day', icon: <span data-testid="glyph">◻</span> }]}
        />
      );

      expect(document.querySelector('[data-testid="glyph"]')).not.toBeNull();
    });
  });

  describe('choosing', () => {
    it('hands the parent every chosen value', async () => {
      const onValueChange = vi.fn();
      const screen = await render(
        <MPSegmentedButton items={VIEWS} onValueChange={onValueChange} aria-label="View" />
      );

      await screen.getByRole('button', { name: 'Month' }).click();

      expect(onValueChange).toHaveBeenCalledWith(['month']);
    });

    it('swaps rather than adds when only one may be on', async () => {
      const screen = await render(<ControlledSet initial={['week']} />);

      await screen.getByRole('button', { name: 'Month' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('month');
    });

    it('keeps more than one when multiple is set', async () => {
      const screen = await render(<ControlledSet initial={['week']} multiple />);

      await screen.getByRole('button', { name: 'Month' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('week,month');
    });

    it('takes one tab stop for the whole set', async () => {
      const screen = await render(<ControlledSet />);
      const stops = screen
        .getByRole('button')
        .all()
        .map((segment) => (segment.element() as HTMLElement).tabIndex);

      expect(stops.filter((index) => index === 0)).toHaveLength(1);
    });

    it('starts uncontrolled from a default', async () => {
      const screen = await render(
        <MPSegmentedButton items={VIEWS} defaultValue={['month']} aria-label="View" />
      );

      expect(screen.getByRole('button', { name: 'Month' }).element()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('states', () => {
    it('disables every segment at once', async () => {
      const screen = await render(<ControlledSet disabled />);

      for (const segment of screen.getByRole('button').all()) {
        expect(segment.element()).toBeDisabled();
      }
    });

    it('disables one segment without touching the rest', async () => {
      const screen = await render(
        <MPSegmentedButton
          aria-label="View"
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week', disabled: true }
          ]}
        />
      );

      expect(screen.getByRole('button', { name: 'Day' }).element()).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Week' }).element()).toBeDisabled();
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically, on the same rungs a button uses', async () => {
      const screen = await render(<ControlledSet size="xs" />);
      const heightOf = () =>
        document.querySelector('.mp-segmented-button')!.getBoundingClientRect().height;

      expect(document.querySelector('.mp-segmented-button')).toHaveAttribute('data-mp-size', 'xs');

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<ControlledSet size={size} />);

        const next = heightOf();

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('divides the width evenly when fullWidth', async () => {
      const screen = await render(
        <div style={{ width: 480 }}>
          <MPSegmentedButton
            aria-label="View"
            fullWidth
            items={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'A considerably longer one' }
            ]}
          />
        </div>
      );

      const a = screen.getByRole('button', { name: 'A', exact: true }).element();
      const b = screen.getByRole('button', { name: 'A considerably longer one' }).element();

      // Within a pixel rather than exactly: every segment but the first carries
      // the divider on its leading edge, and a border is part of the box a flex
      // item grows from. The longer label truncating rather than pushing is the
      // part that matters.
      expect(
        Math.abs(a.getBoundingClientRect().width - b.getBoundingClientRect().width)
      ).toBeLessThanOrEqual(1.5);
    });
  });
});
